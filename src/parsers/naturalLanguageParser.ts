/**
 * Natural Language Parser for D&D 5e Monster Descriptions
 *
 * Extracts key statistics from informal natural language descriptions
 * and converts them into partial DnD5eMonster objects for conversion.
 *
 * @module parsers/naturalLanguageParser
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  SpecialAlignment,
  LawChaosAxis,
  GoodEvilAxis,
  Alignment,
  AbilityScores,
  Speed,
  ArmorClass,
  HitPoints,
  DiceExpression,
  Senses,
  ChallengeRating,
  Trait,
  DnD5eAttack,
  AttackType,
  AttackDamage,
  DnD5eDamageType,
  LegendaryActions,
  LegendaryAction,
  CR_TO_XP,
  calculateProficiencyBonus,
} from '../models/dnd5e';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of natural language parsing.
 */
export interface NLParseResult {
  /** Partial stat block extracted from input. */
  statBlock: Partial<DnD5eMonster>;
  /** Confidence score (0-1) based on extraction completeness. */
  confidence: number;
  /** List of fields successfully extracted. */
  extracted: string[];
  /** List of required fields that are missing. */
  missing: string[];
  /** Suggestions for improving the input or filling gaps. */
  suggestions: string[];
}

/**
 * Modifier flags extracted from input.
 */
interface ExtractedModifiers {
  isLegendary: boolean;
  isSwarm: boolean;
  isLeader: boolean;
  isMythic: boolean;
  isPowerful: boolean;
  isWeak: boolean;
  isElite: boolean;
  isBoss: boolean;
}

/**
 * Weapon/attack information extracted from input.
 */
interface ExtractedWeapon {
  name: string;
  damageType?: DnD5eDamageType;
  isRanged: boolean;
  isMagical: boolean;
}

/**
 * Movement type extracted from input.
 */
interface ExtractedMovement {
  flies: boolean;
  swims: boolean;
  burrows: boolean;
  climbs: boolean;
  hovers: boolean;
}

// ============================================================================
// CONSTANTS - Pattern Mappings
// ============================================================================

/**
 * CR patterns to match various formats.
 */
const CR_PATTERNS = [
  // "CR 5", "cr5", "CR5"
  /\bCR\s*(\d+(?:\/\d+)?)\b/i,
  // "challenge rating 5", "challenge 5"
  /\bchallenge\s*(?:rating)?\s*(\d+(?:\/\d+)?)\b/i,
  // "level 5" (approximate)
  /\blevel\s*(\d+)\b/i,
  // "tier 2" (Daggerheart tier, convert to approximate CR)
  /\btier\s*(\d+)\b/i,
];

/**
 * Size pattern matching.
 */
const SIZE_PATTERNS: Record<string, CreatureSize> = {
  tiny: CreatureSize.TINY,
  small: CreatureSize.SMALL,
  medium: CreatureSize.MEDIUM,
  large: CreatureSize.LARGE,
  huge: CreatureSize.HUGE,
  gargantuan: CreatureSize.GARGANTUAN,
  massive: CreatureSize.GARGANTUAN,
  giant: CreatureSize.HUGE,
  little: CreatureSize.SMALL,
  big: CreatureSize.LARGE,
  enormous: CreatureSize.GARGANTUAN,
  colossal: CreatureSize.GARGANTUAN,
};

/**
 * Creature type pattern matching with common variations.
 */
const TYPE_PATTERNS: Record<string, CreatureType> = {
  // Exact types
  aberration: CreatureType.ABERRATION,
  beast: CreatureType.BEAST,
  celestial: CreatureType.CELESTIAL,
  construct: CreatureType.CONSTRUCT,
  dragon: CreatureType.DRAGON,
  elemental: CreatureType.ELEMENTAL,
  fey: CreatureType.FEY,
  fiend: CreatureType.FIEND,
  giant: CreatureType.GIANT,
  humanoid: CreatureType.HUMANOID,
  monstrosity: CreatureType.MONSTROSITY,
  ooze: CreatureType.OOZE,
  plant: CreatureType.PLANT,
  undead: CreatureType.UNDEAD,
  // Common creature names that imply type
  demon: CreatureType.FIEND,
  devil: CreatureType.FIEND,
  angel: CreatureType.CELESTIAL,
  zombie: CreatureType.UNDEAD,
  skeleton: CreatureType.UNDEAD,
  ghost: CreatureType.UNDEAD,
  vampire: CreatureType.UNDEAD,
  lich: CreatureType.UNDEAD,
  wraith: CreatureType.UNDEAD,
  wight: CreatureType.UNDEAD,
  mummy: CreatureType.UNDEAD,
  golem: CreatureType.CONSTRUCT,
  robot: CreatureType.CONSTRUCT,
  automaton: CreatureType.CONSTRUCT,
  wolf: CreatureType.BEAST,
  bear: CreatureType.BEAST,
  lion: CreatureType.BEAST,
  tiger: CreatureType.BEAST,
  snake: CreatureType.BEAST,
  spider: CreatureType.BEAST,
  bat: CreatureType.BEAST,
  rat: CreatureType.BEAST,
  shark: CreatureType.BEAST,
  eagle: CreatureType.BEAST,
  horse: CreatureType.BEAST,
  orc: CreatureType.HUMANOID,
  goblin: CreatureType.HUMANOID,
  kobold: CreatureType.HUMANOID,
  elf: CreatureType.HUMANOID,
  dwarf: CreatureType.HUMANOID,
  human: CreatureType.HUMANOID,
  gnome: CreatureType.HUMANOID,
  halfling: CreatureType.HUMANOID,
  troll: CreatureType.GIANT,
  ogre: CreatureType.GIANT,
  ettin: CreatureType.GIANT,
  wyrm: CreatureType.DRAGON,
  drake: CreatureType.DRAGON,
  wyvern: CreatureType.DRAGON,
  sprite: CreatureType.FEY,
  pixie: CreatureType.FEY,
  dryad: CreatureType.FEY,
  satyr: CreatureType.FEY,
  nymph: CreatureType.FEY,
  treant: CreatureType.PLANT,
  shambling: CreatureType.PLANT,
  beholder: CreatureType.ABERRATION,
  mindflayer: CreatureType.ABERRATION,
  'mind flayer': CreatureType.ABERRATION,
  illithid: CreatureType.ABERRATION,
  aboleth: CreatureType.ABERRATION,
  hydra: CreatureType.MONSTROSITY,
  chimera: CreatureType.MONSTROSITY,
  basilisk: CreatureType.MONSTROSITY,
  manticore: CreatureType.MONSTROSITY,
  griffon: CreatureType.MONSTROSITY,
  slime: CreatureType.OOZE,
  jelly: CreatureType.OOZE,
  cube: CreatureType.OOZE,
  pudding: CreatureType.OOZE,
  genie: CreatureType.ELEMENTAL,
  djinn: CreatureType.ELEMENTAL,
  efreet: CreatureType.ELEMENTAL,
};

/**
 * Damage type pattern matching.
 */
const DAMAGE_TYPE_PATTERNS: Record<string, DnD5eDamageType> = {
  fire: DnD5eDamageType.FIRE,
  'fire-breathing': DnD5eDamageType.FIRE,
  flame: DnD5eDamageType.FIRE,
  burning: DnD5eDamageType.FIRE,
  ice: DnD5eDamageType.COLD,
  cold: DnD5eDamageType.COLD,
  frost: DnD5eDamageType.COLD,
  freezing: DnD5eDamageType.COLD,
  lightning: DnD5eDamageType.LIGHTNING,
  electric: DnD5eDamageType.LIGHTNING,
  thunder: DnD5eDamageType.THUNDER,
  sonic: DnD5eDamageType.THUNDER,
  acid: DnD5eDamageType.ACID,
  poison: DnD5eDamageType.POISON,
  venomous: DnD5eDamageType.POISON,
  toxic: DnD5eDamageType.POISON,
  necrotic: DnD5eDamageType.NECROTIC,
  death: DnD5eDamageType.NECROTIC,
  radiant: DnD5eDamageType.RADIANT,
  holy: DnD5eDamageType.RADIANT,
  divine: DnD5eDamageType.RADIANT,
  psychic: DnD5eDamageType.PSYCHIC,
  mental: DnD5eDamageType.PSYCHIC,
  force: DnD5eDamageType.FORCE,
};

/**
 * Weapon pattern matching.
 */
const WEAPON_PATTERNS: Record<string, { name: string; isRanged: boolean }> = {
  sword: { name: 'Sword', isRanged: false },
  longsword: { name: 'Longsword', isRanged: false },
  greatsword: { name: 'Greatsword', isRanged: false },
  shortsword: { name: 'Shortsword', isRanged: false },
  scimitar: { name: 'Scimitar', isRanged: false },
  axe: { name: 'Battleaxe', isRanged: false },
  greataxe: { name: 'Greataxe', isRanged: false },
  handaxe: { name: 'Handaxe', isRanged: false },
  mace: { name: 'Mace', isRanged: false },
  hammer: { name: 'Warhammer', isRanged: false },
  maul: { name: 'Maul', isRanged: false },
  club: { name: 'Club', isRanged: false },
  staff: { name: 'Quarterstaff', isRanged: false },
  spear: { name: 'Spear', isRanged: false },
  javelin: { name: 'Javelin', isRanged: true },
  dagger: { name: 'Dagger', isRanged: false },
  rapier: { name: 'Rapier', isRanged: false },
  bow: { name: 'Longbow', isRanged: true },
  longbow: { name: 'Longbow', isRanged: true },
  shortbow: { name: 'Shortbow', isRanged: true },
  crossbow: { name: 'Crossbow', isRanged: true },
  sling: { name: 'Sling', isRanged: true },
  claws: { name: 'Claws', isRanged: false },
  claw: { name: 'Claw', isRanged: false },
  bite: { name: 'Bite', isRanged: false },
  fangs: { name: 'Bite', isRanged: false },
  tail: { name: 'Tail', isRanged: false },
  tentacle: { name: 'Tentacle', isRanged: false },
  tentacles: { name: 'Tentacles', isRanged: false },
  fist: { name: 'Slam', isRanged: false },
  fists: { name: 'Slam', isRanged: false },
  slam: { name: 'Slam', isRanged: false },
};

// ============================================================================
// EXTRACTION FUNCTIONS
// ============================================================================

/**
 * Extracts Challenge Rating from input text.
 */
function extractCR(input: string): ChallengeRating | null {
  const lower = input.toLowerCase();

  for (const pattern of CR_PATTERNS) {
    const match = lower.match(pattern);
    if (match && match[1]) {
      const crValue = match[1];

      // Handle "tier X" conversion (approximate)
      if (lower.includes('tier')) {
        const tier = parseInt(crValue, 10);
        const approxCR = tier * 4; // Rough approximation
        return {
          cr: approxCR,
          xp: CR_TO_XP[String(approxCR)] ?? 0,
        };
      }

      // Handle fractional CRs
      if (crValue.includes('/')) {
        return {
          cr: crValue,
          xp: CR_TO_XP[crValue] ?? 0,
        };
      }

      const numCR = parseInt(crValue, 10);
      return {
        cr: numCR,
        xp: CR_TO_XP[String(numCR)] ?? 0,
      };
    }
  }

  return null;
}

/**
 * Extracts creature size from input text.
 */
function extractSize(input: string): CreatureSize | null {
  const lower = input.toLowerCase();

  for (const [keyword, size] of Object.entries(SIZE_PATTERNS)) {
    if (lower.includes(keyword)) {
      return size;
    }
  }

  return null;
}

/**
 * Extracts creature type from input text.
 */
function extractCreatureType(input: string): { type: CreatureType; baseName: string } | null {
  const lower = input.toLowerCase();

  // Check for explicit type mentions first
  for (const [keyword, type] of Object.entries(TYPE_PATTERNS)) {
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
    if (regex.test(lower)) {
      // Capitalize first letter of keyword for base name
      const baseName = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      return { type, baseName };
    }
  }

  return null;
}

/**
 * Extracts modifier flags from input text.
 */
function extractModifiers(input: string): ExtractedModifiers {
  const lower = input.toLowerCase();

  return {
    isLegendary: /\b(legendary|legend)\b/i.test(lower),
    isSwarm: /\bswarm\b/i.test(lower),
    isLeader: /\b(leader|chieftain|captain|boss|commander|warlord)\b/i.test(lower),
    isMythic: /\bmythic\b/i.test(lower),
    isPowerful: /\b(powerful|strong|mighty|fearsome)\b/i.test(lower),
    isWeak: /\b(weak|feeble|frail)\b/i.test(lower),
    isElite: /\b(elite|veteran|champion)\b/i.test(lower),
    isBoss: /\b(boss|final|arch|supreme)\b/i.test(lower),
  };
}

/**
 * Extracts weapon/attack information from input text.
 */
function extractWeapons(input: string): ExtractedWeapon[] {
  const lower = input.toLowerCase();
  const weapons: ExtractedWeapon[] = [];

  for (const [keyword, info] of Object.entries(WEAPON_PATTERNS)) {
    const regex = new RegExp(`\\b${keyword}s?\\b`, 'i');
    if (regex.test(lower)) {
      const weapon: ExtractedWeapon = {
        name: info.name,
        isRanged: info.isRanged,
        isMagical: /\b(magic|magical|enchanted|\+\d)\b/i.test(lower),
      };

      // Check for damage type modifiers near the weapon mention
      for (const [dmgKeyword, dmgType] of Object.entries(DAMAGE_TYPE_PATTERNS)) {
        if (lower.includes(dmgKeyword)) {
          weapon.damageType = dmgType;
          break;
        }
      }

      weapons.push(weapon);
    }
  }

  return weapons;
}

/**
 * Extracts movement capabilities from input text.
 */
function extractMovement(input: string): ExtractedMovement {
  const lower = input.toLowerCase();

  return {
    flies: /\b(flies|flying|winged|wings|airborne)\b/i.test(lower),
    swims: /\b(swims|swimming|aquatic|amphibious)\b/i.test(lower),
    burrows: /\b(burrows|burrowing|underground)\b/i.test(lower),
    climbs: /\b(climbs|climbing|spider-climb)\b/i.test(lower),
    hovers: /\b(hovers|hovering|floats|floating)\b/i.test(lower),
  };
}

/**
 * Extracts a creature name from input text.
 */
function extractCreatureName(input: string): string {
  // Remove CR and other numeric specifications
  let cleaned = input
    .replace(/\bCR\s*\d+(?:\/\d+)?\b/gi, '')
    .replace(/\bchallenge\s*(?:rating)?\s*\d+(?:\/\d+)?\b/gi, '')
    .replace(/\btier\s*\d+\b/gi, '')
    .replace(/\blevel\s*\d+\b/gi, '');

  // Remove common modifiers
  cleaned = cleaned
    .replace(/\b(a|an|the)\b/gi, '')
    .replace(/\b(powerful|strong|mighty|weak|legendary|mythic)\b/gi, '')
    .replace(/\b(with|and|that|which|who)\b/gi, ' ')
    .trim();

  // Try to extract meaningful noun phrase
  const words = cleaned.split(/\s+/).filter((w) => w.length > 2);

  if (words.length === 0) {
    return 'Unknown Creature';
  }

  // Capitalize each word
  return words
    .slice(0, 4) // Take first 4 words at most
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extracts alignment hints from input text.
 */
function extractAlignment(input: string): Alignment | null {
  const lower = input.toLowerCase();

  // Check for alignment keywords
  if (/\bunaligned\b/.test(lower)) return SpecialAlignment.UNALIGNED;
  if (/\bevil\s+dragon\b/.test(lower) || /\bchromatic\b/.test(lower)) {
    return { lawChaos: LawChaosAxis.CHAOTIC, goodEvil: GoodEvilAxis.EVIL };
  }
  if (/\bgood\s+dragon\b/.test(lower) || /\bmetallic\b/.test(lower)) {
    return { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.GOOD };
  }

  // Undead are typically evil
  if (/\b(undead|zombie|skeleton|vampire|lich|wraith)\b/.test(lower)) {
    return { lawChaos: LawChaosAxis.NEUTRAL, goodEvil: GoodEvilAxis.EVIL };
  }

  // Fiends are typically evil
  if (/\b(demon|devil|fiend)\b/.test(lower)) {
    if (/\bdevil\b/.test(lower)) {
      return { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.EVIL };
    }
    return { lawChaos: LawChaosAxis.CHAOTIC, goodEvil: GoodEvilAxis.EVIL };
  }

  // Celestials are typically good
  if (/\b(angel|celestial|archon)\b/.test(lower)) {
    return { lawChaos: LawChaosAxis.LAWFUL, goodEvil: GoodEvilAxis.GOOD };
  }

  // Beasts are typically unaligned
  if (/\b(beast|animal|wolf|bear|lion|shark)\b/.test(lower)) {
    return SpecialAlignment.UNALIGNED;
  }

  return null;
}

// ============================================================================
// STAT ESTIMATION
// ============================================================================

/**
 * Estimates default ability scores based on CR and creature type.
 */
function estimateAbilityScores(
  cr: number,
  creatureType: CreatureType,
  modifiers: ExtractedModifiers
): AbilityScores {
  // Base scores by CR tier
  let baseScore = 10;
  if (cr >= 17) baseScore = 20;
  else if (cr >= 11) baseScore = 16;
  else if (cr >= 5) baseScore = 14;
  else if (cr >= 1) baseScore = 12;

  // Apply modifier adjustments
  if (modifiers.isPowerful || modifiers.isLegendary) baseScore += 2;
  if (modifiers.isWeak) baseScore -= 2;
  if (modifiers.isBoss) baseScore += 4;

  // Type-based adjustments
  const scores: AbilityScores = {
    STR: baseScore,
    DEX: baseScore,
    CON: baseScore,
    INT: baseScore - 2,
    WIS: baseScore - 2,
    CHA: baseScore - 4,
  };

  switch (creatureType) {
    case CreatureType.BEAST:
      scores.INT = 2;
      scores.CHA = 6;
      scores.STR += 2;
      break;
    case CreatureType.DRAGON:
      scores.STR += 4;
      scores.CON += 2;
      scores.INT += 4;
      scores.CHA += 4;
      break;
    case CreatureType.UNDEAD:
      scores.CON += 2;
      scores.INT = Math.max(6, scores.INT - 2);
      scores.CHA = Math.max(6, scores.CHA);
      break;
    case CreatureType.CONSTRUCT:
      scores.STR += 2;
      scores.CON += 4;
      scores.INT = 1;
      scores.WIS = 10;
      scores.CHA = 1;
      break;
    case CreatureType.OOZE:
      scores.STR += 2;
      scores.DEX = 6;
      scores.INT = 1;
      scores.WIS = 6;
      scores.CHA = 1;
      break;
    case CreatureType.FIEND:
    case CreatureType.CELESTIAL:
      scores.CHA += 4;
      scores.INT += 2;
      break;
    case CreatureType.ABERRATION:
      scores.INT += 4;
      scores.CHA += 2;
      break;
    case CreatureType.GIANT:
      scores.STR += 6;
      scores.CON += 2;
      scores.INT -= 2;
      break;
    case CreatureType.ELEMENTAL:
      scores.CON += 4;
      break;
    case CreatureType.FEY:
      scores.DEX += 2;
      scores.CHA += 4;
      break;
    case CreatureType.HUMANOID:
      // Balanced, no changes
      break;
    case CreatureType.MONSTROSITY:
      scores.STR += 2;
      scores.CON += 2;
      break;
    case CreatureType.PLANT:
      scores.STR += 2;
      scores.CON += 2;
      scores.DEX -= 2;
      scores.INT = 1;
      break;
  }

  // Cap scores at 30
  return {
    STR: Math.min(30, Math.max(1, scores.STR)),
    DEX: Math.min(30, Math.max(1, scores.DEX)),
    CON: Math.min(30, Math.max(1, scores.CON)),
    INT: Math.min(30, Math.max(1, scores.INT)),
    WIS: Math.min(30, Math.max(1, scores.WIS)),
    CHA: Math.min(30, Math.max(1, scores.CHA)),
  };
}

/**
 * Estimates AC based on CR and modifiers.
 */
function estimateAC(cr: number, creatureType: CreatureType): ArmorClass {
  // Base AC by CR
  let ac = 10;
  if (cr >= 17) ac = 19;
  else if (cr >= 11) ac = 17;
  else if (cr >= 5) ac = 15;
  else if (cr >= 1) ac = 13;
  else ac = 12;

  // Type adjustments
  switch (creatureType) {
    case CreatureType.DRAGON:
      ac += 2;
      break;
    case CreatureType.CONSTRUCT:
      ac += 3;
      break;
    case CreatureType.OOZE:
      ac = 8;
      break;
    case CreatureType.ELEMENTAL:
      ac += 1;
      break;
  }

  return { value: ac, armorType: 'natural armor' };
}

/**
 * Estimates HP based on CR and size.
 */
function estimateHP(cr: number, size: CreatureSize): HitPoints {
  // Base hit dice by CR
  let hitDice = 1;
  if (cr >= 17) hitDice = 22;
  else if (cr >= 11) hitDice = 15;
  else if (cr >= 5) hitDice = 10;
  else if (cr >= 1) hitDice = 5;
  else hitDice = 2;

  // Die size by creature size
  let dieSize: 4 | 6 | 8 | 10 | 12 | 20 | 100 = 8;
  switch (size) {
    case CreatureSize.TINY:
      dieSize = 4;
      break;
    case CreatureSize.SMALL:
      dieSize = 6;
      break;
    case CreatureSize.MEDIUM:
      dieSize = 8;
      break;
    case CreatureSize.LARGE:
      dieSize = 10;
      break;
    case CreatureSize.HUGE:
      dieSize = 12;
      break;
    case CreatureSize.GARGANTUAN:
      dieSize = 20;
      break;
  }

  const conMod = Math.floor(cr / 4); // Rough CON modifier estimate
  const modifier = hitDice * conMod;
  const average = Math.floor(hitDice * ((dieSize + 1) / 2) + modifier);

  const formula: DiceExpression = {
    count: hitDice,
    dieSize,
    modifier,
  };

  return { average, formula };
}

/**
 * Estimates speed based on creature type and movement flags.
 */
function estimateSpeed(
  creatureType: CreatureType,
  size: CreatureSize,
  movement: ExtractedMovement
): Speed {
  // Base walk speed by size
  let walk = 30;
  switch (size) {
    case CreatureSize.TINY:
      walk = 20;
      break;
    case CreatureSize.SMALL:
      walk = 25;
      break;
    case CreatureSize.LARGE:
      walk = 40;
      break;
    case CreatureSize.HUGE:
    case CreatureSize.GARGANTUAN:
      walk = 50;
      break;
  }

  const speed: Speed = { walk };

  // Add movement types
  if (movement.flies) {
    speed.fly = walk + 30;
    if (movement.hovers) {
      speed.hover = true;
    }
  }

  if (movement.swims) {
    speed.swim = walk;
  }

  if (movement.burrows) {
    speed.burrow = Math.floor(walk / 2);
  }

  if (movement.climbs) {
    speed.climb = walk;
  }

  // Type-based adjustments
  switch (creatureType) {
    case CreatureType.DRAGON:
      if (!speed.fly) {
        speed.fly = 80;
      }
      break;
    case CreatureType.ELEMENTAL:
      if (movement.flies) {
        speed.fly = 90;
        speed.hover = true;
      }
      break;
    case CreatureType.OOZE:
      speed.walk = 10;
      speed.climb = 10;
      break;
  }

  return speed;
}

/**
 * Creates attacks from extracted weapon info.
 */
function createAttacks(
  weapons: ExtractedWeapon[],
  cr: number,
  abilityScores: AbilityScores
): DnD5eAttack[] {
  const profBonus = calculateProficiencyBonus(cr);
  const strMod = Math.floor((abilityScores.STR - 10) / 2);
  const dexMod = Math.floor((abilityScores.DEX - 10) / 2);

  return weapons.map((weapon): DnD5eAttack => {
    const isRanged = weapon.isRanged;
    const mod = isRanged ? dexMod : strMod;
    const toHit = mod + profBonus;

    // Damage die by CR
    let damageDie: 4 | 6 | 8 | 10 | 12 | 20 | 100 = 6;
    if (cr >= 11) damageDie = 12;
    else if (cr >= 5) damageDie = 10;
    else if (cr >= 1) damageDie = 8;

    const damage: AttackDamage = {
      dice: {
        count: Math.max(1, Math.floor(cr / 5) + 1),
        dieSize: damageDie,
        modifier: mod,
      },
      damageType: weapon.damageType ?? (isRanged ? DnD5eDamageType.PIERCING : DnD5eDamageType.SLASHING),
    };

    return {
      name: weapon.name,
      attackType: isRanged ? AttackType.RANGED_WEAPON : AttackType.MELEE_WEAPON,
      toHit,
      range: isRanged ? { normal: 80, long: 320 } : { reach: 5 },
      target: 'one target',
      damage,
    };
  });
}

/**
 * Creates legendary actions if the creature is legendary.
 */
function createLegendaryActions(name: string): LegendaryActions {
  const actions: LegendaryAction[] = [
    {
      name: 'Detect',
      description: `The ${name} makes a Wisdom (Perception) check.`,
      cost: 1,
    },
    {
      name: 'Attack',
      description: `The ${name} makes one attack.`,
      cost: 2,
    },
  ];

  return {
    count: 3,
    description: `The ${name} can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature's turn. The ${name} regains spent legendary actions at the start of its turn.`,
    actions,
  };
}

// ============================================================================
// MAIN PARSER FUNCTIONS
// ============================================================================

/**
 * Parses natural language monster description into a partial DnD5eMonster.
 *
 * @param input - Natural language description (e.g., "a CR 5 fire-breathing dragon")
 * @returns Parse result with extracted stat block, confidence, and suggestions
 *
 * @example
 * ```typescript
 * const result = parseNaturalLanguage("A CR 3 orc warband leader with a greataxe");
 * console.log(result.statBlock.name); // "Orc Warband Leader"
 * console.log(result.confidence); // 0.7
 * ```
 */
export function parseNaturalLanguage(input: string): NLParseResult {
  const extracted: string[] = [];
  const missing: string[] = [];
  const suggestions: string[] = [];
  const statBlock: Partial<DnD5eMonster> = {};

  // Extract Challenge Rating
  const cr = extractCR(input);
  if (cr) {
    statBlock.challengeRating = cr;
    statBlock.proficiencyBonus = calculateProficiencyBonus(cr.cr);
    extracted.push('challengeRating');
  } else {
    missing.push('challengeRating');
    suggestions.push('Add a CR (e.g., "CR 5") for accurate stat estimation');
  }

  // Extract creature type
  const typeInfo = extractCreatureType(input);
  if (typeInfo) {
    statBlock.creatureType = typeInfo.type;
    extracted.push('creatureType');
  } else {
    missing.push('creatureType');
    suggestions.push('Specify creature type (e.g., "dragon", "humanoid", "undead")');
  }

  // Extract size
  const size = extractSize(input);
  if (size) {
    statBlock.size = size;
    extracted.push('size');
  } else {
    // Infer from type if possible
    if (typeInfo) {
      switch (typeInfo.type) {
        case CreatureType.DRAGON:
          statBlock.size = CreatureSize.LARGE;
          break;
        case CreatureType.GIANT:
          statBlock.size = CreatureSize.HUGE;
          break;
        case CreatureType.HUMANOID:
          statBlock.size = CreatureSize.MEDIUM;
          break;
        default:
          statBlock.size = CreatureSize.MEDIUM;
      }
      extracted.push('size (inferred)');
    } else {
      statBlock.size = CreatureSize.MEDIUM;
      missing.push('size');
      suggestions.push('Specify size (e.g., "large", "huge", "tiny")');
    }
  }

  // Extract modifiers
  const modifiers = extractModifiers(input);

  // Extract weapons
  const weapons = extractWeapons(input);
  if (weapons.length > 0) {
    extracted.push('weapons');
  }

  // Extract movement
  const movement = extractMovement(input);
  if (movement.flies || movement.swims || movement.burrows || movement.climbs) {
    extracted.push('movement');
  }

  // Extract alignment
  const alignment = extractAlignment(input);
  if (alignment) {
    statBlock.alignment = alignment;
    extracted.push('alignment');
  } else {
    statBlock.alignment = SpecialAlignment.UNALIGNED;
    missing.push('alignment');
  }

  // Generate creature name
  let name = extractCreatureName(input);
  if (typeInfo && !name.toLowerCase().includes(typeInfo.baseName.toLowerCase())) {
    // Include type in name if not already present
    name = `${name} ${typeInfo.baseName}`.trim();
  }
  if (modifiers.isLeader && !name.toLowerCase().includes('leader')) {
    name = `${name} Leader`;
  }
  if (modifiers.isSwarm && !name.toLowerCase().includes('swarm')) {
    name = `Swarm of ${name}s`;
  }
  statBlock.name = name;
  extracted.push('name');

  // Now estimate/generate remaining stats
  const numericCR =
    typeof statBlock.challengeRating?.cr === 'string'
      ? parseFloat(statBlock.challengeRating.cr.replace('/', '.'))
      : statBlock.challengeRating?.cr ?? 1;

  // Estimate ability scores
  const creatureType = statBlock.creatureType ?? CreatureType.HUMANOID;
  statBlock.abilityScores = estimateAbilityScores(numericCR, creatureType, modifiers);
  extracted.push('abilityScores (estimated)');

  // Estimate AC
  statBlock.armorClass = estimateAC(numericCR, creatureType);
  extracted.push('armorClass (estimated)');

  // Estimate HP
  statBlock.hitPoints = estimateHP(numericCR, statBlock.size ?? CreatureSize.MEDIUM);
  extracted.push('hitPoints (estimated)');

  // Estimate speed
  statBlock.speed = estimateSpeed(creatureType, statBlock.size ?? CreatureSize.MEDIUM, movement);
  extracted.push('speed');

  // Default senses
  statBlock.senses = {
    specialSenses: [],
    passivePerception: 10 + Math.floor(((statBlock.abilityScores.WIS ?? 10) - 10) / 2),
  };
  extracted.push('senses (default)');

  // Default languages
  statBlock.languages = creatureType === CreatureType.BEAST ? [] : ['Common'];
  extracted.push('languages (default)');

  // Generate attacks
  if (weapons.length > 0) {
    statBlock.attacks = createAttacks(weapons, numericCR, statBlock.abilityScores);
    extracted.push('attacks');
  } else {
    // Create default natural attack
    const defaultWeapon: ExtractedWeapon = {
      name: creatureType === CreatureType.BEAST ? 'Bite' : 'Slam',
      isRanged: false,
      isMagical: false,
    };
    statBlock.attacks = createAttacks([defaultWeapon], numericCR, statBlock.abilityScores);
    extracted.push('attacks (default)');
    suggestions.push('Specify weapons (e.g., "with a greataxe", "claws and bite")');
  }

  // Add legendary actions if applicable
  if (modifiers.isLegendary) {
    statBlock.legendaryActions = createLegendaryActions(statBlock.name);
    statBlock.legendaryResistance = { count: 3 };
    extracted.push('legendaryActions');
    extracted.push('legendaryResistance');
  }

  // Add traits based on type
  const traits: Trait[] = [];

  if (modifiers.isSwarm) {
    traits.push({
      name: 'Swarm',
      description:
        "The swarm can occupy another creature's space and vice versa, and the swarm can move through any opening large enough for a single creature. The swarm can't regain hit points or gain temporary hit points.",
    });
  }

  if (creatureType === CreatureType.UNDEAD) {
    traits.push({
      name: 'Undead Fortitude',
      description:
        'If damage reduces the creature to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the creature drops to 1 hit point instead.',
    });
  }

  if (movement.flies && !movement.hovers && creatureType === CreatureType.DRAGON) {
    traits.push({
      name: 'Flyby',
      description:
        "The creature doesn't provoke opportunity attacks when it flies out of an enemy's reach.",
    });
  }

  if (traits.length > 0) {
    statBlock.traits = traits;
    extracted.push('traits');
  }

  // Calculate confidence based on extraction success
  const requiredFields = ['challengeRating', 'creatureType', 'size'];
  const extractedRequired = requiredFields.filter((f) => extracted.some((e) => e.startsWith(f)));
  const confidence = (extractedRequired.length / requiredFields.length) * 0.7 + 0.3; // Base 0.3 + up to 0.7

  return {
    statBlock,
    confidence: Math.min(1, confidence),
    extracted,
    missing,
    suggestions,
  };
}

/**
 * Estimates and fills missing stats for a partial DnD5eMonster.
 * Useful for completing partially extracted monsters.
 *
 * @param partial - Partial monster with some fields filled
 * @returns Complete monster with all required fields estimated
 *
 * @example
 * ```typescript
 * const partial = { name: "Orc", creatureType: CreatureType.HUMANOID };
 * const complete = estimateMissingStats(partial);
 * console.log(complete.armorClass); // { value: 13, armorType: "natural armor" }
 * ```
 */
export function estimateMissingStats(partial: Partial<DnD5eMonster>): DnD5eMonster {
  // Determine defaults
  const cr = partial.challengeRating?.cr ?? 1;
  const numericCR = typeof cr === 'string' ? parseFloat(cr.replace('/', '.')) : cr;
  const creatureType = partial.creatureType ?? CreatureType.HUMANOID;
  const size = partial.size ?? CreatureSize.MEDIUM;

  // Create modifiers from any traits/legendary info
  const modifiers: ExtractedModifiers = {
    isLegendary: !!partial.legendaryActions,
    isSwarm: partial.traits?.some((t) => t.name.toLowerCase() === 'swarm') ?? false,
    isLeader: false,
    isMythic: !!partial.mythicActions,
    isPowerful: numericCR >= 10,
    isWeak: numericCR < 1,
    isElite: false,
    isBoss: numericCR >= 17,
  };

  // Fill in all required fields
  const monster: DnD5eMonster = {
    name: partial.name ?? 'Unknown Creature',
    size,
    creatureType,
    alignment: partial.alignment ?? SpecialAlignment.UNALIGNED,
    armorClass: partial.armorClass ?? estimateAC(numericCR, creatureType),
    hitPoints: partial.hitPoints ?? estimateHP(numericCR, size),
    speed: partial.speed ?? estimateSpeed(creatureType, size, {
      flies: false,
      swims: false,
      burrows: false,
      climbs: false,
      hovers: false,
    }),
    abilityScores: partial.abilityScores ?? estimateAbilityScores(numericCR, creatureType, modifiers),
    senses: partial.senses ?? {
      specialSenses: [],
      passivePerception: 10,
    },
    languages: partial.languages ?? (creatureType === CreatureType.BEAST ? [] : ['Common']),
    challengeRating: partial.challengeRating ?? { cr: 1, xp: 200 },
    proficiencyBonus: partial.proficiencyBonus ?? calculateProficiencyBonus(numericCR),
  };

  // Copy optional fields
  if (partial.subtypes) monster.subtypes = partial.subtypes;
  if (partial.savingThrows) monster.savingThrows = partial.savingThrows;
  if (partial.skills) monster.skills = partial.skills;
  if (partial.damageModifiers) monster.damageModifiers = partial.damageModifiers;
  if (partial.conditionImmunities) monster.conditionImmunities = partial.conditionImmunities;
  if (partial.traits) monster.traits = partial.traits;
  if (partial.spellcasting) monster.spellcasting = partial.spellcasting;
  if (partial.multiattack) monster.multiattack = partial.multiattack;
  if (partial.attacks) monster.attacks = partial.attacks;
  if (partial.actions) monster.actions = partial.actions;
  if (partial.bonusActions) monster.bonusActions = partial.bonusActions;
  if (partial.reactions) monster.reactions = partial.reactions;
  if (partial.legendaryActions) monster.legendaryActions = partial.legendaryActions;
  if (partial.legendaryResistance) monster.legendaryResistance = partial.legendaryResistance;
  if (partial.lairActions) monster.lairActions = partial.lairActions;
  if (partial.mythicActions) monster.mythicActions = partial.mythicActions;
  if (partial.source) monster.source = partial.source;
  if (partial.sourcePage) monster.sourcePage = partial.sourcePage;
  if (partial.environments) monster.environments = partial.environments;
  if (partial.notes) monster.notes = partial.notes;
  if (partial.id) monster.id = partial.id;

  return monster;
}

/**
 * Merges natural language parse results with a structured stat block.
 * Useful for hybrid parsing where some data comes from NL and some from structured input.
 *
 * @param nlResult - Result from parseNaturalLanguage
 * @param structured - Parsed stat block from statBlockParser
 * @returns Merged monster with NL data filling gaps
 */
export function mergeWithStructured(
  nlResult: NLParseResult,
  structured: Partial<DnD5eMonster>
): DnD5eMonster {
  // Structured data takes precedence
  const merged: Partial<DnD5eMonster> = {
    ...nlResult.statBlock,
    ...structured,
  };

  // Fill any remaining gaps
  return estimateMissingStats(merged);
}
