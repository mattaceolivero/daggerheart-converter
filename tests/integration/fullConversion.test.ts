/**
 * Full Conversion Pipeline Integration Tests
 *
 * Tests the complete D&D 5e to Daggerheart conversion pipeline
 * using SRD monsters as canonical test cases.
 *
 * @module tests/integration/fullConversion.test
 */

import {
  convertFromStatBlock,
  convertFromText,
  convertFromNaturalLanguage,
  validateStatBlock,
  analyzeSpecializations,
  ConversionResult,
} from '../../src/orchestrator/converter';
import {
  Tier,
  AdversaryType,
  Difficulty,
  FeatureType,
  RangeBand,
} from '../../src/models/daggerheart';
import {
  GOBLIN,
  WOLF,
  SKELETON,
  ORC,
  GIANT_SPIDER,
  OGRE,
  OWLBEAR,
  TROLL,
  YOUNG_RED_DRAGON,
  ADULT_RED_DRAGON,
  SRD_MONSTERS,
  MONSTERS_BY_TIER,
  MONSTERS_BY_TYPE,
} from '../fixtures/srd-monsters';
import {
  assertValidAdversary,
  validateTierExpectations,
  validateAdversaryType,
} from '../helpers/testUtils';

// ============================================================================
// CONVERSION RESULT VALIDATION
// ============================================================================

describe('Conversion Result Structure', () => {
  it('should return complete ConversionResult', () => {
    const result = convertFromStatBlock(GOBLIN);

    expect(result.adversary).toBeDefined();
    expect(result.conversionLog).toBeDefined();
    expect(Array.isArray(result.conversionLog)).toBe(true);
    expect(result.conversionLog.length).toBeGreaterThan(0);
  });

  it('should include markdown output by default', () => {
    const result = convertFromStatBlock(GOBLIN);
    expect(result.markdown).toBeDefined();
    expect(typeof result.markdown).toBe('string');
    expect(result.markdown!.length).toBeGreaterThan(0);
  });

  it('should include design notes when enabled', () => {
    const result = convertFromStatBlock(GOBLIN, { includeDesignNotes: true });
    expect(result.designNotes).toBeDefined();
    expect(result.designNotes?.conversionRationale).toBeDefined();
    expect(result.designNotes?.balanceNotes).toBeDefined();
    expect(result.designNotes?.gmTips).toBeDefined();
  });

  it('should exclude design notes when disabled', () => {
    const result = convertFromStatBlock(GOBLIN, { includeDesignNotes: false });
    expect(result.designNotes).toBeUndefined();
  });

  it('should produce JSON-only output when specified', () => {
    const result = convertFromStatBlock(GOBLIN, { outputFormat: 'json' });
    expect(result.adversary).toBeDefined();
    expect(result.markdown).toBeUndefined();
  });
});

// ============================================================================
// TIER 1 MONSTER CONVERSIONS (CR 0-2)
// ============================================================================

describe('Tier 1 Monster Conversions', () => {
  describe('Goblin (CR 1/4)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(GOBLIN);
    });

    it('should classify as Tier 1', () => {
      expect(result.adversary.tier).toBe(Tier.ONE);
    });

    it('should classify as Minion type', () => {
      expect(result.adversary.type).toBe(AdversaryType.MINION);
    });

    it('should have 1 HP as Minion', () => {
      expect(result.adversary.hp).toBe(1);
    });

    it('should have 0 Stress as Minion', () => {
      expect(result.adversary.stress).toBe(0);
    });

    it('should have Minor difficulty', () => {
      expect(result.adversary.difficulty).toBe(Difficulty.MINOR);
    });

    it('should pass validation', () => {
      const validation = assertValidAdversary(result.adversary);
      expect(validation.isValid).toBe(true);
    });

    it('should have Nimble Escape feature', () => {
      const features = result.adversary.features;
      const nimble = features.find((f) => f.sourceAbility === 'Nimble Escape');
      expect(nimble).toBeDefined();
    });

    it('should have two attacks available', () => {
      expect(result.adversary.attack).toBeDefined();
      expect(result.adversary.additionalAttacks?.length).toBe(1);
    });
  });

  describe('Wolf (CR 1/4)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(WOLF);
    });

    it('should classify as Tier 1', () => {
      expect(result.adversary.tier).toBe(Tier.ONE);
    });

    it('should classify as Horde type due to Pack Tactics', () => {
      expect(result.adversary.type).toBe(AdversaryType.HORDE);
    });

    it('should have Pack Tactics feature', () => {
      const packTactics = result.adversary.features.find(
        (f) => f.name === 'Pack Tactics'
      );
      expect(packTactics).toBeDefined();
      expect(packTactics?.type).toBe(FeatureType.PASSIVE);
    });

    it('should have knockdown effect on Bite', () => {
      expect(result.adversary.attack.additionalEffects).toContain('prone');
    });

    it('should pass validation', () => {
      const validation = assertValidAdversary(result.adversary);
      expect(validation.isValid).toBe(true);
    });
  });

  describe('Skeleton (CR 1/4)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(SKELETON);
    });

    it('should classify as Tier 1 Minion', () => {
      expect(result.adversary.tier).toBe(Tier.ONE);
      expect(result.adversary.type).toBe(AdversaryType.MINION);
    });

    it('should have undead-related features', () => {
      const features = result.adversary.features;
      // Should have condition immunities or damage modifiers
      const immunityFeature = features.find((f) =>
        f.name.includes('Immunity') || f.name.includes('Damage')
      );
      expect(immunityFeature).toBeDefined();
    });

    it('should have vulnerability noted', () => {
      const vulnFeature = result.adversary.features.find((f) =>
        f.name.includes('Vulnerability')
      );
      expect(vulnFeature).toBeDefined();
      expect(vulnFeature?.description).toContain('bludgeoning');
    });
  });

  describe('Orc (CR 1/2)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(ORC);
    });

    it('should classify as Tier 1', () => {
      expect(result.adversary.tier).toBe(Tier.ONE);
    });

    it('should be Standard or Bruiser type', () => {
      expect([AdversaryType.STANDARD, AdversaryType.BRUISER]).toContain(
        result.adversary.type
      );
    });

    it('should have appropriate HP for Standard', () => {
      // Standard Tier 1: HP/10 min Tier*2 = 2
      expect(result.adversary.hp).toBeGreaterThanOrEqual(2);
    });

    it('should have Aggressive trait converted', () => {
      const aggressive = result.adversary.features.find(
        (f) => f.sourceAbility === 'Aggressive'
      );
      expect(aggressive).toBeDefined();
    });
  });

  describe('Giant Spider (CR 1)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(GIANT_SPIDER);
    });

    it('should classify as Tier 1', () => {
      expect(result.adversary.tier).toBe(Tier.ONE);
    });

    it('should have Spider Climb feature', () => {
      const spiderClimb = result.adversary.features.find(
        (f) => f.name === 'Spider Climb'
      );
      expect(spiderClimb).toBeDefined();
    });

    it('should have Web action with Stress cost', () => {
      const web = result.adversary.features.find((f) => f.sourceAbility === 'Web');
      expect(web).toBeDefined();
      expect(web?.cost).toBeDefined();
    });

    it('should have poison damage in Bite attack', () => {
      expect(result.adversary.attack.additionalEffects).toContain('damage');
    });

    it('should have climb movement feature', () => {
      const climber = result.adversary.features.find((f) => f.name === 'Climber');
      expect(climber).toBeDefined();
    });
  });

  describe('Ogre (CR 2)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(OGRE);
    });

    it('should classify as Tier 1 (CR 2 is boundary)', () => {
      expect(result.adversary.tier).toBe(Tier.ONE);
    });

    it('should have higher HP than low-CR creatures', () => {
      // 59 HP / 10 = 5.9 -> 5
      expect(result.adversary.hp).toBeGreaterThanOrEqual(5);
    });

    it('should have high damage attack', () => {
      // Greatclub: 2d8+4 -> should convert to higher dice
      expect(result.adversary.attack.damage.diceSize).toBeGreaterThanOrEqual(10);
    });
  });
});

// ============================================================================
// TIER 2 MONSTER CONVERSIONS (CR 3-6)
// ============================================================================

describe('Tier 2 Monster Conversions', () => {
  describe('Owlbear (CR 3)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(OWLBEAR);
    });

    it('should classify as Tier 2', () => {
      expect(result.adversary.tier).toBe(Tier.TWO);
    });

    it('should be Bruiser type', () => {
      expect(result.adversary.type).toBe(AdversaryType.BRUISER);
    });

    it('should have multiattack noted', () => {
      expect(result.adversary.attack.additionalEffects).toContain('Multiattack');
    });

    it('should have Keen Senses feature', () => {
      const keen = result.adversary.features.find((f) =>
        f.sourceAbility?.includes('Keen')
      );
      expect(keen).toBeDefined();
    });

    it('should pass tier expectations', () => {
      const tierValidation = validateTierExpectations(result.adversary);
      expect(tierValidation.isValid).toBe(true);
    });
  });

  describe('Troll (CR 5)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(TROLL);
    });

    it('should classify as Tier 2', () => {
      expect(result.adversary.tier).toBe(Tier.TWO);
    });

    it('should be Bruiser type', () => {
      expect(result.adversary.type).toBe(AdversaryType.BRUISER);
    });

    it('should have Regeneration feature', () => {
      const regen = result.adversary.features.find((f) => f.name === 'Regeneration');
      expect(regen).toBeDefined();
      expect(regen?.type).toBe(FeatureType.PASSIVE);
    });

    it('should have appropriate Stress for Tier 2', () => {
      expect(result.adversary.stress).toBe(2);
    });

    it('should have multiple attacks with multiattack', () => {
      expect(result.adversary.attack.additionalEffects).toContain('Multiattack');
    });
  });
});

// ============================================================================
// TIER 3 MONSTER CONVERSIONS (CR 7-13)
// ============================================================================

describe('Tier 3 Monster Conversions', () => {
  describe('Young Red Dragon (CR 10)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(YOUNG_RED_DRAGON);
    });

    it('should classify as Tier 3', () => {
      expect(result.adversary.tier).toBe(Tier.THREE);
    });

    it('should be Bruiser or Standard type (no legendary actions)', () => {
      // Young dragon has no legendary actions, so not Solo
      expect([AdversaryType.BRUISER, AdversaryType.STANDARD]).toContain(
        result.adversary.type
      );
    });

    it('should have Fire Breath action with Stress cost', () => {
      const breath = result.adversary.features.find(
        (f) => f.sourceAbility === 'Fire Breath'
      );
      expect(breath).toBeDefined();
      expect(breath?.cost?.amount).toBeGreaterThan(0);
    });

    it('should have fire immunity feature', () => {
      const fireImmunity = result.adversary.features.find(
        (f) => f.name === 'Damage Immunity' && f.description.includes('fire')
      );
      expect(fireImmunity).toBeDefined();
    });

    it('should have Flight feature', () => {
      const flight = result.adversary.features.find((f) => f.name === 'Flight');
      expect(flight).toBeDefined();
    });

    it('should have climb movement', () => {
      expect(result.adversary.movement.canClimb).toBe(true);
    });

    it('should have fly movement', () => {
      expect(result.adversary.movement.canFly).toBe(true);
    });

    it('should pass validation', () => {
      const validation = assertValidAdversary(result.adversary);
      expect(validation.isValid).toBe(true);
    });
  });
});

// ============================================================================
// TIER 4 MONSTER CONVERSIONS (CR 14+)
// ============================================================================

describe('Tier 4 Monster Conversions', () => {
  describe('Adult Red Dragon (CR 17)', () => {
    let result: ConversionResult;

    beforeAll(() => {
      result = convertFromStatBlock(ADULT_RED_DRAGON);
    });

    it('should classify as Tier 4', () => {
      expect(result.adversary.tier).toBe(Tier.FOUR);
    });

    it('should be Solo type due to legendary actions', () => {
      expect(result.adversary.type).toBe(AdversaryType.SOLO);
    });

    it('should have Severe difficulty', () => {
      expect(result.adversary.difficulty).toBe(Difficulty.SEVERE);
    });

    it('should have high HP for Solo (HP/8)', () => {
      // 256 / 8 = 32, minimum is Tier 4 * 4 = 16
      expect(result.adversary.hp).toBeGreaterThanOrEqual(16);
    });

    it('should have double Stress for Solo (Tier * 2)', () => {
      expect(result.adversary.stress).toBeGreaterThanOrEqual(8);
    });

    it('should have Fire Breath with Stress cost', () => {
      const breath = result.adversary.features.find(
        (f) => f.sourceAbility === 'Fire Breath'
      );
      expect(breath).toBeDefined();
      expect(breath?.cost?.amount).toBeGreaterThan(0);
    });

    it('should have Frightful Presence', () => {
      const frightful = result.adversary.features.find(
        (f) => f.sourceAbility === 'Frightful Presence'
      );
      expect(frightful).toBeDefined();
    });

    it('should have legendary action features', () => {
      const legendary = result.adversary.features.filter((f) =>
        f.sourceAbility?.includes('Legendary')
      );
      expect(legendary.length).toBeGreaterThan(0);
    });

    it('should have Wing Attack legendary action with 2 Stress', () => {
      const wingAttack = result.adversary.features.find(
        (f) => f.sourceAbility?.includes('Wing Attack')
      );
      expect(wingAttack?.cost?.amount).toBe(2);
    });

    it('should have high evasion for Tier 4', () => {
      expect(result.adversary.evasion).toBeGreaterThanOrEqual(15);
    });

    it('should pass validation', () => {
      const validation = assertValidAdversary(result.adversary);
      expect(validation.isValid).toBe(true);
    });

    it('should pass tier expectations', () => {
      const tierValidation = validateTierExpectations(result.adversary);
      expect(tierValidation.isValid).toBe(true);
    });
  });
});

// ============================================================================
// SPECIALIZATION DETECTION TESTS
// ============================================================================

describe('Specialization Detection', () => {
  it('should detect multiattack in Owlbear', () => {
    const analysis = analyzeSpecializations(OWLBEAR);
    expect(analysis.hasMultiattack).toBe(true);
  });

  it('should detect legendary actions in Adult Red Dragon', () => {
    const analysis = analyzeSpecializations(ADULT_RED_DRAGON);
    expect(analysis.hasLegendaryActions).toBe(true);
  });

  it('should not detect legendary actions in Young Red Dragon', () => {
    const analysis = analyzeSpecializations(YOUNG_RED_DRAGON);
    expect(analysis.hasLegendaryActions).toBe(false);
  });

  it('should detect undead in Skeleton', () => {
    const analysis = analyzeSpecializations(SKELETON);
    expect(analysis.isUndead).toBe(true);
  });

  it('should not detect undead in Goblin', () => {
    const analysis = analyzeSpecializations(GOBLIN);
    expect(analysis.isUndead).toBe(false);
  });
});

// ============================================================================
// STAT BLOCK VALIDATION TESTS
// ============================================================================

describe('Stat Block Validation', () => {
  it('should validate complete stat blocks', () => {
    for (const monster of Object.values(SRD_MONSTERS)) {
      const validation = validateStatBlock(monster);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    }
  });

  it('should detect missing name', () => {
    const invalid = { ...GOBLIN, name: '' };
    const validation = validateStatBlock(invalid);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('should detect missing CR', () => {
    const invalid = { ...GOBLIN, challengeRating: undefined as any };
    const validation = validateStatBlock(invalid);
    expect(validation.isValid).toBe(false);
  });
});

// ============================================================================
// BATCH CONVERSION TESTS
// ============================================================================

describe('Batch Conversion Tests', () => {
  it('should convert all SRD monsters successfully', () => {
    for (const [name, monster] of Object.entries(SRD_MONSTERS)) {
      const result = convertFromStatBlock(monster);
      expect(result.adversary).toBeDefined();
      expect(result.adversary.name).toBe(name);

      const validation = assertValidAdversary(result.adversary);
      if (!validation.isValid) {
        console.error(`${name} failed validation:`, validation.errors);
      }
      expect(validation.isValid).toBe(true);
    }
  });

  it('should assign correct tiers to all Tier 1 monsters', () => {
    for (const monster of MONSTERS_BY_TIER.tier1) {
      const result = convertFromStatBlock(monster);
      expect(result.adversary.tier).toBe(Tier.ONE);
    }
  });

  it('should assign correct tiers to all Tier 2 monsters', () => {
    for (const monster of MONSTERS_BY_TIER.tier2) {
      const result = convertFromStatBlock(monster);
      expect(result.adversary.tier).toBe(Tier.TWO);
    }
  });

  it('should assign correct tiers to all Tier 3 monsters', () => {
    for (const monster of MONSTERS_BY_TIER.tier3) {
      const result = convertFromStatBlock(monster);
      expect(result.adversary.tier).toBe(Tier.THREE);
    }
  });

  it('should assign correct tiers to all Tier 4 monsters', () => {
    for (const monster of MONSTERS_BY_TIER.tier4) {
      const result = convertFromStatBlock(monster);
      expect(result.adversary.tier).toBe(Tier.FOUR);
    }
  });
});

// ============================================================================
// MARKDOWN OUTPUT TESTS
// ============================================================================

describe('Markdown Output', () => {
  it('should include creature name as header', () => {
    const result = convertFromStatBlock(GOBLIN);
    expect(result.markdown).toContain('# Goblin');
  });

  it('should include tier and type info', () => {
    const result = convertFromStatBlock(GOBLIN);
    expect(result.markdown).toContain('Tier');
    expect(result.markdown).toContain('Minion');
  });

  it('should include stats section', () => {
    const result = convertFromStatBlock(GOBLIN);
    expect(result.markdown).toContain('Evasion');
    expect(result.markdown).toContain('HP');
  });

  it('should include attack section', () => {
    const result = convertFromStatBlock(GOBLIN);
    expect(result.markdown).toContain('Scimitar');
  });

  it('should include features section', () => {
    const result = convertFromStatBlock(GOBLIN);
    expect(result.markdown).toContain('Features');
  });

  it('should produce different output for different creatures', () => {
    const goblinMd = convertFromStatBlock(GOBLIN).markdown;
    const dragonMd = convertFromStatBlock(ADULT_RED_DRAGON).markdown;

    expect(goblinMd).not.toBe(dragonMd);
    expect(dragonMd?.length).toBeGreaterThan(goblinMd!.length);
  });
});

// ============================================================================
// CONVERSION LOG TESTS
// ============================================================================

describe('Conversion Log', () => {
  it('should log all conversion steps', () => {
    const result = convertFromStatBlock(GOBLIN);
    const log = result.conversionLog;

    expect(log.some((l) => l.includes('Step 1'))).toBe(true);
    expect(log.some((l) => l.includes('Step 2'))).toBe(true);
    expect(log.some((l) => l.includes('complete'))).toBe(true);
  });

  it('should log classification results', () => {
    const result = convertFromStatBlock(GOBLIN);
    const log = result.conversionLog.join('\n');

    expect(log).toContain('Type:');
    expect(log).toContain('Tier:');
  });

  it('should log specialization detection', () => {
    const result = convertFromStatBlock(ADULT_RED_DRAGON);
    const log = result.conversionLog.join('\n');

    expect(log).toContain('Legendary');
  });
});

// ============================================================================
// TEXT INPUT CONVERSION TESTS
// ============================================================================

describe('Text Input Conversion', () => {
  const goblinText = `
    Goblin
    Small humanoid (goblinoid), neutral evil

    Armor Class 15 (leather armor, shield)
    Hit Points 7 (2d6)
    Speed 30 ft.

    STR 8 (-1) DEX 14 (+2) CON 10 (+0) INT 10 (+0) WIS 8 (-1) CHA 8 (-1)

    Senses darkvision 60 ft., passive Perception 9
    Languages Common, Goblin
    Challenge 1/4 (50 XP)

    Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action.

    Actions
    Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.
  `;

  it('should parse and convert text stat block', () => {
    const result = convertFromText(goblinText);
    expect(result.adversary).toBeDefined();
    expect(result.adversary.name).toBe('Goblin');
  });

  it('should preserve key attributes from text', () => {
    const result = convertFromText(goblinText);
    expect(result.adversary.tier).toBe(Tier.ONE);
  });
});

// ============================================================================
// NATURAL LANGUAGE INPUT TESTS
// ============================================================================

describe('Natural Language Input Conversion', () => {
  it('should convert simple creature description', () => {
    const description = 'A CR 1/4 goblin with a sword';
    const result = convertFromNaturalLanguage(description);
    expect(result.adversary).toBeDefined();
    expect(result.adversary.tier).toBe(Tier.ONE);
  });

  it('should infer tier from CR mention', () => {
    const description = 'A CR 5 troll that regenerates';
    const result = convertFromNaturalLanguage(description);
    expect(result.adversary.tier).toBe(Tier.TWO);
  });

  it('should detect legendary creatures', () => {
    const description = 'A CR 17 ancient dragon with legendary actions and breath weapon';
    const result = convertFromNaturalLanguage(description);
    expect(result.adversary.type).toBe(AdversaryType.SOLO);
  });
});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

describe('Edge Cases', () => {
  it('should handle creatures without attacks', () => {
    const noAttacks = { ...GOBLIN, attacks: [] };
    const result = convertFromStatBlock(noAttacks);
    // Should create default attack
    expect(result.adversary.attack).toBeDefined();
    expect(result.adversary.attack.name).toBe('Strike');
  });

  it('should handle creatures without traits', () => {
    const noTraits = { ...GOBLIN, traits: [] };
    const result = convertFromStatBlock(noTraits);
    expect(result.adversary).toBeDefined();
    expect(result.adversary.features).toBeDefined();
  });

  it('should handle creatures with no special senses', () => {
    const noSenses = {
      ...GOBLIN,
      senses: { specialSenses: [], passivePerception: 10 },
    };
    const result = convertFromStatBlock(noSenses);
    expect(result.adversary).toBeDefined();
  });

  it('should handle fractional CRs correctly', () => {
    const cr18 = { ...GOBLIN, challengeRating: { cr: '1/8', xp: 25 } };
    const result = convertFromStatBlock(cr18);
    expect(result.adversary.tier).toBe(Tier.ONE);
    expect(result.adversary.type).toBe(AdversaryType.MINION);
  });
});
