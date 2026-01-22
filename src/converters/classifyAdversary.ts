/**
 * Adversary Type Classification Engine
 *
 * Analyzes D&D 5e monster stat blocks to determine the appropriate
 * Daggerheart adversary type and combat role.
 *
 * @module classifyAdversary
 * @version 1.0.0
 */

import { AdversaryType } from '../models/daggerheart';
import {
  DnD5eMonster,
  AttackType,
  parseCR,
  calculateModifier,
} from '../models/dnd5e';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Combat roles that describe an adversary's tactical function.
 * These are secondary classifications that complement the primary AdversaryType.
 */
export type CombatRole =
  | 'Artillery'
  | 'Bruiser'
  | 'Skirmisher'
  | 'Controller'
  | 'Support'
  | 'Leader';

/**
 * Result of the adversary classification analysis.
 */
export interface ClassificationResult {
  /** Primary adversary type (Solo, Standard, Minion, etc.) */
  type: AdversaryType;
  /** Optional secondary combat role (undefined if not applicable) */
  role?: CombatRole | undefined;
  /** Confidence score from 0.0 to 1.0 */
  confidence: number;
  /** Human-readable explanation of classification reasoning */
  reasoning: string;
}

// ============================================================================
// CLASSIFICATION THRESHOLDS
// ============================================================================

/**
 * CR thresholds for Solo classification.
 * Creatures with legendary actions or CR >= this value are considered Solo.
 */
const SOLO_CR_THRESHOLD = 10;

/**
 * CR threshold below which creatures may be classified as Minions.
 */
const MINION_CR_THRESHOLD = 0.5;

/**
 * HP/CR ratio threshold for Minion classification.
 * Creatures with low HP relative to their CR are more likely to be Minions.
 */
const MINION_HP_RATIO = 7; // Average HP per CR point for weak creatures

/**
 * Keywords that indicate support-type abilities.
 */
const SUPPORT_KEYWORDS = [
  'heal',
  'healing',
  'cure',
  'restore',
  'protect',
  'shield',
  'bless',
  'aid',
  'sanctuary',
  'regenerat',
];

/**
 * Keywords that indicate leader-type abilities.
 */
const LEADER_KEYWORDS = [
  'command',
  'rally',
  'inspire',
  'direct',
  'order',
  'leadership',
  'aura',
  'allies within',
  'friendly creatures',
];

/**
 * Keywords that indicate controller-type abilities.
 */
const CONTROLLER_KEYWORDS = [
  'restrain',
  'grapple',
  'paralyze',
  'stun',
  'frighten',
  'charm',
  'dominate',
  'hold',
  'web',
  'entangle',
  'slow',
  'confusion',
  'hypnotic',
  'sleep',
];

/**
 * Spells that indicate Controller role.
 */
const CONTROLLER_SPELLS = [
  'hold person',
  'hold monster',
  'web',
  'entangle',
  'slow',
  'confusion',
  'hypnotic pattern',
  'fear',
  'dominate',
  'banishment',
  'wall of',
  'grease',
  'sleep',
];

/**
 * Spells that indicate Support role.
 */
const SUPPORT_SPELLS = [
  'cure wounds',
  'healing word',
  'mass cure wounds',
  'heal',
  'regenerate',
  'bless',
  'aid',
  'sanctuary',
  'shield of faith',
  'beacon of hope',
  'greater restoration',
  'lesser restoration',
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalizes CR to a numeric value.
 * @param cr - CR as number or string
 * @returns Numeric CR value
 */
function normalizeCR(cr: number | string): number {
  if (typeof cr === 'string') {
    return parseCR(cr);
  }
  return cr;
}

/**
 * Checks if any text contains keywords from a list.
 * @param text - Text to search
 * @param keywords - Keywords to look for
 * @returns True if any keyword is found
 */
function containsKeywords(text: string, keywords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return keywords.some((keyword) => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Gathers all text from a monster's abilities for keyword analysis.
 * @param monster - The D&D 5e monster
 * @returns Combined text from all abilities
 */
function gatherAbilityText(monster: DnD5eMonster): string {
  const texts: string[] = [];

  // Collect trait descriptions
  if (monster.traits) {
    for (const trait of monster.traits) {
      texts.push(trait.name, trait.description);
    }
  }

  // Collect action descriptions
  if (monster.actions) {
    for (const action of monster.actions) {
      texts.push(action.name, action.description);
    }
  }

  // Collect attack additional effects
  if (monster.attacks) {
    for (const attack of monster.attacks) {
      texts.push(attack.name);
      if (attack.additionalEffects) {
        texts.push(attack.additionalEffects);
      }
    }
  }

  // Collect reaction descriptions
  if (monster.reactions) {
    for (const reaction of monster.reactions) {
      texts.push(reaction.name, reaction.description);
    }
  }

  // Collect bonus action descriptions
  if (monster.bonusActions) {
    for (const bonus of monster.bonusActions) {
      texts.push(bonus.name, bonus.description);
    }
  }

  // Collect legendary action descriptions
  if (monster.legendaryActions) {
    for (const action of monster.legendaryActions.actions) {
      texts.push(action.name, action.description);
    }
  }

  return texts.join(' ');
}

/**
 * Gets all spells from a monster's spellcasting.
 * @param monster - The D&D 5e monster
 * @returns Array of spell names
 */
function getSpellNames(monster: DnD5eMonster): string[] {
  if (!monster.spellcasting) {
    return [];
  }

  const spellNames: string[] = [];

  if (monster.spellcasting.type === 'traditional') {
    const spells = monster.spellcasting.spells;
    const allSpellLists = [
      spells.cantrips,
      spells[1],
      spells[2],
      spells[3],
      spells[4],
      spells[5],
      spells[6],
      spells[7],
      spells[8],
      spells[9],
    ];
    for (const list of allSpellLists) {
      if (list) {
        for (const spell of list) {
          spellNames.push(spell.name.toLowerCase());
        }
      }
    }
  } else {
    const spells = monster.spellcasting.spells;
    const allSpellLists = [
      spells.atWill,
      spells.perDay1,
      spells.perDay2,
      spells.perDay3,
    ];
    for (const list of allSpellLists) {
      if (list) {
        for (const spell of list) {
          spellNames.push(spell.name.toLowerCase());
        }
      }
    }
  }

  return spellNames;
}

/**
 * Counts ranged vs melee attacks.
 * @param monster - The D&D 5e monster
 * @returns Object with ranged and melee attack counts
 */
function countAttackTypes(monster: DnD5eMonster): {
  ranged: number;
  melee: number;
} {
  const counts = { ranged: 0, melee: 0 };

  if (!monster.attacks) {
    return counts;
  }

  for (const attack of monster.attacks) {
    if (
      attack.attackType === AttackType.RANGED_WEAPON ||
      attack.attackType === AttackType.RANGED_SPELL
    ) {
      counts.ranged++;
    } else if (
      attack.attackType === AttackType.MELEE_WEAPON ||
      attack.attackType === AttackType.MELEE_SPELL
    ) {
      counts.melee++;
    } else {
      // Mixed attacks count as both
      counts.ranged += 0.5;
      counts.melee += 0.5;
    }
  }

  return counts;
}

// ============================================================================
// PRIMARY TYPE CLASSIFICATION
// ============================================================================

/**
 * Determines if a monster should be classified as a Solo adversary.
 * @param monster - The D&D 5e monster
 * @param cr - Numeric CR value
 * @returns Object with result and reasoning
 */
function checkSolo(
  monster: DnD5eMonster,
  cr: number
): { isSolo: boolean; reason: string } {
  // Check for legendary actions (strongest indicator)
  if (monster.legendaryActions && monster.legendaryActions.actions.length > 0) {
    return {
      isSolo: true,
      reason: `Has ${monster.legendaryActions.actions.length} legendary actions`,
    };
  }

  // Check for mythic actions
  if (monster.mythicActions && monster.mythicActions.actions.length > 0) {
    return {
      isSolo: true,
      reason: 'Has mythic actions',
    };
  }

  // Check for legendary resistance
  if (monster.legendaryResistance && monster.legendaryResistance.count > 0) {
    return {
      isSolo: true,
      reason: `Has Legendary Resistance (${monster.legendaryResistance.count}/day)`,
    };
  }

  // Check for lair actions (strong indicator of boss status)
  if (monster.lairActions && monster.lairActions.actions.length > 0) {
    return {
      isSolo: true,
      reason: 'Has lair actions indicating boss encounter',
    };
  }

  // High CR creatures without legendary abilities might still be Solo
  if (cr >= SOLO_CR_THRESHOLD) {
    return {
      isSolo: true,
      reason: `High CR (${cr}) indicates powerful solo threat`,
    };
  }

  return { isSolo: false, reason: '' };
}

/**
 * Determines if a monster should be classified as a Swarm.
 * @param monster - The D&D 5e monster
 * @returns Object with result and reasoning
 */
function checkSwarm(monster: DnD5eMonster): { isSwarm: boolean; reason: string } {
  // Check subtypes for "swarm"
  if (monster.subtypes) {
    const hasSwarmSubtype = monster.subtypes.some(
      (subtype) => subtype.toLowerCase() === 'swarm'
    );
    if (hasSwarmSubtype) {
      return { isSwarm: true, reason: 'Creature type includes "swarm" subtype' };
    }
  }

  // Check name for "swarm of"
  if (monster.name.toLowerCase().includes('swarm of')) {
    return { isSwarm: true, reason: 'Name indicates swarm creature' };
  }

  // Check traits for swarm-related abilities
  if (monster.traits) {
    for (const trait of monster.traits) {
      const traitText = `${trait.name} ${trait.description}`.toLowerCase();
      if (
        traitText.includes('swarm') &&
        (traitText.includes("can occupy another creature's space") ||
          traitText.includes('swarm has hit point'))
      ) {
        return { isSwarm: true, reason: 'Has swarm-specific traits' };
      }
    }
  }

  return { isSwarm: false, reason: '' };
}

/**
 * Determines if a monster should be classified as a Minion.
 * @param monster - The D&D 5e monster
 * @param cr - Numeric CR value
 * @returns Object with result, confidence, and reasoning
 */
function checkMinion(
  monster: DnD5eMonster,
  cr: number
): { isMinion: boolean; confidence: number; reason: string } {
  // CR 0 creatures are almost always minions
  if (cr === 0) {
    return {
      isMinion: true,
      confidence: 0.9,
      reason: 'CR 0 creature - typically minion-level threat',
    };
  }

  // Very low CR creatures (1/8, 1/4)
  if (cr <= 0.25) {
    return {
      isMinion: true,
      confidence: 0.85,
      reason: `Very low CR (${cr <= 0.125 ? '1/8' : '1/4'}) indicates minion status`,
    };
  }

  // Check HP/CR ratio for weak creatures
  if (cr <= MINION_CR_THRESHOLD) {
    const avgHP = monster.hitPoints.average;
    const hpPerCR = cr > 0 ? avgHP / cr : avgHP;

    if (hpPerCR < MINION_HP_RATIO) {
      return {
        isMinion: true,
        confidence: 0.7,
        reason: `Low HP (${avgHP}) relative to CR suggests minion`,
      };
    }
  }

  return { isMinion: false, confidence: 0, reason: '' };
}

/**
 * Determines if a monster should be classified as a Horde.
 * @param monster - The D&D 5e monster
 * @param cr - Numeric CR value
 * @returns Object with result and reasoning
 */
function checkHorde(
  monster: DnD5eMonster,
  cr: number
): { isHorde: boolean; reason: string } {
  // Check for pack tactics or similar group-based traits
  if (monster.traits) {
    for (const trait of monster.traits) {
      const traitLower = trait.name.toLowerCase();
      if (traitLower.includes('pack tactics') || traitLower.includes('mob')) {
        // Pack tactics creatures at low CR are good horde candidates
        if (cr <= 2) {
          return {
            isHorde: true,
            reason: `Has "${trait.name}" suggesting group combat role`,
          };
        }
      }
    }
  }

  return { isHorde: false, reason: '' };
}

// ============================================================================
// COMBAT ROLE CLASSIFICATION
// ============================================================================

/**
 * Determines the combat role for an adversary.
 * @param monster - The D&D 5e monster
 * @returns Object with role and reasoning
 */
function determineRole(monster: DnD5eMonster): {
  role: CombatRole | undefined;
  confidence: number;
  reason: string;
} {
  const abilityText = gatherAbilityText(monster);
  const spellNames = getSpellNames(monster);
  const attackCounts = countAttackTypes(monster);
  const scores: Record<CombatRole, number> = {
    Artillery: 0,
    Bruiser: 0,
    Skirmisher: 0,
    Controller: 0,
    Support: 0,
    Leader: 0,
  };
  const reasons: string[] = [];

  // === Check for Support role ===
  if (containsKeywords(abilityText, SUPPORT_KEYWORDS)) {
    scores.Support += 2;
    reasons.push('Has healing/protective abilities');
  }
  for (const spell of spellNames) {
    if (SUPPORT_SPELLS.some((s) => spell.includes(s))) {
      scores.Support += 3;
      reasons.push('Has support spells');
      break;
    }
  }

  // === Check for Leader role ===
  if (containsKeywords(abilityText, LEADER_KEYWORDS)) {
    scores.Leader += 3;
    reasons.push('Has command/rally abilities');
  }

  // === Check for Controller role ===
  if (containsKeywords(abilityText, CONTROLLER_KEYWORDS)) {
    scores.Controller += 2;
    reasons.push('Has crowd control abilities');
  }
  for (const spell of spellNames) {
    if (CONTROLLER_SPELLS.some((s) => spell.includes(s))) {
      scores.Controller += 3;
      reasons.push('Has control spells');
      break;
    }
  }

  // === Check for Artillery role ===
  if (attackCounts.ranged > attackCounts.melee) {
    scores.Artillery += 2;
    reasons.push('Primarily ranged attacks');
  }
  // Spellcasters with attack spells
  if (monster.spellcasting) {
    const hasAttackSpells = spellNames.some(
      (s) =>
        s.includes('bolt') ||
        s.includes('fireball') ||
        s.includes('lightning') ||
        s.includes('ray') ||
        s.includes('blast')
    );
    if (hasAttackSpells) {
      scores.Artillery += 2;
      reasons.push('Has offensive spells');
    }
  }

  // === Check for Bruiser role ===
  const strMod = calculateModifier(monster.abilityScores.STR);
  const dexMod = calculateModifier(monster.abilityScores.DEX);

  if (strMod >= 4 && attackCounts.melee > 0) {
    scores.Bruiser += 2;
    reasons.push('High STR with melee attacks');
  }
  // Check for high damage attacks
  if (monster.attacks) {
    for (const attack of monster.attacks) {
      if (attack.damage.dice.dieSize >= 10 || attack.damage.dice.count >= 2) {
        scores.Bruiser += 1;
        reasons.push('Has high-damage attacks');
        break;
      }
    }
  }
  // Multiattack with melee
  if (monster.multiattack && attackCounts.melee > attackCounts.ranged) {
    scores.Bruiser += 1;
    reasons.push('Multiattack focused on melee');
  }

  // === Check for Skirmisher role ===
  if (dexMod >= 3) {
    scores.Skirmisher += 1;
    reasons.push('High DEX suggests mobility');
  }
  // Check for mobility traits
  if (monster.traits) {
    for (const trait of monster.traits) {
      const traitLower = `${trait.name} ${trait.description}`.toLowerCase();
      if (
        traitLower.includes('nimble') ||
        traitLower.includes('evasion') ||
        traitLower.includes('disengage') ||
        traitLower.includes('dash') ||
        traitLower.includes('cunning action')
      ) {
        scores.Skirmisher += 2;
        reasons.push('Has mobility/evasion traits');
        break;
      }
    }
  }
  // High speed indicates skirmisher potential
  if (monster.speed.walk && monster.speed.walk >= 40) {
    scores.Skirmisher += 1;
    reasons.push('Fast movement speed');
  }
  if (monster.speed.fly && monster.speed.fly >= 40) {
    scores.Skirmisher += 1;
    reasons.push('Flight capability for hit-and-run');
  }

  // Find highest scoring role
  let bestRole: CombatRole | undefined;
  let bestScore = 0;

  for (const [role, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestRole = role as CombatRole;
    }
  }

  // Only assign role if score is significant
  if (bestScore >= 2) {
    const relevantReasons = reasons.slice(0, 2).join('; ');
    return {
      role: bestRole,
      confidence: Math.min(bestScore / 6, 1.0),
      reason: relevantReasons,
    };
  }

  return { role: undefined, confidence: 0, reason: '' };
}

// ============================================================================
// MAIN CLASSIFICATION FUNCTION
// ============================================================================

/**
 * Analyzes a D&D 5e monster stat block and determines the appropriate
 * Daggerheart adversary type and combat role.
 *
 * Classification priority:
 * 1. Swarm - Detected by subtype or name
 * 2. Solo - Legendary/mythic actions, high CR
 * 3. Minion - Very low CR, low HP
 * 4. Horde - Pack tactics at low CR
 * 5. Standard - Default fallback
 *
 * Combat roles are assigned based on abilities, spells, and stat distribution.
 *
 * @param monster - The D&D 5e monster to classify
 * @returns Classification result with type, role, confidence, and reasoning
 *
 * @example
 * ```typescript
 * import { classifyAdversary } from './classifyAdversary';
 *
 * const result = classifyAdversary(ancientRedDragon);
 * // {
 * //   type: AdversaryType.SOLO,
 * //   role: 'Bruiser',
 * //   confidence: 0.95,
 * //   reasoning: 'Has 3 legendary actions; High STR with melee attacks'
 * // }
 * ```
 */
export function classifyAdversary(monster: DnD5eMonster): ClassificationResult {
  const cr = normalizeCR(monster.challengeRating.cr);
  const reasoningParts: string[] = [];
  let type: AdversaryType = AdversaryType.STANDARD;
  let confidence = 0.7; // Default confidence for Standard

  // === Step 1: Check for Swarm ===
  const swarmCheck = checkSwarm(monster);
  if (swarmCheck.isSwarm) {
    type = AdversaryType.SWARM;
    confidence = 0.95;
    reasoningParts.push(swarmCheck.reason);

    const roleResult = determineRole(monster);
    return {
      type,
      role: roleResult.role,
      confidence,
      reasoning: reasoningParts.join('; '),
    };
  }

  // === Step 2: Check for Solo ===
  const soloCheck = checkSolo(monster, cr);
  if (soloCheck.isSolo) {
    type = AdversaryType.SOLO;
    confidence = 0.9;
    reasoningParts.push(soloCheck.reason);

    const roleResult = determineRole(monster);
    if (roleResult.role) {
      reasoningParts.push(roleResult.reason);
    }

    return {
      type,
      role: roleResult.role,
      confidence,
      reasoning: reasoningParts.join('; '),
    };
  }

  // === Step 3: Check for Minion ===
  const minionCheck = checkMinion(monster, cr);
  if (minionCheck.isMinion) {
    type = AdversaryType.MINION;
    confidence = minionCheck.confidence;
    reasoningParts.push(minionCheck.reason);

    return {
      type,
      role: undefined, // Minions don't have combat roles
      confidence,
      reasoning: reasoningParts.join('; '),
    };
  }

  // === Step 4: Check for Horde ===
  const hordeCheck = checkHorde(monster, cr);
  if (hordeCheck.isHorde) {
    type = AdversaryType.HORDE;
    confidence = 0.75;
    reasoningParts.push(hordeCheck.reason);

    return {
      type,
      role: undefined, // Hordes act as a unit
      confidence,
      reasoning: reasoningParts.join('; '),
    };
  }

  // === Step 5: Default to Standard with role determination ===
  const roleResult = determineRole(monster);

  // Map certain strong role indicators to specific types
  if (roleResult.role === 'Support' && roleResult.confidence >= 0.5) {
    type = AdversaryType.SUPPORT;
    confidence = 0.7 + roleResult.confidence * 0.2;
    reasoningParts.push(`Support role: ${roleResult.reason}`);
  } else if (roleResult.role === 'Leader' && roleResult.confidence >= 0.5) {
    type = AdversaryType.LEADER;
    confidence = 0.7 + roleResult.confidence * 0.2;
    reasoningParts.push(`Leader role: ${roleResult.reason}`);
  } else if (roleResult.role === 'Bruiser' && roleResult.confidence >= 0.4) {
    type = AdversaryType.BRUISER;
    confidence = 0.7 + roleResult.confidence * 0.2;
    reasoningParts.push(`Bruiser role: ${roleResult.reason}`);
  } else if (roleResult.role === 'Artillery' && roleResult.confidence >= 0.4) {
    type = AdversaryType.RANGED;
    confidence = 0.7 + roleResult.confidence * 0.2;
    reasoningParts.push(`Ranged/Artillery role: ${roleResult.reason}`);
  } else if (roleResult.role === 'Skirmisher' && roleResult.confidence >= 0.5) {
    type = AdversaryType.SKULK;
    confidence = 0.65 + roleResult.confidence * 0.2;
    reasoningParts.push(`Skirmisher/Skulk role: ${roleResult.reason}`);
  } else {
    // Truly Standard - no strong role indicators
    type = AdversaryType.STANDARD;
    confidence = 0.65;
    reasoningParts.push(`CR ${cr} with balanced abilities`);
  }

  return {
    type,
    role: roleResult.role,
    confidence: Math.min(confidence, 1.0),
    reasoning: reasoningParts.join('; '),
  };
}

// ============================================================================
// BATCH CLASSIFICATION
// ============================================================================

/**
 * Classifies multiple monsters and returns results with statistics.
 *
 * @param monsters - Array of D&D 5e monsters to classify
 * @returns Array of classification results with monster names
 *
 * @example
 * ```typescript
 * const results = classifyMultiple([goblin, dragon, zombie]);
 * for (const { name, classification } of results) {
 *   console.log(`${name}: ${classification.type}`);
 * }
 * ```
 */
export function classifyMultiple(
  monsters: DnD5eMonster[]
): Array<{ name: string; classification: ClassificationResult }> {
  return monsters.map((monster) => ({
    name: monster.name,
    classification: classifyAdversary(monster),
  }));
}

/**
 * Gets classification statistics for a group of monsters.
 *
 * @param monsters - Array of D&D 5e monsters
 * @returns Statistics about type and role distribution
 */
export function getClassificationStats(monsters: DnD5eMonster[]): {
  typeDistribution: Record<AdversaryType, number>;
  roleDistribution: Record<CombatRole | 'None', number>;
  averageConfidence: number;
} {
  const typeDistribution: Record<AdversaryType, number> = {
    [AdversaryType.MINION]: 0,
    [AdversaryType.STANDARD]: 0,
    [AdversaryType.SKULK]: 0,
    [AdversaryType.BRUISER]: 0,
    [AdversaryType.RANGED]: 0,
    [AdversaryType.SUPPORT]: 0,
    [AdversaryType.LEADER]: 0,
    [AdversaryType.HORDE]: 0,
    [AdversaryType.SOLO]: 0,
    [AdversaryType.SOCIAL]: 0,
    [AdversaryType.SWARM]: 0,
  };

  const roleDistribution: Record<CombatRole | 'None', number> = {
    Artillery: 0,
    Bruiser: 0,
    Skirmisher: 0,
    Controller: 0,
    Support: 0,
    Leader: 0,
    None: 0,
  };

  let totalConfidence = 0;

  for (const monster of monsters) {
    const result = classifyAdversary(monster);
    typeDistribution[result.type]++;
    if (result.role) {
      roleDistribution[result.role]++;
    } else {
      roleDistribution.None++;
    }
    totalConfidence += result.confidence;
  }

  return {
    typeDistribution,
    roleDistribution,
    averageConfidence: monsters.length > 0 ? totalConfidence / monsters.length : 0,
  };
}
