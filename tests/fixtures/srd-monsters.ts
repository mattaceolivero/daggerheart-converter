/**
 * SRD Monster Test Fixtures
 *
 * D&D 5e System Reference Document monsters for testing conversions.
 * These are canonical representations used to validate the conversion pipeline.
 *
 * @module tests/fixtures/srd-monsters
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  SpecialAlignment,
  LawChaosAxis,
  GoodEvilAxis,
  AttackType,
  DnD5eDamageType,
  SenseType,
  AbilityScore,
} from '../../src/models/dnd5e';

// ============================================================================
// CR 1/4 MONSTERS (Tier 1 - Minion candidates)
// ============================================================================

/**
 * Goblin - CR 1/4
 * Classic minion-type creature with Nimble Escape.
 */
export const GOBLIN: DnD5eMonster = {
  name: 'Goblin',
  size: CreatureSize.SMALL,
  creatureType: CreatureType.HUMANOID,
  subtypes: ['goblinoid'],
  alignment: {
    lawChaos: LawChaosAxis.NEUTRAL,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 15, armorType: 'leather armor, shield' },
  hitPoints: {
    average: 7,
    formula: { count: 2, dieSize: 6, modifier: 0 },
  },
  speed: { walk: 30 },
  abilityScores: {
    STR: 8,
    DEX: 14,
    CON: 10,
    INT: 10,
    WIS: 8,
    CHA: 8,
  },
  skills: [{ skill: 'Stealth' as any, modifier: 6 }],
  senses: {
    specialSenses: [{ type: SenseType.DARKVISION, range: 60 }],
    passivePerception: 9,
  },
  languages: ['Common', 'Goblin'],
  challengeRating: { cr: '1/4', xp: 50 },
  proficiencyBonus: 2,
  traits: [
    {
      name: 'Nimble Escape',
      description:
        'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.',
    },
  ],
  attacks: [
    {
      name: 'Scimitar',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 4,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 6, modifier: 2 },
        damageType: DnD5eDamageType.SLASHING,
      },
    },
    {
      name: 'Shortbow',
      attackType: AttackType.RANGED_WEAPON,
      toHit: 4,
      range: { normal: 80, long: 320 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 6, modifier: 2 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
  ],
};

/**
 * Wolf - CR 1/4
 * Beast with Pack Tactics trait.
 */
export const WOLF: DnD5eMonster = {
  name: 'Wolf',
  size: CreatureSize.MEDIUM,
  creatureType: CreatureType.BEAST,
  alignment: SpecialAlignment.UNALIGNED,
  armorClass: { value: 13, armorType: 'natural armor' },
  hitPoints: {
    average: 11,
    formula: { count: 2, dieSize: 8, modifier: 2 },
  },
  speed: { walk: 40 },
  abilityScores: {
    STR: 12,
    DEX: 15,
    CON: 12,
    INT: 3,
    WIS: 12,
    CHA: 6,
  },
  skills: [
    { skill: 'Perception' as any, modifier: 3 },
    { skill: 'Stealth' as any, modifier: 4 },
  ],
  senses: {
    specialSenses: [],
    passivePerception: 13,
  },
  languages: [],
  challengeRating: { cr: '1/4', xp: 50 },
  proficiencyBonus: 2,
  traits: [
    {
      name: 'Keen Hearing and Smell',
      description:
        'The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.',
    },
    {
      name: 'Pack Tactics',
      description:
        "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally isn't incapacitated.",
    },
  ],
  attacks: [
    {
      name: 'Bite',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 4,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 4, modifier: 2 },
        damageType: DnD5eDamageType.PIERCING,
      },
      additionalEffects:
        'If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone.',
    },
  ],
};

/**
 * Skeleton - CR 1/4
 * Undead with damage vulnerabilities.
 */
export const SKELETON: DnD5eMonster = {
  name: 'Skeleton',
  size: CreatureSize.MEDIUM,
  creatureType: CreatureType.UNDEAD,
  alignment: {
    lawChaos: LawChaosAxis.LAWFUL,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 13, armorType: 'armor scraps' },
  hitPoints: {
    average: 13,
    formula: { count: 2, dieSize: 8, modifier: 4 },
  },
  speed: { walk: 30 },
  abilityScores: {
    STR: 10,
    DEX: 14,
    CON: 15,
    INT: 6,
    WIS: 8,
    CHA: 5,
  },
  damageModifiers: {
    vulnerabilities: [{ damageType: DnD5eDamageType.BLUDGEONING }],
    resistances: [],
    immunities: [{ damageType: DnD5eDamageType.POISON }],
  },
  conditionImmunities: ['Exhaustion' as any, 'Poisoned' as any],
  senses: {
    specialSenses: [{ type: SenseType.DARKVISION, range: 60 }],
    passivePerception: 9,
  },
  languages: ['understands languages it knew in life but cannot speak'],
  challengeRating: { cr: '1/4', xp: 50 },
  proficiencyBonus: 2,
  attacks: [
    {
      name: 'Shortsword',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 4,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 6, modifier: 2 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
    {
      name: 'Shortbow',
      attackType: AttackType.RANGED_WEAPON,
      toHit: 4,
      range: { normal: 80, long: 320 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 6, modifier: 2 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
  ],
};

// ============================================================================
// CR 1/2 MONSTERS (Tier 1 - Standard candidates)
// ============================================================================

/**
 * Orc - CR 1/2
 * Standard bruiser type with Aggressive trait.
 */
export const ORC: DnD5eMonster = {
  name: 'Orc',
  size: CreatureSize.MEDIUM,
  creatureType: CreatureType.HUMANOID,
  subtypes: ['orc'],
  alignment: {
    lawChaos: LawChaosAxis.CHAOTIC,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 13, armorType: 'hide armor' },
  hitPoints: {
    average: 15,
    formula: { count: 2, dieSize: 8, modifier: 6 },
  },
  speed: { walk: 30 },
  abilityScores: {
    STR: 16,
    DEX: 12,
    CON: 16,
    INT: 7,
    WIS: 11,
    CHA: 10,
  },
  skills: [{ skill: 'Intimidation' as any, modifier: 2 }],
  senses: {
    specialSenses: [{ type: SenseType.DARKVISION, range: 60 }],
    passivePerception: 10,
  },
  languages: ['Common', 'Orc'],
  challengeRating: { cr: '1/2', xp: 100 },
  proficiencyBonus: 2,
  traits: [
    {
      name: 'Aggressive',
      description:
        'As a bonus action, the orc can move up to its speed toward a hostile creature that it can see.',
    },
  ],
  attacks: [
    {
      name: 'Greataxe',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 5,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 12, modifier: 3 },
        damageType: DnD5eDamageType.SLASHING,
      },
    },
    {
      name: 'Javelin',
      attackType: AttackType.MELEE_OR_RANGED_WEAPON,
      toHit: 5,
      range: { reach: 5, normal: 30, long: 120 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 6, modifier: 3 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
  ],
};

// ============================================================================
// CR 1 MONSTERS (Tier 1)
// ============================================================================

/**
 * Giant Spider - CR 1
 * Monstrosity with Web ability.
 */
export const GIANT_SPIDER: DnD5eMonster = {
  name: 'Giant Spider',
  size: CreatureSize.LARGE,
  creatureType: CreatureType.BEAST,
  alignment: SpecialAlignment.UNALIGNED,
  armorClass: { value: 14, armorType: 'natural armor' },
  hitPoints: {
    average: 26,
    formula: { count: 4, dieSize: 10, modifier: 4 },
  },
  speed: { walk: 30, climb: 30 },
  abilityScores: {
    STR: 14,
    DEX: 16,
    CON: 12,
    INT: 2,
    WIS: 11,
    CHA: 4,
  },
  skills: [{ skill: 'Stealth' as any, modifier: 7 }],
  senses: {
    specialSenses: [
      { type: SenseType.BLINDSIGHT, range: 10 },
      { type: SenseType.DARKVISION, range: 60 },
    ],
    passivePerception: 10,
  },
  languages: [],
  challengeRating: { cr: 1, xp: 200 },
  proficiencyBonus: 2,
  traits: [
    {
      name: 'Spider Climb',
      description:
        'The spider can climb difficult surfaces, including upside down on ceilings, without needing to make an ability check.',
    },
    {
      name: 'Web Sense',
      description:
        'While in contact with a web, the spider knows the exact location of any other creature in contact with the same web.',
    },
    {
      name: 'Web Walker',
      description:
        'The spider ignores movement restrictions caused by webbing.',
    },
  ],
  attacks: [
    {
      name: 'Bite',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 5,
      range: { reach: 5 },
      target: 'one creature',
      damage: {
        dice: { count: 1, dieSize: 8, modifier: 3 },
        damageType: DnD5eDamageType.PIERCING,
        additionalDamage: [
          {
            dice: { count: 2, dieSize: 8, modifier: 0 },
            damageType: DnD5eDamageType.POISON,
          },
        ],
      },
      additionalEffects:
        'The target must make a DC 11 Constitution saving throw, taking the poison damage on a failed save, or half as much damage on a successful one. If the poison damage reduces the target to 0 hit points, the target is stable but poisoned for 1 hour, even after regaining hit points, and is paralyzed while poisoned in this way.',
    },
  ],
  actions: [
    {
      name: 'Web',
      description:
        "Ranged Weapon Attack: +5 to hit, range 30/60 ft., one creature. Hit: The target is restrained by webbing. As an action, the restrained target can make a DC 12 Strength check, bursting the webbing on a success. The webbing can also be attacked and destroyed (AC 10; hp 5; vulnerability to fire damage; immunity to bludgeoning, poison, and psychic damage).",
      recharge: { minRoll: 5, maxRoll: 6 },
    },
  ],
};

// ============================================================================
// CR 2 MONSTERS (Tier 1-2 boundary)
// ============================================================================

/**
 * Ogre - CR 2
 * Large bruiser, Tier 1 but at the upper edge.
 */
export const OGRE: DnD5eMonster = {
  name: 'Ogre',
  size: CreatureSize.LARGE,
  creatureType: CreatureType.GIANT,
  alignment: {
    lawChaos: LawChaosAxis.CHAOTIC,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 11, armorType: 'hide armor' },
  hitPoints: {
    average: 59,
    formula: { count: 7, dieSize: 10, modifier: 21 },
  },
  speed: { walk: 40 },
  abilityScores: {
    STR: 19,
    DEX: 8,
    CON: 16,
    INT: 5,
    WIS: 7,
    CHA: 7,
  },
  senses: {
    specialSenses: [{ type: SenseType.DARKVISION, range: 60 }],
    passivePerception: 8,
  },
  languages: ['Common', 'Giant'],
  challengeRating: { cr: 2, xp: 450 },
  proficiencyBonus: 2,
  attacks: [
    {
      name: 'Greatclub',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 6,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 8, modifier: 4 },
        damageType: DnD5eDamageType.BLUDGEONING,
      },
    },
    {
      name: 'Javelin',
      attackType: AttackType.MELEE_OR_RANGED_WEAPON,
      toHit: 6,
      range: { reach: 5, normal: 30, long: 120 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 6, modifier: 4 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
  ],
};

// ============================================================================
// CR 3 MONSTERS (Tier 2)
// ============================================================================

/**
 * Owlbear - CR 3
 * Monstrosity with Multiattack.
 */
export const OWLBEAR: DnD5eMonster = {
  name: 'Owlbear',
  size: CreatureSize.LARGE,
  creatureType: CreatureType.MONSTROSITY,
  alignment: SpecialAlignment.UNALIGNED,
  armorClass: { value: 13, armorType: 'natural armor' },
  hitPoints: {
    average: 59,
    formula: { count: 7, dieSize: 10, modifier: 21 },
  },
  speed: { walk: 40 },
  abilityScores: {
    STR: 20,
    DEX: 12,
    CON: 17,
    INT: 3,
    WIS: 12,
    CHA: 7,
  },
  skills: [{ skill: 'Perception' as any, modifier: 3 }],
  senses: {
    specialSenses: [{ type: SenseType.DARKVISION, range: 60 }],
    passivePerception: 13,
  },
  languages: [],
  challengeRating: { cr: 3, xp: 700 },
  proficiencyBonus: 2,
  traits: [
    {
      name: 'Keen Sight and Smell',
      description:
        'The owlbear has advantage on Wisdom (Perception) checks that rely on sight or smell.',
    },
  ],
  multiattack: {
    description: 'The owlbear makes two attacks: one with its beak and one with its claws.',
    attacks: [
      { attackName: 'Beak', count: 1 },
      { attackName: 'Claws', count: 1 },
    ],
  },
  attacks: [
    {
      name: 'Beak',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 7,
      range: { reach: 5 },
      target: 'one creature',
      damage: {
        dice: { count: 1, dieSize: 10, modifier: 5 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
    {
      name: 'Claws',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 7,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 8, modifier: 5 },
        damageType: DnD5eDamageType.SLASHING,
      },
    },
  ],
};

// ============================================================================
// CR 5 MONSTERS (Tier 2)
// ============================================================================

/**
 * Troll - CR 5
 * Giant with Regeneration and fire/acid vulnerability.
 */
export const TROLL: DnD5eMonster = {
  name: 'Troll',
  size: CreatureSize.LARGE,
  creatureType: CreatureType.GIANT,
  alignment: {
    lawChaos: LawChaosAxis.CHAOTIC,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 15, armorType: 'natural armor' },
  hitPoints: {
    average: 84,
    formula: { count: 8, dieSize: 10, modifier: 40 },
  },
  speed: { walk: 30 },
  abilityScores: {
    STR: 18,
    DEX: 13,
    CON: 20,
    INT: 7,
    WIS: 9,
    CHA: 7,
  },
  skills: [{ skill: 'Perception' as any, modifier: 2 }],
  senses: {
    specialSenses: [{ type: SenseType.DARKVISION, range: 60 }],
    passivePerception: 12,
  },
  languages: ['Giant'],
  challengeRating: { cr: 5, xp: 1800 },
  proficiencyBonus: 3,
  traits: [
    {
      name: 'Keen Smell',
      description:
        'The troll has advantage on Wisdom (Perception) checks that rely on smell.',
    },
    {
      name: 'Regeneration',
      description:
        'The troll regains 10 hit points at the start of its turn. If the troll takes acid or fire damage, this trait does not function at the start of the troll\'s next turn. The troll dies only if it starts its turn with 0 hit points and does not regenerate.',
    },
  ],
  multiattack: {
    description:
      'The troll makes three attacks: one with its bite and two with its claws.',
    attacks: [
      { attackName: 'Bite', count: 1 },
      { attackName: 'Claw', count: 2 },
    ],
  },
  attacks: [
    {
      name: 'Bite',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 7,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 1, dieSize: 6, modifier: 4 },
        damageType: DnD5eDamageType.PIERCING,
      },
    },
    {
      name: 'Claw',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 7,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 6, modifier: 4 },
        damageType: DnD5eDamageType.SLASHING,
      },
    },
  ],
};

// ============================================================================
// CR 10 MONSTERS (Tier 3)
// ============================================================================

/**
 * Young Red Dragon - CR 10
 * Dragon with breath weapon and multiattack.
 */
export const YOUNG_RED_DRAGON: DnD5eMonster = {
  name: 'Young Red Dragon',
  size: CreatureSize.LARGE,
  creatureType: CreatureType.DRAGON,
  alignment: {
    lawChaos: LawChaosAxis.CHAOTIC,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 18, armorType: 'natural armor' },
  hitPoints: {
    average: 178,
    formula: { count: 17, dieSize: 10, modifier: 85 },
  },
  speed: { walk: 40, climb: 40, fly: 80 },
  abilityScores: {
    STR: 23,
    DEX: 10,
    CON: 21,
    INT: 14,
    WIS: 11,
    CHA: 19,
  },
  savingThrows: [
    { ability: AbilityScore.DEXTERITY, modifier: 4 },
    { ability: AbilityScore.CONSTITUTION, modifier: 9 },
    { ability: AbilityScore.WISDOM, modifier: 4 },
    { ability: AbilityScore.CHARISMA, modifier: 8 },
  ],
  skills: [
    { skill: 'Perception' as any, modifier: 8 },
    { skill: 'Stealth' as any, modifier: 4 },
  ],
  damageModifiers: {
    vulnerabilities: [],
    resistances: [],
    immunities: [{ damageType: DnD5eDamageType.FIRE }],
  },
  senses: {
    specialSenses: [
      { type: SenseType.BLINDSIGHT, range: 30 },
      { type: SenseType.DARKVISION, range: 120 },
    ],
    passivePerception: 18,
  },
  languages: ['Common', 'Draconic'],
  challengeRating: { cr: 10, xp: 5900 },
  proficiencyBonus: 4,
  multiattack: {
    description:
      'The dragon makes three attacks: one with its bite and two with its claws.',
    attacks: [
      { attackName: 'Bite', count: 1 },
      { attackName: 'Claw', count: 2 },
    ],
  },
  attacks: [
    {
      name: 'Bite',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 10,
      range: { reach: 10 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 10, modifier: 6 },
        damageType: DnD5eDamageType.PIERCING,
        additionalDamage: [
          {
            dice: { count: 1, dieSize: 6, modifier: 0 },
            damageType: DnD5eDamageType.FIRE,
          },
        ],
      },
    },
    {
      name: 'Claw',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 10,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 6, modifier: 6 },
        damageType: DnD5eDamageType.SLASHING,
      },
    },
  ],
  actions: [
    {
      name: 'Fire Breath',
      description:
        'The dragon exhales fire in a 30-foot cone. Each creature in that area must make a DC 17 Dexterity saving throw, taking 56 (16d6) fire damage on a failed save, or half as much damage on a successful one.',
      recharge: { minRoll: 5, maxRoll: 6 },
      savingThrow: { ability: AbilityScore.DEXTERITY, dc: 17 },
      damage: {
        dice: { count: 16, dieSize: 6, modifier: 0 },
        damageType: DnD5eDamageType.FIRE,
      },
      areaOfEffect: { type: 'cone', size: 30 },
    },
  ],
};

// ============================================================================
// CR 17 MONSTERS (Tier 4 - Solo)
// ============================================================================

/**
 * Adult Red Dragon - CR 17
 * Legendary dragon with lair actions.
 */
export const ADULT_RED_DRAGON: DnD5eMonster = {
  name: 'Adult Red Dragon',
  size: CreatureSize.HUGE,
  creatureType: CreatureType.DRAGON,
  alignment: {
    lawChaos: LawChaosAxis.CHAOTIC,
    goodEvil: GoodEvilAxis.EVIL,
  },
  armorClass: { value: 19, armorType: 'natural armor' },
  hitPoints: {
    average: 256,
    formula: { count: 19, dieSize: 12, modifier: 133 },
  },
  speed: { walk: 40, climb: 40, fly: 80 },
  abilityScores: {
    STR: 27,
    DEX: 10,
    CON: 25,
    INT: 16,
    WIS: 13,
    CHA: 21,
  },
  savingThrows: [
    { ability: AbilityScore.DEXTERITY, modifier: 6 },
    { ability: AbilityScore.CONSTITUTION, modifier: 13 },
    { ability: AbilityScore.WISDOM, modifier: 7 },
    { ability: AbilityScore.CHARISMA, modifier: 11 },
  ],
  skills: [
    { skill: 'Perception' as any, modifier: 13 },
    { skill: 'Stealth' as any, modifier: 6 },
  ],
  damageModifiers: {
    vulnerabilities: [],
    resistances: [],
    immunities: [{ damageType: DnD5eDamageType.FIRE }],
  },
  senses: {
    specialSenses: [
      { type: SenseType.BLINDSIGHT, range: 60 },
      { type: SenseType.DARKVISION, range: 120 },
    ],
    passivePerception: 23,
  },
  languages: ['Common', 'Draconic'],
  challengeRating: { cr: 17, xp: 18000 },
  proficiencyBonus: 6,
  legendaryResistance: {
    count: 3,
    description:
      'If the dragon fails a saving throw, it can choose to succeed instead.',
  },
  multiattack: {
    description:
      'The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.',
    attacks: [
      { attackName: 'Bite', count: 1 },
      { attackName: 'Claw', count: 2 },
    ],
  },
  attacks: [
    {
      name: 'Bite',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 14,
      range: { reach: 10 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 10, modifier: 8 },
        damageType: DnD5eDamageType.PIERCING,
        additionalDamage: [
          {
            dice: { count: 2, dieSize: 6, modifier: 0 },
            damageType: DnD5eDamageType.FIRE,
          },
        ],
      },
    },
    {
      name: 'Claw',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 14,
      range: { reach: 5 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 6, modifier: 8 },
        damageType: DnD5eDamageType.SLASHING,
      },
    },
    {
      name: 'Tail',
      attackType: AttackType.MELEE_WEAPON,
      toHit: 14,
      range: { reach: 15 },
      target: 'one target',
      damage: {
        dice: { count: 2, dieSize: 8, modifier: 8 },
        damageType: DnD5eDamageType.BLUDGEONING,
      },
    },
  ],
  actions: [
    {
      name: 'Frightful Presence',
      description:
        'Each creature of the dragon\'s choice that is within 120 feet of the dragon and aware of it must succeed on a DC 19 Wisdom saving throw or become frightened for 1 minute.',
      savingThrow: { ability: AbilityScore.WISDOM, dc: 19 },
    },
    {
      name: 'Fire Breath',
      description:
        'The dragon exhales fire in a 60-foot cone. Each creature in that area must make a DC 21 Dexterity saving throw, taking 63 (18d6) fire damage on a failed save, or half as much damage on a successful one.',
      recharge: { minRoll: 5, maxRoll: 6 },
      savingThrow: { ability: AbilityScore.DEXTERITY, dc: 21 },
      damage: {
        dice: { count: 18, dieSize: 6, modifier: 0 },
        damageType: DnD5eDamageType.FIRE,
      },
      areaOfEffect: { type: 'cone', size: 60 },
    },
  ],
  legendaryActions: {
    count: 3,
    description:
      'The dragon can take 3 legendary actions, choosing from the options below. Only one legendary action option can be used at a time and only at the end of another creature\'s turn. The dragon regains spent legendary actions at the start of its turn.',
    actions: [
      {
        name: 'Detect',
        description: 'The dragon makes a Wisdom (Perception) check.',
        cost: 1,
      },
      {
        name: 'Tail Attack',
        description: 'The dragon makes a tail attack.',
        cost: 1,
      },
      {
        name: 'Wing Attack',
        description:
          'The dragon beats its wings. Each creature within 10 feet of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.',
        cost: 2,
      },
    ],
  },
  lairActions: {
    initiativeCount: 20,
    description:
      'On initiative count 20 (losing initiative ties), the dragon takes a lair action to cause one of the following effects.',
    actions: [
      {
        description:
          'Magma erupts from a point on the ground the dragon can see within 120 feet of it, creating a 20-foot-high, 5-foot-radius geyser. Each creature in the geyser\'s area must make a DC 15 Dexterity saving throw, taking 21 (6d6) fire damage on a failed save, or half as much damage on a successful one.',
      },
      {
        description:
          'A tremor shakes the lair in a 60-foot radius around the dragon. Each creature other than the dragon on the ground in that area must succeed on a DC 15 Dexterity saving throw or be knocked prone.',
      },
      {
        description:
          'Volcanic gases form a cloud in a 20-foot-radius sphere centered on a point the dragon can see within 120 feet of it. The sphere spreads around corners, and its area is lightly obscured. It lasts until initiative count 20 on the next round.',
      },
    ],
  },
};

// ============================================================================
// EXPORT COLLECTION
// ============================================================================

/**
 * Record of all SRD monsters keyed by name.
 */
export const SRD_MONSTERS: Record<string, DnD5eMonster> = {
  Goblin: GOBLIN,
  Wolf: WOLF,
  Skeleton: SKELETON,
  Orc: ORC,
  'Giant Spider': GIANT_SPIDER,
  Ogre: OGRE,
  Owlbear: OWLBEAR,
  Troll: TROLL,
  'Young Red Dragon': YOUNG_RED_DRAGON,
  'Adult Red Dragon': ADULT_RED_DRAGON,
};

/**
 * Monsters grouped by expected Daggerheart tier.
 */
export const MONSTERS_BY_TIER = {
  tier1: [GOBLIN, WOLF, SKELETON, ORC, GIANT_SPIDER, OGRE],
  tier2: [OWLBEAR, TROLL],
  tier3: [YOUNG_RED_DRAGON],
  tier4: [ADULT_RED_DRAGON],
};

/**
 * Monsters grouped by expected classification.
 */
export const MONSTERS_BY_TYPE = {
  minion: [GOBLIN, SKELETON],
  horde: [WOLF], // Pack tactics
  standard: [ORC, GIANT_SPIDER, OGRE],
  bruiser: [OWLBEAR, TROLL],
  solo: [ADULT_RED_DRAGON],
};

/**
 * Get monster names for a specific test category.
 */
export function getMonsterNames(category: keyof typeof MONSTERS_BY_TIER): string[] {
  return MONSTERS_BY_TIER[category].map((m) => m.name);
}
