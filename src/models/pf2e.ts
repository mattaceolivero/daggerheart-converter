/**
 * Pathfinder 2e Stat Block Data Model
 *
 * Comprehensive TypeScript interfaces and enums for representing
 * Pathfinder 2nd Edition creature stat blocks. This serves as an
 * alternate INPUT format for conversion to Daggerheart adversary stat blocks.
 *
 * @module pf2e
 * @version 1.0.0
 */

// ============================================================================
// ENUMS - Size, Rarity, Alignment
// ============================================================================

/**
 * Creature size categories in Pathfinder 2e.
 */
export enum PF2eSize {
  TINY = 'Tiny',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  HUGE = 'Huge',
  GARGANTUAN = 'Gargantuan',
}

/**
 * Rarity levels in Pathfinder 2e.
 */
export enum PF2eRarity {
  COMMON = 'Common',
  UNCOMMON = 'Uncommon',
  RARE = 'Rare',
  UNIQUE = 'Unique',
}

/**
 * Alignment in Pathfinder 2e (same as traditional 9-point alignment).
 */
export enum PF2eAlignment {
  LG = 'LG',
  NG = 'NG',
  CG = 'CG',
  LN = 'LN',
  N = 'N',
  CN = 'CN',
  LE = 'LE',
  NE = 'NE',
  CE = 'CE',
  NO_ALIGNMENT = 'No Alignment',
}

// ============================================================================
// ENUMS - Damage Types
// ============================================================================

/**
 * Damage types in Pathfinder 2e.
 */
export enum PF2eDamageType {
  // Physical
  BLUDGEONING = 'Bludgeoning',
  PIERCING = 'Piercing',
  SLASHING = 'Slashing',
  // Energy
  ACID = 'Acid',
  COLD = 'Cold',
  ELECTRICITY = 'Electricity',
  FIRE = 'Fire',
  SONIC = 'Sonic',
  // Alignment
  CHAOTIC = 'Chaotic',
  EVIL = 'Evil',
  GOOD = 'Good',
  LAWFUL = 'Lawful',
  // Other
  FORCE = 'Force',
  MENTAL = 'Mental',
  NEGATIVE = 'Negative',
  POISON = 'Poison',
  POSITIVE = 'Positive',
  BLEED = 'Bleed',
  PRECISION = 'Precision',
  SPIRIT = 'Spirit',
}

// ============================================================================
// ENUMS - Conditions
// ============================================================================

/**
 * Common conditions in Pathfinder 2e.
 */
export enum PF2eCondition {
  BLINDED = 'Blinded',
  CLUMSY = 'Clumsy',
  CONCEALED = 'Concealed',
  CONFUSED = 'Confused',
  CONTROLLED = 'Controlled',
  DAZZLED = 'Dazzled',
  DEAFENED = 'Deafened',
  DOOMED = 'Doomed',
  DRAINED = 'Drained',
  DYING = 'Dying',
  ENCUMBERED = 'Encumbered',
  ENFEEBLED = 'Enfeebled',
  FASCINATED = 'Fascinated',
  FATIGUED = 'Fatigued',
  FLAT_FOOTED = 'Flat-Footed',
  FLEEING = 'Fleeing',
  FRIGHTENED = 'Frightened',
  GRABBED = 'Grabbed',
  HIDDEN = 'Hidden',
  IMMOBILIZED = 'Immobilized',
  INVISIBLE = 'Invisible',
  OBSERVED = 'Observed',
  PARALYZED = 'Paralyzed',
  PERSISTENT_DAMAGE = 'Persistent Damage',
  PETRIFIED = 'Petrified',
  PRONE = 'Prone',
  QUICKENED = 'Quickened',
  RESTRAINED = 'Restrained',
  SICKENED = 'Sickened',
  SLOWED = 'Slowed',
  STUNNED = 'Stunned',
  STUPEFIED = 'Stupefied',
  UNCONSCIOUS = 'Unconscious',
  UNDETECTED = 'Undetected',
  UNNOTICED = 'Unnoticed',
  WOUNDED = 'Wounded',
}

// ============================================================================
// ENUMS - Senses
// ============================================================================

/**
 * Special senses in Pathfinder 2e.
 */
export enum PF2eSenseType {
  DARKVISION = 'Darkvision',
  GREATER_DARKVISION = 'Greater Darkvision',
  LOW_LIGHT_VISION = 'Low-Light Vision',
  SCENT = 'Scent',
  TREMORSENSE = 'Tremorsense',
  TRUESIGHT = 'Truesight',
  WAVESENSE = 'Wavesense',
  ECHOLOCATION = 'Echolocation',
  LIFESENSE = 'Lifesense',
  THOUGHTSENSE = 'Thoughtsense',
}

// ============================================================================
// ENUMS - Abilities
// ============================================================================

/**
 * The six ability scores in Pathfinder 2e.
 */
export enum PF2eAbilityScore {
  STRENGTH = 'Str',
  DEXTERITY = 'Dex',
  CONSTITUTION = 'Con',
  INTELLIGENCE = 'Int',
  WISDOM = 'Wis',
  CHARISMA = 'Cha',
}

// ============================================================================
// ENUMS - Skills
// ============================================================================

/**
 * Skills in Pathfinder 2e.
 */
export enum PF2eSkill {
  ACROBATICS = 'Acrobatics',
  ARCANA = 'Arcana',
  ATHLETICS = 'Athletics',
  CRAFTING = 'Crafting',
  DECEPTION = 'Deception',
  DIPLOMACY = 'Diplomacy',
  INTIMIDATION = 'Intimidation',
  LORE = 'Lore',
  MEDICINE = 'Medicine',
  NATURE = 'Nature',
  OCCULTISM = 'Occultism',
  PERFORMANCE = 'Performance',
  RELIGION = 'Religion',
  SOCIETY = 'Society',
  STEALTH = 'Stealth',
  SURVIVAL = 'Survival',
  THIEVERY = 'Thievery',
}

// ============================================================================
// INTERFACES - Basic Components
// ============================================================================

/**
 * A special sense with optional range.
 */
export interface PF2eSense {
  type: PF2eSenseType;
  /** Range in feet, if applicable (e.g., scent 30 feet). */
  range?: number;
  /** Whether precise or imprecise. */
  precision?: 'precise' | 'imprecise' | 'vague';
}

/**
 * Perception entry.
 */
export interface PF2ePerception {
  /** Perception modifier. */
  modifier: number;
  /** Special senses. */
  senses: PF2eSense[];
}

/**
 * Language entry with optional notes.
 */
export interface PF2eLanguage {
  name: string;
  /** Whether the creature can't speak. */
  cantSpeak?: boolean;
}

/**
 * Speed entry for a movement type.
 */
export interface PF2eSpeed {
  /** Base land speed in feet. */
  land?: number;
  /** Fly speed in feet. */
  fly?: number;
  /** Swim speed in feet. */
  swim?: number;
  /** Climb speed in feet. */
  climb?: number;
  /** Burrow speed in feet. */
  burrow?: number;
  /** Special movement notes. */
  special?: string;
}

/**
 * Saving throw modifiers.
 */
export interface PF2eSaves {
  fortitude: number;
  reflex: number;
  will: number;
  /** Additional save modifiers or special conditions. */
  notes?: string;
}

/**
 * Skill entry with modifier.
 */
export interface PF2eSkillEntry {
  skill: PF2eSkill;
  modifier: number;
  /** Specialization for Lore skills. */
  specialization?: string;
}

/**
 * Ability modifier set.
 */
export interface PF2eAbilityModifiers {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

// ============================================================================
// INTERFACES - Damage Modifiers
// ============================================================================

/**
 * Weakness entry (takes extra damage from this type).
 */
export interface PF2eWeakness {
  type: PF2eDamageType | string;
  value: number;
}

/**
 * Resistance entry (reduces damage from this type).
 */
export interface PF2eResistance {
  type: PF2eDamageType | string;
  value: number;
  /** Exception conditions. */
  exceptions?: string[];
}

/**
 * Immunity entry.
 */
export interface PF2eImmunity {
  type: PF2eDamageType | PF2eCondition | string;
}

// ============================================================================
// INTERFACES - Actions and Abilities
// ============================================================================

/**
 * Action cost in PF2e (1-3 actions, free action, or reaction).
 */
export enum PF2eActionCost {
  FREE = 'Free Action',
  REACTION = 'Reaction',
  ONE = '1',
  TWO = '2',
  THREE = '3',
}

/**
 * Dice expression for damage or effects.
 */
export interface PF2eDiceExpression {
  count: number;
  dieSize: 4 | 6 | 8 | 10 | 12 | 20;
  modifier: number;
}

/**
 * Attack damage entry.
 */
export interface PF2eAttackDamage {
  dice: PF2eDiceExpression;
  damageType: PF2eDamageType;
  /** Additional damage entries. */
  additional?: PF2eAttackDamage[];
}

/**
 * A PF2e Strike (melee or ranged attack).
 */
export interface PF2eStrike {
  name: string;
  /** Attack modifier. */
  modifier: number;
  /** Traits (e.g., agile, reach, deadly). */
  traits: string[];
  /** Damage dealt. */
  damage: PF2eAttackDamage;
  /** Additional effects on hit. */
  effects?: string;
}

/**
 * A general ability or action.
 */
export interface PF2eCreatureAbility {
  name: string;
  /** Action cost. */
  actionCost?: PF2eActionCost;
  /** Traits for the ability. */
  traits?: string[];
  /** Description of the ability. */
  description: string;
  /** Frequency limitation (e.g., "once per day"). */
  frequency?: string;
  /** Trigger for reactions. */
  trigger?: string;
  /** Requirements to use the ability. */
  requirements?: string;
  /** Effect text. */
  effect?: string;
  /** Critical success effect. */
  criticalSuccess?: string;
  /** Success effect. */
  success?: string;
  /** Failure effect. */
  failure?: string;
  /** Critical failure effect. */
  criticalFailure?: string;
  /** Save DC if applicable. */
  saveDC?: {
    type: 'fortitude' | 'reflex' | 'will' | 'basic';
    dc: number;
  };
}

/**
 * Spellcasting entry for a creature.
 */
export interface PF2eSpellcasting {
  /** Tradition (arcane, divine, occult, primal). */
  tradition: 'arcane' | 'divine' | 'occult' | 'primal';
  /** Type of spellcasting. */
  type: 'prepared' | 'spontaneous' | 'innate' | 'focus';
  /** Spell DC. */
  dc: number;
  /** Spell attack modifier. */
  attack?: number;
  /** Focus points if applicable. */
  focusPoints?: number;
  /** Spells by level (0 = cantrips). */
  spells: {
    level: number;
    slots?: number;
    spellNames: string[];
  }[];
}

// ============================================================================
// MAIN INTERFACE - PF2e Creature
// ============================================================================

/**
 * Complete Pathfinder 2e creature stat block.
 */
export interface PF2eStatBlock {
  // === Identity ===
  /** Creature name. */
  name: string;
  /** Creature level (-1 to 25+). */
  level: number;
  /** Traits (creature type, alignment, size, rarity, and other traits). */
  traits: string[];
  /** Rarity level. */
  rarity: PF2eRarity;
  /** Size category. */
  size: PF2eSize;
  /** Alignment (if applicable). */
  alignment?: PF2eAlignment;

  // === Perception and Senses ===
  perception: PF2ePerception;

  // === Languages ===
  languages: PF2eLanguage[];

  // === Skills ===
  skills: PF2eSkillEntry[];

  // === Ability Modifiers ===
  abilities: PF2eAbilityModifiers;

  // === Defense ===
  /** Armor Class. */
  ac: number;
  /** Saving throws. */
  saves: PF2eSaves;
  /** Hit Points. */
  hp: number;
  /** Hardness if applicable (constructs). */
  hardness?: number;
  /** Immunities. */
  immunities: PF2eImmunity[];
  /** Resistances. */
  resistances: PF2eResistance[];
  /** Weaknesses. */
  weaknesses: PF2eWeakness[];

  // === Speeds ===
  speed: PF2eSpeed;

  // === Attacks ===
  /** Melee strikes. */
  melee: PF2eStrike[];
  /** Ranged strikes. */
  ranged: PF2eStrike[];

  // === Spellcasting ===
  spellcasting?: PF2eSpellcasting[];

  // === Abilities ===
  /** Passive/automatic abilities (no action cost). */
  passiveAbilities?: PF2eCreatureAbility[];
  /** Active abilities and actions. */
  activeAbilities?: PF2eCreatureAbility[];

  // === Metadata ===
  /** Source book. */
  source?: string;
  /** Page number. */
  sourcePage?: number;
  /** Description/flavor text. */
  description?: string;
}

// ============================================================================
// LEVEL TO TIER MAPPING
// ============================================================================

/**
 * Maps PF2e level to Daggerheart Tier.
 *
 * | PF2e Level | Daggerheart Tier |
 * |------------|------------------|
 * | -1 to 2    | Tier 1           |
 * | 3 to 7     | Tier 2           |
 * | 8 to 14    | Tier 3           |
 * | 15+        | Tier 4           |
 */
export const PF2E_LEVEL_TO_TIER: ReadonlyArray<{ maxLevel: number; tier: 1 | 2 | 3 | 4 }> = [
  { maxLevel: 2, tier: 1 },
  { maxLevel: 7, tier: 2 },
  { maxLevel: 14, tier: 3 },
  { maxLevel: Infinity, tier: 4 },
] as const;

/**
 * Converts PF2e level to Daggerheart Tier.
 *
 * @param level - PF2e creature level (-1 to 25+)
 * @returns Daggerheart Tier (1-4)
 */
export function pf2eLevelToTier(level: number): 1 | 2 | 3 | 4 {
  for (const breakpoint of PF2E_LEVEL_TO_TIER) {
    if (level <= breakpoint.maxLevel) {
      return breakpoint.tier;
    }
  }
  return 4;
}

// ============================================================================
// PF2E TO DND5E CR APPROXIMATION
// ============================================================================

/**
 * Approximates a D&D 5e Challenge Rating from PF2e level.
 * This is a rough conversion for the adapter pattern.
 *
 * The relationship is not linear - PF2e levels are more granular.
 *
 * @param level - PF2e creature level
 * @returns Approximate D&D 5e CR
 */
export function pf2eLevelToCR(level: number): number | string {
  if (level <= -1) return 0;
  if (level === 0) return '1/8';
  if (level === 1) return '1/4';
  if (level === 2) return '1/2';
  if (level === 3) return 1;
  if (level <= 5) return level - 1;
  if (level <= 10) return level;
  if (level <= 15) return level + 2;
  if (level <= 20) return level + 5;
  return Math.min(30, level + 8);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if value is a valid PF2eSize.
 */
export function isPF2eSize(value: unknown): value is PF2eSize {
  return Object.values(PF2eSize).includes(value as PF2eSize);
}

/**
 * Type guard to check if value is a valid PF2eRarity.
 */
export function isPF2eRarity(value: unknown): value is PF2eRarity {
  return Object.values(PF2eRarity).includes(value as PF2eRarity);
}

/**
 * Type guard to check if value is a valid PF2eActionCost.
 */
export function isPF2eActionCost(value: unknown): value is PF2eActionCost {
  return Object.values(PF2eActionCost).includes(value as PF2eActionCost);
}

/**
 * Type guard to check if an object is a minimal PF2eStatBlock.
 */
export function isMinimalPF2eStatBlock(obj: unknown): obj is Pick<
  PF2eStatBlock,
  'name' | 'level' | 'traits' | 'ac' | 'hp' | 'saves'
> {
  if (typeof obj !== 'object' || obj === null) return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.name === 'string' &&
    typeof s.level === 'number' &&
    Array.isArray(s.traits) &&
    typeof s.ac === 'number' &&
    typeof s.hp === 'number' &&
    typeof s.saves === 'object'
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default PF2eStatBlock;
