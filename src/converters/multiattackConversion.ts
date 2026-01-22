/**
 * Multiattack and Legendary Action Conversion
 *
 * Handles D&D 5e multiattack mechanics and legendary action pools
 * for conversion to Daggerheart format.
 *
 * Multiattack Conversion Rules:
 * - 2 attacks: Primary attack does +1 damage die
 * - 3+ attacks: Primary attack does +2 damage dice
 * - Mixed attacks: Create combined action feature
 *
 * Legendary Action Conversion Rules:
 * - Pool size: Converted to bonus Stress pool
 * - Each legendary action: Reaction feature with Stress cost
 * - Legendary resistance: "Legendary Resilience" passive
 *
 * @module multiattackConversion
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  Multiattack,
  LegendaryActions,
  LegendaryAction,
  DnD5eAttack,
} from '../models/dnd5e';
import {
  Attack,
  Feature,
  FeatureType,
  FeatureCostType,
  DamageExpression,
  Tier,
} from '../models/daggerheart';

// ============================================================================
// EXPORTED INTERFACES
// ============================================================================

/**
 * Result of multiattack conversion.
 */
export interface MultiattackResult {
  /** Attacks with enhanced damage from multiattack */
  enhancedAttacks: Attack[];
  /** Optional combined multiattack feature for complex patterns */
  multiattackFeature?: Feature;
  /** Notes about the conversion */
  conversionNotes: string;
}

/**
 * Result of legendary action conversion.
 */
export interface LegendaryConversionResult {
  /** Bonus Stress added from legendary action pool */
  bonusStress: number;
  /** Legendary actions converted to reaction features */
  legendaryFeatures: Feature[];
  /** Legendary Resistance converted to reaction feature */
  legendaryResistance?: Feature;
  /** Notes about the conversion */
  conversionNotes: string;
}

// ============================================================================
// MULTIATTACK PARSING
// ============================================================================

/**
 * Parses multiattack description to extract attack counts.
 *
 * Recognizes patterns like:
 * - "makes two bite attacks"
 * - "makes three attacks: one with its bite and two with its claws"
 * - "can use Frightful Presence. It then makes two melee attacks"
 *
 * @param multiattack - D&D multiattack definition
 * @returns Parsed attack counts by name
 */
function parseMultiattackCounts(
  multiattack: Multiattack
): Map<string, number> {
  const counts = new Map<string, number>();

  // If structured attacks are provided, use them directly
  if (multiattack.attacks && multiattack.attacks.length > 0) {
    for (const attack of multiattack.attacks) {
      counts.set(attack.attackName.toLowerCase(), attack.count);
    }
    return counts;
  }

  // Parse from description text
  const description = multiattack.description.toLowerCase();

  // Pattern: "makes X [attack-type] attacks"
  const genericPattern = /makes?\s+(two|three|four|five|\d+)\s+(?:melee\s+)?attacks?/i;
  const genericMatch = description.match(genericPattern);

  if (genericMatch && genericMatch[1]) {
    const count = parseNumberWord(genericMatch[1]);
    counts.set('_generic', count);
  }

  // Pattern: "X with its [attack-name]"
  const specificPattern =
    /(?:one|two|three|four|five|\d+)\s+(?:with\s+(?:its\s+)?)?(\w+(?:\s+\w+)?)/gi;
  let match;

  while ((match = specificPattern.exec(description)) !== null) {
    if (match[1]) {
      const attackName = match[1].toLowerCase().trim();
      // Skip common non-attack words
      if (!['attack', 'attacks', 'melee', 'ranged', 'weapon'].includes(attackName)) {
        const countMatch = match[0].match(/^(one|two|three|four|five|\d+)/i);
        if (countMatch && countMatch[1]) {
          const count = parseNumberWord(countMatch[1]);
          counts.set(attackName, count);
        }
      }
    }
  }

  // Pattern: "makes two claw attacks and one bite attack"
  const namedPattern = /(?:makes?\s+)?(two|three|four|five|\d+)\s+(\w+)\s+attacks?/gi;
  while ((match = namedPattern.exec(description)) !== null) {
    if (match[1] && match[2]) {
      const count = parseNumberWord(match[1]);
      const attackName = match[2].toLowerCase();
      if (!['melee', 'ranged', 'weapon'].includes(attackName)) {
        counts.set(attackName, count);
      }
    }
  }

  return counts;
}

/**
 * Parses a number word (one, two, three, etc.) or digit string to a number.
 * @param word - Number word or digit string
 * @returns Parsed number
 */
function parseNumberWord(word: string): number {
  const wordMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  const normalized = word.toLowerCase().trim();
  if (wordMap[normalized] !== undefined) {
    return wordMap[normalized];
  }

  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? 1 : parsed;
}

/**
 * Calculates total attack count from multiattack.
 * @param multiattack - D&D multiattack definition
 * @returns Total number of attacks
 */
function getTotalAttackCount(multiattack: Multiattack): number {
  const counts = parseMultiattackCounts(multiattack);

  if (counts.has('_generic')) {
    return counts.get('_generic') || 1;
  }

  let total = 0;
  counts.forEach((count) => {
    total += count;
  });

  return total > 0 ? total : 1;
}

// ============================================================================
// DAMAGE ENHANCEMENT
// ============================================================================

/**
 * Enhances attack damage based on multiattack count.
 *
 * Conversion rules:
 * - 2 attacks: +1 damage die
 * - 3+ attacks: +2 damage dice
 *
 * @param damage - Original damage expression
 * @param attackCount - Total attacks in multiattack
 * @returns Enhanced damage expression
 */
function enhanceDamage(
  damage: DamageExpression,
  attackCount: number
): DamageExpression {
  // Determine dice bonus based on attack count
  let diceBonus = 0;
  if (attackCount === 2) {
    diceBonus = 1;
  } else if (attackCount >= 3) {
    diceBonus = 2;
  }

  return {
    ...damage,
    diceCount: damage.diceCount + diceBonus,
  };
}

/**
 * Identifies the primary attack from a list of attacks.
 *
 * Priority:
 * 1. Attack mentioned most in multiattack
 * 2. Melee attack with highest damage
 * 3. First attack in list
 *
 * @param attacks - List of Daggerheart attacks
 * @param multiattack - D&D multiattack definition
 * @returns Index of primary attack
 */
function findPrimaryAttackIndex(
  attacks: Attack[],
  multiattack: Multiattack
): number {
  if (attacks.length === 0) return -1;
  if (attacks.length === 1) return 0;

  const counts = parseMultiattackCounts(multiattack);

  // Find attack with highest count in multiattack
  let highestCountIndex = 0;
  let highestCount = 0;

  for (let i = 0; i < attacks.length; i++) {
    const attack = attacks[i];
    if (!attack) continue;

    const attackName = attack.name.toLowerCase();

    // Check direct name match
    if (counts.has(attackName)) {
      const count = counts.get(attackName) || 0;
      if (count > highestCount) {
        highestCount = count;
        highestCountIndex = i;
      }
    }

    // Check partial name match
    counts.forEach((count, name) => {
      if (attackName.includes(name) || name.includes(attackName)) {
        if (count > highestCount) {
          highestCount = count;
          highestCountIndex = i;
        }
      }
    });
  }

  if (highestCount > 0) {
    return highestCountIndex;
  }

  // Fallback: highest damage melee attack
  let bestIndex = 0;
  let bestDamage = 0;

  for (let i = 0; i < attacks.length; i++) {
    const attack = attacks[i];
    if (!attack) continue;

    const avgDamage =
      attack.damage.diceCount * ((attack.damage.diceSize + 1) / 2) +
      attack.damage.modifier;

    if (avgDamage > bestDamage) {
      bestDamage = avgDamage;
      bestIndex = i;
    }
  }

  return bestIndex;
}

// ============================================================================
// MULTIATTACK CONVERSION
// ============================================================================

/**
 * Converts D&D multiattack to enhanced Daggerheart attacks.
 *
 * Multiattack Conversion Rules:
 * - 2 attacks: Primary attack gains +1 damage die
 * - 3+ attacks: Primary attack gains +2 damage dice
 * - Mixed attacks: Creates combined action feature
 *
 * @param statBlock - D&D 5e monster stat block
 * @param baseAttacks - Pre-converted Daggerheart attacks
 * @returns Multiattack conversion result
 *
 * @example
 * ```typescript
 * const statBlock: DnD5eMonster = {
 *   multiattack: { description: "makes two claw attacks and one bite attack" },
 *   attacks: [...]
 * };
 * const baseAttacks = convertAllAttacks(statBlock, Tier.TWO);
 * const result = convertMultiattack(statBlock, baseAttacks);
 * // result.enhancedAttacks has increased damage on primary attack
 * ```
 */
export function convertMultiattack(
  statBlock: DnD5eMonster,
  baseAttacks: Attack[]
): MultiattackResult {
  // If no multiattack, return attacks unchanged
  if (!statBlock.multiattack) {
    return {
      enhancedAttacks: [...baseAttacks],
      conversionNotes: 'No multiattack to convert',
    };
  }

  // If no attacks to enhance, just create the feature
  if (baseAttacks.length === 0) {
    return {
      enhancedAttacks: [],
      multiattackFeature: {
        name: 'Multiattack',
        type: FeatureType.ACTION,
        description: statBlock.multiattack.description,
      },
      conversionNotes: 'Multiattack converted to Action feature (no base attacks)',
    };
  }

  const attackCount = getTotalAttackCount(statBlock.multiattack);
  const primaryIndex = findPrimaryAttackIndex(baseAttacks, statBlock.multiattack);

  // Clone attacks and enhance primary
  const enhancedAttacks: Attack[] = baseAttacks.map((attack, index) => {
    if (index === primaryIndex && attackCount >= 2) {
      return {
        ...attack,
        damage: enhanceDamage(attack.damage, attackCount),
      };
    }
    return { ...attack };
  });

  // Determine if we need a combined multiattack feature
  const counts = parseMultiattackCounts(statBlock.multiattack);
  const uniqueAttackTypes = new Set<string>();

  counts.forEach((_, name) => {
    if (name !== '_generic') {
      uniqueAttackTypes.add(name);
    }
  });

  if (uniqueAttackTypes.size > 1) {
    // Multiple different attack types - create combined feature
    const multiattackFeature: Feature = {
      name: 'Multiattack',
      type: FeatureType.ACTION,
      description: `Can make multiple attacks in a single action: ${statBlock.multiattack.description}`,
    };
    const conversionNotes = `Mixed multiattack (${attackCount} attacks, ${uniqueAttackTypes.size} types) - primary attack enhanced +${attackCount >= 3 ? 2 : 1}d, combined feature created`;
    return {
      enhancedAttacks,
      multiattackFeature,
      conversionNotes,
    };
  } else {
    // Single attack type or generic - just enhance
    const diceBonus = attackCount >= 3 ? 2 : 1;
    const conversionNotes = `Multiattack (${attackCount} attacks) converted to +${diceBonus} damage dice on primary attack`;
    return {
      enhancedAttacks,
      conversionNotes,
    };
  }
}

// ============================================================================
// LEGENDARY ACTION CONVERSION
// ============================================================================

/**
 * Converts a single D&D legendary action to a Daggerheart Feature.
 *
 * @param legendaryAction - D&D legendary action
 * @returns Converted Daggerheart feature
 */
function convertSingleLegendaryAction(
  legendaryAction: LegendaryAction
): Feature {
  return {
    name: legendaryAction.name,
    type: FeatureType.REACTION,
    description: legendaryAction.description,
    cost: {
      type: FeatureCostType.STRESS,
      amount: legendaryAction.cost,
    },
    trigger: {
      description: 'At the end of another creature\'s turn',
    },
  };
}

/**
 * Converts D&D legendary resistance to Daggerheart feature.
 *
 * @param count - Number of legendary resistances per day
 * @returns Legendary Resilience feature
 */
function convertLegendaryResistanceToFeature(count: number): Feature {
  return {
    name: 'Legendary Resilience',
    type: FeatureType.REACTION,
    description:
      'When this creature fails a Reaction Roll, it can choose to succeed instead. This ability represents its legendary ability to shrug off effects that would fell lesser creatures.',
    cost: {
      type: FeatureCostType.STRESS,
      amount: 2,
    },
    trigger: {
      description: 'When failing a Reaction Roll',
    },
  };
}

/**
 * Converts D&D legendary actions to Daggerheart format.
 *
 * Legendary Action Conversion Rules:
 * - Pool size (typically 3): Converted to bonus Stress pool
 * - Each legendary action: Reaction feature with Stress cost = action cost
 * - Legendary resistance: "Legendary Resilience" reaction (2 Stress)
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Legendary conversion result
 *
 * @example
 * ```typescript
 * const statBlock: DnD5eMonster = {
 *   legendaryActions: {
 *     count: 3,
 *     actions: [
 *       { name: "Tail Attack", description: "...", cost: 1 },
 *       { name: "Wing Attack", description: "...", cost: 2 }
 *     ]
 *   },
 *   legendaryResistance: { count: 3 }
 * };
 * const result = convertLegendaryActions(statBlock);
 * // result.bonusStress = 3
 * // result.legendaryFeatures = [Tail Attack, Wing Attack] as Reactions
 * // result.legendaryResistance = Legendary Resilience feature
 * ```
 */
export function convertLegendaryActions(
  statBlock: DnD5eMonster
): LegendaryConversionResult {
  const legendaryFeatures: Feature[] = [];
  let bonusStress = 0;
  const notes: string[] = [];

  // Convert legendary action pool to bonus Stress
  if (statBlock.legendaryActions) {
    bonusStress = statBlock.legendaryActions.count;
    notes.push(`Legendary action pool (${statBlock.legendaryActions.count}) -> +${bonusStress} bonus Stress`);

    // Convert each legendary action to a reaction feature
    for (const action of statBlock.legendaryActions.actions) {
      legendaryFeatures.push(convertSingleLegendaryAction(action));
    }
    notes.push(`${legendaryFeatures.length} legendary actions -> Reaction features`);
  }

  // Convert legendary resistance
  if (statBlock.legendaryResistance) {
    const legendaryResistance = convertLegendaryResistanceToFeature(
      statBlock.legendaryResistance.count
    );
    notes.push(`Legendary Resistance (${statBlock.legendaryResistance.count}/Day) -> Legendary Resilience (2 Stress reaction)`);
    return {
      bonusStress,
      legendaryFeatures,
      legendaryResistance,
      conversionNotes: notes.join('; '),
    };
  }

  return {
    bonusStress,
    legendaryFeatures,
    conversionNotes: notes.length > 0 ? notes.join('; ') : 'No legendary abilities to convert',
  };
}

// ============================================================================
// COMBINED CONVERSION
// ============================================================================

/**
 * Result of combined multiattack and legendary conversion.
 */
export interface CombinedConversionResult {
  /** Enhanced attacks from multiattack */
  enhancedAttacks: Attack[];
  /** All features from multiattack and legendary actions */
  features: Feature[];
  /** Bonus Stress from legendary action pool */
  bonusStress: number;
  /** Combined conversion notes */
  conversionNotes: string;
}

/**
 * Performs combined multiattack and legendary action conversion.
 *
 * This is a convenience function that calls both convertMultiattack
 * and convertLegendaryActions, combining the results.
 *
 * @param statBlock - D&D 5e monster stat block
 * @param baseAttacks - Pre-converted Daggerheart attacks
 * @returns Combined conversion result
 */
export function convertMultiattackAndLegendary(
  statBlock: DnD5eMonster,
  baseAttacks: Attack[]
): CombinedConversionResult {
  const multiattackResult = convertMultiattack(statBlock, baseAttacks);
  const legendaryResult = convertLegendaryActions(statBlock);

  const features: Feature[] = [];

  // Add multiattack feature if created
  if (multiattackResult.multiattackFeature) {
    features.push(multiattackResult.multiattackFeature);
  }

  // Add legendary features
  features.push(...legendaryResult.legendaryFeatures);

  // Add legendary resistance if present
  if (legendaryResult.legendaryResistance) {
    features.push(legendaryResult.legendaryResistance);
  }

  const notes = [multiattackResult.conversionNotes];
  if (legendaryResult.conversionNotes !== 'No legendary abilities to convert') {
    notes.push(legendaryResult.conversionNotes);
  }

  return {
    enhancedAttacks: multiattackResult.enhancedAttacks,
    features,
    bonusStress: legendaryResult.bonusStress,
    conversionNotes: notes.join('. '),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a stat block has multiattack capability.
 * @param statBlock - D&D 5e monster stat block
 * @returns True if has multiattack
 */
export function hasMultiattack(statBlock: DnD5eMonster): boolean {
  return !!statBlock.multiattack;
}

/**
 * Checks if a stat block has legendary actions.
 * @param statBlock - D&D 5e monster stat block
 * @returns True if has legendary actions
 */
export function hasLegendaryActions(statBlock: DnD5eMonster): boolean {
  return !!statBlock.legendaryActions && statBlock.legendaryActions.actions.length > 0;
}

/**
 * Checks if a stat block has legendary resistance.
 * @param statBlock - D&D 5e monster stat block
 * @returns True if has legendary resistance
 */
export function hasLegendaryResistance(statBlock: DnD5eMonster): boolean {
  return !!statBlock.legendaryResistance && statBlock.legendaryResistance.count > 0;
}

/**
 * Gets the multiattack count for a stat block.
 * @param statBlock - D&D 5e monster stat block
 * @returns Number of attacks in multiattack, or 1 if no multiattack
 */
export function getMultiattackCount(statBlock: DnD5eMonster): number {
  if (!statBlock.multiattack) return 1;
  return getTotalAttackCount(statBlock.multiattack);
}

/**
 * Summarizes the legendary capabilities of a stat block.
 * @param statBlock - D&D 5e monster stat block
 * @returns Summary object
 */
export function summarizeLegendaryCapabilities(statBlock: DnD5eMonster): {
  hasLegendaryActions: boolean;
  legendaryActionCount: number;
  legendaryActionPoolSize: number;
  hasLegendaryResistance: boolean;
  legendaryResistanceCount: number;
} {
  return {
    hasLegendaryActions: hasLegendaryActions(statBlock),
    legendaryActionCount: statBlock.legendaryActions?.actions.length ?? 0,
    legendaryActionPoolSize: statBlock.legendaryActions?.count ?? 0,
    hasLegendaryResistance: hasLegendaryResistance(statBlock),
    legendaryResistanceCount: statBlock.legendaryResistance?.count ?? 0,
  };
}
