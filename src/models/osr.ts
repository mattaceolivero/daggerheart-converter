/**
 * OSR (Old School Renaissance) / Basic D&D Stat Block Data Model
 *
 * TypeScript interfaces for representing OSR/Basic D&D monster stat blocks.
 * Supports B/X, BECMI, OSE, and similar retroclone formats.
 *
 * @module osr
 * @version 1.0.0
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * OSR alignment system (3-point Law/Neutral/Chaos).
 */
export enum OSRAlignment {
  LAWFUL = 'Lawful',
  NEUTRAL = 'Neutral',
  CHAOTIC = 'Chaotic',
}

/**
 * OSR movement environment types.
 */
export enum MovementType {
  WALK = 'walk',
  FLY = 'fly',
  SWIM = 'swim',
  CLIMB = 'climb',
  BURROW = 'burrow',
}

// ============================================================================
// INTERFACES - Core Components
// ============================================================================

/**
 * OSR Armor Class with both descending (lower=better) and ascending (higher=better).
 *
 * - Descending AC: Original B/X format, AC 9 = unarmored, AC -3 = heavy armor
 * - Ascending AC: Modern retroclones, AAC 10 = unarmored, AAC 19+ = heavy armor
 */
export interface OSRArmorClass {
  /** Descending AC value (lower is better, 9 = unarmored). */
  descending: number;
  /** Ascending AC value (higher is better, 10 = unarmored). */
  ascending: number;
  /** Optional armor source description. */
  source?: string;
}

/**
 * OSR Hit Dice representation.
 *
 * Common formats:
 * - "1" = 1d8 HD
 * - "1+1" = 1d8+1 HD
 * - "1-1" = 1d8-1 HD (minimum 1)
 * - "3*" = 3d8 HD, special attack ability
 * - "5**" = 5d8 HD, two special abilities
 */
export interface OSRHitDice {
  /** Number of hit dice. */
  count: number;
  /** Modifier to total HP (can be negative). */
  modifier: number;
  /** Number of asterisks indicating special abilities (0-2+). */
  specialAbilities: number;
  /** Original string representation. */
  raw: string;
}

/**
 * OSR THAC0 (To Hit Armor Class 0) with optional attack bonus.
 *
 * - THAC0: Lower is better, 20 = worst, 1 = best
 * - Attack Bonus: Modern conversion, 0 = worst, +19 = best
 */
export interface OSRToHit {
  /** THAC0 value (lower is better). */
  thac0: number;
  /** Equivalent attack bonus for ascending AC systems. */
  attackBonus: number;
}

/**
 * OSR movement in feet per turn (10 minutes) and per round (10 seconds).
 */
export interface OSRMovement {
  /** Movement type (walk, fly, swim, etc.). */
  type: MovementType;
  /** Movement in feet per turn (exploration speed). */
  perTurn: number;
  /** Movement in feet per round (combat speed, typically 1/3 of perTurn). */
  perRound: number;
}

/**
 * OSR saving throws (5 categories).
 *
 * - Death/Poison: Death rays, poison
 * - Wands: Magic wands
 * - Paralysis/Petrification: Paralysis, turn to stone
 * - Breath Weapon: Dragon breath, etc.
 * - Spells: Rods, staves, spells
 */
export interface OSRSavingThrows {
  /** Death Ray or Poison save target. */
  death: number;
  /** Wand save target. */
  wands: number;
  /** Paralysis or Petrification save target. */
  paralysis: number;
  /** Breath Weapon save target. */
  breath: number;
  /** Rod, Staff, or Spell save target. */
  spells: number;
}

/**
 * OSR attack entry.
 */
export interface OSRAttack {
  /** Attack name (e.g., "Claw", "Bite", "Weapon"). */
  name: string;
  /** Number of attacks with this attack type. */
  count: number;
  /** Damage expression (e.g., "1d6", "2d4+1"). */
  damage: string;
  /** Optional special effect. */
  special?: string;
}

/**
 * OSR special ability or trait.
 */
export interface OSRSpecialAbility {
  /** Name of the ability. */
  name: string;
  /** Description of the ability. */
  description: string;
}

// ============================================================================
// MAIN INTERFACE - OSR Monster
// ============================================================================

/**
 * Complete OSR/Basic D&D monster stat block.
 *
 * Supports B/X D&D, BECMI, OSE, Labyrinth Lord, and similar systems.
 */
export interface OSRStatBlock {
  // === Identity ===
  /** Name of the monster. */
  name: string;
  /** Optional subtitle or descriptor. */
  subtitle?: string;

  // === Core Statistics ===
  /** Armor Class (both descending and ascending). */
  ac: OSRArmorClass;
  /** Hit Dice expression. */
  hd: OSRHitDice;
  /** To-hit values. */
  toHit: OSRToHit;
  /** Movement speeds (can have multiple for different modes). */
  movement: OSRMovement[];
  /** Saving throw targets. */
  saves: OSRSavingThrows;

  // === Combat ===
  /** Number of attacks per round. */
  attacksPerRound: number;
  /** Attack entries. */
  attacks: OSRAttack[];

  // === Behavior ===
  /** Morale score (2-12, roll 2d6 vs this). */
  morale: number;
  /** Alignment (Lawful/Neutral/Chaotic). */
  alignment: OSRAlignment;

  // === Reward ===
  /** Experience points awarded. */
  xp: number;
  /** Treasure type code (e.g., "C", "None", "V x2"). */
  treasureType?: string;

  // === Optional Fields ===
  /** Number appearing (e.g., "1d6", "2d4"). */
  numberAppearing?: string;
  /** Number appearing in lair. */
  numberInLair?: string;
  /** Special abilities. */
  specialAbilities?: OSRSpecialAbility[];
  /** Description text. */
  description?: string;
  /** Habitat/environment. */
  habitat?: string[];

  // === Metadata ===
  /** Source book or adventure. */
  source?: string;
  /** Page number in source. */
  sourcePage?: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse Hit Dice string to structured format.
 *
 * @param hdString - HD string like "3", "2+1", "1-1", "4*", "5**"
 * @returns Parsed OSRHitDice object
 *
 * @example
 * ```typescript
 * parseHitDice("3");     // { count: 3, modifier: 0, specialAbilities: 0, raw: "3" }
 * parseHitDice("2+1");   // { count: 2, modifier: 1, specialAbilities: 0, raw: "2+1" }
 * parseHitDice("1-1");   // { count: 1, modifier: -1, specialAbilities: 0, raw: "1-1" }
 * parseHitDice("4*");    // { count: 4, modifier: 0, specialAbilities: 1, raw: "4*" }
 * parseHitDice("5**");   // { count: 5, modifier: 0, specialAbilities: 2, raw: "5**" }
 * ```
 */
export function parseHitDice(hdString: string): OSRHitDice {
  const raw = hdString.trim();

  // Count asterisks
  const asteriskMatch = raw.match(/\*+$/);
  const specialAbilities = asteriskMatch ? asteriskMatch[0].length : 0;

  // Remove asterisks for parsing
  const cleanHD = raw.replace(/\*+$/, '');

  // Parse count and modifier
  const match = cleanHD.match(/^(\d+)(?:([+-])(\d+))?$/);
  if (!match || !match[1]) {
    return { count: 1, modifier: 0, specialAbilities, raw };
  }

  const count = parseInt(match[1], 10);
  let modifier = 0;

  if (match[2] && match[3]) {
    modifier = parseInt(match[3], 10);
    if (match[2] === '-') {
      modifier = -modifier;
    }
  }

  return { count, modifier, specialAbilities, raw };
}

/**
 * Convert descending AC to ascending AC.
 * Formula: AAC = 19 - DAC
 *
 * @param descendingAC - Descending AC value
 * @returns Ascending AC value
 */
export function descendingToAscending(descendingAC: number): number {
  return 19 - descendingAC;
}

/**
 * Convert ascending AC to descending AC.
 * Formula: DAC = 19 - AAC
 *
 * @param ascendingAC - Ascending AC value
 * @returns Descending AC value
 */
export function ascendingToDescending(ascendingAC: number): number {
  return 19 - ascendingAC;
}

/**
 * Convert THAC0 to attack bonus.
 * Formula: Attack Bonus = 20 - THAC0
 *
 * @param thac0 - THAC0 value
 * @returns Attack bonus
 */
export function thac0ToAttackBonus(thac0: number): number {
  return 20 - thac0;
}

/**
 * Convert attack bonus to THAC0.
 * Formula: THAC0 = 20 - Attack Bonus
 *
 * @param attackBonus - Attack bonus value
 * @returns THAC0 value
 */
export function attackBonusToThac0(attackBonus: number): number {
  return 20 - attackBonus;
}

/**
 * Calculate average HP from Hit Dice.
 * Uses d8 as the standard HD die.
 *
 * @param hd - Hit Dice object
 * @returns Average HP value
 */
export function calculateAverageHP(hd: OSRHitDice): number {
  // Average of d8 is 4.5, round down
  const dieAverage = 4.5;
  const baseHP = Math.floor(hd.count * dieAverage);
  return Math.max(1, baseHP + hd.modifier);
}

/**
 * Calculate minimum HP from Hit Dice.
 *
 * @param hd - Hit Dice object
 * @returns Minimum HP value (at least 1)
 */
export function calculateMinHP(hd: OSRHitDice): number {
  return Math.max(1, hd.count + hd.modifier);
}

/**
 * Calculate maximum HP from Hit Dice.
 *
 * @param hd - Hit Dice object
 * @returns Maximum HP value
 */
export function calculateMaxHP(hd: OSRHitDice): number {
  return Math.max(1, hd.count * 8 + hd.modifier);
}

/**
 * Parse saving throw string to structured format.
 * Common format: "D14 W15 P16 B17 S18" or "Death 14, Wands 15, ..."
 *
 * @param saveString - Saving throw string
 * @returns Parsed OSRSavingThrows object
 */
export function parseSavingThrows(saveString: string): OSRSavingThrows {
  // Default save values (poor saves)
  const saves: OSRSavingThrows = {
    death: 16,
    wands: 17,
    paralysis: 15,
    breath: 17,
    spells: 18,
  };

  // Try abbreviated format: D14 W15 P16 B17 S18
  const abbrevMatch = saveString.match(
    /D\s*(\d+)\s*W\s*(\d+)\s*P\s*(\d+)\s*B\s*(\d+)\s*S\s*(\d+)/i
  );
  if (abbrevMatch) {
    saves.death = parseInt(abbrevMatch[1] || '16', 10);
    saves.wands = parseInt(abbrevMatch[2] || '17', 10);
    saves.paralysis = parseInt(abbrevMatch[3] || '15', 10);
    saves.breath = parseInt(abbrevMatch[4] || '17', 10);
    saves.spells = parseInt(abbrevMatch[5] || '18', 10);
    return saves;
  }

  // Try full format: Death 14, Wands 15, etc.
  const deathMatch = saveString.match(/death[^0-9]*(\d+)/i);
  const wandsMatch = saveString.match(/wand[^0-9]*(\d+)/i);
  const paralysisMatch = saveString.match(/paraly[^0-9]*(\d+)/i);
  const breathMatch = saveString.match(/breath[^0-9]*(\d+)/i);
  const spellsMatch = saveString.match(/spell[^0-9]*(\d+)/i);

  if (deathMatch?.[1]) saves.death = parseInt(deathMatch[1], 10);
  if (wandsMatch?.[1]) saves.wands = parseInt(wandsMatch[1], 10);
  if (paralysisMatch?.[1]) saves.paralysis = parseInt(paralysisMatch[1], 10);
  if (breathMatch?.[1]) saves.breath = parseInt(breathMatch[1], 10);
  if (spellsMatch?.[1]) saves.spells = parseInt(spellsMatch[1], 10);

  return saves;
}

/**
 * Parse alignment string to enum.
 *
 * @param alignmentString - Alignment string (L/N/C or full word)
 * @returns OSRAlignment enum value
 */
export function parseAlignment(alignmentString: string): OSRAlignment {
  const lower = alignmentString.toLowerCase().trim();

  if (lower.startsWith('l') || lower.includes('lawful')) {
    return OSRAlignment.LAWFUL;
  }
  if (lower.startsWith('c') || lower.includes('chaotic')) {
    return OSRAlignment.CHAOTIC;
  }
  return OSRAlignment.NEUTRAL;
}

/**
 * Parse morale value from string.
 *
 * @param moraleString - Morale string (e.g., "7", "ML 8", "Morale: 9")
 * @returns Morale value (2-12)
 */
export function parseMorale(moraleString: string): number {
  const match = moraleString.match(/(\d+)/);
  if (match?.[1]) {
    const morale = parseInt(match[1], 10);
    return Math.max(2, Math.min(12, morale));
  }
  return 7; // Default morale
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if a value is a valid OSRAlignment.
 */
export function isOSRAlignment(value: unknown): value is OSRAlignment {
  return Object.values(OSRAlignment).includes(value as OSRAlignment);
}

/**
 * Type guard to check if a value is a valid MovementType.
 */
export function isMovementType(value: unknown): value is MovementType {
  return Object.values(MovementType).includes(value as MovementType);
}

/**
 * Type guard for minimal OSR stat block.
 */
export function isMinimalOSRStatBlock(obj: unknown): obj is Pick<
  OSRStatBlock,
  'name' | 'ac' | 'hd' | 'toHit' | 'movement' | 'saves' | 'attacksPerRound' | 'attacks' | 'morale' | 'alignment' | 'xp'
> {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.name === 'string' &&
    typeof m.ac === 'object' &&
    typeof m.hd === 'object' &&
    typeof m.toHit === 'object' &&
    Array.isArray(m.movement) &&
    typeof m.saves === 'object' &&
    typeof m.attacksPerRound === 'number' &&
    Array.isArray(m.attacks) &&
    typeof m.morale === 'number' &&
    isOSRAlignment(m.alignment) &&
    typeof m.xp === 'number'
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default OSRStatBlock;
