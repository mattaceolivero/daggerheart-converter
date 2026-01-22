/**
 * Quality Assurance Validation Checklist Runner
 *
 * Comprehensive validation system for checking converted Daggerheart adversaries
 * for quality, consistency, and balance. Provides detailed reports with
 * pass/warn/fail results and automatic fix suggestions.
 *
 * @module qualityChecker
 * @version 1.0.0
 */

import {
  DaggerheartAdversary,
  Tier,
  AdversaryType,
  DamageType,
  FeatureType,
  FeatureCostType,
  RangeBand,
  Feature,
  Attack,
  DamageExpression,
  TIER_DEFAULTS,
  DAMAGE_DIE_BY_TYPE,
} from '../models/daggerheart';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Severity level for validation issues.
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Individual validation issue found during checking.
 */
export interface ValidationIssue {
  /** Field or area where the issue was found */
  field: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Human-readable description of the issue */
  message: string;
  /** Optional suggestion for fixing the issue */
  suggestion?: string;
}

/**
 * Complete validation result for an adversary.
 */
export interface ValidationResult {
  /** Whether the adversary passes all required validations */
  isValid: boolean;
  /** Quality score from 0-100 */
  score: number;
  /** All issues found during validation */
  issues: ValidationIssue[];
  /** Human-readable summary of validation results */
  summary: string;
}

/**
 * Result of auto-fix attempt.
 */
export interface FixResult {
  /** The fixed adversary */
  fixed: DaggerheartAdversary;
  /** List of changes made */
  changes: string[];
}

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Expected stress pool ranges by adversary type.
 */
const STRESS_BY_TYPE: Record<AdversaryType, { min: number; max: number }> = {
  [AdversaryType.MINION]: { min: 0, max: 1 },
  [AdversaryType.STANDARD]: { min: 2, max: 6 },
  [AdversaryType.SKULK]: { min: 2, max: 5 },
  [AdversaryType.BRUISER]: { min: 2, max: 5 },
  [AdversaryType.RANGED]: { min: 2, max: 5 },
  [AdversaryType.SUPPORT]: { min: 3, max: 8 },
  [AdversaryType.LEADER]: { min: 3, max: 8 },
  [AdversaryType.HORDE]: { min: 1, max: 3 },
  [AdversaryType.SOLO]: { min: 5, max: 15 },
  [AdversaryType.SOCIAL]: { min: 2, max: 6 },
  [AdversaryType.SWARM]: { min: 1, max: 3 },
};

/**
 * Expected HP multipliers by adversary type relative to tier base.
 */
const HP_MULTIPLIER_BY_TYPE: Record<AdversaryType, { min: number; max: number }> = {
  [AdversaryType.MINION]: { min: 1, max: 1 }, // Always 1 HP
  [AdversaryType.STANDARD]: { min: 0.8, max: 1.2 },
  [AdversaryType.SKULK]: { min: 0.6, max: 1.0 },
  [AdversaryType.BRUISER]: { min: 1.2, max: 1.6 },
  [AdversaryType.RANGED]: { min: 0.6, max: 1.0 },
  [AdversaryType.SUPPORT]: { min: 0.7, max: 1.1 },
  [AdversaryType.LEADER]: { min: 1.0, max: 1.4 },
  [AdversaryType.HORDE]: { min: 1.5, max: 2.5 },
  [AdversaryType.SOLO]: { min: 1.5, max: 2.5 },
  [AdversaryType.SOCIAL]: { min: 0.5, max: 1.0 },
  [AdversaryType.SWARM]: { min: 1.0, max: 1.5 },
};

/**
 * Valid dice sizes for damage.
 */
const VALID_DICE_SIZES = [4, 6, 8, 10, 12] as const;

/**
 * Maximum feature cost by type.
 */
const MAX_FEATURE_COST: Record<FeatureCostType, number> = {
  [FeatureCostType.NONE]: 0,
  [FeatureCostType.STRESS]: 5,
  [FeatureCostType.FEAR]: 3,
};

// ============================================================================
// STRUCTURAL VALIDATION
// ============================================================================

/**
 * Validates that all required fields are present.
 */
function validateStructure(adversary: DaggerheartAdversary): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Required string fields
  if (!adversary.name || adversary.name.trim() === '') {
    issues.push({
      field: 'name',
      severity: 'error',
      message: 'Adversary name is required',
      suggestion: 'Add a descriptive name for the adversary',
    });
  }

  // Tier validation (1-4)
  if (adversary.tier === undefined || adversary.tier === null) {
    issues.push({
      field: 'tier',
      severity: 'error',
      message: 'Tier is required',
      suggestion: 'Set tier to 1, 2, 3, or 4',
    });
  } else if (adversary.tier < 1 || adversary.tier > 4) {
    issues.push({
      field: 'tier',
      severity: 'error',
      message: `Tier must be 1-4, got ${adversary.tier}`,
      suggestion: 'Adjust tier to be within valid range',
    });
  }

  // HP validation
  if (adversary.hp === undefined || adversary.hp === null) {
    issues.push({
      field: 'hp',
      severity: 'error',
      message: 'HP is required',
      suggestion: 'Set HP based on tier and type',
    });
  } else if (adversary.hp <= 0) {
    issues.push({
      field: 'hp',
      severity: 'error',
      message: `HP must be greater than 0, got ${adversary.hp}`,
      suggestion: 'Set HP to at least 1',
    });
  }

  // Attack validation
  if (!adversary.attack) {
    issues.push({
      field: 'attack',
      severity: 'error',
      message: 'At least one attack is required',
      suggestion: 'Add a primary attack with name, modifier, range, and damage',
    });
  } else {
    // Validate attack structure
    if (!adversary.attack.name) {
      issues.push({
        field: 'attack.name',
        severity: 'error',
        message: 'Attack must have a name',
        suggestion: 'Add a descriptive attack name like "Claw" or "Sword"',
      });
    }
    if (!adversary.attack.damage) {
      issues.push({
        field: 'attack.damage',
        severity: 'error',
        message: 'Attack must have damage defined',
        suggestion: 'Add damage with diceCount, diceSize, modifier, and damageType',
      });
    }
  }

  // Features array validation
  if (!adversary.features) {
    issues.push({
      field: 'features',
      severity: 'error',
      message: 'Features array is required',
      suggestion: 'Add at least an empty features array',
    });
  } else if (!Array.isArray(adversary.features)) {
    issues.push({
      field: 'features',
      severity: 'error',
      message: 'Features must be an array',
      suggestion: 'Convert features to an array format',
    });
  } else if (adversary.features.length === 0 && !adversary.attack) {
    issues.push({
      field: 'features',
      severity: 'error',
      message: 'Adversary must have at least one attack or feature',
      suggestion: 'Add either an attack or a feature',
    });
  }

  // Thresholds validation
  if (!adversary.thresholds) {
    issues.push({
      field: 'thresholds',
      severity: 'error',
      message: 'Damage thresholds are required',
      suggestion: 'Add thresholds with minor, major, and severe values',
    });
  } else {
    const { minor, major, severe } = adversary.thresholds;
    if (minor === undefined || major === undefined || severe === undefined) {
      issues.push({
        field: 'thresholds',
        severity: 'error',
        message: 'All threshold values (minor, major, severe) are required',
        suggestion: 'Add all three threshold values',
      });
    } else if (!(minor < major && major < severe)) {
      issues.push({
        field: 'thresholds',
        severity: 'error',
        message: `Thresholds must be in ascending order (${minor} < ${major} < ${severe})`,
        suggestion: 'Adjust thresholds so minor < major < severe',
      });
    }
  }

  // Evasion validation
  if (adversary.evasion === undefined || adversary.evasion === null) {
    issues.push({
      field: 'evasion',
      severity: 'error',
      message: 'Evasion is required',
      suggestion: 'Set evasion based on tier (typically 8-22)',
    });
  }

  // Stress validation
  if (adversary.stress === undefined || adversary.stress === null) {
    issues.push({
      field: 'stress',
      severity: 'error',
      message: 'Stress pool is required',
      suggestion: 'Set stress based on tier and type',
    });
  }

  return issues;
}

// ============================================================================
// BALANCE VALIDATION
// ============================================================================

/**
 * Validates that stats are appropriately balanced for tier and type.
 */
function validateBalance(adversary: DaggerheartAdversary): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const tier = adversary.tier as Tier;
  const tierDefaults = TIER_DEFAULTS[tier];

  if (!tierDefaults) {
    return issues; // Invalid tier, caught by structural validation
  }

  // HP balance check
  if (adversary.hp !== undefined && adversary.type) {
    const hpMultiplier = HP_MULTIPLIER_BY_TYPE[adversary.type];
    const baseHP = tierDefaults.hp.standard as readonly [number, number];
    const expectedMin = Math.floor(baseHP[0] * hpMultiplier.min);
    const expectedMax = Math.ceil(baseHP[1] * hpMultiplier.max);

    // Special case for Minions - always 1 HP
    if (adversary.type === AdversaryType.MINION) {
      if (adversary.hp !== 1) {
        issues.push({
          field: 'hp',
          severity: 'warning',
          message: `Minions should have 1 HP, got ${adversary.hp}`,
          suggestion: 'Set HP to 1 for Minion type',
        });
      }
    } else if (adversary.hp < expectedMin || adversary.hp > expectedMax * 2) {
      issues.push({
        field: 'hp',
        severity: 'warning',
        message: `HP ${adversary.hp} may be unbalanced for Tier ${tier} ${adversary.type} (expected ${expectedMin}-${expectedMax})`,
        suggestion: `Consider adjusting HP to ${expectedMin}-${expectedMax} range`,
      });
    }
  }

  // Attack modifier balance check
  if (adversary.attack?.modifier !== undefined) {
    const { range: modRange } = tierDefaults.attackModifier;
    const modifier = adversary.attack.modifier;

    if (modifier < modRange[0] - 1 || modifier > modRange[1] + 2) {
      issues.push({
        field: 'attack.modifier',
        severity: 'warning',
        message: `Attack modifier ${modifier} may be unbalanced for Tier ${tier} (expected ${modRange[0]}-${modRange[1]})`,
        suggestion: `Consider adjusting modifier to ${modRange[0]}-${modRange[1]} range`,
      });
    }
  }

  // Damage dice balance check
  if (adversary.attack?.damage) {
    const damage = adversary.attack.damage;
    const expectedDiceCount = tierDefaults.dicePool;

    // Check dice count
    if (damage.diceCount < 1) {
      issues.push({
        field: 'attack.damage.diceCount',
        severity: 'error',
        message: 'Damage must have at least 1 die',
        suggestion: 'Set diceCount to at least 1',
      });
    } else if (damage.diceCount > expectedDiceCount + 2) {
      issues.push({
        field: 'attack.damage.diceCount',
        severity: 'warning',
        message: `${damage.diceCount} dice may be too many for Tier ${tier} (expected ~${expectedDiceCount})`,
        suggestion: `Consider reducing to ${expectedDiceCount} dice`,
      });
    }

    // Check dice size validity
    if (!VALID_DICE_SIZES.includes(damage.diceSize as 4 | 6 | 8 | 10 | 12)) {
      issues.push({
        field: 'attack.damage.diceSize',
        severity: 'error',
        message: `Invalid dice size: d${damage.diceSize}`,
        suggestion: 'Use d4, d6, d8, d10, or d12',
      });
    }

    // Check dice size is appropriate for type
    if (adversary.type) {
      const expectedDice = DAMAGE_DIE_BY_TYPE[adversary.type];
      if (expectedDice !== 'flat' && Array.isArray(expectedDice)) {
        if (damage.diceSize < expectedDice[0] - 2 || damage.diceSize > expectedDice[1] + 2) {
          issues.push({
            field: 'attack.damage.diceSize',
            severity: 'info',
            message: `d${damage.diceSize} is unusual for ${adversary.type} (typical: d${expectedDice[0]}-d${expectedDice[1]})`,
            suggestion: `Consider using d${expectedDice[0]} or d${expectedDice[1]}`,
          });
        }
      }
    }
  }

  // Stress pool balance check
  if (adversary.stress !== undefined && adversary.type) {
    const stressRange = STRESS_BY_TYPE[adversary.type];
    if (adversary.stress < stressRange.min || adversary.stress > stressRange.max + tier) {
      issues.push({
        field: 'stress',
        severity: 'warning',
        message: `Stress ${adversary.stress} may be unbalanced for ${adversary.type} (expected ${stressRange.min}-${stressRange.max + tier})`,
        suggestion: `Consider adjusting stress to ${stressRange.min}-${stressRange.max + tier} range`,
      });
    }
  }

  // Evasion balance check
  if (adversary.evasion !== undefined) {
    const { range: evasionRange } = tierDefaults.evasion;
    if (adversary.evasion < evasionRange[0] - 2 || adversary.evasion > evasionRange[1] + 2) {
      issues.push({
        field: 'evasion',
        severity: 'warning',
        message: `Evasion ${adversary.evasion} may be unbalanced for Tier ${tier} (expected ${evasionRange[0]}-${evasionRange[1]})`,
        suggestion: `Consider adjusting evasion to ${evasionRange[0]}-${evasionRange[1]} range`,
      });
    }
  }

  // Feature cost balance check
  for (const feature of adversary.features || []) {
    if (feature.cost) {
      const maxCost = MAX_FEATURE_COST[feature.cost.type];
      const amount = feature.cost.amount || 1;
      if (amount > maxCost) {
        issues.push({
          field: `features.${feature.name}.cost`,
          severity: 'warning',
          message: `Feature "${feature.name}" cost of ${amount} ${feature.cost.type} is high (max typical: ${maxCost})`,
          suggestion: `Consider reducing cost to ${maxCost} or less`,
        });
      }
    }
  }

  return issues;
}

// ============================================================================
// CONSISTENCY VALIDATION
// ============================================================================

/**
 * Validates internal consistency of the adversary.
 */
function validateConsistency(adversary: DaggerheartAdversary): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for duplicate features
  const featureNames = new Set<string>();
  for (const feature of adversary.features || []) {
    if (featureNames.has(feature.name.toLowerCase())) {
      issues.push({
        field: 'features',
        severity: 'warning',
        message: `Duplicate feature name: "${feature.name}"`,
        suggestion: 'Remove duplicate or rename one of the features',
      });
    }
    featureNames.add(feature.name.toLowerCase());
  }

  // Check feature types are correctly assigned
  for (const feature of adversary.features || []) {
    // Reactions should have triggers
    if (feature.type === FeatureType.REACTION && !feature.trigger) {
      issues.push({
        field: `features.${feature.name}.trigger`,
        severity: 'warning',
        message: `Reaction "${feature.name}" should have a trigger defined`,
        suggestion: 'Add trigger.description explaining when this reaction activates',
      });
    }

    // Passives shouldn't have costs
    if (feature.type === FeatureType.PASSIVE && feature.cost?.type !== FeatureCostType.NONE) {
      issues.push({
        field: `features.${feature.name}.cost`,
        severity: 'info',
        message: `Passive "${feature.name}" has a cost, which is unusual`,
        suggestion: 'Consider changing to Action type or removing the cost',
      });
    }

    // Check feature description for damage type consistency
    if (feature.damage) {
      const descLower = feature.description.toLowerCase();
      const hasMagicKeywords =
        descLower.includes('magic') ||
        descLower.includes('spell') ||
        descLower.includes('arcane') ||
        descLower.includes('elemental');
      const hasPhysicalKeywords =
        descLower.includes('weapon') ||
        descLower.includes('claw') ||
        descLower.includes('bite') ||
        descLower.includes('fist');

      if (feature.damage.damageType === DamageType.MAGIC && hasPhysicalKeywords && !hasMagicKeywords) {
        issues.push({
          field: `features.${feature.name}.damage.damageType`,
          severity: 'info',
          message: `Feature "${feature.name}" describes physical attack but has Magic damage type`,
          suggestion: 'Consider changing to Physical damage type',
        });
      }
      if (feature.damage.damageType === DamageType.PHYSICAL && hasMagicKeywords && !hasPhysicalKeywords) {
        issues.push({
          field: `features.${feature.name}.damage.damageType`,
          severity: 'info',
          message: `Feature "${feature.name}" describes magical attack but has Physical damage type`,
          suggestion: 'Consider changing to Magic damage type',
        });
      }
    }
  }

  // Check range descriptors consistency
  if (adversary.attack) {
    const attackRange = adversary.attack.range;
    const attackName = adversary.attack.name.toLowerCase();

    // Melee weapons at range
    const meleeKeywords = ['bite', 'claw', 'slam', 'fist', 'punch', 'kick', 'sword', 'axe', 'mace'];
    const rangedKeywords = ['bow', 'crossbow', 'throw', 'spit', 'ray', 'bolt', 'blast'];

    const isMeleeNamed = meleeKeywords.some((k) => attackName.includes(k));
    const isRangedNamed = rangedKeywords.some((k) => attackName.includes(k));

    if (isMeleeNamed && (attackRange === RangeBand.FAR || attackRange === RangeBand.VERY_FAR)) {
      issues.push({
        field: 'attack.range',
        severity: 'warning',
        message: `Melee attack "${adversary.attack.name}" has long range (${attackRange})`,
        suggestion: 'Consider changing range to Melee or Very Close',
      });
    }
    if (isRangedNamed && attackRange === RangeBand.MELEE) {
      issues.push({
        field: 'attack.range',
        severity: 'warning',
        message: `Ranged attack "${adversary.attack.name}" has Melee range`,
        suggestion: 'Consider changing range to Close, Far, or Very Far',
      });
    }
  }

  // Solo adversaries should have Relentless
  if (adversary.type === AdversaryType.SOLO && !adversary.relentless?.hasRelentless) {
    issues.push({
      field: 'relentless',
      severity: 'warning',
      message: 'Solo adversaries typically have the Relentless feature',
      suggestion: 'Add relentless: { hasRelentless: true, actionsPerRound: 2-3 }',
    });
  }

  // Horde adversaries should have Horde feature
  if (adversary.type === AdversaryType.HORDE && !adversary.horde?.isHorde) {
    issues.push({
      field: 'horde',
      severity: 'warning',
      message: 'Horde adversaries should have the Horde feature defined',
      suggestion: 'Add horde: { isHorde: true, startingDamage, reducedDamage }',
    });
  }

  return issues;
}

// ============================================================================
// NARRATIVE VALIDATION
// ============================================================================

/**
 * Validates narrative elements are present and complete.
 */
function validateNarrative(adversary: DaggerheartAdversary): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check for motives
  if (!adversary.motivesAndTactics) {
    issues.push({
      field: 'motivesAndTactics',
      severity: 'warning',
      message: 'Motives and tactics are missing',
      suggestion: 'Add motivesAndTactics with at least 1 phrase',
    });
  } else {
    if (!adversary.motivesAndTactics.phrases || adversary.motivesAndTactics.phrases.length === 0) {
      issues.push({
        field: 'motivesAndTactics.phrases',
        severity: 'warning',
        message: 'At least one motive phrase is required',
        suggestion: 'Add verb phrases like "Protect territory" or "Hunt prey"',
      });
    } else if (adversary.motivesAndTactics.phrases.length < 3) {
      issues.push({
        field: 'motivesAndTactics.phrases',
        severity: 'info',
        message: `Only ${adversary.motivesAndTactics.phrases.length} motive phrases (recommended: 3-6)`,
        suggestion: 'Consider adding more behavioral phrases',
      });
    }
  }

  // Check for experience topics
  if (!adversary.experience || adversary.experience.length === 0) {
    issues.push({
      field: 'experience',
      severity: 'warning',
      message: 'At least one experience topic is required',
      suggestion: 'Add experience topics like { topic: "Shadows", bonus: 2 }',
    });
  } else {
    // Validate experience format
    for (const exp of adversary.experience) {
      if (!exp.topic || exp.topic.trim() === '') {
        issues.push({
          field: 'experience.topic',
          severity: 'error',
          message: 'Experience topic cannot be empty',
          suggestion: 'Add a descriptive topic name',
        });
      }
      if (exp.bonus === undefined || exp.bonus < 1 || exp.bonus > 4) {
        issues.push({
          field: 'experience.bonus',
          severity: 'warning',
          message: `Experience bonus ${exp.bonus} is unusual (typical: 1-3)`,
          suggestion: 'Set bonus to 1, 2, or 3',
        });
      }
    }
  }

  // Check for description
  if (!adversary.description) {
    issues.push({
      field: 'description',
      severity: 'warning',
      message: 'Description is missing',
      suggestion: 'Add a description with shortDescription',
    });
  } else if (!adversary.description.shortDescription || adversary.description.shortDescription.trim() === '') {
    issues.push({
      field: 'description.shortDescription',
      severity: 'warning',
      message: 'Short description is required',
      suggestion: 'Add a 1-2 sentence evocative description',
    });
  } else if (adversary.description.shortDescription.length < 20) {
    issues.push({
      field: 'description.shortDescription',
      severity: 'info',
      message: 'Short description is very brief',
      suggestion: 'Consider expanding the description',
    });
  }

  return issues;
}

// ============================================================================
// MAIN VALIDATION FUNCTION
// ============================================================================

/**
 * Validates a Daggerheart adversary across all quality dimensions.
 *
 * Performs four categories of validation:
 * - Structural: Required fields, valid types, proper formatting
 * - Balance: Stats appropriate for tier and type
 * - Consistency: Internal consistency of data
 * - Narrative: Presence of motives, experience, description
 *
 * @param adversary - The adversary to validate
 * @returns Validation result with score, issues, and summary
 *
 * @example
 * ```typescript
 * import { validateAdversary } from './qualityChecker';
 *
 * const result = validateAdversary(myAdversary);
 * if (!result.isValid) {
 *   console.log('Validation failed:', result.summary);
 *   for (const issue of result.issues) {
 *     console.log(`[${issue.severity}] ${issue.field}: ${issue.message}`);
 *   }
 * }
 * ```
 */
export function validateAdversary(adversary: DaggerheartAdversary): ValidationResult {
  const allIssues: ValidationIssue[] = [];

  // Run all validation categories
  allIssues.push(...validateStructure(adversary));
  allIssues.push(...validateBalance(adversary));
  allIssues.push(...validateConsistency(adversary));
  allIssues.push(...validateNarrative(adversary));

  // Count issues by severity
  const errors = allIssues.filter((i) => i.severity === 'error').length;
  const warnings = allIssues.filter((i) => i.severity === 'warning').length;
  const infos = allIssues.filter((i) => i.severity === 'info').length;

  // Calculate score
  // Start at 100, subtract points for issues
  // Errors: -15 points each
  // Warnings: -5 points each
  // Info: -1 point each
  let score = 100 - errors * 15 - warnings * 5 - infos * 1;
  score = Math.max(0, Math.min(100, score));

  // Determine validity
  const isValid = errors === 0;

  // Generate summary
  let summary: string;
  if (isValid && score >= 90) {
    summary = `Excellent quality (${score}/100). ${warnings + infos} minor suggestions.`;
  } else if (isValid && score >= 70) {
    summary = `Good quality (${score}/100). ${warnings} warnings and ${infos} suggestions to address.`;
  } else if (isValid) {
    summary = `Acceptable quality (${score}/100). Consider addressing ${warnings} warnings.`;
  } else {
    summary = `Invalid adversary (${score}/100). ${errors} errors must be fixed. ${warnings} additional warnings.`;
  }

  return {
    isValid,
    score,
    issues: allIssues,
    summary,
  };
}

// ============================================================================
// AUTO-FIX FUNCTION
// ============================================================================

/**
 * Attempts to automatically fix common issues in an adversary.
 *
 * Currently handles:
 * - Missing thresholds (generates based on tier)
 * - Invalid threshold ordering (reorders correctly)
 * - Missing stress (sets based on type)
 * - Missing evasion (sets based on tier)
 * - Missing features array (adds empty array)
 * - Minion HP (corrects to 1)
 *
 * @param adversary - The adversary to fix
 * @returns Fixed adversary and list of changes made
 *
 * @example
 * ```typescript
 * import { validateAndFix } from './qualityChecker';
 *
 * const { fixed, changes } = validateAndFix(myAdversary);
 * console.log('Changes made:', changes);
 * ```
 */
export function validateAndFix(adversary: DaggerheartAdversary): FixResult {
  const fixed: DaggerheartAdversary = JSON.parse(JSON.stringify(adversary));
  const changes: string[] = [];
  const tier = (fixed.tier || Tier.ONE) as Tier;
  const tierDefaults = TIER_DEFAULTS[tier];

  // Fix missing features array
  if (!fixed.features) {
    fixed.features = [];
    changes.push('Added empty features array');
  }

  // Fix thresholds
  if (!fixed.thresholds) {
    const thresholdDefaults = tierDefaults.thresholds;
    fixed.thresholds = {
      minor: Math.floor((thresholdDefaults.minor[0] + thresholdDefaults.minor[1]) / 2),
      major: Math.floor((thresholdDefaults.major[0] + thresholdDefaults.major[1]) / 2),
      severe: Math.floor((thresholdDefaults.severe[0] + thresholdDefaults.severe[1]) / 2),
    };
    changes.push(`Generated thresholds for Tier ${tier}: ${fixed.thresholds.minor}/${fixed.thresholds.major}/${fixed.thresholds.severe}`);
  } else if (fixed.thresholds.minor !== undefined &&
             fixed.thresholds.major !== undefined &&
             fixed.thresholds.severe !== undefined) {
    // Fix threshold ordering
    const minorVal = fixed.thresholds.minor;
    const majorVal = fixed.thresholds.major;
    const severeVal = fixed.thresholds.severe;
    const values: number[] = [minorVal, majorVal, severeVal];
    const sorted = [...values].sort((a, b) => a - b);
    const newMinor = sorted[0]!;
    const newMajor = sorted[1]!;
    const newSevere = sorted[2]!;
    if (minorVal !== newMinor || majorVal !== newMajor || severeVal !== newSevere) {
      fixed.thresholds = {
        minor: newMinor,
        major: newMajor,
        severe: newSevere,
      };
      changes.push(`Reordered thresholds to ascending: ${newMinor}/${newMajor}/${newSevere}`);
    }
  }

  // Fix missing stress
  if (fixed.stress === undefined || fixed.stress === null) {
    const stressRange = fixed.type ? STRESS_BY_TYPE[fixed.type] : { min: 2, max: 5 };
    fixed.stress = Math.floor((stressRange.min + stressRange.max) / 2);
    changes.push(`Set stress to ${fixed.stress} based on ${fixed.type || 'default'} type`);
  }

  // Fix missing evasion
  if (fixed.evasion === undefined || fixed.evasion === null) {
    fixed.evasion = tierDefaults.evasion.default;
    changes.push(`Set evasion to ${fixed.evasion} based on Tier ${tier}`);
  }

  // Fix Minion HP
  if (fixed.type === AdversaryType.MINION && fixed.hp !== 1) {
    changes.push(`Corrected Minion HP from ${fixed.hp} to 1`);
    fixed.hp = 1;
  }

  // Fix missing motives
  if (!fixed.motivesAndTactics) {
    fixed.motivesAndTactics = {
      phrases: ['Survive', 'Pursue goals'],
    };
    changes.push('Added default motivesAndTactics');
  }

  // Fix missing experience
  if (!fixed.experience || fixed.experience.length === 0) {
    fixed.experience = [{ topic: 'Their Domain', bonus: 2 }];
    changes.push('Added default experience topic');
  }

  // Fix missing description
  if (!fixed.description) {
    fixed.description = {
      shortDescription: `A ${fixed.type || 'creature'} of notable power.`,
    };
    changes.push('Added placeholder description');
  }

  // Add Relentless to Solo if missing
  if (fixed.type === AdversaryType.SOLO && !fixed.relentless?.hasRelentless) {
    fixed.relentless = { hasRelentless: true, actionsPerRound: 2 };
    changes.push('Added Relentless feature for Solo adversary');
  }

  // Add Horde feature if missing
  if (fixed.type === AdversaryType.HORDE && !fixed.horde?.isHorde) {
    fixed.horde = {
      isHorde: true,
      threshold: Math.floor(fixed.hp / 2),
    };
    changes.push('Added Horde feature for Horde adversary');
  }

  return { fixed, changes };
}

// ============================================================================
// BATCH VALIDATION
// ============================================================================

/**
 * Validates multiple adversaries and returns aggregated results.
 *
 * @param adversaries - Array of adversaries to validate
 * @returns Array of validation results with adversary names
 */
export function validateBatch(
  adversaries: DaggerheartAdversary[]
): Array<{ name: string; result: ValidationResult }> {
  return adversaries.map((adversary) => ({
    name: adversary.name || 'Unknown',
    result: validateAdversary(adversary),
  }));
}

/**
 * Gets validation statistics for a batch of adversaries.
 *
 * @param adversaries - Array of adversaries to analyze
 * @returns Statistics about validation results
 */
export function getValidationStats(adversaries: DaggerheartAdversary[]): {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  averageScore: number;
  commonIssues: Array<{ field: string; count: number }>;
} {
  const results = validateBatch(adversaries);
  const issueCounts: Record<string, number> = {};

  let totalScore = 0;
  let validCount = 0;

  for (const { result } of results) {
    totalScore += result.score;
    if (result.isValid) validCount++;

    for (const issue of result.issues) {
      issueCounts[issue.field] = (issueCounts[issue.field] || 0) + 1;
    }
  }

  const commonIssues = Object.entries(issueCounts)
    .map(([field, count]) => ({ field, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalCount: adversaries.length,
    validCount,
    invalidCount: adversaries.length - validCount,
    averageScore: adversaries.length > 0 ? Math.round(totalScore / adversaries.length) : 0,
    commonIssues,
  };
}
