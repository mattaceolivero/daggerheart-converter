/**
 * Utility Functions
 *
 * Re-exports all utility functions for convenient access.
 *
 * @module utils
 * @version 1.0.0
 */

// ============================================================================
// SCALING UTILITIES
// ============================================================================

export {
  // Core scaling functions
  scaleTier,
  adjustDifficulty,
  quickAdjust,

  // Batch operations
  applyMultipleAdjustments,
  createScaledVariant,

  // Utility
  getChangeSummary,

  // Types
  type ScalingOptions,
  type QuickAdjustment,
  type ScalingResult,
} from './scaling';
