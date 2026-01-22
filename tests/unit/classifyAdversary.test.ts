/**
 * Adversary Classification Unit Tests
 *
 * Tests the D&D 5e monster to Daggerheart adversary type classification logic.
 *
 * @module tests/unit/classifyAdversary.test
 */

import {
  classifyAdversary,
  classifyMultiple,
  getClassificationStats,
  ClassificationResult,
} from '../../src/converters/classifyAdversary';
import { AdversaryType } from '../../src/models/daggerheart';
import {
  GOBLIN,
  WOLF,
  SKELETON,
  ORC,
  OGRE,
  OWLBEAR,
  TROLL,
  YOUNG_RED_DRAGON,
  ADULT_RED_DRAGON,
  SRD_MONSTERS,
} from '../fixtures/srd-monsters';
import {
  createMockStatBlock,
  createMinionStatBlock,
  createSoloStatBlock,
} from '../helpers/testUtils';

// ============================================================================
// MINION CLASSIFICATION TESTS
// ============================================================================

describe('Minion classification', () => {
  it('should classify CR 0 creatures as Minion', () => {
    const cr0Creature = createMockStatBlock({
      name: 'CR 0 Creature',
      challengeRating: { cr: 0, xp: 10 },
      hitPoints: { average: 3, formula: { count: 1, dieSize: 6, modifier: 0 } },
    });
    const result = classifyAdversary(cr0Creature);
    expect(result.type).toBe(AdversaryType.MINION);
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('should classify CR 1/8 creatures as Minion', () => {
    const cr18Creature = createMinionStatBlock({
      name: 'CR 1/8 Creature',
      challengeRating: { cr: '1/8', xp: 25 },
    });
    const result = classifyAdversary(cr18Creature);
    expect(result.type).toBe(AdversaryType.MINION);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
  });

  it('should classify Goblin as Minion (CR 1/4)', () => {
    const result = classifyAdversary(GOBLIN);
    expect(result.type).toBe(AdversaryType.MINION);
  });

  it('should classify Skeleton as Minion (CR 1/4)', () => {
    const result = classifyAdversary(SKELETON);
    expect(result.type).toBe(AdversaryType.MINION);
  });
});

// ============================================================================
// HORDE CLASSIFICATION TESTS
// ============================================================================

describe('Horde classification', () => {
  it('should classify Wolf as Horde due to Pack Tactics', () => {
    const result = classifyAdversary(WOLF);
    expect(result.type).toBe(AdversaryType.HORDE);
    expect(result.reasoning).toContain('Pack Tactics');
  });

  it('should classify low CR creatures with Pack Tactics as Horde', () => {
    const packCreature = createMockStatBlock({
      name: 'Pack Creature',
      challengeRating: { cr: 1, xp: 200 },
      traits: [
        {
          name: 'Pack Tactics',
          description: 'Advantage when ally is adjacent.',
        },
      ],
    });
    const result = classifyAdversary(packCreature);
    expect(result.type).toBe(AdversaryType.HORDE);
  });
});

// ============================================================================
// SOLO CLASSIFICATION TESTS
// ============================================================================

describe('Solo classification', () => {
  it('should classify Adult Red Dragon as Solo (has legendary actions)', () => {
    const result = classifyAdversary(ADULT_RED_DRAGON);
    expect(result.type).toBe(AdversaryType.SOLO);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
    expect(result.reasoning).toContain('legendary');
  });

  it('should classify creatures with Legendary Resistance as Solo', () => {
    const soloCreature = createSoloStatBlock();
    const result = classifyAdversary(soloCreature);
    expect(result.type).toBe(AdversaryType.SOLO);
  });

  it('should classify high CR (>= 10) creatures as Solo', () => {
    const highCRCreature = createMockStatBlock({
      name: 'High CR Creature',
      challengeRating: { cr: 15, xp: 13000 },
      hitPoints: { average: 200, formula: { count: 20, dieSize: 10, modifier: 80 } },
    });
    const result = classifyAdversary(highCRCreature);
    expect(result.type).toBe(AdversaryType.SOLO);
  });

  it('should classify creatures with lair actions as Solo', () => {
    const lairCreature = createMockStatBlock({
      name: 'Lair Creature',
      challengeRating: { cr: 8, xp: 3900 },
      lairActions: {
        initiativeCount: 20,
        actions: [
          { description: 'A tremor shakes the lair.' },
        ],
      },
    });
    const result = classifyAdversary(lairCreature);
    expect(result.type).toBe(AdversaryType.SOLO);
  });

  it('should classify creatures with mythic actions as Solo', () => {
    const mythicCreature = createMockStatBlock({
      name: 'Mythic Creature',
      challengeRating: { cr: 12, xp: 8400 },
      mythicActions: {
        trait: {
          name: 'Mythic Trait',
          description: 'When reduced to 0 HP, regains full HP.',
        },
        count: 3,
        actions: [
          { name: 'Mythic Attack', description: 'Makes a powerful attack.', cost: 1 },
        ],
      },
    });
    const result = classifyAdversary(mythicCreature);
    expect(result.type).toBe(AdversaryType.SOLO);
  });
});

// ============================================================================
// SWARM CLASSIFICATION TESTS
// ============================================================================

describe('Swarm classification', () => {
  it('should classify creatures with "swarm" subtype as Swarm', () => {
    const swarmCreature = createMockStatBlock({
      name: 'Swarm of Rats',
      subtypes: ['swarm'],
      challengeRating: { cr: '1/4', xp: 50 },
    });
    const result = classifyAdversary(swarmCreature);
    expect(result.type).toBe(AdversaryType.SWARM);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should classify "Swarm of X" named creatures as Swarm', () => {
    const swarmCreature = createMockStatBlock({
      name: 'Swarm of Insects',
      challengeRating: { cr: '1/2', xp: 100 },
    });
    const result = classifyAdversary(swarmCreature);
    expect(result.type).toBe(AdversaryType.SWARM);
  });

  it('should classify creatures with swarm traits as Swarm', () => {
    const swarmCreature = createMockStatBlock({
      name: 'Creeping Swarm',
      challengeRating: { cr: 1, xp: 200 },
      traits: [
        {
          name: 'Swarm',
          description: "The swarm can occupy another creature's space and vice versa.",
        },
      ],
    });
    const result = classifyAdversary(swarmCreature);
    expect(result.type).toBe(AdversaryType.SWARM);
  });
});

// ============================================================================
// STANDARD CLASSIFICATION TESTS
// ============================================================================

describe('Standard classification', () => {
  it('should classify Orc as Standard (or Bruiser)', () => {
    const result = classifyAdversary(ORC);
    // Orc might be classified as Bruiser due to high STR
    expect([AdversaryType.STANDARD, AdversaryType.BRUISER]).toContain(result.type);
  });

  it('should classify Ogre as Standard or Bruiser', () => {
    const result = classifyAdversary(OGRE);
    expect([AdversaryType.STANDARD, AdversaryType.BRUISER]).toContain(result.type);
  });
});

// ============================================================================
// BRUISER CLASSIFICATION TESTS
// ============================================================================

describe('Bruiser classification', () => {
  it('should classify high-STR melee creatures as Bruiser', () => {
    const bruiserCreature = createMockStatBlock({
      name: 'Bruiser',
      abilityScores: { STR: 20, DEX: 10, CON: 16, INT: 8, WIS: 10, CHA: 8 },
      attacks: [
        {
          name: 'Slam',
          attackType: 'Melee Weapon Attack' as any,
          toHit: 7,
          range: { reach: 5 },
          target: 'one target',
          damage: {
            dice: { count: 2, dieSize: 10, modifier: 5 },
            damageType: 'Bludgeoning' as any,
          },
        },
      ],
    });
    const result = classifyAdversary(bruiserCreature);
    expect(result.type).toBe(AdversaryType.BRUISER);
  });

  it('should classify Troll as Bruiser', () => {
    const result = classifyAdversary(TROLL);
    expect(result.type).toBe(AdversaryType.BRUISER);
  });

  it('should classify Owlbear as Bruiser (multiattack + high damage)', () => {
    const result = classifyAdversary(OWLBEAR);
    expect(result.type).toBe(AdversaryType.BRUISER);
  });
});

// ============================================================================
// RANGED/ARTILLERY CLASSIFICATION TESTS
// ============================================================================

describe('Ranged classification', () => {
  it('should classify primarily ranged creatures as Ranged', () => {
    const archerCreature = createMockStatBlock({
      name: 'Archer',
      abilityScores: { STR: 10, DEX: 18, CON: 12, INT: 10, WIS: 14, CHA: 10 },
      attacks: [
        {
          name: 'Longbow',
          attackType: 'Ranged Weapon Attack' as any,
          toHit: 6,
          range: { normal: 150, long: 600 },
          target: 'one target',
          damage: {
            dice: { count: 1, dieSize: 8, modifier: 4 },
            damageType: 'Piercing' as any,
          },
        },
      ],
    });
    const result = classifyAdversary(archerCreature);
    expect(result.type).toBe(AdversaryType.RANGED);
  });

  it('should classify spellcasters with attack spells as Ranged', () => {
    const casterCreature = createMockStatBlock({
      name: 'Battle Mage',
      spellcasting: {
        type: 'traditional',
        ability: 'INT' as any,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: {
          cantrips: [{ name: 'Fire Bolt', level: 0 }],
          1: [{ name: 'Magic Missile', level: 1 }],
        },
      },
    });
    const result = classifyAdversary(casterCreature);
    // Should be classified based on spellcasting
    expect([AdversaryType.RANGED, AdversaryType.SUPPORT, AdversaryType.STANDARD]).toContain(
      result.type
    );
  });
});

// ============================================================================
// SUPPORT CLASSIFICATION TESTS
// ============================================================================

describe('Support classification', () => {
  it('should classify creatures with healing abilities as Support', () => {
    const healerCreature = createMockStatBlock({
      name: 'Healer',
      traits: [
        {
          name: 'Healing Touch',
          description: 'Can heal an ally for 2d8+4 hit points.',
        },
      ],
      spellcasting: {
        type: 'innate',
        ability: 'WIS' as any,
        spellSaveDC: 13,
        spells: {
          perDay3: [{ name: 'Cure Wounds', level: 1 }],
        },
      },
    });
    const result = classifyAdversary(healerCreature);
    expect(result.type).toBe(AdversaryType.SUPPORT);
  });

  it('should classify creatures with protective abilities as Support', () => {
    const protectorCreature = createMockStatBlock({
      name: 'Guardian',
      traits: [
        {
          name: 'Protective Aura',
          description: 'Allies within 10 feet gain +2 to AC.',
        },
      ],
      spellcasting: {
        type: 'innate',
        ability: 'CHA' as any,
        spellSaveDC: 14,
        spells: {
          perDay1: [{ name: 'Sanctuary', level: 1 }],
        },
      },
    });
    const result = classifyAdversary(protectorCreature);
    expect(result.type).toBe(AdversaryType.SUPPORT);
  });
});

// ============================================================================
// LEADER CLASSIFICATION TESTS
// ============================================================================

describe('Leader classification', () => {
  it('should classify creatures with command abilities as Leader', () => {
    const leaderCreature = createMockStatBlock({
      name: 'War Chief',
      traits: [
        {
          name: 'Battle Cry',
          description: 'Can command allies within 30 feet to attack.',
        },
        {
          name: 'Leadership Aura',
          description: 'Allies within 30 feet gain advantage on saving throws.',
        },
      ],
    });
    const result = classifyAdversary(leaderCreature);
    expect(result.type).toBe(AdversaryType.LEADER);
  });

  it('should classify creatures with rally abilities as Leader', () => {
    const rallyCreature = createMockStatBlock({
      name: 'Captain',
      actions: [
        {
          name: 'Rally',
          description:
            'The captain inspires allies, granting them temporary hit points.',
        },
      ],
    });
    const result = classifyAdversary(rallyCreature);
    expect(result.type).toBe(AdversaryType.LEADER);
  });
});

// ============================================================================
// SKULK CLASSIFICATION TESTS
// ============================================================================

describe('Skulk classification', () => {
  it('should classify high-DEX mobile creatures as Skulk', () => {
    const skulkCreature = createMockStatBlock({
      name: 'Shadow Assassin',
      abilityScores: { STR: 10, DEX: 18, CON: 12, INT: 12, WIS: 14, CHA: 10 },
      speed: { walk: 40 },
      traits: [
        {
          name: 'Evasion',
          description: 'Can halve damage on successful Dexterity saves.',
        },
        {
          name: 'Cunning Action',
          description: 'Can Dash, Disengage, or Hide as a bonus action.',
        },
      ],
    });
    const result = classifyAdversary(skulkCreature);
    expect(result.type).toBe(AdversaryType.SKULK);
  });

  it('should classify flying skirmishers as Skulk', () => {
    const flyerCreature = createMockStatBlock({
      name: 'Harpy Scout',
      speed: { walk: 20, fly: 50 },
      abilityScores: { STR: 10, DEX: 16, CON: 12, INT: 8, WIS: 12, CHA: 14 },
      traits: [
        {
          name: 'Flyby',
          description: "Doesn't provoke opportunity attacks when flying out of reach.",
        },
      ],
    });
    const result = classifyAdversary(flyerCreature);
    expect(result.type).toBe(AdversaryType.SKULK);
  });
});

// ============================================================================
// COMBAT ROLE TESTS
// ============================================================================

describe('Combat role assignment', () => {
  it('should assign Artillery role to ranged attackers', () => {
    const archerCreature = createMockStatBlock({
      name: 'Archer',
      attacks: [
        {
          name: 'Longbow',
          attackType: 'Ranged Weapon Attack' as any,
          toHit: 6,
          range: { normal: 150, long: 600 },
          target: 'one target',
          damage: {
            dice: { count: 1, dieSize: 8, modifier: 4 },
            damageType: 'Piercing' as any,
          },
        },
      ],
    });
    const result = classifyAdversary(archerCreature);
    expect(result.role).toBe('Artillery');
  });

  it('should assign Bruiser role to high-STR melee creatures', () => {
    const bruiserCreature = createMockStatBlock({
      name: 'Brute',
      abilityScores: { STR: 20, DEX: 10, CON: 16, INT: 8, WIS: 10, CHA: 8 },
      attacks: [
        {
          name: 'Slam',
          attackType: 'Melee Weapon Attack' as any,
          toHit: 7,
          range: { reach: 5 },
          target: 'one target',
          damage: {
            dice: { count: 2, dieSize: 10, modifier: 5 },
            damageType: 'Bludgeoning' as any,
          },
        },
      ],
    });
    const result = classifyAdversary(bruiserCreature);
    expect(result.role).toBe('Bruiser');
  });

  it('should assign Controller role to CC-focused creatures', () => {
    const controllerCreature = createMockStatBlock({
      name: 'Controller',
      traits: [
        {
          name: 'Paralyzing Gaze',
          description: 'Can paralyze creatures that fail a save.',
        },
      ],
      spellcasting: {
        type: 'traditional',
        ability: 'INT' as any,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: {
          2: [{ name: 'Hold Person', level: 2 }],
        },
      },
    });
    const result = classifyAdversary(controllerCreature);
    expect(result.role).toBe('Controller');
  });
});

// ============================================================================
// CONFIDENCE SCORING TESTS
// ============================================================================

describe('Confidence scoring', () => {
  it('should have high confidence for clear Minions', () => {
    const result = classifyAdversary(GOBLIN);
    expect(result.confidence).toBeGreaterThanOrEqual(0.7);
  });

  it('should have high confidence for clear Solos', () => {
    const result = classifyAdversary(ADULT_RED_DRAGON);
    expect(result.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it('should have high confidence for clear Swarms', () => {
    const swarmCreature = createMockStatBlock({
      name: 'Swarm of Bees',
      subtypes: ['swarm'],
    });
    const result = classifyAdversary(swarmCreature);
    expect(result.confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('should provide reasoning for all classifications', () => {
    for (const monster of Object.values(SRD_MONSTERS)) {
      const result = classifyAdversary(monster);
      expect(result.reasoning).toBeTruthy();
      expect(result.reasoning.length).toBeGreaterThan(0);
    }
  });
});

// ============================================================================
// BATCH CLASSIFICATION TESTS
// ============================================================================

describe('classifyMultiple()', () => {
  it('should classify all SRD monsters', () => {
    const monsters = Object.values(SRD_MONSTERS);
    const results = classifyMultiple(monsters);
    expect(results.length).toBe(monsters.length);
    results.forEach((result) => {
      expect(result.name).toBeTruthy();
      expect(result.classification.type).toBeTruthy();
    });
  });

  it('should include monster names in results', () => {
    const results = classifyMultiple([GOBLIN, WOLF, ORC]);
    expect(results[0]!.name).toBe('Goblin');
    expect(results[1]!.name).toBe('Wolf');
    expect(results[2]!.name).toBe('Orc');
  });
});

describe('getClassificationStats()', () => {
  it('should return type distribution', () => {
    const monsters = Object.values(SRD_MONSTERS);
    const stats = getClassificationStats(monsters);
    expect(stats.typeDistribution).toBeDefined();
    expect(typeof stats.typeDistribution[AdversaryType.MINION]).toBe('number');
    expect(typeof stats.typeDistribution[AdversaryType.SOLO]).toBe('number');
  });

  it('should return role distribution', () => {
    const monsters = Object.values(SRD_MONSTERS);
    const stats = getClassificationStats(monsters);
    expect(stats.roleDistribution).toBeDefined();
    expect(typeof stats.roleDistribution.Bruiser).toBe('number');
  });

  it('should calculate average confidence', () => {
    const monsters = Object.values(SRD_MONSTERS);
    const stats = getClassificationStats(monsters);
    expect(stats.averageConfidence).toBeGreaterThan(0);
    expect(stats.averageConfidence).toBeLessThanOrEqual(1);
  });
});
