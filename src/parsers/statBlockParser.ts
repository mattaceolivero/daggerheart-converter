/**
 * D&D 5e Stat Block Parser
 *
 * Parses plain text D&D 5e stat blocks (copy-pasted from books/PDFs)
 * into structured DnD5eMonster objects.
 *
 * @module parsers/statBlockParser
 * @version 1.0.0
 */

import {
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  Alignment,
  SpecialAlignment,
  LawChaosAxis,
  GoodEvilAxis,
  ArmorClass,
  HitPoints,
  DiceExpression,
  Speed,
  AbilityScores,
  SavingThrow,
  SkillProficiency,
  AbilityScore,
  Skill,
  DamageModifiers,
  DamageModifierEntry,
  DnD5eDamageType,
  DnD5eCondition,
  Senses,
  Sense,
  SenseType,
  ChallengeRating,
  Trait,
  DnD5eAttack,
  DnD5eAction,
  AttackType,
  AttackRange,
  AttackDamage,
  Multiattack,
  Reaction,
  LegendaryActions,
  LegendaryAction,
  BonusAction,
  CR_TO_XP,
  calculateProficiencyBonus,
} from '../models/dnd5e';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Result of a safe parse operation.
 */
export interface ParseResult {
  /** Successfully parsed monster, if any. */
  result?: DnD5eMonster;
  /** List of parsing errors or warnings. */
  errors: string[];
  /** List of non-fatal warnings. */
  warnings: string[];
}

/**
 * Internal parsed header result.
 */
interface ParsedHeader {
  name: string;
  size: CreatureSize;
  creatureType: CreatureType;
  subtypes: string[] | undefined;
  alignment: Alignment;
}

// ============================================================================
// CONSTANTS - Mappings
// ============================================================================

const SIZE_MAP: Record<string, CreatureSize> = {
  tiny: CreatureSize.TINY,
  small: CreatureSize.SMALL,
  medium: CreatureSize.MEDIUM,
  large: CreatureSize.LARGE,
  huge: CreatureSize.HUGE,
  gargantuan: CreatureSize.GARGANTUAN,
};

const TYPE_MAP: Record<string, CreatureType> = {
  aberration: CreatureType.ABERRATION,
  beast: CreatureType.BEAST,
  celestial: CreatureType.CELESTIAL,
  construct: CreatureType.CONSTRUCT,
  dragon: CreatureType.DRAGON,
  elemental: CreatureType.ELEMENTAL,
  fey: CreatureType.FEY,
  fiend: CreatureType.FIEND,
  giant: CreatureType.GIANT,
  humanoid: CreatureType.HUMANOID,
  monstrosity: CreatureType.MONSTROSITY,
  ooze: CreatureType.OOZE,
  plant: CreatureType.PLANT,
  undead: CreatureType.UNDEAD,
};

const SKILL_MAP: Record<string, Skill> = {
  acrobatics: Skill.ACROBATICS,
  'animal handling': Skill.ANIMAL_HANDLING,
  arcana: Skill.ARCANA,
  athletics: Skill.ATHLETICS,
  deception: Skill.DECEPTION,
  history: Skill.HISTORY,
  insight: Skill.INSIGHT,
  intimidation: Skill.INTIMIDATION,
  investigation: Skill.INVESTIGATION,
  medicine: Skill.MEDICINE,
  nature: Skill.NATURE,
  perception: Skill.PERCEPTION,
  performance: Skill.PERFORMANCE,
  persuasion: Skill.PERSUASION,
  religion: Skill.RELIGION,
  'sleight of hand': Skill.SLEIGHT_OF_HAND,
  stealth: Skill.STEALTH,
  survival: Skill.SURVIVAL,
};

const DAMAGE_TYPE_MAP: Record<string, DnD5eDamageType> = {
  acid: DnD5eDamageType.ACID,
  bludgeoning: DnD5eDamageType.BLUDGEONING,
  cold: DnD5eDamageType.COLD,
  fire: DnD5eDamageType.FIRE,
  force: DnD5eDamageType.FORCE,
  lightning: DnD5eDamageType.LIGHTNING,
  necrotic: DnD5eDamageType.NECROTIC,
  piercing: DnD5eDamageType.PIERCING,
  poison: DnD5eDamageType.POISON,
  psychic: DnD5eDamageType.PSYCHIC,
  radiant: DnD5eDamageType.RADIANT,
  slashing: DnD5eDamageType.SLASHING,
  thunder: DnD5eDamageType.THUNDER,
};

const CONDITION_MAP: Record<string, DnD5eCondition> = {
  blinded: DnD5eCondition.BLINDED,
  charmed: DnD5eCondition.CHARMED,
  deafened: DnD5eCondition.DEAFENED,
  exhaustion: DnD5eCondition.EXHAUSTION,
  frightened: DnD5eCondition.FRIGHTENED,
  grappled: DnD5eCondition.GRAPPLED,
  incapacitated: DnD5eCondition.INCAPACITATED,
  invisible: DnD5eCondition.INVISIBLE,
  paralyzed: DnD5eCondition.PARALYZED,
  petrified: DnD5eCondition.PETRIFIED,
  poisoned: DnD5eCondition.POISONED,
  prone: DnD5eCondition.PRONE,
  restrained: DnD5eCondition.RESTRAINED,
  stunned: DnD5eCondition.STUNNED,
  unconscious: DnD5eCondition.UNCONSCIOUS,
};

const SENSE_TYPE_MAP: Record<string, SenseType> = {
  blindsight: SenseType.BLINDSIGHT,
  darkvision: SenseType.DARKVISION,
  tremorsense: SenseType.TREMORSENSE,
  truesight: SenseType.TRUESIGHT,
};

const ABILITY_MAP: Record<string, AbilityScore> = {
  str: AbilityScore.STRENGTH,
  strength: AbilityScore.STRENGTH,
  dex: AbilityScore.DEXTERITY,
  dexterity: AbilityScore.DEXTERITY,
  con: AbilityScore.CONSTITUTION,
  constitution: AbilityScore.CONSTITUTION,
  int: AbilityScore.INTELLIGENCE,
  intelligence: AbilityScore.INTELLIGENCE,
  wis: AbilityScore.WISDOM,
  wisdom: AbilityScore.WISDOM,
  cha: AbilityScore.CHARISMA,
  charisma: AbilityScore.CHARISMA,
};

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
 * Splits text into logical sections based on common headers.
 */
function splitIntoSections(text: string): Map<string, string> {
  const sections = new Map<string, string>();
  const lines = text.split('\n');

  let currentSection = 'header';
  let currentContent: string[] = [];

  const sectionHeaders = [
    'actions',
    'bonus actions',
    'reactions',
    'legendary actions',
    'lair actions',
    'mythic actions',
  ];

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    if (sectionHeaders.includes(trimmed)) {
      // Save previous section
      if (currentContent.length > 0) {
        sections.set(currentSection, currentContent.join('\n').trim());
      }
      currentSection = trimmed;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentContent.length > 0) {
    sections.set(currentSection, currentContent.join('\n').trim());
  }

  return sections;
}

/**
 * Parses dice expression like "2d8+4" or "1d6-1".
 */
function parseDiceExpression(text: string): DiceExpression | null {
  // Match patterns like "2d8", "2d8+4", "2d8-2", "1d6 + 2"
  const match = text.match(/(\d+)d(\d+)\s*([+-]\s*\d+)?/i);
  if (!match || !match[1] || !match[2]) return null;

  const count = parseInt(match[1], 10);
  const dieSize = parseInt(match[2], 10) as 4 | 6 | 8 | 10 | 12 | 20 | 100;
  let modifier = 0;

  if (match[3]) {
    modifier = parseInt(match[3].replace(/\s/g, ''), 10);
  }

  return { count, dieSize, modifier };
}

/**
 * Parses alignment from text.
 */
function parseAlignment(text: string): Alignment {
  const lower = text.toLowerCase().trim();

  // Check special alignments first
  if (lower.includes('unaligned')) return SpecialAlignment.UNALIGNED;
  if (lower.includes('any evil')) return SpecialAlignment.ANY_EVIL;
  if (lower.includes('any good')) return SpecialAlignment.ANY_GOOD;
  if (lower.includes('any chaotic')) return SpecialAlignment.ANY_CHAOTIC;
  if (lower.includes('any lawful')) return SpecialAlignment.ANY_LAWFUL;
  if (lower.includes('any non-good')) return SpecialAlignment.ANY_NON_GOOD;
  if (lower.includes('any non-evil')) return SpecialAlignment.ANY_NON_EVIL;
  if (lower.includes('any non-lawful')) return SpecialAlignment.ANY_NON_LAWFUL;
  if (lower.includes('any non-chaotic')) return SpecialAlignment.ANY_NON_CHAOTIC;
  if (lower === 'any alignment' || lower === 'any') return SpecialAlignment.ANY;
  if (lower.includes('typically neutral evil')) return SpecialAlignment.TYPICALLY_NEUTRAL_EVIL;
  if (lower.includes('typically neutral good')) return SpecialAlignment.TYPICALLY_NEUTRAL_GOOD;
  if (lower.includes('typically lawful evil')) return SpecialAlignment.TYPICALLY_LAWFUL_EVIL;
  if (lower.includes('typically lawful good')) return SpecialAlignment.TYPICALLY_LAWFUL_GOOD;
  if (lower.includes('typically chaotic evil')) return SpecialAlignment.TYPICALLY_CHAOTIC_EVIL;
  if (lower.includes('typically chaotic good')) return SpecialAlignment.TYPICALLY_CHAOTIC_GOOD;
  if (lower.includes('typically neutral')) return SpecialAlignment.TYPICALLY_NEUTRAL;

  // Parse standard alignments
  let lawChaos: LawChaosAxis = LawChaosAxis.NEUTRAL;
  let goodEvil: GoodEvilAxis = GoodEvilAxis.NEUTRAL;

  if (lower.includes('lawful')) lawChaos = LawChaosAxis.LAWFUL;
  else if (lower.includes('chaotic')) lawChaos = LawChaosAxis.CHAOTIC;

  if (lower.includes('good')) goodEvil = GoodEvilAxis.GOOD;
  else if (lower.includes('evil')) goodEvil = GoodEvilAxis.EVIL;

  return { lawChaos, goodEvil };
}

/**
 * Parses the header section (name, size, type, alignment).
 */
function parseHeader(
  text: string,
  errors: string[]
): ParsedHeader | null {
  const lines = text.split('\n').filter((l) => l.trim());

  if (lines.length < 2) {
    errors.push('Header section must have at least 2 lines (name and type line)');
    return null;
  }

  const nameLine = lines[0];
  const typeLineFull = lines[1];
  if (!nameLine || !typeLineFull) {
    errors.push('Missing name or type line');
    return null;
  }

  const name = nameLine.trim();
  const typeLine = typeLineFull.toLowerCase().trim();

  // Parse size
  let size: CreatureSize | undefined;
  for (const [key, value] of Object.entries(SIZE_MAP)) {
    if (typeLine.startsWith(key)) {
      size = value;
      break;
    }
  }

  if (!size) {
    errors.push(`Could not parse size from: "${typeLineFull}"`);
    return null;
  }

  // Parse creature type and subtypes
  // Format: "Small humanoid (goblinoid), neutral evil"
  let creatureType: CreatureType | undefined;
  let subtypes: string[] | undefined;

  // Extract subtype if present (in parentheses)
  const subtypeMatch = typeLine.match(/\(([^)]+)\)/);
  if (subtypeMatch && subtypeMatch[1]) {
    subtypes = subtypeMatch[1].split(',').map((s) => s.trim());
  }

  // Find creature type
  for (const [key, value] of Object.entries(TYPE_MAP)) {
    if (typeLine.includes(key)) {
      creatureType = value;
      break;
    }
  }

  if (!creatureType) {
    errors.push(`Could not parse creature type from: "${typeLineFull}"`);
    return null;
  }

  // Parse alignment (after comma)
  const commaIndex = typeLine.lastIndexOf(',');
  let alignment: Alignment = SpecialAlignment.UNALIGNED;
  if (commaIndex !== -1) {
    alignment = parseAlignment(typeLine.substring(commaIndex + 1));
  }

  return { name, size, creatureType, subtypes, alignment };
}

/**
 * Parses Armor Class line.
 */
function parseArmorClass(text: string): ArmorClass | null {
  const match = text.match(/armor\s*class\s*(\d+)(?:\s*\(([^)]+)\))?/i);
  if (!match || !match[1]) return null;

  const value = parseInt(match[1], 10);
  const armorInfo = match[2];

  if (!armorInfo) {
    return { value };
  }

  // Parse armor type and additional sources
  const parts = armorInfo.split(',').map((p) => p.trim());
  const armorType = parts[0];
  const additionalSources = parts.length > 1 ? parts.slice(1) : undefined;

  const result: ArmorClass = { value };
  if (armorType) {
    result.armorType = armorType;
  }
  if (additionalSources && additionalSources.length > 0) {
    result.additionalSources = additionalSources;
  }

  return result;
}

/**
 * Parses Hit Points line.
 */
function parseHitPoints(text: string): HitPoints | null {
  const match = text.match(/hit\s*points\s*(\d+)(?:\s*\(([^)]+)\))?/i);
  if (!match || !match[1]) return null;

  const average = parseInt(match[1], 10);
  const diceStr = match[2];

  if (!diceStr) {
    // No formula, estimate one
    return {
      average,
      formula: { count: 1, dieSize: 8, modifier: average - 4 },
    };
  }

  const formula = parseDiceExpression(diceStr);
  if (!formula) {
    return {
      average,
      formula: { count: 1, dieSize: 8, modifier: average - 4 },
    };
  }

  return { average, formula };
}

/**
 * Parses Speed line.
 */
function parseSpeed(text: string): Speed {
  const speed: Speed = {};

  // Match base walk speed
  const walkMatch = text.match(/speed\s*(\d+)\s*ft\.?/i);
  if (walkMatch && walkMatch[1]) {
    speed.walk = parseInt(walkMatch[1], 10);
  }

  // Match other speeds
  const flyMatch = text.match(/fly\s*(\d+)\s*ft\.?(?:\s*\(hover\))?/i);
  if (flyMatch && flyMatch[1]) {
    speed.fly = parseInt(flyMatch[1], 10);
    speed.hover = text.toLowerCase().includes('hover');
  }

  const swimMatch = text.match(/swim\s*(\d+)\s*ft\.?/i);
  if (swimMatch && swimMatch[1]) {
    speed.swim = parseInt(swimMatch[1], 10);
  }

  const climbMatch = text.match(/climb\s*(\d+)\s*ft\.?/i);
  if (climbMatch && climbMatch[1]) {
    speed.climb = parseInt(climbMatch[1], 10);
  }

  const burrowMatch = text.match(/burrow\s*(\d+)\s*ft\.?/i);
  if (burrowMatch && burrowMatch[1]) {
    speed.burrow = parseInt(burrowMatch[1], 10);
  }

  return speed;
}

/**
 * Parses ability scores from the stat line.
 */
function parseAbilityScores(text: string): AbilityScores | null {
  // Match patterns like "8 (-1)" or just "8"
  const scorePattern = /(\d+)\s*(?:\([+-]?\d+\))?/g;
  const scores: number[] = [];
  let match: RegExpExecArray | null;

  while ((match = scorePattern.exec(text)) !== null) {
    if (match[1]) {
      scores.push(parseInt(match[1], 10));
    }
  }

  if (scores.length < 6) {
    return null;
  }

  const str = scores[0];
  const dex = scores[1];
  const con = scores[2];
  const int = scores[3];
  const wis = scores[4];
  const cha = scores[5];

  if (str === undefined || dex === undefined || con === undefined ||
      int === undefined || wis === undefined || cha === undefined) {
    return null;
  }

  return {
    STR: str,
    DEX: dex,
    CON: con,
    INT: int,
    WIS: wis,
    CHA: cha,
  };
}

/**
 * Parses saving throws line.
 */
function parseSavingThrows(text: string): SavingThrow[] {
  const savingThrows: SavingThrow[] = [];
  const pattern = /(str|dex|con|int|wis|cha)\s*([+-]\d+)/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match[1] && match[2]) {
      const abilityKey = match[1].toLowerCase();
      const modifier = parseInt(match[2], 10);
      const ability = ABILITY_MAP[abilityKey];

      if (ability) {
        savingThrows.push({ ability, modifier });
      }
    }
  }

  return savingThrows;
}

/**
 * Parses skills line.
 */
function parseSkills(text: string): SkillProficiency[] {
  const skills: SkillProficiency[] = [];

  // Match skill name followed by modifier
  for (const [skillName, skill] of Object.entries(SKILL_MAP)) {
    const pattern = new RegExp(`${skillName}\\s*([+-]\\d+)`, 'i');
    const match = text.match(pattern);

    if (match && match[1]) {
      skills.push({
        skill,
        modifier: parseInt(match[1], 10),
      });
    }
  }

  return skills;
}

/**
 * Parses damage modifiers (resistances, immunities, vulnerabilities).
 */
function parseDamageModifiers(
  resistanceText: string,
  immunityText: string,
  vulnerabilityText: string
): DamageModifiers {
  const parseEntry = (text: string): DamageModifierEntry[] => {
    const entries: DamageModifierEntry[] = [];
    const lower = text.toLowerCase();

    for (const [typeName, damageType] of Object.entries(DAMAGE_TYPE_MAP)) {
      if (lower.includes(typeName)) {
        // Check for conditions
        const conditionMatch = lower.match(
          new RegExp(`${typeName}[^;,]*(from[^;,]+)`, 'i')
        );
        const condition = conditionMatch?.[1]?.trim();

        const entry: DamageModifierEntry = { damageType };
        if (condition) {
          entry.condition = condition;
        }
        entries.push(entry);
      }
    }

    return entries;
  };

  return {
    resistances: parseEntry(resistanceText),
    immunities: parseEntry(immunityText),
    vulnerabilities: parseEntry(vulnerabilityText),
  };
}

/**
 * Parses condition immunities.
 */
function parseConditionImmunities(text: string): DnD5eCondition[] {
  const conditions: DnD5eCondition[] = [];
  const lower = text.toLowerCase();

  for (const [condName, condition] of Object.entries(CONDITION_MAP)) {
    if (lower.includes(condName)) {
      conditions.push(condition);
    }
  }

  return conditions;
}

/**
 * Parses senses line.
 */
function parseSenses(text: string): Senses {
  const specialSenses: Sense[] = [];
  let passivePerception = 10;

  // Parse special senses
  for (const [senseName, senseType] of Object.entries(SENSE_TYPE_MAP)) {
    const pattern = new RegExp(`${senseName}\\s*(\\d+)\\s*ft\\.?`, 'i');
    const match = text.match(pattern);

    if (match && match[1]) {
      const sense: Sense = {
        type: senseType,
        range: parseInt(match[1], 10),
      };

      // Check for "blind beyond" for blindsight
      if (senseName === 'blindsight' && text.toLowerCase().includes('blind beyond')) {
        sense.blindBeyond = true;
      }

      specialSenses.push(sense);
    }
  }

  // Parse passive perception
  const ppMatch = text.match(/passive\s*perception\s*(\d+)/i);
  if (ppMatch && ppMatch[1]) {
    passivePerception = parseInt(ppMatch[1], 10);
  }

  return { specialSenses, passivePerception };
}

/**
 * Parses languages line.
 */
function parseLanguages(text: string): string[] {
  const langText = text.replace(/languages?\s*/i, '').trim();

  if (langText === '-' || langText === '' || langText.toLowerCase() === 'none') {
    return [];
  }

  return langText.split(',').map((l) => l.trim()).filter((l) => l);
}

/**
 * Parses Challenge Rating line.
 */
function parseChallengeRating(text: string): ChallengeRating | null {
  const match = text.match(/challenge\s*([\d/]+)\s*(?:\(([^)]+)\s*xp\))?/i);
  if (!match || !match[1]) return null;

  const crStr = match[1].trim();
  let xp = 0;

  if (match[2]) {
    xp = parseInt(match[2].replace(/,/g, ''), 10);
  } else {
    // Look up XP from CR
    xp = CR_TO_XP[crStr] ?? 0;
  }

  // Parse CR to numeric if fractional
  const cr = crStr.includes('/') ? crStr : parseInt(crStr, 10);

  return { cr, xp };
}

/**
 * Parses a trait or feature entry.
 */
function parseTrait(text: string): Trait {
  // Format: "Trait Name. Description text..."
  // Or: "Trait Name (Recharge 5-6). Description text..."
  const match = text.match(/^([^.]+?)(?:\s*\(([^)]+)\))?\.\s*(.+)$/s);

  if (!match || !match[1] || !match[3]) {
    return { name: 'Unknown', description: text };
  }

  const name = match[1].trim();
  const parens = match[2];
  const description = match[3].trim();

  const trait: Trait = { name, description };

  // Parse recharge
  if (parens) {
    const rechargeMatch = parens.match(/recharge\s*(\d+)(?:-(\d+))?/i);
    if (rechargeMatch && rechargeMatch[1]) {
      trait.recharge = {
        minRoll: parseInt(rechargeMatch[1], 10),
        maxRoll: rechargeMatch[2] ? parseInt(rechargeMatch[2], 10) : 6,
      };
    }

    // Parse uses
    const usesMatch = parens.match(/(\d+)\/(?:short|long)\s*rest/i);
    if (usesMatch && usesMatch[1]) {
      trait.uses = {
        count: parseInt(usesMatch[1], 10),
        rechargeOn: parens.toLowerCase().includes('short') ? 'short rest' : 'long rest',
      };
    }
  }

  return trait;
}

/**
 * Parses an attack action.
 */
function parseAttack(text: string): DnD5eAttack | null {
  // Format: "Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage."
  const nameMatch = text.match(/^([^.]+)\./);
  if (!nameMatch || !nameMatch[1]) return null;

  const name = nameMatch[1].trim();
  const restText = text.substring(nameMatch[0].length);

  // Parse attack type
  let attackType: AttackType = AttackType.MELEE_WEAPON;
  if (restText.toLowerCase().includes('melee or ranged weapon')) {
    attackType = AttackType.MELEE_OR_RANGED_WEAPON;
  } else if (restText.toLowerCase().includes('melee or ranged spell')) {
    attackType = AttackType.MELEE_OR_RANGED_SPELL;
  } else if (restText.toLowerCase().includes('ranged weapon')) {
    attackType = AttackType.RANGED_WEAPON;
  } else if (restText.toLowerCase().includes('ranged spell')) {
    attackType = AttackType.RANGED_SPELL;
  } else if (restText.toLowerCase().includes('melee spell')) {
    attackType = AttackType.MELEE_SPELL;
  }

  // Parse to-hit
  const toHitMatch = restText.match(/([+-]\d+)\s*to\s*hit/i);
  const toHit = toHitMatch && toHitMatch[1] ? parseInt(toHitMatch[1], 10) : 0;

  // Parse range/reach
  const range: AttackRange = {};
  const reachMatch = restText.match(/reach\s*(\d+)\s*ft\.?/i);
  if (reachMatch && reachMatch[1]) {
    range.reach = parseInt(reachMatch[1], 10);
  }

  const rangeMatch = restText.match(/range\s*(\d+)(?:\/(\d+))?\s*ft\.?/i);
  if (rangeMatch && rangeMatch[1]) {
    range.normal = parseInt(rangeMatch[1], 10);
    if (rangeMatch[2]) {
      range.long = parseInt(rangeMatch[2], 10);
    }
  }

  // Parse target
  const targetMatch = restText.match(/(?:reach|range)[^.]+,\s*([^.]+)\./i);
  const target = targetMatch && targetMatch[1] ? targetMatch[1].trim() : 'one target';

  // Parse damage
  const hitMatch = restText.match(/hit:\s*(\d+)\s*\(([^)]+)\)\s*(\w+)\s*damage/i);
  if (!hitMatch || !hitMatch[2] || !hitMatch[3]) {
    return null;
  }

  const damageDice = parseDiceExpression(hitMatch[2]);
  const damageTypeStr = hitMatch[3].toLowerCase();
  const damageType = DAMAGE_TYPE_MAP[damageTypeStr] ?? DnD5eDamageType.BLUDGEONING;

  if (!damageDice) {
    return null;
  }

  const damage: AttackDamage = {
    dice: damageDice,
    damageType,
  };

  // Check for additional damage
  const additionalMatch = restText.match(
    /plus\s*(\d+)\s*\(([^)]+)\)\s*(\w+)\s*damage/i
  );
  if (additionalMatch && additionalMatch[2] && additionalMatch[3]) {
    const addDice = parseDiceExpression(additionalMatch[2]);
    const addTypeStr = additionalMatch[3].toLowerCase();
    const addType = DAMAGE_TYPE_MAP[addTypeStr];

    if (addDice && addType) {
      damage.additionalDamage = [{ dice: addDice, damageType: addType }];
    }
  }

  // Check for additional effects
  const afterDamage = restText.match(/damage[^.]*\.(.+)$/is);
  const additionalEffects = afterDamage?.[1]?.trim();

  const attack: DnD5eAttack = {
    name,
    attackType,
    toHit,
    range,
    target,
    damage,
  };

  if (additionalEffects) {
    attack.additionalEffects = additionalEffects;
  }

  return attack;
}

/**
 * Parses multiattack action.
 */
function parseMultiattack(text: string): Multiattack | null {
  const match = text.match(/multiattack\.\s*(.+)/is);
  if (!match || !match[1]) return null;

  const description = match[1].trim();

  // Try to parse structured attacks
  const attacks: { attackName: string; count: number }[] = [];

  // Match patterns like "two claw attacks" or "three bite attacks"
  const attackPattern = /(one|two|three|four|five|1|2|3|4|5)\s+(\w+)\s+attacks?/gi;
  let attackMatch: RegExpExecArray | null;

  const numberMap: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
  };

  while ((attackMatch = attackPattern.exec(description)) !== null) {
    if (attackMatch[1] && attackMatch[2]) {
      const countStr = attackMatch[1].toLowerCase();
      const count = numberMap[countStr] ?? 1;
      const attackName = attackMatch[2];

      attacks.push({ attackName, count });
    }
  }

  const result: Multiattack = { description };
  if (attacks.length > 0) {
    result.attacks = attacks;
  }

  return result;
}

/**
 * Parses a non-attack action.
 */
function parseAction(text: string): DnD5eAction {
  // Similar to trait parsing
  const match = text.match(/^([^.]+?)(?:\s*\(([^)]+)\))?\.\s*(.+)$/s);

  if (!match || !match[1] || !match[3]) {
    return { name: 'Unknown', description: text };
  }

  const name = match[1].trim();
  const parens = match[2];
  const description = match[3].trim();

  const action: DnD5eAction = { name, description };

  // Parse recharge
  if (parens) {
    const rechargeMatch = parens.match(/recharge\s*(\d+)(?:-(\d+))?/i);
    if (rechargeMatch && rechargeMatch[1]) {
      action.recharge = {
        minRoll: parseInt(rechargeMatch[1], 10),
        maxRoll: rechargeMatch[2] ? parseInt(rechargeMatch[2], 10) : 6,
      };
    }
  }

  // Parse saving throw
  const saveMatch = description.match(/dc\s*(\d+)\s*(strength|dexterity|constitution|intelligence|wisdom|charisma)/i);
  if (saveMatch && saveMatch[1] && saveMatch[2]) {
    const dc = parseInt(saveMatch[1], 10);
    const abilityStr = saveMatch[2].toLowerCase();
    const ability = ABILITY_MAP[abilityStr];

    if (ability) {
      action.savingThrow = { dc, ability };
    }
  }

  // Parse damage if present
  const damageMatch = description.match(/(\d+)\s*\(([^)]+)\)\s*(\w+)\s*damage/i);
  if (damageMatch && damageMatch[2] && damageMatch[3]) {
    const dice = parseDiceExpression(damageMatch[2]);
    const typeStr = damageMatch[3].toLowerCase();
    const damageType = DAMAGE_TYPE_MAP[typeStr];

    if (dice && damageType) {
      action.damage = { dice, damageType };
    }
  }

  // Parse area of effect
  const aoePatterns = [
    { type: 'cone' as const, pattern: /(\d+)-foot cone/i },
    { type: 'line' as const, pattern: /(\d+)-foot line/i },
    { type: 'sphere' as const, pattern: /(\d+)-foot(?:-radius)? sphere/i },
    { type: 'cube' as const, pattern: /(\d+)-foot cube/i },
    { type: 'cylinder' as const, pattern: /(\d+)-foot(?:-radius)? cylinder/i },
  ];

  for (const { type, pattern } of aoePatterns) {
    const aoeMatch = description.match(pattern);
    if (aoeMatch && aoeMatch[1]) {
      action.areaOfEffect = {
        type,
        size: parseInt(aoeMatch[1], 10),
      };
      break;
    }
  }

  return action;
}

/**
 * Parses a reaction.
 */
function parseReaction(text: string): Reaction {
  const match = text.match(/^([^.]+)\.\s*(.+)$/s);

  if (!match || !match[1] || !match[2]) {
    return { name: 'Unknown', description: text };
  }

  const name = match[1].trim();
  const description = match[2].trim();

  // Try to extract trigger
  const triggerMatch = description.match(/when\s+([^,]+)/i);

  const reaction: Reaction = { name, description };
  if (triggerMatch?.[1]) {
    reaction.trigger = triggerMatch[1].trim();
  }

  return reaction;
}

/**
 * Parses legendary actions section.
 */
function parseLegendaryActions(text: string): LegendaryActions | null {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return null;

  const firstLine = lines[0];
  if (!firstLine) return null;

  // First line is usually the description
  const descMatch = firstLine.match(/can\s*take\s*(\d+)\s*legendary\s*actions?/i);
  const count = descMatch && descMatch[1] ? parseInt(descMatch[1], 10) : 3;

  const actions: LegendaryAction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Match "Action Name (Costs X Actions). Description"
    const match = trimmedLine.match(/^([^.]+?)(?:\s*\(costs?\s*(\d+)\s*actions?\))?\.\s*(.+)$/is);

    if (match && match[1] && match[3]) {
      const actionName = match[1].trim();
      const cost = match[2] ? parseInt(match[2], 10) : 1;
      const actionDescription = match[3].trim();

      actions.push({ name: actionName, description: actionDescription, cost });
    }
  }

  return {
    count,
    description: firstLine,
    actions,
  };
}

/**
 * Parses bonus actions section.
 */
function parseBonusActions(text: string): BonusAction[] {
  const bonusActions: BonusAction[] = [];
  const entries = text.split(/(?=^[A-Z][^.]+\.)/m).filter((e) => e.trim());

  for (const entry of entries) {
    const match = entry.match(/^([^.]+?)(?:\s*\(([^)]+)\))?\.\s*(.+)$/s);

    if (match && match[1] && match[3]) {
      const name = match[1].trim();
      const parens = match[2];
      const description = match[3].trim();

      const bonusAction: BonusAction = { name, description };

      // Parse recharge if present
      if (parens) {
        const rechargeMatch = parens.match(/recharge\s*(\d+)(?:-(\d+))?/i);
        if (rechargeMatch && rechargeMatch[1]) {
          bonusAction.recharge = {
            minRoll: parseInt(rechargeMatch[1], 10),
            maxRoll: rechargeMatch[2] ? parseInt(rechargeMatch[2], 10) : 6,
          };
        }
      }

      bonusActions.push(bonusAction);
    }
  }

  return bonusActions;
}

// ============================================================================
// MAIN PARSER FUNCTIONS
// ============================================================================

/**
 * Parses a plain text D&D 5e stat block into a structured DnD5eMonster object.
 *
 * @param text - The raw stat block text
 * @returns Parsed monster object
 * @throws Error if parsing fails critically
 */
export function parseStatBlock(text: string): DnD5eMonster {
  const result = parseStatBlockSafe(text);

  if (!result.result) {
    throw new Error(`Failed to parse stat block: ${result.errors.join('; ')}`);
  }

  return result.result;
}

/**
 * Safely parses a stat block, returning errors instead of throwing.
 *
 * @param text - The raw stat block text
 * @returns Object containing result (if successful) and any errors/warnings
 */
export function parseStatBlockSafe(text: string): ParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const normalized = normalizeText(text);
  const sections = splitIntoSections(normalized);

  const headerText = sections.get('header') ?? '';

  // Parse header (name, size, type, alignment)
  const header = parseHeader(headerText, errors);
  if (!header) {
    return { errors, warnings };
  }

  // Find stats in header section
  const lines = headerText.split('\n');
  let acLine = '';
  let hpLine = '';
  let speedLine = '';
  let statsLine = '';
  let savesLine = '';
  let skillsLine = '';
  let resistanceLine = '';
  let immunityLine = '';
  let vulnerabilityLine = '';
  let conditionImmunityLine = '';
  let sensesLine = '';
  let languagesLine = '';
  let crLine = '';
  const traitLines: string[] = [];

  let inTraits = false;

  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;

    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();

    if (lower.startsWith('armor class')) {
      acLine = trimmed;
    } else if (lower.startsWith('hit points')) {
      hpLine = trimmed;
    } else if (lower.startsWith('speed')) {
      speedLine = trimmed;
    } else if (/^(str|strength)\s+/i.test(lower) || /^\d+\s*\([+-]?\d+\)/.test(lower)) {
      // This is the stats line or header line
      if (/^str\s+dex\s+con/i.test(lower)) {
        // This is the header, next line has values
        continue;
      }
      statsLine = trimmed;
    } else if (lower.startsWith('saving throws')) {
      savesLine = trimmed;
    } else if (lower.startsWith('skills')) {
      skillsLine = trimmed;
    } else if (lower.startsWith('damage resistances')) {
      resistanceLine = trimmed;
    } else if (lower.startsWith('damage immunities')) {
      immunityLine = trimmed;
    } else if (lower.startsWith('damage vulnerabilities')) {
      vulnerabilityLine = trimmed;
    } else if (lower.startsWith('condition immunities')) {
      conditionImmunityLine = trimmed;
    } else if (lower.startsWith('senses')) {
      sensesLine = trimmed;
    } else if (lower.startsWith('languages')) {
      languagesLine = trimmed;
    } else if (lower.startsWith('challenge')) {
      crLine = trimmed;
      inTraits = true; // Everything after CR is traits
    } else if (inTraits && trimmed) {
      traitLines.push(trimmed);
    }
  }

  // Parse core stats
  const armorClass = parseArmorClass(acLine);
  if (!armorClass) {
    errors.push('Could not parse Armor Class');
    return { errors, warnings };
  }

  const hitPoints = parseHitPoints(hpLine);
  if (!hitPoints) {
    errors.push('Could not parse Hit Points');
    return { errors, warnings };
  }

  const speed = parseSpeed(speedLine);

  const abilityScores = parseAbilityScores(statsLine);
  if (!abilityScores) {
    errors.push('Could not parse ability scores');
    return { errors, warnings };
  }

  const senses = parseSenses(sensesLine);
  const languages = parseLanguages(languagesLine);

  const challengeRating = parseChallengeRating(crLine);
  if (!challengeRating) {
    errors.push('Could not parse Challenge Rating');
    return { errors, warnings };
  }

  const proficiencyBonus = calculateProficiencyBonus(challengeRating.cr);

  // Build monster object
  const monster: DnD5eMonster = {
    name: header.name,
    size: header.size,
    creatureType: header.creatureType,
    alignment: header.alignment,
    armorClass,
    hitPoints,
    speed,
    abilityScores,
    senses,
    languages,
    challengeRating,
    proficiencyBonus,
  };

  // Add optional subtypes
  if (header.subtypes) {
    monster.subtypes = header.subtypes;
  }

  // Parse optional sections
  if (savesLine) {
    const saves = parseSavingThrows(savesLine);
    if (saves.length > 0) {
      monster.savingThrows = saves;
    }
  }

  if (skillsLine) {
    const skills = parseSkills(skillsLine);
    if (skills.length > 0) {
      monster.skills = skills;
    }
  }

  if (resistanceLine || immunityLine || vulnerabilityLine) {
    const damageModifiers = parseDamageModifiers(
      resistanceLine,
      immunityLine,
      vulnerabilityLine
    );
    if (
      damageModifiers.resistances.length > 0 ||
      damageModifiers.immunities.length > 0 ||
      damageModifiers.vulnerabilities.length > 0
    ) {
      monster.damageModifiers = damageModifiers;
    }
  }

  if (conditionImmunityLine) {
    const conditions = parseConditionImmunities(conditionImmunityLine);
    if (conditions.length > 0) {
      monster.conditionImmunities = conditions;
    }
  }

  // Parse traits
  if (traitLines.length > 0) {
    const traitText = traitLines.join(' ');
    // Split on trait boundaries (Name. followed by description)
    const traitEntries = traitText.split(/(?=(?:^|\s)[A-Z][^.]+\.\s)/g).filter((e) => e.trim());

    const traits: Trait[] = [];
    for (const entry of traitEntries) {
      if (entry.trim()) {
        traits.push(parseTrait(entry.trim()));
      }
    }

    if (traits.length > 0) {
      monster.traits = traits;
    }
  }

  // Parse actions section
  const actionsText = sections.get('actions');
  if (actionsText) {
    const actionEntries = actionsText.split(/(?=^[A-Z][^.]+\.)/m).filter((e) => e.trim());
    const attacks: DnD5eAttack[] = [];
    const actions: DnD5eAction[] = [];

    for (const entry of actionEntries) {
      // Check if it's a multiattack
      if (entry.toLowerCase().startsWith('multiattack')) {
        const ma = parseMultiattack(entry);
        if (ma) {
          monster.multiattack = ma;
        }
        continue;
      }

      // Check if it's an attack
      if (entry.toLowerCase().includes('attack:') && entry.toLowerCase().includes('to hit')) {
        const attack = parseAttack(entry);
        if (attack) {
          attacks.push(attack);
          continue;
        }
      }

      // Otherwise treat as non-attack action
      actions.push(parseAction(entry));
    }

    if (attacks.length > 0) {
      monster.attacks = attacks;
    }

    if (actions.length > 0) {
      monster.actions = actions;
    }
  }

  // Parse bonus actions
  const bonusActionsText = sections.get('bonus actions');
  if (bonusActionsText) {
    const bonusActions = parseBonusActions(bonusActionsText);
    if (bonusActions.length > 0) {
      monster.bonusActions = bonusActions;
    }
  }

  // Parse reactions
  const reactionsText = sections.get('reactions');
  if (reactionsText) {
    const reactionEntries = reactionsText.split(/(?=^[A-Z][^.]+\.)/m).filter((e) => e.trim());
    const reactions: Reaction[] = [];

    for (const entry of reactionEntries) {
      reactions.push(parseReaction(entry));
    }

    if (reactions.length > 0) {
      monster.reactions = reactions;
    }
  }

  // Parse legendary actions
  const legendaryText = sections.get('legendary actions');
  if (legendaryText) {
    const legendaryActions = parseLegendaryActions(legendaryText);
    if (legendaryActions) {
      monster.legendaryActions = legendaryActions;
    }
  }

  return { result: monster, errors, warnings };
}

/**
 * Validates a parsed stat block for completeness.
 *
 * @param monster - The parsed monster to validate
 * @returns List of validation issues
 */
export function validateStatBlock(monster: DnD5eMonster): string[] {
  const issues: string[] = [];

  // Check required fields
  if (!monster.name) issues.push('Missing name');
  if (!monster.size) issues.push('Missing size');
  if (!monster.creatureType) issues.push('Missing creature type');
  if (!monster.armorClass?.value) issues.push('Missing armor class');
  if (!monster.hitPoints?.average) issues.push('Missing hit points');
  if (!monster.abilityScores) issues.push('Missing ability scores');

  // Validate ability score ranges
  if (monster.abilityScores) {
    const scores = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
    for (const score of scores) {
      const value = monster.abilityScores[score];
      if (value < 1 || value > 30) {
        issues.push(`${score} score ${value} is out of range (1-30)`);
      }
    }
  }

  // Validate CR/XP match
  if (monster.challengeRating) {
    const crStr = String(monster.challengeRating.cr);
    const expectedXP = CR_TO_XP[crStr];
    if (expectedXP && monster.challengeRating.xp !== expectedXP) {
      issues.push(
        `XP ${monster.challengeRating.xp} does not match CR ${crStr} (expected ${expectedXP})`
      );
    }
  }

  return issues;
}
