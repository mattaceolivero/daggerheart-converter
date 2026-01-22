/**
 * Daggerheart Adversary Data Model
 *
 * Comprehensive TypeScript interfaces and enums for representing
 * Daggerheart adversary stat blocks, including all fields required
 * for conversion from D&D 5e and other RPG systems.
 *
 * @module daggerheart
 * @version 1.0.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Adversary tier representing power level (1-4).
 * Higher tiers indicate more powerful adversaries.
 *
 * - Tier 1: CR 0-2 equivalents, beginner-level threats
 * - Tier 2: CR 3-6 equivalents, moderate challenges
 * - Tier 3: CR 7-12 equivalents, serious threats
 * - Tier 4: CR 13+ equivalents, legendary dangers
 */
export enum Tier {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

/**
 * Adversary type classification determining combat role and behavior.
 * Each type has different stat expectations and feature patterns.
 */
export enum AdversaryType {
  /** Weak enemies, 1 HP, die in one hit. Used for large groups. */
  MINION = 'Minion',
  /** Basic adversary with balanced stats. Most common type. */
  STANDARD = 'Standard',
  /** Stealthy, cunning adversary focused on ambush tactics. */
  SKULK = 'Skulk',
  /** High damage dealer with moderate defense. */
  BRUISER = 'Bruiser',
  /** Attacks from distance, avoids melee combat. */
  RANGED = 'Ranged',
  /** Buffs allies and debuffs enemies. Low direct threat. */
  SUPPORT = 'Support',
  /** Commands other adversaries, provides battlefield control. */
  LEADER = 'Leader',
  /** Group that acts as one unit, weakens when damaged. */
  HORDE = 'Horde',
  /** Boss monster, can act multiple times, high HP. */
  SOLO = 'Solo',
  /** Non-combat focused, social encounter adversary. */
  SOCIAL = 'Social',
  /** Grouped weaker enemies acting as a swarm. */
  SWARM = 'Swarm',
}

/**
 * Difficulty classification affecting damage thresholds and stats.
 */
export enum Difficulty {
  /** Lower thresholds, easier to damage. */
  MINOR = 'Minor',
  /** Standard thresholds for the tier. */
  MAJOR = 'Major',
  /** Higher thresholds, harder to damage significantly. */
  SEVERE = 'Severe',
}

/**
 * Damage type in Daggerheart - simplified from D&D's many types.
 */
export enum DamageType {
  /** Natural weapons, manufactured weapons, non-magical attacks. */
  PHYSICAL = 'phy',
  /** Spells, magical effects, supernatural abilities. */
  MAGIC = 'mag',
}

/**
 * Feature type classification for adversary abilities.
 */
export enum FeatureType {
  /** Always active, no action required. */
  PASSIVE = 'Passive',
  /** Requires adversary spotlight/action to use. */
  ACTION = 'Action',
  /** Triggered by specific conditions, used without spotlight. */
  REACTION = 'Reaction',
}

/**
 * Cost type for using features.
 */
export enum FeatureCostType {
  /** No cost to use. */
  NONE = 'None',
  /** Costs Stress to use. */
  STRESS = 'Stress',
  /** Costs Fear (GM resource) to use. */
  FEAR = 'Fear',
}

/**
 * Daggerheart range bands for attacks and abilities.
 */
export enum RangeBand {
  /** Within arm's reach, melee distance. */
  MELEE = 'Melee',
  /** Within a few steps, ~10 feet. */
  VERY_CLOSE = 'Very Close',
  /** Nearby, ~30 feet. */
  CLOSE = 'Close',
  /** Moderate distance, ~60 feet. */
  FAR = 'Far',
  /** Long distance, ~120+ feet. */
  VERY_FAR = 'Very Far',
}

/**
 * Common conditions that can affect targets.
 */
export enum Condition {
  /** Cannot be targeted by attacks. */
  HIDDEN = 'Hidden',
  /** Cannot move from current position. */
  RESTRAINED = 'Restrained',
  /** Takes increased damage from attacks. */
  VULNERABLE = 'Vulnerable',
  /** Confused, GM suggests actions. */
  DISORIENTED = 'Disoriented',
  /** Cannot take actions. */
  INCAPACITATED = 'Incapacitated',
  /** Being digested/absorbed by creature. */
  SWALLOWED = 'Swallowed',
  /** Moving away from fear source. */
  FRIGHTENED = 'Frightened',
  /** Under magical control. */
  CHARMED = 'Charmed',
}

/**
 * Attribute types used for Reaction Rolls.
 */
export enum Attribute {
  STRENGTH = 'Strength',
  AGILITY = 'Agility',
  FINESSE = 'Finesse',
  INSTINCT = 'Instinct',
  PRESENCE = 'Presence',
  KNOWLEDGE = 'Knowledge',
}

// ============================================================================
// INTERFACES - Feature Components
// ============================================================================

/**
 * Represents the cost to use an adversary feature.
 */
export interface FeatureCost {
  /** Type of cost (None, Stress, or Fear). */
  type: FeatureCostType;
  /** Amount of the resource required (default 1 if not specified). */
  amount?: number;
}

/**
 * Represents a trigger condition for Reaction features.
 */
export interface ReactionTrigger {
  /** Human-readable description of what triggers this reaction. */
  description: string;
  /** Optional: specific conditions that must be met. */
  conditions?: string[];
}

/**
 * Represents an adversary feature (ability).
 */
export interface Feature {
  /** Name of the feature. */
  name: string;
  /** Type: Passive, Action, or Reaction. */
  type: FeatureType;
  /** Full description of what the feature does. */
  description: string;
  /** Cost to use this feature (optional, defaults to free). */
  cost?: FeatureCost;
  /** For Reaction features, what triggers them. */
  trigger?: ReactionTrigger;
  /** Optional: target type or area affected. */
  target?: string;
  /** Optional: attribute for any required Reaction Roll. */
  reactionRollAttribute?: Attribute;
  /** Optional: difficulty for any required Reaction Roll. */
  reactionRollDifficulty?: number;
  /** Optional: conditions applied by this feature. */
  appliedConditions?: Condition[];
  /** Optional: damage dealt by this feature. */
  damage?: DamageExpression;
}

// ============================================================================
// INTERFACES - Damage Components
// ============================================================================

/**
 * Represents a damage dice expression (e.g., "2d8+3").
 */
export interface DamageExpression {
  /** Number of dice to roll. */
  diceCount: number;
  /** Size of dice (d4, d6, d8, d10, d12). */
  diceSize: 4 | 6 | 8 | 10 | 12;
  /** Flat modifier added to the roll. */
  modifier: number;
  /** Type of damage (Physical or Magic). */
  damageType: DamageType;
  /** Whether this is direct damage (bypasses thresholds). */
  isDirect?: boolean;
}

/**
 * Represents an adversary's primary attack.
 */
export interface Attack {
  /** Name of the attack (e.g., "Bite", "Claw", "Sword"). */
  name: string;
  /** Attack bonus modifier. */
  modifier: number;
  /** Range of the attack. */
  range: RangeBand;
  /** Damage dealt on a successful hit. */
  damage: DamageExpression;
  /** Optional: additional effects on hit. */
  additionalEffects?: string;
}

// ============================================================================
// INTERFACES - Threshold and Stats
// ============================================================================

/**
 * Damage thresholds for determining HP loss.
 *
 * - Below Minor: 0 HP marked
 * - Minor to Major-1: 1 HP marked
 * - Major to Severe-1: 2 HP marked
 * - Severe+: 3 HP marked
 */
export interface DamageThresholds {
  /** Damage needed to mark 1 HP (Minor threshold). */
  minor: number;
  /** Damage needed to mark 2 HP (Major threshold). */
  major: number;
  /** Damage needed to mark 3 HP (Severe threshold). */
  severe: number;
}

/**
 * Experience topics that provide bonuses in specific situations.
 * Format: "Topic +X" where X is typically 1-3.
 */
export interface Experience {
  /** The topic/domain of expertise (e.g., "Shadows", "Predator", "Magic"). */
  topic: string;
  /** Bonus value (typically 1-3). */
  bonus: number;
}

// ============================================================================
// INTERFACES - Narrative Elements
// ============================================================================

/**
 * Motives and tactics describing adversary behavior.
 */
export interface MotivesAndTactics {
  /** Short verb phrases describing what drives the creature (3-6 items). */
  phrases: string[];
  /** Optional expanded description of behavior patterns. */
  expandedDescription?: string;
}

/**
 * Descriptive text for the adversary.
 */
export interface AdversaryDescription {
  /** Short evocative description (1-2 sentences). */
  shortDescription: string;
  /** Optional longer lore/background text. */
  lore?: string;
  /** Optional physical description details. */
  appearance?: string;
}

// ============================================================================
// INTERFACES - Special Abilities
// ============================================================================

/**
 * Relentless feature for Solo adversaries.
 * Allows multiple actions per round.
 */
export interface RelentlessFeature {
  /** Whether this adversary has Relentless. */
  hasRelentless: boolean;
  /** Number of times the adversary can act per round. */
  actionsPerRound?: number;
}

/**
 * Horde feature for group adversaries.
 * Damage reduces as HP is lost.
 */
export interface HordeFeature {
  /** Whether this adversary uses Horde rules. */
  isHorde: boolean;
  /** Starting damage dice expression. */
  startingDamage?: DamageExpression;
  /** Reduced damage dice expression when at half HP or less. */
  reducedDamage?: DamageExpression;
  /** HP threshold at which damage reduces. */
  threshold?: number;
}

/**
 * Movement capabilities and restrictions.
 */
export interface Movement {
  /** Standard movement range band. */
  standard: RangeBand;
  /** Whether the adversary can fly. */
  canFly?: boolean;
  /** Whether the adversary can swim. */
  canSwim?: boolean;
  /** Whether the adversary can climb. */
  canClimb?: boolean;
  /** Whether the adversary can burrow. */
  canBurrow?: boolean;
  /** Whether the adversary can teleport. */
  canTeleport?: boolean;
  /** Special movement notes. */
  special?: string;
}

// ============================================================================
// MAIN INTERFACE - Daggerheart Adversary
// ============================================================================

/**
 * Complete Daggerheart adversary stat block.
 *
 * This is the main interface representing a fully-defined
 * Daggerheart adversary ready for use in play.
 */
export interface DaggerheartAdversary {
  // === Identity ===
  /** Unique identifier for this adversary. */
  id?: string;
  /** Name of the adversary. */
  name: string;
  /** Power level (1-4). */
  tier: Tier;
  /** Combat role classification. */
  type: AdversaryType;
  /** Difficulty classification affecting thresholds. */
  difficulty?: Difficulty;

  // === Core Statistics ===
  /** Target number PCs roll against (typically 8-22). */
  evasion: number;
  /** Damage thresholds for HP loss calculation. */
  thresholds: DamageThresholds;
  /** Total hit points. */
  hp: number;
  /** Stress resource for special abilities. */
  stress: number;

  // === Combat Statistics ===
  /** Primary attack information. */
  attack: Attack;
  /** Additional attacks if any. */
  additionalAttacks?: Attack[];
  /** Movement capabilities. */
  movement?: Movement;

  // === Features ===
  /** All features (Passive, Action, Reaction). */
  features: Feature[];
  /** Relentless capability for Solo adversaries. */
  relentless?: RelentlessFeature;
  /** Horde mechanics for group adversaries. */
  horde?: HordeFeature;

  // === Narrative Elements ===
  /** Evocative description of the adversary. */
  description: AdversaryDescription;
  /** Short verb phrases describing behavior. */
  motivesAndTactics: MotivesAndTactics;
  /** Expertise topics with bonuses. */
  experience: Experience[];

  // === Metadata ===
  /** Tags for categorization. */
  tags?: string[];
  /** Source system if converted (e.g., "D&D 5e"). */
  sourceSystem?: string;
  /** Original CR/level if converted. */
  sourceCR?: number | string;
  /** Notes about conversion decisions. */
  conversionNotes?: string;
  /** Date created/modified. */
  createdAt?: Date;
  /** Version of this stat block. */
  version?: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation result for a single field.
 */
export interface FieldValidation {
  /** Name of the field being validated. */
  field: string;
  /** Whether the field passed validation. */
  isValid: boolean;
  /** Error message if validation failed. */
  errorMessage?: string;
  /** Warning message for non-critical issues. */
  warningMessage?: string;
}

/**
 * Complete validation result for an adversary.
 */
export interface AdversaryValidation {
  /** Whether the entire adversary is valid. */
  isValid: boolean;
  /** Individual field validation results. */
  fieldResults: FieldValidation[];
  /** Summary of all errors. */
  errors: string[];
  /** Summary of all warnings. */
  warnings: string[];
}

// ============================================================================
// BUILDER/PARTIAL TYPES
// ============================================================================

/**
 * Partial adversary for building/editing.
 * All fields are optional for incremental construction.
 */
export type PartialDaggerheartAdversary = Partial<DaggerheartAdversary>;

/**
 * Minimal required fields for a valid adversary.
 */
export interface MinimalAdversary {
  name: string;
  tier: Tier;
  type: AdversaryType;
  evasion: number;
  thresholds: DamageThresholds;
  hp: number;
  stress: number;
  attack: Attack;
  features: Feature[];
  description: AdversaryDescription;
  motivesAndTactics: MotivesAndTactics;
  experience: Experience[];
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid Tier.
 */
export function isTier(value: unknown): value is Tier {
  return typeof value === 'number' && value >= 1 && value <= 4;
}

/**
 * Type guard to check if a value is a valid AdversaryType.
 */
export function isAdversaryType(value: unknown): value is AdversaryType {
  return Object.values(AdversaryType).includes(value as AdversaryType);
}

/**
 * Type guard to check if a value is a valid DamageType.
 */
export function isDamageType(value: unknown): value is DamageType {
  return value === DamageType.PHYSICAL || value === DamageType.MAGIC;
}

/**
 * Type guard to check if a value is a valid FeatureType.
 */
export function isFeatureType(value: unknown): value is FeatureType {
  return Object.values(FeatureType).includes(value as FeatureType);
}

/**
 * Type guard to check if a value is a valid RangeBand.
 */
export function isRangeBand(value: unknown): value is RangeBand {
  return Object.values(RangeBand).includes(value as RangeBand);
}

/**
 * Type guard to check if an object is a MinimalAdversary.
 */
export function isMinimalAdversary(obj: unknown): obj is MinimalAdversary {
  if (typeof obj !== 'object' || obj === null) return false;
  const a = obj as Record<string, unknown>;
  return (
    typeof a.name === 'string' &&
    isTier(a.tier) &&
    isAdversaryType(a.type) &&
    typeof a.evasion === 'number' &&
    typeof a.thresholds === 'object' &&
    typeof a.hp === 'number' &&
    typeof a.stress === 'number' &&
    typeof a.attack === 'object' &&
    Array.isArray(a.features) &&
    typeof a.description === 'object' &&
    typeof a.motivesAndTactics === 'object' &&
    Array.isArray(a.experience)
  );
}

// ============================================================================
// TIER DEFAULTS (Reference Constants)
// ============================================================================

/**
 * Default stat ranges by tier for reference during conversion.
 */
export const TIER_DEFAULTS = {
  [Tier.ONE]: {
    evasion: { default: 11, range: [8, 13] as const },
    thresholds: { minor: [5, 7], major: [7, 12], severe: [12, 15] } as const,
    hp: { minion: 1, standard: [2, 4], bruiser: [4, 6], solo: [6, 8] } as const,
    stress: { range: [2, 3] as const },
    attackModifier: { default: 1, range: [-1, 2] as const },
    dicePool: 1,
  },
  [Tier.TWO]: {
    evasion: { default: 14, range: [12, 16] as const },
    thresholds: { minor: [7, 10], major: [10, 20], severe: [20, 28] } as const,
    hp: { minion: 1, standard: [3, 5], bruiser: [5, 7], solo: [7, 9] } as const,
    stress: { range: [3, 5] as const },
    attackModifier: { default: 2, range: [1, 3] as const },
    dicePool: 2,
  },
  [Tier.THREE]: {
    evasion: { default: 17, range: [15, 19] as const },
    thresholds: { minor: [12, 20], major: [20, 32], severe: [32, 40] } as const,
    hp: { minion: 1, standard: [4, 6], bruiser: [6, 9], solo: [9, 11] } as const,
    stress: { range: [4, 6] as const },
    attackModifier: { default: 3, range: [2, 4] as const },
    dicePool: 3,
  },
  [Tier.FOUR]: {
    evasion: { default: 20, range: [18, 22] as const },
    thresholds: { minor: [18, 25], major: [25, 45], severe: [45, 70] } as const,
    hp: { minion: 1, standard: [5, 8], bruiser: [8, 10], solo: [10, 12] } as const,
    stress: { range: [5, 10] as const },
    attackModifier: { default: 4, range: [3, 5] as const },
    dicePool: 4,
  },
} as const;

/**
 * Damage die size by adversary type.
 */
export const DAMAGE_DIE_BY_TYPE = {
  [AdversaryType.MINION]: 'flat' as const, // Flat damage 3-8 based on tier
  [AdversaryType.STANDARD]: [6, 8] as const,
  [AdversaryType.SKULK]: [6, 8] as const,
  [AdversaryType.BRUISER]: [10, 12] as const,
  [AdversaryType.RANGED]: [8, 10] as const,
  [AdversaryType.SUPPORT]: [4, 6] as const,
  [AdversaryType.LEADER]: [6, 8] as const,
  [AdversaryType.HORDE]: [8, 10] as const, // Reduces to d4-d6 when triggered
  [AdversaryType.SOLO]: [10, 12] as const,
  [AdversaryType.SOCIAL]: [4, 6] as const,
  [AdversaryType.SWARM]: [6, 8] as const,
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default DaggerheartAdversary;
