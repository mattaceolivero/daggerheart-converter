/**
 * Undead Creature Conversion Logic
 *
 * Specialized handling for undead creatures with thematic Daggerheart features.
 * Detects undead subtypes and adds appropriate features, motives, and vulnerabilities.
 *
 * Undead Subtypes and Features:
 * | Subtype   | Key Features                                    |
 * |-----------|------------------------------------------------|
 * | Skeleton  | Vulnerable to bludgeoning, resistant to piercing |
 * | Zombie    | Undead Fortitude, slow but relentless           |
 * | Ghost     | Incorporeal, possession ability                 |
 * | Vampire   | Life drain, charm, regeneration                 |
 * | Lich      | Spellcasting focus, phylactery reference        |
 * | Wight     | Life drain, creates spawn                       |
 * | Mummy     | Mummy rot curse, frightful presence             |
 *
 * @module undeadConversion
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureType,
  DnD5eDamageType,
  DnD5eCondition,
} from '../models/dnd5e';
import {
  Feature,
  FeatureType,
  FeatureCostType,
  Condition,
  Attribute,
} from '../models/daggerheart';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Recognized undead subtypes for specialized conversion.
 */
export type UndeadSubtype =
  | 'skeleton'
  | 'zombie'
  | 'ghost'
  | 'specter'
  | 'wraith'
  | 'vampire'
  | 'vampire_spawn'
  | 'lich'
  | 'wight'
  | 'mummy'
  | 'revenant'
  | 'shadow'
  | 'ghoul'
  | 'ghast'
  | 'banshee'
  | 'death_knight'
  | 'generic_undead';

/**
 * Result of undead-specific conversion.
 */
export interface UndeadConversionResult {
  /** Detected undead subtype */
  undeadType: UndeadSubtype;
  /** Thematic features for this undead type */
  thematicFeatures: Feature[];
  /** Suggested motives appropriate for undead creatures */
  suggestedMotives: string[];
  /** Vulnerabilities this undead type has */
  vulnerabilities: string[];
  /** Notes about the conversion decisions */
  conversionNotes: string[];
}

// ============================================================================
// UNDEAD DETECTION PATTERNS
// ============================================================================

/**
 * Patterns for detecting undead subtypes from name and traits.
 */
const UNDEAD_SUBTYPE_PATTERNS: Array<{
  pattern: RegExp;
  subtype: UndeadSubtype;
}> = [
  { pattern: /\bskeleton\b/i, subtype: 'skeleton' },
  { pattern: /\bzombie\b/i, subtype: 'zombie' },
  { pattern: /\bghost\b/i, subtype: 'ghost' },
  { pattern: /\bspecter\b|\bspectre\b/i, subtype: 'specter' },
  { pattern: /\bwraith\b/i, subtype: 'wraith' },
  { pattern: /\bvampire\s*spawn\b/i, subtype: 'vampire_spawn' },
  { pattern: /\bvampire\b/i, subtype: 'vampire' },
  { pattern: /\blich\b/i, subtype: 'lich' },
  { pattern: /\bwight\b/i, subtype: 'wight' },
  { pattern: /\bmummy\b/i, subtype: 'mummy' },
  { pattern: /\brevenant\b/i, subtype: 'revenant' },
  { pattern: /\bshadow\b/i, subtype: 'shadow' },
  { pattern: /\bghast\b/i, subtype: 'ghast' },
  { pattern: /\bghoul\b/i, subtype: 'ghoul' },
  { pattern: /\bbanshee\b/i, subtype: 'banshee' },
  { pattern: /\bdeath\s*knight\b/i, subtype: 'death_knight' },
];

// ============================================================================
// THEMATIC FEATURES BY SUBTYPE
// ============================================================================

/**
 * Common undead trait: Deathless (Undead Fortitude equivalent).
 */
const DEATHLESS_FEATURE: Feature = {
  name: 'Deathless',
  type: FeatureType.PASSIVE,
  description:
    'When reduced to 0 HP, roll d20. On 10+, remain at 1 HP instead. This ability cannot activate against radiant damage or critical hits.',
  cost: {
    type: FeatureCostType.STRESS,
    amount: 1,
  },
};

/**
 * Unholy Resilience: Resistance to turning/holy effects.
 */
const UNHOLY_RESILIENCE_FEATURE: Feature = {
  name: 'Unholy Resilience',
  type: FeatureType.PASSIVE,
  description:
    'Has advantage on Reaction Rolls against effects that would turn, banish, or destroy undead.',
};

/**
 * Features specific to each undead subtype.
 */
const SUBTYPE_FEATURES: Record<UndeadSubtype, Feature[]> = {
  skeleton: [
    {
      name: 'Brittle Bones',
      type: FeatureType.PASSIVE,
      description:
        'Takes extra damage from bludgeoning attacks. Resistant to piercing damage.',
    },
    {
      name: 'Mindless Servitude',
      type: FeatureType.PASSIVE,
      description:
        'Immune to being charmed, frightened, or mentally influenced. Follows simple commands without question.',
    },
  ],

  zombie: [
    { ...DEATHLESS_FEATURE },
    {
      name: 'Relentless Pursuit',
      type: FeatureType.PASSIVE,
      description:
        'Cannot be stopped by difficult terrain. Always moves toward the nearest living creature it can sense.',
    },
  ],

  ghost: [
    {
      name: 'Incorporeal',
      type: FeatureType.PASSIVE,
      description:
        'Can move through creatures and objects. Takes damage if ending movement inside a solid object.',
    },
    {
      name: 'Possession',
      type: FeatureType.ACTION,
      description:
        'Attempt to possess a humanoid within Melee range. Target makes an Instinct Reaction Roll or becomes possessed.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 2,
      },
      reactionRollAttribute: Attribute.INSTINCT,
    },
    {
      name: 'Ethereal Sight',
      type: FeatureType.PASSIVE,
      description:
        'Can see into the ethereal plane and perceive invisible or hidden spirits.',
    },
  ],

  specter: [
    {
      name: 'Incorporeal',
      type: FeatureType.PASSIVE,
      description:
        'Can move through creatures and objects. Takes damage if ending movement inside a solid object.',
    },
    {
      name: 'Life Drain Touch',
      type: FeatureType.ACTION,
      description:
        'Melee attack that drains life force. On hit, target must make a Strength Reaction Roll or have their maximum HP reduced.',
      reactionRollAttribute: Attribute.STRENGTH,
    },
    {
      name: 'Sunlight Sensitivity',
      type: FeatureType.PASSIVE,
      description:
        'Has disadvantage on attacks and perception while in direct sunlight.',
    },
  ],

  wraith: [
    {
      name: 'Incorporeal',
      type: FeatureType.PASSIVE,
      description:
        'Can move through creatures and objects. Takes damage if ending movement inside a solid object.',
    },
    {
      name: 'Life Drain',
      type: FeatureType.ACTION,
      description:
        'Necrotic attack that drains life force. On hit, target must make a Strength Reaction Roll or have their maximum HP reduced.',
      reactionRollAttribute: Attribute.STRENGTH,
    },
    {
      name: 'Create Specter',
      type: FeatureType.ACTION,
      description:
        'Can raise a humanoid killed by its Life Drain as a specter under its control within 24 hours.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 3,
      },
    },
    {
      name: 'Sunlight Sensitivity',
      type: FeatureType.PASSIVE,
      description:
        'Has disadvantage on attacks and perception while in direct sunlight.',
    },
  ],

  vampire: [
    {
      name: 'Regeneration',
      type: FeatureType.PASSIVE,
      description:
        'Recovers 1 HP at the start of each turn unless damaged by radiant or holy water.',
    },
    {
      name: 'Life Drain Bite',
      type: FeatureType.ACTION,
      description:
        'Bite attack that drains blood and life force. On hit, heals for half the damage dealt and reduces target maximum HP.',
    },
    {
      name: 'Charm Gaze',
      type: FeatureType.ACTION,
      description:
        'Target within Close range must make a Presence Reaction Roll or become charmed until dawn.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
      reactionRollAttribute: Attribute.PRESENCE,
      appliedConditions: [Condition.CHARMED],
    },
    {
      name: 'Shapechanger',
      type: FeatureType.ACTION,
      description:
        'Can transform into a bat, wolf, or mist form. In mist form, immune to nonmagical damage and can pass through tiny spaces.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
    },
    {
      name: 'Vampire Weaknesses',
      type: FeatureType.PASSIVE,
      description:
        'Cannot enter a residence without invitation. Takes damage from running water and sunlight. Staking through heart paralyzes.',
    },
  ],

  vampire_spawn: [
    {
      name: 'Regeneration',
      type: FeatureType.PASSIVE,
      description:
        'Recovers 1 HP at the start of each turn unless damaged by radiant or sunlight.',
    },
    {
      name: 'Life Drain Bite',
      type: FeatureType.ACTION,
      description:
        'Bite attack that drains blood and life force. On hit, heals for half the damage dealt.',
    },
    {
      name: 'Spider Climb',
      type: FeatureType.PASSIVE,
      description:
        'Can climb difficult surfaces including ceilings without needing to make checks.',
    },
    {
      name: 'Vampire Weaknesses',
      type: FeatureType.PASSIVE,
      description:
        'Bound to creator vampire. Takes damage from running water and sunlight. Cannot enter without invitation.',
    },
  ],

  lich: [
    {
      name: 'Rejuvenation',
      type: FeatureType.PASSIVE,
      description:
        'If destroyed while phylactery exists, reforms near the phylactery in 1d10 days with full HP.',
    },
    {
      name: 'Paralyzing Touch',
      type: FeatureType.ACTION,
      description:
        'Melee spell attack. Target must make a Strength Reaction Roll or become incapacitated.',
      reactionRollAttribute: Attribute.STRENGTH,
      appliedConditions: [Condition.INCAPACITATED],
    },
    {
      name: 'Master of Magic',
      type: FeatureType.PASSIVE,
      description:
        'Has mastered arcane arts over centuries. Spellcasting effects are treated as potent versions.',
    },
    {
      name: 'Frightful Presence',
      type: FeatureType.ACTION,
      description:
        'Creatures within Far range must make an Instinct Reaction Roll or become frightened.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
      reactionRollAttribute: Attribute.INSTINCT,
      appliedConditions: [Condition.FRIGHTENED],
    },
  ],

  wight: [
    {
      name: 'Life Drain',
      type: FeatureType.ACTION,
      description:
        'Necrotic touch attack. On hit, target must make a Strength Reaction Roll or have maximum HP reduced until long rest.',
      reactionRollAttribute: Attribute.STRENGTH,
    },
    {
      name: 'Create Zombie',
      type: FeatureType.PASSIVE,
      description:
        'Humanoids slain by Life Drain rise as zombies under the wight\'s control after 24 hours.',
    },
    {
      name: 'Sunlight Sensitivity',
      type: FeatureType.PASSIVE,
      description:
        'Has disadvantage on attacks and perception while in direct sunlight.',
    },
  ],

  mummy: [
    {
      name: 'Mummy Rot',
      type: FeatureType.ACTION,
      description:
        'Cursed touch attack. On hit, target is cursed and cannot heal naturally. The curse persists until removed.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
    },
    {
      name: 'Dreadful Glare',
      type: FeatureType.ACTION,
      description:
        'Target within Close range must make an Instinct Reaction Roll or become frightened. On critical failure, paralyzed.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
      reactionRollAttribute: Attribute.INSTINCT,
      appliedConditions: [Condition.FRIGHTENED],
    },
    {
      name: 'Vulnerability to Fire',
      type: FeatureType.PASSIVE,
      description: 'Takes extra damage from fire attacks.',
    },
  ],

  revenant: [
    {
      name: 'Relentless Vengeance',
      type: FeatureType.PASSIVE,
      description:
        'Cannot be permanently destroyed until vengeance is complete. Reforms in a new body within 24 hours if destroyed.',
    },
    {
      name: 'Vengeful Tracker',
      type: FeatureType.PASSIVE,
      description:
        'Always knows the location of its target of vengeance as long as both are on the same plane.',
    },
    {
      name: 'Fist of Fury',
      type: FeatureType.PASSIVE,
      description:
        'Deals extra damage to the target of its vengeance.',
    },
  ],

  shadow: [
    {
      name: 'Shadow Stealth',
      type: FeatureType.PASSIVE,
      description:
        'While in dim light or darkness, can Hide as a free action. Is Hidden condition in complete darkness.',
    },
    {
      name: 'Strength Drain',
      type: FeatureType.ACTION,
      description:
        'Necrotic touch that drains strength. Target must make a Strength Reaction Roll or suffer temporary strength loss.',
      reactionRollAttribute: Attribute.STRENGTH,
    },
    {
      name: 'Amorphous',
      type: FeatureType.PASSIVE,
      description:
        'Can move through spaces as narrow as 1 inch without squeezing.',
    },
    {
      name: 'Sunlight Weakness',
      type: FeatureType.PASSIVE,
      description:
        'Has disadvantage on all rolls while in sunlight.',
    },
  ],

  ghoul: [
    {
      name: 'Paralyzing Claws',
      type: FeatureType.ACTION,
      description:
        'Claw attack with paralytic touch. Target must make a Strength Reaction Roll or become incapacitated for 1 minute.',
      reactionRollAttribute: Attribute.STRENGTH,
      appliedConditions: [Condition.INCAPACITATED],
    },
    {
      name: 'Carrion Hunger',
      type: FeatureType.PASSIVE,
      description:
        'Heals 1 HP when consuming flesh from a recently deceased creature.',
    },
  ],

  ghast: [
    {
      name: 'Stench',
      type: FeatureType.PASSIVE,
      description:
        'Creatures starting their turn within Melee range must make a Strength Reaction Roll or be sickened until the start of their next turn.',
    },
    {
      name: 'Paralyzing Claws',
      type: FeatureType.ACTION,
      description:
        'Claw attack with paralytic touch. Target must make a Strength Reaction Roll or become incapacitated.',
      reactionRollAttribute: Attribute.STRENGTH,
      appliedConditions: [Condition.INCAPACITATED],
    },
    {
      name: 'Turning Defiance',
      type: FeatureType.PASSIVE,
      description:
        'The ghast and any ghouls within Close range have advantage against turning effects.',
    },
  ],

  banshee: [
    {
      name: 'Incorporeal',
      type: FeatureType.PASSIVE,
      description:
        'Can move through creatures and objects.',
    },
    {
      name: 'Wail',
      type: FeatureType.ACTION,
      description:
        'All creatures within Far range that can hear must make an Instinct Reaction Roll or drop to 0 HP. Can only use once per day.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 3,
      },
      reactionRollAttribute: Attribute.INSTINCT,
    },
    {
      name: 'Horrifying Visage',
      type: FeatureType.ACTION,
      description:
        'Creatures within Close range that can see must make an Instinct Reaction Roll or become frightened.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
      reactionRollAttribute: Attribute.INSTINCT,
      appliedConditions: [Condition.FRIGHTENED],
    },
    {
      name: 'Detect Life',
      type: FeatureType.PASSIVE,
      description:
        'Can sense living creatures within Very Far range.',
    },
  ],

  death_knight: [
    {
      name: 'Magic Resistance',
      type: FeatureType.PASSIVE,
      description:
        'Has advantage on Reaction Rolls against spells and magical effects.',
    },
    {
      name: 'Hellfire Orb',
      type: FeatureType.ACTION,
      description:
        'Hurls magical fire in a 20-foot radius. Targets make an Agility Reaction Roll or take fire and necrotic damage.',
      cost: {
        type: FeatureCostType.STRESS,
        amount: 2,
      },
      reactionRollAttribute: Attribute.AGILITY,
    },
    {
      name: 'Parry',
      type: FeatureType.REACTION,
      description:
        'Adds +2 to evasion against one melee attack.',
      trigger: {
        description: 'When hit by a melee attack',
      },
      cost: {
        type: FeatureCostType.STRESS,
        amount: 1,
      },
    },
    {
      name: 'Undead Fortitude',
      type: FeatureType.PASSIVE,
      description:
        'When reduced to 0 HP, can make a Strength Reaction Roll to remain at 1 HP instead.',
    },
  ],

  generic_undead: [
    { ...UNHOLY_RESILIENCE_FEATURE },
    {
      name: 'Undying Hunger',
      type: FeatureType.PASSIVE,
      description:
        'Driven by an insatiable hunger for life force. Does not need to eat, drink, or breathe.',
    },
  ],
};

// ============================================================================
// MOTIVES BY SUBTYPE
// ============================================================================

/**
 * Thematic motives for each undead subtype.
 */
const SUBTYPE_MOTIVES: Record<UndeadSubtype, string[]> = {
  skeleton: [
    'Obey commands without question',
    'Guard the designated area',
    'Attack the living on sight',
    'Protect the master\'s treasures',
  ],
  zombie: [
    'Consume living flesh',
    'Pursue the living relentlessly',
    'Spread the plague of undeath',
    'Overwhelm through numbers',
  ],
  ghost: [
    'Complete unfinished business',
    'Haunt those who wronged me',
    'Guard my final resting place',
    'Seek release from eternal torment',
    'Possess the living to feel again',
  ],
  specter: [
    'Drain the life from the living',
    'Spread despair and hopelessness',
    'Serve the one who created me',
    'Haunt the place of my death',
  ],
  wraith: [
    'Create more of my kind',
    'Extinguish all life and warmth',
    'Serve the darkness that spawned me',
    'Hunt those who escaped death',
  ],
  vampire: [
    'Feed on mortal blood',
    'Expand my power and influence',
    'Create worthy servants',
    'Maintain the masquerade',
    'Pursue eternal pleasures',
  ],
  vampire_spawn: [
    'Serve my creator faithfully',
    'Feed on mortal blood',
    'Earn my freedom through service',
    'Hunt those my master designates',
  ],
  lich: [
    'Pursue forbidden knowledge',
    'Protect my phylactery at all costs',
    'Achieve ultimate arcane power',
    'Experiment on the living and dead',
    'Build an undead army',
  ],
  wight: [
    'Raise an army of undead thralls',
    'Destroy all life in my domain',
    'Serve the dark lord who created me',
    'Corrupt the land with my presence',
  ],
  mummy: [
    'Protect the sacred tomb',
    'Punish those who disturb my rest',
    'Curse the defilers of holy places',
    'Serve my ancient master',
  ],
  revenant: [
    'Hunt down my killer',
    'Exact vengeance upon the guilty',
    'Stop at nothing until justice is done',
    'Make them suffer as I suffered',
  ],
  shadow: [
    'Drain strength from the living',
    'Spread darkness wherever I go',
    'Create more shadows to join me',
    'Extinguish light and hope',
  ],
  ghoul: [
    'Feast on the dead',
    'Paralyze prey for later consumption',
    'Lurk in graveyards and crypts',
    'Hoard corpses for lean times',
  ],
  ghast: [
    'Lead lesser ghouls in hunts',
    'Feast on fresh corpses',
    'Spread disease and decay',
    'Corrupt holy ground',
  ],
  banshee: [
    'Wail my grief to the world',
    'Destroy those who remind me of my death',
    'Haunt the place of my demise',
    'Punish those who share my killer\'s blood',
  ],
  death_knight: [
    'Atone for my failures through violence',
    'Serve the dark power that raised me',
    'Lead undead armies to conquest',
    'Corrupt other knights to my cause',
  ],
  generic_undead: [
    'Consume life force',
    'Serve the one who raised me',
    'Spread undeath to the living',
    'Guard this cursed place',
    'Destroy all who intrude',
  ],
};

// ============================================================================
// VULNERABILITIES BY SUBTYPE
// ============================================================================

/**
 * Common vulnerabilities for each undead subtype.
 */
const SUBTYPE_VULNERABILITIES: Record<UndeadSubtype, string[]> = {
  skeleton: ['Bludgeoning damage', 'Radiant damage'],
  zombie: ['Radiant damage', 'Fire damage'],
  ghost: ['Radiant damage', 'Holy water', 'Hallowed ground'],
  specter: ['Radiant damage', 'Sunlight'],
  wraith: ['Radiant damage', 'Sunlight'],
  vampire: ['Radiant damage', 'Sunlight', 'Running water', 'Stake through heart', 'Holy symbols'],
  vampire_spawn: ['Radiant damage', 'Sunlight', 'Running water', 'Holy symbols'],
  lich: ['Radiant damage', 'Destruction of phylactery'],
  wight: ['Radiant damage', 'Sunlight'],
  mummy: ['Fire damage', 'Radiant damage'],
  revenant: ['Target of vengeance achieving redemption'],
  shadow: ['Radiant damage', 'Sunlight'],
  ghoul: ['Radiant damage'],
  ghast: ['Radiant damage'],
  banshee: ['Radiant damage', 'Hallowed ground'],
  death_knight: ['Radiant damage', 'Redemption'],
  generic_undead: ['Radiant damage'],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Checks if a stat block represents an undead creature.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if the creature is undead
 *
 * @example
 * ```typescript
 * const zombie: DnD5eMonster = { creatureType: CreatureType.UNDEAD, ... };
 * isUndead(zombie); // true
 * ```
 */
export function isUndead(statBlock: DnD5eMonster): boolean {
  return statBlock.creatureType === CreatureType.UNDEAD;
}

/**
 * Detects the specific undead subtype from name and traits.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Detected undead subtype
 */
export function detectUndeadSubtype(statBlock: DnD5eMonster): UndeadSubtype {
  const name = statBlock.name.toLowerCase();
  const subtypes = statBlock.subtypes?.map((s) => s.toLowerCase()) || [];

  // Check subtypes first
  for (const subtype of subtypes) {
    for (const { pattern, subtype: type } of UNDEAD_SUBTYPE_PATTERNS) {
      if (pattern.test(subtype)) {
        return type;
      }
    }
  }

  // Check name
  for (const { pattern, subtype: type } of UNDEAD_SUBTYPE_PATTERNS) {
    if (pattern.test(name)) {
      return type;
    }
  }

  // Check traits for hints
  if (statBlock.traits) {
    for (const trait of statBlock.traits) {
      const traitText = `${trait.name} ${trait.description}`.toLowerCase();

      // Look for key indicators
      if (/undead fortitude/i.test(traitText)) {
        return 'zombie';
      }
      if (/incorporeal movement/i.test(traitText)) {
        if (/possession/i.test(traitText)) {
          return 'ghost';
        }
        return 'specter';
      }
      if (/life drain/i.test(traitText) && /spawn/i.test(traitText)) {
        return 'wight';
      }
      if (/regenerat/i.test(traitText) && /blood/i.test(traitText)) {
        return 'vampire';
      }
      if (/phylactery|rejuvenat/i.test(traitText)) {
        return 'lich';
      }
    }
  }

  return 'generic_undead';
}

/**
 * Checks if the undead has the Undead Fortitude trait.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if has Undead Fortitude
 */
function hasUndeadFortitude(statBlock: DnD5eMonster): boolean {
  if (!statBlock.traits) return false;

  return statBlock.traits.some(
    (trait) =>
      /undead fortitude/i.test(trait.name) ||
      /undead fortitude/i.test(trait.description)
  );
}

/**
 * Checks if the undead is incorporeal.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if incorporeal
 */
function isIncorporeal(statBlock: DnD5eMonster): boolean {
  if (!statBlock.traits) return false;

  return statBlock.traits.some(
    (trait) =>
      /incorporeal/i.test(trait.name) ||
      /incorporeal movement/i.test(trait.description)
  );
}

/**
 * Gets additional features based on the creature's traits.
 *
 * @param statBlock - D&D 5e monster stat block
 * @param subtype - Detected undead subtype
 * @returns Additional features to add
 */
function getAdditionalFeatures(
  statBlock: DnD5eMonster,
  subtype: UndeadSubtype
): Feature[] {
  const features: Feature[] = [];

  // Add Deathless if creature has Undead Fortitude but subtype doesn't include it
  if (hasUndeadFortitude(statBlock) && !['zombie'].includes(subtype)) {
    features.push({ ...DEATHLESS_FEATURE });
  }

  // Add Unholy Resilience if not already present in subtype features
  const subtypeFeatureNames = SUBTYPE_FEATURES[subtype].map((f) =>
    f.name.toLowerCase()
  );
  if (
    !subtypeFeatureNames.includes('unholy resilience') &&
    subtype !== 'generic_undead'
  ) {
    // High-tier undead get Unholy Resilience
    const cr = statBlock.challengeRating.cr;
    const numericCR =
      typeof cr === 'string'
        ? cr.includes('/')
          ? eval(cr)
          : parseFloat(cr)
        : cr;
    if (numericCR >= 5) {
      features.push({ ...UNHOLY_RESILIENCE_FEATURE });
    }
  }

  // Check for Turn Resistance/Immunity in original traits
  if (statBlock.traits) {
    for (const trait of statBlock.traits) {
      if (/turn resistance|turn immunity/i.test(trait.name)) {
        features.push({
          name: 'Turn Resistance',
          type: FeatureType.PASSIVE,
          description:
            'Has advantage on Reaction Rolls against effects that turn undead.',
        });
        break;
      }
    }
  }

  return features;
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts an undead D&D 5e creature to include thematic Daggerheart features.
 *
 * This function:
 * 1. Detects the specific undead subtype
 * 2. Adds appropriate thematic features
 * 3. Generates suggested motives
 * 4. Lists relevant vulnerabilities
 *
 * @param statBlock - D&D 5e monster stat block (must be undead)
 * @returns Undead conversion result with features, motives, and vulnerabilities
 *
 * @example
 * ```typescript
 * const zombie: DnD5eMonster = {
 *   name: "Zombie",
 *   creatureType: CreatureType.UNDEAD,
 *   // ... other stats
 * };
 *
 * const result = convertUndead(zombie);
 * // result.undeadType: "zombie"
 * // result.thematicFeatures: [Deathless, Relentless Pursuit]
 * // result.suggestedMotives: ["Consume living flesh", ...]
 * // result.vulnerabilities: ["Radiant damage", "Fire damage"]
 * ```
 */
export function convertUndead(statBlock: DnD5eMonster): UndeadConversionResult {
  if (!isUndead(statBlock)) {
    return {
      undeadType: 'generic_undead',
      thematicFeatures: [],
      suggestedMotives: [],
      vulnerabilities: [],
      conversionNotes: ['Creature is not undead - no conversion performed'],
    };
  }

  const subtype = detectUndeadSubtype(statBlock);
  const conversionNotes: string[] = [];

  conversionNotes.push(`Detected undead subtype: ${subtype}`);

  // Get base features for this subtype
  const thematicFeatures: Feature[] = [...SUBTYPE_FEATURES[subtype]];
  conversionNotes.push(
    `Added ${thematicFeatures.length} base features for ${subtype}`
  );

  // Get additional features based on traits
  const additionalFeatures = getAdditionalFeatures(statBlock, subtype);
  if (additionalFeatures.length > 0) {
    thematicFeatures.push(...additionalFeatures);
    conversionNotes.push(
      `Added ${additionalFeatures.length} additional features from traits`
    );
  }

  // Get motives
  const suggestedMotives = [...SUBTYPE_MOTIVES[subtype]];

  // Get vulnerabilities
  const vulnerabilities = [...SUBTYPE_VULNERABILITIES[subtype]];

  // Check original damage vulnerabilities and add to list
  if (statBlock.damageModifiers?.vulnerabilities) {
    for (const vuln of statBlock.damageModifiers.vulnerabilities) {
      const vulnStr = vuln.damageType.toString();
      if (!vulnerabilities.some((v) => v.toLowerCase().includes(vulnStr.toLowerCase()))) {
        vulnerabilities.push(`${vulnStr} damage`);
        conversionNotes.push(`Added original vulnerability: ${vulnStr}`);
      }
    }
  }

  return {
    undeadType: subtype,
    thematicFeatures,
    suggestedMotives,
    vulnerabilities,
    conversionNotes,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets the display name for an undead subtype.
 *
 * @param subtype - Undead subtype
 * @returns Human-readable name
 */
export function getUndeadSubtypeName(subtype: UndeadSubtype): string {
  const names: Record<UndeadSubtype, string> = {
    skeleton: 'Skeleton',
    zombie: 'Zombie',
    ghost: 'Ghost',
    specter: 'Specter',
    wraith: 'Wraith',
    vampire: 'Vampire',
    vampire_spawn: 'Vampire Spawn',
    lich: 'Lich',
    wight: 'Wight',
    mummy: 'Mummy',
    revenant: 'Revenant',
    shadow: 'Shadow',
    ghoul: 'Ghoul',
    ghast: 'Ghast',
    banshee: 'Banshee',
    death_knight: 'Death Knight',
    generic_undead: 'Undead',
  };

  return names[subtype];
}

/**
 * Gets all recognized undead subtypes.
 *
 * @returns Array of all undead subtypes
 */
export function getAllUndeadSubtypes(): UndeadSubtype[] {
  return [
    'skeleton',
    'zombie',
    'ghost',
    'specter',
    'wraith',
    'vampire',
    'vampire_spawn',
    'lich',
    'wight',
    'mummy',
    'revenant',
    'shadow',
    'ghoul',
    'ghast',
    'banshee',
    'death_knight',
    'generic_undead',
  ];
}

/**
 * Checks if a subtype is a corporeal undead (has physical body).
 *
 * @param subtype - Undead subtype
 * @returns True if corporeal
 */
export function isCorporealUndead(subtype: UndeadSubtype): boolean {
  const incorporealTypes: UndeadSubtype[] = [
    'ghost',
    'specter',
    'wraith',
    'shadow',
    'banshee',
  ];

  return !incorporealTypes.includes(subtype);
}

/**
 * Checks if a subtype is an intelligent undead (retains memories/personality).
 *
 * @param subtype - Undead subtype
 * @returns True if intelligent
 */
export function isIntelligentUndead(subtype: UndeadSubtype): boolean {
  const intelligentTypes: UndeadSubtype[] = [
    'ghost',
    'vampire',
    'vampire_spawn',
    'lich',
    'wight',
    'mummy',
    'revenant',
    'banshee',
    'death_knight',
  ];

  return intelligentTypes.includes(subtype);
}

/**
 * Checks if a subtype can create spawn/other undead.
 *
 * @param subtype - Undead subtype
 * @returns True if can create spawn
 */
export function canCreateSpawn(subtype: UndeadSubtype): boolean {
  const spawnCreators: UndeadSubtype[] = [
    'vampire',
    'wraith',
    'wight',
    'shadow',
  ];

  return spawnCreators.includes(subtype);
}
