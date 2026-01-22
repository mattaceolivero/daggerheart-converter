/**
 * Generators Module
 *
 * Export all generator utilities for creating Daggerheart
 * adversary content from D&D 5e data.
 *
 * @module generators
 */

// Experience topic generation
export {
  // Core generation function
  generateExperienceTopics,
  // Enhanced generation with bonuses
  generateExperienceWithBonuses,
  // Utility functions
  getTopicsForCreatureType,
  getAllAbilityTopics,
} from './experienceGenerator';

// Motives and tactics generation
export {
  // Types
  type MotivesAndTactics,
  // Core generation function
  generateMotivesAndTactics,
  // Utility functions
  getMotivesForCreatureType,
  getTacticsForRole,
  getAlignmentMotives,
} from './motiveTacticsGenerator';

// Design notes generation
export {
  // Types
  type DesignNotes,
  // Core generation function
  generateDesignNotes,
  // Formatting utilities
  formatDesignNotesAsMarkdown,
  summarizeDesignNotes,
} from './designNotesGenerator';
