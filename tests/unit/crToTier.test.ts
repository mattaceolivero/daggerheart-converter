/**
 * CR to Tier Conversion Unit Tests
 *
 * Tests the Challenge Rating to Daggerheart Tier conversion logic.
 *
 * @module tests/unit/crToTier.test
 */

import {
  crToTier,
  parseCRString,
  getTierEvasion,
  getTierStress,
  getTierHPRange,
  getTierInfo,
  getTierInfoFromCR,
  FRACTIONAL_CR,
} from '../../src/converters/crToTier';
import { Tier } from '../../src/models/daggerheart';

// ============================================================================
// crToTier() TESTS
// ============================================================================

describe('crToTier()', () => {
  describe('Tier 1 mappings (CR 0-2)', () => {
    it('should map CR 0 to Tier 1', () => {
      expect(crToTier(0)).toBe(Tier.ONE);
    });

    it('should map CR 1/8 (0.125) to Tier 1', () => {
      expect(crToTier(0.125)).toBe(Tier.ONE);
    });

    it('should map CR 1/4 (0.25) to Tier 1', () => {
      expect(crToTier(0.25)).toBe(Tier.ONE);
    });

    it('should map CR 1/2 (0.5) to Tier 1', () => {
      expect(crToTier(0.5)).toBe(Tier.ONE);
    });

    it('should map CR 1 to Tier 1', () => {
      expect(crToTier(1)).toBe(Tier.ONE);
    });

    it('should map CR 2 to Tier 1', () => {
      expect(crToTier(2)).toBe(Tier.ONE);
    });
  });

  describe('Tier 2 mappings (CR 3-6)', () => {
    it('should map CR 3 to Tier 2', () => {
      expect(crToTier(3)).toBe(Tier.TWO);
    });

    it('should map CR 4 to Tier 2', () => {
      expect(crToTier(4)).toBe(Tier.TWO);
    });

    it('should map CR 5 to Tier 2', () => {
      expect(crToTier(5)).toBe(Tier.TWO);
    });

    it('should map CR 6 to Tier 2', () => {
      expect(crToTier(6)).toBe(Tier.TWO);
    });
  });

  describe('Tier 3 mappings (CR 7-13)', () => {
    it('should map CR 7 to Tier 3', () => {
      expect(crToTier(7)).toBe(Tier.THREE);
    });

    it('should map CR 10 to Tier 3', () => {
      expect(crToTier(10)).toBe(Tier.THREE);
    });

    it('should map CR 13 to Tier 3', () => {
      expect(crToTier(13)).toBe(Tier.THREE);
    });
  });

  describe('Tier 4 mappings (CR 14+)', () => {
    it('should map CR 14 to Tier 4', () => {
      expect(crToTier(14)).toBe(Tier.FOUR);
    });

    it('should map CR 17 to Tier 4', () => {
      expect(crToTier(17)).toBe(Tier.FOUR);
    });

    it('should map CR 20 to Tier 4', () => {
      expect(crToTier(20)).toBe(Tier.FOUR);
    });

    it('should map CR 30 to Tier 4', () => {
      expect(crToTier(30)).toBe(Tier.FOUR);
    });
  });

  describe('edge cases', () => {
    it('should throw for negative CR', () => {
      expect(() => crToTier(-1)).toThrow();
    });

    it('should handle boundary CR 2.5 (rounds down to Tier 1)', () => {
      expect(crToTier(2.5)).toBe(Tier.TWO);
    });

    it('should handle CR exactly at boundary (2 -> Tier 1)', () => {
      expect(crToTier(2)).toBe(Tier.ONE);
    });

    it('should handle CR exactly at boundary (3 -> Tier 2)', () => {
      expect(crToTier(3)).toBe(Tier.TWO);
    });
  });
});

// ============================================================================
// parseCRString() TESTS
// ============================================================================

describe('parseCRString()', () => {
  describe('fractional CR parsing', () => {
    it('should parse "1/8" as 0.125', () => {
      expect(parseCRString('1/8')).toBe(0.125);
    });

    it('should parse "1/4" as 0.25', () => {
      expect(parseCRString('1/4')).toBe(0.25);
    });

    it('should parse "1/2" as 0.5', () => {
      expect(parseCRString('1/2')).toBe(0.5);
    });
  });

  describe('integer CR parsing', () => {
    it('should parse "0" as 0', () => {
      expect(parseCRString('0')).toBe(0);
    });

    it('should parse "1" as 1', () => {
      expect(parseCRString('1')).toBe(1);
    });

    it('should parse "10" as 10', () => {
      expect(parseCRString('10')).toBe(10);
    });

    it('should parse "30" as 30', () => {
      expect(parseCRString('30')).toBe(30);
    });
  });

  describe('whitespace handling', () => {
    it('should handle leading whitespace', () => {
      expect(parseCRString('  5')).toBe(5);
    });

    it('should handle trailing whitespace', () => {
      expect(parseCRString('5  ')).toBe(5);
    });

    it('should handle whitespace around fraction', () => {
      expect(parseCRString(' 1/4 ')).toBe(0.25);
    });
  });

  describe('error cases', () => {
    it('should throw for invalid string', () => {
      expect(() => parseCRString('invalid')).toThrow();
    });

    it('should throw for empty string', () => {
      expect(() => parseCRString('')).toThrow();
    });

    it('should throw for division by zero', () => {
      expect(() => parseCRString('1/0')).toThrow();
    });
  });
});

// ============================================================================
// FRACTIONAL_CR CONSTANTS TESTS
// ============================================================================

describe('FRACTIONAL_CR constants', () => {
  it('should have correct ZERO value', () => {
    expect(FRACTIONAL_CR.ZERO).toBe(0);
  });

  it('should have correct ONE_EIGHTH value', () => {
    expect(FRACTIONAL_CR.ONE_EIGHTH).toBe(0.125);
  });

  it('should have correct ONE_QUARTER value', () => {
    expect(FRACTIONAL_CR.ONE_QUARTER).toBe(0.25);
  });

  it('should have correct ONE_HALF value', () => {
    expect(FRACTIONAL_CR.ONE_HALF).toBe(0.5);
  });
});

// ============================================================================
// TIER DEFAULT FUNCTIONS TESTS
// ============================================================================

describe('getTierEvasion()', () => {
  it('should return 11 for Tier 1', () => {
    expect(getTierEvasion(Tier.ONE)).toBe(11);
  });

  it('should return 14 for Tier 2', () => {
    expect(getTierEvasion(Tier.TWO)).toBe(14);
  });

  it('should return 17 for Tier 3', () => {
    expect(getTierEvasion(Tier.THREE)).toBe(17);
  });

  it('should return 20 for Tier 4', () => {
    expect(getTierEvasion(Tier.FOUR)).toBe(20);
  });
});

describe('getTierStress()', () => {
  it('should return middle of range for Tier 1', () => {
    const stress = getTierStress(Tier.ONE);
    expect(stress).toBeGreaterThanOrEqual(2);
    expect(stress).toBeLessThanOrEqual(3);
  });

  it('should return middle of range for Tier 4', () => {
    const stress = getTierStress(Tier.FOUR);
    expect(stress).toBeGreaterThanOrEqual(5);
    expect(stress).toBeLessThanOrEqual(10);
  });
});

describe('getTierHPRange()', () => {
  it('should return valid HP range for Tier 1', () => {
    const range = getTierHPRange(Tier.ONE);
    expect(range.min).toBe(2);
    expect(range.max).toBe(8);
  });

  it('should return valid HP range for Tier 4', () => {
    const range = getTierHPRange(Tier.FOUR);
    expect(range.min).toBe(5);
    expect(range.max).toBe(12);
  });

  it('should have min less than max', () => {
    for (const tier of [Tier.ONE, Tier.TWO, Tier.THREE, Tier.FOUR]) {
      const range = getTierHPRange(tier);
      expect(range.min).toBeLessThan(range.max);
    }
  });
});

describe('getTierInfo()', () => {
  it('should return complete info for Tier 1', () => {
    const info = getTierInfo(Tier.ONE);
    expect(info.tier).toBe(Tier.ONE);
    expect(info.crRange.min).toBe(0);
    expect(info.crRange.max).toBe(2);
    expect(info.evasion).toBe(11);
    expect(info.hpRange.min).toBe(2);
    expect(info.attackModifier).toBe(1);
    expect(info.dicePool).toBe(1);
  });

  it('should return complete info for Tier 4', () => {
    const info = getTierInfo(Tier.FOUR);
    expect(info.tier).toBe(Tier.FOUR);
    expect(info.crRange.min).toBe(14);
    expect(info.crRange.max).toBe(30);
    expect(info.evasion).toBe(20);
    expect(info.attackModifier).toBe(4);
    expect(info.dicePool).toBe(4);
  });
});

describe('getTierInfoFromCR()', () => {
  it('should return Tier 1 info for CR 1', () => {
    const info = getTierInfoFromCR(1);
    expect(info.tier).toBe(Tier.ONE);
  });

  it('should return Tier 3 info for CR 10', () => {
    const info = getTierInfoFromCR(10);
    expect(info.tier).toBe(Tier.THREE);
  });

  it('should return Tier 4 info for CR 20', () => {
    const info = getTierInfoFromCR(20);
    expect(info.tier).toBe(Tier.FOUR);
  });
});
