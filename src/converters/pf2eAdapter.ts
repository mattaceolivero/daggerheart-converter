/**
 * Pathfinder 2e to D&D 5e Adapter
 *
 * Converts PF2e stat blocks to D&D 5e format, enabling the existing
 * D&D 5e to Daggerheart conversion pipeline to handle PF2e creatures.
 *
 * This adapter pattern allows PF2e creatures to use the same robust
 * conversion logic already developed for D&D 5e.
 *
 * @module converters/pf2eAdapter
 * @version 1.0.0
 */

import {
  PF2eStatBlock,
  PF2eSize,
  PF2eRarity,
  PF2eAlignment,
  PF2eStrike,
  PF2eCreatureAbility,
  PF2eActionCost,
  PF2eDamageType,
  PF2eSenseType,
  PF2eSkill,
  pf2eLevelToCR,
} from '../models/pf2e';

import {
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  Alignment,
  SpecialAlignment,
  LawChaosAxis,
  GoodEvilAxis,
  ArmorClass,
  HitPoints,
  DiceExpression,
  Speed,
  AbilityScores,
  SavingThrow,
  SkillProficiency,
  AbilityScore,
  Skill,
  DamageModifiers,
  DamageModifierEntry,
  DnD5eDamageType,
  DnD5eCondition,
  Senses,
  Sense,
  SenseType,
  ChallengeRating,
  Trait,
  DnD5eAttack,
  DnD5eAction,
  AttackType,
  AttackDamage,
  Reaction,
  CR_TO_XP,
  calculateProficiencyBonus,
} from '../models/dnd5e';

// ============================================================================
// CONVERSION MAPPINGS
// ============================================================================

/**
 * Maps PF2e size to D&D 5e size.
 */
const SIZE_MAP: Record<PF2eSize, CreatureSize> = {
  [PF2eSize.TINY]: CreatureSize.TINY,
  [PF2eSize.SMALL]: CreatureSize.SMALL,
  [PF2eSize.MEDIUM]: CreatureSize.MEDIUM,
  [PF2eSize.LARGE]: CreatureSize.LARGE,
  [PF2eSize.HUGE]: CreatureSize.HUGE,
  [PF2eSize.GARGANTUAN]: CreatureSize.GARGANTUAN,
};

/**
 * Maps PF2e alignment to D&D 5e alignment.
 */
function convertAlignment(alignment?: PF2eAlignment): Alignment {
  if (!alignment || alignment === PF2eAlignment.NO_ALIGNMENT) {
    return SpecialAlignment.UNALIGNED;
  }

  const alignMap: Record<PF2eAlignment, Alignment> = {
    [PF2eAlignment.LG]: { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.GOOD },
    [PF2eAlignment.NG]: { lawChaos: LawChaosAxis.NEUTRAL, goodEvil: GoodEvilAxis.GOOD },
    [PF2eAlignment.CG]: { lawChaos: LawChaosAxis.CHAOTIC, goodEvil: GoodEvilAxis.GOOD },
    [PF2eAlignment.LN]: { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.NEUTRAL },
    [PF2eAlignment.N]: { lawChaos: LawChaosAxis.NEUTRAL, goodEvil: GoodEvilAxis.NEUTRAL },
    [PF2eAlignment.CN]: { lawChaos: LawChaosAxis.CHAOTIC, goodEvil: GoodEvilAxis.NEUTRAL },
    [PF2eAlignment.LE]: { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.EVIL },
    [PF2eAlignment.NE]: { lawChaos: LawChaosAxis.NEUTRAL, goodEvil: GoodEvilAxis.EVIL },
    [PF2eAlignment.CE]: { lawChaos: LawChaosAxis.CHAOTIC, goodEvil: GoodEvilAxis.EVIL },
    [PF2eAlignment.NO_ALIGNMENT]: SpecialAlignment.UNALIGNED,
  };

  return alignMap[alignment] || SpecialAlignment.UNALIGNED;
}

/**
 * Maps PF2e damage types to D&D 5e damage types.
 */
const DAMAGE_TYPE_MAP: Record<PF2eDamageType, DnD5eDamageType> = {
  [PF2eDamageType.BLUDGEONING]: DnD5eDamageType.BLUDGEONING,
  [PF2eDamageType.PIERCING]: DnD5eDamageType.PIERCING,
  [PF2eDamageType.SLASHING]: DnD5eDamageType.SLASHING,
  [PF2eDamageType.ACID]: DnD5eDamageType.ACID,
  [PF2eDamageType.COLD]: DnD5eDamageType.COLD,
  [PF2eDamageType.ELECTRICITY]: DnD5eDamageType.LIGHTNING,
  [PF2eDamageType.FIRE]: DnD5eDamageType.FIRE,
  [PF2eDamageType.SONIC]: DnD5eDamageType.THUNDER,
  [PF2eDamageType.FORCE]: DnD5eDamageType.FORCE,
  [PF2eDamageType.MENTAL]: DnD5eDamageType.PSYCHIC,
  [PF2eDamageType.NEGATIVE]: DnD5eDamageType.NECROTIC,
  [PF2eDamageType.POISON]: DnD5eDamageType.POISON,
  [PF2eDamageType.POSITIVE]: DnD5eDamageType.RADIANT,
  [PF2eDamageType.BLEED]: DnD5eDamageType.SLASHING,
  [PF2eDamageType.PRECISION]: DnD5eDamageType.PIERCING,
  [PF2eDamageType.SPIRIT]: DnD5eDamageType.NECROTIC,
  // Alignment damage types don't have direct equivalents
  [PF2eDamageType.CHAOTIC]: DnD5eDamageType.FORCE,
  [PF2eDamageType.EVIL]: DnD5eDamageType.NECROTIC,
  [PF2eDamageType.GOOD]: DnD5eDamageType.RADIANT,
  [PF2eDamageType.LAWFUL]: DnD5eDamageType.FORCE,
};

/**
 * Maps PF2e sense types to D&D 5e sense types.
 */
const SENSE_TYPE_MAP: Partial<Record<PF2eSenseType, SenseType>> = {
  [PF2eSenseType.DARKVISION]: SenseType.DARKVISION,
  [PF2eSenseType.GREATER_DARKVISION]: SenseType.DARKVISION,
  [PF2eSenseType.TREMORSENSE]: SenseType.TREMORSENSE,
  [PF2eSenseType.TRUESIGHT]: SenseType.TRUESIGHT,
  [PF2eSenseType.ECHOLOCATION]: SenseType.BLINDSIGHT,
};

/**
 * Maps PF2e skills to D&D 5e skills.
 */
const SKILL_MAP: Partial<Record<PF2eSkill, Skill>> = {
  [PF2eSkill.ACROBATICS]: Skill.ACROBATICS,
  [PF2eSkill.ARCANA]: Skill.ARCANA,
  [PF2eSkill.ATHLETICS]: Skill.ATHLETICS,
  [PF2eSkill.DECEPTION]: Skill.DECEPTION,
  [PF2eSkill.DIPLOMACY]: Skill.PERSUASION,
  [PF2eSkill.INTIMIDATION]: Skill.INTIMIDATION,
  [PF2eSkill.MEDICINE]: Skill.MEDICINE,
  [PF2eSkill.NATURE]: Skill.NATURE,
  [PF2eSkill.OCCULTISM]: Skill.ARCANA, // Closest equivalent
  [PF2eSkill.PERFORMANCE]: Skill.PERFORMANCE,
  [PF2eSkill.RELIGION]: Skill.RELIGION,
  [PF2eSkill.SOCIETY]: Skill.HISTORY,
  [PF2eSkill.STEALTH]: Skill.STEALTH,
  [PF2eSkill.SURVIVAL]: Skill.SURVIVAL,
  [PF2eSkill.THIEVERY]: Skill.SLEIGHT_OF_HAND,
};

// ============================================================================
// CREATURE TYPE DETECTION
// ============================================================================

/**
 * Common creature type traits in PF2e.
 */
const CREATURE_TYPE_TRAITS: Record<string, CreatureType> = {
  aberration: CreatureType.ABERRATION,
  animal: CreatureType.BEAST,
  beast: CreatureType.BEAST,
  celestial: CreatureType.CELESTIAL,
  construct: CreatureType.CONSTRUCT,
  dragon: CreatureType.DRAGON,
  elemental: CreatureType.ELEMENTAL,
  fey: CreatureType.FEY,
  fiend: CreatureType.FIEND,
  giant: CreatureType.GIANT,
  humanoid: CreatureType.HUMANOID,
  monitor: CreatureType.CELESTIAL, // Monitors are neutral outsiders, closest to celestials
  ooze: CreatureType.OOZE,
  plant: CreatureType.PLANT,
  undead: CreatureType.UNDEAD,
  // Additional common traits
  demon: CreatureType.FIEND,
  devil: CreatureType.FIEND,
  daemon: CreatureType.FIEND,
  angel: CreatureType.CELESTIAL,
  archon: CreatureType.CELESTIAL,
  azata: CreatureType.CELESTIAL,
};

/**
 * Detects creature type from PF2e traits.
 */
function detectCreatureType(traits: string[]): CreatureType {
  for (const trait of traits) {
    const lower = trait.toLowerCase();
    if (CREATURE_TYPE_TRAITS[lower]) {
      return CREATURE_TYPE_TRAITS[lower]!;
    }
  }

  // Default to monstrosity for unknown types
  return CreatureType.MONSTROSITY;
}

// ============================================================================
// STAT CONVERSION HELPERS
// ============================================================================

/**
 * Converts PF2e modifier to D&D 5e ability score.
 * PF2e uses modifiers directly, D&D 5e uses scores (10 + 2*mod).
 */
function modifierToScore(modifier: number): number {
  return 10 + modifier * 2;
}

/**
 * Converts PF2e HP to D&D 5e HP.
 * PF2e creatures generally have higher HP, so we divide.
 *
 * @param pf2eHP - PF2e hit points
 * @param level - Creature level for scaling
 * @returns Adjusted D&D 5e HP values
 */
function convertHP(pf2eHP: number, level: number): HitPoints {
  // PF2e HP is roughly 10-12x higher than D&D 5e for equivalent encounters
  // Scale factor varies by level
  let scaleFactor: number;

  if (level <= 2) {
    scaleFactor = 10;
  } else if (level <= 7) {
    scaleFactor = 11;
  } else if (level <= 14) {
    scaleFactor = 12;
  } else {
    scaleFactor = 14;
  }

  const dndHP = Math.max(1, Math.round(pf2eHP / scaleFactor));

  // Estimate a reasonable dice formula
  const conMod = Math.floor(level / 3);
  const hitDie = level <= 4 ? 8 : level <= 10 ? 10 : 12;
  const numDice = Math.max(1, Math.floor(dndHP / (hitDie / 2 + conMod)));

  return {
    average: dndHP,
    formula: {
      count: numDice,
      dieSize: hitDie as 4 | 6 | 8 | 10 | 12 | 20 | 100,
      modifier: numDice * conMod,
    },
  };
}

/**
 * Converts PF2e AC to D&D 5e AC.
 * PF2e AC is generally 10 + level + item/dex bonuses.
 * D&D 5e AC is typically 10-22 range.
 */
function convertAC(pf2eAC: number, level: number): ArmorClass {
  // Remove level component and normalize to D&D scale
  const baseAC = pf2eAC - level;
  // Clamp to reasonable D&D 5e range
  const dndAC = Math.min(22, Math.max(10, baseAC));

  return {
    value: dndAC,
    armorType: 'natural armor',
  };
}

/**
 * Converts PF2e save to D&D 5e save modifier.
 * PF2e saves are generally higher due to level being added.
 */
function convertSave(pf2eSave: number, level: number): number {
  // Remove level component
  return Math.max(-5, Math.min(15, pf2eSave - level));
}

/**
 * Converts PF2e strike to D&D 5e attack.
 */
function convertStrike(strike: PF2eStrike, level: number, isRanged: boolean): DnD5eAttack {
  // Adjust attack modifier by removing level
  const toHit = Math.max(-2, Math.min(15, strike.modifier - level));

  // Determine attack type
  let attackType: AttackType;
  if (isRanged) {
    attackType = AttackType.RANGED_WEAPON;
  } else {
    attackType = AttackType.MELEE_WEAPON;
  }

  // Convert damage
  const damageType = strike.damage.damageType;
  const dndDamageType = DAMAGE_TYPE_MAP[damageType] || DnD5eDamageType.BLUDGEONING;

  // Scale down damage dice for D&D 5e
  const diceCount = Math.max(1, Math.floor(strike.damage.dice.count * 0.7));
  const diceSize = strike.damage.dice.dieSize as 4 | 6 | 8 | 10 | 12 | 20 | 100;
  const modifier = Math.floor(strike.damage.dice.modifier * 0.5);

  const damage: AttackDamage = {
    dice: { count: diceCount, dieSize: diceSize, modifier },
    damageType: dndDamageType,
  };

  // Handle additional damage
  if (strike.damage.additional && strike.damage.additional.length > 0) {
    damage.additionalDamage = strike.damage.additional.map((add) => ({
      dice: {
        count: add.dice.count,
        dieSize: add.dice.dieSize as 4 | 6 | 8 | 10 | 12 | 20 | 100,
        modifier: add.dice.modifier,
      },
      damageType: DAMAGE_TYPE_MAP[add.damageType] || DnD5eDamageType.FIRE,
    }));
  }

  // Determine reach/range
  const range: { reach?: number; normal?: number; long?: number } = {};

  if (isRanged) {
    // Default ranged ranges
    range.normal = 30;
    range.long = 120;

    // Check traits for thrown
    if (strike.traits.some((t) => t.toLowerCase() === 'thrown')) {
      range.normal = 20;
      range.long = 60;
    }
  } else {
    // Check for reach trait
    const reachTrait = strike.traits.find((t) => t.toLowerCase().includes('reach'));
    if (reachTrait) {
      const reachMatch = reachTrait.match(/(\d+)/);
      range.reach = reachMatch && reachMatch[1] ? parseInt(reachMatch[1], 10) : 10;
    } else {
      range.reach = 5;
    }
  }

  const attack: DnD5eAttack = {
    name: strike.name.charAt(0).toUpperCase() + strike.name.slice(1),
    attackType,
    toHit,
    range,
    target: 'one target',
    damage,
  };

  if (strike.effects) {
    attack.additionalEffects = strike.effects;
  }

  return attack;
}

/**
 * Converts PF2e ability to D&D 5e trait or action.
 */
function convertAbility(ability: PF2eCreatureAbility): Trait | DnD5eAction | Reaction {
  const name = ability.name;
  let description = ability.description;

  // Add frequency if present
  if (ability.frequency) {
    description = `${ability.frequency}. ${description}`;
  }

  // Add trigger if present
  if (ability.trigger) {
    description = `Trigger: ${ability.trigger}. ${description}`;
  }

  // Add requirements if present
  if (ability.requirements) {
    description = `Requirements: ${ability.requirements}. ${description}`;
  }

  // Determine type based on action cost
  if (!ability.actionCost) {
    // Passive trait
    return { name, description } as Trait;
  }

  if (ability.actionCost === PF2eActionCost.REACTION) {
    // Reaction
    const reaction: Reaction = { name, description };
    if (ability.trigger) {
      reaction.trigger = ability.trigger;
    }
    return reaction;
  }

  // Action (1, 2, or 3 actions become regular actions)
  const action: DnD5eAction = { name, description };

  // Parse recharge if frequency mentions it
  if (ability.frequency) {
    const rechargeMatch = ability.frequency.match(/recharge\s*(\d+)/i);
    if (rechargeMatch && rechargeMatch[1]) {
      action.recharge = {
        minRoll: parseInt(rechargeMatch[1], 10),
        maxRoll: 6,
      };
    }
  }

  return action;
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts a PF2e stat block to D&D 5e format.
 *
 * This enables the existing D&D 5e to Daggerheart conversion pipeline
 * to process PF2e creatures by first adapting them to the D&D 5e format.
 *
 * @param pf2e - The PF2e stat block to convert
 * @returns A D&D 5e monster stat block
 *
 * @example
 * ```typescript
 * import { parsePF2eStatBlock } from '../parsers/pf2eParser';
 * import { convertPF2eToDnD5e } from '../converters/pf2eAdapter';
 * import { convertFromStatBlock } from '../orchestrator/converter';
 *
 * const pf2eCreature = parsePF2eStatBlock(pf2eText);
 * const dnd5eCreature = convertPF2eToDnD5e(pf2eCreature);
 * const daggerheartAdversary = convertFromStatBlock(dnd5eCreature);
 * ```
 */
export function convertPF2eToDnD5e(pf2e: PF2eStatBlock): DnD5eMonster {
  const level = pf2e.level;

  // Convert CR and calculate XP
  const cr = pf2eLevelToCR(level);
  const crString = typeof cr === 'string' ? cr : String(cr);
  const xp = CR_TO_XP[crString] || 0;
  const proficiencyBonus = calculateProficiencyBonus(cr);

  // Convert size
  const size = SIZE_MAP[pf2e.size] || CreatureSize.MEDIUM;

  // Detect creature type from traits
  const creatureType = detectCreatureType(pf2e.traits);

  // Extract subtypes from traits (non-type traits)
  const subtypes = pf2e.traits.filter((t) => {
    const lower = t.toLowerCase();
    return !CREATURE_TYPE_TRAITS[lower] && !SIZE_MAP[lower as PF2eSize];
  });

  // Convert alignment
  const alignment = convertAlignment(pf2e.alignment);

  // Convert AC
  const armorClass = convertAC(pf2e.ac, level);

  // Convert HP
  const hitPoints = convertHP(pf2e.hp, level);

  // Convert speed
  const speed: Speed = {};
  if (pf2e.speed.land !== undefined) {
    speed.walk = pf2e.speed.land;
  }
  if (pf2e.speed.fly !== undefined) {
    speed.fly = pf2e.speed.fly;
  }
  if (pf2e.speed.swim !== undefined) {
    speed.swim = pf2e.speed.swim;
  }
  if (pf2e.speed.climb !== undefined) {
    speed.climb = pf2e.speed.climb;
  }
  if (pf2e.speed.burrow !== undefined) {
    speed.burrow = pf2e.speed.burrow;
  }

  // Convert ability scores from modifiers
  const abilityScores: AbilityScores = {
    STR: modifierToScore(pf2e.abilities.str),
    DEX: modifierToScore(pf2e.abilities.dex),
    CON: modifierToScore(pf2e.abilities.con),
    INT: modifierToScore(pf2e.abilities.int),
    WIS: modifierToScore(pf2e.abilities.wis),
    CHA: modifierToScore(pf2e.abilities.cha),
  };

  // Convert saving throws
  const savingThrows: SavingThrow[] = [];

  // Fort -> CON, Ref -> DEX, Will -> WIS
  const fortMod = convertSave(pf2e.saves.fortitude, level);
  const refMod = convertSave(pf2e.saves.reflex, level);
  const willMod = convertSave(pf2e.saves.will, level);

  // Only add saves that are above the base modifier
  const conMod = Math.floor((abilityScores.CON - 10) / 2);
  const dexMod = Math.floor((abilityScores.DEX - 10) / 2);
  const wisMod = Math.floor((abilityScores.WIS - 10) / 2);

  if (fortMod > conMod) {
    savingThrows.push({ ability: AbilityScore.CONSTITUTION, modifier: fortMod });
  }
  if (refMod > dexMod) {
    savingThrows.push({ ability: AbilityScore.DEXTERITY, modifier: refMod });
  }
  if (willMod > wisMod) {
    savingThrows.push({ ability: AbilityScore.WISDOM, modifier: willMod });
  }

  // Convert skills
  const skills: SkillProficiency[] = [];
  for (const skillEntry of pf2e.skills) {
    const dnd5eSkill = SKILL_MAP[skillEntry.skill];
    if (dnd5eSkill) {
      const adjustedMod = Math.max(-5, Math.min(15, skillEntry.modifier - level));
      skills.push({ skill: dnd5eSkill, modifier: adjustedMod });
    }
  }

  // Convert damage modifiers
  const damageModifiers: DamageModifiers = {
    vulnerabilities: [],
    resistances: [],
    immunities: [],
  };

  // Convert immunities
  for (const immunity of pf2e.immunities) {
    const typeStr = typeof immunity.type === 'string' ? immunity.type.toLowerCase() : immunity.type;
    const dndType = DAMAGE_TYPE_MAP[typeStr as PF2eDamageType];
    if (dndType) {
      damageModifiers.immunities.push({ damageType: dndType });
    }
  }

  // Convert resistances
  for (const resistance of pf2e.resistances) {
    const typeStr = typeof resistance.type === 'string' ? resistance.type.toLowerCase() : resistance.type;
    const dndType = DAMAGE_TYPE_MAP[typeStr as PF2eDamageType];
    if (dndType) {
      const entry: DamageModifierEntry = { damageType: dndType };
      if (resistance.exceptions && resistance.exceptions.length > 0) {
        entry.condition = `except ${resistance.exceptions.join(', ')}`;
      }
      damageModifiers.resistances.push(entry);
    }
  }

  // Convert weaknesses to vulnerabilities
  for (const weakness of pf2e.weaknesses) {
    const typeStr = typeof weakness.type === 'string' ? weakness.type.toLowerCase() : weakness.type;
    const dndType = DAMAGE_TYPE_MAP[typeStr as PF2eDamageType];
    if (dndType) {
      damageModifiers.vulnerabilities.push({ damageType: dndType });
    }
  }

  // Convert senses
  const specialSenses: Sense[] = [];
  for (const sense of pf2e.perception.senses) {
    const dndSenseType = SENSE_TYPE_MAP[sense.type];
    if (dndSenseType) {
      specialSenses.push({
        type: dndSenseType,
        range: sense.range || 60,
      });
    }
  }

  // Calculate passive perception (10 + perception modifier, adjusted for level)
  const perceptionMod = Math.max(-5, Math.min(15, pf2e.perception.modifier - level));
  const passivePerception = 10 + perceptionMod;

  const senses: Senses = {
    specialSenses,
    passivePerception,
  };

  // Convert languages
  const languages = pf2e.languages.map((l) => l.name);

  // Convert attacks
  const attacks: DnD5eAttack[] = [];
  for (const strike of pf2e.melee) {
    attacks.push(convertStrike(strike, level, false));
  }
  for (const strike of pf2e.ranged) {
    attacks.push(convertStrike(strike, level, true));
  }

  // Convert abilities
  const traits: Trait[] = [];
  const actions: DnD5eAction[] = [];
  const reactions: Reaction[] = [];

  // Process passive abilities
  if (pf2e.passiveAbilities) {
    for (const ability of pf2e.passiveAbilities) {
      const converted = convertAbility(ability);
      if ('trigger' in converted && converted.trigger) {
        reactions.push(converted as Reaction);
      } else if ('recharge' in converted || ability.actionCost) {
        actions.push(converted as DnD5eAction);
      } else {
        traits.push(converted as Trait);
      }
    }
  }

  // Process active abilities
  if (pf2e.activeAbilities) {
    for (const ability of pf2e.activeAbilities) {
      const converted = convertAbility(ability);
      if (ability.actionCost === PF2eActionCost.REACTION) {
        reactions.push(converted as Reaction);
      } else {
        actions.push(converted as DnD5eAction);
      }
    }
  }

  // Build the D&D 5e monster
  const monster: DnD5eMonster = {
    name: pf2e.name,
    size,
    creatureType,
    alignment,
    armorClass,
    hitPoints,
    speed,
    abilityScores,
    senses,
    languages,
    challengeRating: { cr, xp },
    proficiencyBonus,
    source: pf2e.source ? `${pf2e.source} (PF2e)` : 'Pathfinder 2e',
    notes: `Converted from PF2e Level ${level} creature`,
  };

  // Add optional fields
  if (subtypes.length > 0) {
    monster.subtypes = subtypes;
  }

  if (savingThrows.length > 0) {
    monster.savingThrows = savingThrows;
  }

  if (skills.length > 0) {
    monster.skills = skills;
  }

  if (
    damageModifiers.vulnerabilities.length > 0 ||
    damageModifiers.resistances.length > 0 ||
    damageModifiers.immunities.length > 0
  ) {
    monster.damageModifiers = damageModifiers;
  }

  if (traits.length > 0) {
    monster.traits = traits;
  }

  if (attacks.length > 0) {
    monster.attacks = attacks;
  }

  if (actions.length > 0) {
    monster.actions = actions;
  }

  if (reactions.length > 0) {
    monster.reactions = reactions;
  }

  return monster;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Checks if a stat block appears to be PF2e format.
 *
 * @param text - Raw stat block text to check
 * @returns True if the text appears to be PF2e format
 */
export function isPF2eFormat(text: string): boolean {
  const lower = text.toLowerCase();

  // PF2e-specific indicators
  const pf2eIndicators = [
    /creature\s+-?\d+/i,           // "Creature X" format
    /perception\s+[+-]\d+/i,       // Perception modifier
    /\bfort\s+[+-]\d+/i,           // Fort save
    /\bref\s+[+-]\d+/i,            // Ref save
    /\bwill\s+[+-]\d+/i,           // Will save
    /\[one-action\]|\[two-action\]|\[three-action\]/i,  // PF2e action icons
    /\bstr\s+[+-]\d+,\s*dex\s+[+-]\d+/i,  // Ability modifiers format
  ];

  let matchCount = 0;
  for (const indicator of pf2eIndicators) {
    if (indicator.test(lower)) {
      matchCount++;
    }
  }

  // If at least 3 indicators match, it's likely PF2e
  return matchCount >= 3;
}

/**
 * Summary of the PF2e to D&D 5e conversion for documentation.
 */
export interface PF2eConversionSummary {
  /** Original PF2e level. */
  originalLevel: number;
  /** Converted D&D 5e CR. */
  convertedCR: number | string;
  /** Scaling factors applied. */
  scalingNotes: string[];
}

/**
 * Gets a summary of the conversion process.
 */
export function getConversionSummary(pf2e: PF2eStatBlock): PF2eConversionSummary {
  const cr = pf2eLevelToCR(pf2e.level);

  return {
    originalLevel: pf2e.level,
    convertedCR: cr,
    scalingNotes: [
      `HP scaled by ~${pf2e.level <= 2 ? 10 : pf2e.level <= 7 ? 11 : pf2e.level <= 14 ? 12 : 14}x`,
      `AC reduced by level (${pf2e.level})`,
      'Attack/save modifiers reduced by level',
      'Action costs mapped to D&D 5e action economy',
    ],
  };
}
