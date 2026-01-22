/**
 * Construct and Ooze Conversion Specialization
 *
 * Provides specialized handling for constructs and oozes with thematic features.
 * Constructs are artificial creatures (golems, animated objects, homunculi).
 * Oozes are amorphous, often corrosive creatures (gelatinous cubes, puddings).
 *
 * @module constructOozeConversion
 * @version 1.0.0
 */

import { DnD5eMonster, CreatureType, Trait, DnD5eCondition } from '../models/dnd5e';
import {
  Feature,
  FeatureType,
  FeatureCost,
  FeatureCostType,
} from '../models/daggerheart';

// ============================================================================
// EXPORTED INTERFACES
// ============================================================================

/**
 * Result of construct/ooze conversion with thematic features.
 */
export interface ConstructOozeResult {
  /** Whether this is a construct or ooze */
  creatureCategory: 'construct' | 'ooze';
  /** Thematic features derived from creature type */
  thematicFeatures: Feature[];
  /** Derived immunities for the creature */
  immunities: string[];
  /** Special mechanics this creature type has */
  specialMechanics: string[];
}

/**
 * Construct subtype classification.
 */
export type ConstructSubtype = 'golem' | 'animated_object' | 'shield_guardian' | 'homunculus' | 'generic';

/**
 * Ooze subtype classification.
 */
export type OozeSubtype = 'gelatinous_cube' | 'black_pudding' | 'ochre_jelly' | 'gray_ooze' | 'generic';

// ============================================================================
// CONSTRUCT TRAIT DEFINITIONS
// ============================================================================

/**
 * Common construct traits mapped to Daggerheart features.
 */
const CONSTRUCT_COMMON_TRAITS: Array<{
  traitName: string;
  daggerheartName: string;
  type: FeatureType;
  description: string;
  detectionPattern: RegExp;
}> = [
  {
    traitName: 'Constructed Nature',
    daggerheartName: 'Artificial',
    type: FeatureType.PASSIVE,
    description: "This creature is immune to poison, disease, and exhaustion effects. It doesn't need to eat, drink, breathe, or sleep.",
    detectionPattern: /construct(?:ed)?\s*nature|artificial|doesn'?t\s*(?:need\s*to\s*)?(?:eat|drink|breathe|sleep)/i,
  },
  {
    traitName: 'Immutable Form',
    daggerheartName: 'Unchanging',
    type: FeatureType.PASSIVE,
    description: 'This creature is immune to any effect that would alter its form.',
    detectionPattern: /immutable\s*form|immune\s*to\s*(?:any\s*)?(?:spell\s*or\s*)?effect\s*that\s*would\s*alter\s*its\s*form/i,
  },
  {
    traitName: 'Magic Resistance',
    daggerheartName: 'Spell-Warded',
    type: FeatureType.PASSIVE,
    description: 'This creature has advantage on Reaction Rolls against spells and magical effects.',
    detectionPattern: /magic\s*resistance|advantage\s*on\s*saving\s*throws\s*against\s*spells/i,
  },
  {
    traitName: 'Siege Monster',
    daggerheartName: 'Siege Engine',
    type: FeatureType.PASSIVE,
    description: 'This creature deals double damage to objects and structures.',
    detectionPattern: /siege\s*monster|double\s*damage\s*to\s*(?:objects|structures)/i,
  },
  {
    traitName: 'Antimagic Susceptibility',
    daggerheartName: 'Magic Vulnerable',
    type: FeatureType.PASSIVE,
    description: 'This creature is incapacitated when in an antimagic field. If targeted by dispel magic, it must make a Reaction Roll or fall unconscious for 1 minute.',
    detectionPattern: /antimagic\s*susceptibility|incapacitated.*antimagic\s*field/i,
  },
  {
    traitName: 'False Appearance',
    daggerheartName: 'Disguised Form',
    type: FeatureType.PASSIVE,
    description: 'While motionless, this creature is indistinguishable from an ordinary object.',
    detectionPattern: /false\s*appearance|indistinguishable\s*from\s*(?:an?\s*)?(?:ordinary|normal)/i,
  },
];

/**
 * Golem-specific traits.
 */
const GOLEM_TRAITS: Array<{
  name: string;
  description: string;
  type: FeatureType;
  cost?: FeatureCost;
}> = [
  {
    name: 'Golem Durability',
    description: 'This golem is immune to most conditions and cannot be affected by charms or fear.',
    type: FeatureType.PASSIVE,
  },
  {
    name: 'Berserk',
    description: 'If this golem starts its turn with half or fewer hit points, it must succeed on a Reaction Roll or go berserk, attacking the nearest creature.',
    type: FeatureType.PASSIVE,
  },
];

/**
 * Shield Guardian-specific traits.
 */
const SHIELD_GUARDIAN_TRAITS: Array<{
  name: string;
  description: string;
  type: FeatureType;
  cost?: FeatureCost;
  trigger?: { description: string };
}> = [
  {
    name: 'Bound to Amulet',
    description: "The shield guardian is magically bound to an amulet. The guardian knows the distance and direction to the amulet's bearer.",
    type: FeatureType.PASSIVE,
  },
  {
    name: 'Shield',
    description: 'When the amulet bearer takes damage, the guardian can magically take that damage instead.',
    type: FeatureType.REACTION,
    cost: { type: FeatureCostType.STRESS, amount: 1 },
    trigger: { description: 'When the amulet bearer takes damage' },
  },
  {
    name: 'Spell Storing',
    description: 'A spellcaster can store one spell of 4th level or lower in the guardian. The guardian can cast the stored spell on command.',
    type: FeatureType.ACTION,
    cost: { type: FeatureCostType.STRESS, amount: 2 },
  },
];

/**
 * Animated Object size-based features.
 */
const ANIMATED_OBJECT_SIZE_FEATURES: Record<string, {
  name: string;
  description: string;
}> = {
  Tiny: {
    name: 'Tiny Form',
    description: 'This tiny animated object can fit through small openings and is harder to hit.',
  },
  Small: {
    name: 'Nimble Object',
    description: 'This small animated object is quick and can navigate tight spaces.',
  },
  Medium: {
    name: 'Standard Form',
    description: 'This animated object is of normal size and capability.',
  },
  Large: {
    name: 'Imposing Form',
    description: 'This large animated object can knock creatures prone with its attacks.',
  },
  Huge: {
    name: 'Massive Form',
    description: 'This huge animated object can grapple and crush smaller creatures.',
  },
  Gargantuan: {
    name: 'Colossal Form',
    description: 'This gargantuan animated object can demolish structures and crush multiple creatures.',
  },
};

// ============================================================================
// OOZE TRAIT DEFINITIONS
// ============================================================================

/**
 * Common ooze traits mapped to Daggerheart features.
 */
const OOZE_COMMON_TRAITS: Array<{
  traitName: string;
  daggerheartName: string;
  type: FeatureType;
  description: string;
  detectionPattern: RegExp;
  cost?: FeatureCost;
  trigger?: { description: string };
}> = [
  {
    traitName: 'Amorphous',
    daggerheartName: 'Shapeless',
    type: FeatureType.PASSIVE,
    description: 'This creature can squeeze through spaces as narrow as 1 inch without penalty.',
    detectionPattern: /amorphous|move\s*through\s*(?:a\s*)?space\s*as\s*narrow\s*as\s*1\s*inch/i,
  },
  {
    traitName: 'Corrosive Form',
    daggerheartName: 'Acidic Body',
    type: FeatureType.REACTION,
    description: 'When a creature touches this ooze or hits it with a melee attack while within close range, the attacker takes acid damage.',
    detectionPattern: /corrosive\s*(?:form|body)|takes?\s*(?:\d+)?.*acid\s*damage\s*(?:when|if)\s*(?:it\s*)?touch/i,
    cost: { type: FeatureCostType.NONE },
    trigger: { description: 'When hit by a melee attack or touched' },
  },
  {
    traitName: 'Split',
    daggerheartName: 'Division',
    type: FeatureType.REACTION,
    description: 'When hit by slashing or lightning damage while it has more than half its hit points, this creature splits into two new creatures, each with half the remaining hit points.',
    detectionPattern: /split(?:s|ting)?.*(?:slashing|lightning)/i,
    cost: { type: FeatureCostType.STRESS, amount: 2 },
    trigger: { description: 'When hit by slashing or lightning damage while above half HP' },
  },
  {
    traitName: 'Ooze Cube',
    daggerheartName: 'Transparent',
    type: FeatureType.PASSIVE,
    description: 'This creature is nearly invisible when motionless. Creatures that fail to notice it may walk into it.',
    detectionPattern: /transparent|(?:creature|ooze)\s*(?:is\s*)?(?:nearly\s*)?(?:invisible|transparent)/i,
  },
  {
    traitName: 'Engulf',
    daggerheartName: 'Engulf',
    type: FeatureType.ACTION,
    description: 'This creature moves into the space of a creature and forces it to make a Reaction Roll. On failure, the creature is engulfed and takes ongoing damage each round.',
    detectionPattern: /engulf|moves?\s*(?:up\s*to)?\s*(?:its?\s*speed)?.*enters?\s*(?:the\s*)?(?:a\s*)?(?:creature|target)/i,
    cost: { type: FeatureCostType.STRESS, amount: 1 },
  },
];

/**
 * Ooze subtype-specific traits.
 */
const OOZE_SUBTYPE_TRAITS: Record<OozeSubtype, Array<{
  name: string;
  description: string;
  type: FeatureType;
  cost?: FeatureCost;
  trigger?: { description: string };
}>> = {
  gelatinous_cube: [
    {
      name: 'Transparent',
      description: 'While motionless, this cube is nearly invisible. Creatures may walk directly into it.',
      type: FeatureType.PASSIVE,
    },
    {
      name: 'Engulf',
      description: 'The cube moves into creatures and engulfs them, dealing acid damage each round.',
      type: FeatureType.ACTION,
      cost: { type: FeatureCostType.STRESS, amount: 1 },
    },
  ],
  black_pudding: [
    {
      name: 'Corrosive Form',
      description: 'Weapons and armor that touch this pudding are corroded and may be destroyed.',
      type: FeatureType.PASSIVE,
    },
    {
      name: 'Spider Climb',
      description: 'This pudding can climb difficult surfaces, including ceilings.',
      type: FeatureType.PASSIVE,
    },
  ],
  ochre_jelly: [
    {
      name: 'Lightning Immunity',
      description: 'This jelly is immune to lightning damage and instead uses it to split.',
      type: FeatureType.PASSIVE,
    },
    {
      name: 'Spider Climb',
      description: 'This jelly can climb difficult surfaces, including ceilings.',
      type: FeatureType.PASSIVE,
    },
  ],
  gray_ooze: [
    {
      name: 'Metal Corroder',
      description: 'Non-magical metal weapons and armor that touch this ooze corrode. Each hit reduces the effectiveness.',
      type: FeatureType.PASSIVE,
    },
    {
      name: 'False Appearance',
      description: 'While motionless, this ooze looks like an oily pool or wet rock.',
      type: FeatureType.PASSIVE,
    },
  ],
  generic: [],
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Determines if a stat block represents a construct or ooze.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if the creature is a construct or ooze
 *
 * @example
 * ```typescript
 * const ironGolem = parseStatBlock(golemText);
 * if (isConstructOrOoze(ironGolem)) {
 *   const result = convertConstructOrOoze(ironGolem);
 * }
 * ```
 */
export function isConstructOrOoze(statBlock: DnD5eMonster): boolean {
  return (
    statBlock.creatureType === CreatureType.CONSTRUCT ||
    statBlock.creatureType === CreatureType.OOZE
  );
}

/**
 * Determines if a stat block represents a construct.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if the creature is a construct
 */
export function isConstruct(statBlock: DnD5eMonster): boolean {
  return statBlock.creatureType === CreatureType.CONSTRUCT;
}

/**
 * Determines if a stat block represents an ooze.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns True if the creature is an ooze
 */
export function isOoze(statBlock: DnD5eMonster): boolean {
  return statBlock.creatureType === CreatureType.OOZE;
}

/**
 * Detects the construct subtype from name and traits.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Construct subtype classification
 */
export function detectConstructSubtype(statBlock: DnD5eMonster): ConstructSubtype {
  const nameLower = statBlock.name.toLowerCase();
  const traits = statBlock.traits || [];
  const traitText = traits.map(t => `${t.name} ${t.description}`).join(' ').toLowerCase();
  const combined = `${nameLower} ${traitText}`;

  // Check for specific construct types
  if (/golem/.test(nameLower)) {
    return 'golem';
  }

  if (/shield\s*guardian/.test(nameLower)) {
    return 'shield_guardian';
  }

  if (/homunculus/.test(nameLower)) {
    return 'homunculus';
  }

  // Animated objects have "False Appearance" or specific naming patterns
  if (/animated|flying\s*(?:sword|dagger|weapon)|rug\s*of\s*smothering|broom/.test(nameLower) ||
      /false\s*appearance/.test(combined)) {
    return 'animated_object';
  }

  return 'generic';
}

/**
 * Detects the ooze subtype from name and traits.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Ooze subtype classification
 */
export function detectOozeSubtype(statBlock: DnD5eMonster): OozeSubtype {
  const nameLower = statBlock.name.toLowerCase();

  if (/gelatinous\s*cube/.test(nameLower)) {
    return 'gelatinous_cube';
  }

  if (/black\s*pudding/.test(nameLower)) {
    return 'black_pudding';
  }

  if (/ochre\s*jelly/.test(nameLower)) {
    return 'ochre_jelly';
  }

  if (/gray\s*ooze|grey\s*ooze/.test(nameLower)) {
    return 'gray_ooze';
  }

  return 'generic';
}

// ============================================================================
// FEATURE GENERATION FUNCTIONS
// ============================================================================

/**
 * Generates thematic features for a construct.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Array of Daggerheart features
 */
function generateConstructFeatures(statBlock: DnD5eMonster): Feature[] {
  const features: Feature[] = [];
  const traits = statBlock.traits || [];
  const traitText = traits.map(t => `${t.name} ${t.description}`).join(' ');

  // Check for common construct traits
  for (const traitDef of CONSTRUCT_COMMON_TRAITS) {
    if (traitDef.detectionPattern.test(traitText)) {
      features.push({
        name: traitDef.daggerheartName,
        type: traitDef.type,
        description: traitDef.description,
      });
    }
  }

  // Add subtype-specific features
  const subtype = detectConstructSubtype(statBlock);

  switch (subtype) {
    case 'golem':
      // Add golem durability if not already added via common traits
      if (!features.some(f => f.name === 'Artificial')) {
        features.push({
          name: 'Artificial',
          type: FeatureType.PASSIVE,
          description: "This golem is immune to poison, disease, and exhaustion effects. It doesn't need to eat, drink, breathe, or sleep.",
        });
      }

      // Check for berserk trait
      if (/berserk/i.test(traitText)) {
        features.push({
          name: 'Berserk',
          type: FeatureType.PASSIVE,
          description: 'When this golem starts its turn at half HP or less, roll a d6. On a 6, it goes berserk and attacks the nearest creature until destroyed or restored to full HP.',
        });
      }
      break;

    case 'shield_guardian':
      for (const trait of SHIELD_GUARDIAN_TRAITS) {
        const feature: Feature = {
          name: trait.name,
          type: trait.type,
          description: trait.description,
        };
        if (trait.cost) {
          feature.cost = trait.cost;
        }
        if (trait.trigger) {
          feature.trigger = trait.trigger;
        }
        features.push(feature);
      }
      break;

    case 'homunculus':
      features.push({
        name: 'Telepathic Bond',
        type: FeatureType.PASSIVE,
        description: "The homunculus is telepathically linked to its creator. It can communicate telepathically with its creator at any distance, and the creator knows if the homunculus is destroyed.",
      });
      features.push({
        name: 'Fragile',
        type: FeatureType.PASSIVE,
        description: 'This tiny construct has very low hit points and is easily destroyed.',
      });
      break;

    case 'animated_object':
      // Add size-based feature
      const sizeFeature = ANIMATED_OBJECT_SIZE_FEATURES[statBlock.size] ?? ANIMATED_OBJECT_SIZE_FEATURES.Medium;
      if (sizeFeature) {
        features.push({
          name: sizeFeature.name,
          type: FeatureType.PASSIVE,
          description: sizeFeature.description,
        });
      }

      // Check for false appearance
      if (/false\s*appearance/i.test(traitText)) {
        features.push({
          name: 'Disguised Form',
          type: FeatureType.PASSIVE,
          description: 'While motionless, this animated object is indistinguishable from an ordinary object of its type.',
        });
      }
      break;

    case 'generic':
    default:
      // Ensure at least the Artificial trait for all constructs
      if (!features.some(f => f.name === 'Artificial')) {
        features.push({
          name: 'Artificial',
          type: FeatureType.PASSIVE,
          description: "This construct is immune to poison, disease, and exhaustion effects. It doesn't need to eat, drink, breathe, or sleep.",
        });
      }
      break;
  }

  return features;
}

/**
 * Generates thematic features for an ooze.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Array of Daggerheart features
 */
function generateOozeFeatures(statBlock: DnD5eMonster): Feature[] {
  const features: Feature[] = [];
  const traits = statBlock.traits || [];
  const actions = statBlock.actions || [];
  const combinedText = [...traits.map(t => `${t.name} ${t.description}`), ...actions.map(a => `${a.name} ${a.description}`)].join(' ');

  // Check for common ooze traits
  for (const traitDef of OOZE_COMMON_TRAITS) {
    if (traitDef.detectionPattern.test(combinedText)) {
      const feature: Feature = {
        name: traitDef.daggerheartName,
        type: traitDef.type,
        description: traitDef.description,
      };
      if (traitDef.cost) {
        feature.cost = traitDef.cost;
      }
      if (traitDef.trigger) {
        feature.trigger = traitDef.trigger;
      }
      features.push(feature);
    }
  }

  // Add subtype-specific features
  const subtype = detectOozeSubtype(statBlock);
  const subtypeTraits = OOZE_SUBTYPE_TRAITS[subtype];

  for (const trait of subtypeTraits) {
    // Don't add duplicates
    if (!features.some(f => f.name === trait.name)) {
      const feature: Feature = {
        name: trait.name,
        type: trait.type,
        description: trait.description,
      };
      if (trait.cost) {
        feature.cost = trait.cost;
      }
      if (trait.trigger) {
        feature.trigger = trait.trigger;
      }
      features.push(feature);
    }
  }

  // Ensure at least Shapeless for all oozes
  if (!features.some(f => f.name === 'Shapeless')) {
    features.push({
      name: 'Shapeless',
      type: FeatureType.PASSIVE,
      description: 'This creature can squeeze through spaces as narrow as 1 inch without penalty.',
    });
  }

  // All oozes should have mindless trait
  features.push({
    name: 'Mindless',
    type: FeatureType.PASSIVE,
    description: 'This creature is immune to psychic damage and cannot be charmed, frightened, or put to sleep.',
  });

  return features;
}

/**
 * Generates immunities list for a construct.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Array of immunity strings
 */
function generateConstructImmunities(statBlock: DnD5eMonster): string[] {
  const immunities: string[] = [];
  const conditionImmunities = statBlock.conditionImmunities || [];

  // All constructs are typically immune to these
  immunities.push('Poison damage');
  immunities.push('Poisoned condition');

  if (!conditionImmunities.includes(DnD5eCondition.CHARMED)) {
    immunities.push('Charmed condition');
  }

  if (!conditionImmunities.includes(DnD5eCondition.EXHAUSTION)) {
    immunities.push('Exhaustion');
  }

  if (!conditionImmunities.includes(DnD5eCondition.FRIGHTENED)) {
    immunities.push('Frightened condition');
  }

  if (!conditionImmunities.includes(DnD5eCondition.PARALYZED)) {
    immunities.push('Paralyzed condition');
  }

  if (!conditionImmunities.includes(DnD5eCondition.PETRIFIED)) {
    immunities.push('Petrified condition');
  }

  // Add existing damage immunities
  const damageImms = statBlock.damageModifiers?.immunities || [];
  for (const imm of damageImms) {
    if (!immunities.includes(`${imm.damageType} damage`)) {
      immunities.push(`${imm.damageType} damage`);
    }
  }

  return immunities;
}

/**
 * Generates immunities list for an ooze.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Array of immunity strings
 */
function generateOozeImmunities(statBlock: DnD5eMonster): string[] {
  const immunities: string[] = [];

  // All oozes are typically immune to these conditions
  immunities.push('Blinded condition');
  immunities.push('Charmed condition');
  immunities.push('Deafened condition');
  immunities.push('Exhaustion');
  immunities.push('Frightened condition');
  immunities.push('Prone condition');

  // Check for specific damage immunities (like lightning for ochre jelly)
  const subtype = detectOozeSubtype(statBlock);
  if (subtype === 'ochre_jelly') {
    immunities.push('Lightning damage');
    immunities.push('Slashing damage');
  } else if (subtype === 'black_pudding') {
    immunities.push('Acid damage');
    immunities.push('Cold damage');
    immunities.push('Lightning damage');
    immunities.push('Slashing damage');
  }

  // Add existing damage immunities
  const damageImms = statBlock.damageModifiers?.immunities || [];
  for (const imm of damageImms) {
    if (!immunities.includes(`${imm.damageType} damage`)) {
      immunities.push(`${imm.damageType} damage`);
    }
  }

  return immunities;
}

/**
 * Generates special mechanics list for a construct.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Array of special mechanic descriptions
 */
function generateConstructMechanics(statBlock: DnD5eMonster): string[] {
  const mechanics: string[] = [];
  const subtype = detectConstructSubtype(statBlock);
  const traits = statBlock.traits || [];
  const traitText = traits.map(t => `${t.name} ${t.description}`).join(' ');

  // Subtype-specific mechanics
  switch (subtype) {
    case 'golem':
      mechanics.push('May have specific damage immunities based on material (iron, stone, clay, flesh)');
      if (/berserk/i.test(traitText)) {
        mechanics.push('Berserk trigger at low HP');
      }
      if (/aversion/i.test(traitText)) {
        mechanics.push('May have elemental aversion or vulnerability');
      }
      break;

    case 'shield_guardian':
      mechanics.push('Bound to amulet bearer');
      mechanics.push('Can store and cast one spell');
      mechanics.push('Can absorb damage meant for bearer');
      break;

    case 'homunculus':
      mechanics.push('Telepathic bond with creator');
      mechanics.push('Creator is alerted if homunculus dies');
      break;

    case 'animated_object':
      mechanics.push('Size determines combat capability');
      mechanics.push('May have False Appearance trait');
      break;
  }

  // Common construct mechanics
  if (/antimagic/i.test(traitText)) {
    mechanics.push('Vulnerable to antimagic fields');
  }

  if (/magic\s*weapons/i.test(traitText)) {
    mechanics.push('May be resistant to non-magical attacks');
  }

  return mechanics;
}

/**
 * Generates special mechanics list for an ooze.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns Array of special mechanic descriptions
 */
function generateOozeMechanics(statBlock: DnD5eMonster): string[] {
  const mechanics: string[] = [];
  const subtype = detectOozeSubtype(statBlock);
  const traits = statBlock.traits || [];
  const actions = statBlock.actions || [];
  const combinedText = [...traits.map(t => `${t.name} ${t.description}`), ...actions.map(a => `${a.name} ${a.description}`)].join(' ');

  // Common ooze mechanics
  mechanics.push('Can squeeze through tiny spaces');

  if (/split/i.test(combinedText)) {
    mechanics.push('Splits into two creatures when hit by slashing or lightning damage');
  }

  if (/engulf/i.test(combinedText)) {
    mechanics.push('Can engulf creatures for ongoing damage');
  }

  if (/corrosi|dissolve|acid/i.test(combinedText)) {
    mechanics.push('Corrodes weapons and armor on contact');
  }

  // Subtype-specific mechanics
  switch (subtype) {
    case 'gelatinous_cube':
      mechanics.push('Nearly invisible when motionless');
      mechanics.push('Creatures can walk into it accidentally');
      break;

    case 'black_pudding':
      mechanics.push('Destroys metal and wood on contact');
      mechanics.push('Can climb walls and ceilings');
      break;

    case 'ochre_jelly':
      mechanics.push('Lightning causes it to split (not damage)');
      mechanics.push('Can climb walls and ceilings');
      break;

    case 'gray_ooze':
      mechanics.push('Corrodes metal specifically');
      mechanics.push('Looks like oily water when motionless');
      break;
  }

  return mechanics;
}

// ============================================================================
// MAIN CONVERSION FUNCTION
// ============================================================================

/**
 * Converts a construct or ooze stat block to Daggerheart with thematic features.
 *
 * This function provides specialized handling for constructs and oozes,
 * generating appropriate passive features, immunities, and special mechanics
 * based on the creature's type and subtype.
 *
 * @param statBlock - D&D 5e monster stat block
 * @returns ConstructOozeResult with thematic features, immunities, and mechanics
 * @throws Error if the creature is not a construct or ooze
 *
 * @example
 * ```typescript
 * const ironGolem = parseStatBlock(golemText);
 * if (isConstructOrOoze(ironGolem)) {
 *   const result = convertConstructOrOoze(ironGolem);
 *   console.log(result.creatureCategory); // 'construct'
 *   console.log(result.thematicFeatures); // [Artificial, Spell-Warded, ...]
 * }
 * ```
 */
export function convertConstructOrOoze(statBlock: DnD5eMonster): ConstructOozeResult {
  if (!isConstructOrOoze(statBlock)) {
    throw new Error(`Expected construct or ooze, got ${statBlock.creatureType}`);
  }

  const isConstructCreature = isConstruct(statBlock);

  if (isConstructCreature) {
    return {
      creatureCategory: 'construct',
      thematicFeatures: generateConstructFeatures(statBlock),
      immunities: generateConstructImmunities(statBlock),
      specialMechanics: generateConstructMechanics(statBlock),
    };
  } else {
    return {
      creatureCategory: 'ooze',
      thematicFeatures: generateOozeFeatures(statBlock),
      immunities: generateOozeImmunities(statBlock),
      specialMechanics: generateOozeMechanics(statBlock),
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Gets a summary of the construct/ooze conversion for display.
 *
 * @param result - ConstructOozeResult from conversion
 * @returns Human-readable summary string
 */
export function summarizeConstructOozeConversion(result: ConstructOozeResult): string {
  const lines: string[] = [];

  lines.push(`Category: ${result.creatureCategory.charAt(0).toUpperCase() + result.creatureCategory.slice(1)}`);
  lines.push('');

  lines.push(`Thematic Features (${result.thematicFeatures.length}):`);
  for (const feature of result.thematicFeatures) {
    const costStr = feature.cost?.amount ? ` [${feature.cost.amount} Stress]` : '';
    lines.push(`  - ${feature.name} (${feature.type})${costStr}`);
  }
  lines.push('');

  lines.push(`Immunities (${result.immunities.length}):`);
  for (const immunity of result.immunities) {
    lines.push(`  - ${immunity}`);
  }
  lines.push('');

  lines.push(`Special Mechanics (${result.specialMechanics.length}):`);
  for (const mechanic of result.specialMechanics) {
    lines.push(`  - ${mechanic}`);
  }

  return lines.join('\n');
}

/**
 * Merges construct/ooze features with other converted features.
 *
 * @param constructOozeFeatures - Features from construct/ooze conversion
 * @param otherFeatures - Features from standard conversion
 * @returns Merged feature array without duplicates
 */
export function mergeConstructOozeFeatures(
  constructOozeFeatures: Feature[],
  otherFeatures: Feature[]
): Feature[] {
  const merged: Feature[] = [...constructOozeFeatures];
  const existingNames = new Set(constructOozeFeatures.map(f => f.name.toLowerCase()));

  for (const feature of otherFeatures) {
    if (!existingNames.has(feature.name.toLowerCase())) {
      merged.push(feature);
      existingNames.add(feature.name.toLowerCase());
    }
  }

  return merged;
}
