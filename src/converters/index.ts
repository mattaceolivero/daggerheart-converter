/**
 * Converters Module
 *
 * Export all conversion utilities for transforming D&D 5e data
 * to Daggerheart format.
 *
 * @module converters
 */

// CR to Tier conversion
export {
  // Core conversion function
  crToTier,
  // Fractional CR utilities
  FRACTIONAL_CR,
  parseCRString,
  // Tier-based defaults
  getTierHPRange,
  getTierStress,
  getTierStressRange,
  getTierEvasion,
  getTierEvasionRange,
  getTierAttackModifier,
  getTierDicePool,
  // Complete tier info
  getTierInfo,
  getTierInfoFromCR,
  // Type exports
  type HPRange,
  type StressRange,
  type EvasionRange,
  type TierInfo,
} from './crToTier';

// Adversary type classification
export {
  // Core classification function
  classifyAdversary,
  // Batch classification utilities
  classifyMultiple,
  getClassificationStats,
  // Type exports
  type CombatRole,
  type ClassificationResult,
} from './classifyAdversary';

// Core stat conversion
export {
  // Core conversion function
  convertCoreStats,
  // Individual conversion functions
  determineDifficulty,
  calculateThresholds,
  convertHP,
  calculateStress,
  convertEvasion,
  // Utility functions
  validateCoreStats,
  summarizeCoreStats,
  // Type exports
  type CoreStats,
} from './statConversion';

// Attack conversion
export {
  // Core conversion functions
  convertAttack,
  convertAllAttacks,
  // Utility functions
  convertAttackModifier,
  convertRange,
  getDamageType,
  isPhysicalDamage,
  isMagicDamage,
  // Type exports
  type ConvertAttackOptions,
} from './attackConversion';

// Feature conversion
export {
  // Core conversion functions
  convertTrait,
  convertAction,
  convertReaction,
  convertBonusAction,
  convertLegendaryAction,
  convertSpellcasting,
  convertAllFeatures,
  // Movement and damage modifier conversions
  convertMovementToFeatures,
  convertDamageModifiersToFeatures,
  convertConditionImmunitiesToFeature,
  convertLegendaryResistance,
  // Utility functions
  filterByType,
  getPassiveFeatures,
  getActionFeatures,
  getReactionFeatures,
  calculateTotalStressCost,
  summarizeFeatures,
  // Type exports
  type ConvertedFeature,
  type FeatureConversionOptions,
} from './featureConversion';

// Multiattack and Legendary conversion
export {
  // Core conversion functions
  convertMultiattack,
  convertLegendaryActions,
  convertMultiattackAndLegendary,
  // Utility functions
  hasMultiattack,
  hasLegendaryActions,
  hasLegendaryResistance,
  getMultiattackCount,
  summarizeLegendaryCapabilities,
  // Type exports
  type MultiattackResult,
  type LegendaryConversionResult,
  type CombinedConversionResult,
} from './multiattackConversion';

// Spellcaster specialization
export {
  // Core conversion function
  convertSpellcasting as convertSpellcaster,
  // Detection utility
  isSpellcaster,
  // Utility functions
  getSpellcastingAbilityName,
  summarizeSpellcasterConversion,
  // Type exports
  type SpellcasterConversionResult,
  type AnalyzedSpell,
  SpellCategory,
} from './spellcasterConversion';

// Undead conversion
export {
  // Core conversion functions
  convertUndead,
  isUndead,
  detectUndeadSubtype,
  // Utility functions
  getUndeadSubtypeName,
  getAllUndeadSubtypes,
  isCorporealUndead,
  isIntelligentUndead,
  canCreateSpawn,
  // Type exports
  type UndeadSubtype,
  type UndeadConversionResult,
} from './undeadConversion';

// Construct and Ooze conversion specialization
export {
  // Core conversion functions
  convertConstructOrOoze,
  // Detection functions
  isConstructOrOoze,
  isConstruct,
  isOoze,
  detectConstructSubtype,
  detectOozeSubtype,
  // Utility functions
  summarizeConstructOozeConversion,
  mergeConstructOozeFeatures,
  // Type exports
  type ConstructOozeResult,
  type ConstructSubtype,
  type OozeSubtype,
} from './constructOozeConversion';

// Dragon conversion specialization
export {
  // Core conversion functions
  convertDragon,
  // Detection functions
  isDragon,
  detectDragonColor,
  detectDragonAge,
  // Utility functions
  getDragonColorName,
  getDragonElement,
  isChromatic,
  isMetallic,
  getAllDragonColors,
  getAgeCRRange,
  summarizeDragonConversion,
  // Type exports
  type DragonColor,
  type DragonAge,
  type DragonConversionResult,
} from './dragonConversion';

// OSR/Basic D&D to 5e adapter
export {
  // Core conversion functions
  convertOSRToDnD5e,
  convertMultipleOSRToDnD5e,
  // HD to CR/Tier mapping
  hdToCR,
  hdToTier,
  // Individual conversion functions
  convertAlignment as convertOSRAlignment,
  convertArmorClass as convertOSRArmorClass,
  convertHitPoints as convertOSRHitPoints,
  convertSpeed as convertOSRSpeed,
  estimateAbilityScores as estimateOSRAbilityScores,
  convertAttacks as convertOSRAttacks,
  convertSpecialAbilities as convertOSRSpecialAbilities,
  // Detection utilities
  estimateSize as estimateOSRSize,
  detectCreatureType as detectOSRCreatureType,
  // Utility functions
  summarizeOSRConversion,
  // Type exports
  type OSRTo5eResult,
  type OSRConversionOptions,
} from './osrAdapter';

// Pathfinder 2e to D&D 5e adapter
export {
  // Core conversion function
  convertPF2eToDnD5e,
  // Detection utilities
  isPF2eFormat,
  // Summary utilities
  getConversionSummary as getPF2eConversionSummary,
  // Type exports
  type PF2eConversionSummary,
} from './pf2eAdapter';
