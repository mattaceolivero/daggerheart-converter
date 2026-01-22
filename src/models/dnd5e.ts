/**
 * D&D 5e Monster Stat Block Data Model
 *
 * Comprehensive TypeScript interfaces and enums for representing
 * D&D 5th Edition monster stat blocks. This serves as the INPUT format
 * for conversion to Daggerheart adversary stat blocks.
 *
 * @module dnd5e
 * @version 1.0.0
 */

// ============================================================================
// ENUMS - Size, Type, Alignment
// ============================================================================

/**
 * Monster size categories in D&D 5e.
 * Affects space occupied, carrying capacity, and grapple rules.
 */
export enum CreatureSize {
  TINY = 'Tiny',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  HUGE = 'Huge',
  GARGANTUAN = 'Gargantuan',
}

/**
 * Monster type classifications in D&D 5e.
 * Determines creature origin and affects certain spells/abilities.
 */
export enum CreatureType {
  ABERRATION = 'Aberration',
  BEAST = 'Beast',
  CELESTIAL = 'Celestial',
  CONSTRUCT = 'Construct',
  DRAGON = 'Dragon',
  ELEMENTAL = 'Elemental',
  FEY = 'Fey',
  FIEND = 'Fiend',
  GIANT = 'Giant',
  HUMANOID = 'Humanoid',
  MONSTROSITY = 'Monstrosity',
  OOZE = 'Ooze',
  PLANT = 'Plant',
  UNDEAD = 'Undead',
}

/**
 * Alignment axis: Lawful, Neutral, or Chaotic.
 */
export enum LawChaosAxis {
  LAWFUL = 'Lawful',
  NEUTRAL = 'Neutral',
  CHAOTIC = 'Chaotic',
}

/**
 * Alignment axis: Good, Neutral, or Evil.
 */
export enum GoodEvilAxis {
  GOOD = 'Good',
  NEUTRAL = 'Neutral',
  EVIL = 'Evil',
}

/**
 * Special alignment values for creatures without standard alignment.
 */
export enum SpecialAlignment {
  UNALIGNED = 'Unaligned',
  ANY = 'Any Alignment',
  ANY_EVIL = 'Any Evil Alignment',
  ANY_GOOD = 'Any Good Alignment',
  ANY_CHAOTIC = 'Any Chaotic Alignment',
  ANY_LAWFUL = 'Any Lawful Alignment',
  ANY_NON_GOOD = 'Any Non-Good Alignment',
  ANY_NON_EVIL = 'Any Non-Evil Alignment',
  ANY_NON_LAWFUL = 'Any Non-Lawful Alignment',
  ANY_NON_CHAOTIC = 'Any Non-Chaotic Alignment',
  TYPICALLY_NEUTRAL = 'Typically Neutral',
  TYPICALLY_LAWFUL_EVIL = 'Typically Lawful Evil',
  TYPICALLY_CHAOTIC_EVIL = 'Typically Chaotic Evil',
  TYPICALLY_LAWFUL_GOOD = 'Typically Lawful Good',
  TYPICALLY_CHAOTIC_GOOD = 'Typically Chaotic Good',
  TYPICALLY_NEUTRAL_EVIL = 'Typically Neutral Evil',
  TYPICALLY_NEUTRAL_GOOD = 'Typically Neutral Good',
}

// ============================================================================
// ENUMS - Damage Types
// ============================================================================

/**
 * All damage types in D&D 5e.
 */
export enum DnD5eDamageType {
  ACID = 'Acid',
  BLUDGEONING = 'Bludgeoning',
  COLD = 'Cold',
  FIRE = 'Fire',
  FORCE = 'Force',
  LIGHTNING = 'Lightning',
  NECROTIC = 'Necrotic',
  PIERCING = 'Piercing',
  POISON = 'Poison',
  PSYCHIC = 'Psychic',
  RADIANT = 'Radiant',
  SLASHING = 'Slashing',
  THUNDER = 'Thunder',
}

/**
 * Damage modifiers for resistance/immunity parsing.
 */
export enum DamageModifier {
  /** Takes half damage from this type. */
  RESISTANCE = 'Resistance',
  /** Takes no damage from this type. */
  IMMUNITY = 'Immunity',
  /** Takes double damage from this type. */
  VULNERABILITY = 'Vulnerability',
}

// ============================================================================
// ENUMS - Conditions
// ============================================================================

/**
 * All conditions in D&D 5e that can affect creatures.
 */
export enum DnD5eCondition {
  BLINDED = 'Blinded',
  CHARMED = 'Charmed',
  DEAFENED = 'Deafened',
  EXHAUSTION = 'Exhaustion',
  FRIGHTENED = 'Frightened',
  GRAPPLED = 'Grappled',
  INCAPACITATED = 'Incapacitated',
  INVISIBLE = 'Invisible',
  PARALYZED = 'Paralyzed',
  PETRIFIED = 'Petrified',
  POISONED = 'Poisoned',
  PRONE = 'Prone',
  RESTRAINED = 'Restrained',
  STUNNED = 'Stunned',
  UNCONSCIOUS = 'Unconscious',
}

// ============================================================================
// ENUMS - Senses
// ============================================================================

/**
 * Special senses available to monsters in D&D 5e.
 */
export enum SenseType {
  BLINDSIGHT = 'Blindsight',
  DARKVISION = 'Darkvision',
  TREMORSENSE = 'Tremorsense',
  TRUESIGHT = 'Truesight',
}

// ============================================================================
// ENUMS - Skills
// ============================================================================

/**
 * All skills in D&D 5e.
 */
export enum Skill {
  ACROBATICS = 'Acrobatics',
  ANIMAL_HANDLING = 'Animal Handling',
  ARCANA = 'Arcana',
  ATHLETICS = 'Athletics',
  DECEPTION = 'Deception',
  HISTORY = 'History',
  INSIGHT = 'Insight',
  INTIMIDATION = 'Intimidation',
  INVESTIGATION = 'Investigation',
  MEDICINE = 'Medicine',
  NATURE = 'Nature',
  PERCEPTION = 'Perception',
  PERFORMANCE = 'Performance',
  PERSUASION = 'Persuasion',
  RELIGION = 'Religion',
  SLEIGHT_OF_HAND = 'Sleight of Hand',
  STEALTH = 'Stealth',
  SURVIVAL = 'Survival',
}

// ============================================================================
// ENUMS - Abilities
// ============================================================================

/**
 * The six ability scores in D&D 5e.
 */
export enum AbilityScore {
  STRENGTH = 'STR',
  DEXTERITY = 'DEX',
  CONSTITUTION = 'CON',
  INTELLIGENCE = 'INT',
  WISDOM = 'WIS',
  CHARISMA = 'CHA',
}

// ============================================================================
// ENUMS - Attack Types
// ============================================================================

/**
 * Types of attacks a monster can make.
 */
export enum AttackType {
  MELEE_WEAPON = 'Melee Weapon Attack',
  RANGED_WEAPON = 'Ranged Weapon Attack',
  MELEE_SPELL = 'Melee Spell Attack',
  RANGED_SPELL = 'Ranged Spell Attack',
  MELEE_OR_RANGED_WEAPON = 'Melee or Ranged Weapon Attack',
  MELEE_OR_RANGED_SPELL = 'Melee or Ranged Spell Attack',
}

// ============================================================================
// INTERFACES - Basic Components
// ============================================================================

/**
 * Represents a standard alignment with two axes.
 */
export interface StandardAlignment {
  lawChaos: LawChaosAxis;
  goodEvil: GoodEvilAxis;
}

/**
 * Union type for all possible alignment values.
 */
export type Alignment = StandardAlignment | SpecialAlignment;

/**
 * Represents a creature's armor class with optional source.
 */
export interface ArmorClass {
  /** The AC value. */
  value: number;
  /** Optional armor type/source (e.g., "natural armor", "plate"). */
  armorType?: string;
  /** Optional additional AC sources (e.g., shield, spells). */
  additionalSources?: string[];
}

/**
 * Represents a dice expression (e.g., "2d8+4").
 */
export interface DiceExpression {
  /** Number of dice to roll. */
  count: number;
  /** Size of the die (d4, d6, d8, d10, d12, d20, d100). */
  dieSize: 4 | 6 | 8 | 10 | 12 | 20 | 100;
  /** Flat modifier to add/subtract. */
  modifier: number;
}

/**
 * Represents hit points with average and formula.
 */
export interface HitPoints {
  /** Average hit points (pre-calculated). */
  average: number;
  /** Dice formula for rolling HP. */
  formula: DiceExpression;
}

// ============================================================================
// INTERFACES - Speed
// ============================================================================

/**
 * Represents all movement speeds for a creature.
 */
export interface Speed {
  /** Base walking speed in feet. */
  walk?: number;
  /** Flying speed in feet. */
  fly?: number;
  /** Whether flying requires hovering (can't be knocked prone while flying). */
  hover?: boolean;
  /** Swimming speed in feet. */
  swim?: number;
  /** Climbing speed in feet. */
  climb?: number;
  /** Burrowing speed in feet. */
  burrow?: number;
  /** Any special movement notes. */
  special?: string;
}

// ============================================================================
// INTERFACES - Ability Scores
// ============================================================================

/**
 * Complete set of ability scores (1-30).
 */
export interface AbilityScores {
  STR: number;
  DEX: number;
  CON: number;
  INT: number;
  WIS: number;
  CHA: number;
}

/**
 * A saving throw proficiency with modifier.
 */
export interface SavingThrow {
  ability: AbilityScore;
  modifier: number;
}

/**
 * A skill proficiency with modifier.
 */
export interface SkillProficiency {
  skill: Skill;
  modifier: number;
}

// ============================================================================
// INTERFACES - Damage Modifiers
// ============================================================================

/**
 * Damage resistance/immunity/vulnerability entry.
 * Can include conditional text (e.g., "from nonmagical attacks").
 */
export interface DamageModifierEntry {
  /** The damage type affected. */
  damageType: DnD5eDamageType;
  /** Optional condition for when this applies. */
  condition?: string;
}

/**
 * Complete damage resistances, immunities, and vulnerabilities.
 */
export interface DamageModifiers {
  /** Damage types the creature is vulnerable to (takes double damage). */
  vulnerabilities: DamageModifierEntry[];
  /** Damage types the creature resists (takes half damage). */
  resistances: DamageModifierEntry[];
  /** Damage types the creature is immune to (takes no damage). */
  immunities: DamageModifierEntry[];
}

// ============================================================================
// INTERFACES - Senses
// ============================================================================

/**
 * A special sense with range.
 */
export interface Sense {
  type: SenseType;
  /** Range in feet. */
  range: number;
  /** Whether blindsight is blind beyond that range. */
  blindBeyond?: boolean;
}

/**
 * Complete sensory information for a creature.
 */
export interface Senses {
  /** List of special senses. */
  specialSenses: Sense[];
  /** Passive Perception score. */
  passivePerception: number;
}

// ============================================================================
// INTERFACES - Challenge Rating
// ============================================================================

/**
 * Challenge Rating with associated XP.
 */
export interface ChallengeRating {
  /**
   * CR value. Can be a number (0-30) or fractional string ("1/8", "1/4", "1/2").
   */
  cr: number | string;
  /** Experience points awarded for defeating this creature. */
  xp: number;
}

/**
 * Mapping of CR to XP values for reference.
 */
export const CR_TO_XP: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '4': 1100,
  '5': 1800,
  '6': 2300,
  '7': 2900,
  '8': 3900,
  '9': 5000,
  '10': 5900,
  '11': 7200,
  '12': 8400,
  '13': 10000,
  '14': 11500,
  '15': 13000,
  '16': 15000,
  '17': 18000,
  '18': 20000,
  '19': 22000,
  '20': 25000,
  '21': 33000,
  '22': 41000,
  '23': 50000,
  '24': 62000,
  '25': 75000,
  '26': 90000,
  '27': 105000,
  '28': 120000,
  '29': 135000,
  '30': 155000,
};

// ============================================================================
// INTERFACES - Traits and Features
// ============================================================================

/**
 * A passive trait or special ability.
 */
export interface Trait {
  /** Name of the trait (e.g., "Pack Tactics", "Magic Resistance"). */
  name: string;
  /** Full description of what the trait does. */
  description: string;
  /** Optional: limited uses per rest period. */
  uses?: {
    count: number;
    rechargeOn: 'short rest' | 'long rest' | 'dawn' | 'never';
  };
  /** Optional: recharge condition (e.g., "Recharge 5-6"). */
  recharge?: {
    minRoll: number;
    maxRoll?: number;
  };
}

// ============================================================================
// INTERFACES - Attacks
// ============================================================================

/**
 * Damage dealt by an attack.
 */
export interface AttackDamage {
  /** Dice expression for the damage. */
  dice: DiceExpression;
  /** Type of damage dealt. */
  damageType: DnD5eDamageType;
  /** Additional damage (e.g., "plus 7 (2d6) fire damage"). */
  additionalDamage?: AttackDamage[];
}

/**
 * Attack reach or range.
 */
export interface AttackRange {
  /** Reach in feet for melee attacks. */
  reach?: number;
  /** Normal range in feet for ranged attacks. */
  normal?: number;
  /** Long range in feet for ranged attacks (disadvantage). */
  long?: number;
}

/**
 * A monster attack action.
 */
export interface DnD5eAttack {
  /** Name of the attack (e.g., "Bite", "Longbow"). */
  name: string;
  /** Type of attack. */
  attackType: AttackType;
  /** To-hit modifier. */
  toHit: number;
  /** Reach/range of the attack. */
  range: AttackRange;
  /** Target specification (e.g., "one target", "one creature"). */
  target: string;
  /** Damage dealt on hit. */
  damage: AttackDamage;
  /** Additional effects on hit (e.g., grapple, poison). */
  additionalEffects?: string;
}

/**
 * Multiattack action definition.
 */
export interface Multiattack {
  /** Description of the multiattack (e.g., "makes two claw attacks"). */
  description: string;
  /** Structured breakdown of attacks if parseable. */
  attacks?: {
    attackName: string;
    count: number;
  }[];
}

// ============================================================================
// INTERFACES - Actions
// ============================================================================

/**
 * A standard action (non-attack).
 */
export interface DnD5eAction {
  /** Name of the action. */
  name: string;
  /** Full description of what the action does. */
  description: string;
  /** Optional: recharge condition. */
  recharge?: {
    minRoll: number;
    maxRoll?: number;
  };
  /** Optional: limited uses per rest period. */
  uses?: {
    count: number;
    rechargeOn: 'short rest' | 'long rest' | 'dawn' | 'never';
  };
  /** If this is a saving throw effect. */
  savingThrow?: {
    ability: AbilityScore;
    dc: number;
  };
  /** If this deals damage. */
  damage?: AttackDamage;
  /** Area of effect if applicable. */
  areaOfEffect?: {
    type: 'cone' | 'cube' | 'cylinder' | 'line' | 'sphere';
    size: number;
  };
}

// ============================================================================
// INTERFACES - Bonus Actions
// ============================================================================

/**
 * A bonus action.
 */
export interface BonusAction {
  /** Name of the bonus action. */
  name: string;
  /** Full description of what the bonus action does. */
  description: string;
  /** Optional: recharge condition. */
  recharge?: {
    minRoll: number;
    maxRoll?: number;
  };
  /** Optional: limited uses per rest period. */
  uses?: {
    count: number;
    rechargeOn: 'short rest' | 'long rest' | 'dawn' | 'never';
  };
}

// ============================================================================
// INTERFACES - Reactions
// ============================================================================

/**
 * A reaction ability.
 */
export interface Reaction {
  /** Name of the reaction. */
  name: string;
  /** Full description including trigger. */
  description: string;
  /** Parsed trigger condition if extractable. */
  trigger?: string;
}

// ============================================================================
// INTERFACES - Legendary Actions
// ============================================================================

/**
 * A legendary action.
 */
export interface LegendaryAction {
  /** Name of the legendary action. */
  name: string;
  /** Full description. */
  description: string;
  /** Action cost (1-3 legendary actions). */
  cost: number;
}

/**
 * Complete legendary actions section.
 */
export interface LegendaryActions {
  /** Number of legendary actions per round (typically 3). */
  count: number;
  /** Description of when legendary actions reset. */
  description?: string;
  /** List of available legendary actions. */
  actions: LegendaryAction[];
}

// ============================================================================
// INTERFACES - Lair Actions
// ============================================================================

/**
 * A lair action.
 */
export interface LairAction {
  /** Description of the lair action effect. */
  description: string;
  /** Optional name for the lair action. */
  name?: string;
}

/**
 * Complete lair actions section.
 */
export interface LairActions {
  /** Initiative count when lair actions occur (typically 20). */
  initiativeCount: number;
  /** Description of lair action rules. */
  description?: string;
  /** List of available lair actions. */
  actions: LairAction[];
  /** Regional effects caused by the creature's presence. */
  regionalEffects?: string[];
}

// ============================================================================
// INTERFACES - Mythic Actions
// ============================================================================

/**
 * Mythic trait that enables mythic actions.
 */
export interface MythicTrait {
  /** Name of the mythic trait. */
  name: string;
  /** Description including trigger condition. */
  description: string;
}

/**
 * A mythic action.
 */
export interface MythicAction {
  /** Name of the mythic action. */
  name: string;
  /** Full description. */
  description: string;
  /** Action cost (like legendary actions). */
  cost: number;
}

/**
 * Complete mythic actions section.
 */
export interface MythicActions {
  /** The mythic trait that enables these actions. */
  trait: MythicTrait;
  /** Number of mythic actions per round. */
  count: number;
  /** List of available mythic actions. */
  actions: MythicAction[];
}

// ============================================================================
// INTERFACES - Spellcasting
// ============================================================================

/**
 * A spell known or prepared.
 */
export interface Spell {
  /** Spell name. */
  name: string;
  /** Spell level (0 for cantrips). */
  level: number;
}

/**
 * Spell slots by level.
 */
export interface SpellSlots {
  1?: number;
  2?: number;
  3?: number;
  4?: number;
  5?: number;
  6?: number;
  7?: number;
  8?: number;
  9?: number;
}

/**
 * Traditional spellcasting (Spellcasting trait).
 */
export interface TraditionalSpellcasting {
  /** Type indicator. */
  type: 'traditional';
  /** Spellcasting ability. */
  ability: AbilityScore;
  /** Spell save DC. */
  spellSaveDC: number;
  /** Spell attack bonus. */
  spellAttackBonus: number;
  /** Caster level for determining slots. */
  casterLevel?: number;
  /** Available spell slots. */
  slots?: SpellSlots;
  /** Spells organized by level. */
  spells: {
    cantrips?: Spell[];
    1?: Spell[];
    2?: Spell[];
    3?: Spell[];
    4?: Spell[];
    5?: Spell[];
    6?: Spell[];
    7?: Spell[];
    8?: Spell[];
    9?: Spell[];
  };
}

/**
 * Innate spellcasting (Innate Spellcasting trait).
 */
export interface InnateSpellcasting {
  /** Type indicator. */
  type: 'innate';
  /** Spellcasting ability. */
  ability: AbilityScore;
  /** Spell save DC. */
  spellSaveDC: number;
  /** Spell attack bonus (if applicable). */
  spellAttackBonus?: number;
  /** Spells organized by usage frequency. */
  spells: {
    atWill?: Spell[];
    perDay3?: Spell[];
    perDay2?: Spell[];
    perDay1?: Spell[];
  };
}

/**
 * Union type for all spellcasting types.
 */
export type Spellcasting = TraditionalSpellcasting | InnateSpellcasting;

// ============================================================================
// MAIN INTERFACE - D&D 5e Monster
// ============================================================================

/**
 * Complete D&D 5e monster stat block.
 *
 * This is the main interface representing a fully-defined
 * D&D 5e monster ready for conversion to Daggerheart.
 */
export interface DnD5eMonster {
  // === Identity ===
  /** Unique identifier for this monster (optional). */
  id?: string;
  /** Name of the monster. */
  name: string;
  /** Size category. */
  size: CreatureSize;
  /** Creature type. */
  creatureType: CreatureType;
  /** Optional subtype/tags (e.g., "shapechanger", "demon", "elf"). */
  subtypes?: string[];
  /** Alignment. */
  alignment: Alignment;

  // === Core Statistics ===
  /** Armor Class. */
  armorClass: ArmorClass;
  /** Hit Points. */
  hitPoints: HitPoints;
  /** Movement speeds. */
  speed: Speed;

  // === Ability Scores ===
  /** All six ability scores. */
  abilityScores: AbilityScores;

  // === Combat Statistics ===
  /** Proficient saving throws. */
  savingThrows?: SavingThrow[];
  /** Proficient skills. */
  skills?: SkillProficiency[];
  /** Damage vulnerabilities, resistances, and immunities. */
  damageModifiers?: DamageModifiers;
  /** Condition immunities. */
  conditionImmunities?: DnD5eCondition[];

  // === Senses and Languages ===
  /** Senses including passive perception. */
  senses: Senses;
  /** Languages known/understood. */
  languages: string[];

  // === Challenge Rating ===
  /** Challenge Rating and XP. */
  challengeRating: ChallengeRating;
  /** Proficiency bonus (derived from CR). */
  proficiencyBonus: number;

  // === Traits ===
  /** Passive traits and special abilities. */
  traits?: Trait[];

  // === Spellcasting ===
  /** Spellcasting capability if any. */
  spellcasting?: Spellcasting;

  // === Actions ===
  /** Multiattack action if any. */
  multiattack?: Multiattack;
  /** Attack actions. */
  attacks?: DnD5eAttack[];
  /** Non-attack actions. */
  actions?: DnD5eAction[];

  // === Bonus Actions ===
  /** Bonus actions if any. */
  bonusActions?: BonusAction[];

  // === Reactions ===
  /** Reactions if any. */
  reactions?: Reaction[];

  // === Legendary Capabilities ===
  /** Legendary actions if any. */
  legendaryActions?: LegendaryActions;
  /** Legendary resistance count if any. */
  legendaryResistance?: {
    count: number;
    description?: string;
  };

  // === Lair Actions ===
  /** Lair actions if any. */
  lairActions?: LairActions;

  // === Mythic Capabilities ===
  /** Mythic actions if any. */
  mythicActions?: MythicActions;

  // === Metadata ===
  /** Source book or adventure. */
  source?: string;
  /** Page number in source. */
  sourcePage?: number;
  /** Environment/habitat tags. */
  environments?: string[];
  /** Notes or additional information. */
  notes?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate ability modifier from ability score.
 * @param score - Ability score (1-30)
 * @returns Modifier value
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus from Challenge Rating.
 * @param cr - Challenge Rating value
 * @returns Proficiency bonus
 */
export function calculateProficiencyBonus(cr: number | string): number {
  const numericCR = typeof cr === 'string' ? parseCR(cr) : cr;
  if (numericCR < 5) return 2;
  if (numericCR < 9) return 3;
  if (numericCR < 13) return 4;
  if (numericCR < 17) return 5;
  if (numericCR < 21) return 6;
  if (numericCR < 25) return 7;
  if (numericCR < 29) return 8;
  return 9;
}

/**
 * Parse a Challenge Rating string to numeric value.
 * @param cr - CR as string (e.g., "1/4", "5")
 * @returns Numeric CR value
 */
export function parseCR(cr: string): number {
  if (cr.includes('/')) {
    const parts = cr.split('/').map(Number);
    const num = parts[0] ?? 0;
    const denom = parts[1] ?? 1;
    return num / denom;
  }
  return parseFloat(cr);
}

/**
 * Format a dice expression as a string.
 * @param dice - Dice expression object
 * @returns Formatted string (e.g., "2d8+4")
 */
export function formatDiceExpression(dice: DiceExpression): string {
  const base = `${dice.count}d${dice.dieSize}`;
  if (dice.modifier === 0) return base;
  if (dice.modifier > 0) return `${base}+${dice.modifier}`;
  return `${base}${dice.modifier}`;
}

/**
 * Calculate average value of a dice expression.
 * @param dice - Dice expression object
 * @returns Average value
 */
export function calculateDiceAverage(dice: DiceExpression): number {
  const dieAverage = (dice.dieSize + 1) / 2;
  return Math.floor(dice.count * dieAverage + dice.modifier);
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid CreatureSize.
 */
export function isCreatureSize(value: unknown): value is CreatureSize {
  return Object.values(CreatureSize).includes(value as CreatureSize);
}

/**
 * Type guard to check if a value is a valid CreatureType.
 */
export function isCreatureType(value: unknown): value is CreatureType {
  return Object.values(CreatureType).includes(value as CreatureType);
}

/**
 * Type guard to check if a value is a valid DnD5eDamageType.
 */
export function isDnD5eDamageType(value: unknown): value is DnD5eDamageType {
  return Object.values(DnD5eDamageType).includes(value as DnD5eDamageType);
}

/**
 * Type guard to check if a value is a valid DnD5eCondition.
 */
export function isDnD5eCondition(value: unknown): value is DnD5eCondition {
  return Object.values(DnD5eCondition).includes(value as DnD5eCondition);
}

/**
 * Type guard to check if a value is a valid AbilityScore.
 */
export function isAbilityScore(value: unknown): value is AbilityScore {
  return Object.values(AbilityScore).includes(value as AbilityScore);
}

/**
 * Type guard to check if a value is a valid AttackType.
 */
export function isAttackType(value: unknown): value is AttackType {
  return Object.values(AttackType).includes(value as AttackType);
}

/**
 * Type guard to check if a value is a StandardAlignment.
 */
export function isStandardAlignment(value: unknown): value is StandardAlignment {
  if (typeof value !== 'object' || value === null) return false;
  const alignment = value as Record<string, unknown>;
  return (
    Object.values(LawChaosAxis).includes(alignment.lawChaos as LawChaosAxis) &&
    Object.values(GoodEvilAxis).includes(alignment.goodEvil as GoodEvilAxis)
  );
}

/**
 * Type guard to check if a value is a SpecialAlignment.
 */
export function isSpecialAlignment(value: unknown): value is SpecialAlignment {
  return Object.values(SpecialAlignment).includes(value as SpecialAlignment);
}

/**
 * Type guard to check if spellcasting is traditional.
 */
export function isTraditionalSpellcasting(
  value: Spellcasting
): value is TraditionalSpellcasting {
  return value.type === 'traditional';
}

/**
 * Type guard to check if spellcasting is innate.
 */
export function isInnateSpellcasting(
  value: Spellcasting
): value is InnateSpellcasting {
  return value.type === 'innate';
}

/**
 * Type guard to check if an object has minimal required fields for a DnD5eMonster.
 */
export function isMinimalDnD5eMonster(
  obj: unknown
): obj is Pick<
  DnD5eMonster,
  | 'name'
  | 'size'
  | 'creatureType'
  | 'alignment'
  | 'armorClass'
  | 'hitPoints'
  | 'speed'
  | 'abilityScores'
  | 'senses'
  | 'languages'
  | 'challengeRating'
  | 'proficiencyBonus'
> {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.name === 'string' &&
    isCreatureSize(m.size) &&
    isCreatureType(m.creatureType) &&
    (isStandardAlignment(m.alignment) || isSpecialAlignment(m.alignment)) &&
    typeof m.armorClass === 'object' &&
    typeof m.hitPoints === 'object' &&
    typeof m.speed === 'object' &&
    typeof m.abilityScores === 'object' &&
    typeof m.senses === 'object' &&
    Array.isArray(m.languages) &&
    typeof m.challengeRating === 'object' &&
    typeof m.proficiencyBonus === 'number'
  );
}

// ============================================================================
// BUILDER/PARTIAL TYPES
// ============================================================================

/**
 * Partial monster for building/editing.
 * All fields are optional for incremental construction.
 */
export type PartialDnD5eMonster = Partial<DnD5eMonster>;

// ============================================================================
// EXPORTS
// ============================================================================

export default DnD5eMonster;
