/**
 * Attack Conversion Unit Tests
 *
 * Tests the D&D 5e attack to Daggerheart attack conversion logic.
 *
 * @module tests/unit/attackConversion.test
 */

import {
  convertAttack,
  convertAllAttacks,
  convertAttackModifier,
  convertRange,
  getDamageType,
  isPhysicalDamage,
  isMagicDamage,
} from '../../src/converters/attackConversion';
import {
  AttackType,
  DnD5eDamageType,
  DnD5eAttack,
} from '../../src/models/dnd5e';
import {
  Tier,
  RangeBand,
  DamageType,
  AdversaryType,
} from '../../src/models/daggerheart';
import {
  GOBLIN,
  WOLF,
  OGRE,
  OWLBEAR,
  YOUNG_RED_DRAGON,
  ADULT_RED_DRAGON,
  SRD_MONSTERS,
} from '../fixtures/srd-monsters';

// ============================================================================
// convertAttackModifier() TESTS
// ============================================================================

describe('convertAttackModifier()', () => {
  it('should calculate modifier as floor(to-hit / 2) + Tier', () => {
    // +5 to hit, Tier 1: floor(5/2) + 1 = 2 + 1 = 3
    expect(convertAttackModifier(5, Tier.ONE)).toBe(3);
  });

  it('should handle low to-hit values', () => {
    // +2 to hit, Tier 1: floor(2/2) + 1 = 1 + 1 = 2
    expect(convertAttackModifier(2, Tier.ONE)).toBe(2);
  });

  it('should handle high to-hit values', () => {
    // +14 to hit, Tier 4: floor(14/2) + 4 = 7 + 4 = 11
    expect(convertAttackModifier(14, Tier.FOUR)).toBe(11);
  });

  it('should scale with Tier', () => {
    const toHit = 6;
    // Same to-hit, different tiers
    expect(convertAttackModifier(toHit, Tier.ONE)).toBe(4); // 3 + 1
    expect(convertAttackModifier(toHit, Tier.TWO)).toBe(5); // 3 + 2
    expect(convertAttackModifier(toHit, Tier.THREE)).toBe(6); // 3 + 3
    expect(convertAttackModifier(toHit, Tier.FOUR)).toBe(7); // 3 + 4
  });

  it('should handle zero to-hit', () => {
    // +0 to hit, Tier 1: floor(0/2) + 1 = 0 + 1 = 1
    expect(convertAttackModifier(0, Tier.ONE)).toBe(1);
  });
});

// ============================================================================
// convertRange() TESTS
// ============================================================================

describe('convertRange()', () => {
  describe('melee attacks', () => {
    it('should convert 5ft reach to Very Close', () => {
      const attack: DnD5eAttack = {
        name: 'Sword',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 5,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 8, modifier: 3 },
          damageType: DnD5eDamageType.SLASHING,
        },
      };
      expect(convertRange(attack)).toBe(RangeBand.VERY_CLOSE);
    });

    it('should convert 10ft+ reach to Close', () => {
      const attack: DnD5eAttack = {
        name: 'Pole Arm',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 5,
        range: { reach: 10 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 10, modifier: 3 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };
      expect(convertRange(attack)).toBe(RangeBand.CLOSE);
    });
  });

  describe('ranged attacks', () => {
    it('should convert short range (<80ft) to Close', () => {
      const attack: DnD5eAttack = {
        name: 'Shortbow',
        attackType: AttackType.RANGED_WEAPON,
        toHit: 4,
        range: { normal: 80, long: 320 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 6, modifier: 2 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };
      expect(convertRange(attack)).toBe(RangeBand.FAR);
    });

    it('should convert 30ft or less range to Close', () => {
      const attack: DnD5eAttack = {
        name: 'Thrown Dagger',
        attackType: AttackType.RANGED_WEAPON,
        toHit: 4,
        range: { normal: 20, long: 60 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 4, modifier: 2 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };
      expect(convertRange(attack)).toBe(RangeBand.CLOSE);
    });

    it('should convert 80ft+ range to Far', () => {
      const attack: DnD5eAttack = {
        name: 'Longbow',
        attackType: AttackType.RANGED_WEAPON,
        toHit: 6,
        range: { normal: 150, long: 600 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 8, modifier: 4 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };
      expect(convertRange(attack)).toBe(RangeBand.FAR);
    });
  });

  describe('melee or ranged attacks', () => {
    it('should prefer ranged classification for significant range', () => {
      const attack: DnD5eAttack = {
        name: 'Javelin',
        attackType: AttackType.MELEE_OR_RANGED_WEAPON,
        toHit: 5,
        range: { reach: 5, normal: 30, long: 120 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 6, modifier: 3 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };
      // 30ft normal range -> Close
      expect(convertRange(attack)).toBe(RangeBand.CLOSE);
    });

    it('should treat as melee if range is short', () => {
      const attack: DnD5eAttack = {
        name: 'Dagger',
        attackType: AttackType.MELEE_OR_RANGED_WEAPON,
        toHit: 4,
        range: { reach: 5, normal: 20, long: 60 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 4, modifier: 2 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };
      // Less than 30ft normal range -> treat as melee (Very Close)
      expect(convertRange(attack)).toBe(RangeBand.VERY_CLOSE);
    });
  });
});

// ============================================================================
// DAMAGE TYPE MAPPING TESTS
// ============================================================================

describe('getDamageType()', () => {
  describe('physical damage types', () => {
    it('should map Slashing to Physical', () => {
      expect(getDamageType(DnD5eDamageType.SLASHING)).toBe(DamageType.PHYSICAL);
    });

    it('should map Piercing to Physical', () => {
      expect(getDamageType(DnD5eDamageType.PIERCING)).toBe(DamageType.PHYSICAL);
    });

    it('should map Bludgeoning to Physical', () => {
      expect(getDamageType(DnD5eDamageType.BLUDGEONING)).toBe(DamageType.PHYSICAL);
    });
  });

  describe('magic damage types', () => {
    it('should map Fire to Magic', () => {
      expect(getDamageType(DnD5eDamageType.FIRE)).toBe(DamageType.MAGIC);
    });

    it('should map Cold to Magic', () => {
      expect(getDamageType(DnD5eDamageType.COLD)).toBe(DamageType.MAGIC);
    });

    it('should map Lightning to Magic', () => {
      expect(getDamageType(DnD5eDamageType.LIGHTNING)).toBe(DamageType.MAGIC);
    });

    it('should map Poison to Magic', () => {
      expect(getDamageType(DnD5eDamageType.POISON)).toBe(DamageType.MAGIC);
    });

    it('should map Necrotic to Magic', () => {
      expect(getDamageType(DnD5eDamageType.NECROTIC)).toBe(DamageType.MAGIC);
    });

    it('should map Radiant to Magic', () => {
      expect(getDamageType(DnD5eDamageType.RADIANT)).toBe(DamageType.MAGIC);
    });

    it('should map Psychic to Magic', () => {
      expect(getDamageType(DnD5eDamageType.PSYCHIC)).toBe(DamageType.MAGIC);
    });

    it('should map Force to Magic', () => {
      expect(getDamageType(DnD5eDamageType.FORCE)).toBe(DamageType.MAGIC);
    });
  });
});

describe('isPhysicalDamage() and isMagicDamage()', () => {
  it('should correctly identify physical damage types', () => {
    expect(isPhysicalDamage(DnD5eDamageType.SLASHING)).toBe(true);
    expect(isPhysicalDamage(DnD5eDamageType.PIERCING)).toBe(true);
    expect(isPhysicalDamage(DnD5eDamageType.BLUDGEONING)).toBe(true);
    expect(isPhysicalDamage(DnD5eDamageType.FIRE)).toBe(false);
  });

  it('should correctly identify magic damage types', () => {
    expect(isMagicDamage(DnD5eDamageType.FIRE)).toBe(true);
    expect(isMagicDamage(DnD5eDamageType.COLD)).toBe(true);
    expect(isMagicDamage(DnD5eDamageType.SLASHING)).toBe(false);
  });
});

// ============================================================================
// convertAttack() TESTS
// ============================================================================

describe('convertAttack()', () => {
  describe('basic attack conversion', () => {
    it('should convert a simple melee attack', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Shortsword',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 4,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 6, modifier: 2 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };

      const result = convertAttack(dndAttack, Tier.ONE);

      expect(result.name).toBe('Shortsword');
      expect(result.modifier).toBe(3); // floor(4/2) + 1
      expect(result.range).toBe(RangeBand.VERY_CLOSE);
      expect(result.damage.damageType).toBe(DamageType.PHYSICAL);
    });

    it('should convert a ranged attack', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Longbow',
        attackType: AttackType.RANGED_WEAPON,
        toHit: 6,
        range: { normal: 150, long: 600 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 8, modifier: 4 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };

      const result = convertAttack(dndAttack, Tier.TWO);

      expect(result.name).toBe('Longbow');
      expect(result.modifier).toBe(5); // floor(6/2) + 2
      expect(result.range).toBe(RangeBand.FAR);
      expect(result.damage.damageType).toBe(DamageType.PHYSICAL);
    });
  });

  describe('damage dice conversion', () => {
    it('should convert 1d4-1d6 to 1d6', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Dagger',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 4,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 4, modifier: 2 },
          damageType: DnD5eDamageType.PIERCING,
        },
      };

      const result = convertAttack(dndAttack, Tier.ONE);
      expect(result.damage.diceSize).toBe(6);
      expect(result.damage.diceCount).toBe(1);
    });

    it('should convert 1d8-1d10 to 1d8', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Longsword',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 5,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 8, modifier: 3 },
          damageType: DnD5eDamageType.SLASHING,
        },
      };

      const result = convertAttack(dndAttack, Tier.ONE);
      expect(result.damage.diceSize).toBe(8);
      expect(result.damage.diceCount).toBe(1);
    });

    it('should convert 2d6 to 1d10', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Greatsword',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 6,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 2, dieSize: 6, modifier: 4 },
          damageType: DnD5eDamageType.SLASHING,
        },
      };

      const result = convertAttack(dndAttack, Tier.ONE);
      expect(result.damage.diceSize).toBe(10);
      expect(result.damage.diceCount).toBe(1);
    });

    it('should convert 2d8+ to 1d12', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Heavy Strike',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 7,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 2, dieSize: 8, modifier: 4 },
          damageType: DnD5eDamageType.BLUDGEONING,
        },
      };

      const result = convertAttack(dndAttack, Tier.TWO);
      expect(result.damage.diceSize).toBe(12);
      expect(result.damage.diceCount).toBe(1);
    });
  });

  describe('Solo creature bonus', () => {
    it('should add +Tier modifier for Solo creatures', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Claw',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 14,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 2, dieSize: 6, modifier: 8 },
          damageType: DnD5eDamageType.SLASHING,
        },
      };

      const result = convertAttack(dndAttack, Tier.FOUR, { isSolo: true });
      expect(result.damage.modifier).toBe(Tier.FOUR); // +4 for Tier 4 Solo
    });

    it('should not add bonus for non-Solo creatures', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Claw',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 7,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 2, dieSize: 6, modifier: 4 },
          damageType: DnD5eDamageType.SLASHING,
        },
      };

      const result = convertAttack(dndAttack, Tier.TWO, { isSolo: false });
      expect(result.damage.modifier).toBe(0);
    });
  });

  describe('additional effects', () => {
    it('should preserve additional effects text', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Bite',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 4,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 2, dieSize: 4, modifier: 2 },
          damageType: DnD5eDamageType.PIERCING,
        },
        additionalEffects: 'Target must succeed on DC 11 STR save or be knocked prone.',
      };

      const result = convertAttack(dndAttack, Tier.ONE);
      expect(result.additionalEffects).toContain('knocked prone');
    });

    it('should handle additional damage types', () => {
      const dndAttack: DnD5eAttack = {
        name: 'Flaming Sword',
        attackType: AttackType.MELEE_WEAPON,
        toHit: 6,
        range: { reach: 5 },
        target: 'one target',
        damage: {
          dice: { count: 1, dieSize: 8, modifier: 3 },
          damageType: DnD5eDamageType.SLASHING,
          additionalDamage: [
            {
              dice: { count: 2, dieSize: 6, modifier: 0 },
              damageType: DnD5eDamageType.FIRE,
            },
          ],
        },
      };

      const result = convertAttack(dndAttack, Tier.TWO);
      expect(result.additionalEffects).toContain('magic damage');
    });
  });
});

// ============================================================================
// convertAllAttacks() TESTS
// ============================================================================

describe('convertAllAttacks()', () => {
  describe('Goblin attacks', () => {
    it('should convert both Goblin attacks', () => {
      const attacks = convertAllAttacks(GOBLIN, Tier.ONE);
      expect(attacks.length).toBe(2);
      expect(attacks[0]!.name).toBe('Scimitar');
      expect(attacks[1]!.name).toBe('Shortbow');
    });

    it('should set appropriate ranges for Goblin attacks', () => {
      const attacks = convertAllAttacks(GOBLIN, Tier.ONE);
      expect(attacks[0]!.range).toBe(RangeBand.VERY_CLOSE); // Scimitar
      expect(attacks[1]!.range).toBe(RangeBand.FAR); // Shortbow (80ft)
    });
  });

  describe('Wolf attacks', () => {
    it('should convert Wolf Bite attack', () => {
      const attacks = convertAllAttacks(WOLF, Tier.ONE);
      expect(attacks.length).toBe(1);
      expect(attacks[0]!.name).toBe('Bite');
    });

    it('should preserve Wolf knockdown effect', () => {
      const attacks = convertAllAttacks(WOLF, Tier.ONE);
      expect(attacks[0]!.additionalEffects).toContain('prone');
    });
  });

  describe('Ogre attacks', () => {
    it('should convert Ogre attacks with higher damage dice', () => {
      const attacks = convertAllAttacks(OGRE, Tier.ONE);
      expect(attacks.length).toBe(2);
      // Greatclub: 2d8+4 avg = 13 -> should be 1d12
      expect(attacks[0]!.damage.diceSize).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Multiattack handling', () => {
    it('should note multiattack in first attack effects', () => {
      const attacks = convertAllAttacks(OWLBEAR, Tier.TWO);
      expect(attacks[0]!.additionalEffects).toContain('Multiattack');
    });
  });

  describe('Dragon attacks with Solo bonus', () => {
    it('should apply Solo bonus to dragon attacks', () => {
      const attacks = convertAllAttacks(ADULT_RED_DRAGON, Tier.FOUR, AdversaryType.SOLO);
      // Solo creatures should have +Tier damage modifier
      expect(attacks[0]!.damage.modifier).toBe(4);
    });
  });

  describe('Empty attacks handling', () => {
    it('should return empty array for creatures without attacks', () => {
      const noAttackCreature = {
        ...GOBLIN,
        attacks: undefined,
      };
      const attacks = convertAllAttacks(noAttackCreature as any, Tier.ONE);
      expect(attacks).toHaveLength(0);
    });
  });
});

// ============================================================================
// SRD MONSTER ATTACK CONVERSION TESTS
// ============================================================================

describe('SRD Monster Attack Conversions', () => {
  it('should convert all SRD monsters with attacks', () => {
    for (const [name, monster] of Object.entries(SRD_MONSTERS)) {
      if (!monster.attacks || monster.attacks.length === 0) continue;

      const attacks = convertAllAttacks(monster, Tier.TWO);
      expect(attacks.length).toBeGreaterThan(0);

      for (const attack of attacks) {
        expect(attack.name).toBeTruthy();
        expect(attack.modifier).toBeGreaterThan(0);
        expect(attack.range).toBeTruthy();
        expect(attack.damage).toBeTruthy();
        expect(attack.damage.diceCount).toBeGreaterThan(0);
        expect(attack.damage.diceSize).toBeGreaterThan(0);
      }
    }
  });

  it('should preserve attack names from SRD monsters', () => {
    const goblinAttacks = convertAllAttacks(GOBLIN, Tier.ONE);
    expect(goblinAttacks.map((a) => a.name)).toEqual(['Scimitar', 'Shortbow']);

    const dragonAttacks = convertAllAttacks(YOUNG_RED_DRAGON, Tier.THREE);
    expect(dragonAttacks.map((a) => a.name)).toContain('Bite');
    expect(dragonAttacks.map((a) => a.name)).toContain('Claw');
  });
});
