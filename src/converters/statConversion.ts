/**
 * Core Stat Conversion Engine
 *
 * Converts D&D 5e core statistics to Daggerheart equivalents:
 * Difficulty, Thresholds, HP, Stress, and Evasion.
 *
 * @module statConversion
 * @version 1.0.0
 */

import { Difficulty, Tier, AdversaryType, DamageThresholds } from '../models/daggerheart';
import { DnD5eMonster, parseCR } from '../models/dnd5e';
import { ClassificationResult } from './classifyAdversary';
import { crToTier } from './crToTier';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of core stat conversion.
 */
export interface CoreStats {
  /** Daggerheart Tier (1-4) */
  tier: Tier;
  /** Difficulty classification (Minor, Major, Severe) */
  difficulty: Difficulty;
  /** Damage thresholds for HP loss calculation */
  thresholds: DamageThresholds;
  /** Hit points */
  hp: number;
  /** Stress resource pool */
  stress: number;
  /** Evasion (target number for PC attacks) */
  evasion: number;
}

// ============================================================================
// DIFFICULTY CONVERSION
// ============================================================================

/**
 * Determines the Daggerheart Difficulty classification.
 *
 * Classification rules:
 * - Minion: Minor (always)
 * - Standard (CR < Tier x 3): Minor
 * - Standard (CR >= Tier x 3): Major
 * - Solo/Leader: Severe
 *
 * @param classification - Result from classifyAdversary
 * @param cr - Numeric Challenge Rating
 * @param tier - Daggerheart Tier
 * @returns Difficulty classification
 */
export function determineDifficulty(
  classification: ClassificationResult,
  cr: number,
  tier: Tier
): Difficulty {
  // Minions are always Minor difficulty
  if (classification.type === AdversaryType.MINION) {
    return Difficulty.MINOR;
  }

  // Solo and Leader types are always Severe
  if (
    classification.type === AdversaryType.SOLO ||
    classification.type === AdversaryType.LEADER
  ) {
    return Difficulty.SEVERE;
  }

  // Standard types: compare CR to tier threshold
  // CR >= Tier * 3 means Major, otherwise Minor
  const tierThreshold = tier * 3;
  if (cr >= tierThreshold) {
    return Difficulty.MAJOR;
  }

  return Difficulty.MINOR;
}

// ============================================================================
// THRESHOLD CONVERSION
// ============================================================================

/**
 * Threshold formulas by difficulty level.
 *
 * Minor:  Tier+2 / Tier*2+4 / Tier*3+6
 * Major:  Tier+3 / Tier*2+6 / Tier*3+9
 * Severe: Tier+4 / Tier*2+8 / Tier*3+12
 */
const THRESHOLD_FORMULAS = {
  [Difficulty.MINOR]: {
    minor: (tier: Tier) => tier + 2,
    major: (tier: Tier) => tier * 2 + 4,
    severe: (tier: Tier) => tier * 3 + 6,
  },
  [Difficulty.MAJOR]: {
    minor: (tier: Tier) => tier + 3,
    major: (tier: Tier) => tier * 2 + 6,
    severe: (tier: Tier) => tier * 3 + 9,
  },
  [Difficulty.SEVERE]: {
    minor: (tier: Tier) => tier + 4,
    major: (tier: Tier) => tier * 2 + 8,
    severe: (tier: Tier) => tier * 3 + 12,
  },
} as const;

/**
 * Calculates damage thresholds based on Tier and Difficulty.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @param difficulty - Difficulty classification
 * @returns DamageThresholds object
 */
export function calculateThresholds(tier: Tier, difficulty: Difficulty): DamageThresholds {
  const formulas = THRESHOLD_FORMULAS[difficulty];

  return {
    minor: formulas.minor(tier),
    major: formulas.major(tier),
    severe: formulas.severe(tier),
  };
}

// ============================================================================
// HP CONVERSION
// ============================================================================

/**
 * Converts D&D 5e HP to Daggerheart HP.
 *
 * Conversion rules:
 * - Minion: Always 1 HP
 * - Standard: D&D HP / 10, minimum Tier * 2
 * - Solo: D&D HP / 8, minimum Tier * 4
 *
 * @param dndHP - D&D 5e hit points (average)
 * @param classification - Result from classifyAdversary
 * @param tier - Daggerheart Tier
 * @returns Converted HP value
 */
export function convertHP(
  dndHP: number,
  classification: ClassificationResult,
  tier: Tier
): number {
  // Minions always have 1 HP
  if (classification.type === AdversaryType.MINION) {
    return 1;
  }

  // Solo creatures use different divisor and minimum
  if (classification.type === AdversaryType.SOLO) {
    const converted = Math.floor(dndHP / 8);
    const minimum = tier * 4;
    return Math.max(converted, minimum);
  }

  // Standard and other types
  const converted = Math.floor(dndHP / 10);
  const minimum = tier * 2;
  return Math.max(converted, minimum);
}

// ============================================================================
// STRESS CONVERSION
// ============================================================================

/**
 * Determines Stress pool based on adversary type and Tier.
 *
 * Stress rules:
 * - Minion: 0 Stress
 * - Standard: Tier
 * - Solo: Tier * 2
 *
 * @param classification - Result from classifyAdversary
 * @param tier - Daggerheart Tier
 * @returns Stress pool value
 */
export function calculateStress(classification: ClassificationResult, tier: Tier): number {
  // Minions have no Stress pool
  if (classification.type === AdversaryType.MINION) {
    return 0;
  }

  // Solo creatures have double Stress
  if (classification.type === AdversaryType.SOLO) {
    return tier * 2;
  }

  // Standard and other types
  return tier;
}

// ============================================================================
// EVASION CONVERSION
// ============================================================================

/**
 * Converts D&D 5e AC to Daggerheart Evasion.
 *
 * Formula: floor(AC * 0.8) + Tier
 *
 * This formula accounts for:
 * - D&D's higher AC range (10-25+)
 * - Daggerheart's lower target numbers (8-22)
 * - Tier-based scaling for higher-level adversaries
 *
 * @param ac - D&D 5e Armor Class
 * @param tier - Daggerheart Tier
 * @returns Evasion value
 */
export function convertEvasion(ac: number, tier: Tier): number {
  return Math.floor(ac * 0.8) + tier;
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts all core statistics from a D&D 5e monster to Daggerheart format.
 *
 * This is the primary entry point for stat conversion, combining all
 * individual conversion functions into a single result.
 *
 * @param statBlock - D&D 5e monster stat block
 * @param classification - Result from classifyAdversary
 * @returns CoreStats object with all converted values
 *
 * @example
 * ```typescript
 * import { convertCoreStats } from './statConversion';
 * import { classifyAdversary } from './classifyAdversary';
 *
 * const classification = classifyAdversary(goblin);
 * const stats = convertCoreStats(goblin, classification);
 * // {
 * //   tier: 1,
 * //   difficulty: 'Minor',
 * //   thresholds: { minor: 3, major: 6, severe: 9 },
 * //   hp: 2,
 * //   stress: 1,
 * //   evasion: 13
 * // }
 * ```
 */
export function convertCoreStats(
  statBlock: DnD5eMonster,
  classification: ClassificationResult
): CoreStats {
  // Extract CR as numeric value
  const cr =
    typeof statBlock.challengeRating.cr === 'string'
      ? parseCR(statBlock.challengeRating.cr)
      : statBlock.challengeRating.cr;

  // Determine Tier from CR
  const tier = crToTier(cr);

  // Determine Difficulty from classification, CR, and Tier
  const difficulty = determineDifficulty(classification, cr, tier);

  // Calculate thresholds from Tier and Difficulty
  const thresholds = calculateThresholds(tier, difficulty);

  // Convert HP
  const hp = convertHP(statBlock.hitPoints.average, classification, tier);

  // Calculate Stress
  const stress = calculateStress(classification, tier);

  // Convert Evasion from AC
  const evasion = convertEvasion(statBlock.armorClass.value, tier);

  return {
    tier,
    difficulty,
    thresholds,
    hp,
    stress,
    evasion,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validates that core stats are within expected ranges.
 *
 * @param stats - CoreStats to validate
 * @returns Object with validation result and any issues found
 */
export function validateCoreStats(stats: CoreStats): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Validate Tier
  if (stats.tier < 1 || stats.tier > 4) {
    issues.push(`Tier ${stats.tier} out of range (1-4)`);
  }

  // Validate HP
  if (stats.hp < 1) {
    issues.push(`HP ${stats.hp} must be at least 1`);
  }

  // Validate Stress
  if (stats.stress < 0) {
    issues.push(`Stress ${stats.stress} cannot be negative`);
  }

  // Validate Evasion
  if (stats.evasion < 5 || stats.evasion > 30) {
    issues.push(`Evasion ${stats.evasion} outside expected range (5-30)`);
  }

  // Validate threshold ordering
  if (stats.thresholds.minor >= stats.thresholds.major) {
    issues.push('Minor threshold must be less than Major threshold');
  }
  if (stats.thresholds.major >= stats.thresholds.severe) {
    issues.push('Major threshold must be less than Severe threshold');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Provides human-readable summary of converted stats.
 *
 * @param stats - CoreStats to summarize
 * @returns Formatted string description
 */
export function summarizeCoreStats(stats: CoreStats): string {
  const lines = [
    `Tier ${stats.tier} ${stats.difficulty} Adversary`,
    `HP: ${stats.hp} | Stress: ${stats.stress} | Evasion: ${stats.evasion}`,
    `Thresholds: Minor ${stats.thresholds.minor} / Major ${stats.thresholds.major} / Severe ${stats.thresholds.severe}`,
  ];
  return lines.join('\n');
}
