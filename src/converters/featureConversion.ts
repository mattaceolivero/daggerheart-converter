/**
 * Feature Conversion Logic
 *
 * Converts D&D 5e traits, actions, reactions, and legendary actions
 * into Daggerheart Features (Passive/Action/Reaction) with appropriate costs.
 *
 * Cost Mapping:
 * | D&D Mechanic | Daggerheart Cost |
 * |--------------|------------------|
 * | At-will | None |
 * | 1/short rest | 1 Stress |
 * | 1/long rest | 2 Stress |
 * | Recharge 5-6 | 1 Stress |
 * | Recharge 6 | 2 Stress |
 * | Legendary action (1) | 1 Stress |
 * | Legendary action (2) | 2 Stress |
 * | Legendary action (3) | 3 Stress |
 *
 * @module featureConversion
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  Trait,
  DnD5eAction,
  Reaction as DnD5eReaction,
  BonusAction,
  LegendaryAction,
  SenseType,
  DnD5eDamageType,
  DnD5eCondition,
  Spellcasting,
  isTraditionalSpellcasting,
  isInnateSpellcasting,
} from '../models/dnd5e';
import {
  Feature,
  FeatureType,
  FeatureCost,
  FeatureCostType,
  ReactionTrigger,
  Condition,
  Attribute,
  DamageExpression,
  DamageType,
} from '../models/daggerheart';

// ============================================================================
// EXPORTED INTERFACES
// ============================================================================

/**
 * Extended Feature with conversion metadata.
 */
export interface ConvertedFeature extends Feature {
  /** Name of the original D&D ability this was converted from */
  sourceAbility: string;
  /** Notes about conversion decisions or simplifications made */
  conversionNotes: string;
}

/**
 * Options for feature conversion.
 */
export interface FeatureConversionOptions {
  /** Include spellcasting as features (default: true) */
  includeSpellcasting?: boolean;
  /** Include legendary actions as features (default: true) */
  includeLegendaryActions?: boolean;
  /** Simplify complex abilities to single features (default: true) */
  simplifyComplex?: boolean;
}

// ============================================================================
// PASSIVE TRAIT PATTERNS
// ============================================================================

/**
 * Patterns that indicate a D&D trait maps to a Passive feature.
 */
const PASSIVE_TRAIT_PATTERNS: Array<{
  pattern: RegExp;
  featureName: (match: RegExpMatchArray, original: string) => string;
  description: (match: RegExpMatchArray, original: string) => string;
}> = [
  // Damage resistances
  {
    pattern: /resistance to (\w+(?:\s*,\s*\w+)*) damage/i,
    featureName: (match) => `Resistant to ${match[1]}`,
    description: (match) => `Takes reduced damage from ${match[1]} sources.`,
  },
  // Damage immunities
  {
    pattern: /immun(?:e|ity) to (\w+(?:\s*,\s*\w+)*) damage/i,
    featureName: (match) => `Immune to ${match[1]}`,
    description: (match) => `Takes no damage from ${match[1]} sources.`,
  },
  // Condition immunities
  {
    pattern: /immun(?:e|ity) to (?:the )?(\w+(?:\s*,\s*\w+)*) condition/i,
    featureName: (match) => `Immune to ${match[1]}`,
    description: (match) => `Cannot be affected by the ${match[1]} condition.`,
  },
  // Senses
  {
    pattern: /(darkvision|blindsight|tremorsense|truesight)/i,
    featureName: () => 'Enhanced Senses',
    description: (match) => `Has ${match[1]}, allowing perception in special conditions.`,
  },
  // Magic resistance
  {
    pattern: /magic resistance/i,
    featureName: () => 'Magic Resistance',
    description: () => 'Has advantage on saving throws against spells and magical effects.',
  },
  // Pack tactics
  {
    pattern: /pack tactics/i,
    featureName: () => 'Pack Tactics',
    description: () =>
      'Gains advantage on attack rolls when an ally is within close range of the target.',
  },
  // Keen senses
  {
    pattern: /keen (hearing|sight|smell|senses)/i,
    featureName: (match) => `Keen ${match[1] ?? 'Senses'}`,
    description: (match) =>
      `Has advantage on perception checks that rely on ${match[1] ?? 'senses'}.`,
  },
  // Spider climb
  {
    pattern: /spider climb/i,
    featureName: () => 'Spider Climb',
    description: () => 'Can climb difficult surfaces, including upside down on ceilings.',
  },
  // Regeneration
  {
    pattern: /regeneration/i,
    featureName: () => 'Regeneration',
    description: () =>
      'Recovers hit points at the start of its turn unless damaged by specific types.',
  },
  // Sunlight sensitivity
  {
    pattern: /sunlight sensitivity/i,
    featureName: () => 'Sunlight Sensitivity',
    description: () => 'Has disadvantage on attacks and perception in direct sunlight.',
  },
  // Amphibious
  {
    pattern: /amphibious/i,
    featureName: () => 'Amphibious',
    description: () => 'Can breathe both air and water.',
  },
  // Flyby
  {
    pattern: /flyby/i,
    featureName: () => 'Flyby',
    description: () => "Doesn't provoke opportunity attacks when flying out of an enemy's reach.",
  },
  // Incorporeal movement
  {
    pattern: /incorporeal movement/i,
    featureName: () => 'Incorporeal',
    description: () => 'Can move through other creatures and objects as if they were difficult terrain.',
  },
];

// ============================================================================
// ACTION PATTERNS
// ============================================================================

/**
 * Patterns indicating actions that should be features.
 */
const ACTION_FEATURE_PATTERNS: Array<{
  pattern: RegExp;
  requiresStress: boolean;
  stressCost: number;
}> = [
  // Breath weapons
  { pattern: /breath\s*(?:weapon)?/i, requiresStress: true, stressCost: 2 },
  // Frightful presence
  { pattern: /frightful presence/i, requiresStress: true, stressCost: 1 },
  // Gaze attacks
  { pattern: /\bgaze\b/i, requiresStress: true, stressCost: 1 },
  // Swallow
  { pattern: /\bswallow\b/i, requiresStress: true, stressCost: 2 },
  // Change shape
  { pattern: /change shape|shapechange/i, requiresStress: true, stressCost: 1 },
  // Teleport
  { pattern: /\bteleport\b/i, requiresStress: true, stressCost: 1 },
];

// ============================================================================
// REACTION PATTERNS
// ============================================================================

/**
 * Common reaction triggers and their Daggerheart mappings.
 */
const REACTION_TRIGGER_PATTERNS: Array<{
  pattern: RegExp;
  trigger: string;
  stressCost: number;
}> = [
  // Parry
  {
    pattern: /parry/i,
    trigger: 'When hit by a melee attack',
    stressCost: 1,
  },
  // Shield
  {
    pattern: /shield/i,
    trigger: 'When hit by an attack or targeted by magic missile',
    stressCost: 1,
  },
  // Counterspell
  {
    pattern: /counterspell|counter.?spell/i,
    trigger: 'When a creature within range casts a spell',
    stressCost: 2,
  },
  // Opportunity attack
  {
    pattern: /opportunity attack/i,
    trigger: 'When a creature moves out of reach',
    stressCost: 0,
  },
  // Tail attack
  {
    pattern: /tail attack/i,
    trigger: 'When a creature enters or attacks from behind',
    stressCost: 0,
  },
  // Uncanny dodge
  {
    pattern: /uncanny dodge/i,
    trigger: 'When hit by an attack',
    stressCost: 1,
  },
];

// ============================================================================
// CONDITION MAPPING
// ============================================================================

/**
 * Maps D&D conditions to Daggerheart conditions.
 */
const CONDITION_MAP: Record<DnD5eCondition, Condition | undefined> = {
  [DnD5eCondition.BLINDED]: Condition.DISORIENTED,
  [DnD5eCondition.CHARMED]: Condition.CHARMED,
  [DnD5eCondition.DEAFENED]: Condition.DISORIENTED,
  [DnD5eCondition.EXHAUSTION]: Condition.INCAPACITATED,
  [DnD5eCondition.FRIGHTENED]: Condition.FRIGHTENED,
  [DnD5eCondition.GRAPPLED]: Condition.RESTRAINED,
  [DnD5eCondition.INCAPACITATED]: Condition.INCAPACITATED,
  [DnD5eCondition.INVISIBLE]: Condition.HIDDEN,
  [DnD5eCondition.PARALYZED]: Condition.INCAPACITATED,
  [DnD5eCondition.PETRIFIED]: Condition.INCAPACITATED,
  [DnD5eCondition.POISONED]: Condition.VULNERABLE,
  [DnD5eCondition.PRONE]: Condition.VULNERABLE,
  [DnD5eCondition.RESTRAINED]: Condition.RESTRAINED,
  [DnD5eCondition.STUNNED]: Condition.INCAPACITATED,
  [DnD5eCondition.UNCONSCIOUS]: Condition.INCAPACITATED,
};

// ============================================================================
// ATTRIBUTE MAPPING
// ============================================================================

/**
 * Maps D&D ability scores to Daggerheart attributes for Reaction Rolls.
 */
const ABILITY_TO_ATTRIBUTE: Record<string, Attribute> = {
  STR: Attribute.STRENGTH,
  DEX: Attribute.AGILITY,
  CON: Attribute.STRENGTH,
  INT: Attribute.KNOWLEDGE,
  WIS: Attribute.INSTINCT,
  CHA: Attribute.PRESENCE,
};

// ============================================================================
// DAMAGE DICE PARSING
// ============================================================================

/**
 * Parsed damage information from a description.
 */
interface ParsedDamage {
  diceCount: number;
  diceSize: number;
  modifier: number;
  damageType: DamageType;
  originalText: string;
}

/**
 * D&D damage type to Daggerheart damage type mapping.
 */
const DAMAGE_TYPE_MAP: Record<string, DamageType> = {
  // Physical
  bludgeoning: DamageType.PHYSICAL,
  piercing: DamageType.PHYSICAL,
  slashing: DamageType.PHYSICAL,
  // Magic
  acid: DamageType.MAGIC,
  cold: DamageType.MAGIC,
  fire: DamageType.MAGIC,
  force: DamageType.MAGIC,
  lightning: DamageType.MAGIC,
  necrotic: DamageType.MAGIC,
  poison: DamageType.MAGIC,
  psychic: DamageType.MAGIC,
  radiant: DamageType.MAGIC,
  thunder: DamageType.MAGIC,
};

/**
 * Parses damage dice from a D&D description.
 * Extracts patterns like "2d6 + 3 fire damage" or "19 (2d10 + 8) piercing damage"
 *
 * @param description - The ability description
 * @returns Array of parsed damage expressions
 */
function parseDamageFromDescription(description: string): ParsedDamage[] {
  const damages: ParsedDamage[] = [];

  // Pattern: "X (YdZ + M) damage_type damage" or "YdZ + M damage_type damage"
  const dicePatterns = [
    // Full pattern with average: "19 (2d10 + 8) piercing damage"
    /(\d+)\s*\((\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\)\s*(\w+)\s*damage/gi,
    // Direct dice: "2d6 + 3 fire damage" or "2d6 fire damage"
    /(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\s*(\w+)\s*damage/gi,
    // Simple dice without type: "takes 2d6 damage"
    /takes?\s+(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\s*damage/gi,
  ];

  // Try full pattern first (with average)
  const fullPattern = /(\d+)\s*\((\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\)\s*(\w+)\s*damage/gi;
  let match;
  while ((match = fullPattern.exec(description)) !== null) {
    const diceCount = parseInt(match[2], 10);
    const diceSize = parseInt(match[3], 10);
    const modSign = match[4] || '+';
    const modifier = match[5] ? parseInt(match[5], 10) * (modSign === '-' ? -1 : 1) : 0;
    const rawType = match[6].toLowerCase();
    const damageType = DAMAGE_TYPE_MAP[rawType] || DamageType.PHYSICAL;

    damages.push({
      diceCount,
      diceSize,
      modifier,
      damageType,
      originalText: match[0],
    });
  }

  // If no full pattern matches, try direct dice pattern
  if (damages.length === 0) {
    const directPattern = /(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\s*(\w+)\s*damage/gi;
    while ((match = directPattern.exec(description)) !== null) {
      const diceCount = parseInt(match[1], 10);
      const diceSize = parseInt(match[2], 10);
      const modSign = match[3] || '+';
      const modifier = match[4] ? parseInt(match[4], 10) * (modSign === '-' ? -1 : 1) : 0;
      const rawType = match[5].toLowerCase();
      const damageType = DAMAGE_TYPE_MAP[rawType] || DamageType.PHYSICAL;

      damages.push({
        diceCount,
        diceSize,
        modifier,
        damageType,
        originalText: match[0],
      });
    }
  }

  return damages;
}

/**
 * Converts parsed damage to a DamageExpression.
 */
function toDamageExpression(parsed: ParsedDamage): DamageExpression {
  return {
    diceCount: parsed.diceCount,
    diceSize: parsed.diceSize,
    modifier: parsed.modifier,
    damageType: parsed.damageType,
    isDirect: false,
  };
}

/**
 * Formats damage for display in description.
 */
function formatDamageForDescription(damage: DamageExpression): string {
  const mod = damage.modifier > 0 ? `+${damage.modifier}` : damage.modifier < 0 ? `${damage.modifier}` : '';
  const typeLabel = damage.damageType === DamageType.PHYSICAL ? 'physical' : 'magic';
  return `**${damage.diceCount}d${damage.diceSize}${mod} ${typeLabel} damage**`;
}

// ============================================================================
// FEAR MECHANICS
// ============================================================================

/**
 * Patterns that indicate an ability should generate Fear.
 */
const FEAR_GENERATION_PATTERNS = [
  /frightful\s*presence/i,
  /terrifying/i,
  /horrifying/i,
  /dreadful/i,
  /become\s+frightened/i,
  /frightened\s+(?:of|for)/i,
];

/**
 * Checks if an ability should generate Fear.
 */
function shouldGenerateFear(name: string, description: string): boolean {
  const text = `${name} ${description}`;
  return FEAR_GENERATION_PATTERNS.some((p) => p.test(text));
}

/**
 * Patterns that indicate an ability could consume Fear for bonus effect.
 */
const FEAR_CONSUMPTION_CANDIDATES = [
  /gaze/i,
  /soul\s*(?:drain|rend|tear)/i,
  /life\s*drain/i,
  /psychic/i,
  /mind/i,
  /terror/i,
];

/**
 * Checks if an ability could have a Fear-consuming variant.
 */
function couldConsumeFear(name: string, description: string): boolean {
  const text = `${name} ${description}`;
  return FEAR_CONSUMPTION_CANDIDATES.some((p) => p.test(text));
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates Stress cost based on D&D recharge mechanic.
 * @param minRoll - Minimum roll needed to recharge (5 or 6)
 * @returns Stress cost
 */
function calculateRechargeStressCost(minRoll: number): number {
  // Recharge 5-6 = 1 Stress (33% chance to recharge)
  // Recharge 6 = 2 Stress (17% chance to recharge)
  if (minRoll >= 6) return 2;
  if (minRoll >= 5) return 1;
  return 1; // Default for lower recharge values
}

/**
 * Calculates Stress cost based on D&D uses per rest.
 * @param count - Number of uses
 * @param rechargeOn - When the ability recharges
 * @returns Stress cost
 */
function calculateUsesStressCost(count: number, rechargeOn: string): number {
  // More uses = cheaper per use
  // 1/long rest = 2 Stress
  // 1/short rest = 1 Stress
  // 3/day = 1 Stress
  if (rechargeOn === 'long rest') {
    return count <= 1 ? 2 : 1;
  }
  if (rechargeOn === 'short rest' || rechargeOn === 'dawn') {
    return 1;
  }
  return 1;
}

/**
 * Creates a FeatureCost from a Stress amount.
 * @param stress - Amount of Stress
 * @returns FeatureCost object
 */
function createStressCost(stress: number): FeatureCost {
  return {
    type: FeatureCostType.STRESS,
    amount: stress,
  };
}

/**
 * Extracts trigger text from a reaction description.
 * @param description - D&D reaction description
 * @returns Extracted trigger or undefined
 */
function extractReactionTrigger(description: string): string | undefined {
  // Common patterns: "When...", "If...", "As a reaction when..."
  const triggerPatterns = [
    /when ([^.]+)/i,
    /if ([^.]+)/i,
    /as a reaction,?\s*([^.]+)/i,
    /in response to ([^.]+)/i,
  ];

  for (const pattern of triggerPatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

/**
 * Cleans and simplifies D&D description text for Daggerheart.
 * Now preserves damage dice in bold format.
 * @param description - Original D&D description
 * @param preserveDamage - Whether to preserve damage dice (default: true)
 * @returns Simplified description
 */
function simplifyDescription(description: string, preserveDamage: boolean = true): string {
  let simplified = description;

  if (preserveDamage) {
    // Replace damage patterns with bold formatted versions
    // Pattern: "63 (18d6) fire damage" or "19 (2d10 + 8) piercing damage" -> "**18d6 magic damage**"
    simplified = simplified.replace(
      /\d+\s*\((\d+d\d+)\s*(?:([+-])\s*(\d+))?\)\s*(\w+)\s*damage/gi,
      (match, dice, sign, mod, type) => {
        const modifier = mod ? `${sign || '+'}${mod}` : '';
        const daggerheartType = DAMAGE_TYPE_MAP[type.toLowerCase()] === DamageType.MAGIC ? 'magic' : 'physical';
        return `**${dice}${modifier} ${daggerheartType} damage**`;
      }
    );

    // Pattern: "2d6 + 3 fire damage" -> "**2d6+3 magic damage**" (only if not already bolded)
    simplified = simplified.replace(
      /(?<!\*)(\d+d\d+)\s*(?:([+-])\s*(\d+))?\s*(\w+)\s*damage(?!\*)/gi,
      (match, dice, sign, mod, type) => {
        const modifier = mod ? `${sign || '+'}${mod}` : '';
        const daggerheartType = DAMAGE_TYPE_MAP[type.toLowerCase()] === DamageType.MAGIC ? 'magic' : 'physical';
        return `**${dice}${modifier} ${daggerheartType} damage**`;
      }
    );
  } else {
    // Legacy behavior: Remove dice references
    simplified = simplified.replace(/\d+d\d+(?:\s*[+-]\s*\d+)?/g, 'damage');
  }

  // Remove DC and replace with difficulty reference
  simplified = simplified.replace(/DC\s*\d+\s*/gi, '');
  simplified = simplified.replace(/(?:succeeds on|fails)\s+(?:a\s+)?(?:\w+\s+)?saving throw/gi, '');
  simplified = simplified.replace(/\s+saving throw/gi, ' Reaction Roll');
  simplified = simplified.replace(/on a (?:failed|successful) save/gi, '');

  // Clean up whitespace
  simplified = simplified.replace(/\s+/g, ' ').trim();

  // Truncate if too long (keep first 3 sentences for more context)
  const sentences = simplified.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length > 3) {
    simplified = sentences.slice(0, 3).join(' ').trim();
  }

  return simplified;
}

/**
 * Determines the Daggerheart attribute for a Reaction Roll based on the effect.
 * @param description - Feature description
 * @param dndAbility - Optional D&D ability score used
 * @returns Appropriate Daggerheart attribute
 */
function determineReactionAttribute(
  description: string,
  dndAbility?: string
): Attribute | undefined {
  // If we have a D&D ability, map it directly
  if (dndAbility && ABILITY_TO_ATTRIBUTE[dndAbility]) {
    return ABILITY_TO_ATTRIBUTE[dndAbility];
  }

  // Otherwise, try to infer from description
  const descLower = description.toLowerCase();

  if (/dodge|evade|reflex|dexterity/i.test(descLower)) {
    return Attribute.AGILITY;
  }
  if (/resist|endure|constitution|fortitude/i.test(descLower)) {
    return Attribute.STRENGTH;
  }
  if (/will|wisdom|charm|fear|frighten/i.test(descLower)) {
    return Attribute.INSTINCT;
  }
  if (/spell|magic|arcane|intelligence/i.test(descLower)) {
    return Attribute.KNOWLEDGE;
  }
  if (/persuade|intimidate|charisma|command/i.test(descLower)) {
    return Attribute.PRESENCE;
  }

  return undefined;
}

// ============================================================================
// TRAIT CONVERSION
// ============================================================================

/**
 * Converts a D&D 5e trait to a Daggerheart Feature.
 *
 * Traits are typically converted to Passive features unless they have
 * limited uses or recharge mechanics.
 *
 * @param trait - D&D 5e trait
 * @returns Converted Daggerheart feature with metadata
 *
 * @example
 * ```typescript
 * const trait: Trait = {
 *   name: "Pack Tactics",
 *   description: "The wolf has advantage on attack rolls..."
 * };
 * const feature = convertTrait(trait);
 * // { name: "Pack Tactics", type: FeatureType.PASSIVE, ... }
 * ```
 */
export function convertTrait(trait: Trait): ConvertedFeature {
  const { name, description, uses, recharge } = trait;

  // Check for passive pattern matches
  for (const patternDef of PASSIVE_TRAIT_PATTERNS) {
    const match = description.match(patternDef.pattern);
    if (match) {
      return {
        name: patternDef.featureName(match, name),
        type: FeatureType.PASSIVE,
        description: patternDef.description(match, description),
        sourceAbility: name,
        conversionNotes: `Matched passive pattern: ${patternDef.pattern.source}`,
      };
    }
  }

  // Determine if this should be an Action (has uses/recharge)
  let featureType = FeatureType.PASSIVE;
  let cost: FeatureCost | undefined;
  let conversionNotes = 'Direct trait conversion';

  if (recharge) {
    featureType = FeatureType.ACTION;
    const stressCost = calculateRechargeStressCost(recharge.minRoll);
    cost = createStressCost(stressCost);
    conversionNotes = `Recharge ${recharge.minRoll}${recharge.maxRoll ? `-${recharge.maxRoll}` : ''} converted to ${stressCost} Stress`;
  } else if (uses) {
    featureType = FeatureType.ACTION;
    const stressCost = calculateUsesStressCost(uses.count, uses.rechargeOn);
    cost = createStressCost(stressCost);
    conversionNotes = `${uses.count}/${uses.rechargeOn} converted to ${stressCost} Stress`;
  }

  const feature: ConvertedFeature = {
    name,
    type: featureType,
    description: simplifyDescription(description),
    sourceAbility: name,
    conversionNotes,
  };

  if (cost) {
    feature.cost = cost;
  }

  // Try to determine reaction roll attribute if it's an action
  if (featureType === FeatureType.ACTION) {
    const attribute = determineReactionAttribute(description);
    if (attribute) {
      feature.reactionRollAttribute = attribute;
    }
  }

  return feature;
}

// ============================================================================
// ACTION CONVERSION
// ============================================================================

/**
 * Converts a D&D 5e action to a Daggerheart Feature.
 *
 * Non-attack actions become Action features with appropriate Stress costs.
 * Recharge abilities and limited-use abilities calculate costs automatically.
 * Now extracts damage dice and adds Fear mechanics where appropriate.
 *
 * @param action - D&D 5e action
 * @returns Converted Daggerheart feature with metadata
 *
 * @example
 * ```typescript
 * const action: DnD5eAction = {
 *   name: "Fire Breath",
 *   description: "The dragon exhales fire...",
 *   recharge: { minRoll: 5, maxRoll: 6 }
 * };
 * const feature = convertAction(action);
 * // { name: "Fire Breath", type: FeatureType.ACTION, cost: { type: "Stress", amount: 1 }, ... }
 * ```
 */
export function convertAction(action: DnD5eAction): ConvertedFeature {
  const { name, description, recharge, uses, savingThrow, areaOfEffect } = action;

  let stressCost = 0;
  let conversionNotes = 'Direct action conversion';

  // Check for special action patterns
  for (const patternDef of ACTION_FEATURE_PATTERNS) {
    if (patternDef.pattern.test(name) || patternDef.pattern.test(description)) {
      stressCost = Math.max(stressCost, patternDef.stressCost);
      conversionNotes = `Matched action pattern: ${patternDef.pattern.source}`;
      break;
    }
  }

  // Override with recharge-based cost
  if (recharge) {
    stressCost = calculateRechargeStressCost(recharge.minRoll);
    conversionNotes = `Recharge ${recharge.minRoll}${recharge.maxRoll ? `-${recharge.maxRoll}` : ''} = ${stressCost} Stress`;
  }

  // Override with uses-based cost
  if (uses) {
    stressCost = calculateUsesStressCost(uses.count, uses.rechargeOn);
    conversionNotes = `${uses.count}/${uses.rechargeOn} = ${stressCost} Stress`;
  }

  // Parse damage from description
  const parsedDamages = parseDamageFromDescription(description);
  const primaryDamage = parsedDamages.length > 0 ? toDamageExpression(parsedDamages[0]) : undefined;

  // Build the feature
  const feature: ConvertedFeature = {
    name,
    type: FeatureType.ACTION,
    description: simplifyDescription(description),
    sourceAbility: name,
    conversionNotes,
  };

  // Add damage if found
  if (primaryDamage) {
    feature.damage = primaryDamage;
    conversionNotes += ` (${primaryDamage.diceCount}d${primaryDamage.diceSize} damage extracted)`;
    feature.conversionNotes = conversionNotes;
  }

  // Add cost if required
  if (stressCost > 0) {
    feature.cost = createStressCost(stressCost);
  }

  // Add area of effect info to target
  if (areaOfEffect) {
    feature.target = `${areaOfEffect.size}-foot ${areaOfEffect.type}`;
  }

  // Add reaction roll info if saving throw required
  if (savingThrow) {
    const attribute = ABILITY_TO_ATTRIBUTE[savingThrow.ability];
    if (attribute) {
      feature.reactionRollAttribute = attribute;
      // Convert DC to difficulty (approximate)
      feature.reactionRollDifficulty = Math.floor(savingThrow.dc / 2) + 8;
    }
  }

  // Check for Fear generation (frightful presence, etc.)
  if (shouldGenerateFear(name, description)) {
    // Add Fear marking to description
    if (!feature.description.includes('mark') && !feature.description.includes('Fear')) {
      feature.description = feature.description.replace(
        /become\s+frightened/gi,
        '**mark 1 Fear** and become Frightened'
      );
    }
    feature.appliedConditions = feature.appliedConditions || [];
    if (!feature.appliedConditions.includes(Condition.FRIGHTENED)) {
      feature.appliedConditions.push(Condition.FRIGHTENED);
    }
  }

  return feature;
}

// ============================================================================
// REACTION CONVERSION
// ============================================================================

/**
 * Converts a D&D 5e reaction to a Daggerheart Reaction Feature.
 *
 * Reactions maintain their trigger conditions and typically cost 1 Stress.
 * Now extracts damage dice from descriptions.
 *
 * @param reaction - D&D 5e reaction
 * @returns Converted Daggerheart reaction feature with metadata
 *
 * @example
 * ```typescript
 * const reaction: DnD5eReaction = {
 *   name: "Parry",
 *   description: "The captain adds 2 to its AC against one melee attack...",
 *   trigger: "when hit by a melee attack"
 * };
 * const feature = convertReaction(reaction);
 * // { name: "Parry", type: FeatureType.REACTION, trigger: {...}, cost: {...}, ... }
 * ```
 */
export function convertReaction(reaction: DnD5eReaction): ConvertedFeature {
  const { name, description, trigger } = reaction;

  let stressCost = 1; // Default for reactions
  let triggerText = trigger || extractReactionTrigger(description) || 'When triggered';
  let conversionNotes = 'Direct reaction conversion';

  // Check for special reaction patterns
  for (const patternDef of REACTION_TRIGGER_PATTERNS) {
    if (patternDef.pattern.test(name)) {
      stressCost = patternDef.stressCost;
      triggerText = patternDef.trigger;
      conversionNotes = `Matched reaction pattern: ${name}`;
      break;
    }
  }

  // Parse damage from description
  const parsedDamages = parseDamageFromDescription(description);
  const primaryDamage = parsedDamages.length > 0 ? toDamageExpression(parsedDamages[0]) : undefined;

  const feature: ConvertedFeature = {
    name,
    type: FeatureType.REACTION,
    description: simplifyDescription(description),
    trigger: {
      description: triggerText,
    },
    sourceAbility: name,
    conversionNotes,
  };

  // Add damage if found
  if (primaryDamage) {
    feature.damage = primaryDamage;
    conversionNotes += ` (${primaryDamage.diceCount}d${primaryDamage.diceSize} damage extracted)`;
    feature.conversionNotes = conversionNotes;
  }

  // Add cost if required
  if (stressCost > 0) {
    feature.cost = createStressCost(stressCost);
  }

  return feature;
}

// ============================================================================
// BONUS ACTION CONVERSION
// ============================================================================

/**
 * Converts a D&D 5e bonus action to a Daggerheart Feature.
 *
 * Bonus actions typically become Action features without cost,
 * unless they have limited uses or recharge mechanics.
 *
 * @param bonusAction - D&D 5e bonus action
 * @returns Converted Daggerheart feature with metadata
 */
export function convertBonusAction(bonusAction: BonusAction): ConvertedFeature {
  const { name, description, recharge, uses } = bonusAction;

  let stressCost = 0;
  let conversionNotes = 'Bonus action converted to Action feature';

  if (recharge) {
    stressCost = calculateRechargeStressCost(recharge.minRoll);
    conversionNotes = `Bonus action with Recharge ${recharge.minRoll} = ${stressCost} Stress`;
  } else if (uses) {
    stressCost = calculateUsesStressCost(uses.count, uses.rechargeOn);
    conversionNotes = `Bonus action ${uses.count}/${uses.rechargeOn} = ${stressCost} Stress`;
  }

  const feature: ConvertedFeature = {
    name,
    type: FeatureType.ACTION,
    description: simplifyDescription(description),
    sourceAbility: `${name} (Bonus Action)`,
    conversionNotes,
  };

  if (stressCost > 0) {
    feature.cost = createStressCost(stressCost);
  }

  return feature;
}

// ============================================================================
// LEGENDARY ACTION CONVERSION
// ============================================================================

/**
 * Converts a D&D 5e legendary action to a Daggerheart Feature.
 *
 * Legendary actions become Reaction features (can be used at end of another creature's turn)
 * with Stress cost equal to their action cost.
 * Now extracts damage dice from descriptions.
 *
 * @param legendaryAction - D&D 5e legendary action
 * @returns Converted Daggerheart feature with metadata
 *
 * @example
 * ```typescript
 * const legendary: LegendaryAction = {
 *   name: "Wing Attack",
 *   description: "The dragon beats its wings...",
 *   cost: 2
 * };
 * const feature = convertLegendaryAction(legendary);
 * // { name: "Wing Attack", type: FeatureType.REACTION, cost: { type: "Stress", amount: 2 }, ... }
 * ```
 */
export function convertLegendaryAction(legendaryAction: LegendaryAction): ConvertedFeature {
  const { name, description, cost } = legendaryAction;

  // Parse damage from description
  const parsedDamages = parseDamageFromDescription(description);
  const primaryDamage = parsedDamages.length > 0 ? toDamageExpression(parsedDamages[0]) : undefined;

  let conversionNotes = `Legendary action (${cost} action cost) = ${cost} Stress`;

  const feature: ConvertedFeature = {
    name,
    type: FeatureType.REACTION,
    description: simplifyDescription(description),
    trigger: {
      description: "At the end of another creature's turn",
    },
    cost: createStressCost(cost),
    sourceAbility: `${name} (Legendary)`,
    conversionNotes,
  };

  // Add damage if found
  if (primaryDamage) {
    feature.damage = primaryDamage;
    feature.conversionNotes += ` (${primaryDamage.diceCount}d${primaryDamage.diceSize} damage extracted)`;
  }

  return feature;
}

// ============================================================================
// SPELLCASTING CONVERSION
// ============================================================================

/**
 * Converts D&D 5e spellcasting to Daggerheart Features.
 *
 * Creates simplified spell-like features grouped by type/usage.
 *
 * @param spellcasting - D&D 5e spellcasting object
 * @returns Array of converted features
 */
export function convertSpellcasting(spellcasting: Spellcasting): ConvertedFeature[] {
  const features: ConvertedFeature[] = [];

  if (isInnateSpellcasting(spellcasting)) {
    const { spells } = spellcasting;

    // At-will spells become a passive feature
    if (spells.atWill && spells.atWill.length > 0) {
      const spellNames = spells.atWill.map((s) => s.name).join(', ');
      features.push({
        name: 'Innate Magic',
        type: FeatureType.PASSIVE,
        description: `Can cast at will: ${spellNames}.`,
        sourceAbility: 'Innate Spellcasting (At Will)',
        conversionNotes: 'At-will innate spells grouped as passive',
      });
    }

    // 3/day spells = 1 Stress each
    if (spells.perDay3 && spells.perDay3.length > 0) {
      const spellNames = spells.perDay3.map((s) => s.name).join(', ');
      features.push({
        name: 'Frequent Spells',
        type: FeatureType.ACTION,
        description: `Can cast: ${spellNames}.`,
        cost: createStressCost(1),
        sourceAbility: 'Innate Spellcasting (3/day)',
        conversionNotes: '3/day spells = 1 Stress',
      });
    }

    // 1/day spells = 2 Stress each
    if (spells.perDay1 && spells.perDay1.length > 0) {
      const spellNames = spells.perDay1.map((s) => s.name).join(', ');
      features.push({
        name: 'Rare Spells',
        type: FeatureType.ACTION,
        description: `Can cast: ${spellNames}.`,
        cost: createStressCost(2),
        sourceAbility: 'Innate Spellcasting (1/day)',
        conversionNotes: '1/day spells = 2 Stress',
      });
    }
  }

  if (isTraditionalSpellcasting(spellcasting)) {
    const { spells } = spellcasting;

    // Cantrips as passive
    if (spells.cantrips && spells.cantrips.length > 0) {
      const spellNames = spells.cantrips.map((s) => s.name).join(', ');
      features.push({
        name: 'Cantrips',
        type: FeatureType.PASSIVE,
        description: `Can cast at will: ${spellNames}.`,
        sourceAbility: 'Spellcasting (Cantrips)',
        conversionNotes: 'Cantrips as passive abilities',
      });
    }

    // Group leveled spells by tier
    // Levels 1-3 = 1 Stress, 4-6 = 2 Stress, 7-9 = 3 Stress
    const lowSpells: string[] = [];
    const midSpells: string[] = [];
    const highSpells: string[] = [];

    for (const level of [1, 2, 3] as const) {
      const levelSpells = spells[level];
      if (levelSpells) {
        lowSpells.push(...levelSpells.map((s) => s.name));
      }
    }

    for (const level of [4, 5, 6] as const) {
      const levelSpells = spells[level];
      if (levelSpells) {
        midSpells.push(...levelSpells.map((s) => s.name));
      }
    }

    for (const level of [7, 8, 9] as const) {
      const levelSpells = spells[level];
      if (levelSpells) {
        highSpells.push(...levelSpells.map((s) => s.name));
      }
    }

    if (lowSpells.length > 0) {
      features.push({
        name: 'Minor Spells',
        type: FeatureType.ACTION,
        description: `Can cast: ${lowSpells.join(', ')}.`,
        cost: createStressCost(1),
        sourceAbility: 'Spellcasting (1st-3rd)',
        conversionNotes: 'Low-level spells = 1 Stress',
      });
    }

    if (midSpells.length > 0) {
      features.push({
        name: 'Major Spells',
        type: FeatureType.ACTION,
        description: `Can cast: ${midSpells.join(', ')}.`,
        cost: createStressCost(2),
        sourceAbility: 'Spellcasting (4th-6th)',
        conversionNotes: 'Mid-level spells = 2 Stress',
      });
    }

    if (highSpells.length > 0) {
      features.push({
        name: 'Legendary Spells',
        type: FeatureType.ACTION,
        description: `Can cast: ${highSpells.join(', ')}.`,
        cost: createStressCost(3),
        sourceAbility: 'Spellcasting (7th-9th)',
        conversionNotes: 'High-level spells = 3 Stress',
      });
    }
  }

  return features;
}

// ============================================================================
// MOVEMENT FEATURES
// ============================================================================

/**
 * Converts D&D 5e movement capabilities to Passive Features.
 *
 * @param speed - D&D 5e speed object
 * @returns Array of movement-related features
 */
export function convertMovementToFeatures(speed: DnD5eMonster['speed']): ConvertedFeature[] {
  const features: ConvertedFeature[] = [];

  if (speed.fly) {
    const hover = speed.hover ? ' (hover)' : '';
    features.push({
      name: 'Flight',
      type: FeatureType.PASSIVE,
      description: `Can fly${hover}.`,
      sourceAbility: `Fly ${speed.fly} ft.${hover}`,
      conversionNotes: 'Flying speed converted to Flight passive',
    });
  }

  if (speed.swim) {
    features.push({
      name: 'Swimmer',
      type: FeatureType.PASSIVE,
      description: 'Can swim without difficulty.',
      sourceAbility: `Swim ${speed.swim} ft.`,
      conversionNotes: 'Swimming speed converted to Swimmer passive',
    });
  }

  if (speed.burrow) {
    features.push({
      name: 'Burrower',
      type: FeatureType.PASSIVE,
      description: 'Can burrow through earth and rock.',
      sourceAbility: `Burrow ${speed.burrow} ft.`,
      conversionNotes: 'Burrowing speed converted to Burrower passive',
    });
  }

  if (speed.climb) {
    features.push({
      name: 'Climber',
      type: FeatureType.PASSIVE,
      description: 'Can climb without difficulty.',
      sourceAbility: `Climb ${speed.climb} ft.`,
      conversionNotes: 'Climbing speed converted to Climber passive',
    });
  }

  return features;
}

// ============================================================================
// DAMAGE/CONDITION IMMUNITY FEATURES
// ============================================================================

/**
 * Converts D&D 5e damage modifiers to Passive Features.
 *
 * @param damageModifiers - D&D 5e damage modifiers
 * @returns Array of damage-related features
 */
export function convertDamageModifiersToFeatures(
  damageModifiers: DnD5eMonster['damageModifiers']
): ConvertedFeature[] {
  const features: ConvertedFeature[] = [];

  if (!damageModifiers) return features;

  // Immunities
  if (damageModifiers.immunities.length > 0) {
    const types = damageModifiers.immunities.map((i) => i.damageType).join(', ');
    features.push({
      name: 'Damage Immunity',
      type: FeatureType.PASSIVE,
      description: `Immune to ${types} damage.`,
      sourceAbility: `Damage Immunities: ${types}`,
      conversionNotes: 'Damage immunities as passive feature',
    });
  }

  // Resistances
  if (damageModifiers.resistances.length > 0) {
    const types = damageModifiers.resistances.map((r) => r.damageType).join(', ');
    features.push({
      name: 'Damage Resistance',
      type: FeatureType.PASSIVE,
      description: `Resistant to ${types} damage.`,
      sourceAbility: `Damage Resistances: ${types}`,
      conversionNotes: 'Damage resistances as passive feature',
    });
  }

  // Vulnerabilities (rare, but include them)
  if (damageModifiers.vulnerabilities.length > 0) {
    const types = damageModifiers.vulnerabilities.map((v) => v.damageType).join(', ');
    features.push({
      name: 'Vulnerability',
      type: FeatureType.PASSIVE,
      description: `Takes extra damage from ${types} sources.`,
      sourceAbility: `Damage Vulnerabilities: ${types}`,
      conversionNotes: 'Damage vulnerabilities as passive feature',
    });
  }

  return features;
}

/**
 * Converts D&D 5e condition immunities to a Passive Feature.
 *
 * @param conditionImmunities - Array of D&D conditions
 * @returns Condition immunity feature or undefined
 */
export function convertConditionImmunitiesToFeature(
  conditionImmunities: DnD5eCondition[] | undefined
): ConvertedFeature | undefined {
  if (!conditionImmunities || conditionImmunities.length === 0) {
    return undefined;
  }

  const conditions = conditionImmunities.join(', ');
  return {
    name: 'Condition Immunity',
    type: FeatureType.PASSIVE,
    description: `Immune to the ${conditions} condition${conditionImmunities.length > 1 ? 's' : ''}.`,
    sourceAbility: `Condition Immunities: ${conditions}`,
    conversionNotes: 'Condition immunities as passive feature',
  };
}

// ============================================================================
// LEGENDARY RESISTANCE
// ============================================================================

/**
 * Converts D&D 5e Legendary Resistance to a Reaction Feature.
 *
 * @param legendaryResistance - Legendary resistance object
 * @returns Legendary resistance feature
 */
export function convertLegendaryResistance(
  legendaryResistance: DnD5eMonster['legendaryResistance']
): ConvertedFeature | undefined {
  if (!legendaryResistance) return undefined;

  const { count } = legendaryResistance;

  return {
    name: 'Legendary Resistance',
    type: FeatureType.REACTION,
    description:
      'When failing a Reaction Roll, can choose to succeed instead.',
    trigger: {
      description: 'When failing a Reaction Roll',
    },
    cost: createStressCost(2),
    sourceAbility: `Legendary Resistance (${count}/Day)`,
    conversionNotes: `Legendary Resistance ${count}/day = Reaction with 2 Stress cost`,
  };
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts all features from a D&D 5e stat block to Daggerheart Features.
 *
 * Processes:
 * - Traits -> Passive/Action features
 * - Actions (non-attack) -> Action features
 * - Bonus Actions -> Action features
 * - Reactions -> Reaction features
 * - Legendary Actions -> Action features with Stress cost
 * - Spellcasting -> Grouped spell features
 * - Movement types -> Passive features
 * - Damage/Condition immunities -> Passive features
 * - Legendary Resistance -> Reaction feature
 *
 * @param statBlock - D&D 5e monster stat block
 * @param options - Conversion options
 * @returns Array of converted Daggerheart features
 *
 * @example
 * ```typescript
 * const dragon: DnD5eMonster = { ... };
 * const features = convertAllFeatures(dragon);
 * // Returns array of all converted features with source attribution
 * ```
 */
export function convertAllFeatures(
  statBlock: DnD5eMonster,
  options: FeatureConversionOptions = {}
): ConvertedFeature[] {
  const {
    includeSpellcasting = true,
    includeLegendaryActions = true,
  } = options;

  const features: ConvertedFeature[] = [];

  // Convert traits
  if (statBlock.traits) {
    for (const trait of statBlock.traits) {
      features.push(convertTrait(trait));
    }
  }

  // Convert non-attack actions
  if (statBlock.actions) {
    for (const action of statBlock.actions) {
      features.push(convertAction(action));
    }
  }

  // Convert bonus actions
  if (statBlock.bonusActions) {
    for (const bonusAction of statBlock.bonusActions) {
      features.push(convertBonusAction(bonusAction));
    }
  }

  // Convert reactions
  if (statBlock.reactions) {
    for (const reaction of statBlock.reactions) {
      features.push(convertReaction(reaction));
    }
  }

  // Convert legendary actions
  if (includeLegendaryActions && statBlock.legendaryActions) {
    for (const legendaryAction of statBlock.legendaryActions.actions) {
      features.push(convertLegendaryAction(legendaryAction));
    }
  }

  // Convert spellcasting
  if (includeSpellcasting && statBlock.spellcasting) {
    features.push(...convertSpellcasting(statBlock.spellcasting));
  }

  // Convert movement capabilities
  features.push(...convertMovementToFeatures(statBlock.speed));

  // Convert damage modifiers
  features.push(...convertDamageModifiersToFeatures(statBlock.damageModifiers));

  // Convert condition immunities
  const conditionFeature = convertConditionImmunitiesToFeature(statBlock.conditionImmunities);
  if (conditionFeature) {
    features.push(conditionFeature);
  }

  // Convert legendary resistance
  const legendaryResistFeature = convertLegendaryResistance(statBlock.legendaryResistance);
  if (legendaryResistFeature) {
    features.push(legendaryResistFeature);
  }

  return features;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Filters features by type.
 *
 * @param features - Array of features
 * @param type - Feature type to filter by
 * @returns Filtered features
 */
export function filterByType(
  features: ConvertedFeature[],
  type: FeatureType
): ConvertedFeature[] {
  return features.filter((f) => f.type === type);
}

/**
 * Gets all passive features from a converted list.
 *
 * @param features - Array of features
 * @returns Passive features only
 */
export function getPassiveFeatures(features: ConvertedFeature[]): ConvertedFeature[] {
  return filterByType(features, FeatureType.PASSIVE);
}

/**
 * Gets all action features from a converted list.
 *
 * @param features - Array of features
 * @returns Action features only
 */
export function getActionFeatures(features: ConvertedFeature[]): ConvertedFeature[] {
  return filterByType(features, FeatureType.ACTION);
}

/**
 * Gets all reaction features from a converted list.
 *
 * @param features - Array of features
 * @returns Reaction features only
 */
export function getReactionFeatures(features: ConvertedFeature[]): ConvertedFeature[] {
  return filterByType(features, FeatureType.REACTION);
}

/**
 * Calculates total potential Stress cost of all features.
 *
 * @param features - Array of features
 * @returns Total Stress if all features were used once
 */
export function calculateTotalStressCost(features: ConvertedFeature[]): number {
  return features.reduce((total, feature) => {
    if (feature.cost?.type === FeatureCostType.STRESS) {
      return total + (feature.cost.amount || 1);
    }
    return total;
  }, 0);
}

/**
 * Summarizes converted features for display.
 *
 * @param features - Array of features
 * @returns Summary object
 */
export function summarizeFeatures(features: ConvertedFeature[]): {
  total: number;
  passive: number;
  action: number;
  reaction: number;
  totalStressCost: number;
  conversionNotes: string[];
} {
  const passive = getPassiveFeatures(features).length;
  const action = getActionFeatures(features).length;
  const reaction = getReactionFeatures(features).length;

  return {
    total: features.length,
    passive,
    action,
    reaction,
    totalStressCost: calculateTotalStressCost(features),
    conversionNotes: features.map((f) => `${f.name}: ${f.conversionNotes}`),
  };
}
