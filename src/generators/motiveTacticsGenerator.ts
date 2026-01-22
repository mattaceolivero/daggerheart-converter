/**
 * Motives and Tactics Generator
 *
 * Generates Daggerheart "Motives" and "Tactics" based on D&D 5e creature type,
 * alignment, abilities, and combat role. Motives describe what drives a creature,
 * while Tactics describe how it behaves in combat.
 *
 * @module motiveTacticsGenerator
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureType,
  LawChaosAxis,
  GoodEvilAxis,
  SpecialAlignment,
  isStandardAlignment,
} from '../models/dnd5e';
import { ClassificationResult, CombatRole } from '../converters/classifyAdversary';
import { AdversaryType } from '../models/daggerheart';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Generated motives and tactics for an adversary.
 */
export interface MotivesAndTactics {
  /** Short verb phrases describing what drives the creature (2-3 items). */
  motives: string[];
  /** Paragraph describing combat behavior and preferred tactics. */
  tactics: string;
  /** Specific combat behaviors as bullet points. */
  combatBehavior: string[];
}

// ============================================================================
// MOTIVE POOLS BY CREATURE TYPE
// ============================================================================

/**
 * Motive pools organized by D&D 5e creature type.
 * Each creature type maps to thematically appropriate motivations.
 */
const CREATURE_TYPE_MOTIVES: Record<CreatureType, string[]> = {
  [CreatureType.ABERRATION]: [
    'Consume minds',
    'Spread corruption',
    'Serve unknowable masters',
    'Gather forbidden knowledge',
    'Open gateways to other realms',
    'Unmake reality',
  ],
  [CreatureType.BEAST]: [
    'Hunt for food',
    'Protect territory',
    'Defend young',
    'Establish dominance',
    'Seek a mate',
    'Survive at all costs',
  ],
  [CreatureType.CELESTIAL]: [
    'Enforce divine will',
    'Protect the innocent',
    'Punish the wicked',
    'Deliver sacred messages',
    'Guard holy sites',
    'Restore balance',
  ],
  [CreatureType.CONSTRUCT]: [
    'Follow orders',
    'Protect designated area',
    'Eliminate intruders',
    'Complete assigned task',
    'Guard treasures',
    'Defend creator',
  ],
  [CreatureType.DRAGON]: [
    'Amass treasure',
    'Dominate territory',
    'Prove superiority',
    'Protect hoard',
    'Establish legacy',
    'Crush rivals',
  ],
  [CreatureType.ELEMENTAL]: [
    'Return to home plane',
    'Fulfill binding contract',
    'Spread elemental influence',
    'Consume opposing elements',
    'Serve summoner',
    'Express primal nature',
  ],
  [CreatureType.FEY]: [
    'Collect debts',
    'Play tricks',
    'Enforce bargains',
    'Pursue obsessions',
    'Steal precious things',
    'Teach lessons',
  ],
  [CreatureType.FIEND]: [
    'Corrupt souls',
    'Collect on bargains',
    'Spread chaos',
    'Establish dominion',
    'Fulfill dark pacts',
    'Drag souls to lower planes',
  ],
  [CreatureType.GIANT]: [
    'Prove strength',
    'Claim territory',
    'Enforce ordning',
    'Gather tribute',
    'Crush the small folk',
    'Build monuments',
  ],
  [CreatureType.HUMANOID]: [
    'Gain wealth',
    'Protect community',
    'Seek revenge',
    'Acquire power',
    'Fulfill duty',
    'Survive',
  ],
  [CreatureType.MONSTROSITY]: [
    'Hunt prey',
    'Defend lair',
    'Spread fear',
    'Consume the weak',
    'Mark territory',
    'Feed insatiable hunger',
  ],
  [CreatureType.OOZE]: [
    'Consume everything',
    'Dissolve matter',
    'Grow larger',
    'Absorb magic',
    'Fill spaces',
    'Digest prey',
  ],
  [CreatureType.PLANT]: [
    'Spread seeds',
    'Protect forest',
    'Consume nutrients',
    'Defend territory',
    'Grow toward light',
    'Entangle intruders',
  ],
  [CreatureType.UNDEAD]: [
    'Drain life force',
    'Guard the tomb',
    'Seek revenge',
    'Serve dark masters',
    'Spread undeath',
    'Fulfill ancient grudge',
  ],
};

// ============================================================================
// ALIGNMENT-BASED MOTIVE MODIFIERS
// ============================================================================

/**
 * Additional motives based on good/evil alignment axis.
 */
const GOOD_EVIL_MOTIVES: Record<GoodEvilAxis, string[]> = {
  [GoodEvilAxis.GOOD]: ['Protect the weak', 'Right wrongs', 'Show mercy'],
  [GoodEvilAxis.NEUTRAL]: ['Maintain balance', 'Preserve self', 'Follow instinct'],
  [GoodEvilAxis.EVIL]: ['Dominate others', 'Inflict suffering', 'Take what is wanted'],
};

/**
 * Additional motives based on law/chaos alignment axis.
 */
const LAW_CHAOS_MOTIVES: Record<LawChaosAxis, string[]> = {
  [LawChaosAxis.LAWFUL]: ['Uphold order', 'Follow code', 'Honor agreements'],
  [LawChaosAxis.NEUTRAL]: ['Act pragmatically', 'Adapt to situation', 'Seek advantage'],
  [LawChaosAxis.CHAOTIC]: ['Defy authority', 'Act unpredictably', 'Embrace freedom'],
};

// ============================================================================
// TACTICS BY COMBAT ROLE
// ============================================================================

/**
 * Tactical descriptions by combat role.
 */
const ROLE_TACTICS: Record<CombatRole, { tactics: string; behaviors: string[] }> = {
  Artillery: {
    tactics:
      'Prefers to attack from a safe distance, using ranged attacks or spells to whittle down enemies. Will reposition to maintain range and seek high ground or cover when available.',
    behaviors: [
      'Opens with most powerful ranged attack',
      'Retreats when enemies close distance',
      'Prioritizes targets that threaten its position',
      'Uses terrain for cover between attacks',
    ],
  },
  Bruiser: {
    tactics:
      'Charges directly at the strongest-looking opponent, using raw power to overwhelm defenses. Prefers straightforward combat and power attacks over subtlety.',
    behaviors: [
      'Engages the most threatening foe first',
      'Uses powerful attacks even if risky',
      'Ignores minor threats to focus on primary target',
      'Refuses to retreat until severely wounded',
    ],
  },
  Skirmisher: {
    tactics:
      'Employs hit-and-run tactics, striking vulnerable targets before withdrawing. Excels at exploiting openings and isolating weaker enemies from their allies.',
    behaviors: [
      'Targets isolated or weakened enemies',
      'Disengages after landing hits',
      'Uses mobility to avoid being surrounded',
      'Exploits flanking opportunities',
    ],
  },
  Controller: {
    tactics:
      'Focuses on controlling the battlefield through area effects, conditions, and positioning. Seeks to disable multiple threats simultaneously while allies capitalize.',
    behaviors: [
      'Opens with area control abilities',
      'Prioritizes disabling the most dangerous foe',
      'Creates choke points and hazards',
      'Maintains distance from melee combatants',
    ],
  },
  Support: {
    tactics:
      'Stays behind front-line combatants, providing healing, buffs, and tactical advantages. Prioritizes keeping allies effective over dealing damage directly.',
    behaviors: [
      'Heals allies before they fall',
      'Buffs strongest allies first',
      'Avoids direct combat when possible',
      'Removes debilitating conditions from allies',
    ],
  },
  Leader: {
    tactics:
      'Directs other combatants and coordinates attacks. Uses tactical commands to enhance ally effectiveness while contributing moderate damage of its own.',
    behaviors: [
      'Issues commands at start of combat',
      'Positions to oversee the battlefield',
      'Rallies demoralized allies',
      'Focuses fire on priority targets',
    ],
  },
};

// ============================================================================
// ADVERSARY TYPE TACTICS
// ============================================================================

/**
 * Tactical behaviors by adversary type.
 */
const TYPE_TACTICS: Partial<Record<AdversaryType, { tactics: string; behaviors: string[] }>> = {
  [AdversaryType.MINION]: {
    tactics:
      'Swarms enemies in groups, relying on numbers rather than individual prowess. Individual minions are expendable and will sacrifice themselves to create openings.',
    behaviors: [
      'Attacks in coordinated groups',
      'Surrounds isolated targets',
      'Attempts to overwhelm through numbers',
      'Flees when the group is broken',
    ],
  },
  [AdversaryType.SOLO]: {
    tactics:
      'Fights as a one-creature army, using legendary capabilities to take multiple actions and resist debilitating effects. Expects to face multiple opponents and plans accordingly.',
    behaviors: [
      'Uses legendary actions to maintain pressure',
      'Saves resistances for critical saves',
      'Attacks multiple targets each round',
      'Fights to the death if cornered',
    ],
  },
  [AdversaryType.HORDE]: {
    tactics:
      'Acts as a unified group, growing weaker as members fall but remaining dangerous. The group moves and attacks together, overwhelming individual defenders.',
    behaviors: [
      'Moves as a cohesive unit',
      'Focuses attacks on single target',
      'Becomes desperate when reduced',
      'Breaks and scatters when severely damaged',
    ],
  },
  [AdversaryType.SWARM]: {
    tactics:
      'Envelops and overwhelms targets through sheer numbers. Individual members are irrelevant; only the swarm matters. Resistant to single-target attacks.',
    behaviors: [
      'Engulfs nearest target',
      'Ignores attacks that kill individual members',
      'Spreads to cover area when pursuing',
      'Contracts when damaged by area effects',
    ],
  },
};

// ============================================================================
// ABILITY-BASED TACTIC DETECTION
// ============================================================================

/**
 * Keywords that suggest specific tactical behaviors.
 */
interface TacticMapping {
  keywords: string[];
  behavior: string;
}

const ABILITY_TACTIC_MAPPINGS: TacticMapping[] = [
  {
    keywords: ['pack tactics', 'pack'],
    behavior: 'Coordinates attacks with allies for advantage',
  },
  {
    keywords: ['sneak attack', 'ambush', 'surprise'],
    behavior: 'Seeks to attack from ambush or while hidden',
  },
  {
    keywords: ['multiattack', 'multiple attacks'],
    behavior: 'Unleashes multiple attacks each round',
  },
  {
    keywords: ['flyby', 'fly', 'flight'],
    behavior: 'Uses aerial mobility to stay out of reach',
  },
  {
    keywords: ['regenerat'],
    behavior: 'Fights aggressively knowing it can recover',
  },
  {
    keywords: ['swallow', 'engulf', 'absorb'],
    behavior: 'Attempts to swallow or engulf smaller targets',
  },
  {
    keywords: ['frightful presence', 'fear', 'frighten'],
    behavior: 'Opens with fear effects to scatter enemies',
  },
  {
    keywords: ['breath weapon', 'breath'],
    behavior: 'Positions for maximum breath weapon coverage',
  },
  {
    keywords: ['grapple', 'grab', 'constrict'],
    behavior: 'Seizes targets and restricts their movement',
  },
  {
    keywords: ['poison', 'venom', 'toxic'],
    behavior: 'Relies on poison to weaken targets over time',
  },
  {
    keywords: ['charm', 'dominate', 'command'],
    behavior: 'Attempts to turn enemies against each other',
  },
  {
    keywords: ['teleport', 'blink', 'dimension'],
    behavior: 'Uses teleportation to reposition tactically',
  },
  {
    keywords: ['invisib', 'hide', 'stealth'],
    behavior: 'Attacks from concealment when possible',
  },
  {
    keywords: ['web', 'entangle', 'restrain'],
    behavior: 'Immobilizes targets before attacking',
  },
  {
    keywords: ['spellcasting', 'innate spellcasting'],
    behavior: 'Leads with most impactful spells',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gathers all text from a monster's abilities for keyword analysis.
 * @param statBlock - The D&D 5e monster stat block
 * @returns Combined text from all abilities (lowercase)
 */
function gatherAbilityText(statBlock: DnD5eMonster): string {
  const texts: string[] = [];

  // Collect trait names and descriptions
  if (statBlock.traits) {
    for (const trait of statBlock.traits) {
      texts.push(trait.name, trait.description);
    }
  }

  // Collect action names and descriptions
  if (statBlock.actions) {
    for (const action of statBlock.actions) {
      texts.push(action.name, action.description);
    }
  }

  // Collect attack names and additional effects
  if (statBlock.attacks) {
    for (const attack of statBlock.attacks) {
      texts.push(attack.name);
      if (attack.additionalEffects) {
        texts.push(attack.additionalEffects);
      }
    }
  }

  // Collect multiattack description
  if (statBlock.multiattack) {
    texts.push(statBlock.multiattack.description);
  }

  // Collect reaction names and descriptions
  if (statBlock.reactions) {
    for (const reaction of statBlock.reactions) {
      texts.push(reaction.name, reaction.description);
    }
  }

  // Collect bonus action names and descriptions
  if (statBlock.bonusActions) {
    for (const bonus of statBlock.bonusActions) {
      texts.push(bonus.name, bonus.description);
    }
  }

  // Collect legendary action names and descriptions
  if (statBlock.legendaryActions) {
    texts.push(statBlock.legendaryActions.description || '');
    for (const action of statBlock.legendaryActions.actions) {
      texts.push(action.name, action.description);
    }
  }

  return texts.join(' ').toLowerCase();
}

/**
 * Detects combat behaviors from ability text using keyword matching.
 * @param abilityText - Combined ability text (lowercase)
 * @returns Array of detected behavior strings
 */
function detectBehaviorsFromAbilities(abilityText: string): string[] {
  const detectedBehaviors: string[] = [];

  for (const mapping of ABILITY_TACTIC_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (abilityText.includes(keyword.toLowerCase())) {
        if (!detectedBehaviors.includes(mapping.behavior)) {
          detectedBehaviors.push(mapping.behavior);
        }
        break; // Only add once per mapping
      }
    }
  }

  return detectedBehaviors;
}

/**
 * Alignment extraction result.
 */
interface AlignmentResult {
  lawChaos?: LawChaosAxis | undefined;
  goodEvil?: GoodEvilAxis | undefined;
}

/**
 * Extracts alignment components from a monster's alignment.
 * @param statBlock - The D&D 5e monster stat block
 * @returns Object with lawChaos and goodEvil axes, or empty if unaligned
 */
function extractAlignment(statBlock: DnD5eMonster): AlignmentResult {
  const alignment = statBlock.alignment;

  if (isStandardAlignment(alignment)) {
    return {
      lawChaos: alignment.lawChaos,
      goodEvil: alignment.goodEvil,
    };
  }

  // Handle special alignments by inferring components
  if (typeof alignment === 'string') {
    const alignmentStr = alignment as SpecialAlignment;
    const result: AlignmentResult = {};

    // Parse "Typically X Y" patterns
    if (alignmentStr.startsWith('Typically ')) {
      const rest = alignmentStr.replace('Typically ', '');

      if (rest.includes('Lawful')) result.lawChaos = LawChaosAxis.LAWFUL;
      else if (rest.includes('Chaotic')) result.lawChaos = LawChaosAxis.CHAOTIC;
      else if (rest.includes('Neutral')) result.lawChaos = LawChaosAxis.NEUTRAL;

      if (rest.includes('Good')) result.goodEvil = GoodEvilAxis.GOOD;
      else if (rest.includes('Evil')) result.goodEvil = GoodEvilAxis.EVIL;
      else if (rest.includes('Neutral')) result.goodEvil = GoodEvilAxis.NEUTRAL;

      return result;
    }

    // Handle "Any X" patterns
    if (alignmentStr.includes('Evil')) {
      result.goodEvil = GoodEvilAxis.EVIL;
      return result;
    }
    if (alignmentStr.includes('Good')) {
      result.goodEvil = GoodEvilAxis.GOOD;
      return result;
    }
    if (alignmentStr.includes('Chaotic')) {
      result.lawChaos = LawChaosAxis.CHAOTIC;
      return result;
    }
    if (alignmentStr.includes('Lawful')) {
      result.lawChaos = LawChaosAxis.LAWFUL;
      return result;
    }
  }

  return {};
}

/**
 * Selects a subset of items, ensuring variety and avoiding duplicates.
 * @param items - Array to select from
 * @param count - Number of items to select
 * @param seed - Optional seed string for deterministic selection
 * @returns Selected subset
 */
function selectSubset<T>(items: T[], count: number, seed?: string): T[] {
  if (items.length <= count) {
    return [...items];
  }

  const selected: T[] = [];
  const available = [...items];

  while (selected.length < count && available.length > 0) {
    const seedValue = seed
      ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Date.now();
    const index = (seedValue + selected.length * 7) % available.length;
    selected.push(available.splice(index, 1)[0]!);
  }

  return selected;
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generates Daggerheart motives and tactics based on creature characteristics.
 *
 * Generation priority for motives:
 * 1. Creature type provides base motive pool
 * 2. Alignment axes add thematic modifiers
 * 3. Ability keywords may suggest specific motives
 *
 * Generation priority for tactics:
 * 1. Combat role determines base tactical approach
 * 2. Adversary type may override with specific behaviors
 * 3. Abilities add specific combat behaviors
 *
 * @param statBlock - The D&D 5e monster stat block
 * @param classification - The adversary classification result
 * @returns Generated motives and tactics
 *
 * @example
 * ```typescript
 * import { generateMotivesAndTactics } from './motiveTacticsGenerator';
 * import { classifyAdversary } from '../converters/classifyAdversary';
 *
 * const classification = classifyAdversary(ancientRedDragon);
 * const result = generateMotivesAndTactics(ancientRedDragon, classification);
 * // {
 * //   motives: ["Amass treasure", "Dominate territory", "Inflict suffering"],
 * //   tactics: "Fights as a one-creature army...",
 * //   combatBehavior: ["Uses legendary actions...", "Positions for breath weapon..."]
 * // }
 * ```
 */
export function generateMotivesAndTactics(
  statBlock: DnD5eMonster,
  classification: ClassificationResult
): MotivesAndTactics {
  // ========== Generate Motives ==========
  const motivePool: string[] = [];
  const usedMotives = new Set<string>();

  const addMotive = (motive: string): void => {
    if (!usedMotives.has(motive)) {
      usedMotives.add(motive);
      motivePool.push(motive);
    }
  };

  // 1. Get base motives from creature type
  const typeMotives = CREATURE_TYPE_MOTIVES[statBlock.creatureType] || [];
  typeMotives.slice(0, 3).forEach(addMotive);

  // 2. Add alignment-based motives
  const alignmentAxes = extractAlignment(statBlock);

  if (alignmentAxes.goodEvil) {
    const geMotives = GOOD_EVIL_MOTIVES[alignmentAxes.goodEvil];
    if (geMotives && geMotives.length > 0) {
      addMotive(geMotives[0]!);
    }
  }

  if (alignmentAxes.lawChaos) {
    const lcMotives = LAW_CHAOS_MOTIVES[alignmentAxes.lawChaos];
    if (lcMotives && lcMotives.length > 0) {
      addMotive(lcMotives[0]!);
    }
  }

  // 3. Add remaining type motives for variety
  typeMotives.slice(3).forEach(addMotive);

  // Select 2-3 final motives
  const finalMotives = selectSubset(motivePool, 3, statBlock.name);

  // ========== Generate Tactics ==========
  let baseTactics = '';
  const combatBehaviors: string[] = [];

  // 1. Check if adversary type has specific tactics
  const typeTactics = TYPE_TACTICS[classification.type];
  if (typeTactics) {
    baseTactics = typeTactics.tactics;
    combatBehaviors.push(...typeTactics.behaviors.slice(0, 2));
  }

  // 2. Add role-based tactics if available
  if (classification.role) {
    const roleTactics = ROLE_TACTICS[classification.role];
    if (roleTactics) {
      if (!baseTactics) {
        baseTactics = roleTactics.tactics;
      }
      // Add role behaviors that aren't duplicates
      for (const behavior of roleTactics.behaviors) {
        if (!combatBehaviors.includes(behavior)) {
          combatBehaviors.push(behavior);
        }
      }
    }
  }

  // 3. Detect additional behaviors from abilities
  const abilityText = gatherAbilityText(statBlock);
  const abilityBehaviors = detectBehaviorsFromAbilities(abilityText);

  for (const behavior of abilityBehaviors) {
    if (!combatBehaviors.includes(behavior)) {
      combatBehaviors.push(behavior);
    }
  }

  // 4. Fallback tactics if none determined
  if (!baseTactics) {
    baseTactics =
      'Engages enemies directly with available attacks. Prioritizes the greatest threat and adapts tactics based on the flow of battle.';
  }

  // Limit combat behaviors to 4 most relevant
  const finalBehaviors = combatBehaviors.slice(0, 4);

  return {
    motives: finalMotives,
    tactics: baseTactics,
    combatBehavior: finalBehaviors,
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Gets all available motives for a creature type.
 * Useful for manual selection or display purposes.
 *
 * @param creatureType - The D&D 5e creature type
 * @returns Array of all motives for that type
 */
export function getMotivesForCreatureType(creatureType: CreatureType): string[] {
  return [...(CREATURE_TYPE_MOTIVES[creatureType] || [])];
}

/**
 * Gets tactical information for a combat role.
 * Useful for understanding role-based behavior.
 *
 * @param role - The combat role
 * @returns Object with tactics description and behaviors, or undefined
 */
export function getTacticsForRole(
  role: CombatRole
): { tactics: string; behaviors: string[] } | undefined {
  const roleTactics = ROLE_TACTICS[role];
  if (roleTactics) {
    return {
      tactics: roleTactics.tactics,
      behaviors: [...roleTactics.behaviors],
    };
  }
  return undefined;
}

/**
 * Gets all alignment-based motives.
 * Useful for understanding how alignment affects motivation.
 *
 * @returns Object with good/evil and law/chaos motive mappings
 */
export function getAlignmentMotives(): {
  goodEvil: Record<GoodEvilAxis, string[]>;
  lawChaos: Record<LawChaosAxis, string[]>;
} {
  return {
    goodEvil: {
      [GoodEvilAxis.GOOD]: [...GOOD_EVIL_MOTIVES[GoodEvilAxis.GOOD]],
      [GoodEvilAxis.NEUTRAL]: [...GOOD_EVIL_MOTIVES[GoodEvilAxis.NEUTRAL]],
      [GoodEvilAxis.EVIL]: [...GOOD_EVIL_MOTIVES[GoodEvilAxis.EVIL]],
    },
    lawChaos: {
      [LawChaosAxis.LAWFUL]: [...LAW_CHAOS_MOTIVES[LawChaosAxis.LAWFUL]],
      [LawChaosAxis.NEUTRAL]: [...LAW_CHAOS_MOTIVES[LawChaosAxis.NEUTRAL]],
      [LawChaosAxis.CHAOTIC]: [...LAW_CHAOS_MOTIVES[LawChaosAxis.CHAOTIC]],
    },
  };
}
