/**
 * Main Conversion Orchestrator
 *
 * Coordinates all conversion components to transform D&D 5e stat blocks
 * into complete Daggerheart adversaries. This is the primary entry point
 * for the conversion pipeline.
 *
 * @module orchestrator/converter
 * @version 1.0.0
 */

import { DnD5eMonster } from '../models/dnd5e';
import {
  DaggerheartAdversary,
  Feature,
  AdversaryType,
  FeatureType,
  Experience,
  RangeBand,
  DamageType,
  Attack,
  Tier,
} from '../models/daggerheart';

// Parsers
import { parseStatBlockSafe, ParseResult } from '../parsers/statBlockParser';
import { parseNaturalLanguage, NLParseResult, estimateMissingStats } from '../parsers/naturalLanguageParser';

// Core Converters
import { crToTier } from '../converters/crToTier';
import { classifyAdversary, ClassificationResult } from '../converters/classifyAdversary';
import { convertCoreStats, CoreStats } from '../converters/statConversion';
import { convertAllAttacks } from '../converters/attackConversion';
import { convertAllFeatures, ConvertedFeature } from '../converters/featureConversion';

// Specialized Converters
import {
  hasMultiattack,
  hasLegendaryActions,
  convertMultiattackAndLegendary,
  CombinedConversionResult,
} from '../converters/multiattackConversion';
import {
  isSpellcaster,
  convertSpellcasting,
  SpellcasterConversionResult,
} from '../converters/spellcasterConversion';
import {
  isUndead,
  convertUndead,
  UndeadConversionResult,
} from '../converters/undeadConversion';
import {
  isConstructOrOoze,
  convertConstructOrOoze,
  ConstructOozeResult,
} from '../converters/constructOozeConversion';
import {
  isDragon,
  convertDragon,
  DragonConversionResult,
} from '../converters/dragonConversion';

// Generators
import { generateExperienceWithBonuses } from '../generators/experienceGenerator';
import { generateMotivesAndTactics, MotivesAndTactics } from '../generators/motiveTacticsGenerator';
import {
  generateDesignNotes,
  formatDesignNotesAsMarkdown,
  DesignNotes,
} from '../generators/designNotesGenerator';

// Formatter
import { formatAsMarkdown, MarkdownFormatOptions } from '../formatters/markdownFormatter';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Options for controlling the conversion process.
 */
export interface ConversionOptions {
  /** Include design notes explaining conversion decisions. Default: true */
  includeDesignNotes?: boolean;
  /** Output format: 'markdown', 'json', or 'both'. Default: 'markdown' */
  outputFormat?: 'markdown' | 'json' | 'both';
  /** Include verbose notes in design documentation. Default: false */
  verboseNotes?: boolean;
  /** Custom markdown formatting options. */
  markdownOptions?: MarkdownFormatOptions;
}

/**
 * Result of a complete conversion operation.
 */
export interface ConversionResult {
  /** The fully converted Daggerheart adversary. */
  adversary: DaggerheartAdversary;
  /** Markdown-formatted stat block (if outputFormat includes markdown). */
  markdown?: string;
  /** Design notes explaining conversion decisions. */
  designNotes?: DesignNotes;
  /** Log of conversion steps and decisions for debugging. */
  conversionLog: string[];
}

/**
 * Attack conversion result structure.
 */
interface AttackConversionResult {
  primaryAttack: Attack;
  additionalAttacks: Attack[];
}

/**
 * Internal pipeline state passed between conversion steps.
 */
interface ConversionPipelineState {
  // Input
  statBlock: DnD5eMonster;
  options: Required<ConversionOptions>;

  // Classification
  tier?: Tier;
  classification?: ClassificationResult;

  // Core conversions
  statResult?: CoreStats;
  attackResult?: AttackConversionResult;
  featureResult?: ConvertedFeature[];

  // Specialized conversions
  multiattackResult?: CombinedConversionResult;
  spellcastingResult?: SpellcasterConversionResult;
  undeadResult?: UndeadConversionResult;
  constructOozeResult?: ConstructOozeResult;
  dragonResult?: DragonConversionResult;

  // Narrative generation
  experienceResult?: Array<{ topic: string; bonus: number }>;
  motivesAndTactics?: MotivesAndTactics;

  // Design notes
  designNotes?: DesignNotes;

  // Logging
  conversionLog: string[];
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: Required<ConversionOptions> = {
  includeDesignNotes: true,
  outputFormat: 'markdown',
  verboseNotes: false,
  markdownOptions: {},
};

// ============================================================================
// PIPELINE STEP FUNCTIONS
// ============================================================================

/**
 * Step 1: Parse input and detect format.
 */
function parseInput(
  input: DnD5eMonster | string,
  isNaturalLanguage: boolean
): { statBlock: DnD5eMonster; log: string[] } {
  const log: string[] = [];

  if (typeof input === 'string') {
    if (isNaturalLanguage) {
      log.push('Step 1: Parsing natural language description');
      const result: NLParseResult = parseNaturalLanguage(input);

      // NLParseResult returns partial stat block, need to fill missing stats
      const completeMonster = estimateMissingStats(result.statBlock);

      if (result.confidence < 0.3) {
        throw new Error(
          `Failed to parse natural language: confidence too low (${Math.round(result.confidence * 100)}%). Missing: ${result.missing.join(', ')}`
        );
      }
      log.push(`  - Parsed creature: ${completeMonster.name}`);
      log.push(`  - Confidence: ${Math.round(result.confidence * 100)}%`);
      if (result.missing.length > 0) {
        log.push(`  - Missing fields (estimated): ${result.missing.join(', ')}`);
      }
      return { statBlock: completeMonster, log };
    } else {
      log.push('Step 1: Parsing text stat block');
      const result: ParseResult = parseStatBlockSafe(input);

      if (!result.result) {
        throw new Error(
          `Failed to parse stat block: ${result.errors?.join(', ') || 'Unknown error'}`
        );
      }
      log.push(`  - Parsed creature: ${result.result.name}`);
      if (result.warnings.length > 0) {
        log.push(`  - Warnings: ${result.warnings.join(', ')}`);
      }
      return { statBlock: result.result, log };
    }
  } else {
    log.push('Step 1: Using provided JSON stat block');
    log.push(`  - Creature: ${input.name}`);
    return { statBlock: input, log };
  }
}

/**
 * Step 2: Classify adversary type and role.
 */
function classifyCreature(state: ConversionPipelineState): void {
  state.conversionLog.push('Step 2: Classifying adversary');

  state.classification = classifyAdversary(state.statBlock);
  state.tier = crToTier(
    typeof state.statBlock.challengeRating.cr === 'string'
      ? parseFloat(state.statBlock.challengeRating.cr) || 0
      : state.statBlock.challengeRating.cr
  );

  state.conversionLog.push(`  - Type: ${state.classification.type}`);
  state.conversionLog.push(`  - Role: ${state.classification.role || 'N/A'}`);
  state.conversionLog.push(`  - Tier: ${state.tier}`);
  state.conversionLog.push(
    `  - Confidence: ${Math.round(state.classification.confidence * 100)}%`
  );
}

/**
 * Step 3: Convert core stats (Evasion, Thresholds, HP, Stress).
 */
function convertCoreStatsStep(state: ConversionPipelineState): void {
  state.conversionLog.push('Step 3: Converting core statistics');

  if (!state.tier || !state.classification) {
    throw new Error('Classification must be completed before stat conversion');
  }

  state.statResult = convertCoreStats(state.statBlock, state.classification);

  state.conversionLog.push(`  - Evasion: ${state.statResult.evasion}`);
  state.conversionLog.push(
    `  - Thresholds: ${state.statResult.thresholds.minor}/${state.statResult.thresholds.major}/${state.statResult.thresholds.severe}`
  );
  state.conversionLog.push(`  - HP: ${state.statResult.hp}`);
  state.conversionLog.push(`  - Stress: ${state.statResult.stress}`);
}

/**
 * Step 4: Convert attacks.
 */
function convertCombatAttacks(state: ConversionPipelineState): void {
  state.conversionLog.push('Step 4: Converting attacks');

  if (!state.tier || !state.classification) {
    throw new Error('Classification must be completed before attack conversion');
  }

  const attacks = convertAllAttacks(state.statBlock, state.tier, state.classification.type);

  if (attacks.length > 0) {
    state.attackResult = {
      primaryAttack: attacks[0]!,
      additionalAttacks: attacks.slice(1),
    };
  } else {
    // Create a default attack if none found
    state.attackResult = {
      primaryAttack: {
        name: 'Strike',
        modifier: state.tier,
        range: RangeBand.MELEE,
        damage: {
          diceCount: 1,
          diceSize: 6,
          modifier: state.tier,
          damageType: DamageType.PHYSICAL,
        },
      },
      additionalAttacks: [],
    };
  }

  state.conversionLog.push(`  - Primary attack: ${state.attackResult.primaryAttack.name}`);
  state.conversionLog.push(`  - Attack modifier: +${state.attackResult.primaryAttack.modifier}`);

  if (state.attackResult.additionalAttacks.length > 0) {
    state.conversionLog.push(
      `  - Additional attacks: ${state.attackResult.additionalAttacks.map((a: Attack) => a.name).join(', ')}`
    );
  }
}

/**
 * Step 5: Convert features (traits, actions, reactions).
 */
function convertCreatureFeatures(state: ConversionPipelineState): void {
  state.conversionLog.push('Step 5: Converting features');

  if (!state.tier || !state.classification) {
    throw new Error('Classification must be completed before feature conversion');
  }

  state.featureResult = convertAllFeatures(state.statBlock);

  const passiveCount = state.featureResult.filter(
    (f: ConvertedFeature) => f.type === FeatureType.PASSIVE
  ).length;
  const actionCount = state.featureResult.filter(
    (f: ConvertedFeature) => f.type === FeatureType.ACTION
  ).length;
  const reactionCount = state.featureResult.filter(
    (f: ConvertedFeature) => f.type === FeatureType.REACTION
  ).length;

  state.conversionLog.push(`  - Total features: ${state.featureResult.length}`);
  state.conversionLog.push(
    `  - Passives: ${passiveCount}, Actions: ${actionCount}, Reactions: ${reactionCount}`
  );
}

/**
 * Step 6: Apply specializations (multiattack, legendary, spellcasting, creature type).
 */
function applySpecializations(state: ConversionPipelineState): void {
  state.conversionLog.push('Step 6: Applying specializations');

  if (!state.tier || !state.classification || !state.attackResult) {
    throw new Error('Classification must be completed before specialization');
  }

  // Check for multiattack and legendary actions
  const hasMulti = hasMultiattack(state.statBlock);
  const hasLegendary = hasLegendaryActions(state.statBlock);

  if (hasMulti || hasLegendary) {
    state.conversionLog.push(`  - Multiattack: ${hasMulti ? 'Yes' : 'No'}`);
    state.conversionLog.push(`  - Legendary Actions: ${hasLegendary ? 'Yes' : 'No'}`);

    // Get all attacks as base attacks for multiattack conversion
    const allAttacks = [state.attackResult.primaryAttack, ...state.attackResult.additionalAttacks];
    state.multiattackResult = convertMultiattackAndLegendary(state.statBlock, allAttacks);

    state.conversionLog.push(`  - Bonus stress from legendary: ${state.multiattackResult.bonusStress}`);
  }

  // Check for spellcasting
  if (isSpellcaster(state.statBlock)) {
    state.conversionLog.push('  - Spellcaster detected');

    state.spellcastingResult = convertSpellcasting(state.statBlock);

    state.conversionLog.push(
      `  - Spell features: ${state.spellcastingResult.spellFeatures.length}`
    );
    state.conversionLog.push(`  - Bonus stress: ${state.spellcastingResult.bonusStress}`);
  }

  // Check for undead
  if (isUndead(state.statBlock)) {
    state.conversionLog.push('  - Undead creature detected');

    state.undeadResult = convertUndead(state.statBlock);

    state.conversionLog.push(`  - Undead type: ${state.undeadResult.undeadType}`);
    state.conversionLog.push(
      `  - Thematic features: ${state.undeadResult.thematicFeatures.length}`
    );
  }

  // Check for construct/ooze
  if (isConstructOrOoze(state.statBlock)) {
    state.conversionLog.push('  - Construct/Ooze creature detected');

    state.constructOozeResult = convertConstructOrOoze(state.statBlock);

    state.conversionLog.push(`  - Category: ${state.constructOozeResult.creatureCategory}`);
    state.conversionLog.push(
      `  - Special mechanics: ${state.constructOozeResult.specialMechanics.length}`
    );
  }

  // Check for dragon
  if (isDragon(state.statBlock)) {
    state.conversionLog.push('  - Dragon creature detected');

    state.dragonResult = convertDragon(state.statBlock);

    state.conversionLog.push(`  - Dragon type: ${state.dragonResult.dragonType}`);
    state.conversionLog.push(`  - Age category: ${state.dragonResult.ageCategory}`);
    state.conversionLog.push(
      `  - Dragon features: ${state.dragonResult.legendaryFeatures.length + 1}` // +1 for breath weapon
    );
  }

  if (
    !hasMulti &&
    !hasLegendary &&
    !isSpellcaster(state.statBlock) &&
    !isUndead(state.statBlock) &&
    !isConstructOrOoze(state.statBlock) &&
    !isDragon(state.statBlock)
  ) {
    state.conversionLog.push('  - No specializations applicable');
  }
}

/**
 * Step 7: Generate narrative elements (motives, tactics, experience).
 */
function generateNarrative(state: ConversionPipelineState): void {
  state.conversionLog.push('Step 7: Generating narrative elements');

  if (!state.classification) {
    throw new Error('Classification must be completed before narrative generation');
  }

  // Generate experience topics with bonuses
  state.experienceResult = generateExperienceWithBonuses(state.statBlock, state.classification);
  state.conversionLog.push(
    `  - Experience topics: ${state.experienceResult.map((t) => t.topic).join(', ')}`
  );

  // Generate motives and tactics
  state.motivesAndTactics = generateMotivesAndTactics(state.statBlock, state.classification);
  state.conversionLog.push(`  - Motives: ${state.motivesAndTactics.motives.join(', ')}`);
}

/**
 * Step 8: Generate design notes.
 */
function generateNotes(state: ConversionPipelineState): void {
  if (!state.options.includeDesignNotes) {
    state.conversionLog.push('Step 8: Skipping design notes (disabled)');
    return;
  }

  state.conversionLog.push('Step 8: Generating design notes');

  // We need a partial adversary for design notes - build it first
  const partialAdversary = assemblePartialAdversary(state);

  if (!state.classification) {
    throw new Error('Classification required for design notes');
  }

  state.designNotes = generateDesignNotes(state.statBlock, partialAdversary, state.classification);

  state.conversionLog.push(
    `  - Rationale points: ${state.designNotes.conversionRationale.length}`
  );
  state.conversionLog.push(`  - Balance notes: ${state.designNotes.balanceNotes.length}`);
  state.conversionLog.push(`  - GM tips: ${state.designNotes.gmTips.length}`);
}

/**
 * Helper: Assemble a partial adversary from current state for design notes.
 */
function assemblePartialAdversary(state: ConversionPipelineState): DaggerheartAdversary {
  if (!state.tier || !state.classification || !state.statResult || !state.attackResult) {
    throw new Error('Core conversions must be completed before assembly');
  }

  // Gather all features
  const allFeatures: Feature[] = [...(state.featureResult || [])];

  // Add multiattack/legendary features
  if (state.multiattackResult?.features) {
    allFeatures.push(...state.multiattackResult.features);
  }

  // Add spellcasting features
  if (state.spellcastingResult?.spellFeatures) {
    allFeatures.push(...state.spellcastingResult.spellFeatures);
  }

  // Add undead features
  if (state.undeadResult?.thematicFeatures) {
    allFeatures.push(...state.undeadResult.thematicFeatures);
  }

  // Add construct/ooze features
  if (state.constructOozeResult?.thematicFeatures) {
    allFeatures.push(...state.constructOozeResult.thematicFeatures);
  }

  // Add dragon features (these replace/enhance generic features for dragons)
  if (state.dragonResult) {
    // Add breath weapon
    allFeatures.push(state.dragonResult.breathWeapon as Feature);

    // Add all legendary/special dragon features
    allFeatures.push(...state.dragonResult.legendaryFeatures);
  }

  // Deduplicate features by name, keeping the most detailed version
  const featureMap = new Map<string, Feature>();
  for (const feature of allFeatures) {
    const existing = featureMap.get(feature.name);
    if (!existing) {
      featureMap.set(feature.name, feature);
    } else {
      // Keep the more detailed version (longer description or has damage)
      const existingScore = (existing.description?.length || 0) + (existing.damage ? 50 : 0);
      const newScore = (feature.description?.length || 0) + (feature.damage ? 50 : 0);
      if (newScore > existingScore) {
        featureMap.set(feature.name, feature);
      }
    }
  }

  // Replace allFeatures with deduplicated version
  allFeatures.length = 0;
  allFeatures.push(...featureMap.values());

  // Calculate total stress (base + bonuses)
  let totalStress = state.statResult.stress;
  if (state.spellcastingResult?.bonusStress) {
    totalStress += state.spellcastingResult.bonusStress;
  }
  if (state.multiattackResult?.bonusStress) {
    totalStress += state.multiattackResult.bonusStress;
  }

  // Determine movement
  const movement = {
    standard: RangeBand.CLOSE,
    canFly: state.statBlock.speed.fly !== undefined && state.statBlock.speed.fly > 0,
    canSwim: state.statBlock.speed.swim !== undefined && state.statBlock.speed.swim > 0,
    canClimb: state.statBlock.speed.climb !== undefined && state.statBlock.speed.climb > 0,
    canBurrow: state.statBlock.speed.burrow !== undefined && state.statBlock.speed.burrow > 0,
  };

  // Convert experience result to Experience[] format
  const experience: Experience[] = (state.experienceResult || []).map((e) => ({
    topic: e.topic,
    bonus: e.bonus,
  }));

  // Use enhanced attacks from multiattack result if available
  const primaryAttack =
    state.multiattackResult?.enhancedAttacks?.[0] || state.attackResult.primaryAttack;
  const additionalAttacks =
    state.multiattackResult?.enhancedAttacks?.slice(1) || state.attackResult.additionalAttacks;

  const adversary: DaggerheartAdversary = {
    name: state.statBlock.name,
    tier: state.tier,
    type: state.classification.type,
    difficulty: state.statResult.difficulty,
    evasion: state.statResult.evasion,
    thresholds: state.statResult.thresholds,
    hp: state.statResult.hp,
    stress: totalStress,
    attack: primaryAttack,
    movement,
    features: allFeatures,
    relentless: { hasRelentless: false },
    horde:
      state.classification.type === AdversaryType.HORDE
        ? {
            isHorde: true,
            startingDamage: primaryAttack.damage,
            reducedDamage: {
              ...primaryAttack.damage,
              diceCount: Math.max(1, primaryAttack.damage.diceCount - 1),
            },
          }
        : { isHorde: false },
    description: {
      shortDescription: `A ${state.statBlock.size} ${state.statBlock.creatureType}`,
    },
    motivesAndTactics: {
      phrases: state.motivesAndTactics?.motives || [],
      expandedDescription: state.motivesAndTactics?.tactics || '',
    },
    experience,
    tags: generateTags(state),
    sourceSystem: 'D&D 5e',
    sourceCR: state.statBlock.challengeRating.cr,
  };

  // Add additional attacks if present
  if (additionalAttacks.length > 0) {
    adversary.additionalAttacks = additionalAttacks;
  }

  return adversary;
}

/**
 * Helper: Generate tags from conversion state.
 */
function generateTags(state: ConversionPipelineState): string[] {
  const tags: string[] = [];

  // Add creature type
  tags.push(state.statBlock.creatureType.toLowerCase());

  // Add size
  tags.push(state.statBlock.size.toLowerCase());

  // Add specialization tags
  if (state.spellcastingResult) {
    tags.push('spellcaster');
  }
  if (state.undeadResult) {
    tags.push('undead');
    tags.push(state.undeadResult.undeadType.toLowerCase());
  }
  if (state.constructOozeResult) {
    tags.push(state.constructOozeResult.creatureCategory.toLowerCase());
  }
  if (state.multiattackResult && state.multiattackResult.bonusStress > 0) {
    tags.push('legendary');
  }

  // Add role if present
  if (state.classification?.role) {
    tags.push(state.classification.role.toLowerCase());
  }

  return tags;
}

/**
 * Step 9: Assemble complete adversary.
 */
function assembleAdversary(state: ConversionPipelineState): DaggerheartAdversary {
  state.conversionLog.push('Step 9: Assembling complete adversary');

  const adversary = assemblePartialAdversary(state);

  // Add design notes if enabled
  if (state.options.includeDesignNotes && state.designNotes) {
    adversary.conversionNotes = formatDesignNotesAsMarkdown(state.designNotes);
  }

  state.conversionLog.push(`  - Name: ${adversary.name}`);
  state.conversionLog.push(`  - Final feature count: ${adversary.features.length}`);
  state.conversionLog.push(`  - Tags: ${adversary.tags?.join(', ')}`);

  return adversary;
}

/**
 * Step 10: Format output.
 */
function formatOutput(
  adversary: DaggerheartAdversary,
  state: ConversionPipelineState
): ConversionResult {
  state.conversionLog.push('Step 10: Formatting output');

  const result: ConversionResult = {
    adversary,
    conversionLog: state.conversionLog,
  };

  // Add design notes to result
  if (state.designNotes) {
    result.designNotes = state.designNotes;
  }

  // Generate markdown if requested
  if (state.options.outputFormat === 'markdown' || state.options.outputFormat === 'both') {
    result.markdown = formatAsMarkdown(adversary, state.options.markdownOptions);
    state.conversionLog.push('  - Generated Markdown output');
  }

  state.conversionLog.push('Conversion complete');

  return result;
}

// ============================================================================
// MAIN CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts a D&D 5e stat block (JSON object) to a Daggerheart adversary.
 *
 * This is the primary conversion entry point for programmatic use when
 * you have a structured stat block object.
 *
 * @param statBlock - The D&D 5e monster stat block as a typed object
 * @param options - Optional configuration for the conversion process
 * @returns Complete conversion result with adversary and optional outputs
 *
 * @example
 * ```typescript
 * import { convertFromStatBlock } from './orchestrator';
 *
 * const result = convertFromStatBlock(goblinStatBlock, {
 *   includeDesignNotes: true,
 *   outputFormat: 'both'
 * });
 *
 * console.log(result.adversary.name);
 * console.log(result.markdown);
 * ```
 */
export function convertFromStatBlock(
  statBlock: DnD5eMonster,
  options?: ConversionOptions
): ConversionResult {
  const mergedOptions: Required<ConversionOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const state: ConversionPipelineState = {
    statBlock,
    options: mergedOptions,
    conversionLog: [],
  };

  // Execute pipeline
  state.conversionLog.push('Starting conversion from JSON stat block');
  state.conversionLog.push(`Input: ${statBlock.name}`);

  classifyCreature(state);
  convertCoreStatsStep(state);
  convertCombatAttacks(state);
  convertCreatureFeatures(state);
  applySpecializations(state);
  generateNarrative(state);
  generateNotes(state);

  const adversary = assembleAdversary(state);
  return formatOutput(adversary, state);
}

/**
 * Converts a text-formatted D&D 5e stat block to a Daggerheart adversary.
 *
 * Use this when you have a stat block copied from a PDF, website, or
 * other text source that needs parsing first.
 *
 * @param text - The stat block as plain text
 * @param options - Optional configuration for the conversion process
 * @returns Complete conversion result with adversary and optional outputs
 *
 * @example
 * ```typescript
 * import { convertFromText } from './orchestrator';
 *
 * const statBlockText = `
 *   Goblin
 *   Small humanoid (goblinoid), neutral evil
 *   ...
 * `;
 *
 * const result = convertFromText(statBlockText);
 * console.log(result.adversary.name); // "Goblin"
 * ```
 */
export function convertFromText(text: string, options?: ConversionOptions): ConversionResult {
  const mergedOptions: Required<ConversionOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Parse the text first
  const { statBlock, log: parseLog } = parseInput(text, false);

  const state: ConversionPipelineState = {
    statBlock,
    options: mergedOptions,
    conversionLog: parseLog,
  };

  // Execute remaining pipeline
  classifyCreature(state);
  convertCoreStatsStep(state);
  convertCombatAttacks(state);
  convertCreatureFeatures(state);
  applySpecializations(state);
  generateNarrative(state);
  generateNotes(state);

  const adversary = assembleAdversary(state);
  return formatOutput(adversary, state);
}

/**
 * Converts a natural language description to a Daggerheart adversary.
 *
 * Use this for informal creature descriptions that need more sophisticated
 * parsing, such as "a big scary dragon that breathes fire".
 *
 * @param description - Natural language creature description
 * @param options - Optional configuration for the conversion process
 * @returns Complete conversion result with adversary and optional outputs
 *
 * @example
 * ```typescript
 * import { convertFromNaturalLanguage } from './orchestrator';
 *
 * const result = convertFromNaturalLanguage(
 *   "A pack of hungry wolves, about CR 1/4 each"
 * );
 * console.log(result.adversary.type); // "Minion" or "Horde"
 * ```
 */
export function convertFromNaturalLanguage(
  description: string,
  options?: ConversionOptions
): ConversionResult {
  const mergedOptions: Required<ConversionOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Parse natural language first
  const { statBlock, log: parseLog } = parseInput(description, true);

  const state: ConversionPipelineState = {
    statBlock,
    options: mergedOptions,
    conversionLog: parseLog,
  };

  // Execute remaining pipeline
  classifyCreature(state);
  convertCoreStatsStep(state);
  convertCombatAttacks(state);
  convertCreatureFeatures(state);
  applySpecializations(state);
  generateNarrative(state);
  generateNotes(state);

  const adversary = assembleAdversary(state);
  return formatOutput(adversary, state);
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Validates a D&D 5e stat block before conversion.
 *
 * @param statBlock - The stat block to validate
 * @returns Object with isValid flag and any error messages
 */
export function validateStatBlock(statBlock: DnD5eMonster): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!statBlock.name) {
    errors.push('Missing required field: name');
  }

  if (!statBlock.challengeRating) {
    errors.push('Missing required field: challengeRating');
  }

  if (!statBlock.creatureType) {
    errors.push('Missing required field: creatureType');
  }

  if (!statBlock.abilityScores) {
    errors.push('Missing required field: abilityScores');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Gets a summary of what specializations apply to a stat block.
 *
 * Useful for previewing what conversion paths will be used.
 *
 * @param statBlock - The stat block to analyze
 * @returns Summary object with applicable specializations
 */
export function analyzeSpecializations(statBlock: DnD5eMonster): {
  hasMultiattack: boolean;
  hasLegendaryActions: boolean;
  isSpellcaster: boolean;
  isUndead: boolean;
  isConstructOrOoze: boolean;
} {
  return {
    hasMultiattack: hasMultiattack(statBlock),
    hasLegendaryActions: hasLegendaryActions(statBlock),
    isSpellcaster: isSpellcaster(statBlock),
    isUndead: isUndead(statBlock),
    isConstructOrOoze: isConstructOrOoze(statBlock),
  };
}
