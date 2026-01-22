/**
 * Design Notes Generator
 *
 * Generates comprehensive design notes explaining conversion decisions,
 * balance considerations, and GM tips for using converted adversaries.
 * These notes help GMs understand the reasoning behind conversions and
 * provide guidance for running encounters.
 *
 * @module designNotesGenerator
 * @version 1.0.0
 */

import { DnD5eMonster, parseCR, CreatureType, CreatureSize } from '../models/dnd5e';
import {
  DaggerheartAdversary,
  Tier,
  AdversaryType,
  Difficulty,
  FeatureType,
} from '../models/daggerheart';
import { ClassificationResult, CombatRole } from '../converters/classifyAdversary';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Complete design notes for a converted adversary.
 */
export interface DesignNotes {
  /** Explanations for major conversion decisions */
  conversionRationale: string[];
  /** Balance considerations and encounter sizing */
  balanceNotes: string[];
  /** GM advice for running this adversary */
  gmTips: string[];
  /** Suggested modifications for different contexts */
  adjustmentSuggestions: string[];
}

// ============================================================================
// TIER RATIONALE
// ============================================================================

/**
 * Tier explanation templates based on CR range.
 */
const TIER_RATIONALE: Record<Tier, { crRange: string; description: string }> = {
  [Tier.ONE]: {
    crRange: 'CR 0-2',
    description:
      'appropriate for low-level threats and early adventures. These adversaries challenge beginning parties without overwhelming them.',
  },
  [Tier.TWO]: {
    crRange: 'CR 3-6',
    description:
      'suitable for mid-level challenges. These adversaries require tactical thinking and can threaten unprepared parties.',
  },
  [Tier.THREE]: {
    crRange: 'CR 7-12',
    description:
      'represents serious threats that require coordinated party efforts. These adversaries have significant combat presence.',
  },
  [Tier.FOUR]: {
    crRange: 'CR 13+',
    description:
      'reserved for legendary threats and campaign-defining encounters. These adversaries demand party preparation and resource expenditure.',
  },
};

// ============================================================================
// TYPE RATIONALE
// ============================================================================

/**
 * Adversary type explanation templates.
 */
const TYPE_RATIONALE: Record<AdversaryType, string> = {
  [AdversaryType.MINION]:
    'One-hit kill enemies that work best in groups of 3-5. They provide action economy pressure without requiring individual tracking.',
  [AdversaryType.STANDARD]:
    'Balanced threat with moderate HP and straightforward abilities. Forms the backbone of most encounters.',
  [AdversaryType.SKULK]:
    'Emphasizes stealth and mobility from the original. Best used with terrain that offers hiding spots and escape routes.',
  [AdversaryType.BRUISER]:
    'Heavy damage dealer reflecting high strength/damage in the original. Position to threaten multiple PCs when possible.',
  [AdversaryType.RANGED]:
    'Focuses on ranged capabilities from the original. Keep at distance with cover or other protection.',
  [AdversaryType.SUPPORT]:
    'Healing and buff abilities from the original translate to support role. Protect or they become high-priority targets.',
  [AdversaryType.LEADER]:
    'Command abilities from the original make this a force multiplier. Taking them down disrupts enemy coordination.',
  [AdversaryType.HORDE]:
    'Pack-oriented creature works as a group unit. Damage reduces as the horde is whittled down.',
  [AdversaryType.SOLO]:
    'Boss-level threat with multiple actions per round. Designed to challenge entire parties alone.',
  [AdversaryType.SOCIAL]:
    'Non-combat focused adversary. Stats represent social/political threat rather than physical danger.',
  [AdversaryType.SWARM]:
    'Swarm creature from D&D translates directly. Represents many small creatures acting as one entity.',
};

// ============================================================================
// COMBAT ROLE NOTES
// ============================================================================

/**
 * Combat role tactical notes.
 */
const ROLE_TACTICAL_NOTES: Record<CombatRole, string> = {
  Artillery:
    'Position behind cover or other adversaries. Focus fire on vulnerable targets. Retreat if engaged in melee.',
  Bruiser:
    'Engage the toughest PC directly. Use knockback and forced movement to disrupt formations. Accept hits to deal damage.',
  Skirmisher:
    'Never stand still. Attack, move, hide. Target isolated PCs. Flee rather than fight fair.',
  Controller:
    'Prioritize control effects over damage. Create zones of denial. Protect other adversaries by limiting PC movement.',
  Support:
    'Stay behind front line. Buff allies before healing. Remove conditions from key allies. Hide your importance.',
  Leader:
    'Issue commands before acting. Position to maintain line of sight to allies. Sacrifice minions to survive.',
};

// ============================================================================
// CREATURE TYPE TIPS
// ============================================================================

/**
 * GM tips based on D&D creature type.
 */
const CREATURE_TYPE_TIPS: Partial<Record<CreatureType, string>> = {
  [CreatureType.ABERRATION]:
    'Emphasize alien motivations. These creatures think differently than humanoids - their tactics may seem irrational but follow unknowable logic.',
  [CreatureType.BEAST]:
    'Follow animal behavior: protect territory, hunt for food, flee when wounded. Can potentially be calmed or redirected rather than killed.',
  [CreatureType.CELESTIAL]:
    'Often have strong moral codes. May negotiate or offer tests rather than immediate combat. Killing them may have divine consequences.',
  [CreatureType.CONSTRUCT]:
    'Follow orders literally. No morale, no fear, no negotiation. Can be reprogrammed or disabled by clever players.',
  [CreatureType.DRAGON]:
    'Supremely arrogant and intelligent. Will talk, threaten, and bargain. Fight dirty when threatened. Remember their breath weapon.',
  [CreatureType.ELEMENTAL]:
    'Single-minded and tied to their element. Can be banished, bound, or dispersed. Environment matters greatly.',
  [CreatureType.FEY]:
    'Play by strange rules. Honor bargains literally. Vulnerable to iron. Deception and trickery are their nature.',
  [CreatureType.FIEND]:
    'Tempt before fighting. Offer deals with hidden costs. Killing them may not be permanent. Evil but not stupid.',
  [CreatureType.GIANT]:
    'Simple but not stupid. Pride is often their weakness. Throwing things is always an option. Shake the earth.',
  [CreatureType.HUMANOID]:
    'Most likely to surrender, negotiate, or flee. Have goals beyond "kill the PCs." May have allies, families, or causes.',
  [CreatureType.MONSTROSITY]:
    'Predators with animal cunning. Patient hunters. Often territorial. Can be avoided or lured away.',
  [CreatureType.OOZE]:
    'Mindless and relentless. Split when cut. Dissolve equipment. Best avoided rather than fought.',
  [CreatureType.PLANT]:
    'Patient and territorial. May be mistaken for normal plants until attacked. Vulnerable to fire.',
  [CreatureType.UNDEAD]:
    'No morale, no mercy. May follow ancient commands. Radiant damage and turning are their banes.',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gets the effective CR as a number for comparison.
 * @param cr - CR value as number or string
 * @returns Numeric CR value
 */
function getNumericCR(cr: number | string): number {
  if (typeof cr === 'string') {
    return parseCR(cr);
  }
  return cr;
}

/**
 * Describes the tier selection rationale.
 * @param tier - The assigned tier
 * @param originalCR - The original D&D CR
 * @returns Rationale string
 */
function describeTierSelection(tier: Tier, originalCR: number | string): string {
  const numericCR = getNumericCR(originalCR);
  const tierInfo = TIER_RATIONALE[tier];

  // Check if CR is at boundary
  const boundaries = [
    { tier: Tier.ONE, max: 2 },
    { tier: Tier.TWO, max: 6 },
    { tier: Tier.THREE, max: 12 },
  ];

  const boundary = boundaries.find((b) => b.tier === tier);
  const isAtBoundary = boundary && numericCR === boundary.max;

  let note = `Tier ${tier} (${tierInfo.crRange}) - ${tierInfo.description}`;

  if (isAtBoundary) {
    note += ` CR ${numericCR} is at the upper boundary of this tier; consider Tier ${tier + 1} for a more challenging encounter.`;
  }

  return note;
}

/**
 * Analyzes ability translations and notes significant changes.
 * @param original - Original D&D 5e monster
 * @param converted - Converted Daggerheart adversary
 * @returns Array of translation notes
 */
function analyzeAbilityTranslations(
  original: DnD5eMonster,
  converted: DaggerheartAdversary
): string[] {
  const notes: string[] = [];

  // Count original abilities
  const originalAbilityCount =
    (original.traits?.length || 0) +
    (original.actions?.length || 0) +
    (original.bonusActions?.length || 0) +
    (original.reactions?.length || 0) +
    (original.legendaryActions?.actions?.length || 0);

  const convertedFeatureCount = converted.features.length;

  if (originalAbilityCount > convertedFeatureCount + 2) {
    notes.push(
      `Simplified from ${originalAbilityCount} abilities to ${convertedFeatureCount} features. ` +
        `Less impactful abilities were merged or removed to maintain Daggerheart's streamlined design.`
    );
  }

  // Check for spellcasting
  if (original.spellcasting) {
    const hasSpellFeatures = converted.features.some(
      (f) => f.name.toLowerCase().includes('spell') || f.name.toLowerCase().includes('magic')
    );
    if (hasSpellFeatures) {
      notes.push(
        `Spellcasting converted to discrete features. Individual spells may be available as Stress-costed actions.`
      );
    }
  }

  // Check for legendary/mythic
  if (original.legendaryActions || original.mythicActions) {
    const hasRelentless = converted.relentless?.hasRelentless;
    if (hasRelentless) {
      notes.push(
        `Legendary actions converted to Relentless (${converted.relentless?.actionsPerRound || 2} actions/round). ` +
          `This preserves the creature's action economy advantage.`
      );
    }
  }

  // Check for multiattack simplification
  if (original.multiattack) {
    notes.push(
      `Multiattack streamlined into primary attack. Additional attacks may be represented by higher damage dice or Action features.`
    );
  }

  return notes;
}

/**
 * Generates balance notes based on stats comparison.
 * @param original - Original D&D 5e monster
 * @param converted - Converted Daggerheart adversary
 * @param classification - Classification result
 * @returns Array of balance notes
 */
function generateBalanceNotes(
  original: DnD5eMonster,
  converted: DaggerheartAdversary,
  classification: ClassificationResult
): string[] {
  const notes: string[] = [];
  const cr = getNumericCR(original.challengeRating.cr);

  // Encounter sizing suggestions
  switch (converted.type) {
    case AdversaryType.MINION:
      notes.push(
        `Use 3-5 of these per party member for a standard encounter. They go down in one hit but provide action pressure.`
      );
      break;
    case AdversaryType.SOLO:
      notes.push(
        `Designed as a solo encounter for a full party. Add minions or supports for longer, more dynamic fights.`
      );
      break;
    case AdversaryType.HORDE:
      notes.push(
        `Works as a single unit representing multiple creatures. HP reduction weakens their damage output automatically.`
      );
      break;
    default:
      if (cr <= 2) {
        notes.push(`Use 2-3 of these for a balanced encounter, or combine with minions for variety.`);
      } else if (cr <= 6) {
        notes.push(`Works well as the central threat with 2-4 minions, or pair two together for a tough fight.`);
      } else {
        notes.push(`Single creature makes a solid encounter. Add weaker allies to extend combat duration.`);
      }
  }

  // Difficulty note
  const difficultyNote = getDifficultyNote(converted.difficulty);
  if (difficultyNote) {
    notes.push(difficultyNote);
  }

  // Damage output note
  const avgDamage = calculateAverageAttackDamage(converted);
  if (avgDamage > converted.thresholds.minor * 1.5) {
    notes.push(
      `High damage output (avg ${avgDamage}) relative to PC thresholds. PCs will feel threatened by every hit.`
    );
  }

  // Synergy suggestions
  const synergies = getSynergySuggestions(converted.type, classification.role);
  if (synergies) {
    notes.push(synergies);
  }

  return notes;
}

/**
 * Gets a note based on difficulty rating.
 * @param difficulty - The difficulty rating
 * @returns Note string or undefined
 */
function getDifficultyNote(difficulty?: Difficulty): string | undefined {
  switch (difficulty) {
    case Difficulty.MINOR:
      return `Minor difficulty means lower thresholds - PCs will deal HP damage more easily. Good for feeling powerful.`;
    case Difficulty.SEVERE:
      return `Severe difficulty means higher thresholds - requires focused fire or big hits to mark HP. Frustrating for low-damage builds.`;
    default:
      return undefined;
  }
}

/**
 * Calculates average damage from primary attack.
 * @param adversary - The Daggerheart adversary
 * @returns Average damage value
 */
function calculateAverageAttackDamage(adversary: DaggerheartAdversary): number {
  const { damage } = adversary.attack;
  const dieAvg = (damage.diceSize + 1) / 2;
  return Math.floor(damage.diceCount * dieAvg + damage.modifier);
}

/**
 * Suggests synergistic adversary pairings.
 * @param type - Adversary type
 * @param role - Combat role
 * @returns Synergy suggestion or undefined
 */
function getSynergySuggestions(
  type: AdversaryType,
  role?: CombatRole
): string | undefined {
  const synergies: string[] = [];

  switch (type) {
    case AdversaryType.SUPPORT:
      synergies.push('Pair with Bruisers who benefit from healing/buffs');
      break;
    case AdversaryType.LEADER:
      synergies.push('Deploy with Standards or Minions to command');
      break;
    case AdversaryType.RANGED:
      synergies.push('Protect with melee threats or use terrain for cover');
      break;
    case AdversaryType.SKULK:
      synergies.push('Works well with distractions (other combatants, environmental hazards)');
      break;
  }

  if (role === 'Controller') {
    synergies.push('Controllers excel when paired with damage dealers who can capitalize on controlled targets');
  }

  return synergies.length > 0 ? `Synergies: ${synergies.join('; ')}.` : undefined;
}

/**
 * Generates GM tips for running the adversary.
 * @param original - Original D&D 5e monster
 * @param converted - Converted Daggerheart adversary
 * @param classification - Classification result
 * @returns Array of GM tips
 */
function generateGMTips(
  original: DnD5eMonster,
  converted: DaggerheartAdversary,
  classification: ClassificationResult
): string[] {
  const tips: string[] = [];

  // Creature type tips
  const typeTip = CREATURE_TYPE_TIPS[original.creatureType];
  if (typeTip) {
    tips.push(typeTip);
  }

  // Combat role tactics
  if (classification.role) {
    const roleTip = ROLE_TACTICAL_NOTES[classification.role];
    if (roleTip) {
      tips.push(`Tactical note: ${roleTip}`);
    }
  }

  // Motives and tactics from conversion
  if (converted.motivesAndTactics.phrases.length > 0) {
    tips.push(
      `Use the motives (${converted.motivesAndTactics.phrases.slice(0, 3).join(', ')}) to guide behavior between attacks.`
    );
  }

  // Environment considerations
  const environmentTips = getEnvironmentTips(original, converted);
  if (environmentTips) {
    tips.push(environmentTips);
  }

  // Special ability notes
  const featureTips = getFeatureTips(converted);
  tips.push(...featureTips);

  // Size considerations
  const sizeTip = getSizeTip(original.size);
  if (sizeTip) {
    tips.push(sizeTip);
  }

  return tips;
}

/**
 * Generates environment-based tips.
 * @param original - Original D&D 5e monster
 * @param converted - Converted Daggerheart adversary
 * @returns Environment tip or undefined
 */
function getEnvironmentTips(
  original: DnD5eMonster,
  converted: DaggerheartAdversary
): string | undefined {
  const tips: string[] = [];

  // Movement-based environment suggestions
  if (converted.movement?.canFly) {
    tips.push('flying allows striking and retreating vertically');
  }
  if (converted.movement?.canBurrow) {
    tips.push('burrowing enables ambush attacks from unexpected directions');
  }
  if (converted.movement?.canSwim) {
    tips.push('aquatic environments give significant advantage');
  }
  if (converted.movement?.canClimb) {
    tips.push('walls and ceilings become tactical options');
  }

  // Darkness/stealth considerations
  const hasDarkvision =
    original.senses.specialSenses.some((s) => s.type === 'Darkvision') ||
    original.senses.specialSenses.some((s) => s.type === 'Blindsight');
  if (hasDarkvision) {
    tips.push('darkness gives advantage against non-darkvision PCs');
  }

  if (tips.length > 0) {
    return `Environment: ${tips.join('; ')}.`;
  }
  return undefined;
}

/**
 * Generates tips based on specific features.
 * @param adversary - The Daggerheart adversary
 * @returns Array of feature-based tips
 */
function getFeatureTips(adversary: DaggerheartAdversary): string[] {
  const tips: string[] = [];

  // Count feature types
  const passives = adversary.features.filter((f) => f.type === FeatureType.PASSIVE).length;
  const actions = adversary.features.filter((f) => f.type === FeatureType.ACTION).length;
  const reactions = adversary.features.filter((f) => f.type === FeatureType.REACTION).length;

  if (reactions >= 2) {
    tips.push(
      `Multiple reactions (${reactions}) make this adversary dangerous to attack. Consider whether PCs should try to bait them out first.`
    );
  }

  if (actions >= 3) {
    tips.push(
      `Many action options (${actions}). Don't feel obligated to use them all - pick what makes narrative sense.`
    );
  }

  // Check for high-cost abilities
  const highCostFeatures = adversary.features.filter(
    (f) => f.cost && f.cost.amount && f.cost.amount >= 2
  );
  if (highCostFeatures.length > 0) {
    tips.push(
      `High-cost abilities (${highCostFeatures.map((f) => f.name).join(', ')}) are powerful but limited. Save for dramatic moments.`
    );
  }

  return tips;
}

/**
 * Gets tips based on creature size.
 * @param size - D&D creature size
 * @returns Size tip or undefined
 */
function getSizeTip(size: CreatureSize): string | undefined {
  switch (size) {
    case CreatureSize.TINY:
    case CreatureSize.SMALL:
      return `Small size means it can fit in tight spaces, hide easily, and might be underestimated by PCs.`;
    case CreatureSize.LARGE:
      return `Large size allows controlling space. Can potentially block doorways or protect smaller allies.`;
    case CreatureSize.HUGE:
      return `Huge size dominates the battlefield. Movement creates difficult terrain. Attacks are devastating but predictable.`;
    case CreatureSize.GARGANTUAN:
      return `Gargantuan - this IS the battlefield. PCs may need to climb it or target specific parts. Don't let it feel cramped.`;
    default:
      return undefined;
  }
}

/**
 * Generates adjustment suggestions for different contexts.
 * @param original - Original D&D 5e monster
 * @param converted - Converted Daggerheart adversary
 * @param classification - Classification result
 * @returns Array of adjustment suggestions
 */
function generateAdjustmentSuggestions(
  original: DnD5eMonster,
  converted: DaggerheartAdversary,
  classification: ClassificationResult
): string[] {
  const suggestions: string[] = [];

  // Tier adjustments
  if (converted.tier < Tier.FOUR) {
    suggestions.push(
      `To increase challenge: Raise to Tier ${converted.tier + 1} (+1 to thresholds bands, +1 attack modifier, +1 Stress).`
    );
  }
  if (converted.tier > Tier.ONE) {
    suggestions.push(
      `To decrease challenge: Lower to Tier ${converted.tier - 1} (reduce thresholds, attack modifier, and Stress accordingly).`
    );
  }

  // Type adjustments
  if (converted.type !== AdversaryType.MINION) {
    suggestions.push(
      `Minion variant: Set HP to 1, remove Stress, simplify to one attack. Use in groups of ${3 + converted.tier}.`
    );
  }

  if (converted.type !== AdversaryType.SOLO && converted.tier >= Tier.TWO) {
    suggestions.push(
      `Solo variant: Add Relentless (2-3 actions/round), increase HP by 50%, add Legendary Resistance feature.`
    );
  }

  // Feature additions
  if (converted.features.filter((f) => f.type === FeatureType.REACTION).length === 0) {
    suggestions.push(
      `Adding a reaction (like "Parry: +2 Evasion against one attack") increases tactical depth without adding complexity.`
    );
  }

  // Narrative adjustments
  suggestions.push(
    `Narrative reskin: Change damage type and description to create variants (fire/ice/poison) without mechanical changes.`
  );

  return suggestions;
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generates comprehensive design notes for a converted adversary.
 *
 * Design notes include:
 * - Conversion rationale (why tier/type were chosen)
 * - Balance notes (encounter sizing, synergies)
 * - GM tips (roleplaying, tactics, environment)
 * - Adjustment suggestions (scaling, variants)
 *
 * @param original - The original D&D 5e monster stat block
 * @param converted - The converted Daggerheart adversary
 * @param classification - The classification result from analysis
 * @returns Complete design notes object
 *
 * @example
 * ```typescript
 * import { generateDesignNotes } from './designNotesGenerator';
 * import { classifyAdversary } from '../converters/classifyAdversary';
 *
 * const classification = classifyAdversary(goblin);
 * const notes = generateDesignNotes(goblin, convertedGoblin, classification);
 *
 * console.log(notes.conversionRationale);
 * // ["Tier 1 (CR 0-2) - appropriate for low-level threats...", ...]
 *
 * console.log(notes.gmTips);
 * // ["Most likely to surrender, negotiate, or flee...", ...]
 * ```
 */
export function generateDesignNotes(
  original: DnD5eMonster,
  converted: DaggerheartAdversary,
  classification: ClassificationResult
): DesignNotes {
  const conversionRationale: string[] = [];
  const balanceNotes: string[] = [];
  const gmTips: string[] = [];
  const adjustmentSuggestions: string[] = [];

  // === Conversion Rationale ===

  // Tier selection
  const tierNote = describeTierSelection(converted.tier, original.challengeRating.cr);
  conversionRationale.push(tierNote);

  // Type selection
  const typeRationale = TYPE_RATIONALE[converted.type];
  conversionRationale.push(
    `${converted.type}: ${typeRationale} (Classification confidence: ${Math.round(classification.confidence * 100)}%)`
  );

  // Classification reasoning
  if (classification.reasoning) {
    conversionRationale.push(`Classification basis: ${classification.reasoning}`);
  }

  // Ability translations
  const abilityNotes = analyzeAbilityTranslations(original, converted);
  conversionRationale.push(...abilityNotes);

  // === Balance Notes ===
  const balance = generateBalanceNotes(original, converted, classification);
  balanceNotes.push(...balance);

  // === GM Tips ===
  const tips = generateGMTips(original, converted, classification);
  gmTips.push(...tips);

  // === Adjustment Suggestions ===
  const adjustments = generateAdjustmentSuggestions(original, converted, classification);
  adjustmentSuggestions.push(...adjustments);

  return {
    conversionRationale,
    balanceNotes,
    gmTips,
    adjustmentSuggestions,
  };
}

/**
 * Formats design notes as a readable Markdown string.
 *
 * @param notes - The design notes to format
 * @returns Formatted Markdown string
 *
 * @example
 * ```typescript
 * const markdown = formatDesignNotesAsMarkdown(notes);
 * console.log(markdown);
 * // ## Conversion Rationale
 * // - Tier 1 (CR 0-2) - appropriate for low-level threats...
 * // ...
 * ```
 */
export function formatDesignNotesAsMarkdown(notes: DesignNotes): string {
  const sections: string[] = [];

  if (notes.conversionRationale.length > 0) {
    sections.push('## Conversion Rationale\n');
    for (const note of notes.conversionRationale) {
      sections.push(`- ${note}\n`);
    }
  }

  if (notes.balanceNotes.length > 0) {
    sections.push('\n## Balance Notes\n');
    for (const note of notes.balanceNotes) {
      sections.push(`- ${note}\n`);
    }
  }

  if (notes.gmTips.length > 0) {
    sections.push('\n## GM Tips\n');
    for (const tip of notes.gmTips) {
      sections.push(`- ${tip}\n`);
    }
  }

  if (notes.adjustmentSuggestions.length > 0) {
    sections.push('\n## Adjustment Suggestions\n');
    for (const suggestion of notes.adjustmentSuggestions) {
      sections.push(`- ${suggestion}\n`);
    }
  }

  return sections.join('');
}

/**
 * Generates a compact summary of design notes for inline display.
 *
 * @param notes - The design notes to summarize
 * @returns Single-line summary string
 */
export function summarizeDesignNotes(notes: DesignNotes): string {
  const keyPoints: string[] = [];

  // Take first rationale point
  if (notes.conversionRationale.length > 0) {
    const firstRationale = notes.conversionRationale[0]!;
    // Extract just the tier info
    const tierMatch = firstRationale.match(/Tier \d/);
    if (tierMatch) {
      keyPoints.push(tierMatch[0]);
    }
  }

  // Key balance info
  if (notes.balanceNotes.length > 0) {
    const first = notes.balanceNotes[0]!;
    if (first.includes('Use')) {
      keyPoints.push(first.split('.')[0]!);
    }
  }

  // First GM tip (truncated)
  if (notes.gmTips.length > 0) {
    const tip = notes.gmTips[0]!;
    if (tip.length > 60) {
      keyPoints.push(tip.substring(0, 57) + '...');
    } else {
      keyPoints.push(tip);
    }
  }

  return keyPoints.join(' | ');
}
