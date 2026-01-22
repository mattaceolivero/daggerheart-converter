/**
 * Pathfinder 2e Stat Block Parser
 *
 * Parses plain text PF2e stat blocks (copy-pasted from books/PDFs/Archives of Nethys)
 * into structured PF2eStatBlock objects.
 *
 * @module parsers/pf2eParser
 * @version 1.0.0
 */

import {
  PF2eStatBlock,
  PF2eSize,
  PF2eRarity,
  PF2eAlignment,
  PF2ePerception,
  PF2eSense,
  PF2eSenseType,
  PF2eLanguage,
  PF2eSpeed,
  PF2eSaves,
  PF2eSkillEntry,
  PF2eSkill,
  PF2eAbilityModifiers,
  PF2eImmunity,
  PF2eResistance,
  PF2eWeakness,
  PF2eStrike,
  PF2eCreatureAbility,
  PF2eActionCost,
  PF2eDamageType,
  PF2eDiceExpression,
  PF2eAttackDamage,
  PF2eSpellcasting,
} from '../models/pf2e';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of a PF2e parse operation.
 */
export interface PF2eParseResult {
  /** Successfully parsed stat block, if any. */
  result?: PF2eStatBlock;
  /** List of parsing errors. */
  errors: string[];
  /** List of non-fatal warnings. */
  warnings: string[];
}

// ============================================================================
// CONSTANTS - Mappings
// ============================================================================

const SIZE_MAP: Record<string, PF2eSize> = {
  tiny: PF2eSize.TINY,
  small: PF2eSize.SMALL,
  medium: PF2eSize.MEDIUM,
  large: PF2eSize.LARGE,
  huge: PF2eSize.HUGE,
  gargantuan: PF2eSize.GARGANTUAN,
};

const RARITY_MAP: Record<string, PF2eRarity> = {
  common: PF2eRarity.COMMON,
  uncommon: PF2eRarity.UNCOMMON,
  rare: PF2eRarity.RARE,
  unique: PF2eRarity.UNIQUE,
};

const ALIGNMENT_MAP: Record<string, PF2eAlignment> = {
  lg: PF2eAlignment.LG,
  ng: PF2eAlignment.NG,
  cg: PF2eAlignment.CG,
  ln: PF2eAlignment.LN,
  n: PF2eAlignment.N,
  cn: PF2eAlignment.CN,
  le: PF2eAlignment.LE,
  ne: PF2eAlignment.NE,
  ce: PF2eAlignment.CE,
};

const SKILL_MAP: Record<string, PF2eSkill> = {
  acrobatics: PF2eSkill.ACROBATICS,
  arcana: PF2eSkill.ARCANA,
  athletics: PF2eSkill.ATHLETICS,
  crafting: PF2eSkill.CRAFTING,
  deception: PF2eSkill.DECEPTION,
  diplomacy: PF2eSkill.DIPLOMACY,
  intimidation: PF2eSkill.INTIMIDATION,
  lore: PF2eSkill.LORE,
  medicine: PF2eSkill.MEDICINE,
  nature: PF2eSkill.NATURE,
  occultism: PF2eSkill.OCCULTISM,
  performance: PF2eSkill.PERFORMANCE,
  religion: PF2eSkill.RELIGION,
  society: PF2eSkill.SOCIETY,
  stealth: PF2eSkill.STEALTH,
  survival: PF2eSkill.SURVIVAL,
  thievery: PF2eSkill.THIEVERY,
};

const SENSE_MAP: Record<string, PF2eSenseType> = {
  darkvision: PF2eSenseType.DARKVISION,
  'greater darkvision': PF2eSenseType.GREATER_DARKVISION,
  'low-light vision': PF2eSenseType.LOW_LIGHT_VISION,
  scent: PF2eSenseType.SCENT,
  tremorsense: PF2eSenseType.TREMORSENSE,
  truesight: PF2eSenseType.TRUESIGHT,
  wavesense: PF2eSenseType.WAVESENSE,
  echolocation: PF2eSenseType.ECHOLOCATION,
  lifesense: PF2eSenseType.LIFESENSE,
  thoughtsense: PF2eSenseType.THOUGHTSENSE,
};

const DAMAGE_TYPE_MAP: Record<string, PF2eDamageType> = {
  bludgeoning: PF2eDamageType.BLUDGEONING,
  piercing: PF2eDamageType.PIERCING,
  slashing: PF2eDamageType.SLASHING,
  acid: PF2eDamageType.ACID,
  cold: PF2eDamageType.COLD,
  electricity: PF2eDamageType.ELECTRICITY,
  fire: PF2eDamageType.FIRE,
  sonic: PF2eDamageType.SONIC,
  force: PF2eDamageType.FORCE,
  mental: PF2eDamageType.MENTAL,
  negative: PF2eDamageType.NEGATIVE,
  poison: PF2eDamageType.POISON,
  positive: PF2eDamageType.POSITIVE,
  bleed: PF2eDamageType.BLEED,
  spirit: PF2eDamageType.SPIRIT,
};

// ============================================================================
// PARSER HELPERS
// ============================================================================

/**
 * Normalizes line endings and cleans up text.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u2014/g, '-')  // em dash
    .replace(/\u2013/g, '-')  // en dash
    .trim();
}

/**
 * Parses a dice expression like "2d8+4".
 */
function parseDiceExpression(text: string): PF2eDiceExpression | null {
  const match = text.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i);
  if (!match || !match[1] || !match[2]) return null;

  const count = parseInt(match[1], 10);
  const dieSize = parseInt(match[2], 10) as 4 | 6 | 8 | 10 | 12 | 20;
  let modifier = 0;

  if (match[3]) {
    modifier = parseInt(match[3].replace(/\s/g, ''), 10);
  }

  return { count, dieSize, modifier };
}

/**
 * Parses the header line for creature name and level.
 * Format: "Creature Name Creature Level"
 */
function parseHeader(text: string): { name: string; level: number } | null {
  // Match "Name Creature X" or "Name X" where X is a number (possibly negative)
  const match = text.match(/^(.+?)\s+(?:Creature\s+)?(-?\d+)\s*$/i);
  if (!match || !match[1]) return null;

  return {
    name: match[1].trim(),
    level: parseInt(match[2] || '0', 10),
  };
}

/**
 * Parses traits from the traits line.
 * Format: "Uncommon Medium Humanoid Elf" or "[Uncommon] [Medium] [Humanoid] [Elf]"
 */
function parseTraits(text: string): {
  traits: string[];
  rarity: PF2eRarity;
  size: PF2eSize;
  alignment?: PF2eAlignment;
} {
  // Remove brackets if present
  const cleaned = text.replace(/\[|\]/g, '').trim();
  const parts = cleaned.split(/\s+/).filter((p) => p);

  let rarity = PF2eRarity.COMMON;
  let size = PF2eSize.MEDIUM;
  let alignment: PF2eAlignment | undefined;
  const traits: string[] = [];

  for (const part of parts) {
    const lower = part.toLowerCase();

    // Check for rarity
    if (RARITY_MAP[lower]) {
      rarity = RARITY_MAP[lower]!;
      continue;
    }

    // Check for size
    if (SIZE_MAP[lower]) {
      size = SIZE_MAP[lower]!;
      continue;
    }

    // Check for alignment
    if (ALIGNMENT_MAP[lower]) {
      alignment = ALIGNMENT_MAP[lower]!;
      continue;
    }

    // Everything else is a trait
    traits.push(part);
  }

  const result: { traits: string[]; rarity: PF2eRarity; size: PF2eSize; alignment?: PF2eAlignment } = {
    traits,
    rarity,
    size,
  };

  if (alignment) {
    result.alignment = alignment;
  }

  return result;
}

/**
 * Parses perception line.
 * Format: "Perception +12; darkvision, scent (imprecise) 30 feet"
 */
function parsePerception(text: string): PF2ePerception {
  const perception: PF2ePerception = {
    modifier: 0,
    senses: [],
  };

  // Extract modifier
  const modMatch = text.match(/perception\s*([+-]\d+)/i);
  if (modMatch && modMatch[1]) {
    perception.modifier = parseInt(modMatch[1], 10);
  }

  // Extract senses after semicolon or comma
  const sensePart = text.replace(/perception\s*[+-]?\d+[,;]?\s*/i, '');

  // Parse each sense
  for (const [senseName, senseType] of Object.entries(SENSE_MAP)) {
    const pattern = new RegExp(`${senseName}(?:\\s*\\((imprecise|precise|vague)\\))?(?:\\s*(\\d+)\\s*(?:feet|ft\\.?))?`, 'i');
    const match = sensePart.match(pattern);

    if (match) {
      const sense: PF2eSense = { type: senseType };

      if (match[1]) {
        sense.precision = match[1].toLowerCase() as 'precise' | 'imprecise' | 'vague';
      }

      if (match[2]) {
        sense.range = parseInt(match[2], 10);
      }

      perception.senses.push(sense);
    }
  }

  return perception;
}

/**
 * Parses languages line.
 * Format: "Languages Common, Elven; can't speak any language"
 */
function parseLanguages(text: string): PF2eLanguage[] {
  const languages: PF2eLanguage[] = [];
  const cleaned = text.replace(/languages?\s*/i, '').trim();

  if (cleaned === '-' || cleaned === '' || cleaned.toLowerCase() === 'none') {
    return [];
  }

  const cantSpeak = cleaned.toLowerCase().includes("can't speak");

  // Split by semicolon first, then by comma for the language list
  const parts = cleaned.split(';')[0];
  if (!parts) return [];

  const langList = parts.split(',').map((l) => l.trim()).filter((l) => l);

  for (const lang of langList) {
    if (!lang.toLowerCase().includes("can't")) {
      languages.push({ name: lang, cantSpeak });
    }
  }

  return languages;
}

/**
 * Parses skills line.
 * Format: "Skills Acrobatics +10, Athletics +8, Lore (Warfare) +12"
 */
function parseSkills(text: string): PF2eSkillEntry[] {
  const skills: PF2eSkillEntry[] = [];
  const cleaned = text.replace(/skills?\s*/i, '').trim();

  // Match skill patterns
  const pattern = /([A-Za-z]+(?:\s*\([^)]+\))?)\s*([+-]\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(cleaned)) !== null) {
    if (!match[1] || !match[2]) continue;

    const skillText = match[1].trim();
    const modifier = parseInt(match[2], 10);

    // Check for Lore specialization
    const loreMatch = skillText.match(/^Lore\s*\(([^)]+)\)/i);
    if (loreMatch && loreMatch[1]) {
      const entry: PF2eSkillEntry = {
        skill: PF2eSkill.LORE,
        modifier,
      };
      const spec = loreMatch[1].trim();
      if (spec) {
        entry.specialization = spec;
      }
      skills.push(entry);
      continue;
    }

    // Check for other skills
    const lower = skillText.toLowerCase();
    if (SKILL_MAP[lower]) {
      skills.push({
        skill: SKILL_MAP[lower]!,
        modifier,
      });
    }
  }

  return skills;
}

/**
 * Parses ability modifiers line.
 * Format: "Str +4, Dex +2, Con +3, Int -1, Wis +1, Cha +0"
 */
function parseAbilities(text: string): PF2eAbilityModifiers {
  const abilities: PF2eAbilityModifiers = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  };

  const pattern = /(str|dex|con|int|wis|cha)\s*([+-]\d+)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (!match[1] || !match[2]) continue;
    const ability = match[1].toLowerCase() as keyof PF2eAbilityModifiers;
    abilities[ability] = parseInt(match[2], 10);
  }

  return abilities;
}

/**
 * Parses AC line.
 * Format: "AC 25; Fort +15, Ref +12, Will +18"
 */
function parseDefenses(text: string): { ac: number; saves: PF2eSaves } {
  let ac = 10;
  const saves: PF2eSaves = {
    fortitude: 0,
    reflex: 0,
    will: 0,
  };

  // Parse AC
  const acMatch = text.match(/ac\s*(\d+)/i);
  if (acMatch && acMatch[1]) {
    ac = parseInt(acMatch[1], 10);
  }

  // Parse saves
  const fortMatch = text.match(/fort(?:itude)?\s*([+-]\d+)/i);
  if (fortMatch && fortMatch[1]) {
    saves.fortitude = parseInt(fortMatch[1], 10);
  }

  const refMatch = text.match(/ref(?:lex)?\s*([+-]\d+)/i);
  if (refMatch && refMatch[1]) {
    saves.reflex = parseInt(refMatch[1], 10);
  }

  const willMatch = text.match(/will\s*([+-]\d+)/i);
  if (willMatch && willMatch[1]) {
    saves.will = parseInt(willMatch[1], 10);
  }

  // Check for save notes
  const noteMatch = text.match(/;\s*(.+)$/);
  if (noteMatch && noteMatch[1] && !noteMatch[1].match(/^(fort|ref|will)/i)) {
    saves.notes = noteMatch[1].trim();
  }

  return { ac, saves };
}

/**
 * Parses HP and resistances/weaknesses/immunities.
 * Format: "HP 120; Immunities fire; Resistances cold 10; Weaknesses good 5"
 */
function parseHP(text: string): {
  hp: number;
  hardness?: number;
  immunities: PF2eImmunity[];
  resistances: PF2eResistance[];
  weaknesses: PF2eWeakness[];
} {
  let hp = 1;
  let hardness: number | undefined;
  const immunities: PF2eImmunity[] = [];
  const resistances: PF2eResistance[] = [];
  const weaknesses: PF2eWeakness[] = [];

  // Parse HP
  const hpMatch = text.match(/hp\s*(\d+)/i);
  if (hpMatch && hpMatch[1]) {
    hp = parseInt(hpMatch[1], 10);
  }

  // Parse Hardness
  const hardnessMatch = text.match(/hardness\s*(\d+)/i);
  if (hardnessMatch && hardnessMatch[1]) {
    hardness = parseInt(hardnessMatch[1], 10);
  }

  // Parse Immunities
  const immMatch = text.match(/immunities?\s+([^;]+)/i);
  if (immMatch && immMatch[1]) {
    const immTypes = immMatch[1].split(',').map((s) => s.trim());
    for (const type of immTypes) {
      immunities.push({ type });
    }
  }

  // Parse Resistances
  const resMatch = text.match(/resistances?\s+([^;]+)/i);
  if (resMatch && resMatch[1]) {
    const resEntries = resMatch[1].split(',').map((s) => s.trim());
    for (const entry of resEntries) {
      const parts = entry.match(/([a-z\s]+)\s+(\d+)(?:\s+\(except\s+([^)]+)\))?/i);
      if (parts && parts[1] && parts[2]) {
        const resistance: PF2eResistance = {
          type: DAMAGE_TYPE_MAP[parts[1].trim().toLowerCase()] || parts[1].trim(),
          value: parseInt(parts[2], 10),
        };
        if (parts[3]) {
          resistance.exceptions = parts[3].split(',').map((e) => e.trim());
        }
        resistances.push(resistance);
      }
    }
  }

  // Parse Weaknesses
  const weakMatch = text.match(/weaknesses?\s+([^;]+)/i);
  if (weakMatch && weakMatch[1]) {
    const weakEntries = weakMatch[1].split(',').map((s) => s.trim());
    for (const entry of weakEntries) {
      const parts = entry.match(/([a-z\s]+)\s+(\d+)/i);
      if (parts && parts[1] && parts[2]) {
        weaknesses.push({
          type: DAMAGE_TYPE_MAP[parts[1].trim().toLowerCase()] || parts[1].trim(),
          value: parseInt(parts[2], 10),
        });
      }
    }
  }

  const result: {
    hp: number;
    hardness?: number;
    immunities: PF2eImmunity[];
    resistances: PF2eResistance[];
    weaknesses: PF2eWeakness[];
  } = { hp, immunities, resistances, weaknesses };

  if (hardness !== undefined) {
    result.hardness = hardness;
  }

  return result;
}

/**
 * Parses speed line.
 * Format: "Speed 25 feet, fly 40 feet, swim 20 feet"
 */
function parseSpeed(text: string): PF2eSpeed {
  const speed: PF2eSpeed = {};

  // Parse land speed
  const landMatch = text.match(/speed\s*(\d+)\s*(?:feet|ft\.?)/i);
  if (landMatch && landMatch[1]) {
    speed.land = parseInt(landMatch[1], 10);
  }

  // Parse other speeds
  const flyMatch = text.match(/fly\s*(\d+)\s*(?:feet|ft\.?)/i);
  if (flyMatch && flyMatch[1]) {
    speed.fly = parseInt(flyMatch[1], 10);
  }

  const swimMatch = text.match(/swim\s*(\d+)\s*(?:feet|ft\.?)/i);
  if (swimMatch && swimMatch[1]) {
    speed.swim = parseInt(swimMatch[1], 10);
  }

  const climbMatch = text.match(/climb\s*(\d+)\s*(?:feet|ft\.?)/i);
  if (climbMatch && climbMatch[1]) {
    speed.climb = parseInt(climbMatch[1], 10);
  }

  const burrowMatch = text.match(/burrow\s*(\d+)\s*(?:feet|ft\.?)/i);
  if (burrowMatch && burrowMatch[1]) {
    speed.burrow = parseInt(burrowMatch[1], 10);
  }

  return speed;
}

/**
 * Parses a strike (melee or ranged attack).
 * Format: "Melee [one-action] jaws +17 [+12/+7] (reach 10 feet), Damage 2d10+8 piercing"
 */
function parseStrike(text: string): PF2eStrike | null {
  // Extract attack name and modifier
  const attackMatch = text.match(/(?:melee|ranged)\s*(?:\[[\w-]+\])?\s*([a-z\s]+)\s*([+-]\d+)/i);
  if (!attackMatch || !attackMatch[1] || !attackMatch[2]) return null;

  const name = attackMatch[1].trim();
  const modifier = parseInt(attackMatch[2], 10);

  // Extract traits (in parentheses)
  const traitsMatch = text.match(/\(([^)]+)\)/);
  const traits = traitsMatch && traitsMatch[1]
    ? traitsMatch[1].split(',').map((t) => t.trim())
    : [];

  // Extract damage
  const damageMatch = text.match(/damage\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+(\w+)/i);
  if (!damageMatch || !damageMatch[1] || !damageMatch[2]) {
    return { name, modifier, traits, damage: { dice: { count: 1, dieSize: 6, modifier: 0 }, damageType: PF2eDamageType.PIERCING } };
  }

  const dice = parseDiceExpression(damageMatch[1]);
  const damageTypeStr = damageMatch[2].toLowerCase();
  const damageType = DAMAGE_TYPE_MAP[damageTypeStr] || PF2eDamageType.PIERCING;

  const damage: PF2eAttackDamage = {
    dice: dice || { count: 1, dieSize: 6, modifier: 0 },
    damageType,
  };

  // Check for additional damage
  const plusMatch = text.match(/plus\s+(\d+d\d+(?:\s*[+-]\s*\d+)?)\s+(\w+)/i);
  if (plusMatch && plusMatch[1] && plusMatch[2]) {
    const plusDice = parseDiceExpression(plusMatch[1]);
    const plusTypeStr = plusMatch[2].toLowerCase();
    const plusType = DAMAGE_TYPE_MAP[plusTypeStr] || PF2eDamageType.FIRE;

    if (plusDice) {
      damage.additional = [{ dice: plusDice, damageType: plusType }];
    }
  }

  // Extract effects after damage
  const effectsMatch = text.match(/(?:plus|and)\s+(.+)$/i);
  const effects = effectsMatch?.[1]?.trim();

  const strike: PF2eStrike = {
    name,
    modifier,
    traits,
    damage,
  };

  if (effects) {
    strike.effects = effects;
  }

  return strike;
}

/**
 * Parses an ability entry.
 * Format: "Ability Name [action-cost] (trait, trait) Description text."
 */
function parseAbility(text: string): PF2eCreatureAbility | null {
  // Match name and optional action cost
  const headerMatch = text.match(/^([^[\]]+?)(?:\s*\[(\d|one-action|two-action|three-action|free-action|reaction)\])?(?:\s*\(([^)]+)\))?\s*(.*)$/is);

  if (!headerMatch || !headerMatch[1]) return null;

  const name = headerMatch[1].trim();
  let actionCost: PF2eActionCost | undefined;
  const traits: string[] = [];
  const description = (headerMatch[4] || '').trim();

  // Parse action cost
  const costStr = headerMatch[2]?.toLowerCase();
  if (costStr) {
    if (costStr === '1' || costStr === 'one-action') {
      actionCost = PF2eActionCost.ONE;
    } else if (costStr === '2' || costStr === 'two-action') {
      actionCost = PF2eActionCost.TWO;
    } else if (costStr === '3' || costStr === 'three-action') {
      actionCost = PF2eActionCost.THREE;
    } else if (costStr === 'free-action') {
      actionCost = PF2eActionCost.FREE;
    } else if (costStr === 'reaction') {
      actionCost = PF2eActionCost.REACTION;
    }
  }

  // Parse traits
  if (headerMatch[3]) {
    traits.push(...headerMatch[3].split(',').map((t) => t.trim()));
  }

  const ability: PF2eCreatureAbility = { name, description };

  if (actionCost) {
    ability.actionCost = actionCost;
  }

  if (traits.length > 0) {
    ability.traits = traits;
  }

  // Parse frequency
  const freqMatch = description.match(/frequency\s+([^;.]+)/i);
  if (freqMatch && freqMatch[1]) {
    ability.frequency = freqMatch[1].trim();
  }

  // Parse trigger
  const triggerMatch = description.match(/trigger\s+([^;.]+)/i);
  if (triggerMatch && triggerMatch[1]) {
    ability.trigger = triggerMatch[1].trim();
  }

  // Parse requirements
  const reqMatch = description.match(/requirements?\s+([^;.]+)/i);
  if (reqMatch && reqMatch[1]) {
    ability.requirements = reqMatch[1].trim();
  }

  return ability;
}

// ============================================================================
// MAIN PARSER FUNCTIONS
// ============================================================================

/**
 * Parses a plain text PF2e stat block into a structured PF2eStatBlock object.
 *
 * @param text - The raw stat block text
 * @returns Parsed stat block object
 * @throws Error if parsing fails critically
 */
export function parsePF2eStatBlock(text: string): PF2eStatBlock {
  const result = parsePF2eStatBlockSafe(text);

  if (!result.result) {
    throw new Error(`Failed to parse PF2e stat block: ${result.errors.join('; ')}`);
  }

  return result.result;
}

/**
 * Safely parses a PF2e stat block, returning errors instead of throwing.
 *
 * @param text - The raw stat block text
 * @returns Object containing result (if successful) and any errors/warnings
 */
export function parsePF2eStatBlockSafe(text: string): PF2eParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const normalized = normalizeText(text);
  const lines = normalized.split('\n').map((l) => l.trim()).filter((l) => l);

  if (lines.length < 3) {
    errors.push('Stat block too short - need at least 3 lines');
    return { errors, warnings };
  }

  // Parse header (name and level)
  const firstLine = lines[0];
  if (!firstLine) {
    errors.push('Missing header line');
    return { errors, warnings };
  }

  const header = parseHeader(firstLine);
  if (!header) {
    errors.push(`Could not parse header from: "${firstLine}"`);
    return { errors, warnings };
  }

  // Parse traits line (usually second line)
  const secondLine = lines[1] || '';
  const traitInfo = parseTraits(secondLine);

  // Initialize the stat block with required fields
  const statBlock: PF2eStatBlock = {
    name: header.name,
    level: header.level,
    traits: traitInfo.traits,
    rarity: traitInfo.rarity,
    size: traitInfo.size,
    perception: { modifier: 0, senses: [] },
    languages: [],
    skills: [],
    abilities: { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 },
    ac: 10,
    saves: { fortitude: 0, reflex: 0, will: 0 },
    hp: 1,
    immunities: [],
    resistances: [],
    weaknesses: [],
    speed: {},
    melee: [],
    ranged: [],
  };

  // Add optional alignment if present
  if (traitInfo.alignment) {
    statBlock.alignment = traitInfo.alignment;
  }

  // Parse remaining lines
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const lower = line.toLowerCase();

    if (lower.startsWith('perception')) {
      statBlock.perception = parsePerception(line);
    } else if (lower.startsWith('language')) {
      statBlock.languages = parseLanguages(line);
    } else if (lower.startsWith('skill')) {
      statBlock.skills = parseSkills(line);
    } else if (/^str\s+[+-]?\d/i.test(line)) {
      statBlock.abilities = parseAbilities(line);
    } else if (lower.startsWith('ac')) {
      const defenses = parseDefenses(line);
      statBlock.ac = defenses.ac;
      statBlock.saves = defenses.saves;
    } else if (lower.startsWith('hp')) {
      const hpInfo = parseHP(line);
      statBlock.hp = hpInfo.hp;
      if (hpInfo.hardness !== undefined) {
        statBlock.hardness = hpInfo.hardness;
      }
      statBlock.immunities = hpInfo.immunities;
      statBlock.resistances = hpInfo.resistances;
      statBlock.weaknesses = hpInfo.weaknesses;
    } else if (lower.startsWith('speed')) {
      statBlock.speed = parseSpeed(line);
    } else if (lower.startsWith('melee')) {
      const strike = parseStrike(line);
      if (strike) {
        statBlock.melee.push(strike);
      }
    } else if (lower.startsWith('ranged')) {
      const strike = parseStrike(line);
      if (strike) {
        statBlock.ranged.push(strike);
      }
    } else if (!lower.startsWith('source') && line.length > 10) {
      // Try to parse as ability
      const ability = parseAbility(line);
      if (ability) {
        if (ability.actionCost) {
          statBlock.activeAbilities = statBlock.activeAbilities || [];
          statBlock.activeAbilities.push(ability);
        } else {
          statBlock.passiveAbilities = statBlock.passiveAbilities || [];
          statBlock.passiveAbilities.push(ability);
        }
      }
    }
  }

  // Validate required fields
  if (!statBlock.name) {
    errors.push('Missing creature name');
    return { errors, warnings };
  }

  return { result: statBlock, errors, warnings };
}

/**
 * Validates a parsed PF2e stat block for completeness.
 *
 * @param statBlock - The parsed stat block to validate
 * @returns List of validation issues
 */
export function validatePF2eStatBlock(statBlock: PF2eStatBlock): string[] {
  const issues: string[] = [];

  if (!statBlock.name) issues.push('Missing name');
  if (statBlock.level === undefined) issues.push('Missing level');
  if (statBlock.ac <= 0) issues.push('Invalid AC');
  if (statBlock.hp <= 0) issues.push('Invalid HP');

  return issues;
}
