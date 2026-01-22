/**
 * Scaling and Adjustment Utilities
 *
 * Provides utilities for GMs to scale adversaries up/down and make quick
 * adjustments to Daggerheart adversaries on the fly.
 *
 * @module utils/scaling
 * @version 1.0.0
 */

import {
  DaggerheartAdversary,
  Tier,
  Difficulty,
  DamageExpression,
  DamageThresholds,
  Attack,
  Feature,
  FeatureType,
  FeatureCostType,
  TIER_DEFAULTS,
} from '../models/daggerheart';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for tier scaling operations.
 */
export interface ScalingOptions {
  /** Whether to preserve existing features (default: true). */
  preserveFeatures?: boolean;
  /** Whether to adjust Stress pool proportionally (default: true). */
  adjustStress?: boolean;
  /** Whether to scale damage dice (default: true). */
  scaleDamage?: boolean;
}

/**
 * Quick adjustment presets for fast modifications.
 */
export type QuickAdjustment =
  | 'tougher'
  | 'weaker'
  | 'deadlier'
  | 'softer'
  | 'elite'
  | 'minionize';

/**
 * Result of a scaling operation with metadata.
 */
export interface ScalingResult {
  /** The scaled adversary. */
  adversary: DaggerheartAdversary;
  /** Description of changes made. */
  changes: string[];
  /** Original tier (for reference). */
  originalTier: Tier;
  /** Target tier (for tier scaling). */
  targetTier?: Tier;
}

// ============================================================================
// TIER RATIO CALCULATIONS
// ============================================================================

/**
 * Calculate the ratio between two tiers for proportional scaling.
 */
function getTierRatio(fromTier: Tier, toTier: Tier): number {
  // Use evasion defaults as a baseline for tier power scaling
  const fromEvasion = TIER_DEFAULTS[fromTier].evasion.default;
  const toEvasion = TIER_DEFAULTS[toTier].evasion.default;
  return toEvasion / fromEvasion;
}

/**
 * Scale thresholds based on tier ratio.
 */
function scaleThresholds(
  thresholds: DamageThresholds,
  fromTier: Tier,
  toTier: Tier
): DamageThresholds {
  const fromDefaults = TIER_DEFAULTS[fromTier].thresholds;
  const toDefaults = TIER_DEFAULTS[toTier].thresholds;

  // Calculate average thresholds for each tier
  const fromMinorAvg = (fromDefaults.minor[0] + fromDefaults.minor[1]) / 2;
  const fromMajorAvg = (fromDefaults.major[0] + fromDefaults.major[1]) / 2;
  const fromSevereAvg = (fromDefaults.severe[0] + fromDefaults.severe[1]) / 2;

  const toMinorAvg = (toDefaults.minor[0] + toDefaults.minor[1]) / 2;
  const toMajorAvg = (toDefaults.major[0] + toDefaults.major[1]) / 2;
  const toSevereAvg = (toDefaults.severe[0] + toDefaults.severe[1]) / 2;

  return {
    minor: Math.max(1, Math.round((thresholds.minor / fromMinorAvg) * toMinorAvg)),
    major: Math.max(2, Math.round((thresholds.major / fromMajorAvg) * toMajorAvg)),
    severe: Math.max(3, Math.round((thresholds.severe / fromSevereAvg) * toSevereAvg)),
  };
}

/**
 * Scale HP based on tier ratio.
 */
function scaleHP(hp: number, fromTier: Tier, toTier: Tier): number {
  // Get standard HP ranges
  const fromHP = TIER_DEFAULTS[fromTier].hp.standard;
  const toHP = TIER_DEFAULTS[toTier].hp.standard;

  const fromAvg = (fromHP[0] + fromHP[1]) / 2;
  const toAvg = (toHP[0] + toHP[1]) / 2;

  const ratio = toAvg / fromAvg;
  return Math.max(1, Math.round(hp * ratio));
}

/**
 * Scale attack modifier based on tier.
 */
function scaleAttackModifier(modifier: number, fromTier: Tier, toTier: Tier): number {
  const fromDefault = TIER_DEFAULTS[fromTier].attackModifier.default;
  const toDefault = TIER_DEFAULTS[toTier].attackModifier.default;
  const diff = toDefault - fromDefault;
  return modifier + diff;
}

/**
 * Scale damage expression based on tier.
 */
function scaleDamageExpression(
  damage: DamageExpression,
  fromTier: Tier,
  toTier: Tier
): DamageExpression {
  const fromDice = TIER_DEFAULTS[fromTier].dicePool;
  const toDice = TIER_DEFAULTS[toTier].dicePool;
  const diceRatio = toDice / fromDice;

  // Scale dice count
  const newDiceCount = Math.max(1, Math.round(damage.diceCount * diceRatio));

  // Scale modifier proportionally
  const modifierRatio = getTierRatio(fromTier, toTier);
  const newModifier = Math.round(damage.modifier * modifierRatio);

  return {
    ...damage,
    diceCount: newDiceCount,
    modifier: newModifier,
  };
}

/**
 * Scale Stress pool based on tier.
 */
function scaleStress(stress: number, fromTier: Tier, toTier: Tier): number {
  const fromRange = TIER_DEFAULTS[fromTier].stress.range;
  const toRange = TIER_DEFAULTS[toTier].stress.range;

  const fromAvg = (fromRange[0] + fromRange[1]) / 2;
  const toAvg = (toRange[0] + toRange[1]) / 2;

  return Math.max(0, Math.round((stress / fromAvg) * toAvg));
}

/**
 * Scale evasion based on tier.
 */
function scaleEvasion(evasion: number, fromTier: Tier, toTier: Tier): number {
  const fromDefault = TIER_DEFAULTS[fromTier].evasion.default;
  const toDefault = TIER_DEFAULTS[toTier].evasion.default;
  const diff = toDefault - fromDefault;
  return Math.max(8, Math.min(25, evasion + diff));
}

// ============================================================================
// TIER SCALING
// ============================================================================

/**
 * Scale an adversary to a different tier while maintaining its character.
 *
 * @param adversary - The adversary to scale.
 * @param targetTier - The target tier to scale to.
 * @param options - Scaling options.
 * @returns The scaled adversary.
 *
 * @example
 * ```typescript
 * // Scale a Tier 1 goblin to Tier 3
 * const scaledGoblin = scaleTier(goblin, Tier.THREE);
 * ```
 */
export function scaleTier(
  adversary: DaggerheartAdversary,
  targetTier: Tier,
  options: ScalingOptions = {}
): DaggerheartAdversary {
  const {
    preserveFeatures = true,
    adjustStress = true,
    scaleDamage = true,
  } = options;

  const fromTier = adversary.tier;

  // If same tier, return a copy
  if (fromTier === targetTier) {
    return { ...adversary };
  }

  const changes: string[] = [];

  // Scale core stats
  const newEvasion = scaleEvasion(adversary.evasion, fromTier, targetTier);
  changes.push(`Evasion: ${adversary.evasion} -> ${newEvasion}`);

  const newThresholds = scaleThresholds(adversary.thresholds, fromTier, targetTier);
  changes.push(
    `Thresholds: ${adversary.thresholds.minor}/${adversary.thresholds.major}/${adversary.thresholds.severe} -> ${newThresholds.minor}/${newThresholds.major}/${newThresholds.severe}`
  );

  const newHP = scaleHP(adversary.hp, fromTier, targetTier);
  changes.push(`HP: ${adversary.hp} -> ${newHP}`);

  // Scale Stress if enabled
  let newStress = adversary.stress;
  if (adjustStress) {
    newStress = scaleStress(adversary.stress, fromTier, targetTier);
    changes.push(`Stress: ${adversary.stress} -> ${newStress}`);
  }

  // Scale attack
  const newAttackModifier = scaleAttackModifier(
    adversary.attack.modifier,
    fromTier,
    targetTier
  );
  let newAttackDamage = adversary.attack.damage;
  if (scaleDamage) {
    newAttackDamage = scaleDamageExpression(
      adversary.attack.damage,
      fromTier,
      targetTier
    );
  }
  changes.push(`Attack modifier: +${adversary.attack.modifier} -> +${newAttackModifier}`);

  const newAttack: Attack = {
    ...adversary.attack,
    modifier: newAttackModifier,
    damage: newAttackDamage,
  };

  // Scale additional attacks if present
  let newAdditionalAttacks = adversary.additionalAttacks;
  if (adversary.additionalAttacks && scaleDamage) {
    newAdditionalAttacks = adversary.additionalAttacks.map((atk) => ({
      ...atk,
      modifier: scaleAttackModifier(atk.modifier, fromTier, targetTier),
      damage: scaleDamageExpression(atk.damage, fromTier, targetTier),
    }));
  }

  // Handle features - scale damage in features if enabled
  let newFeatures = adversary.features;
  if (scaleDamage && !preserveFeatures) {
    newFeatures = adversary.features.map((feature) => {
      if (feature.damage) {
        return {
          ...feature,
          damage: scaleDamageExpression(feature.damage, fromTier, targetTier),
        };
      }
      return feature;
    });
  }

  const result: DaggerheartAdversary = {
    ...adversary,
    tier: targetTier,
    evasion: newEvasion,
    thresholds: newThresholds,
    hp: newHP,
    stress: newStress,
    attack: newAttack,
    features: newFeatures,
    conversionNotes: `${adversary.conversionNotes || ''}\nScaled from Tier ${fromTier} to Tier ${targetTier}.`.trim(),
  };

  // Only set additionalAttacks if they exist
  if (newAdditionalAttacks) {
    result.additionalAttacks = newAdditionalAttacks;
  }

  return result;
}

// ============================================================================
// DIFFICULTY ADJUSTMENT
// ============================================================================

/**
 * Threshold modifiers by difficulty level.
 */
const DIFFICULTY_THRESHOLD_MODIFIERS: Record<Difficulty, { minor: number; major: number; severe: number }> = {
  [Difficulty.MINOR]: { minor: -2, major: -3, severe: -5 },
  [Difficulty.MAJOR]: { minor: 0, major: 0, severe: 0 },
  [Difficulty.SEVERE]: { minor: 2, major: 3, severe: 5 },
};

/**
 * HP modifiers by difficulty level.
 */
const DIFFICULTY_HP_MODIFIERS: Record<Difficulty, number> = {
  [Difficulty.MINOR]: -1,
  [Difficulty.MAJOR]: 0,
  [Difficulty.SEVERE]: 2,
};

/**
 * Adjust an adversary's difficulty classification.
 *
 * @param adversary - The adversary to adjust.
 * @param targetDifficulty - The target difficulty.
 * @returns The adjusted adversary.
 *
 * @example
 * ```typescript
 * // Make a Major adversary into a Severe threat
 * const severeGoblin = adjustDifficulty(goblin, Difficulty.SEVERE);
 * ```
 */
export function adjustDifficulty(
  adversary: DaggerheartAdversary,
  targetDifficulty: Difficulty
): DaggerheartAdversary {
  const currentDifficulty = adversary.difficulty || Difficulty.MAJOR;

  // If same difficulty, return a copy
  if (currentDifficulty === targetDifficulty) {
    return { ...adversary };
  }

  // Get the delta between difficulties
  const currentMods = DIFFICULTY_THRESHOLD_MODIFIERS[currentDifficulty];
  const targetMods = DIFFICULTY_THRESHOLD_MODIFIERS[targetDifficulty];

  const thresholdDelta = {
    minor: targetMods.minor - currentMods.minor,
    major: targetMods.major - currentMods.major,
    severe: targetMods.severe - currentMods.severe,
  };

  const hpDelta = DIFFICULTY_HP_MODIFIERS[targetDifficulty] - DIFFICULTY_HP_MODIFIERS[currentDifficulty];

  // Apply adjustments
  const newThresholds: DamageThresholds = {
    minor: Math.max(1, adversary.thresholds.minor + thresholdDelta.minor),
    major: Math.max(2, adversary.thresholds.major + thresholdDelta.major),
    severe: Math.max(3, adversary.thresholds.severe + thresholdDelta.severe),
  };

  const newHP = Math.max(1, adversary.hp + hpDelta);

  // Add features for Severe difficulty if going up
  let newFeatures = [...adversary.features];
  if (
    targetDifficulty === Difficulty.SEVERE &&
    currentDifficulty !== Difficulty.SEVERE
  ) {
    // Add a defensive feature if not already present
    const hasDefensiveFeature = newFeatures.some(
      (f) =>
        f.name.toLowerCase().includes('resist') ||
        f.name.toLowerCase().includes('armor') ||
        f.name.toLowerCase().includes('tough')
    );
    if (!hasDefensiveFeature) {
      newFeatures.push({
        name: 'Hardened',
        type: FeatureType.PASSIVE,
        description: 'This creature is particularly resilient. The first time each round it would mark HP from damage, reduce the HP marked by 1 (minimum 1).',
      });
    }
  }

  // Remove features for Minor difficulty if going down
  if (
    targetDifficulty === Difficulty.MINOR &&
    currentDifficulty !== Difficulty.MINOR &&
    newFeatures.length > 2
  ) {
    // Remove the last non-essential feature
    const essentialNames = ['attack', 'bite', 'claw', 'strike'];
    const nonEssentialIndex = newFeatures.findIndex(
      (f) => !essentialNames.some((name) => f.name.toLowerCase().includes(name))
    );
    if (nonEssentialIndex !== -1) {
      newFeatures.splice(nonEssentialIndex, 1);
    }
  }

  return {
    ...adversary,
    difficulty: targetDifficulty,
    thresholds: newThresholds,
    hp: newHP,
    features: newFeatures,
    conversionNotes: `${adversary.conversionNotes || ''}\nDifficulty adjusted from ${currentDifficulty} to ${targetDifficulty}.`.trim(),
  };
}

// ============================================================================
// QUICK ADJUSTMENTS
// ============================================================================

/**
 * Apply a quick adjustment preset to an adversary.
 *
 * Quick adjustments provide fast, commonly-needed modifications:
 * - **tougher**: +25% HP, +1 to all thresholds
 * - **weaker**: -25% HP, -1 to all thresholds
 * - **deadlier**: +1 damage die to primary attack
 * - **softer**: -1 damage die to primary attack (minimum 1)
 * - **elite**: Add 1 Stress, add 1 defensive feature
 * - **minionize**: Set HP to 1, remove Stress abilities
 *
 * @param adversary - The adversary to adjust.
 * @param adjustment - The quick adjustment to apply.
 * @returns The adjusted adversary.
 *
 * @example
 * ```typescript
 * // Make a goblin tougher
 * const toughGoblin = quickAdjust(goblin, 'tougher');
 *
 * // Turn a standard enemy into a minion
 * const minionGoblin = quickAdjust(goblin, 'minionize');
 * ```
 */
export function quickAdjust(
  adversary: DaggerheartAdversary,
  adjustment: QuickAdjustment
): DaggerheartAdversary {
  switch (adjustment) {
    case 'tougher':
      return applyTougher(adversary);
    case 'weaker':
      return applyWeaker(adversary);
    case 'deadlier':
      return applyDeadlier(adversary);
    case 'softer':
      return applySofter(adversary);
    case 'elite':
      return applyElite(adversary);
    case 'minionize':
      return applyMinionize(adversary);
    default:
      return { ...adversary };
  }
}

/**
 * Tougher: +25% HP, +1 to all thresholds.
 */
function applyTougher(adversary: DaggerheartAdversary): DaggerheartAdversary {
  const newHP = Math.max(1, Math.round(adversary.hp * 1.25));
  const newThresholds: DamageThresholds = {
    minor: adversary.thresholds.minor + 1,
    major: adversary.thresholds.major + 1,
    severe: adversary.thresholds.severe + 1,
  };

  return {
    ...adversary,
    hp: newHP,
    thresholds: newThresholds,
    conversionNotes: `${adversary.conversionNotes || ''}\nQuick adjust: Tougher (+25% HP, +1 thresholds).`.trim(),
  };
}

/**
 * Weaker: -25% HP, -1 to all thresholds.
 */
function applyWeaker(adversary: DaggerheartAdversary): DaggerheartAdversary {
  const newHP = Math.max(1, Math.round(adversary.hp * 0.75));
  const newThresholds: DamageThresholds = {
    minor: Math.max(1, adversary.thresholds.minor - 1),
    major: Math.max(2, adversary.thresholds.major - 1),
    severe: Math.max(3, adversary.thresholds.severe - 1),
  };

  return {
    ...adversary,
    hp: newHP,
    thresholds: newThresholds,
    conversionNotes: `${adversary.conversionNotes || ''}\nQuick adjust: Weaker (-25% HP, -1 thresholds).`.trim(),
  };
}

/**
 * Deadlier: +1 damage die to primary attack.
 */
function applyDeadlier(adversary: DaggerheartAdversary): DaggerheartAdversary {
  const newDamage: DamageExpression = {
    ...adversary.attack.damage,
    diceCount: adversary.attack.damage.diceCount + 1,
  };

  return {
    ...adversary,
    attack: {
      ...adversary.attack,
      damage: newDamage,
    },
    conversionNotes: `${adversary.conversionNotes || ''}\nQuick adjust: Deadlier (+1 damage die).`.trim(),
  };
}

/**
 * Softer: -1 damage die to primary attack (minimum 1).
 */
function applySofter(adversary: DaggerheartAdversary): DaggerheartAdversary {
  const newDamage: DamageExpression = {
    ...adversary.attack.damage,
    diceCount: Math.max(1, adversary.attack.damage.diceCount - 1),
  };

  return {
    ...adversary,
    attack: {
      ...adversary.attack,
      damage: newDamage,
    },
    conversionNotes: `${adversary.conversionNotes || ''}\nQuick adjust: Softer (-1 damage die).`.trim(),
  };
}

/**
 * Elite: Add 1 Stress, add 1 defensive feature.
 */
function applyElite(adversary: DaggerheartAdversary): DaggerheartAdversary {
  const newStress = adversary.stress + 1;
  const newFeatures = [
    ...adversary.features,
    {
      name: 'Elite Resilience',
      type: FeatureType.REACTION,
      description: 'When this creature would be reduced to 0 HP, it may spend 1 Stress to instead be reduced to 1 HP.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
      trigger: {
        description: 'When reduced to 0 HP',
      },
    } as Feature,
  ];

  return {
    ...adversary,
    stress: newStress,
    features: newFeatures,
    conversionNotes: `${adversary.conversionNotes || ''}\nQuick adjust: Elite (+1 Stress, +Elite Resilience feature).`.trim(),
  };
}

/**
 * Minionize: HP = 1, remove Stress abilities, simplified stat block.
 */
function applyMinionize(adversary: DaggerheartAdversary): DaggerheartAdversary {
  // Remove features that cost Stress
  const newFeatures = adversary.features.filter(
    (f) => !f.cost || f.cost.type !== FeatureCostType.STRESS
  );

  // Simplify thresholds for minions (any damage kills)
  const newThresholds: DamageThresholds = {
    minor: 1,
    major: 1,
    severe: 1,
  };

  // Create base result without optional properties that should be removed
  const { relentless, horde, ...baseAdversary } = adversary;

  return {
    ...baseAdversary,
    hp: 1,
    stress: 0,
    thresholds: newThresholds,
    features: newFeatures,
    conversionNotes: `${adversary.conversionNotes || ''}\nQuick adjust: Minionized (HP=1, no Stress abilities).`.trim(),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Apply multiple quick adjustments in sequence.
 *
 * @param adversary - The adversary to adjust.
 * @param adjustments - Array of adjustments to apply in order.
 * @returns The adjusted adversary.
 *
 * @example
 * ```typescript
 * // Make a tougher and deadlier goblin
 * const enhancedGoblin = applyMultipleAdjustments(goblin, ['tougher', 'deadlier']);
 * ```
 */
export function applyMultipleAdjustments(
  adversary: DaggerheartAdversary,
  adjustments: QuickAdjustment[]
): DaggerheartAdversary {
  return adjustments.reduce(
    (current, adjustment) => quickAdjust(current, adjustment),
    adversary
  );
}

/**
 * Create a scaled variant with a new name.
 *
 * @param adversary - The base adversary.
 * @param variantName - Name for the variant.
 * @param targetTier - Target tier for scaling.
 * @param options - Scaling options.
 * @returns A new adversary with the variant name and scaled stats.
 *
 * @example
 * ```typescript
 * // Create a "Goblin Warchief" from a base goblin
 * const warchief = createScaledVariant(goblin, 'Goblin Warchief', Tier.TWO);
 * ```
 */
export function createScaledVariant(
  adversary: DaggerheartAdversary,
  variantName: string,
  targetTier: Tier,
  options?: ScalingOptions
): DaggerheartAdversary {
  const scaled = scaleTier(adversary, targetTier, options);
  return {
    ...scaled,
    name: variantName,
    conversionNotes: `${scaled.conversionNotes || ''}\nCreated as variant of ${adversary.name}.`.trim(),
  };
}

/**
 * Get a summary of changes between two adversaries.
 *
 * @param original - The original adversary.
 * @param modified - The modified adversary.
 * @returns Array of change descriptions.
 */
export function getChangeSummary(
  original: DaggerheartAdversary,
  modified: DaggerheartAdversary
): string[] {
  const changes: string[] = [];

  if (original.tier !== modified.tier) {
    changes.push(`Tier: ${original.tier} -> ${modified.tier}`);
  }
  if (original.difficulty !== modified.difficulty) {
    changes.push(`Difficulty: ${original.difficulty || 'Major'} -> ${modified.difficulty || 'Major'}`);
  }
  if (original.hp !== modified.hp) {
    changes.push(`HP: ${original.hp} -> ${modified.hp}`);
  }
  if (original.evasion !== modified.evasion) {
    changes.push(`Evasion: ${original.evasion} -> ${modified.evasion}`);
  }
  if (original.stress !== modified.stress) {
    changes.push(`Stress: ${original.stress} -> ${modified.stress}`);
  }
  if (
    original.thresholds.minor !== modified.thresholds.minor ||
    original.thresholds.major !== modified.thresholds.major ||
    original.thresholds.severe !== modified.thresholds.severe
  ) {
    changes.push(
      `Thresholds: ${original.thresholds.minor}/${original.thresholds.major}/${original.thresholds.severe} -> ${modified.thresholds.minor}/${modified.thresholds.major}/${modified.thresholds.severe}`
    );
  }
  if (original.attack.modifier !== modified.attack.modifier) {
    changes.push(`Attack modifier: +${original.attack.modifier} -> +${modified.attack.modifier}`);
  }
  if (original.attack.damage.diceCount !== modified.attack.damage.diceCount) {
    changes.push(
      `Attack dice: ${original.attack.damage.diceCount}d${original.attack.damage.diceSize} -> ${modified.attack.damage.diceCount}d${modified.attack.damage.diceSize}`
    );
  }
  if (original.features.length !== modified.features.length) {
    changes.push(`Features: ${original.features.length} -> ${modified.features.length}`);
  }

  return changes;
}
