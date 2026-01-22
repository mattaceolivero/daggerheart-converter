/**
 * CR to Tier Conversion Logic
 *
 * Converts D&D 5e Challenge Rating to Daggerheart Tier (1-4).
 * Provides helper functions for Tier-based stat defaults.
 *
 * @module crToTier
 * @version 1.0.0
 */

import { Tier, TIER_DEFAULTS } from '../models/daggerheart';

// ============================================================================
// CR TO TIER MAPPING
// ============================================================================

/**
 * CR breakpoints for Tier mapping.
 *
 * | D&D 5e CR | Daggerheart Tier | Rationale |
 * |-----------|------------------|-----------|
 * | 0-2       | Tier 1           | Basic threats, suitable for new adventurers |
 * | 3-6       | Tier 2           | Moderate threats, experienced parties |
 * | 7-13      | Tier 3           | Serious threats, veteran adventurers |
 * | 14-30     | Tier 4           | Epic threats, legendary heroes |
 */
const CR_TIER_BREAKPOINTS: ReadonlyArray<{ maxCR: number; tier: Tier }> = [
  { maxCR: 2, tier: Tier.ONE },
  { maxCR: 6, tier: Tier.TWO },
  { maxCR: 13, tier: Tier.THREE },
  { maxCR: Infinity, tier: Tier.FOUR },
] as const;

// ============================================================================
// CORE CONVERSION FUNCTION
// ============================================================================

/**
 * Converts D&D 5e Challenge Rating to Daggerheart Tier.
 *
 * Handles standard CR values (0-30) and fractional CRs commonly used
 * for weak creatures (1/8, 1/4, 1/2 represented as 0.125, 0.25, 0.5).
 *
 * @param cr - Challenge Rating (0-30, supports fractions as decimals)
 * @returns Daggerheart Tier (1-4)
 * @throws Error if CR is negative
 *
 * @example
 * ```typescript
 * crToTier(0);     // Tier.ONE (1)
 * crToTier(0.5);   // Tier.ONE (1) - CR 1/2
 * crToTier(5);     // Tier.TWO (2)
 * crToTier(10);    // Tier.THREE (3)
 * crToTier(20);    // Tier.FOUR (4)
 * ```
 */
export function crToTier(cr: number): Tier {
  if (cr < 0) {
    throw new Error(`Invalid CR: ${cr}. Challenge Rating must be non-negative.`);
  }

  for (const breakpoint of CR_TIER_BREAKPOINTS) {
    if (cr <= breakpoint.maxCR) {
      return breakpoint.tier;
    }
  }

  // Fallback (should never reach due to Infinity in last breakpoint)
  return Tier.FOUR;
}

// ============================================================================
// FRACTIONAL CR UTILITIES
// ============================================================================

/**
 * Common fractional CR values as decimals.
 * Use these constants for clarity when working with weak creatures.
 */
export const FRACTIONAL_CR = {
  /** CR 0 - Harmless creatures */
  ZERO: 0,
  /** CR 1/8 - Very weak creatures (e.g., rats, small critters) */
  ONE_EIGHTH: 0.125,
  /** CR 1/4 - Weak creatures (e.g., goblins, wolves) */
  ONE_QUARTER: 0.25,
  /** CR 1/2 - Slightly weak creatures (e.g., orcs, zombies) */
  ONE_HALF: 0.5,
} as const;

/**
 * Converts a fractional CR string to its decimal equivalent.
 *
 * @param crString - CR as string (e.g., "1/8", "1/4", "1/2", "5")
 * @returns Numeric CR value
 * @throws Error if string cannot be parsed
 *
 * @example
 * ```typescript
 * parseCRString("1/8");  // 0.125
 * parseCRString("1/2");  // 0.5
 * parseCRString("5");    // 5
 * parseCRString("10");   // 10
 * ```
 */
export function parseCRString(crString: string): number {
  const trimmed = crString.trim();

  // Handle fractional notation
  if (trimmed.includes('/')) {
    const parts = trimmed.split('/').map(Number);
    const numerator = parts[0];
    const denominator = parts[1];
    if (
      numerator === undefined ||
      denominator === undefined ||
      isNaN(numerator) ||
      isNaN(denominator) ||
      denominator === 0
    ) {
      throw new Error(`Invalid fractional CR: ${crString}`);
    }
    return numerator / denominator;
  }

  // Handle integer/decimal notation
  const parsed = Number(trimmed);
  if (isNaN(parsed)) {
    throw new Error(`Invalid CR string: ${crString}`);
  }

  return parsed;
}

// ============================================================================
// TIER-BASED DEFAULTS
// ============================================================================

/**
 * HP range for a given Tier.
 */
export interface HPRange {
  /** Minimum HP for this tier (standard adversary) */
  min: number;
  /** Maximum HP for this tier (solo adversary) */
  max: number;
}

/**
 * Get suggested HP range for a given Tier.
 *
 * Returns the range from standard minimum to solo maximum,
 * covering all adversary types for that tier.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns HP range with min and max values
 *
 * @example
 * ```typescript
 * getTierHPRange(Tier.ONE);   // { min: 2, max: 8 }
 * getTierHPRange(Tier.TWO);   // { min: 3, max: 9 }
 * getTierHPRange(Tier.THREE); // { min: 4, max: 11 }
 * getTierHPRange(Tier.FOUR);  // { min: 5, max: 12 }
 * ```
 */
export function getTierHPRange(tier: Tier): HPRange {
  const defaults = TIER_DEFAULTS[tier];
  return {
    min: defaults.hp.standard[0],
    max: defaults.hp.solo[1],
  };
}

/**
 * Get suggested Stress pool for a given Tier.
 *
 * Returns the middle of the stress range as a sensible default.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Suggested Stress value
 *
 * @example
 * ```typescript
 * getTierStress(Tier.ONE);   // 2
 * getTierStress(Tier.TWO);   // 4
 * getTierStress(Tier.THREE); // 5
 * getTierStress(Tier.FOUR);  // 7
 * ```
 */
export function getTierStress(tier: Tier): number {
  const defaults = TIER_DEFAULTS[tier];
  const [min, max] = defaults.stress.range;
  return Math.floor((min + max) / 2);
}

/**
 * Stress range for a given Tier.
 */
export interface StressRange {
  /** Minimum Stress for this tier */
  min: number;
  /** Maximum Stress for this tier */
  max: number;
}

/**
 * Get the full Stress range for a given Tier.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Stress range with min and max values
 *
 * @example
 * ```typescript
 * getTierStressRange(Tier.ONE);   // { min: 2, max: 3 }
 * getTierStressRange(Tier.FOUR);  // { min: 5, max: 10 }
 * ```
 */
export function getTierStressRange(tier: Tier): StressRange {
  const defaults = TIER_DEFAULTS[tier];
  return {
    min: defaults.stress.range[0],
    max: defaults.stress.range[1],
  };
}

/**
 * Get suggested Evasion value for a given Tier.
 *
 * Returns the default evasion for the tier.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Default Evasion value
 *
 * @example
 * ```typescript
 * getTierEvasion(Tier.ONE);   // 11
 * getTierEvasion(Tier.TWO);   // 14
 * getTierEvasion(Tier.THREE); // 17
 * getTierEvasion(Tier.FOUR);  // 20
 * ```
 */
export function getTierEvasion(tier: Tier): number {
  return TIER_DEFAULTS[tier].evasion.default;
}

/**
 * Evasion range for a given Tier.
 */
export interface EvasionRange {
  /** Minimum Evasion for this tier */
  min: number;
  /** Maximum Evasion for this tier */
  max: number;
}

/**
 * Get the full Evasion range for a given Tier.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Evasion range with min and max values
 */
export function getTierEvasionRange(tier: Tier): EvasionRange {
  const defaults = TIER_DEFAULTS[tier];
  return {
    min: defaults.evasion.range[0],
    max: defaults.evasion.range[1],
  };
}

/**
 * Get suggested attack modifier for a given Tier.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Default attack modifier
 *
 * @example
 * ```typescript
 * getTierAttackModifier(Tier.ONE);   // 1
 * getTierAttackModifier(Tier.FOUR);  // 4
 * ```
 */
export function getTierAttackModifier(tier: Tier): number {
  return TIER_DEFAULTS[tier].attackModifier.default;
}

/**
 * Get the damage dice pool size for a given Tier.
 *
 * This represents the number of dice rolled for damage.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Number of damage dice
 *
 * @example
 * ```typescript
 * getTierDicePool(Tier.ONE);   // 1
 * getTierDicePool(Tier.FOUR);  // 4
 * ```
 */
export function getTierDicePool(tier: Tier): number {
  return TIER_DEFAULTS[tier].dicePool;
}

// ============================================================================
// COMPLETE TIER INFO
// ============================================================================

/**
 * Complete Tier information for conversion reference.
 */
export interface TierInfo {
  /** The Tier value (1-4) */
  tier: Tier;
  /** CR range that maps to this Tier */
  crRange: { min: number; max: number };
  /** Suggested HP range */
  hpRange: HPRange;
  /** Suggested Stress value */
  stress: number;
  /** Suggested Stress range */
  stressRange: StressRange;
  /** Default Evasion */
  evasion: number;
  /** Evasion range */
  evasionRange: EvasionRange;
  /** Default attack modifier */
  attackModifier: number;
  /** Damage dice pool size */
  dicePool: number;
}

/**
 * Get complete Tier information including all suggested defaults.
 *
 * @param tier - Daggerheart Tier (1-4)
 * @returns Complete TierInfo object with all defaults
 *
 * @example
 * ```typescript
 * const info = getTierInfo(Tier.TWO);
 * console.log(info.crRange);  // { min: 3, max: 6 }
 * console.log(info.hpRange);  // { min: 3, max: 9 }
 * ```
 */
export function getTierInfo(tier: Tier): TierInfo {
  const crRanges: Record<Tier, { min: number; max: number }> = {
    [Tier.ONE]: { min: 0, max: 2 },
    [Tier.TWO]: { min: 3, max: 6 },
    [Tier.THREE]: { min: 7, max: 13 },
    [Tier.FOUR]: { min: 14, max: 30 },
  };

  return {
    tier,
    crRange: crRanges[tier],
    hpRange: getTierHPRange(tier),
    stress: getTierStress(tier),
    stressRange: getTierStressRange(tier),
    evasion: getTierEvasion(tier),
    evasionRange: getTierEvasionRange(tier),
    attackModifier: getTierAttackModifier(tier),
    dicePool: getTierDicePool(tier),
  };
}

/**
 * Get Tier information directly from a CR value.
 *
 * Convenience function that combines crToTier and getTierInfo.
 *
 * @param cr - Challenge Rating (0-30)
 * @returns Complete TierInfo for the corresponding Tier
 *
 * @example
 * ```typescript
 * const info = getTierInfoFromCR(5);
 * console.log(info.tier);     // Tier.TWO (2)
 * console.log(info.crRange);  // { min: 3, max: 6 }
 * ```
 */
export function getTierInfoFromCR(cr: number): TierInfo {
  return getTierInfo(crToTier(cr));
}
