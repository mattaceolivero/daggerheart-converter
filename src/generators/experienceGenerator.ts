/**
 * Experience Topic Generator
 *
 * Generates Daggerheart "Experience" topics based on D&D 5e creature type,
 * abilities, and combat role. Experience represents themes and knowledge
 * players can gain from encounters with this adversary.
 *
 * @module experienceGenerator
 * @version 1.0.0
 */

import { DnD5eMonster, CreatureType, Skill } from '../models/dnd5e';
import { ClassificationResult, CombatRole } from '../converters/classifyAdversary';

// ============================================================================
// TOPIC POOLS BY CREATURE TYPE
// ============================================================================

/**
 * Experience topic pools organized by D&D 5e creature type.
 * Each creature type maps to thematically appropriate knowledge domains.
 */
const CREATURE_TYPE_TOPICS: Record<CreatureType, string[]> = {
  [CreatureType.ABERRATION]: [
    'Cosmic Horror',
    'Alien Minds',
    'Planar Knowledge',
    'Far Realm Lore',
    'Psychic Phenomena',
    'Eldritch Secrets',
  ],
  [CreatureType.BEAST]: [
    'Animal Behavior',
    'Survival',
    'Natural World',
    'Hunting',
    'Tracking',
    'Wildlife',
  ],
  [CreatureType.CELESTIAL]: [
    'Divine Lore',
    'Celestial Planes',
    'Holy Magic',
    'Sacred Rites',
    'Heavenly Hierarchy',
    'Radiant Power',
  ],
  [CreatureType.CONSTRUCT]: [
    'Artifice',
    'Animation Magic',
    'Mechanical Systems',
    'Golem Lore',
    'Arcane Engineering',
    'Created Beings',
  ],
  [CreatureType.DRAGON]: [
    'Draconic Lore',
    'Elemental Power',
    'Ancient History',
    'Dragon Hoards',
    'Wyrm Tactics',
    'Scaled Beasts',
  ],
  [CreatureType.ELEMENTAL]: [
    'Elemental Planes',
    'Primal Forces',
    'Natural Magic',
    'Planar Travel',
    'Elemental Binding',
    'Raw Elements',
  ],
  [CreatureType.FEY]: [
    'Fey Courts',
    'Trickery',
    'Nature Magic',
    'Feywild Customs',
    'Bargains and Oaths',
    'Illusion',
  ],
  [CreatureType.FIEND]: [
    'Infernal Lore',
    'Abyssal Knowledge',
    'Corruption',
    'Dark Bargains',
    'Demon Hierarchy',
    'Hellish Pacts',
  ],
  [CreatureType.GIANT]: [
    'Giant Lore',
    'Ancient Civilizations',
    'Rune Magic',
    'Ordning Hierarchy',
    'Titanic Warfare',
    'Mountain Kingdoms',
  ],
  [CreatureType.HUMANOID]: [
    'Culture',
    'Warfare',
    'Politics',
    'Society',
    'Trade',
    'History',
  ],
  [CreatureType.MONSTROSITY]: [
    'Monster Hunting',
    'Survival',
    'Wilderness',
    'Bestiary Knowledge',
    'Creature Weaknesses',
    'Predator Tactics',
  ],
  [CreatureType.OOZE]: [
    'Dungeon Ecology',
    'Alchemical Knowledge',
    'Hazard Awareness',
    'Acidic Substances',
    'Underground Survival',
    'Strange Organisms',
  ],
  [CreatureType.PLANT]: [
    'Herbalism',
    'Nature',
    'Druidic Lore',
    'Forest Ecology',
    'Botanical Knowledge',
    'Green Magic',
  ],
  [CreatureType.UNDEAD]: [
    'Death Magic',
    'Necromancy',
    'Ancient History',
    'Undead Weaknesses',
    'Spirit World',
    'Tomb Lore',
  ],
};

// ============================================================================
// ABILITY-BASED TOPIC DETECTION
// ============================================================================

/**
 * Keywords that indicate specific experience topics when found in abilities.
 */
interface AbilityTopicMapping {
  keywords: string[];
  topics: string[];
}

const ABILITY_TOPIC_MAPPINGS: AbilityTopicMapping[] = [
  {
    keywords: ['spellcasting', 'spell', 'magic', 'arcane'],
    topics: ['Arcane Knowledge', 'Spellcraft', 'Magical Theory'],
  },
  {
    keywords: ['divine', 'holy', 'sacred', 'blessed'],
    topics: ['Divine Knowledge', 'Sacred Rites'],
  },
  {
    keywords: ['stealth', 'ambush', 'surprise', 'hide', 'invisible'],
    topics: ['Ambush Tactics', 'Stealth Operations', 'Shadow Arts'],
  },
  {
    keywords: ['pack tactics', 'pack', 'swarm', 'horde'],
    topics: ['Pack Behavior', 'Group Combat', 'Swarm Tactics'],
  },
  {
    keywords: ['legendary', 'ancient', 'elder', 'primordial'],
    topics: ['Legendary Tales', 'Historical Events', 'Ancient Lore'],
  },
  {
    keywords: ['poison', 'venom', 'toxic'],
    topics: ['Toxicology', 'Poison Lore', 'Antidotes'],
  },
  {
    keywords: ['fear', 'frighten', 'terrifying', 'dread'],
    topics: ['Terror Tactics', 'Fear Magic', 'Psychological Warfare'],
  },
  {
    keywords: ['charm', 'dominate', 'command', 'compel'],
    topics: ['Mind Control', 'Enchantment Magic', 'Mental Defense'],
  },
  {
    keywords: ['regenerat', 'heal', 'restore'],
    topics: ['Regenerative Magic', 'Healing Lore'],
  },
  {
    keywords: ['shapechange', 'polymorph', 'transform'],
    topics: ['Shapeshifting', 'Transmutation Magic'],
  },
  {
    keywords: ['telepathy', 'telepathic', 'psychic', 'mental'],
    topics: ['Psychic Powers', 'Mental Communication'],
  },
  {
    keywords: ['undead', 'necrotic', 'life drain', 'wither'],
    topics: ['Undeath', 'Necrotic Energy', 'Life Force'],
  },
  {
    keywords: ['fire', 'flame', 'burn', 'inferno'],
    topics: ['Fire Magic', 'Elemental Fire'],
  },
  {
    keywords: ['ice', 'cold', 'frost', 'freeze'],
    topics: ['Ice Magic', 'Elemental Cold'],
  },
  {
    keywords: ['lightning', 'thunder', 'storm', 'electric'],
    topics: ['Storm Magic', 'Elemental Lightning'],
  },
  {
    keywords: ['acid', 'corrosive', 'dissolve'],
    topics: ['Alchemical Knowledge', 'Acidic Substances'],
  },
  {
    keywords: ['web', 'silk', 'spider'],
    topics: ['Spider Lore', 'Web Traps'],
  },
  {
    keywords: ['flight', 'fly', 'wing', 'aerial'],
    topics: ['Aerial Combat', 'Flying Creatures'],
  },
  {
    keywords: ['burrow', 'tunnel', 'underground'],
    topics: ['Underground Navigation', 'Subterranean Creatures'],
  },
  {
    keywords: ['swim', 'aquatic', 'water', 'amphibious'],
    topics: ['Aquatic Survival', 'Sea Creatures'],
  },
];

// ============================================================================
// COMBAT ROLE TOPICS
// ============================================================================

/**
 * Additional topics suggested by combat role classification.
 */
const COMBAT_ROLE_TOPICS: Record<CombatRole, string[]> = {
  Artillery: ['Ranged Warfare', 'Siege Tactics', 'Distance Combat'],
  Bruiser: ['Melee Combat', 'Brute Force', 'Physical Prowess'],
  Skirmisher: ['Hit-and-Run', 'Mobility Tactics', 'Guerrilla Warfare'],
  Controller: ['Battlefield Control', 'Crowd Tactics', 'Area Denial'],
  Support: ['Support Magic', 'Ally Enhancement', 'Protective Wards'],
  Leader: ['Command Structure', 'Military Hierarchy', 'Tactical Leadership'],
};

// ============================================================================
// SKILL-BASED TOPICS
// ============================================================================

/**
 * Topics derived from skill proficiencies.
 */
const SKILL_TOPICS: Partial<Record<Skill, string>> = {
  [Skill.ARCANA]: 'Arcane Knowledge',
  [Skill.HISTORY]: 'Historical Events',
  [Skill.NATURE]: 'Natural World',
  [Skill.RELIGION]: 'Religious Lore',
  [Skill.STEALTH]: 'Stealth Operations',
  [Skill.SURVIVAL]: 'Wilderness Survival',
  [Skill.DECEPTION]: 'Deception Tactics',
  [Skill.INTIMIDATION]: 'Intimidation Methods',
  [Skill.PERSUASION]: 'Negotiation',
  [Skill.PERCEPTION]: 'Keen Awareness',
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Gathers all text from a monster's abilities for keyword analysis.
 * @param statBlock - The D&D 5e monster stat block
 * @returns Combined text from all abilities
 */
function gatherAbilityText(statBlock: DnD5eMonster): string {
  const texts: string[] = [];

  // Collect trait descriptions
  if (statBlock.traits) {
    for (const trait of statBlock.traits) {
      texts.push(trait.name, trait.description);
    }
  }

  // Collect action descriptions
  if (statBlock.actions) {
    for (const action of statBlock.actions) {
      texts.push(action.name, action.description);
    }
  }

  // Collect attack additional effects
  if (statBlock.attacks) {
    for (const attack of statBlock.attacks) {
      texts.push(attack.name);
      if (attack.additionalEffects) {
        texts.push(attack.additionalEffects);
      }
    }
  }

  // Collect reaction descriptions
  if (statBlock.reactions) {
    for (const reaction of statBlock.reactions) {
      texts.push(reaction.name, reaction.description);
    }
  }

  // Collect bonus action descriptions
  if (statBlock.bonusActions) {
    for (const bonus of statBlock.bonusActions) {
      texts.push(bonus.name, bonus.description);
    }
  }

  // Collect legendary action descriptions
  if (statBlock.legendaryActions) {
    for (const action of statBlock.legendaryActions.actions) {
      texts.push(action.name, action.description);
    }
  }

  // Collect mythic action descriptions
  if (statBlock.mythicActions) {
    texts.push(statBlock.mythicActions.trait.name);
    texts.push(statBlock.mythicActions.trait.description);
    for (const action of statBlock.mythicActions.actions) {
      texts.push(action.name, action.description);
    }
  }

  return texts.join(' ').toLowerCase();
}

/**
 * Detects topics from ability text using keyword matching.
 * @param abilityText - Combined ability text (lowercase)
 * @returns Array of detected topics
 */
function detectTopicsFromAbilities(abilityText: string): string[] {
  const detectedTopics: string[] = [];

  for (const mapping of ABILITY_TOPIC_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      if (abilityText.includes(keyword.toLowerCase())) {
        // Add first topic from this mapping (avoid duplicates)
        const topic = mapping.topics[0];
        if (topic && !detectedTopics.includes(topic)) {
          detectedTopics.push(topic);
        }
        break; // Only add one topic per mapping
      }
    }
  }

  return detectedTopics;
}

/**
 * Gets topics from skill proficiencies.
 * @param statBlock - The D&D 5e monster stat block
 * @returns Array of skill-based topics
 */
function getSkillTopics(statBlock: DnD5eMonster): string[] {
  const topics: string[] = [];

  if (statBlock.skills) {
    for (const skillProf of statBlock.skills) {
      const topic = SKILL_TOPICS[skillProf.skill];
      if (topic && !topics.includes(topic)) {
        topics.push(topic);
      }
    }
  }

  return topics;
}

/**
 * Selects a weighted random subset from an array.
 * Prefers earlier items (primary topics) but includes variety.
 * @param items - Array to select from
 * @param count - Number of items to select
 * @param seed - Optional seed for reproducibility (based on monster name)
 * @returns Selected subset
 */
function selectSubset(items: string[], count: number, seed?: string): string[] {
  if (items.length <= count) {
    return [...items];
  }

  // Simple deterministic selection based on seed
  const selected: string[] = [];
  const available = [...items];

  // Always include first item (most relevant)
  if (available.length > 0) {
    selected.push(available.shift()!);
  }

  // Fill remaining slots
  while (selected.length < count && available.length > 0) {
    // Use seed to create pseudo-random but deterministic selection
    const seedValue = seed
      ? seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Date.now();
    const index = (seedValue + selected.length) % available.length;
    selected.push(available.splice(index, 1)[0]!);
  }

  return selected;
}

// ============================================================================
// MAIN GENERATOR FUNCTION
// ============================================================================

/**
 * Generates Daggerheart experience topics based on creature characteristics.
 *
 * Topic selection priority:
 * 1. Creature type provides base topics
 * 2. Ability keywords add specialized topics
 * 3. Combat role adds tactical topics
 * 4. Skill proficiencies add knowledge topics
 *
 * Returns 2-4 thematically appropriate topics.
 *
 * @param statBlock - The D&D 5e monster stat block
 * @param classification - The adversary classification result
 * @returns Array of 2-4 experience topic strings
 *
 * @example
 * ```typescript
 * import { generateExperienceTopics } from './experienceGenerator';
 * import { classifyAdversary } from '../converters/classifyAdversary';
 *
 * const classification = classifyAdversary(ancientRedDragon);
 * const topics = generateExperienceTopics(ancientRedDragon, classification);
 * // ["Draconic Lore", "Elemental Fire", "Legendary Tales", "Ancient History"]
 * ```
 */
export function generateExperienceTopics(
  statBlock: DnD5eMonster,
  classification: ClassificationResult
): string[] {
  const allTopics: string[] = [];
  const usedTopics = new Set<string>();

  // Helper to add unique topics
  const addTopic = (topic: string): void => {
    if (!usedTopics.has(topic)) {
      usedTopics.add(topic);
      allTopics.push(topic);
    }
  };

  // 1. Get base topics from creature type (high priority)
  const typeTopics = CREATURE_TYPE_TOPICS[statBlock.creatureType] || [];
  // Take first 2 type topics as primary
  typeTopics.slice(0, 2).forEach(addTopic);

  // 2. Detect topics from abilities
  const abilityText = gatherAbilityText(statBlock);
  const abilityTopics = detectTopicsFromAbilities(abilityText);
  // Add up to 2 ability-derived topics
  abilityTopics.slice(0, 2).forEach(addTopic);

  // 3. Add combat role topic if classified
  if (classification.role) {
    const roleTopics = COMBAT_ROLE_TOPICS[classification.role];
    if (roleTopics && roleTopics.length > 0) {
      addTopic(roleTopics[0]!);
    }
  }

  // 4. Add skill-based topics
  const skillTopics = getSkillTopics(statBlock);
  // Add up to 1 skill topic
  skillTopics.slice(0, 1).forEach(addTopic);

  // 5. Add legendary topic if applicable
  if (
    statBlock.legendaryActions ||
    statBlock.mythicActions ||
    statBlock.legendaryResistance
  ) {
    addTopic('Legendary Tales');
  }

  // 6. Add subtype-based topics for humanoids
  if (
    statBlock.creatureType === CreatureType.HUMANOID &&
    statBlock.subtypes &&
    statBlock.subtypes.length > 0
  ) {
    // Add culture topic based on subtype
    const subtype = statBlock.subtypes[0]!;
    const cultureTopic = `${subtype.charAt(0).toUpperCase()}${subtype.slice(1)} Culture`;
    addTopic(cultureTopic);
  }

  // Ensure we have at least 2 topics
  if (allTopics.length < 2) {
    // Fallback to additional type topics
    for (const topic of typeTopics.slice(2)) {
      if (!usedTopics.has(topic)) {
        addTopic(topic);
        if (allTopics.length >= 2) break;
      }
    }
  }

  // Limit to 4 topics, select best subset
  return selectSubset(allTopics, 4, statBlock.name);
}

/**
 * Generates experience topics with bonus values.
 * Bonus values are determined by topic relevance and creature power.
 *
 * @param statBlock - The D&D 5e monster stat block
 * @param classification - The adversary classification result
 * @returns Array of experience objects with topic and bonus
 *
 * @example
 * ```typescript
 * const experiences = generateExperienceWithBonuses(dragon, classification);
 * // [{ topic: "Draconic Lore", bonus: 2 }, { topic: "Fire Magic", bonus: 1 }]
 * ```
 */
export function generateExperienceWithBonuses(
  statBlock: DnD5eMonster,
  classification: ClassificationResult
): Array<{ topic: string; bonus: number }> {
  const topics = generateExperienceTopics(statBlock, classification);

  // Determine base bonus from CR
  const cr =
    typeof statBlock.challengeRating.cr === 'string'
      ? parseFloat(statBlock.challengeRating.cr) || 0
      : statBlock.challengeRating.cr;

  let baseBonus: number;
  if (cr >= 17) {
    baseBonus = 3;
  } else if (cr >= 11) {
    baseBonus = 2;
  } else if (cr >= 5) {
    baseBonus = 2;
  } else {
    baseBonus = 1;
  }

  return topics.map((topic, index) => ({
    topic,
    // First topic gets highest bonus, decreasing for subsequent
    bonus: Math.max(1, baseBonus - Math.floor(index / 2)),
  }));
}

/**
 * Gets all available experience topics for a creature type.
 * Useful for manual selection or display purposes.
 *
 * @param creatureType - The D&D 5e creature type
 * @returns Array of all topics for that type
 */
export function getTopicsForCreatureType(creatureType: CreatureType): string[] {
  return [...(CREATURE_TYPE_TOPICS[creatureType] || [])];
}

/**
 * Gets all possible topics from the ability mappings.
 * Useful for understanding what topics might be detected.
 *
 * @returns Array of all ability-derived topics
 */
export function getAllAbilityTopics(): string[] {
  const topics = new Set<string>();
  for (const mapping of ABILITY_TOPIC_MAPPINGS) {
    for (const topic of mapping.topics) {
      topics.add(topic);
    }
  }
  return [...topics];
}
