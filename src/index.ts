/**
 * Daggerheart Converter - Main Entry Point
 *
 * This module provides the primary interface for converting D&D 5e stat blocks
 * to Daggerheart adversary format. It re-exports the orchestrator functions
 * along with supporting types and utilities.
 *
 * @module daggerheart-converter
 * @version 1.0.0
 *
 * @example
 * ```typescript
 * import {
 *   convertFromStatBlock,
 *   convertFromText,
 *   convertFromNaturalLanguage
 * } from 'daggerheart-converter';
 *
 * // Convert from JSON stat block
 * const result1 = convertFromStatBlock(goblinStatBlock);
 *
 * // Convert from text
 * const result2 = convertFromText(statBlockText);
 *
 * // Convert from description
 * const result3 = convertFromNaturalLanguage("a large fire-breathing dragon");
 *
 * // Access the converted adversary
 * console.log(result1.adversary.name);
 * console.log(result1.markdown);
 * ```
 */

// ============================================================================
// MAIN CONVERSION API
// ============================================================================

export {
  // Core conversion functions
  convertFromStatBlock,
  convertFromText,
  convertFromNaturalLanguage,

  // Utility functions
  validateStatBlock,
  analyzeSpecializations,

  // Types
  type ConversionOptions,
  type ConversionResult,
} from './orchestrator';

// ============================================================================
// DATA MODELS
// ============================================================================

// D&D 5e Input Types
export type {
  DnD5eMonster,
  AbilityScores,
  ChallengeRating,
} from './models/dnd5e';

export {
  CreatureType,
  CreatureSize,
} from './models/dnd5e';

// Daggerheart Output Types
export {
  Tier,
  AdversaryType,
  Difficulty,
  DamageType,
  FeatureType,
  FeatureCostType,
  RangeBand,
  Condition,
  Attribute,
} from './models/daggerheart';

export type {
  DaggerheartAdversary,
  Feature,
  Attack,
  DamageExpression,
  DamageThresholds,
  Experience,
  Movement,
  MotivesAndTactics,
  RelentlessFeature,
  HordeFeature,
} from './models/daggerheart';

// ============================================================================
// INDIVIDUAL CONVERTERS (for advanced usage)
// ============================================================================

// CR to Tier conversion
export { crToTier } from './converters/crToTier';

// Adversary classification
export { classifyAdversary, type ClassificationResult } from './converters/classifyAdversary';

// Stat conversion
export { convertCoreStats, type CoreStats } from './converters/statConversion';

// Attack conversion
export { convertAttack, convertAllAttacks } from './converters/attackConversion';

// Feature conversion
export { convertAllFeatures, type ConvertedFeature } from './converters/featureConversion';

// ============================================================================
// SPECIALIZED CONVERTERS
// ============================================================================

// Multiattack and Legendary
export {
  hasMultiattack,
  hasLegendaryActions,
  convertMultiattackAndLegendary,
  type CombinedConversionResult,
} from './converters/multiattackConversion';

// Spellcasting
export {
  isSpellcaster,
  convertSpellcasting,
  type SpellcasterConversionResult,
} from './converters/spellcasterConversion';

// Undead
export {
  isUndead,
  convertUndead,
  type UndeadConversionResult,
} from './converters/undeadConversion';

// Construct/Ooze
export {
  isConstructOrOoze,
  convertConstructOrOoze,
  type ConstructOozeResult,
} from './converters/constructOozeConversion';

// ============================================================================
// GENERATORS
// ============================================================================

// Experience Topics
export {
  generateExperienceTopics,
  generateExperienceWithBonuses,
} from './generators/experienceGenerator';

// Motives and Tactics
export {
  generateMotivesAndTactics,
  type MotivesAndTactics as GeneratedMotivesAndTactics,
} from './generators/motiveTacticsGenerator';

// Design Notes
export {
  generateDesignNotes,
  formatDesignNotesAsMarkdown,
  type DesignNotes,
} from './generators/designNotesGenerator';

// ============================================================================
// FORMATTERS
// ============================================================================

export {
  formatAsMarkdown,
  formatMultipleAsMarkdown,
  formatCompact,
  type MarkdownFormatOptions,
} from './formatters/markdownFormatter';

// ============================================================================
// PARSERS
// ============================================================================

export {
  parseStatBlock,
  parseStatBlockSafe,
  type ParseResult,
} from './parsers/statBlockParser';

export {
  parseNaturalLanguage,
  type NLParseResult,
} from './parsers/naturalLanguageParser';

// ============================================================================
// UTILITIES
// ============================================================================

export {
  // Scaling functions
  scaleTier,
  adjustDifficulty,
  quickAdjust,
  applyMultipleAdjustments,
  createScaledVariant,
  getChangeSummary,

  // Types
  type ScalingOptions,
  type QuickAdjustment,
  type ScalingResult,
} from './utils';
