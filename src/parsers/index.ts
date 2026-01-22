/**
 * Parsers Module
 *
 * Exports all parsing utilities for converting various input formats
 * into structured data models.
 *
 * @module parsers
 * @version 1.2.0
 */

export {
  parseStatBlock,
  parseStatBlockSafe,
  validateStatBlock,
  type ParseResult,
} from './statBlockParser';

export {
  parseNaturalLanguage,
  estimateMissingStats,
  mergeWithStructured,
  type NLParseResult,
} from './naturalLanguageParser';

// OSR/Basic D&D parser
export {
  parseOSRStatBlock,
  parseOSRStatBlockSafe,
  validateOSRStatBlock,
  type OSRParseResult,
} from './osrParser';

// Pathfinder 2e parser
export {
  parsePF2eStatBlock,
  parsePF2eStatBlockSafe,
  validatePF2eStatBlock,
  type PF2eParseResult,
} from './pf2eParser';
