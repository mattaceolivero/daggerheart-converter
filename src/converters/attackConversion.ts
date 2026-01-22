/**
 * Attack Conversion Logic
 *
 * Converts D&D 5e attacks to Daggerheart format, including:
 * - Attack modifier conversion
 * - Damage dice scaling
 * - Damage type mapping
 * - Range band conversion
 *
 * @module attackConversion
 * @version 1.0.0
 */

import {
  DnD5eAttack,
  DnD5eMonster,
  AttackType,
  DnD5eDamageType,
  DiceExpression,
} from '../models/dnd5e';
import {
  Attack,
  DamageExpression,
  DamageType,
  RangeBand,
  Tier,
  AdversaryType,
} from '../models/daggerheart';

// ============================================================================
// DAMAGE DICE CONVERSION
// ============================================================================

/**
 * Damage dice conversion table.
 *
 * | D&D Damage | Daggerheart |
 * |------------|-------------|
 * | 1d4-1d6    | 1d6         |
 * | 1d8-1d10   | 1d8         |
 * | 1d12-2d6   | 1d10        |
 * | 2d8+       | 1d12        |
 * | 3d6+       | 2d8         |
 */
interface DamageDiceMapping {
  /** Maximum average damage for this tier */
  maxAverage: number;
  /** Daggerheart dice count */
  diceCount: number;
  /** Daggerheart dice size */
  diceSize: 4 | 6 | 8 | 10 | 12;
}

const DAMAGE_DICE_TIERS: DamageDiceMapping[] = [
  // 1d4 (avg 2.5) to 1d6 (avg 3.5)
  { maxAverage: 3.5, diceCount: 1, diceSize: 6 },
  // 1d8 (avg 4.5) to 1d10 (avg 5.5)
  { maxAverage: 5.5, diceCount: 1, diceSize: 8 },
  // 1d12 (avg 6.5) to 2d6 (avg 7)
  { maxAverage: 7.5, diceCount: 1, diceSize: 10 },
  // 2d8 (avg 9) to 2d10 (avg 11)
  { maxAverage: 11, diceCount: 1, diceSize: 12 },
  // 3d6+ (avg 10.5+) - high damage
  { maxAverage: Infinity, diceCount: 2, diceSize: 8 },
];

// ============================================================================
// DAMAGE TYPE MAPPING
// ============================================================================

/**
 * Maps D&D 5e damage types to Daggerheart damage types.
 *
 * Physical: Slashing, Piercing, Bludgeoning
 * Magic: All other damage types
 */
const DAMAGE_TYPE_MAP: Record<DnD5eDamageType, DamageType> = {
  [DnD5eDamageType.SLASHING]: DamageType.PHYSICAL,
  [DnD5eDamageType.PIERCING]: DamageType.PHYSICAL,
  [DnD5eDamageType.BLUDGEONING]: DamageType.PHYSICAL,
  [DnD5eDamageType.FIRE]: DamageType.MAGIC,
  [DnD5eDamageType.COLD]: DamageType.MAGIC,
  [DnD5eDamageType.LIGHTNING]: DamageType.MAGIC,
  [DnD5eDamageType.THUNDER]: DamageType.MAGIC,
  [DnD5eDamageType.ACID]: DamageType.MAGIC,
  [DnD5eDamageType.POISON]: DamageType.MAGIC,
  [DnD5eDamageType.RADIANT]: DamageType.MAGIC,
  [DnD5eDamageType.NECROTIC]: DamageType.MAGIC,
  [DnD5eDamageType.FORCE]: DamageType.MAGIC,
  [DnD5eDamageType.PSYCHIC]: DamageType.MAGIC,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculates the average damage from a D&D dice expression.
 * @param dice - D&D dice expression
 * @returns Average damage value
 */
function calculateDiceAverage(dice: DiceExpression): number {
  const dieAverage = (dice.dieSize + 1) / 2;
  return dice.count * dieAverage + dice.modifier;
}

/**
 * Converts D&D damage dice to Daggerheart dice.
 *
 * Uses a tiered system based on average damage output.
 *
 * @param dice - D&D dice expression
 * @param isSolo - Whether the adversary is a Solo type (adds +Tier to damage)
 * @param tier - Daggerheart tier for Solo bonus
 * @returns Daggerheart damage expression (without modifier, added separately)
 *
 * @example
 * ```typescript
 * convertDamageDice({ count: 1, dieSize: 8, modifier: 3 }, false, Tier.ONE);
 * // { diceCount: 1, diceSize: 8, modifier: 0, damageType: ... }
 *
 * convertDamageDice({ count: 2, dieSize: 6, modifier: 4 }, true, Tier.TWO);
 * // { diceCount: 1, diceSize: 10, modifier: 2, damageType: ... } (Solo +Tier)
 * ```
 */
function convertDamageDice(
  dice: DiceExpression,
  isSolo: boolean,
  tier: Tier
): Omit<DamageExpression, 'damageType'> {
  const avgDamage = calculateDiceAverage(dice);

  // Find the appropriate tier - default to highest if not found
  const defaultMapping: DamageDiceMapping = { maxAverage: Infinity, diceCount: 2, diceSize: 8 };
  let mapping: DamageDiceMapping = defaultMapping;

  for (const tierMapping of DAMAGE_DICE_TIERS) {
    if (avgDamage <= tierMapping.maxAverage) {
      mapping = tierMapping;
      break;
    }
  }

  // Solo creatures add +Tier to damage
  const modifier = isSolo ? tier : 0;

  return {
    diceCount: mapping.diceCount,
    diceSize: mapping.diceSize,
    modifier,
  };
}

/**
 * Maps D&D damage type to Daggerheart damage type.
 * @param dndType - D&D 5e damage type
 * @returns Daggerheart damage type
 */
function convertDamageType(dndType: DnD5eDamageType): DamageType {
  return DAMAGE_TYPE_MAP[dndType];
}

/**
 * Converts D&D attack modifier to Daggerheart format.
 *
 * Formula: floor(D&D to-hit / 2) + Tier
 *
 * @param toHit - D&D attack bonus
 * @param tier - Daggerheart tier
 * @returns Daggerheart attack modifier
 *
 * @example
 * ```typescript
 * convertAttackModifier(5, Tier.ONE);  // floor(5/2) + 1 = 3
 * convertAttackModifier(9, Tier.THREE); // floor(9/2) + 3 = 7
 * ```
 */
export function convertAttackModifier(toHit: number, tier: Tier): number {
  return Math.floor(toHit / 2) + tier;
}

/**
 * Determines if an attack is melee or ranged.
 * @param attackType - D&D attack type
 * @returns True if melee, false if ranged
 */
function isMeleeAttack(attackType: AttackType): boolean {
  return (
    attackType === AttackType.MELEE_WEAPON ||
    attackType === AttackType.MELEE_SPELL
  );
}

/**
 * Determines if an attack is ranged.
 * @param attackType - D&D attack type
 * @returns True if ranged, false otherwise
 */
function isRangedAttack(attackType: AttackType): boolean {
  return (
    attackType === AttackType.RANGED_WEAPON ||
    attackType === AttackType.RANGED_SPELL
  );
}

/**
 * Converts D&D attack range to Daggerheart range band.
 *
 * Conversion rules:
 * - Melee reach 5ft → Melee (Very Close)
 * - Melee reach 10ft+ → Melee (Close)
 * - Ranged 30ft or less → Ranged (Close)
 * - Ranged 80ft+ → Ranged (Far)
 *
 * @param attack - D&D attack
 * @returns Daggerheart range band
 */
export function convertRange(attack: DnD5eAttack): RangeBand {
  const { attackType, range } = attack;

  // Handle melee/ranged combo attacks
  if (
    attackType === AttackType.MELEE_OR_RANGED_WEAPON ||
    attackType === AttackType.MELEE_OR_RANGED_SPELL
  ) {
    // Prefer ranged classification if significant range
    if (range.normal && range.normal >= 30) {
      return range.normal >= 80 ? RangeBand.FAR : RangeBand.CLOSE;
    }
    // Otherwise treat as melee
    if (range.reach && range.reach >= 10) {
      return RangeBand.CLOSE;
    }
    return RangeBand.VERY_CLOSE;
  }

  // Pure melee attacks
  if (isMeleeAttack(attackType)) {
    if (range.reach && range.reach >= 10) {
      return RangeBand.CLOSE;
    }
    return RangeBand.VERY_CLOSE;
  }

  // Pure ranged attacks
  if (isRangedAttack(attackType)) {
    const normalRange = range.normal || 30;
    if (normalRange >= 80) {
      return RangeBand.FAR;
    }
    return RangeBand.CLOSE;
  }

  // Fallback for unknown types
  return RangeBand.CLOSE;
}

// ============================================================================
// MAIN CONVERSION FUNCTIONS
// ============================================================================

/**
 * Options for attack conversion.
 */
export interface ConvertAttackOptions {
  /** Whether the adversary is a Solo type */
  isSolo?: boolean;
}

/**
 * Converts a single D&D 5e attack to Daggerheart format.
 *
 * Conversion includes:
 * - Attack modifier: floor(to-hit / 2) + Tier
 * - Damage dice: Scaled based on average damage
 * - Damage type: Physical or Magic
 * - Range: Converted to Daggerheart range bands
 * - Additional effects: Preserved as text
 *
 * @param attack - D&D 5e attack
 * @param tier - Daggerheart tier
 * @param options - Conversion options (isSolo, etc.)
 * @returns Daggerheart Attack
 *
 * @example
 * ```typescript
 * const dndAttack: DnD5eAttack = {
 *   name: "Bite",
 *   attackType: AttackType.MELEE_WEAPON,
 *   toHit: 5,
 *   range: { reach: 5 },
 *   target: "one target",
 *   damage: {
 *     dice: { count: 2, dieSize: 6, modifier: 3 },
 *     damageType: DnD5eDamageType.PIERCING
 *   }
 * };
 *
 * const dhAttack = convertAttack(dndAttack, Tier.TWO);
 * // {
 * //   name: "Bite",
 * //   modifier: 4, // floor(5/2) + 2
 * //   range: RangeBand.VERY_CLOSE,
 * //   damage: { diceCount: 1, diceSize: 10, modifier: 0, damageType: DamageType.PHYSICAL }
 * // }
 * ```
 */
export function convertAttack(
  attack: DnD5eAttack,
  tier: Tier,
  options: ConvertAttackOptions = {}
): Attack {
  const { isSolo = false } = options;

  // Convert attack modifier
  const modifier = convertAttackModifier(attack.toHit, tier);

  // Convert range
  const range = convertRange(attack);

  // Convert damage dice
  const baseDamage = convertDamageDice(attack.damage.dice, isSolo, tier);

  // Convert damage type
  const damageType = convertDamageType(attack.damage.damageType);

  // Build damage expression
  const damage: DamageExpression = {
    ...baseDamage,
    damageType,
  };

  // Build the attack
  const dhAttack: Attack = {
    name: attack.name,
    modifier,
    range,
    damage,
  };

  // Add additional effects if present
  if (attack.additionalEffects) {
    dhAttack.additionalEffects = attack.additionalEffects;
  }

  // Handle additional damage types (e.g., "plus 2d6 fire damage")
  if (attack.damage.additionalDamage && attack.damage.additionalDamage.length > 0) {
    const additionalEffects: string[] = [];
    if (dhAttack.additionalEffects) {
      additionalEffects.push(dhAttack.additionalEffects);
    }

    for (const additionalDmg of attack.damage.additionalDamage) {
      const addDamage = convertDamageDice(additionalDmg.dice, false, tier);
      const addType = convertDamageType(additionalDmg.damageType);
      const addTypeLabel = addType === DamageType.MAGIC ? 'magic' : 'physical';
      additionalEffects.push(
        `plus ${addDamage.diceCount}d${addDamage.diceSize} ${addTypeLabel} damage`
      );
    }

    dhAttack.additionalEffects = additionalEffects.join('; ');
  }

  return dhAttack;
}

/**
 * Converts all attacks from a D&D 5e stat block to Daggerheart format.
 *
 * Also handles multiattack notation by converting it to additional effects
 * on the primary attack.
 *
 * @param statBlock - D&D 5e monster stat block
 * @param tier - Daggerheart tier
 * @param adversaryType - Optional adversary type for Solo detection
 * @returns Array of Daggerheart Attacks
 *
 * @example
 * ```typescript
 * const attacks = convertAllAttacks(dragon, Tier.FOUR, AdversaryType.SOLO);
 * // Returns array of converted attacks with Solo bonuses applied
 * ```
 */
export function convertAllAttacks(
  statBlock: DnD5eMonster,
  tier: Tier,
  adversaryType?: AdversaryType
): Attack[] {
  if (!statBlock.attacks || statBlock.attacks.length === 0) {
    return [];
  }

  const isSolo = adversaryType === AdversaryType.SOLO;
  const options: ConvertAttackOptions = { isSolo };

  const attacks = statBlock.attacks.map((attack) =>
    convertAttack(attack, tier, options)
  );

  // If there's multiattack, add it as a note to the first attack
  if (statBlock.multiattack && attacks.length > 0) {
    const firstAttack = attacks[0] as Attack;
    const multiattackNote = `Multiattack: ${statBlock.multiattack.description}`;

    if (firstAttack.additionalEffects) {
      firstAttack.additionalEffects = `${multiattackNote}. ${firstAttack.additionalEffects}`;
    } else {
      firstAttack.additionalEffects = multiattackNote;
    }
  }

  return attacks;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Gets the Daggerheart damage type for a D&D damage type.
 * Useful for standalone damage type lookups.
 *
 * @param dndType - D&D 5e damage type
 * @returns Daggerheart damage type
 */
export function getDamageType(dndType: DnD5eDamageType): DamageType {
  return convertDamageType(dndType);
}

/**
 * Determines if a D&D damage type maps to Physical in Daggerheart.
 * @param dndType - D&D 5e damage type
 * @returns True if physical damage
 */
export function isPhysicalDamage(dndType: DnD5eDamageType): boolean {
  return convertDamageType(dndType) === DamageType.PHYSICAL;
}

/**
 * Determines if a D&D damage type maps to Magic in Daggerheart.
 * @param dndType - D&D 5e damage type
 * @returns True if magic damage
 */
export function isMagicDamage(dndType: DnD5eDamageType): boolean {
  return convertDamageType(dndType) === DamageType.MAGIC;
}
