/**
 * OSR (Old School Renaissance) / Basic D&D Stat Block Parser
 *
 * Parses plain text OSR stat blocks (copy-pasted from books/PDFs)
 * into structured OSRStatBlock objects.
 *
 * @module parsers/osrParser
 * @version 1.0.0
 */

import {
  OSRStatBlock,
  OSRArmorClass,
  OSRHitDice,
  OSRToHit,
  OSRMovement,
  OSRSavingThrows,
  OSRAttack,
  OSRSpecialAbility,
  OSRAlignment,
  MovementType,
  parseHitDice,
  descendingToAscending,
  thac0ToAttackBonus,
  parseSavingThrows,
  parseAlignment,
  parseMorale,
} from '../models/osr';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of a safe parse operation.
 */
export interface OSRParseResult {
  /** Successfully parsed stat block, if any. */
  result?: OSRStatBlock;
  /** List of parsing errors. */
  errors: string[];
  /** List of non-fatal warnings. */
  warnings: string[];
}

// ============================================================================
// PARSER HELPERS
// ============================================================================

/**
 * Normalizes line endings and removes extra whitespace.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .trim();
}

/**
 * Parses Armor Class in various OSR formats.
 *
 * Common formats:
 * - "AC 6 [13]" - Descending with ascending in brackets
 * - "AC 13" - Single value (detect ascending vs descending)
 * - "AC -2 [21]" - Negative descending AC
 */
function parseArmorClass(text: string): OSRArmorClass | null {
  // Match "AC X [Y]" format (descending [ascending])
  const bracketMatch = text.match(/AC\s*(-?\d+)\s*\[(\d+)\]/i);
  if (bracketMatch && bracketMatch[1] && bracketMatch[2]) {
    return {
      descending: parseInt(bracketMatch[1], 10),
      ascending: parseInt(bracketMatch[2], 10),
    };
  }

  // Match single value
  const singleMatch = text.match(/AC\s*(-?\d+)/i);
  if (singleMatch && singleMatch[1]) {
    const value = parseInt(singleMatch[1], 10);

    // Heuristic: values > 10 are likely ascending, <= 10 are likely descending
    if (value > 10) {
      return {
        descending: 19 - value,
        ascending: value,
      };
    } else {
      return {
        descending: value,
        ascending: 19 - value,
      };
    }
  }

  return null;
}

/**
 * Parses Hit Dice line.
 *
 * Common formats:
 * - "HD 3" - Simple hit dice
 * - "HD 2+1" - Hit dice with modifier
 * - "HD 1-1" - Hit dice with negative modifier
 * - "HD 4*" - Hit dice with special ability marker
 * - "HD 5**" - Hit dice with two special abilities
 */
function parseHD(text: string): OSRHitDice | null {
  const match = text.match(/HD\s*(\d+(?:[+-]\d+)?(?:\*+)?)/i);
  if (match && match[1]) {
    return parseHitDice(match[1]);
  }
  return null;
}

/**
 * Parses THAC0/To-Hit line.
 *
 * Common formats:
 * - "THAC0 19 [+0]" - THAC0 with attack bonus in brackets
 * - "THAC0 17" - THAC0 only
 * - "AB +2" - Attack bonus only
 */
function parseToHit(text: string): OSRToHit | null {
  // Match "THAC0 X [+Y]" format
  const bracketMatch = text.match(/THAC0\s*(\d+)\s*\[([+-]?\d+)\]/i);
  if (bracketMatch && bracketMatch[1] && bracketMatch[2]) {
    return {
      thac0: parseInt(bracketMatch[1], 10),
      attackBonus: parseInt(bracketMatch[2], 10),
    };
  }

  // Match THAC0 only
  const thac0Match = text.match(/THAC0\s*(\d+)/i);
  if (thac0Match && thac0Match[1]) {
    const thac0 = parseInt(thac0Match[1], 10);
    return {
      thac0,
      attackBonus: thac0ToAttackBonus(thac0),
    };
  }

  // Match attack bonus only
  const abMatch = text.match(/(?:AB|Attack\s*Bonus)\s*([+-]?\d+)/i);
  if (abMatch && abMatch[1]) {
    const attackBonus = parseInt(abMatch[1], 10);
    return {
      thac0: 20 - attackBonus,
      attackBonus,
    };
  }

  return null;
}

/**
 * Parses movement line.
 *
 * Common formats:
 * - "MV 60' (20')" - Walking movement per turn (per round)
 * - "MV 120' (40'), fly 180' (60')" - Multiple movement types
 * - "MV 90' (30'), swim 90' (30')"
 */
function parseMovement(text: string): OSRMovement[] {
  const movements: OSRMovement[] = [];

  // Pattern for movement entries: type (optional) + feet per turn + (feet per round)
  const movementPattern = /(?:(fly|swim|climb|burrow)\s*)?(\d+)'?\s*(?:\((\d+)'?\))?/gi;
  let match: RegExpExecArray | null;

  while ((match = movementPattern.exec(text)) !== null) {
    if (match[2]) {
      const typeStr = match[1]?.toLowerCase() || 'walk';
      const perTurn = parseInt(match[2], 10);
      const perRound = match[3] ? parseInt(match[3], 10) : Math.floor(perTurn / 3);

      let type: MovementType = MovementType.WALK;
      switch (typeStr) {
        case 'fly':
          type = MovementType.FLY;
          break;
        case 'swim':
          type = MovementType.SWIM;
          break;
        case 'climb':
          type = MovementType.CLIMB;
          break;
        case 'burrow':
          type = MovementType.BURROW;
          break;
      }

      // Avoid duplicates
      if (!movements.some((m) => m.type === type)) {
        movements.push({ type, perTurn, perRound });
      }
    }
  }

  // Default walking movement if none found
  if (movements.length === 0) {
    movements.push({ type: MovementType.WALK, perTurn: 60, perRound: 20 });
  }

  return movements;
}

/**
 * Parses saving throws line.
 *
 * Common formats:
 * - "SV D14 W15 P16 B17 S18"
 * - "Save as Fighter 3"
 */
function parseSaves(text: string): OSRSavingThrows {
  // Check for abbreviated format
  if (/D\s*\d+\s*W\s*\d+/i.test(text)) {
    return parseSavingThrows(text);
  }

  // Check for "Save as X Y" format
  const saveAsMatch = text.match(/save\s*(?:as)?\s*(\w+)\s*(\d+)?/i);
  if (saveAsMatch) {
    const classType = saveAsMatch[1]?.toLowerCase();
    const level = saveAsMatch[2] ? parseInt(saveAsMatch[2], 10) : 1;

    // Return appropriate saves based on class (simplified)
    // These are approximate values for common OSR classes
    return getSavesByClassLevel(classType || 'fighter', level);
  }

  // Default fighter saves
  return parseSavingThrows('D14 W15 P16 B17 S18');
}

/**
 * Get saving throws for a class at a given level (simplified).
 */
function getSavesByClassLevel(classType: string, level: number): OSRSavingThrows {
  // Base saves decrease by ~2 per 3-4 levels (simplified)
  const levelBonus = Math.floor(level / 3) * 2;

  switch (classType) {
    case 'fighter':
    case 'dwarf':
      return {
        death: Math.max(2, 14 - levelBonus),
        wands: Math.max(2, 15 - levelBonus),
        paralysis: Math.max(2, 16 - levelBonus),
        breath: Math.max(2, 17 - levelBonus),
        spells: Math.max(2, 18 - levelBonus),
      };
    case 'cleric':
      return {
        death: Math.max(2, 11 - levelBonus),
        wands: Math.max(2, 12 - levelBonus),
        paralysis: Math.max(2, 14 - levelBonus),
        breath: Math.max(2, 16 - levelBonus),
        spells: Math.max(2, 15 - levelBonus),
      };
    case 'magic-user':
    case 'mage':
    case 'wizard':
    case 'elf':
      return {
        death: Math.max(2, 13 - levelBonus),
        wands: Math.max(2, 14 - levelBonus),
        paralysis: Math.max(2, 13 - levelBonus),
        breath: Math.max(2, 16 - levelBonus),
        spells: Math.max(2, 15 - levelBonus),
      };
    case 'thief':
    case 'halfling':
      return {
        death: Math.max(2, 13 - levelBonus),
        wands: Math.max(2, 14 - levelBonus),
        paralysis: Math.max(2, 13 - levelBonus),
        breath: Math.max(2, 16 - levelBonus),
        spells: Math.max(2, 15 - levelBonus),
      };
    default:
      return {
        death: Math.max(2, 14 - levelBonus),
        wands: Math.max(2, 15 - levelBonus),
        paralysis: Math.max(2, 16 - levelBonus),
        breath: Math.max(2, 17 - levelBonus),
        spells: Math.max(2, 18 - levelBonus),
      };
  }
}

/**
 * Parses attacks line.
 *
 * Common formats:
 * - "Att 1 x weapon (1d6)"
 * - "Att 2 x claw (1d4), 1 x bite (1d8)"
 * - "Att 1 x bite (2d6 + poison)"
 */
function parseAttacks(text: string): OSRAttack[] {
  const attacks: OSRAttack[] = [];

  // Match attack patterns
  const attackPattern = /(\d+)\s*[x×]\s*([^(]+)\s*\(([^)]+)\)/gi;
  let match: RegExpExecArray | null;

  while ((match = attackPattern.exec(text)) !== null) {
    if (match[1] && match[2] && match[3]) {
      const count = parseInt(match[1], 10);
      const name = match[2].trim();
      const damageText = match[3].trim();

      // Check for special effects (poison, paralysis, etc.)
      const specialMatch = damageText.match(/([^+]+)\s*\+\s*(.+)/);
      let damage = damageText;
      let special: string | undefined;

      if (specialMatch && specialMatch[1] && specialMatch[2]) {
        damage = specialMatch[1].trim();
        special = specialMatch[2].trim();
      }

      const attack: OSRAttack = { name, count, damage };
      if (special) {
        attack.special = special;
      }
      attacks.push(attack);
    }
  }

  // If no structured attacks found, try simple format
  if (attacks.length === 0) {
    const simpleMatch = text.match(/att(?:ack)?\s*(\d+)/i);
    if (simpleMatch && simpleMatch[1]) {
      const count = parseInt(simpleMatch[1], 10);
      // Look for damage
      const damageMatch = text.match(/\(([^)]+)\)/);
      const damage = damageMatch?.[1] || '1d6';

      attacks.push({ name: 'Attack', count, damage });
    }
  }

  // Default attack if nothing found
  if (attacks.length === 0) {
    attacks.push({ name: 'Weapon', count: 1, damage: '1d6' });
  }

  return attacks;
}

/**
 * Parses XP value.
 */
function parseXP(text: string): number {
  const match = text.match(/XP\s*([\d,]+)/i);
  if (match && match[1]) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  return 0;
}

/**
 * Parses special abilities from text.
 */
function parseSpecialAbilities(text: string): OSRSpecialAbility[] {
  const abilities: OSRSpecialAbility[] = [];

  // Look for common special ability keywords
  const abilityKeywords = [
    { name: 'Infravision', pattern: /infravision\s*(\d+)?'?/i },
    { name: 'Poison', pattern: /poison[^.]*(?:save|die|damage)/i },
    { name: 'Paralysis', pattern: /paralyz(?:e|is|ing)[^.]*/i },
    { name: 'Level Drain', pattern: /(?:drain|level)\s*(?:drain|energy)[^.]*/i },
    { name: 'Petrification', pattern: /petrif(?:y|ication)[^.]*/i },
    { name: 'Breath Weapon', pattern: /breath(?:\s*weapon)?[^.]*/i },
    { name: 'Regeneration', pattern: /regenerat(?:e|ion)[^.]*/i },
    { name: 'Magic Resistance', pattern: /magic\s*resist(?:ance)?[^.]*/i },
    { name: 'Undead', pattern: /undead\s*(?:type|creature)?/i },
  ];

  for (const { name, pattern } of abilityKeywords) {
    const match = text.match(pattern);
    if (match) {
      abilities.push({
        name,
        description: match[0].trim(),
      });
    }
  }

  return abilities;
}

// ============================================================================
// MAIN PARSER FUNCTIONS
// ============================================================================

/**
 * Parses a plain text OSR stat block into a structured OSRStatBlock object.
 *
 * @param text - The raw stat block text
 * @returns Parsed stat block object
 * @throws Error if parsing fails critically
 *
 * @example
 * ```typescript
 * const goblin = parseOSRStatBlock(`
 *   Goblin
 *   AC 6 [13], HD 1-1, Att 1 × weapon (1d6),
 *   THAC0 19 [+0], MV 60' (20'), SV D14 W15 P16 B17 S18,
 *   ML 7, AL Chaotic, XP 5
 * `);
 * ```
 */
export function parseOSRStatBlock(text: string): OSRStatBlock {
  const result = parseOSRStatBlockSafe(text);

  if (!result.result) {
    throw new Error(`Failed to parse OSR stat block: ${result.errors.join('; ')}`);
  }

  return result.result;
}

/**
 * Safely parses an OSR stat block, returning errors instead of throwing.
 *
 * @param text - The raw stat block text
 * @returns Object containing result (if successful) and any errors/warnings
 */
export function parseOSRStatBlockSafe(text: string): OSRParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const normalized = normalizeText(text);
  const lines = normalized.split('\n');

  if (lines.length === 0 || !lines[0]) {
    errors.push('Empty stat block');
    return { errors, warnings };
  }

  // First line is usually the name
  const name = lines[0].trim();
  if (!name) {
    errors.push('Missing monster name');
    return { errors, warnings };
  }

  // Join remaining lines for parsing
  const statsText = lines.slice(1).join(' ');

  // Parse AC
  const ac = parseArmorClass(statsText);
  if (!ac) {
    errors.push('Could not parse Armor Class');
    return { errors, warnings };
  }

  // Parse HD
  const hd = parseHD(statsText);
  if (!hd) {
    errors.push('Could not parse Hit Dice');
    return { errors, warnings };
  }

  // Parse To-Hit
  const toHit = parseToHit(statsText);
  if (!toHit) {
    warnings.push('Could not parse THAC0/To-Hit, using default based on HD');
    // Default: THAC0 = 20 - HD (capped at 20)
    const defaultThac0 = Math.max(10, 20 - hd.count);
    // Use a simple object literal that satisfies the type
    const defaultToHit: OSRToHit = {
      thac0: defaultThac0,
      attackBonus: thac0ToAttackBonus(defaultThac0),
    };
    // Continue with default
  }

  // Parse Movement
  const movement = parseMovement(statsText);

  // Parse Saves
  const saves = parseSaves(statsText);

  // Parse Attacks
  const attacks = parseAttacks(statsText);
  const attacksPerRound = attacks.reduce((sum, att) => sum + att.count, 0);

  // Parse Morale
  const moraleMatch = statsText.match(/(?:ML|Morale)\s*(\d+)/i);
  const morale = moraleMatch ? parseMorale(moraleMatch[1] || '7') : 7;

  // Parse Alignment
  const alignmentMatch = statsText.match(/(?:AL|Alignment)\s*(\w+)/i);
  const alignment = alignmentMatch ? parseAlignment(alignmentMatch[1] || 'Neutral') : OSRAlignment.NEUTRAL;

  // Parse XP
  const xp = parseXP(statsText);

  // Parse optional fields
  const treasureMatch = statsText.match(/(?:TT|Treasure(?:\s*Type)?)\s*([A-Z]+(?:\s*x\s*\d+)?|None)/i);
  const treasureType = treasureMatch?.[1]?.trim();

  const numberMatch = statsText.match(/(?:NA|No\.?\s*App(?:earing)?)\s*([\dd+-]+)/i);
  const numberAppearing = numberMatch?.[1]?.trim();

  // Parse special abilities
  const specialAbilities = parseSpecialAbilities(statsText);

  // Build result
  const statBlock: OSRStatBlock = {
    name,
    ac,
    hd,
    toHit: toHit || {
      thac0: Math.max(10, 20 - hd.count),
      attackBonus: thac0ToAttackBonus(Math.max(10, 20 - hd.count)),
    },
    movement,
    saves,
    attacksPerRound,
    attacks,
    morale,
    alignment,
    xp,
  };

  // Add optional fields
  if (treasureType) {
    statBlock.treasureType = treasureType;
  }
  if (numberAppearing) {
    statBlock.numberAppearing = numberAppearing;
  }
  if (specialAbilities.length > 0) {
    statBlock.specialAbilities = specialAbilities;
  }

  return { result: statBlock, errors, warnings };
}

/**
 * Validates a parsed OSR stat block for completeness.
 *
 * @param statBlock - The parsed stat block to validate
 * @returns List of validation issues
 */
export function validateOSRStatBlock(statBlock: OSRStatBlock): string[] {
  const issues: string[] = [];

  // Check required fields
  if (!statBlock.name) issues.push('Missing name');
  if (!statBlock.ac) issues.push('Missing armor class');
  if (!statBlock.hd) issues.push('Missing hit dice');
  if (!statBlock.toHit) issues.push('Missing to-hit values');
  if (!statBlock.movement || statBlock.movement.length === 0) {
    issues.push('Missing movement');
  }
  if (!statBlock.saves) issues.push('Missing saving throws');
  if (!statBlock.attacks || statBlock.attacks.length === 0) {
    issues.push('Missing attacks');
  }

  // Validate AC ranges
  if (statBlock.ac) {
    if (statBlock.ac.descending < -10 || statBlock.ac.descending > 9) {
      issues.push(`Descending AC ${statBlock.ac.descending} is out of typical range (-10 to 9)`);
    }
    if (statBlock.ac.ascending < 10 || statBlock.ac.ascending > 29) {
      issues.push(`Ascending AC ${statBlock.ac.ascending} is out of typical range (10 to 29)`);
    }
  }

  // Validate THAC0 range
  if (statBlock.toHit && (statBlock.toHit.thac0 < 1 || statBlock.toHit.thac0 > 20)) {
    issues.push(`THAC0 ${statBlock.toHit.thac0} is out of range (1-20)`);
  }

  // Validate morale range
  if (statBlock.morale < 2 || statBlock.morale > 12) {
    issues.push(`Morale ${statBlock.morale} is out of range (2-12)`);
  }

  return issues;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  parseArmorClass,
  parseHD,
  parseToHit,
  parseMovement,
  parseSaves,
  parseAttacks,
  parseXP,
  parseSpecialAbilities,
};
