/**
 * Markdown Stat Block Formatter for Daggerheart Adversaries
 *
 * Converts a DaggerheartAdversary object into a well-formatted Markdown
 * stat block suitable for display, printing, or inclusion in documents.
 *
 * @module formatters/markdownFormatter
 * @version 1.0.0
 */

import {
  DaggerheartAdversary,
  Feature,
  FeatureType,
  FeatureCostType,
  DamageExpression,
  DamageType,
  Attack,
  Experience,
  Movement,
  RangeBand,
  Tier,
  AdversaryType,
  Difficulty,
  RelentlessFeature,
  HordeFeature,
} from '../models/daggerheart';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Format options for customizing Markdown output.
 */
export interface MarkdownFormatOptions {
  /** Include design/conversion notes at the end. Default: true */
  includeDesignNotes?: boolean;
  /** Include source system attribution. Default: true */
  includeSourceAttribution?: boolean;
  /** Header level for the adversary name (1, 2, or 3). Default: 1 */
  headerLevel?: 1 | 2 | 3;
  /** Include the description/lore section. Default: true */
  includeDescription?: boolean;
  /** Include movement details. Default: true */
  includeMovement?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formats a damage expression as a readable string.
 * @param damage - The damage expression to format
 * @returns Formatted string like "2d8+3 Physical" or "1d6 Magic"
 */
function formatDamageExpression(damage: DamageExpression): string {
  const { diceCount, diceSize, modifier, damageType, isDirect } = damage;

  let result = `${diceCount}d${diceSize}`;
  if (modifier > 0) {
    result += `+${modifier}`;
  } else if (modifier < 0) {
    result += `${modifier}`;
  }

  const damageTypeName = damageType === DamageType.PHYSICAL ? 'Physical' : 'Magic';
  result += ` ${damageTypeName}`;

  if (isDirect) {
    result += ' (direct)';
  }

  return result;
}

/**
 * Formats the attack modifier with sign.
 * @param modifier - The attack modifier
 * @returns Formatted string like "+4" or "-1"
 */
function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Formats an attack line for the stat block.
 * @param attack - The attack to format
 * @returns Formatted attack string
 */
function formatAttack(attack: Attack): string {
  const parts: string[] = [];

  parts.push(`**Attack** ${formatModifier(attack.modifier)}`);
  parts.push(formatDamageExpression(attack.damage));
  parts.push(`(${attack.name})`);

  if (attack.range !== RangeBand.MELEE) {
    parts.push(`[${attack.range}]`);
  }

  let result = parts.join(', ');

  if (attack.additionalEffects) {
    result += `  \n*${attack.additionalEffects}*`;
  }

  return result;
}

/**
 * Formats a feature cost string.
 * @param feature - The feature with potential cost
 * @returns Cost string like "(Action, 2 Stress)" or "(Passive)"
 */
function formatFeatureCost(feature: Feature): string {
  const parts: string[] = [feature.type];

  if (feature.cost && feature.cost.type !== FeatureCostType.NONE) {
    const amount = feature.cost.amount || 1;
    const costType = feature.cost.type;
    parts.push(`${amount} ${costType}`);
  }

  return `(${parts.join(', ')})`;
}

/**
 * Formats a single feature for the stat block.
 * @param feature - The feature to format
 * @returns Formatted feature string
 */
function formatFeature(feature: Feature): string {
  const lines: string[] = [];

  // Feature header: **Name** (Type, Cost)
  lines.push(`**${feature.name}** ${formatFeatureCost(feature)}`);

  // Trigger for reactions
  if (feature.type === FeatureType.REACTION && feature.trigger) {
    lines.push(`*Trigger: ${feature.trigger.description}*`);
  }

  // Main description
  lines.push(feature.description);

  // Reaction roll info if present
  if (feature.reactionRollAttribute && feature.reactionRollDifficulty) {
    lines.push(
      `*Reaction Roll: ${feature.reactionRollAttribute} (${feature.reactionRollDifficulty})*`
    );
  }

  // Applied conditions
  if (feature.appliedConditions && feature.appliedConditions.length > 0) {
    lines.push(`*Applies: ${feature.appliedConditions.join(', ')}*`);
  }

  // Feature damage if present
  if (feature.damage) {
    lines.push(`*Damage: ${formatDamageExpression(feature.damage)}*`);
  }

  return lines.join('  \n');
}

/**
 * Formats the tier as a display string.
 * @param tier - The tier enum value
 * @returns Display string like "Tier 1"
 */
function formatTier(tier: Tier): string {
  return `Tier ${tier}`;
}

/**
 * Formats the subtitle line with type and difficulty.
 * @param adversary - The adversary to format
 * @returns Subtitle string like "Tier 1 Standard Adversary (Minor Difficulty)"
 */
function formatSubtitle(adversary: DaggerheartAdversary): string {
  const parts: string[] = [formatTier(adversary.tier), adversary.type, 'Adversary'];

  if (adversary.difficulty) {
    parts.push(`(${adversary.difficulty} Difficulty)`);
  }

  return `*${parts.join(' ')}*`;
}

/**
 * Formats movement capabilities.
 * @param movement - The movement object
 * @returns Formatted movement string
 */
function formatMovement(movement: Movement): string {
  const capabilities: string[] = [`Standard: ${movement.standard}`];

  if (movement.canFly) capabilities.push('Fly');
  if (movement.canSwim) capabilities.push('Swim');
  if (movement.canClimb) capabilities.push('Climb');
  if (movement.canBurrow) capabilities.push('Burrow');
  if (movement.canTeleport) capabilities.push('Teleport');

  let result = capabilities.join(', ');

  if (movement.special) {
    result += ` (${movement.special})`;
  }

  return result;
}

/**
 * Formats experience topics.
 * @param experiences - Array of experience objects
 * @returns Formatted experience string
 */
function formatExperience(experiences: Experience[]): string {
  return experiences.map((exp) => `${exp.topic} +${exp.bonus}`).join(', ');
}

/**
 * Formats relentless feature if present.
 * @param relentless - The relentless feature
 * @returns Formatted relentless string or empty
 */
function formatRelentless(relentless: RelentlessFeature): string {
  if (!relentless.hasRelentless) return '';

  const actions = relentless.actionsPerRound || 2;
  return `**Relentless** (${actions} actions per round)`;
}

/**
 * Formats horde feature if present.
 * @param horde - The horde feature
 * @returns Formatted horde string or empty
 */
function formatHorde(horde: HordeFeature): string {
  if (!horde.isHorde) return '';

  const lines: string[] = ['**Horde**'];

  if (horde.startingDamage && horde.reducedDamage) {
    lines.push(
      `Deals ${formatDamageExpression(horde.startingDamage)} normally, ` +
        `${formatDamageExpression(horde.reducedDamage)} when below ${horde.threshold || 'half'} HP.`
    );
  }

  return lines.join('  \n');
}

/**
 * Creates the header string based on level.
 * @param level - Header level (1, 2, or 3)
 * @returns Markdown header prefix
 */
function getHeaderPrefix(level: 1 | 2 | 3): string {
  return '#'.repeat(level);
}

// ============================================================================
// MAIN FORMATTER
// ============================================================================

/**
 * Formats a Daggerheart adversary as a Markdown stat block.
 *
 * Produces a well-structured Markdown document with all adversary
 * information organized into clear sections.
 *
 * @param adversary - The DaggerheartAdversary to format
 * @param options - Optional formatting configuration
 * @returns Formatted Markdown string
 *
 * @example
 * ```typescript
 * const markdown = formatAsMarkdown(goblinSkirmisher);
 * console.log(markdown);
 * ```
 *
 * @example
 * ```typescript
 * const markdown = formatAsMarkdown(goblinSkirmisher, {
 *   headerLevel: 2,
 *   includeDesignNotes: false
 * });
 * ```
 */
export function formatAsMarkdown(
  adversary: DaggerheartAdversary,
  options: MarkdownFormatOptions = {}
): string {
  // Apply default options
  const opts: Required<MarkdownFormatOptions> = {
    includeDesignNotes: options.includeDesignNotes ?? true,
    includeSourceAttribution: options.includeSourceAttribution ?? true,
    headerLevel: options.headerLevel ?? 1,
    includeDescription: options.includeDescription ?? true,
    includeMovement: options.includeMovement ?? true,
  };

  const sections: string[] = [];
  const h1 = getHeaderPrefix(opts.headerLevel);
  const h2 = getHeaderPrefix(Math.min(opts.headerLevel + 1, 6) as 1 | 2 | 3);

  // === Header Section ===
  sections.push(`${h1} ${adversary.name}`);
  sections.push('');
  sections.push(formatSubtitle(adversary));
  sections.push('');

  // === Description (if enabled) ===
  if (opts.includeDescription && adversary.description) {
    if (adversary.description.shortDescription) {
      sections.push(`> ${adversary.description.shortDescription}`);
      sections.push('');
    }
  }

  sections.push('---');
  sections.push('');

  // === Core Statistics ===
  const statsLine = [
    `**Evasion** ${adversary.evasion}`,
    `**Thresholds** ${adversary.thresholds.minor}/${adversary.thresholds.major}/${adversary.thresholds.severe}`,
    `**HP** ${adversary.hp}`,
    `**Stress** ${adversary.stress}`,
  ].join(' | ');

  sections.push(statsLine);
  sections.push('');

  // === Attack Section ===
  sections.push(formatAttack(adversary.attack));

  // Additional attacks
  if (adversary.additionalAttacks && adversary.additionalAttacks.length > 0) {
    for (const attack of adversary.additionalAttacks) {
      sections.push('');
      sections.push(formatAttack(attack).replace('**Attack**', `**${attack.name}**`));
    }
  }

  // === Movement (if enabled and present) ===
  if (opts.includeMovement && adversary.movement) {
    sections.push('');
    sections.push(`**Movement** ${formatMovement(adversary.movement)}`);
  }

  // === Special Type Features ===
  if (adversary.relentless && adversary.relentless.hasRelentless) {
    sections.push('');
    sections.push(formatRelentless(adversary.relentless));
  }

  if (adversary.horde && adversary.horde.isHorde) {
    sections.push('');
    sections.push(formatHorde(adversary.horde));
  }

  sections.push('');
  sections.push('---');
  sections.push('');

  // === Features Section ===
  if (adversary.features.length > 0) {
    sections.push(`${h2} Features`);
    sections.push('');

    // Group features by type for better organization
    const passiveFeatures = adversary.features.filter((f) => f.type === FeatureType.PASSIVE);
    const actionFeatures = adversary.features.filter((f) => f.type === FeatureType.ACTION);
    const reactionFeatures = adversary.features.filter((f) => f.type === FeatureType.REACTION);

    // Output all features (passive first, then actions, then reactions)
    const orderedFeatures = [...passiveFeatures, ...actionFeatures, ...reactionFeatures];

    for (const feature of orderedFeatures) {
      sections.push(formatFeature(feature));
      sections.push('');
    }

    sections.push('---');
    sections.push('');
  }

  // === Motives & Tactics Section ===
  sections.push(`${h2} Motives & Tactics`);
  sections.push('');

  if (adversary.motivesAndTactics.phrases.length > 0) {
    sections.push(`**Motives**: ${adversary.motivesAndTactics.phrases.join(', ')}`);
  }

  if (adversary.motivesAndTactics.expandedDescription) {
    sections.push(`**Tactics**: ${adversary.motivesAndTactics.expandedDescription}`);
  }

  sections.push('');
  sections.push('---');
  sections.push('');

  // === Experience Section ===
  if (adversary.experience.length > 0) {
    sections.push(`${h2} Experience`);
    sections.push('');
    sections.push(`**Topics**: ${formatExperience(adversary.experience)}`);
    sections.push('');
  }

  // === Lore Section (if present) ===
  if (opts.includeDescription && adversary.description.lore) {
    sections.push('---');
    sections.push('');
    sections.push(`${h2} Lore`);
    sections.push('');
    sections.push(adversary.description.lore);
    sections.push('');
  }

  // === Design Notes (if enabled and present) ===
  if (opts.includeDesignNotes && adversary.conversionNotes) {
    sections.push('---');
    sections.push('');
    sections.push(`${h2} Design Notes`);
    sections.push('');
    sections.push(adversary.conversionNotes);
    sections.push('');
  }

  // === Source Attribution (if enabled and present) ===
  if (opts.includeSourceAttribution && adversary.sourceSystem) {
    sections.push('---');
    sections.push('');
    let attribution = `*Converted from ${adversary.sourceSystem}`;
    if (adversary.sourceCR !== undefined) {
      attribution += ` (CR ${adversary.sourceCR})`;
    }
    attribution += '*';
    sections.push(attribution);
  }

  // === Tags (if present) ===
  if (adversary.tags && adversary.tags.length > 0) {
    sections.push('');
    sections.push(`*Tags: ${adversary.tags.join(', ')}*`);
  }

  return sections.join('\n');
}

/**
 * Formats multiple adversaries as a single Markdown document.
 *
 * @param adversaries - Array of DaggerheartAdversary objects
 * @param options - Optional formatting configuration
 * @returns Formatted Markdown string with all adversaries
 */
export function formatMultipleAsMarkdown(
  adversaries: DaggerheartAdversary[],
  options: MarkdownFormatOptions = {}
): string {
  // For multiple adversaries, use header level 2 by default
  const multiOptions: MarkdownFormatOptions = {
    ...options,
    headerLevel: options.headerLevel ?? 2,
  };

  return adversaries
    .map((adversary) => formatAsMarkdown(adversary, multiOptions))
    .join('\n\n---\n\n');
}

/**
 * Formats an adversary as a compact single-line summary.
 *
 * Useful for lists or tables of adversaries.
 *
 * @param adversary - The DaggerheartAdversary to format
 * @returns Single-line summary string
 *
 * @example
 * ```typescript
 * const summary = formatCompact(goblin);
 * // "Goblin Skirmisher (T1 Standard) - Evasion 12, HP 6"
 * ```
 */
export function formatCompact(adversary: DaggerheartAdversary): string {
  const tier = `T${adversary.tier}`;
  const difficulty = adversary.difficulty ? ` ${adversary.difficulty}` : '';
  return `${adversary.name} (${tier}${difficulty} ${adversary.type}) - Evasion ${adversary.evasion}, HP ${adversary.hp}`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default formatAsMarkdown;
