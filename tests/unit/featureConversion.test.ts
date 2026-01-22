/**
 * Feature Conversion Unit Tests
 *
 * Tests the D&D 5e traits, actions, and reactions to Daggerheart features conversion.
 *
 * @module tests/unit/featureConversion.test
 */

import {
  convertTrait,
  convertAction,
  convertReaction,
  convertBonusAction,
  convertLegendaryAction,
  convertSpellcasting,
  convertAllFeatures,
  convertMovementToFeatures,
  convertDamageModifiersToFeatures,
  convertConditionImmunitiesToFeature,
  getPassiveFeatures,
  getActionFeatures,
  getReactionFeatures,
  calculateTotalStressCost,
  summarizeFeatures,
  ConvertedFeature,
} from '../../src/converters/featureConversion';
import {
  Trait,
  DnD5eAction,
  Reaction as DnD5eReaction,
  BonusAction,
  LegendaryAction,
  DnD5eDamageType,
  DnD5eCondition,
  AbilityScore,
} from '../../src/models/dnd5e';
import {
  FeatureType,
  FeatureCostType,
} from '../../src/models/daggerheart';
import {
  GOBLIN,
  WOLF,
  SKELETON,
  TROLL,
  YOUNG_RED_DRAGON,
  ADULT_RED_DRAGON,
  GIANT_SPIDER,
  SRD_MONSTERS,
} from '../fixtures/srd-monsters';

// ============================================================================
// convertTrait() TESTS
// ============================================================================

describe('convertTrait()', () => {
  describe('passive trait patterns', () => {
    it('should convert Pack Tactics to Passive', () => {
      const trait: Trait = {
        name: 'Pack Tactics',
        description:
          "The wolf has advantage on attack rolls when ally is within 5 feet.",
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.PASSIVE);
      expect(result.name).toBe('Pack Tactics');
    });

    it('should convert Keen Senses to Passive', () => {
      const trait: Trait = {
        name: 'Keen Hearing and Smell',
        description: 'Has advantage on Perception checks using hearing or smell.',
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.PASSIVE);
    });

    it('should convert Spider Climb to Passive', () => {
      const trait: Trait = {
        name: 'Spider Climb',
        description: 'Can climb difficult surfaces without needing ability checks.',
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.PASSIVE);
      expect(result.description).toContain('climb');
    });

    it('should convert Regeneration to Passive', () => {
      const trait: Trait = {
        name: 'Regeneration',
        description: 'Regains 10 HP at the start of its turn.',
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.PASSIVE);
      expect(result.name).toBe('Regeneration');
    });

    it('should convert Magic Resistance to Passive', () => {
      const trait: Trait = {
        name: 'Magic Resistance',
        description: 'Advantage on saves against spells and magical effects.',
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.PASSIVE);
      expect(result.description).toContain('advantage');
    });
  });

  describe('recharge-based traits', () => {
    it('should convert Recharge 5-6 to Action with 1 Stress', () => {
      const trait: Trait = {
        name: 'Fire Breath',
        description: 'Exhales fire in a cone.',
        recharge: { minRoll: 5, maxRoll: 6 },
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.ACTION);
      expect(result.cost?.type).toBe(FeatureCostType.STRESS);
      expect(result.cost?.amount).toBe(1);
    });

    it('should convert Recharge 6 to Action with 2 Stress', () => {
      const trait: Trait = {
        name: 'Lightning Breath',
        description: 'Exhales lightning in a line.',
        recharge: { minRoll: 6, maxRoll: 6 },
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.ACTION);
      expect(result.cost?.type).toBe(FeatureCostType.STRESS);
      expect(result.cost?.amount).toBe(2);
    });
  });

  describe('uses-based traits', () => {
    it('should convert 1/long rest to Action with 2 Stress', () => {
      const trait: Trait = {
        name: 'Powerful Ability',
        description: 'Does something powerful.',
        uses: { count: 1, rechargeOn: 'long rest' },
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.ACTION);
      expect(result.cost?.amount).toBe(2);
    });

    it('should convert 1/short rest to Action with 1 Stress', () => {
      const trait: Trait = {
        name: 'Moderate Ability',
        description: 'Does something moderately powerful.',
        uses: { count: 1, rechargeOn: 'short rest' },
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.ACTION);
      expect(result.cost?.amount).toBe(1);
    });

    it('should convert 3/day to Action with 1 Stress', () => {
      const trait: Trait = {
        name: 'Regular Ability',
        description: 'Does something regularly.',
        uses: { count: 3, rechargeOn: 'dawn' },
      };
      const result = convertTrait(trait);
      expect(result.type).toBe(FeatureType.ACTION);
      expect(result.cost?.amount).toBe(1);
    });
  });

  describe('conversion notes', () => {
    it('should include source ability name', () => {
      const trait: Trait = {
        name: 'Original Trait',
        description: 'Some description.',
      };
      const result = convertTrait(trait);
      expect(result.sourceAbility).toBe('Original Trait');
    });

    it('should include conversion notes', () => {
      const trait: Trait = {
        name: 'Some Trait',
        description: 'Some description.',
        recharge: { minRoll: 5, maxRoll: 6 },
      };
      const result = convertTrait(trait);
      expect(result.conversionNotes).toContain('Recharge');
    });
  });
});

// ============================================================================
// convertAction() TESTS
// ============================================================================

describe('convertAction()', () => {
  describe('breath weapons', () => {
    it('should convert Fire Breath to Action with Stress', () => {
      const action: DnD5eAction = {
        name: 'Fire Breath',
        description: 'Exhales fire in a 30-foot cone.',
        recharge: { minRoll: 5, maxRoll: 6 },
        damage: {
          dice: { count: 16, dieSize: 6, modifier: 0 },
          damageType: DnD5eDamageType.FIRE,
        },
        areaOfEffect: { type: 'cone', size: 30 },
      };
      const result = convertAction(action);
      expect(result.type).toBe(FeatureType.ACTION);
      expect(result.cost?.amount).toBeGreaterThan(0);
      expect(result.target).toContain('30-foot');
    });
  });

  describe('actions with saving throws', () => {
    it('should include reaction roll info', () => {
      const action: DnD5eAction = {
        name: 'Frightful Presence',
        description: 'Creatures must make a Wisdom save or be frightened.',
        savingThrow: { ability: AbilityScore.WISDOM, dc: 19 },
      };
      const result = convertAction(action);
      expect(result.reactionRollAttribute).toBeDefined();
    });
  });

  describe('special action patterns', () => {
    it('should detect gaze attacks', () => {
      const action: DnD5eAction = {
        name: 'Petrifying Gaze',
        description: 'Target must make a Constitution save.',
      };
      const result = convertAction(action);
      expect(result.cost).toBeDefined();
    });

    it('should detect teleport abilities', () => {
      const action: DnD5eAction = {
        name: 'Misty Step',
        description: 'Teleports up to 30 feet.',
      };
      const result = convertAction(action);
      expect(result.cost).toBeDefined();
    });
  });
});

// ============================================================================
// convertReaction() TESTS
// ============================================================================

describe('convertReaction()', () => {
  describe('parry reactions', () => {
    it('should convert Parry to Reaction with 1 Stress', () => {
      const reaction: DnD5eReaction = {
        name: 'Parry',
        description: 'Adds 2 to AC against one melee attack.',
        trigger: 'when hit by a melee attack',
      };
      const result = convertReaction(reaction);
      expect(result.type).toBe(FeatureType.REACTION);
      expect(result.cost?.amount).toBe(1);
      expect(result.trigger).toBeDefined();
    });
  });

  describe('shield reactions', () => {
    it('should convert Shield to Reaction', () => {
      const reaction: DnD5eReaction = {
        name: 'Shield',
        description: 'Gains +5 AC until start of next turn.',
        trigger: 'when hit by attack or targeted by magic missile',
      };
      const result = convertReaction(reaction);
      expect(result.type).toBe(FeatureType.REACTION);
    });
  });

  describe('counterspell reactions', () => {
    it('should convert Counterspell to Reaction with 2 Stress', () => {
      const reaction: DnD5eReaction = {
        name: 'Counterspell',
        description: 'Interrupts a spell being cast.',
        trigger: 'when a creature casts a spell',
      };
      const result = convertReaction(reaction);
      expect(result.type).toBe(FeatureType.REACTION);
      expect(result.cost?.amount).toBe(2);
    });
  });

  describe('trigger extraction', () => {
    it('should extract trigger from description if not provided', () => {
      const reaction: DnD5eReaction = {
        name: 'Defensive Stance',
        description: 'When the creature takes damage, it can reduce the damage by 1d6.',
      };
      const result = convertReaction(reaction);
      expect(result.trigger?.description).toContain('damage');
    });
  });
});

// ============================================================================
// convertBonusAction() TESTS
// ============================================================================

describe('convertBonusAction()', () => {
  it('should convert bonus action to Action feature', () => {
    const bonusAction: BonusAction = {
      name: 'Quick Attack',
      description: 'Makes an additional attack.',
    };
    const result = convertBonusAction(bonusAction);
    expect(result.type).toBe(FeatureType.ACTION);
    expect(result.sourceAbility).toContain('Bonus Action');
  });

  it('should handle bonus action with recharge', () => {
    const bonusAction: BonusAction = {
      name: 'Nimble Escape',
      description: 'Can Disengage or Hide.',
      recharge: { minRoll: 5, maxRoll: 6 },
    };
    const result = convertBonusAction(bonusAction);
    expect(result.cost).toBeDefined();
  });
});

// ============================================================================
// convertLegendaryAction() TESTS
// ============================================================================

describe('convertLegendaryAction()', () => {
  it('should convert cost 1 legendary action to 1 Stress', () => {
    const legendary: LegendaryAction = {
      name: 'Detect',
      description: 'Makes a Perception check.',
      cost: 1,
    };
    const result = convertLegendaryAction(legendary);
    expect(result.type).toBe(FeatureType.ACTION);
    expect(result.cost?.amount).toBe(1);
    expect(result.sourceAbility).toContain('Legendary');
  });

  it('should convert cost 2 legendary action to 2 Stress', () => {
    const legendary: LegendaryAction = {
      name: 'Wing Attack',
      description: 'Beats its wings, damaging and knocking creatures prone.',
      cost: 2,
    };
    const result = convertLegendaryAction(legendary);
    expect(result.cost?.amount).toBe(2);
  });

  it('should convert cost 3 legendary action to 3 Stress', () => {
    const legendary: LegendaryAction = {
      name: 'Devastating Strike',
      description: 'Performs a powerful attack.',
      cost: 3,
    };
    const result = convertLegendaryAction(legendary);
    expect(result.cost?.amount).toBe(3);
  });
});

// ============================================================================
// convertSpellcasting() TESTS
// ============================================================================

describe('convertSpellcasting()', () => {
  describe('innate spellcasting', () => {
    it('should convert at-will spells to Passive', () => {
      const spellcasting = {
        type: 'innate' as const,
        ability: AbilityScore.CHARISMA,
        spellSaveDC: 15,
        spells: {
          atWill: [{ name: 'Detect Magic', level: 1 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const passive = features.find((f) => f.type === FeatureType.PASSIVE);
      expect(passive).toBeDefined();
      expect(passive?.name).toBe('Innate Magic');
    });

    it('should convert 3/day spells to 1 Stress Action', () => {
      const spellcasting = {
        type: 'innate' as const,
        ability: AbilityScore.CHARISMA,
        spellSaveDC: 15,
        spells: {
          perDay3: [{ name: 'Fireball', level: 3 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const action = features.find((f) => f.cost?.amount === 1);
      expect(action).toBeDefined();
    });

    it('should convert 1/day spells to 2 Stress Action', () => {
      const spellcasting = {
        type: 'innate' as const,
        ability: AbilityScore.CHARISMA,
        spellSaveDC: 15,
        spells: {
          perDay1: [{ name: 'Plane Shift', level: 7 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const action = features.find((f) => f.cost?.amount === 2);
      expect(action).toBeDefined();
    });
  });

  describe('traditional spellcasting', () => {
    it('should convert cantrips to Passive', () => {
      const spellcasting = {
        type: 'traditional' as const,
        ability: AbilityScore.INTELLIGENCE,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: {
          cantrips: [{ name: 'Fire Bolt', level: 0 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const passive = features.find((f) => f.name === 'Cantrips');
      expect(passive).toBeDefined();
      expect(passive?.type).toBe(FeatureType.PASSIVE);
    });

    it('should convert 1st-3rd level spells to 1 Stress', () => {
      const spellcasting = {
        type: 'traditional' as const,
        ability: AbilityScore.INTELLIGENCE,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: {
          1: [{ name: 'Magic Missile', level: 1 }],
          2: [{ name: 'Hold Person', level: 2 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const minorSpells = features.find((f) => f.name === 'Minor Spells');
      expect(minorSpells?.cost?.amount).toBe(1);
    });

    it('should convert 4th-6th level spells to 2 Stress', () => {
      const spellcasting = {
        type: 'traditional' as const,
        ability: AbilityScore.INTELLIGENCE,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: {
          4: [{ name: 'Greater Invisibility', level: 4 }],
          5: [{ name: 'Cone of Cold', level: 5 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const majorSpells = features.find((f) => f.name === 'Major Spells');
      expect(majorSpells?.cost?.amount).toBe(2);
    });

    it('should convert 7th-9th level spells to 3 Stress', () => {
      const spellcasting = {
        type: 'traditional' as const,
        ability: AbilityScore.INTELLIGENCE,
        spellSaveDC: 15,
        spellAttackBonus: 7,
        spells: {
          7: [{ name: 'Finger of Death', level: 7 }],
          9: [{ name: 'Wish', level: 9 }],
        },
      };
      const features = convertSpellcasting(spellcasting);
      const legendarySpells = features.find((f) => f.name === 'Legendary Spells');
      expect(legendarySpells?.cost?.amount).toBe(3);
    });
  });
});

// ============================================================================
// convertMovementToFeatures() TESTS
// ============================================================================

describe('convertMovementToFeatures()', () => {
  it('should convert fly speed to Flight feature', () => {
    const speed = { walk: 30, fly: 60 };
    const features = convertMovementToFeatures(speed);
    const flight = features.find((f) => f.name === 'Flight');
    expect(flight).toBeDefined();
    expect(flight?.type).toBe(FeatureType.PASSIVE);
  });

  it('should note hover capability', () => {
    const speed = { walk: 0, fly: 30, hover: true };
    const features = convertMovementToFeatures(speed);
    const flight = features.find((f) => f.name === 'Flight');
    expect(flight?.description).toContain('hover');
  });

  it('should convert swim speed to Swimmer feature', () => {
    const speed = { walk: 30, swim: 40 };
    const features = convertMovementToFeatures(speed);
    const swim = features.find((f) => f.name === 'Swimmer');
    expect(swim).toBeDefined();
  });

  it('should convert burrow speed to Burrower feature', () => {
    const speed = { walk: 30, burrow: 20 };
    const features = convertMovementToFeatures(speed);
    const burrow = features.find((f) => f.name === 'Burrower');
    expect(burrow).toBeDefined();
  });

  it('should convert climb speed to Climber feature', () => {
    const speed = { walk: 30, climb: 30 };
    const features = convertMovementToFeatures(speed);
    const climb = features.find((f) => f.name === 'Climber');
    expect(climb).toBeDefined();
  });
});

// ============================================================================
// convertDamageModifiersToFeatures() TESTS
// ============================================================================

describe('convertDamageModifiersToFeatures()', () => {
  it('should convert damage immunities to feature', () => {
    const damageModifiers = {
      immunities: [{ damageType: DnD5eDamageType.FIRE }],
      resistances: [],
      vulnerabilities: [],
    };
    const features = convertDamageModifiersToFeatures(damageModifiers);
    const immunity = features.find((f) => f.name === 'Damage Immunity');
    expect(immunity).toBeDefined();
    expect(immunity?.description).toContain('fire');
  });

  it('should convert damage resistances to feature', () => {
    const damageModifiers = {
      immunities: [],
      resistances: [{ damageType: DnD5eDamageType.COLD }],
      vulnerabilities: [],
    };
    const features = convertDamageModifiersToFeatures(damageModifiers);
    const resistance = features.find((f) => f.name === 'Damage Resistance');
    expect(resistance).toBeDefined();
    expect(resistance?.description).toContain('cold');
  });

  it('should convert damage vulnerabilities to feature', () => {
    const damageModifiers = {
      immunities: [],
      resistances: [],
      vulnerabilities: [{ damageType: DnD5eDamageType.FIRE }],
    };
    const features = convertDamageModifiersToFeatures(damageModifiers);
    const vulnerability = features.find((f) => f.name === 'Vulnerability');
    expect(vulnerability).toBeDefined();
    expect(vulnerability?.description).toContain('fire');
  });
});

// ============================================================================
// convertConditionImmunitiesToFeature() TESTS
// ============================================================================

describe('convertConditionImmunitiesToFeature()', () => {
  it('should convert single condition immunity', () => {
    const result = convertConditionImmunitiesToFeature([DnD5eCondition.FRIGHTENED]);
    expect(result).toBeDefined();
    expect(result?.name).toBe('Condition Immunity');
    expect(result?.description).toContain('frightened');
  });

  it('should convert multiple condition immunities', () => {
    const result = convertConditionImmunitiesToFeature([
      DnD5eCondition.CHARMED,
      DnD5eCondition.PARALYZED,
      DnD5eCondition.POISONED,
    ]);
    expect(result?.description).toContain('conditions');
  });

  it('should return undefined for empty array', () => {
    const result = convertConditionImmunitiesToFeature([]);
    expect(result).toBeUndefined();
  });
});

// ============================================================================
// convertAllFeatures() TESTS
// ============================================================================

describe('convertAllFeatures()', () => {
  describe('Goblin features', () => {
    it('should convert Nimble Escape trait', () => {
      const features = convertAllFeatures(GOBLIN);
      const nimble = features.find((f) => f.sourceAbility === 'Nimble Escape');
      expect(nimble).toBeDefined();
    });
  });

  describe('Wolf features', () => {
    it('should convert Pack Tactics and Keen Senses', () => {
      const features = convertAllFeatures(WOLF);
      expect(features.length).toBeGreaterThanOrEqual(2);
      const packTactics = features.find((f) => f.name === 'Pack Tactics');
      expect(packTactics).toBeDefined();
    });
  });

  describe('Troll features', () => {
    it('should convert Regeneration', () => {
      const features = convertAllFeatures(TROLL);
      const regen = features.find((f) => f.name === 'Regeneration');
      expect(regen).toBeDefined();
    });
  });

  describe('Giant Spider features', () => {
    it('should convert Spider Climb and Web features', () => {
      const features = convertAllFeatures(GIANT_SPIDER);
      const spiderClimb = features.find((f) => f.name === 'Spider Climb');
      expect(spiderClimb).toBeDefined();
      // Web action should be converted
      const web = features.find((f) => f.sourceAbility === 'Web');
      expect(web).toBeDefined();
      expect(web?.cost?.amount).toBeGreaterThan(0); // Recharge 5-6
    });

    it('should convert climb movement to feature', () => {
      const features = convertAllFeatures(GIANT_SPIDER);
      const climber = features.find((f) => f.name === 'Climber');
      expect(climber).toBeDefined();
    });
  });

  describe('Dragon features', () => {
    it('should convert Young Red Dragon breath weapon', () => {
      const features = convertAllFeatures(YOUNG_RED_DRAGON);
      const breath = features.find((f) => f.sourceAbility === 'Fire Breath');
      expect(breath).toBeDefined();
      expect(breath?.cost).toBeDefined();
    });

    it('should convert Adult Red Dragon legendary actions', () => {
      const features = convertAllFeatures(ADULT_RED_DRAGON, {
        includeLegendaryActions: true,
      });
      const wingAttack = features.find((f) => f.sourceAbility?.includes('Wing Attack'));
      expect(wingAttack).toBeDefined();
      expect(wingAttack?.cost?.amount).toBe(2);
    });

    it('should convert flight to feature', () => {
      const features = convertAllFeatures(YOUNG_RED_DRAGON);
      const flight = features.find((f) => f.name === 'Flight');
      expect(flight).toBeDefined();
    });

    it('should convert fire immunity to feature', () => {
      const features = convertAllFeatures(YOUNG_RED_DRAGON);
      const immunity = features.find((f) => f.name === 'Damage Immunity');
      expect(immunity).toBeDefined();
      expect(immunity?.description).toContain('fire');
    });
  });

  describe('Skeleton features', () => {
    it('should convert condition immunities', () => {
      const features = convertAllFeatures(SKELETON);
      const condImmunity = features.find((f) => f.name === 'Condition Immunity');
      expect(condImmunity).toBeDefined();
    });

    it('should convert damage vulnerability', () => {
      const features = convertAllFeatures(SKELETON);
      const vuln = features.find((f) => f.name === 'Vulnerability');
      expect(vuln).toBeDefined();
      expect(vuln?.description).toContain('bludgeoning');
    });
  });
});

// ============================================================================
// UTILITY FUNCTION TESTS
// ============================================================================

describe('Feature utility functions', () => {
  const sampleFeatures: ConvertedFeature[] = [
    {
      name: 'Passive 1',
      type: FeatureType.PASSIVE,
      description: 'A passive feature.',
      sourceAbility: 'Trait 1',
      conversionNotes: 'Direct conversion',
    },
    {
      name: 'Passive 2',
      type: FeatureType.PASSIVE,
      description: 'Another passive feature.',
      sourceAbility: 'Trait 2',
      conversionNotes: 'Direct conversion',
    },
    {
      name: 'Action 1',
      type: FeatureType.ACTION,
      description: 'An action feature.',
      cost: { type: FeatureCostType.STRESS, amount: 1 },
      sourceAbility: 'Action 1',
      conversionNotes: 'From action',
    },
    {
      name: 'Action 2',
      type: FeatureType.ACTION,
      description: 'Another action feature.',
      cost: { type: FeatureCostType.STRESS, amount: 2 },
      sourceAbility: 'Action 2',
      conversionNotes: 'From action',
    },
    {
      name: 'Reaction 1',
      type: FeatureType.REACTION,
      description: 'A reaction feature.',
      cost: { type: FeatureCostType.STRESS, amount: 1 },
      trigger: { description: 'When attacked' },
      sourceAbility: 'Reaction 1',
      conversionNotes: 'From reaction',
    },
  ];

  describe('getPassiveFeatures()', () => {
    it('should return only passive features', () => {
      const passives = getPassiveFeatures(sampleFeatures);
      expect(passives.length).toBe(2);
      expect(passives.every((f) => f.type === FeatureType.PASSIVE)).toBe(true);
    });
  });

  describe('getActionFeatures()', () => {
    it('should return only action features', () => {
      const actions = getActionFeatures(sampleFeatures);
      expect(actions.length).toBe(2);
      expect(actions.every((f) => f.type === FeatureType.ACTION)).toBe(true);
    });
  });

  describe('getReactionFeatures()', () => {
    it('should return only reaction features', () => {
      const reactions = getReactionFeatures(sampleFeatures);
      expect(reactions.length).toBe(1);
      expect(reactions.every((f) => f.type === FeatureType.REACTION)).toBe(true);
    });
  });

  describe('calculateTotalStressCost()', () => {
    it('should sum all Stress costs', () => {
      const total = calculateTotalStressCost(sampleFeatures);
      // Action 1: 1 + Action 2: 2 + Reaction 1: 1 = 4
      expect(total).toBe(4);
    });

    it('should return 0 for features without costs', () => {
      const passiveOnly = sampleFeatures.filter((f) => f.type === FeatureType.PASSIVE);
      const total = calculateTotalStressCost(passiveOnly);
      expect(total).toBe(0);
    });
  });

  describe('summarizeFeatures()', () => {
    it('should provide correct counts', () => {
      const summary = summarizeFeatures(sampleFeatures);
      expect(summary.total).toBe(5);
      expect(summary.passive).toBe(2);
      expect(summary.action).toBe(2);
      expect(summary.reaction).toBe(1);
      expect(summary.totalStressCost).toBe(4);
    });

    it('should include conversion notes', () => {
      const summary = summarizeFeatures(sampleFeatures);
      expect(summary.conversionNotes.length).toBe(5);
      expect(summary.conversionNotes[0]).toContain('Passive 1');
    });
  });
});

// ============================================================================
// SRD MONSTER FEATURE CONVERSION TESTS
// ============================================================================

describe('SRD Monster Feature Conversions', () => {
  it('should convert all SRD monsters with features', () => {
    for (const [name, monster] of Object.entries(SRD_MONSTERS)) {
      const features = convertAllFeatures(monster);

      for (const feature of features) {
        expect(feature.name).toBeTruthy();
        expect(feature.type).toBeTruthy();
        expect(feature.description).toBeTruthy();
        expect(feature.sourceAbility).toBeTruthy();
      }
    }
  });

  it('should produce reasonable feature counts', () => {
    // Simple creatures should have fewer features
    const goblinFeatures = convertAllFeatures(GOBLIN);
    expect(goblinFeatures.length).toBeLessThan(10);

    // Complex creatures should have more features
    const dragonFeatures = convertAllFeatures(ADULT_RED_DRAGON);
    expect(dragonFeatures.length).toBeGreaterThan(5);
  });
});
