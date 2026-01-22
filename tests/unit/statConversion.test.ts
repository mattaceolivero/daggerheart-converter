/**
 * Core Stat Conversion Unit Tests
 *
 * Tests the D&D 5e to Daggerheart stat conversion logic.
 *
 * @module tests/unit/statConversion.test
 */

import {
  convertCoreStats,
  determineDifficulty,
  calculateThresholds,
  convertHP,
  calculateStress,
  convertEvasion,
  validateCoreStats,
  summarizeCoreStats,
  CoreStats,
} from '../../src/converters/statConversion';
import { classifyAdversary } from '../../src/converters/classifyAdversary';
import { Tier, Difficulty, AdversaryType } from '../../src/models/daggerheart';
import {
  GOBLIN,
  WOLF,
  ORC,
  OGRE,
  TROLL,
  ADULT_RED_DRAGON,
  SRD_MONSTERS,
} from '../fixtures/srd-monsters';
import {
  createMockStatBlock,
  createMinionStatBlock,
  createSoloStatBlock,
} from '../helpers/testUtils';

// ============================================================================
// determineDifficulty() TESTS
// ============================================================================

describe('determineDifficulty()', () => {
  describe('Minion difficulty', () => {
    it('should return Minor for Minion type', () => {
      const classification = {
        type: AdversaryType.MINION,
        confidence: 0.9,
        reasoning: 'Low CR',
      };
      const result = determineDifficulty(classification, 0.25, Tier.ONE);
      expect(result).toBe(Difficulty.MINOR);
    });

    it('should return Minor for Minion regardless of CR', () => {
      const classification = {
        type: AdversaryType.MINION,
        confidence: 0.9,
        reasoning: 'Low CR',
      };
      // Even with high CR, Minion type forces Minor
      const result = determineDifficulty(classification, 5, Tier.TWO);
      expect(result).toBe(Difficulty.MINOR);
    });
  });

  describe('Solo/Leader difficulty', () => {
    it('should return Severe for Solo type', () => {
      const classification = {
        type: AdversaryType.SOLO,
        confidence: 0.9,
        reasoning: 'Legendary actions',
      };
      const result = determineDifficulty(classification, 10, Tier.THREE);
      expect(result).toBe(Difficulty.SEVERE);
    });

    it('should return Severe for Leader type', () => {
      const classification = {
        type: AdversaryType.LEADER,
        confidence: 0.9,
        reasoning: 'Command abilities',
      };
      const result = determineDifficulty(classification, 5, Tier.TWO);
      expect(result).toBe(Difficulty.SEVERE);
    });
  });

  describe('Standard difficulty based on CR', () => {
    it('should return Minor when CR < Tier * 3', () => {
      const classification = {
        type: AdversaryType.STANDARD,
        confidence: 0.9,
        reasoning: 'Standard creature',
      };
      // CR 2 < Tier 1 * 3 = 3
      const result = determineDifficulty(classification, 2, Tier.ONE);
      expect(result).toBe(Difficulty.MINOR);
    });

    it('should return Major when CR >= Tier * 3', () => {
      const classification = {
        type: AdversaryType.STANDARD,
        confidence: 0.9,
        reasoning: 'Standard creature',
      };
      // CR 3 >= Tier 1 * 3 = 3
      const result = determineDifficulty(classification, 3, Tier.ONE);
      expect(result).toBe(Difficulty.MAJOR);
    });

    it('should return Minor for Bruiser when CR < threshold', () => {
      const classification = {
        type: AdversaryType.BRUISER,
        confidence: 0.9,
        reasoning: 'High STR melee',
      };
      // CR 4 < Tier 2 * 3 = 6
      const result = determineDifficulty(classification, 4, Tier.TWO);
      expect(result).toBe(Difficulty.MINOR);
    });

    it('should return Major for Bruiser when CR >= threshold', () => {
      const classification = {
        type: AdversaryType.BRUISER,
        confidence: 0.9,
        reasoning: 'High STR melee',
      };
      // CR 6 >= Tier 2 * 3 = 6
      const result = determineDifficulty(classification, 6, Tier.TWO);
      expect(result).toBe(Difficulty.MAJOR);
    });
  });
});

// ============================================================================
// calculateThresholds() TESTS
// ============================================================================

describe('calculateThresholds()', () => {
  describe('Minor difficulty thresholds', () => {
    it('should calculate correct Tier 1 Minor thresholds', () => {
      const thresholds = calculateThresholds(Tier.ONE, Difficulty.MINOR);
      // Minor: Tier+2 / Tier*2+4 / Tier*3+6
      expect(thresholds.minor).toBe(3); // 1 + 2
      expect(thresholds.major).toBe(6); // 1*2 + 4
      expect(thresholds.severe).toBe(9); // 1*3 + 6
    });

    it('should calculate correct Tier 2 Minor thresholds', () => {
      const thresholds = calculateThresholds(Tier.TWO, Difficulty.MINOR);
      expect(thresholds.minor).toBe(4); // 2 + 2
      expect(thresholds.major).toBe(8); // 2*2 + 4
      expect(thresholds.severe).toBe(12); // 2*3 + 6
    });
  });

  describe('Major difficulty thresholds', () => {
    it('should calculate correct Tier 1 Major thresholds', () => {
      const thresholds = calculateThresholds(Tier.ONE, Difficulty.MAJOR);
      // Major: Tier+3 / Tier*2+6 / Tier*3+9
      expect(thresholds.minor).toBe(4); // 1 + 3
      expect(thresholds.major).toBe(8); // 1*2 + 6
      expect(thresholds.severe).toBe(12); // 1*3 + 9
    });

    it('should calculate correct Tier 3 Major thresholds', () => {
      const thresholds = calculateThresholds(Tier.THREE, Difficulty.MAJOR);
      expect(thresholds.minor).toBe(6); // 3 + 3
      expect(thresholds.major).toBe(12); // 3*2 + 6
      expect(thresholds.severe).toBe(18); // 3*3 + 9
    });
  });

  describe('Severe difficulty thresholds', () => {
    it('should calculate correct Tier 1 Severe thresholds', () => {
      const thresholds = calculateThresholds(Tier.ONE, Difficulty.SEVERE);
      // Severe: Tier+4 / Tier*2+8 / Tier*3+12
      expect(thresholds.minor).toBe(5); // 1 + 4
      expect(thresholds.major).toBe(10); // 1*2 + 8
      expect(thresholds.severe).toBe(15); // 1*3 + 12
    });

    it('should calculate correct Tier 4 Severe thresholds', () => {
      const thresholds = calculateThresholds(Tier.FOUR, Difficulty.SEVERE);
      expect(thresholds.minor).toBe(8); // 4 + 4
      expect(thresholds.major).toBe(16); // 4*2 + 8
      expect(thresholds.severe).toBe(24); // 4*3 + 12
    });
  });

  describe('threshold ordering', () => {
    it('should always have minor < major < severe', () => {
      for (const tier of [Tier.ONE, Tier.TWO, Tier.THREE, Tier.FOUR]) {
        for (const difficulty of [Difficulty.MINOR, Difficulty.MAJOR, Difficulty.SEVERE]) {
          const thresholds = calculateThresholds(tier, difficulty);
          expect(thresholds.minor).toBeLessThan(thresholds.major);
          expect(thresholds.major).toBeLessThan(thresholds.severe);
        }
      }
    });
  });
});

// ============================================================================
// convertHP() TESTS
// ============================================================================

describe('convertHP()', () => {
  describe('Minion HP', () => {
    it('should return 1 for Minion type regardless of D&D HP', () => {
      const classification = {
        type: AdversaryType.MINION,
        confidence: 0.9,
        reasoning: 'Low CR',
      };
      expect(convertHP(50, classification, Tier.ONE)).toBe(1);
      expect(convertHP(100, classification, Tier.TWO)).toBe(1);
      expect(convertHP(200, classification, Tier.THREE)).toBe(1);
    });
  });

  describe('Solo HP', () => {
    it('should calculate Solo HP as D&D HP / 8', () => {
      const classification = {
        type: AdversaryType.SOLO,
        confidence: 0.9,
        reasoning: 'Legendary actions',
      };
      // 200 / 8 = 25
      expect(convertHP(200, classification, Tier.THREE)).toBe(25);
    });

    it('should enforce minimum HP of Tier * 4 for Solo', () => {
      const classification = {
        type: AdversaryType.SOLO,
        confidence: 0.9,
        reasoning: 'Legendary actions',
      };
      // 20 / 8 = 2.5 -> 2, but minimum is Tier 2 * 4 = 8
      expect(convertHP(20, classification, Tier.TWO)).toBe(8);
    });
  });

  describe('Standard HP', () => {
    it('should calculate Standard HP as D&D HP / 10', () => {
      const classification = {
        type: AdversaryType.STANDARD,
        confidence: 0.9,
        reasoning: 'Standard creature',
      };
      // 60 / 10 = 6
      expect(convertHP(60, classification, Tier.TWO)).toBe(6);
    });

    it('should enforce minimum HP of Tier * 2 for Standard', () => {
      const classification = {
        type: AdversaryType.STANDARD,
        confidence: 0.9,
        reasoning: 'Standard creature',
      };
      // 10 / 10 = 1, but minimum is Tier 2 * 2 = 4
      expect(convertHP(10, classification, Tier.TWO)).toBe(4);
    });
  });

  describe('Other types HP (Bruiser, Ranged, etc.)', () => {
    it('should calculate Bruiser HP as Standard (D&D HP / 10)', () => {
      const classification = {
        type: AdversaryType.BRUISER,
        confidence: 0.9,
        reasoning: 'High STR',
      };
      // 80 / 10 = 8
      expect(convertHP(80, classification, Tier.TWO)).toBe(8);
    });
  });
});

// ============================================================================
// calculateStress() TESTS
// ============================================================================

describe('calculateStress()', () => {
  describe('Minion Stress', () => {
    it('should return 0 for Minion type', () => {
      const classification = {
        type: AdversaryType.MINION,
        confidence: 0.9,
        reasoning: 'Low CR',
      };
      expect(calculateStress(classification, Tier.ONE)).toBe(0);
      expect(calculateStress(classification, Tier.FOUR)).toBe(0);
    });
  });

  describe('Solo Stress', () => {
    it('should return Tier * 2 for Solo type', () => {
      const classification = {
        type: AdversaryType.SOLO,
        confidence: 0.9,
        reasoning: 'Legendary actions',
      };
      expect(calculateStress(classification, Tier.ONE)).toBe(2);
      expect(calculateStress(classification, Tier.TWO)).toBe(4);
      expect(calculateStress(classification, Tier.THREE)).toBe(6);
      expect(calculateStress(classification, Tier.FOUR)).toBe(8);
    });
  });

  describe('Standard Stress', () => {
    it('should return Tier for Standard type', () => {
      const classification = {
        type: AdversaryType.STANDARD,
        confidence: 0.9,
        reasoning: 'Standard creature',
      };
      expect(calculateStress(classification, Tier.ONE)).toBe(1);
      expect(calculateStress(classification, Tier.TWO)).toBe(2);
      expect(calculateStress(classification, Tier.THREE)).toBe(3);
      expect(calculateStress(classification, Tier.FOUR)).toBe(4);
    });
  });

  describe('Other types Stress', () => {
    it('should return Tier for Bruiser type', () => {
      const classification = {
        type: AdversaryType.BRUISER,
        confidence: 0.9,
        reasoning: 'High STR',
      };
      expect(calculateStress(classification, Tier.TWO)).toBe(2);
    });

    it('should return Tier for Ranged type', () => {
      const classification = {
        type: AdversaryType.RANGED,
        confidence: 0.9,
        reasoning: 'Ranged attacks',
      };
      expect(calculateStress(classification, Tier.THREE)).toBe(3);
    });
  });
});

// ============================================================================
// convertEvasion() TESTS
// ============================================================================

describe('convertEvasion()', () => {
  it('should calculate Evasion as floor(AC * 0.8) + Tier', () => {
    // AC 15, Tier 1: floor(15 * 0.8) + 1 = 12 + 1 = 13
    expect(convertEvasion(15, Tier.ONE)).toBe(13);
  });

  it('should handle low AC correctly', () => {
    // AC 10, Tier 1: floor(10 * 0.8) + 1 = 8 + 1 = 9
    expect(convertEvasion(10, Tier.ONE)).toBe(9);
  });

  it('should handle high AC correctly', () => {
    // AC 20, Tier 4: floor(20 * 0.8) + 4 = 16 + 4 = 20
    expect(convertEvasion(20, Tier.FOUR)).toBe(20);
  });

  it('should scale with Tier', () => {
    const ac = 15;
    // Same AC, different tiers
    expect(convertEvasion(ac, Tier.ONE)).toBe(13); // 12 + 1
    expect(convertEvasion(ac, Tier.TWO)).toBe(14); // 12 + 2
    expect(convertEvasion(ac, Tier.THREE)).toBe(15); // 12 + 3
    expect(convertEvasion(ac, Tier.FOUR)).toBe(16); // 12 + 4
  });
});

// ============================================================================
// convertCoreStats() INTEGRATION TESTS
// ============================================================================

describe('convertCoreStats()', () => {
  describe('Goblin conversion (CR 1/4)', () => {
    it('should convert Goblin to Tier 1 stats', () => {
      const classification = classifyAdversary(GOBLIN);
      const stats = convertCoreStats(GOBLIN, classification);

      expect(stats.tier).toBe(Tier.ONE);
      expect(stats.difficulty).toBe(Difficulty.MINOR);
      expect(stats.hp).toBe(1); // Minion
      expect(stats.stress).toBe(0); // Minion
      expect(stats.evasion).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Ogre conversion (CR 2)', () => {
    it('should convert Ogre to Tier 1 stats', () => {
      const classification = classifyAdversary(OGRE);
      const stats = convertCoreStats(OGRE, classification);

      expect(stats.tier).toBe(Tier.ONE);
      expect(stats.hp).toBeGreaterThanOrEqual(2); // Standard minimum
      expect(stats.stress).toBeGreaterThan(0);
    });
  });

  describe('Troll conversion (CR 5)', () => {
    it('should convert Troll to Tier 2 stats', () => {
      const classification = classifyAdversary(TROLL);
      const stats = convertCoreStats(TROLL, classification);

      expect(stats.tier).toBe(Tier.TWO);
      expect(stats.hp).toBeGreaterThanOrEqual(4); // Standard Tier 2 minimum
      expect(stats.stress).toBe(2); // Tier 2 Standard
    });
  });

  describe('Adult Red Dragon conversion (CR 17)', () => {
    it('should convert Adult Red Dragon to Tier 4 Solo stats', () => {
      const classification = classifyAdversary(ADULT_RED_DRAGON);
      const stats = convertCoreStats(ADULT_RED_DRAGON, classification);

      expect(stats.tier).toBe(Tier.FOUR);
      expect(stats.difficulty).toBe(Difficulty.SEVERE);
      expect(stats.hp).toBeGreaterThanOrEqual(16); // Solo minimum: Tier * 4
      expect(stats.stress).toBe(8); // Solo: Tier * 2
      expect(stats.evasion).toBeGreaterThanOrEqual(15);
    });
  });
});

// ============================================================================
// validateCoreStats() TESTS
// ============================================================================

describe('validateCoreStats()', () => {
  it('should validate correct stats', () => {
    const stats: CoreStats = {
      tier: Tier.TWO,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 5, major: 10, severe: 15 },
      hp: 6,
      stress: 2,
      evasion: 14,
    };
    const result = validateCoreStats(stats);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('should detect invalid Tier', () => {
    const stats: CoreStats = {
      tier: 5 as Tier,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 5, major: 10, severe: 15 },
      hp: 6,
      stress: 2,
      evasion: 14,
    };
    const result = validateCoreStats(stats);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.includes('Tier'))).toBe(true);
  });

  it('should detect invalid HP', () => {
    const stats: CoreStats = {
      tier: Tier.TWO,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 5, major: 10, severe: 15 },
      hp: 0,
      stress: 2,
      evasion: 14,
    };
    const result = validateCoreStats(stats);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.includes('HP'))).toBe(true);
  });

  it('should detect negative Stress', () => {
    const stats: CoreStats = {
      tier: Tier.TWO,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 5, major: 10, severe: 15 },
      hp: 6,
      stress: -1,
      evasion: 14,
    };
    const result = validateCoreStats(stats);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.includes('Stress'))).toBe(true);
  });

  it('should detect out-of-range Evasion', () => {
    const stats: CoreStats = {
      tier: Tier.TWO,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 5, major: 10, severe: 15 },
      hp: 6,
      stress: 2,
      evasion: 50,
    };
    const result = validateCoreStats(stats);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.includes('Evasion'))).toBe(true);
  });

  it('should detect threshold ordering issues', () => {
    const stats: CoreStats = {
      tier: Tier.TWO,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 10, major: 5, severe: 15 },
      hp: 6,
      stress: 2,
      evasion: 14,
    };
    const result = validateCoreStats(stats);
    expect(result.isValid).toBe(false);
    expect(result.issues.some((i) => i.includes('threshold'))).toBe(true);
  });
});

// ============================================================================
// summarizeCoreStats() TESTS
// ============================================================================

describe('summarizeCoreStats()', () => {
  it('should provide human-readable summary', () => {
    const stats: CoreStats = {
      tier: Tier.TWO,
      difficulty: Difficulty.MAJOR,
      thresholds: { minor: 5, major: 10, severe: 15 },
      hp: 6,
      stress: 2,
      evasion: 14,
    };
    const summary = summarizeCoreStats(stats);
    expect(summary).toContain('Tier 2');
    expect(summary).toContain('Major');
    expect(summary).toContain('HP: 6');
    expect(summary).toContain('Stress: 2');
    expect(summary).toContain('Evasion: 14');
    expect(summary).toContain('5');
    expect(summary).toContain('10');
    expect(summary).toContain('15');
  });
});

// ============================================================================
// SRD MONSTER BATCH CONVERSION TESTS
// ============================================================================

describe('SRD Monster Stat Conversions', () => {
  it('should convert all SRD monsters with valid stats', () => {
    for (const [name, monster] of Object.entries(SRD_MONSTERS)) {
      const classification = classifyAdversary(monster);
      const stats = convertCoreStats(monster, classification);
      const validation = validateCoreStats(stats);

      expect(validation.isValid).toBe(true);
      if (!validation.isValid) {
        console.error(`${name} validation failed:`, validation.issues);
      }
    }
  });

  it('should produce appropriate tiers for SRD monsters', () => {
    // Goblin, Wolf, Skeleton should be Tier 1
    for (const monster of [GOBLIN, WOLF]) {
      const classification = classifyAdversary(monster);
      const stats = convertCoreStats(monster, classification);
      expect(stats.tier).toBe(Tier.ONE);
    }

    // Troll should be Tier 2
    const trollClassification = classifyAdversary(TROLL);
    const trollStats = convertCoreStats(TROLL, trollClassification);
    expect(trollStats.tier).toBe(Tier.TWO);

    // Adult Red Dragon should be Tier 4
    const dragonClassification = classifyAdversary(ADULT_RED_DRAGON);
    const dragonStats = convertCoreStats(ADULT_RED_DRAGON, dragonClassification);
    expect(dragonStats.tier).toBe(Tier.FOUR);
  });
});
