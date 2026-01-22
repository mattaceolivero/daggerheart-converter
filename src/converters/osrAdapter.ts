/**
 * OSR to D&D 5e Adapter
 *
 * Converts OSR/Basic D&D stat blocks to D&D 5e format for further
 * conversion to Daggerheart. This adapter serves as an intermediate
 * step in the OSR -> 5e -> Daggerheart conversion pipeline.
 *
 * @module converters/osrAdapter
 * @version 1.0.0
 */

import {
  OSRStatBlock,
  OSRAlignment,
  OSRHitDice,
  MovementType,
  calculateAverageHP,
} from '../models/osr';

import {
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  Alignment,
  LawChaosAxis,
  GoodEvilAxis,
  SpecialAlignment,
  ArmorClass,
  HitPoints,
  DiceExpression,
  Speed,
  AbilityScores,
  ChallengeRating,
  Trait,
  DnD5eAttack,
  AttackType,
  AttackRange,
  AttackDamage,
  DnD5eDamageType,
  CR_TO_XP,
  calculateProficiencyBonus,
} from '../models/dnd5e';

import { Tier } from '../models/daggerheart';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of OSR to 5e conversion.
 */
export interface OSRTo5eResult {
  /** The converted 5e monster. */
  result: DnD5eMonster;
  /** Conversion notes/decisions made. */
  notes: string[];
  /** Warnings about potential issues. */
  warnings: string[];
}

/**
 * Options for OSR to 5e conversion.
 */
export interface OSRConversionOptions {
  /** Assume modern (ascending AC) format if ambiguous. */
  preferAscendingAC?: boolean;
  /** Default creature size if not specified. */
  defaultSize?: CreatureSize;
  /** Default creature type if not detected. */
  defaultType?: CreatureType;
}

// ============================================================================
// CONSTANTS - HD TO CR MAPPING
// ============================================================================

/**
 * Maps OSR Hit Dice to approximate 5e Challenge Rating.
 *
 * This mapping considers that OSR HD roughly correlates to
 * creature power but doesn't map 1:1 to 5e CR.
 *
 * | OSR HD | D&D 5e CR | Daggerheart Tier |
 * |--------|-----------|------------------|
 * | < 1    | 0-1/4     | Tier 1           |
 * | 1      | 1/4-1/2   | Tier 1           |
 * | 2      | 1/2-1     | Tier 1           |
 * | 3-4    | 1-2       | Tier 1-2         |
 * | 5-6    | 3-4       | Tier 2           |
 * | 7-8    | 5-6       | Tier 2           |
 * | 9-10   | 7-8       | Tier 3           |
 * | 11-13  | 9-11      | Tier 3           |
 * | 14-16  | 12-14     | Tier 3-4         |
 * | 17+    | 15+       | Tier 4           |
 */
function hdToCR(hd: OSRHitDice): number {
  const effectiveHD = hd.count + (hd.modifier > 0 ? 0.5 : hd.modifier < 0 ? -0.5 : 0);

  // Add bonus for special abilities (asterisks)
  const specialBonus = hd.specialAbilities * 0.5;
  const totalHD = effectiveHD + specialBonus;

  if (totalHD < 1) return 0;
  if (totalHD < 2) return 0.25; // CR 1/4
  if (totalHD < 3) return 0.5; // CR 1/2
  if (totalHD < 4) return 1;
  if (totalHD < 5) return 2;
  if (totalHD < 6) return 3;
  if (totalHD < 7) return 4;
  if (totalHD < 8) return 5;
  if (totalHD < 9) return 6;
  if (totalHD < 10) return 7;
  if (totalHD < 11) return 8;
  if (totalHD < 13) return 10;
  if (totalHD < 15) return 12;
  if (totalHD < 17) return 14;
  if (totalHD < 20) return 16;
  return Math.min(30, Math.floor(totalHD * 0.9));
}

/**
 * Maps OSR HD to Daggerheart Tier directly.
 */
export function hdToTier(hd: OSRHitDice): Tier {
  const effectiveHD = hd.count + (hd.modifier > 0 ? 0.5 : hd.modifier < 0 ? -0.5 : 0);

  if (effectiveHD <= 1) return Tier.ONE;
  if (effectiveHD <= 4) return Tier.ONE;
  if (effectiveHD <= 8) return Tier.TWO;
  if (effectiveHD <= 13) return Tier.THREE;
  return Tier.FOUR;
}

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

/**
 * Converts OSR alignment to 5e alignment.
 */
function convertAlignment(osrAlignment: OSRAlignment): Alignment {
  switch (osrAlignment) {
    case OSRAlignment.LAWFUL:
      return { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.NEUTRAL };
    case OSRAlignment.CHAOTIC:
      return { lawChaos: LawChaosAxis.CHAOTIC, goodEvil: GoodEvilAxis.NEUTRAL };
    case OSRAlignment.NEUTRAL:
    default:
      return { lawChaos: LawChaosAxis.NEUTRAL, goodEvil: GoodEvilAxis.NEUTRAL };
  }
}

/**
 * Converts ascending AC to 5e AC.
 */
function convertArmorClass(osr: OSRStatBlock): ArmorClass {
  return {
    value: osr.ac.ascending,
    armorType: osr.ac.source || 'natural armor',
  };
}

/**
 * Converts OSR HD to 5e HP.
 */
function convertHitPoints(hd: OSRHitDice): HitPoints {
  // OSR uses d8 for most creatures
  const average = calculateAverageHP(hd);

  const formula: DiceExpression = {
    count: Math.max(1, hd.count),
    dieSize: 8,
    modifier: hd.modifier,
  };

  return { average, formula };
}

/**
 * Converts OSR movement to 5e speed.
 */
function convertSpeed(osr: OSRStatBlock): Speed {
  const speed: Speed = {};

  for (const movement of osr.movement) {
    // Convert per-round speed to 5e (5e uses feet per round, but rounds are 6 seconds vs OSR's 10 seconds)
    // We use the per-round value directly as it's closer to 5e's action economy
    const feet = movement.perRound;

    switch (movement.type) {
      case MovementType.WALK:
        speed.walk = feet;
        break;
      case MovementType.FLY:
        speed.fly = feet;
        break;
      case MovementType.SWIM:
        speed.swim = feet;
        break;
      case MovementType.CLIMB:
        speed.climb = feet;
        break;
      case MovementType.BURROW:
        speed.burrow = feet;
        break;
    }
  }

  return speed;
}

/**
 * Estimates 5e ability scores from OSR stats.
 *
 * OSR doesn't have explicit ability scores for monsters, so we estimate
 * based on HD, attacks, saves, and behavior.
 */
function estimateAbilityScores(osr: OSRStatBlock): AbilityScores {
  const hd = osr.hd.count;

  // Base scores, adjusted by HD
  // Higher HD generally means higher physical stats
  const hdBonus = Math.min(10, Math.floor(hd / 2));

  // Estimate STR from HD and damage
  let strEstimate = 10 + hdBonus;

  // Estimate DEX from AC (better AC often means higher DEX or armor)
  // If AC is much better than HD would suggest, creature is probably dexterous
  const acDeviation = osr.ac.ascending - (10 + Math.floor(hd / 2));
  let dexEstimate = 10 + Math.min(8, Math.max(0, acDeviation));

  // Estimate CON from HD
  let conEstimate = 10 + hdBonus;

  // INT, WIS, CHA are harder to estimate - use morale and alignment as hints
  let intEstimate = 10;
  let wisEstimate = 10;
  let chaEstimate = 10;

  // High morale suggests stronger will (WIS/CHA)
  if (osr.morale >= 10) {
    wisEstimate += 2;
    chaEstimate += 2;
  } else if (osr.morale <= 6) {
    wisEstimate -= 2;
    chaEstimate -= 2;
  }

  // Lawful creatures tend to be more organized (higher INT)
  if (osr.alignment === OSRAlignment.LAWFUL) {
    intEstimate += 2;
  } else if (osr.alignment === OSRAlignment.CHAOTIC) {
    chaEstimate += 2;
  }

  // Cap values at reasonable ranges
  const cap = (val: number) => Math.max(1, Math.min(30, val));

  return {
    STR: cap(strEstimate),
    DEX: cap(dexEstimate),
    CON: cap(conEstimate),
    INT: cap(intEstimate),
    WIS: cap(wisEstimate),
    CHA: cap(chaEstimate),
  };
}

/**
 * Parses a damage string to a DiceExpression.
 */
function parseDamageString(damageStr: string): DiceExpression {
  const match = damageStr.match(/(\d+)?d(\d+)(?:\s*([+-])\s*(\d+))?/i);

  if (match) {
    const count = match[1] ? parseInt(match[1], 10) : 1;
    const dieSize = parseInt(match[2] || '6', 10) as 4 | 6 | 8 | 10 | 12 | 20 | 100;
    let modifier = 0;

    if (match[3] && match[4]) {
      modifier = parseInt(match[4], 10);
      if (match[3] === '-') {
        modifier = -modifier;
      }
    }

    return { count, dieSize, modifier };
  }

  // Default to 1d6 if parsing fails
  return { count: 1, dieSize: 6, modifier: 0 };
}

/**
 * Converts OSR attacks to 5e attacks.
 */
function convertAttacks(osr: OSRStatBlock): DnD5eAttack[] {
  const attacks: DnD5eAttack[] = [];

  for (const osrAttack of osr.attacks) {
    // Determine attack type (most OSR attacks are melee)
    const isRanged = osrAttack.name.toLowerCase().includes('bow') ||
                     osrAttack.name.toLowerCase().includes('crossbow') ||
                     osrAttack.name.toLowerCase().includes('throw') ||
                     osrAttack.name.toLowerCase().includes('sling');

    const attackType = isRanged ? AttackType.RANGED_WEAPON : AttackType.MELEE_WEAPON;

    // Parse damage
    const damage = parseDamageString(osrAttack.damage);

    // Determine damage type
    let damageType = DnD5eDamageType.BLUDGEONING;
    const lowerName = osrAttack.name.toLowerCase();

    if (lowerName.includes('bite') || lowerName.includes('claw') || lowerName.includes('talon')) {
      damageType = DnD5eDamageType.PIERCING;
    } else if (lowerName.includes('sword') || lowerName.includes('axe') || lowerName.includes('slash')) {
      damageType = DnD5eDamageType.SLASHING;
    } else if (lowerName.includes('bow') || lowerName.includes('arrow') || lowerName.includes('spear')) {
      damageType = DnD5eDamageType.PIERCING;
    }

    // Set range
    const range: AttackRange = isRanged
      ? { normal: 80, long: 320 }
      : { reach: 5 };

    // Build attack damage
    const attackDamage: AttackDamage = {
      dice: damage,
      damageType,
    };

    // Create 5e attack (one entry per attack count in OSR)
    for (let i = 0; i < osrAttack.count; i++) {
      const attack: DnD5eAttack = {
        name: osrAttack.name,
        attackType,
        toHit: osr.toHit.attackBonus,
        range,
        target: 'one target',
        damage: attackDamage,
      };
      if (osrAttack.special) {
        attack.additionalEffects = osrAttack.special;
      }
      attacks.push(attack);
    }
  }

  return attacks;
}

/**
 * Converts OSR special abilities to 5e traits.
 */
function convertSpecialAbilities(osr: OSRStatBlock): Trait[] {
  const traits: Trait[] = [];

  if (osr.specialAbilities) {
    for (const ability of osr.specialAbilities) {
      traits.push({
        name: ability.name,
        description: ability.description,
      });
    }
  }

  // Add morale as a trait if notably high or low
  if (osr.morale >= 11) {
    traits.push({
      name: 'Fearless',
      description: `This creature is exceptionally brave (Morale ${osr.morale}). It rarely flees from combat and will fight to the death if cornered.`,
    });
  } else if (osr.morale <= 5) {
    traits.push({
      name: 'Cowardly',
      description: `This creature is easily frightened (Morale ${osr.morale}). It will flee at the first sign of serious danger.`,
    });
  }

  return traits;
}

/**
 * Estimates creature size from HD.
 */
function estimateSize(hd: OSRHitDice): CreatureSize {
  const hdCount = hd.count;

  if (hdCount < 1) return CreatureSize.TINY;
  if (hdCount <= 1) return CreatureSize.SMALL;
  if (hdCount <= 4) return CreatureSize.MEDIUM;
  if (hdCount <= 8) return CreatureSize.LARGE;
  if (hdCount <= 16) return CreatureSize.HUGE;
  return CreatureSize.GARGANTUAN;
}

/**
 * Attempts to detect creature type from name and abilities.
 */
function detectCreatureType(osr: OSRStatBlock): CreatureType {
  const lowerName = osr.name.toLowerCase();
  const abilities = osr.specialAbilities?.map((a) => a.name.toLowerCase()).join(' ') || '';

  // Check name for type hints
  if (lowerName.includes('dragon')) return CreatureType.DRAGON;
  if (lowerName.includes('golem') || lowerName.includes('automaton')) return CreatureType.CONSTRUCT;
  if (lowerName.includes('skeleton') || lowerName.includes('zombie') || lowerName.includes('ghost') ||
      lowerName.includes('vampire') || lowerName.includes('lich') || lowerName.includes('wight') ||
      abilities.includes('undead')) return CreatureType.UNDEAD;
  if (lowerName.includes('goblin') || lowerName.includes('orc') || lowerName.includes('hobgoblin') ||
      lowerName.includes('bugbear') || lowerName.includes('gnoll') || lowerName.includes('kobold')) {
    return CreatureType.HUMANOID;
  }
  if (lowerName.includes('wolf') || lowerName.includes('bear') || lowerName.includes('snake') ||
      lowerName.includes('rat') || lowerName.includes('spider') || lowerName.includes('bat')) {
    return CreatureType.BEAST;
  }
  if (lowerName.includes('elemental') || lowerName.includes('djinn') || lowerName.includes('efreet')) {
    return CreatureType.ELEMENTAL;
  }
  if (lowerName.includes('demon') || lowerName.includes('devil')) return CreatureType.FIEND;
  if (lowerName.includes('ooze') || lowerName.includes('slime') || lowerName.includes('jelly')) {
    return CreatureType.OOZE;
  }
  if (lowerName.includes('giant')) return CreatureType.GIANT;
  if (lowerName.includes('fairy') || lowerName.includes('fey') || lowerName.includes('pixie') ||
      lowerName.includes('sprite')) return CreatureType.FEY;

  // Default to monstrosity for unknown creatures
  return CreatureType.MONSTROSITY;
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts an OSR stat block to D&D 5e format.
 *
 * This is the primary function for the OSR -> 5e conversion pipeline.
 * The resulting 5e monster can then be converted to Daggerheart using
 * the existing 5e -> Daggerheart converters.
 *
 * @param osr - The OSR stat block to convert
 * @param options - Optional conversion settings
 * @returns Conversion result with 5e monster and notes
 *
 * @example
 * ```typescript
 * const osrGoblin = parseOSRStatBlock(goblinText);
 * const { result: monster5e, notes } = convertOSRToDnD5e(osrGoblin);
 * const daggerheart = convertToDaggerheart(monster5e);
 * ```
 */
export function convertOSRToDnD5e(
  osr: OSRStatBlock,
  options: OSRConversionOptions = {}
): OSRTo5eResult {
  const notes: string[] = [];
  const warnings: string[] = [];

  // Estimate CR from HD
  const cr = hdToCR(osr.hd);
  const crStr = cr < 1 ? (cr === 0.25 ? '1/4' : cr === 0.5 ? '1/2' : '0') : String(cr);
  const xp = CR_TO_XP[crStr] || 0;

  notes.push(`Estimated CR ${crStr} from HD ${osr.hd.raw}`);

  // Estimate size
  const size = options.defaultSize || estimateSize(osr.hd);
  notes.push(`Estimated size ${size} from HD ${osr.hd.count}`);

  // Detect creature type
  const creatureType = options.defaultType || detectCreatureType(osr);
  notes.push(`Detected creature type: ${creatureType}`);

  // Convert components
  const armorClass = convertArmorClass(osr);
  const hitPoints = convertHitPoints(osr.hd);
  const speed = convertSpeed(osr);
  const abilityScores = estimateAbilityScores(osr);
  const alignment = convertAlignment(osr.alignment);
  const attacks = convertAttacks(osr);
  const traits = convertSpecialAbilities(osr);

  // Build 5e monster
  const monster: DnD5eMonster = {
    name: osr.name,
    size,
    creatureType,
    alignment,
    armorClass,
    hitPoints,
    speed,
    abilityScores,
    senses: {
      specialSenses: [],
      passivePerception: 10 + Math.floor((abilityScores.WIS - 10) / 2),
    },
    languages: [],
    challengeRating: { cr: cr, xp },
    proficiencyBonus: calculateProficiencyBonus(cr),
  };

  // Add optional source fields
  if (osr.source) {
    monster.source = osr.source;
  }
  if (osr.sourcePage !== undefined) {
    monster.sourcePage = osr.sourcePage;
  }

  // Add optional components
  if (attacks.length > 0) {
    monster.attacks = attacks;
  }

  if (traits.length > 0) {
    monster.traits = traits;
  }

  // Add multiattack if multiple attacks
  if (osr.attacksPerRound > 1) {
    const attackNames = osr.attacks
      .map((a) => `${a.count > 1 ? a.count + ' ' : ''}${a.name.toLowerCase()} attack${a.count > 1 ? 's' : ''}`)
      .join(' and ');

    monster.multiattack = {
      description: `The ${osr.name.toLowerCase()} makes ${attackNames}.`,
      attacks: osr.attacks.map((a) => ({
        attackName: a.name,
        count: a.count,
      })),
    };
  }

  // Add description if available
  if (osr.description) {
    monster.notes = osr.description;
  }

  // Add environments if available
  if (osr.habitat && osr.habitat.length > 0) {
    monster.environments = osr.habitat;
  }

  return { result: monster, notes, warnings };
}

/**
 * Batch converts multiple OSR stat blocks to 5e format.
 *
 * @param osrBlocks - Array of OSR stat blocks
 * @param options - Optional conversion settings
 * @returns Array of conversion results
 */
export function convertMultipleOSRToDnD5e(
  osrBlocks: OSRStatBlock[],
  options: OSRConversionOptions = {}
): OSRTo5eResult[] {
  return osrBlocks.map((osr) => convertOSRToDnD5e(osr, options));
}

/**
 * Gets a summary of the OSR to 5e conversion.
 *
 * @param result - The conversion result
 * @returns Summary string
 */
export function summarizeOSRConversion(result: OSRTo5eResult): string {
  const { result: monster, notes, warnings } = result;

  const parts = [
    `${monster.name} (${monster.size} ${monster.creatureType})`,
    `CR ${monster.challengeRating.cr} (${monster.challengeRating.xp} XP)`,
    `AC ${monster.armorClass.value}, HP ${monster.hitPoints.average}`,
  ];

  if (notes.length > 0) {
    parts.push('Notes: ' + notes.join('; '));
  }

  if (warnings.length > 0) {
    parts.push('Warnings: ' + warnings.join('; '));
  }

  return parts.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  hdToCR,
  convertAlignment,
  convertArmorClass,
  convertHitPoints,
  convertSpeed,
  estimateAbilityScores,
  convertAttacks,
  convertSpecialAbilities,
  estimateSize,
  detectCreatureType,
};
