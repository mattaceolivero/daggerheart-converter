/**
 * Test Utilities
 *
 * Helper functions for creating mock data and validating conversions.
 *
 * @module tests/helpers/testUtils
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  SpecialAlignment,
  AttackType,
  DnD5eDamageType,
} from '../../src/models/dnd5e';
import {
  DaggerheartAdversary,
  Tier,
  AdversaryType,
  FeatureType,
  DamageType,
  RangeBand,
} from '../../src/models/daggerheart';

// ============================================================================
// MOCK STAT BLOCK CREATION
// ============================================================================

/**
 * Default minimal stat block for testing.
 */
const DEFAULT_STAT_BLOCK: DnD5eMonster = {
  name: 'Test Creature',
  size: CreatureSize.MEDIUM,
  creatureType: CreatureType.HUMANOID,
  alignment: SpecialAlignment.UNALIGNED,
  armorClass: { value: 12 },
  hitPoints: {
    average: 11,
    formula: { count: 2, dieSize: 8, modifier: 2 },
  },
  speed: { walk: 30 },
  abilityScores: {
    STR: 10,
    DEX: 14,
    CON: 12,
    INT: 10,
    WIS: 10,
    CHA: 10,
  },
  senses: {
    specialSenses: [],
    passivePerception: 10,
  },
  languages: ['Common'],
  challengeRating: { cr: 1, xp: 200 },
  proficiencyBonus: 2,
};

/**
 * Creates a mock D&D 5e stat block with optional overrides.
 *
 * @param overrides - Partial stat block to merge with defaults
 * @returns Complete DnD5eMonster for testing
 *
 * @example
 * ```typescript
 * const goblin = createMockStatBlock({
 *   name: 'Goblin',
 *   size: CreatureSize.SMALL,
 *   challengeRating: { cr: '1/4', xp: 50 },
 * });
 * ```
 */
export function createMockStatBlock(
  overrides?: Partial<DnD5eMonster>
): DnD5eMonster {
  return {
    ...DEFAULT_STAT_BLOCK,
    ...overrides,
    armorClass: {
      ...DEFAULT_STAT_BLOCK.armorClass,
      ...(overrides?.armorClass || {}),
    },
    hitPoints: {
      ...DEFAULT_STAT_BLOCK.hitPoints,
      ...(overrides?.hitPoints || {}),
    },
    speed: {
      ...DEFAULT_STAT_BLOCK.speed,
      ...(overrides?.speed || {}),
    },
    abilityScores: {
      ...DEFAULT_STAT_BLOCK.abilityScores,
      ...(overrides?.abilityScores || {}),
    },
    senses: {
      ...DEFAULT_STAT_BLOCK.senses,
      ...(overrides?.senses || {}),
    },
    challengeRating: {
      ...DEFAULT_STAT_BLOCK.challengeRating,
      ...(overrides?.challengeRating || {}),
    },
  };
}

/**
 * Creates a minimal minion-type stat block.
 */
export function createMinionStatBlock(
  overrides?: Partial<DnD5eMonster>
): DnD5eMonster {
  return createMockStatBlock({
    name: 'Minion Creature',
    hitPoints: {
      average: 7,
      formula: { count: 2, dieSize: 6, modifier: 0 },
    },
    challengeRating: { cr: '1/4', xp: 50 },
    ...overrides,
  });
}

/**
 * Creates a Solo-type stat block with legendary actions.
 */
export function createSoloStatBlock(
  overrides?: Partial<DnD5eMonster>
): DnD5eMonster {
  return createMockStatBlock({
    name: 'Solo Creature',
    hitPoints: {
      average: 200,
      formula: { count: 20, dieSize: 12, modifier: 80 },
    },
    armorClass: { value: 18 },
    challengeRating: { cr: 15, xp: 13000 },
    proficiencyBonus: 5,
    legendaryActions: {
      count: 3,
      actions: [
        { name: 'Detect', description: 'Makes a Perception check.', cost: 1 },
        { name: 'Attack', description: 'Makes one melee attack.', cost: 2 },
      ],
    },
    legendaryResistance: { count: 3 },
    ...overrides,
  });
}

/**
 * Creates a spellcaster stat block.
 */
export function createSpellcasterStatBlock(
  overrides?: Partial<DnD5eMonster>
): DnD5eMonster {
  return createMockStatBlock({
    name: 'Spellcaster Creature',
    abilityScores: {
      STR: 8,
      DEX: 14,
      CON: 12,
      INT: 17,
      WIS: 12,
      CHA: 10,
    },
    spellcasting: {
      type: 'traditional',
      ability: 'INT' as any,
      spellSaveDC: 15,
      spellAttackBonus: 7,
      spells: {
        cantrips: [
          { name: 'Fire Bolt', level: 0 },
          { name: 'Mage Hand', level: 0 },
        ],
        1: [
          { name: 'Magic Missile', level: 1 },
          { name: 'Shield', level: 1 },
        ],
        2: [{ name: 'Hold Person', level: 2 }],
      },
    },
    ...overrides,
  });
}

// ============================================================================
// ADVERSARY VALIDATION
// ============================================================================

/**
 * Validation result structure.
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that a Daggerheart adversary has all required fields
 * and values are within expected ranges.
 *
 * @param adversary - The adversary to validate
 * @returns Validation result with any issues found
 *
 * @example
 * ```typescript
 * const adversary = convertFromStatBlock(goblin);
 * const result = assertValidAdversary(adversary.adversary);
 * expect(result.isValid).toBe(true);
 * ```
 */
export function assertValidAdversary(
  adversary: DaggerheartAdversary
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!adversary.name || adversary.name.trim() === '') {
    errors.push('Missing required field: name');
  }

  if (!adversary.tier || adversary.tier < 1 || adversary.tier > 4) {
    errors.push(`Invalid tier: ${adversary.tier} (must be 1-4)`);
  }

  if (!adversary.type) {
    errors.push('Missing required field: type');
  }

  // Evasion range
  if (adversary.evasion < 5 || adversary.evasion > 30) {
    warnings.push(`Unusual evasion: ${adversary.evasion} (expected 5-30)`);
  }

  // HP must be positive
  if (adversary.hp < 1) {
    errors.push(`Invalid HP: ${adversary.hp} (must be >= 1)`);
  }

  // Stress must be non-negative
  if (adversary.stress < 0) {
    errors.push(`Invalid Stress: ${adversary.stress} (must be >= 0)`);
  }

  // Thresholds must be ascending
  if (adversary.thresholds) {
    const { minor, major, severe } = adversary.thresholds;
    if (minor >= major) {
      errors.push(`Invalid thresholds: minor (${minor}) >= major (${major})`);
    }
    if (major >= severe) {
      errors.push(`Invalid thresholds: major (${major}) >= severe (${severe})`);
    }
  } else {
    errors.push('Missing required field: thresholds');
  }

  // Attack must exist
  if (!adversary.attack) {
    errors.push('Missing required field: attack');
  } else {
    if (!adversary.attack.name) {
      errors.push('Attack missing name');
    }
    if (!adversary.attack.damage) {
      errors.push('Attack missing damage');
    }
  }

  // Features must be an array
  if (!Array.isArray(adversary.features)) {
    errors.push('Missing or invalid field: features (must be array)');
  }

  // Description must exist
  if (!adversary.description || !adversary.description.shortDescription) {
    warnings.push('Missing short description');
  }

  // Motives must exist
  if (!adversary.motivesAndTactics || !adversary.motivesAndTactics.phrases) {
    warnings.push('Missing motives and tactics');
  }

  // Experience must exist
  if (!Array.isArray(adversary.experience) || adversary.experience.length === 0) {
    warnings.push('Missing experience topics');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates adversary type matches expected constraints.
 */
export function validateAdversaryType(
  adversary: DaggerheartAdversary,
  expectedType: AdversaryType
): boolean {
  return adversary.type === expectedType;
}

/**
 * Validates adversary tier matches expected value.
 */
export function validateAdversaryTier(
  adversary: DaggerheartAdversary,
  expectedTier: Tier
): boolean {
  return adversary.tier === expectedTier;
}

// ============================================================================
// COMPARISON UTILITIES
// ============================================================================

/**
 * Compares two adversaries and returns differences.
 */
export function compareAdversaries(
  a: DaggerheartAdversary,
  b: DaggerheartAdversary
): string[] {
  const differences: string[] = [];

  if (a.tier !== b.tier) {
    differences.push(`Tier: ${a.tier} vs ${b.tier}`);
  }
  if (a.type !== b.type) {
    differences.push(`Type: ${a.type} vs ${b.type}`);
  }
  if (a.hp !== b.hp) {
    differences.push(`HP: ${a.hp} vs ${b.hp}`);
  }
  if (a.evasion !== b.evasion) {
    differences.push(`Evasion: ${a.evasion} vs ${b.evasion}`);
  }
  if (a.stress !== b.stress) {
    differences.push(`Stress: ${a.stress} vs ${b.stress}`);
  }
  if (a.features.length !== b.features.length) {
    differences.push(`Features: ${a.features.length} vs ${b.features.length}`);
  }

  return differences;
}

// ============================================================================
// TIER EXPECTATIONS
// ============================================================================

/**
 * Expected stat ranges by tier for validation.
 */
export const TIER_EXPECTATIONS = {
  [Tier.ONE]: {
    evasion: { min: 8, max: 15 },
    hp: { minion: 1, standard: { min: 2, max: 6 }, solo: { min: 6, max: 10 } },
    stress: { min: 0, max: 4 },
    thresholds: {
      minor: { min: 3, max: 5 },
      major: { min: 6, max: 10 },
      severe: { min: 9, max: 15 },
    },
  },
  [Tier.TWO]: {
    evasion: { min: 11, max: 18 },
    hp: { minion: 1, standard: { min: 3, max: 8 }, solo: { min: 8, max: 15 } },
    stress: { min: 0, max: 6 },
    thresholds: {
      minor: { min: 4, max: 7 },
      major: { min: 8, max: 14 },
      severe: { min: 12, max: 21 },
    },
  },
  [Tier.THREE]: {
    evasion: { min: 14, max: 21 },
    hp: { minion: 1, standard: { min: 4, max: 10 }, solo: { min: 10, max: 25 } },
    stress: { min: 0, max: 8 },
    thresholds: {
      minor: { min: 5, max: 9 },
      major: { min: 10, max: 18 },
      severe: { min: 15, max: 27 },
    },
  },
  [Tier.FOUR]: {
    evasion: { min: 17, max: 24 },
    hp: { minion: 1, standard: { min: 5, max: 15 }, solo: { min: 15, max: 50 } },
    stress: { min: 0, max: 12 },
    thresholds: {
      minor: { min: 6, max: 11 },
      major: { min: 12, max: 22 },
      severe: { min: 18, max: 33 },
    },
  },
} as const;

/**
 * Validates an adversary against tier expectations.
 */
export function validateTierExpectations(
  adversary: DaggerheartAdversary
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tier = adversary.tier as Tier;
  const expectations = TIER_EXPECTATIONS[tier];

  if (!expectations) {
    errors.push(`Unknown tier: ${tier}`);
    return { isValid: false, errors, warnings };
  }

  // Evasion check
  if (
    adversary.evasion < expectations.evasion.min ||
    adversary.evasion > expectations.evasion.max
  ) {
    warnings.push(
      `Evasion ${adversary.evasion} outside expected range ${expectations.evasion.min}-${expectations.evasion.max} for Tier ${tier}`
    );
  }

  // HP check (depends on type)
  if (adversary.type === AdversaryType.MINION) {
    if (adversary.hp !== expectations.hp.minion) {
      errors.push(`Minion HP should be ${expectations.hp.minion}, got ${adversary.hp}`);
    }
  } else if (adversary.type === AdversaryType.SOLO) {
    if (
      adversary.hp < expectations.hp.solo.min ||
      adversary.hp > expectations.hp.solo.max
    ) {
      warnings.push(
        `Solo HP ${adversary.hp} outside expected range ${expectations.hp.solo.min}-${expectations.hp.solo.max} for Tier ${tier}`
      );
    }
  } else {
    if (
      adversary.hp < expectations.hp.standard.min ||
      adversary.hp > expectations.hp.standard.max
    ) {
      warnings.push(
        `Standard HP ${adversary.hp} outside expected range ${expectations.hp.standard.min}-${expectations.hp.standard.max} for Tier ${tier}`
      );
    }
  }

  // Stress check
  if (adversary.stress > expectations.stress.max) {
    warnings.push(
      `Stress ${adversary.stress} exceeds expected max ${expectations.stress.max} for Tier ${tier}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  DnD5eMonster,
  DaggerheartAdversary,
  CreatureSize,
  CreatureType,
  SpecialAlignment,
  AttackType,
  DnD5eDamageType,
  Tier,
  AdversaryType,
  FeatureType,
  DamageType,
  RangeBand,
};
