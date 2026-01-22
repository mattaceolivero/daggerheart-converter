/**
 * Dragon Creature Conversion Logic
 *
 * Specialized handling for dragons with breath weapons, frightful presence,
 * legendary actions, and age-appropriate stats.
 *
 * Dragon Age Categories:
 * | Age | CR Range | Tier | Features |
 * |-----|----------|------|----------|
 * | Wyrmling | 2-4 | 1-2 | Breath weapon only |
 * | Young | 7-10 | 2-3 | Breath + Frightful |
 * | Adult | 13-17 | 3-4 | Full legendary |
 * | Ancient | 20-24 | 4 | Full legendary + enhanced |
 *
 * Breath Weapon Conversion:
 * | D&D Recharge | Daggerheart Cost |
 * |--------------|------------------|
 * | Recharge 5-6 | Action (2 Stress) |
 * | Recharge 6 | Action (3 Stress) |
 *
 * @module dragonConversion
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureType,
  CreatureSize,
} from '../models/dnd5e';
import {
  Feature,
  FeatureType,
  FeatureCostType,
  Attribute,
  Condition,
  RangeBand,
  Attack,
  DamageType,
  DamageExpression,
} from '../models/daggerheart';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Dragon type classification (chromatic or metallic).
 */
export type DragonColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'black'
  | 'white'
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'brass'
  | 'copper'
  | 'unknown';

/**
 * Dragon age category determining power level and abilities.
 */
export type DragonAge = 'wyrmling' | 'young' | 'adult' | 'ancient';

/**
 * Result of dragon-specific conversion.
 */
export interface DragonConversionResult {
  /** Detected dragon color/type */
  dragonType: DragonColor;
  /** Detected age category */
  ageCategory: DragonAge;
  /** Converted breath weapon feature */
  breathWeapon: Feature;
  /** Legendary and special dragon features */
  legendaryFeatures: Feature[];
  /** Thematic motives appropriate for dragon type */
  thematicMotives: string[];
  /** Notes about the conversion decisions */
  conversionNotes: string[];
}

// ============================================================================
// DRAGON DETECTION PATTERNS
// ============================================================================

/**
 * Patterns for detecting dragon colors from name and traits.
 */
const DRAGON_COLOR_PATTERNS: Array<{
  pattern: RegExp;
  color: DragonColor;
}> = [
  { pattern: /\bred\b/i, color: 'red' },
  { pattern: /\bblue\b/i, color: 'blue' },
  { pattern: /\bgreen\b/i, color: 'green' },
  { pattern: /\bblack\b/i, color: 'black' },
  { pattern: /\bwhite\b/i, color: 'white' },
  { pattern: /\bgold(?:en)?\b/i, color: 'gold' },
  { pattern: /\bsilver\b/i, color: 'silver' },
  { pattern: /\bbronze\b/i, color: 'bronze' },
  { pattern: /\bbrass\b/i, color: 'brass' },
  { pattern: /\bcopper\b/i, color: 'copper' },
];

/**
 * Patterns for detecting dragon age categories.
 */
const DRAGON_AGE_PATTERNS: Array<{
  pattern: RegExp;
  age: DragonAge;
}> = [
  { pattern: /\bwyrmling\b/i, age: 'wyrmling' },
  { pattern: /\byoung\b/i, age: 'young' },
  { pattern: /\badult\b/i, age: 'adult' },
  { pattern: /\bancient\b/i, age: 'ancient' },
];

// ============================================================================
// DRAGON ELEMENT MAPPING
// ============================================================================

/**
 * Maps dragon colors to their element type.
 */
const DRAGON_ELEMENT: Record<DragonColor, string> = {
  red: 'Fire',
  blue: 'Lightning',
  green: 'Poison',
  black: 'Acid',
  white: 'Cold',
  gold: 'Fire',
  silver: 'Cold',
  bronze: 'Lightning',
  brass: 'Fire',
  copper: 'Acid',
  unknown: 'Elemental',
};

/**
 * Maps dragon colors to breath weapon shape.
 */
const BREATH_SHAPE: Record<DragonColor, 'cone' | 'line'> = {
  red: 'cone',
  blue: 'line',
  green: 'cone',
  black: 'line',
  white: 'cone',
  gold: 'cone',
  silver: 'cone',
  bronze: 'line',
  brass: 'line',
  copper: 'line',
  unknown: 'cone',
};

// ============================================================================
// DRAGON PERSONALITY AND MOTIVES
// ============================================================================

/**
 * Thematic motives for each dragon type.
 */
const DRAGON_MOTIVES: Record<DragonColor, string[]> = {
  red: [
    'Dominate all lesser beings',
    'Hoard treasure obsessively',
    'Burn anything that defies me',
    'Claim this territory as mine',
    'Prove my superiority through force',
  ],
  blue: [
    'Outmaneuver opponents strategically',
    'Maintain perfect order in my domain',
    'Collect tributes and offerings',
    'Punish those who insult my magnificence',
    'Build a network of loyal servants',
  ],
  green: [
    'Manipulate others to do my bidding',
    'Acquire forbidden knowledge',
    'Corrupt the innocent with lies',
    'Play rivals against each other',
    'Discover secrets to exploit',
  ],
  black: [
    'Lurk and ambush the unwary',
    'Destroy everything beautiful',
    'Spread fear and suffering',
    'Collect trophies from victims',
    'Claim the darkest territories',
  ],
  white: [
    'Hunt prey relentlessly',
    'Guard my territory ferociously',
    'Attack any intruder on sight',
    'Freeze and devour the weak',
    'Dominate through primal strength',
  ],
  gold: [
    'Protect the innocent and just',
    'Counsel those who seek wisdom',
    'Oppose tyranny and evil',
    'Preserve ancient knowledge',
    'Guide worthy heroes',
  ],
  silver: [
    'Befriend and protect mortals',
    'Experience life among humanoids',
    'Oppose evil wherever found',
    'Share tales and knowledge',
    'Defend the helpless',
  ],
  bronze: [
    'Defend coastal communities',
    'Observe and aid just causes',
    'Battle tyrants and monsters',
    'Study military strategy',
    'Protect sailors and travelers',
  ],
  brass: [
    'Engage in endless conversation',
    'Collect stories and tales',
    'Trade information freely',
    'Avoid violence when possible',
    'Seek out interesting companions',
  ],
  copper: [
    'Play pranks and tricks',
    'Collect jokes and riddles',
    'Protect territory with cunning',
    'Humiliate pompous enemies',
    'Hoard unusual treasures',
  ],
  unknown: [
    'Assert draconic dominance',
    'Protect my hoard',
    'Expand my territory',
    'Demand tribute from lesser beings',
    'Demonstrate my power',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if a stat block represents a dragon creature.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if the creature is a dragon
 *
 * @example
 * ```typescript
 * const dragon: DnD5eMonster = { creatureType: CreatureType.DRAGON, ... };
 * isDragon(dragon); // true
 * ```
 */
export function isDragon(statBlock: DnD5eMonster): boolean {
  return statBlock.creatureType === CreatureType.DRAGON;
}

/**
 * Detects the dragon color from name and subtypes.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Detected dragon color
 */
export function detectDragonColor(statBlock: DnD5eMonster): DragonColor {
  const name = statBlock.name.toLowerCase();
  const subtypes = statBlock.subtypes?.map((s) => s.toLowerCase()) || [];

  // Check subtypes first
  for (const subtype of subtypes) {
    for (const { pattern, color } of DRAGON_COLOR_PATTERNS) {
      if (pattern.test(subtype)) {
        return color;
      }
    }
  }

  // Check name
  for (const { pattern, color } of DRAGON_COLOR_PATTERNS) {
    if (pattern.test(name)) {
      return color;
    }
  }

  return 'unknown';
}

/**
 * Detects the dragon age category from name and CR.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Detected age category
 */
export function detectDragonAge(statBlock: DnD5eMonster): DragonAge {
  const name = statBlock.name.toLowerCase();

  // Check name for age keywords
  for (const { pattern, age } of DRAGON_AGE_PATTERNS) {
    if (pattern.test(name)) {
      return age;
    }
  }

  // Infer from CR
  const cr = statBlock.challengeRating.cr;
  const numericCR =
    typeof cr === 'string'
      ? cr.includes('/')
        ? eval(cr)
        : parseFloat(cr)
      : cr;

  if (numericCR <= 4) return 'wyrmling';
  if (numericCR <= 12) return 'young';
  if (numericCR <= 19) return 'adult';
  return 'ancient';
}

/**
 * Determines breath weapon Stress cost based on D&D recharge.
 *
 * @param recharge - D&D recharge specification
 * @returns Stress cost (2 for Recharge 5-6, 3 for Recharge 6)
 */
function getBreathWeaponCost(recharge?: { minRoll: number; maxRoll?: number }): number {
  if (!recharge) return 2;

  // Recharge 6 only (17% chance) = 3 Stress
  if (recharge.minRoll >= 6) return 3;

  // Recharge 5-6 (33% chance) = 2 Stress
  return 2;
}

/**
 * Gets the range band for breath weapon based on age.
 *
 * @param age - Dragon age category
 * @param shape - Breath weapon shape (cone/line)
 * @returns Appropriate range band
 */
function getBreathWeaponRange(age: DragonAge, shape: 'cone' | 'line'): string {
  // Lines have longer range than cones
  if (shape === 'line') {
    switch (age) {
      case 'wyrmling': return 'Close range line';
      case 'young': return 'Far range line';
      case 'adult': return 'Far range line';
      case 'ancient': return 'Very Far range line';
    }
  } else {
    switch (age) {
      case 'wyrmling': return 'Close range cone';
      case 'young': return 'Close range cone';
      case 'adult': return 'Far range cone';
      case 'ancient': return 'Far range cone';
    }
  }
}

/**
 * Gets breath weapon damage dice based on age.
 *
 * @param age - Dragon age category
 * @returns Damage dice count
 */
function getBreathWeaponDice(age: DragonAge): number {
  switch (age) {
    case 'wyrmling': return 2;
    case 'young': return 4;
    case 'adult': return 6;
    case 'ancient': return 8;
  }
}

/**
 * Creates the breath weapon feature.
 *
 * @param color - Dragon color
 * @param age - Dragon age category
 * @param recharge - D&D recharge specification
 * @returns Breath weapon feature
 */
function createBreathWeapon(
  color: DragonColor,
  age: DragonAge,
  recharge?: { minRoll: number; maxRoll?: number }
): Feature {
  const element = DRAGON_ELEMENT[color];
  const shape = BREATH_SHAPE[color];
  const range = getBreathWeaponRange(age, shape);
  const diceCount = getBreathWeaponDice(age);
  const stressCost = getBreathWeaponCost(recharge);

  return {
    name: `${element} Breath`,
    type: FeatureType.ACTION,
    description: `Exhales ${element.toLowerCase()} in a ${range}. All creatures in the area must make an Agility Reaction Roll or take ${diceCount}d8 magic damage. On success, take half damage.`,
    cost: {
      type: FeatureCostType.STRESS,
      amount: stressCost,
    },
    target: range,
    reactionRollAttribute: Attribute.AGILITY,
  };
}

/**
 * Creates the Frightful Presence feature.
 *
 * @param age - Dragon age category
 * @returns Frightful Presence feature or undefined for wyrmlings
 */
function createFrightfulPresence(age: DragonAge): Feature | undefined {
  // Wyrmlings don't have frightful presence
  if (age === 'wyrmling') return undefined;

  const range = age === 'young' ? 'Close' : 'Far';
  const difficulty = age === 'young' ? 14 : age === 'adult' ? 16 : 18;

  return {
    name: 'Terrifying Presence',
    type: FeatureType.ACTION,
    description: `The dragon reveals its full draconic majesty. All enemies within ${range} range must make an Instinct Reaction Roll (difficulty ${difficulty}) or **mark 1 Fear** and become Frightened. While Frightened, the creature has disadvantage on attacks against the dragon and cannot willingly move closer. A creature can repeat this roll at the end of each of its turns, clearing the condition on success. Once a creature succeeds, they are immune to this dragon's Terrifying Presence for 24 hours.`,
    cost: {
      type: FeatureCostType.STRESS,
      amount: 1,
    },
    target: `All enemies in ${range} range`,
    reactionRollAttribute: Attribute.INSTINCT,
    reactionRollDifficulty: difficulty,
    appliedConditions: [Condition.FRIGHTENED],
  };
}

/**
 * Creates a Fear-activated ability for dragons.
 *
 * @param color - Dragon color
 * @param age - Dragon age category
 * @returns Fear-activated feature
 */
function createFearAbility(color: DragonColor, age: DragonAge): Feature {
  const element = DRAGON_ELEMENT[color];
  const diceCount = age === 'wyrmling' ? 2 : age === 'young' ? 3 : age === 'adult' ? 4 : 5;

  return {
    name: `${element} Fury`,
    type: FeatureType.ACTION,
    description: `**Requires:** Target has Fear marked. The dragon channels its elemental fury into a devastating strike against a Frightened creature within Close range. The attack automatically hits and deals **${diceCount}d10 magic damage** (${element.toLowerCase()}). The target clears their Fear after this attack.`,
    cost: {
      type: FeatureCostType.FEAR,
      amount: 1,
    },
    target: 'One Frightened creature in Close range',
    damage: {
      diceCount,
      diceSize: 10,
      modifier: 0,
      damageType: DamageType.MAGIC,
      isDirect: false,
    },
  };
}

/**
 * Creates the Wing Attack legendary action feature.
 *
 * @param age - Dragon age category
 * @returns Wing Attack feature
 */
function createWingAttack(age: DragonAge): Feature {
  const diceCount = age === 'adult' ? 2 : 3;
  const difficulty = age === 'adult' ? 15 : 17;

  return {
    name: 'Wing Buffet',
    type: FeatureType.REACTION,
    description: `The dragon beats its massive wings with thunderous force. All creatures within Melee range must make a Strength Reaction Roll (difficulty ${difficulty}) or take **${diceCount}d8 physical damage**, be knocked **Prone**, and pushed to Close range. The dragon can then fly up to Close range without provoking opportunity attacks.`,
    cost: {
      type: FeatureCostType.STRESS,
      amount: 2,
    },
    trigger: {
      description: 'When the dragon is hit by an attack, or at the end of another creature\'s turn',
    },
    reactionRollAttribute: Attribute.STRENGTH,
    reactionRollDifficulty: difficulty,
    damage: {
      diceCount,
      diceSize: 8,
      modifier: 0,
      damageType: DamageType.PHYSICAL,
      isDirect: false,
    },
    appliedConditions: [Condition.VULNERABLE], // Prone represented as Vulnerable
  };
}

/**
 * Creates the Tail Sweep legendary action feature.
 *
 * @param age - Dragon age category
 * @returns Tail Sweep feature
 */
function createTailSweep(age: DragonAge): Feature {
  const diceCount = age === 'adult' ? 2 : 3;
  const modifier = age === 'adult' ? 4 : 5;
  const difficulty = age === 'adult' ? 14 : 16;

  return {
    name: 'Tail Sweep',
    type: FeatureType.REACTION,
    description: `The dragon swings its massive tail in a devastating arc. One creature within Close range must make a Strength Reaction Roll (difficulty ${difficulty}). On failure, the target takes **${diceCount}d8+${modifier} physical damage** and is knocked **Prone**. On success, the target takes half damage and remains standing.`,
    cost: {
      type: FeatureCostType.STRESS,
      amount: 1,
    },
    trigger: {
      description: 'At the end of another creature\'s turn, or when a creature enters Close range',
    },
    target: 'One creature within Close range',
    reactionRollAttribute: Attribute.STRENGTH,
    reactionRollDifficulty: difficulty,
    damage: {
      diceCount,
      diceSize: 8,
      modifier,
      damageType: DamageType.PHYSICAL,
      isDirect: false,
    },
    appliedConditions: [Condition.VULNERABLE], // Prone
  };
}

/**
 * Creates the Draconic Senses passive feature.
 *
 * @param age - Dragon age category
 * @returns Draconic Senses feature
 */
function createDraconicSenses(age: DragonAge): Feature {
  const range = age === 'ancient' ? 'Very Far' : 'Far';
  const blindsightRange = age === 'wyrmling' ? 'Melee' : age === 'young' ? 'Close' : 'Far';

  return {
    name: 'Draconic Senses',
    type: FeatureType.PASSIVE,
    description: `**Blindsight (${blindsightRange}):** The dragon perceives its surroundings without relying on sight within ${blindsightRange} range, detecting invisible creatures and seeing through illusions. **Darkvision (${range}):** The dragon sees in darkness as if it were dim light within ${range} range. **Keen Senses:** The dragon has advantage on all Perception-related rolls. The dragon cannot be surprised while conscious.`,
  };
}

/**
 * Creates the Flight passive feature.
 *
 * @param age - Dragon age category
 * @returns Flight feature
 */
function createFlight(age: DragonAge): Feature {
  const speed = age === 'wyrmling' ? 'Close' : age === 'young' ? 'Far' : 'Very Far';

  return {
    name: 'Flight',
    type: FeatureType.PASSIVE,
    description: `**Flying Speed (${speed}):** The dragon can fly up to ${speed} range as its movement. **Hover:** The dragon can hover in place without falling. **Aerial Agility:** The dragon has advantage on Agility rolls to maneuver while flying and does not provoke opportunity attacks when flying out of an enemy's reach.`,
  };
}

/**
 * Creates the Fire/Element Immunity passive.
 *
 * @param color - Dragon color
 * @returns Element immunity feature
 */
function createElementImmunity(color: DragonColor): Feature {
  const element = DRAGON_ELEMENT[color];

  return {
    name: `${element} Immunity`,
    type: FeatureType.PASSIVE,
    description: `**Immune to ${element}:** The dragon takes no damage from ${element.toLowerCase()} sources and cannot be harmed by ${element.toLowerCase()}-based effects. Environmental ${element.toLowerCase()} (lava, lightning storms, etc.) does not affect the dragon.`,
  };
}

/**
 * Creates Legendary Resilience for adult+ dragons.
 *
 * @param age - Dragon age category
 * @returns Legendary Resilience feature
 */
function createLegendaryResilience(age: DragonAge): Feature {
  const uses = age === 'adult' ? 3 : 5;

  return {
    name: 'Legendary Resilience',
    type: FeatureType.REACTION,
    description: `**${uses} uses per encounter.** When the dragon fails a Reaction Roll against a spell, ability, or effect, it can choose to succeed instead. This represents the dragon's legendary willpower and magical resistance. Each use costs 2 Stress.`,
    cost: {
      type: FeatureCostType.STRESS,
      amount: 2,
    },
    trigger: {
      description: 'When the dragon fails a Reaction Roll',
    },
  };
}

/**
 * Creates the Multiattack action feature for dragons.
 *
 * @param age - Dragon age category
 * @returns Multiattack feature
 */
function createMultiattack(age: DragonAge): Feature {
  const attacks = age === 'wyrmling' ? 'one Bite attack' :
                  age === 'young' ? 'one Bite attack and two Claw attacks' :
                  'its Terrifying Presence, then one Bite attack and two Claw attacks';

  return {
    name: 'Multiattack',
    type: FeatureType.ACTION,
    description: `The dragon makes ${attacks}. It can substitute one Claw attack for a Tail Sweep if available.`,
  };
}

/**
 * Gets age-appropriate legendary features.
 *
 * @param color - Dragon color
 * @param age - Dragon age category
 * @param hasLegendaryInOriginal - Whether original stat block had legendary actions
 * @returns Array of legendary features
 */
function getLegendaryFeatures(
  color: DragonColor,
  age: DragonAge,
  hasLegendaryInOriginal: boolean
): Feature[] {
  const features: Feature[] = [];

  // === PASSIVE FEATURES ===

  // All dragons get element immunity
  features.push(createElementImmunity(color));

  // All dragons get draconic senses
  features.push(createDraconicSenses(age));

  // All dragons can fly
  features.push(createFlight(age));

  // === ACTION FEATURES ===

  // All dragons get multiattack
  features.push(createMultiattack(age));

  // Young+ get frightful presence (which causes Fear)
  const frightful = createFrightfulPresence(age);
  if (frightful) {
    features.push(frightful);
  }

  // Young+ get Fear-activated ability (consumes Fear marked by Frightful Presence)
  if (age !== 'wyrmling') {
    features.push(createFearAbility(color, age));
  }

  // === REACTION FEATURES ===

  // Adult+ get legendary actions and resistance
  if (age === 'adult' || age === 'ancient' || hasLegendaryInOriginal) {
    features.push(createWingAttack(age));
    features.push(createTailSweep(age));
    features.push(createLegendaryResilience(age));
  }

  return features;
}

/**
 * Extracts breath weapon recharge info from stat block.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Recharge specification or undefined
 */
function extractBreathRecharge(
  statBlock: DnD5eMonster
): { minRoll: number; maxRoll?: number } | undefined {
  // Check actions for breath weapon
  if (statBlock.actions) {
    for (const action of statBlock.actions) {
      if (/breath/i.test(action.name)) {
        return action.recharge;
      }
    }
  }

  // Check traits
  if (statBlock.traits) {
    for (const trait of statBlock.traits) {
      if (/breath/i.test(trait.name)) {
        return trait.recharge;
      }
    }
  }

  // Default for dragons
  return { minRoll: 5, maxRoll: 6 };
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts a dragon D&D 5e creature to include thematic Daggerheart features.
 *
 * This function:
 * 1. Detects dragon color and age category
 * 2. Creates breath weapon with appropriate damage and cost
 * 3. Adds legendary features based on age
 * 4. Generates dragon-appropriate motives
 *
 * @param statBlock - D&D 5e monster stat block (must be a dragon)
 * @returns Dragon conversion result with features, motives, and notes
 *
 * @example
 * ```typescript
 * const adultRed: DnD5eMonster = {
 *   name: "Adult Red Dragon",
 *   creatureType: CreatureType.DRAGON,
 *   // ... other stats
 * };
 *
 * const result = convertDragon(adultRed);
 * // result.dragonType: "red"
 * // result.ageCategory: "adult"
 * // result.breathWeapon: { name: "Fire Breath", cost: 2 Stress, ... }
 * // result.legendaryFeatures: [Wing Buffet, Tail Sweep, Legendary Resilience, ...]
 * // result.thematicMotives: ["Dominate all lesser beings", ...]
 * ```
 */
export function convertDragon(statBlock: DnD5eMonster): DragonConversionResult {
  if (!isDragon(statBlock)) {
    return {
      dragonType: 'unknown',
      ageCategory: 'adult',
      breathWeapon: {
        name: 'Elemental Breath',
        type: FeatureType.ACTION,
        description: 'Not a dragon - no breath weapon conversion performed.',
      },
      legendaryFeatures: [],
      thematicMotives: [],
      conversionNotes: ['Creature is not a dragon - no conversion performed'],
    };
  }

  const color = detectDragonColor(statBlock);
  const age = detectDragonAge(statBlock);
  const conversionNotes: string[] = [];

  conversionNotes.push(`Detected dragon: ${color} ${age}`);

  // Extract breath weapon recharge from original stat block
  const recharge = extractBreathRecharge(statBlock);

  // Create breath weapon
  const breathWeapon = createBreathWeapon(color, age, recharge);
  conversionNotes.push(`Breath weapon: ${DRAGON_ELEMENT[color]}, ${breathWeapon.cost?.amount} Stress`);

  // Check if original had legendary actions
  const hasLegendary = !!statBlock.legendaryActions;

  // Get legendary features based on age and color
  const legendaryFeatures = getLegendaryFeatures(color, age, hasLegendary);
  conversionNotes.push(`Added ${legendaryFeatures.length} dragon features (age: ${age}, color: ${color})`);

  // Get thematic motives
  const thematicMotives = [...DRAGON_MOTIVES[color]];
  conversionNotes.push(`Added ${thematicMotives.length} motives for ${color} dragon`);

  return {
    dragonType: color,
    ageCategory: age,
    breathWeapon,
    legendaryFeatures,
    thematicMotives,
    conversionNotes,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the display name for a dragon color.
 *
 * @param color - Dragon color
 * @returns Human-readable name
 */
export function getDragonColorName(color: DragonColor): string {
  const names: Record<DragonColor, string> = {
    red: 'Red Dragon',
    blue: 'Blue Dragon',
    green: 'Green Dragon',
    black: 'Black Dragon',
    white: 'White Dragon',
    gold: 'Gold Dragon',
    silver: 'Silver Dragon',
    bronze: 'Bronze Dragon',
    brass: 'Brass Dragon',
    copper: 'Copper Dragon',
    unknown: 'Dragon',
  };

  return names[color];
}

/**
 * Gets the element type for a dragon color.
 *
 * @param color - Dragon color
 * @returns Element name
 */
export function getDragonElement(color: DragonColor): string {
  return DRAGON_ELEMENT[color];
}

/**
 * Checks if a dragon is chromatic (evil).
 *
 * @param color - Dragon color
 * @returns True if chromatic
 */
export function isChromatic(color: DragonColor): boolean {
  const chromatic: DragonColor[] = ['red', 'blue', 'green', 'black', 'white'];
  return chromatic.includes(color);
}

/**
 * Checks if a dragon is metallic (good).
 *
 * @param color - Dragon color
 * @returns True if metallic
 */
export function isMetallic(color: DragonColor): boolean {
  const metallic: DragonColor[] = ['gold', 'silver', 'bronze', 'brass', 'copper'];
  return metallic.includes(color);
}

/**
 * Gets all recognized dragon colors.
 *
 * @returns Array of all dragon colors
 */
export function getAllDragonColors(): DragonColor[] {
  return [
    'red',
    'blue',
    'green',
    'black',
    'white',
    'gold',
    'silver',
    'bronze',
    'brass',
    'copper',
    'unknown',
  ];
}

/**
 * Gets CR range for a dragon age category.
 *
 * @param age - Dragon age
 * @returns CR range as [min, max]
 */
export function getAgeCRRange(age: DragonAge): [number, number] {
  switch (age) {
    case 'wyrmling': return [2, 4];
    case 'young': return [7, 10];
    case 'adult': return [13, 17];
    case 'ancient': return [20, 24];
  }
}

/**
 * Summarizes dragon conversion for display.
 *
 * @param result - Dragon conversion result
 * @returns Summary object
 */
export function summarizeDragonConversion(result: DragonConversionResult): {
  type: string;
  age: string;
  element: string;
  alignment: 'chromatic' | 'metallic' | 'unknown';
  featureCount: number;
  breathCost: number;
} {
  return {
    type: getDragonColorName(result.dragonType),
    age: result.ageCategory,
    element: getDragonElement(result.dragonType),
    alignment: isChromatic(result.dragonType)
      ? 'chromatic'
      : isMetallic(result.dragonType)
        ? 'metallic'
        : 'unknown',
    featureCount: result.legendaryFeatures.length + 1, // +1 for breath weapon
    breathCost: result.breathWeapon.cost?.amount ?? 0,
  };
}
