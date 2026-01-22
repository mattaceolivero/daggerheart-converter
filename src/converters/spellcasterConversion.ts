/**
 * Spellcaster Conversion Specialization
 *
 * Specialized handling for D&D 5e spellcasting creatures converting to Daggerheart.
 * Converts spell slots to Stress pools and spells to appropriate features/attacks.
 *
 * Conversion Strategy:
 * | D&D Mechanism | Daggerheart Equivalent |
 * |---------------|------------------------|
 * | Spell Slots | Bonus Stress (slots/3, rounded up) |
 * | Cantrip (damage) | Basic ranged attack (Magic) |
 * | Spell Level 1-3 | Action (1 Stress) |
 * | Spell Level 4-6 | Action (2 Stress) |
 * | Spell Level 7+ | Action (3 Stress) |
 * | At-will innate | Passive or free Action |
 * | 3/day innate | Action (1 Stress) |
 * | 1/day innate | Action (2 Stress) |
 *
 * @module spellcasterConversion
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  Spellcasting,
  TraditionalSpellcasting,
  InnateSpellcasting,
  Spell,
  SpellSlots,
  isTraditionalSpellcasting,
  isInnateSpellcasting,
} from '../models/dnd5e';
import {
  Feature,
  FeatureType,
  FeatureCost,
  FeatureCostType,
  Attack,
  RangeBand,
  DamageExpression,
  DamageType,
  Attribute,
} from '../models/daggerheart';
import { crToTier, getTierDicePool, parseCRString } from './crToTier';

// ============================================================================
// EXPORTED INTERFACES
// ============================================================================

/**
 * Result of spellcaster conversion analysis.
 */
export interface SpellcasterConversionResult {
  /** Bonus Stress pool from spell slots */
  bonusStress: number;
  /** Features generated from spell conversion */
  spellFeatures: Feature[];
  /** Magic attack if damage cantrip present */
  spellAttack?: Attack;
  /** Notes about conversion decisions */
  conversionNotes: string[];
}

/**
 * Spell category for grouping and conversion.
 */
export enum SpellCategory {
  DAMAGE = 'damage',
  BUFF_HEAL = 'buff_heal',
  CONTROL = 'control',
  UTILITY = 'utility',
}

/**
 * Analyzed spell with category and conversion data.
 */
export interface AnalyzedSpell {
  /** Original spell */
  spell: Spell;
  /** Determined category */
  category: SpellCategory;
  /** Whether this is a priority spell to convert */
  isPriority: boolean;
  /** Suggested Stress cost */
  stressCost: number;
  /** Whether this is a cantrip */
  isCantrip: boolean;
}

// ============================================================================
// SPELL CLASSIFICATION PATTERNS
// ============================================================================

/**
 * Patterns for identifying damage spells.
 */
const DAMAGE_SPELL_PATTERNS = [
  // Direct damage
  /fire\s*bolt/i,
  /eldritch\s*blast/i,
  /ray\s*of\s*frost/i,
  /chill\s*touch/i,
  /sacred\s*flame/i,
  /toll\s*the\s*dead/i,
  /shocking\s*grasp/i,
  /acid\s*splash/i,
  /poison\s*spray/i,
  /produce\s*flame/i,
  /thorn\s*whip/i,
  // Leveled damage spells
  /magic\s*missile/i,
  /chromatic\s*orb/i,
  /burning\s*hands/i,
  /thunderwave/i,
  /witch\s*bolt/i,
  /guiding\s*bolt/i,
  /inflict\s*wounds/i,
  /scorching\s*ray/i,
  /shatter/i,
  /fireball/i,
  /lightning\s*bolt/i,
  /ice\s*storm/i,
  /blight/i,
  /flame\s*strike/i,
  /cone\s*of\s*cold/i,
  /chain\s*lightning/i,
  /disintegrate/i,
  /finger\s*of\s*death/i,
  /fire\s*storm/i,
  /meteor\s*swarm/i,
  /power\s*word\s*kill/i,
];

/**
 * Patterns for identifying buff/heal spells.
 */
const BUFF_HEAL_SPELL_PATTERNS = [
  /cure\s*wounds/i,
  /healing\s*word/i,
  /mass\s*cure/i,
  /mass\s*healing/i,
  /heal\b/i,
  /regenerate/i,
  /bless/i,
  /shield\s*of\s*faith/i,
  /aid/i,
  /beacon\s*of\s*hope/i,
  /haste/i,
  /stoneskin/i,
  /death\s*ward/i,
  /heroism/i,
  /enhance\s*ability/i,
  /protection/i,
  /sanctuary/i,
  /shield/i,
  /mage\s*armor/i,
  /barkskin/i,
  /blur/i,
  /mirror\s*image/i,
  /greater\s*restoration/i,
  /resurrection/i,
  /revivify/i,
];

/**
 * Patterns for identifying control spells.
 */
const CONTROL_SPELL_PATTERNS = [
  /hold\s*(person|monster)/i,
  /command/i,
  /charm\s*(person|monster)/i,
  /dominate/i,
  /suggestion/i,
  /mass\s*suggestion/i,
  /banishment/i,
  /polymorph/i,
  /fear/i,
  /hypnotic\s*pattern/i,
  /web/i,
  /entangle/i,
  /grease/i,
  /slow/i,
  /stinking\s*cloud/i,
  /confusion/i,
  /wall\s*of/i,
  /force\s*cage/i,
  /maze/i,
  /power\s*word\s*stun/i,
  /sleep/i,
  /silence/i,
  /blindness/i,
  /counterspell/i,
  /dispel\s*magic/i,
];

/**
 * Damage cantrips that should become spell attacks.
 */
const DAMAGE_CANTRIPS = [
  'fire bolt',
  'eldritch blast',
  'ray of frost',
  'chill touch',
  'sacred flame',
  'toll the dead',
  'shocking grasp',
  'acid splash',
  'poison spray',
  'produce flame',
  'thorn whip',
  'frostbite',
  'create bonfire',
  'word of radiance',
  'vicious mockery',
  'mind sliver',
  'infestation',
  'primal savagery',
  'thunderclap',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if a monster has spellcasting capability.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if the monster has any form of spellcasting
 *
 * @example
 * ```typescript
 * if (isSpellcaster(monster)) {
 *   const result = convertSpellcasting(monster);
 * }
 * ```
 */
export function isSpellcaster(statBlock: DnD5eMonster): boolean {
  return statBlock.spellcasting !== undefined;
}

/**
 * Categorizes a spell based on its name.
 *
 * @param spell - Spell to categorize
 * @returns Spell category
 */
function categorizeSpell(spell: Spell): SpellCategory {
  const name = spell.name.toLowerCase();

  // Check damage patterns
  for (const pattern of DAMAGE_SPELL_PATTERNS) {
    if (pattern.test(name)) {
      return SpellCategory.DAMAGE;
    }
  }

  // Check buff/heal patterns
  for (const pattern of BUFF_HEAL_SPELL_PATTERNS) {
    if (pattern.test(name)) {
      return SpellCategory.BUFF_HEAL;
    }
  }

  // Check control patterns
  for (const pattern of CONTROL_SPELL_PATTERNS) {
    if (pattern.test(name)) {
      return SpellCategory.CONTROL;
    }
  }

  // Default to utility
  return SpellCategory.UTILITY;
}

/**
 * Determines if a cantrip is a damage cantrip.
 *
 * @param spell - Spell to check
 * @returns True if this is a damage-dealing cantrip
 */
function isDamageCantrip(spell: Spell): boolean {
  if (spell.level !== 0) return false;
  const nameLower = spell.name.toLowerCase();
  return DAMAGE_CANTRIPS.some((dc) => nameLower.includes(dc));
}

/**
 * Calculates Stress cost based on spell level.
 *
 * @param level - Spell level (0-9)
 * @returns Stress cost
 */
function getSpellStressCost(level: number): number {
  if (level === 0) return 0; // Cantrips are free
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  return 3; // 7th+ level spells
}

/**
 * Calculates total spell slots from a SpellSlots object.
 *
 * @param slots - Spell slots by level
 * @returns Total number of spell slots
 */
function calculateTotalSlots(slots: SpellSlots): number {
  let total = 0;
  for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
    const count = slots[level];
    if (count) {
      total += count;
    }
  }
  return total;
}

/**
 * Calculates bonus Stress from spell slots.
 * Formula: Total slots / 3, rounded up
 *
 * @param slots - Spell slots by level
 * @returns Bonus Stress to add to creature
 */
function calculateBonusStress(slots: SpellSlots): number {
  const totalSlots = calculateTotalSlots(slots);
  return Math.ceil(totalSlots / 3);
}

/**
 * Calculates highest spell level available from slots.
 *
 * @param slots - Spell slots by level
 * @returns Highest spell level (1-9) or 0 if no slots
 */
function getHighestSpellLevel(slots: SpellSlots): number {
  for (const level of [9, 8, 7, 6, 5, 4, 3, 2, 1] as const) {
    if (slots[level] && slots[level]! > 0) {
      return level;
    }
  }
  return 0;
}

/**
 * Analyzes spells to determine priority for conversion.
 * Prioritizes:
 * 1. Damage spells (core combat capability)
 * 2. Control spells (battlefield impact)
 * 3. Buff/Heal spells (support capability)
 * 4. Utility spells (usually omitted)
 *
 * @param spells - Array of spells
 * @returns Analyzed spells with priority and cost
 */
function analyzeSpells(spells: Spell[]): AnalyzedSpell[] {
  return spells.map((spell) => {
    const category = categorizeSpell(spell);
    const isCantrip = spell.level === 0;
    const isPriority =
      category === SpellCategory.DAMAGE ||
      category === SpellCategory.CONTROL ||
      (category === SpellCategory.BUFF_HEAL && spell.level >= 3);

    return {
      spell,
      category,
      isPriority,
      stressCost: getSpellStressCost(spell.level),
      isCantrip,
    };
  });
}

/**
 * Selects key spells to convert, limiting to most impactful.
 *
 * @param analyzedSpells - All analyzed spells
 * @param maxFeatures - Maximum number of spell features (default 4)
 * @returns Selected priority spells grouped by Stress cost
 */
function selectKeySpells(
  analyzedSpells: AnalyzedSpell[],
  maxFeatures: number = 4
): Map<number, AnalyzedSpell[]> {
  // Filter to priority spells, excluding cantrips (handled separately)
  const prioritySpells = analyzedSpells
    .filter((s) => s.isPriority && !s.isCantrip)
    .sort((a, b) => {
      // Sort by category importance, then by level (higher first)
      const categoryOrder = {
        [SpellCategory.DAMAGE]: 1,
        [SpellCategory.CONTROL]: 2,
        [SpellCategory.BUFF_HEAL]: 3,
        [SpellCategory.UTILITY]: 4,
      };
      const catDiff = categoryOrder[a.category] - categoryOrder[b.category];
      if (catDiff !== 0) return catDiff;
      return b.spell.level - a.spell.level;
    });

  // Group by Stress cost
  const byStressCost = new Map<number, AnalyzedSpell[]>();

  let selected = 0;
  for (const spell of prioritySpells) {
    if (selected >= maxFeatures) break;

    const existing = byStressCost.get(spell.stressCost) || [];
    // Limit to 2 spells per Stress tier for variety
    if (existing.length < 2) {
      existing.push(spell);
      byStressCost.set(spell.stressCost, existing);
      selected++;
    }
  }

  return byStressCost;
}

/**
 * Creates a Stress cost object.
 *
 * @param amount - Stress amount
 * @returns FeatureCost object
 */
function createStressCost(amount: number): FeatureCost {
  return {
    type: FeatureCostType.STRESS,
    amount,
  };
}

/**
 * Generates a spell attack from a damage cantrip.
 *
 * @param cantrip - Damage cantrip spell
 * @param spellcasting - Spellcasting data for attack bonus
 * @param tier - Creature tier for dice scaling
 * @returns Attack object
 */
function generateSpellAttack(
  cantrip: Spell,
  spellcasting: Spellcasting,
  tier: number
): Attack {
  const attackBonus = spellcasting.spellAttackBonus || 0;
  const dicePool = getTierDicePool(tier as 1 | 2 | 3 | 4);

  // Determine range based on cantrip name
  const name = cantrip.name.toLowerCase();
  let range = RangeBand.FAR; // Default for most spell attacks
  if (name.includes('touch') || name.includes('shocking grasp')) {
    range = RangeBand.MELEE;
  } else if (name.includes('close') || name.includes('whip')) {
    range = RangeBand.CLOSE;
  }

  // Scale damage dice by tier
  const diceSize = tier <= 2 ? 6 : tier === 3 ? 8 : 10;

  const damage: DamageExpression = {
    diceCount: dicePool,
    diceSize: diceSize as 4 | 6 | 8 | 10 | 12,
    modifier: Math.floor(attackBonus / 2), // Partial mod for balance
    damageType: DamageType.MAGIC,
  };

  const attack: Attack = {
    name: cantrip.name,
    modifier: attackBonus,
    range,
    damage,
  };

  const additionalEffect = getSpellAdditionalEffect(cantrip.name);
  if (additionalEffect) {
    attack.additionalEffects = additionalEffect;
  }

  return attack;
}

/**
 * Gets additional effect text for known cantrips.
 *
 * @param spellName - Name of the spell
 * @returns Additional effect text or undefined
 */
function getSpellAdditionalEffect(spellName: string): string | undefined {
  const name = spellName.toLowerCase();

  if (name.includes('ray of frost')) {
    return 'Target speed reduced by one range band until end of next turn.';
  }
  if (name.includes('chill touch')) {
    return "Target can't regain HP until start of adversary's next turn.";
  }
  if (name.includes('vicious mockery')) {
    return 'Target has disadvantage on next attack.';
  }
  if (name.includes('mind sliver')) {
    return 'Target subtracts 1d4 from next Reaction Roll.';
  }
  if (name.includes('shocking grasp')) {
    return "Target can't take reactions until start of adversary's next turn.";
  }

  return undefined;
}

/**
 * Generates a feature name based on spell category and level.
 *
 * @param category - Spell category
 * @param stressCost - Stress cost tier
 * @returns Feature name
 */
function generateFeatureName(category: SpellCategory, stressCost: number): string {
  const prefix = stressCost === 1 ? 'Minor' : stressCost === 2 ? 'Major' : 'Legendary';

  switch (category) {
    case SpellCategory.DAMAGE:
      return `${prefix} Evocation`;
    case SpellCategory.CONTROL:
      return `${prefix} Enchantment`;
    case SpellCategory.BUFF_HEAL:
      return `${prefix} Restoration`;
    default:
      return `${prefix} Magic`;
  }
}

/**
 * Generates a feature description from analyzed spells.
 *
 * @param spells - Analyzed spells to include
 * @param category - Primary category
 * @returns Feature description
 */
function generateFeatureDescription(
  spells: AnalyzedSpell[],
  category: SpellCategory
): string {
  const spellNames = spells.map((s) => s.spell.name).join(', ');

  switch (category) {
    case SpellCategory.DAMAGE:
      return `Casts offensive magic: ${spellNames}. Roll to attack; on hit, deal magic damage.`;
    case SpellCategory.CONTROL:
      return `Casts control magic: ${spellNames}. Targets must make a Reaction Roll or suffer the effect.`;
    case SpellCategory.BUFF_HEAL:
      return `Casts supportive magic: ${spellNames}. Allies gain benefits or recover HP.`;
    default:
      return `Casts utility magic: ${spellNames}.`;
  }
}

/**
 * Determines reaction roll attribute for spell effects.
 *
 * @param category - Spell category
 * @returns Appropriate attribute
 */
function getSpellReactionAttribute(category: SpellCategory): Attribute | undefined {
  switch (category) {
    case SpellCategory.DAMAGE:
      return Attribute.AGILITY; // Dodge the spell
    case SpellCategory.CONTROL:
      return Attribute.INSTINCT; // Resist mental effect
    case SpellCategory.BUFF_HEAL:
      return undefined; // No roll needed
    default:
      return undefined;
  }
}

// ============================================================================
// MAIN CONVERSION FUNCTIONS
// ============================================================================

/**
 * Converts traditional spellcasting to Daggerheart features.
 *
 * @param spellcasting - Traditional spellcasting data
 * @param tier - Creature tier for scaling
 * @returns Partial conversion result
 */
function convertTraditionalSpellcasting(
  spellcasting: TraditionalSpellcasting,
  tier: number
): SpellcasterConversionResult {
  const result: SpellcasterConversionResult = {
    bonusStress: 0,
    spellFeatures: [],
    conversionNotes: [],
  };

  const { spells, slots } = spellcasting;

  // Calculate bonus Stress from slots
  if (slots) {
    result.bonusStress = calculateBonusStress(slots);
    const totalSlots = calculateTotalSlots(slots);
    const highestLevel = getHighestSpellLevel(slots);
    result.conversionNotes.push(
      `${totalSlots} spell slots (max level ${highestLevel}) = +${result.bonusStress} Stress`
    );
  }

  // Collect all spells
  const allSpells: Spell[] = [];
  if (spells.cantrips) allSpells.push(...spells.cantrips);
  for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
    const levelSpells = spells[level];
    if (levelSpells) allSpells.push(...levelSpells);
  }

  // Analyze and select key spells
  const analyzedSpells = analyzeSpells(allSpells);
  const selectedSpells = selectKeySpells(analyzedSpells);

  // Handle damage cantrips -> spell attack
  const damageCantrip = analyzedSpells.find(
    (s) => s.isCantrip && isDamageCantrip(s.spell)
  );
  if (damageCantrip) {
    result.spellAttack = generateSpellAttack(damageCantrip.spell, spellcasting, tier);
    result.conversionNotes.push(
      `${damageCantrip.spell.name} converted to primary magic attack`
    );
  }

  // Handle non-damage cantrips
  const utilityCantrips = analyzedSpells.filter(
    (s) => s.isCantrip && !isDamageCantrip(s.spell)
  );
  if (utilityCantrips.length > 0) {
    const cantripNames = utilityCantrips.map((s) => s.spell.name).join(', ');
    result.spellFeatures.push({
      name: 'Minor Cantrips',
      type: FeatureType.PASSIVE,
      description: `Can cast at will: ${cantripNames}.`,
    });
    result.conversionNotes.push(`${utilityCantrips.length} utility cantrips as passive`);
  }

  // Generate features from selected leveled spells
  for (const [stressCost, spellGroup] of selectedSpells) {
    if (!spellGroup || spellGroup.length === 0) continue;

    // Group by primary category
    const firstSpell = spellGroup[0];
    if (!firstSpell) continue;

    const primaryCategory = firstSpell.category;
    const featureName = generateFeatureName(primaryCategory, stressCost);
    const description = generateFeatureDescription(spellGroup, primaryCategory);
    const attribute = getSpellReactionAttribute(primaryCategory);

    const feature: Feature = {
      name: featureName,
      type: FeatureType.ACTION,
      description,
      cost: createStressCost(stressCost),
    };

    if (attribute) {
      feature.reactionRollAttribute = attribute;
    }

    result.spellFeatures.push(feature);
    result.conversionNotes.push(
      `${spellGroup.length} ${primaryCategory} spells (L${spellGroup.map((s) => s.spell.level).join(',')}) = ${featureName} (${stressCost} Stress)`
    );
  }

  return result;
}

/**
 * Converts innate spellcasting to Daggerheart features.
 *
 * @param spellcasting - Innate spellcasting data
 * @param tier - Creature tier for scaling
 * @returns Partial conversion result
 */
function convertInnateSpellcasting(
  spellcasting: InnateSpellcasting,
  tier: number
): SpellcasterConversionResult {
  const result: SpellcasterConversionResult = {
    bonusStress: 0,
    spellFeatures: [],
    conversionNotes: [],
  };

  const { spells } = spellcasting;

  // At-will spells -> Passive or free action
  if (spells.atWill && spells.atWill.length > 0) {
    const analyzed = analyzeSpells(spells.atWill);

    // Check for damage cantrip-like at-will spells
    const damageAtWill = analyzed.find((s) => s.category === SpellCategory.DAMAGE);
    if (damageAtWill) {
      result.spellAttack = generateSpellAttack(damageAtWill.spell, spellcasting, tier);
      result.conversionNotes.push(
        `At-will ${damageAtWill.spell.name} converted to magic attack`
      );
    }

    // Other at-will spells as passive
    const otherAtWill = analyzed.filter(
      (s) => s.category !== SpellCategory.DAMAGE || s !== damageAtWill
    );
    if (otherAtWill.length > 0) {
      const spellNames = otherAtWill.map((s) => s.spell.name).join(', ');
      result.spellFeatures.push({
        name: 'Innate Magic',
        type: FeatureType.PASSIVE,
        description: `Can use at will: ${spellNames}.`,
      });
      result.conversionNotes.push(`${otherAtWill.length} at-will spells as passive`);
    }
  }

  // 3/day spells -> 1 Stress
  if (spells.perDay3 && spells.perDay3.length > 0) {
    const analyzed = analyzeSpells(spells.perDay3);
    const priority = analyzed.filter((s) => s.isPriority).slice(0, 2);

    const firstPriority = priority[0];
    if (priority.length > 0 && firstPriority) {
      const primaryCategory = firstPriority.category;
      const spellNames = priority.map((s) => s.spell.name).join(', ');
      const attribute = getSpellReactionAttribute(primaryCategory);

      const feature: Feature = {
        name: 'Frequent Innate Magic',
        type: FeatureType.ACTION,
        description: `Uses innate power: ${spellNames}.`,
        cost: createStressCost(1),
      };

      if (attribute) {
        feature.reactionRollAttribute = attribute;
      }

      result.spellFeatures.push(feature);
      result.conversionNotes.push(`3/day spells (${spellNames}) = 1 Stress action`);
    }
  }

  // 2/day spells -> 1-2 Stress (based on level)
  if (spells.perDay2 && spells.perDay2.length > 0) {
    const analyzed = analyzeSpells(spells.perDay2);
    const priority = analyzed.filter((s) => s.isPriority).slice(0, 2);

    if (priority.length > 0) {
      const avgLevel =
        priority.reduce((sum, s) => sum + s.spell.level, 0) / priority.length;
      const stressCost = avgLevel >= 5 ? 2 : 1;
      const spellNames = priority.map((s) => s.spell.name).join(', ');

      result.spellFeatures.push({
        name: 'Occasional Innate Magic',
        type: FeatureType.ACTION,
        description: `Uses innate power: ${spellNames}.`,
        cost: createStressCost(stressCost),
      });

      result.conversionNotes.push(`2/day spells (${spellNames}) = ${stressCost} Stress`);
    }
  }

  // 1/day spells -> 2 Stress
  if (spells.perDay1 && spells.perDay1.length > 0) {
    const analyzed = analyzeSpells(spells.perDay1);
    const priority = analyzed.filter((s) => s.isPriority).slice(0, 2);

    const firstPriority = priority[0];
    if (priority.length > 0 && firstPriority) {
      const primaryCategory = firstPriority.category;
      const spellNames = priority.map((s) => s.spell.name).join(', ');
      const attribute = getSpellReactionAttribute(primaryCategory);

      const feature: Feature = {
        name: 'Rare Innate Magic',
        type: FeatureType.ACTION,
        description: `Uses powerful innate magic: ${spellNames}.`,
        cost: createStressCost(2),
      };

      if (attribute) {
        feature.reactionRollAttribute = attribute;
      }

      result.spellFeatures.push(feature);
      result.conversionNotes.push(`1/day spells (${spellNames}) = 2 Stress action`);
    }

    // Calculate bonus Stress from powerful 1/day spells
    const highLevelSpells = analyzed.filter((s) => s.spell.level >= 5);
    if (highLevelSpells.length > 0) {
      result.bonusStress = Math.ceil(highLevelSpells.length / 2);
      result.conversionNotes.push(
        `${highLevelSpells.length} high-level 1/day spells = +${result.bonusStress} Stress`
      );
    }
  }

  return result;
}

/**
 * Converts D&D 5e spellcasting to Daggerheart format.
 *
 * This is the main entry point for spellcaster conversion.
 * Handles both traditional and innate spellcasting, generating:
 * - Bonus Stress from spell slots
 * - Spell-based features with appropriate costs
 * - Magic attack from damage cantrips
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Complete spellcaster conversion result
 *
 * @example
 * ```typescript
 * const lich: DnD5eMonster = { ... };
 * if (isSpellcaster(lich)) {
 *   const result = convertSpellcasting(lich);
 *   console.log(`Bonus Stress: ${result.bonusStress}`);
 *   console.log(`Features: ${result.spellFeatures.length}`);
 * }
 * ```
 */
export function convertSpellcasting(statBlock: DnD5eMonster): SpellcasterConversionResult {
  const result: SpellcasterConversionResult = {
    bonusStress: 0,
    spellFeatures: [],
    conversionNotes: [],
  };

  if (!statBlock.spellcasting) {
    result.conversionNotes.push('No spellcasting capability');
    return result;
  }

  // Determine tier for scaling (handle string or number CR)
  const crValue = typeof statBlock.challengeRating.cr === 'string'
    ? parseCRString(statBlock.challengeRating.cr)
    : statBlock.challengeRating.cr;
  const tier = crToTier(crValue);

  // Handle based on spellcasting type
  if (isTraditionalSpellcasting(statBlock.spellcasting)) {
    const traditional = convertTraditionalSpellcasting(statBlock.spellcasting, tier);
    result.bonusStress += traditional.bonusStress;
    result.spellFeatures.push(...traditional.spellFeatures);
    if (traditional.spellAttack) {
      result.spellAttack = traditional.spellAttack;
    }
    result.conversionNotes.push('Traditional spellcaster', ...traditional.conversionNotes);
  }

  if (isInnateSpellcasting(statBlock.spellcasting)) {
    const innate = convertInnateSpellcasting(statBlock.spellcasting, tier);
    result.bonusStress += innate.bonusStress;
    result.spellFeatures.push(...innate.spellFeatures);
    // Only set spell attack if not already set by traditional
    if (!result.spellAttack && innate.spellAttack) {
      result.spellAttack = innate.spellAttack;
    }
    result.conversionNotes.push('Innate spellcaster', ...innate.conversionNotes);
  }

  // Add spellcaster-specific passive
  if (result.spellFeatures.length > 0 || result.spellAttack) {
    result.spellFeatures.unshift({
      name: 'Spellcaster',
      type: FeatureType.PASSIVE,
      description: 'This adversary wields magical power. Magic attacks deal magic damage.',
    });
  }

  return result;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Gets the spellcasting ability name for display.
 *
 * @param spellcasting - Spellcasting data
 * @returns Ability name string
 */
export function getSpellcastingAbilityName(spellcasting: Spellcasting): string {
  const abilityMap: Record<string, string> = {
    INT: 'Intelligence',
    WIS: 'Wisdom',
    CHA: 'Charisma',
  };
  return abilityMap[spellcasting.ability] || spellcasting.ability;
}

/**
 * Summarizes spellcasting capability for display.
 *
 * @param result - Conversion result
 * @returns Summary string
 */
export function summarizeSpellcasterConversion(result: SpellcasterConversionResult): string {
  const parts: string[] = [];

  if (result.bonusStress > 0) {
    parts.push(`+${result.bonusStress} Stress from spellcasting`);
  }

  if (result.spellAttack) {
    parts.push(`Magic attack: ${result.spellAttack.name}`);
  }

  if (result.spellFeatures.length > 0) {
    const actionCount = result.spellFeatures.filter(
      (f) => f.type === FeatureType.ACTION
    ).length;
    const passiveCount = result.spellFeatures.filter(
      (f) => f.type === FeatureType.PASSIVE
    ).length;
    parts.push(`${actionCount} spell actions, ${passiveCount} passive abilities`);
  }

  return parts.join('; ') || 'No spellcasting converted';
}
