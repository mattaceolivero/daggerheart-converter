# Usage Guide

This guide covers detailed usage instructions for the D&D to Daggerheart Monster Converter.

## Table of Contents

- [Installation](#installation)
- [Input Formats](#input-formats)
- [Conversion Functions](#conversion-functions)
- [Configuration Options](#configuration-options)
- [Understanding Output](#understanding-output)
- [Advanced Usage](#advanced-usage)
- [Error Handling](#error-handling)

## Installation

```bash
# Clone or copy the project
cd daggerheart-converter

# Install dependencies
npm install

# Build the TypeScript
npm run build
```

## Input Formats

The converter accepts three input formats, each suited to different use cases.

### 1. JSON Stat Block (Highest Fidelity)

The most accurate conversion comes from structured JSON data that matches the `DnD5eMonster` interface.

```typescript
import {
  convertFromStatBlock,
  DnD5eMonster,
  CreatureSize,
  CreatureType,
  AttackType,
} from './src';

const goblin: DnD5eMonster = {
  name: "Goblin",
  size: CreatureSize.SMALL,
  creatureType: CreatureType.HUMANOID,
  subtypes: ["goblinoid"],
  alignment: "neutral evil",

  armorClass: {
    value: 15,
    type: "leather armor, shield"
  },

  hitPoints: {
    average: 7,
    formula: "2d6"
  },

  speed: {
    walk: 30
  },

  abilityScores: {
    STR: 8, DEX: 14, CON: 10,
    INT: 10, WIS: 8, CHA: 8
  },

  challengeRating: {
    cr: 0.25,
    xp: 50
  },

  traits: [
    {
      name: "Nimble Escape",
      description: "The goblin can take the Disengage or Hide action as a bonus action on each of its turns."
    }
  ],

  attacks: [
    {
      name: "Scimitar",
      attackType: AttackType.MELEE_WEAPON,
      toHit: 4,
      reach: 5,
      damage: {
        dice: { count: 1, dieSize: 6 },
        modifier: 2,
        damageType: "slashing"
      }
    }
  ]
};

const result = convertFromStatBlock(goblin);
console.log(result.markdown);
```

### 2. Text Stat Block (Common Use Case)

Copy and paste stat blocks directly from PDFs, websites, or books. The parser handles standard D&D 5e formatting.

```typescript
import { convertFromText } from './src';

const statBlockText = `
ANCIENT RED DRAGON
Gargantuan dragon, chaotic evil

Armor Class 22 (natural armor)
Hit Points 546 (28d20 + 252)
Speed 40 ft., climb 40 ft., fly 80 ft.

STR 30 (+10) DEX 10 (+0) CON 29 (+9) INT 18 (+4) WIS 15 (+2) CHA 23 (+6)

Saving Throws Dex +7, Con +16, Wis +9, Cha +13
Skills Perception +16, Stealth +7
Damage Immunities fire
Senses blindsight 60 ft., darkvision 120 ft., passive Perception 26
Languages Common, Draconic
Challenge 24 (62,000 XP)

Legendary Resistance (3/Day). If the dragon fails a saving throw, it can choose to succeed instead.

ACTIONS
Multiattack. The dragon can use its Frightful Presence. It then makes three attacks: one with its bite and two with its claws.

Bite. Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage.

Claw. Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage.

Fire Breath (Recharge 5-6). The dragon exhales fire in a 90-foot cone. Each creature in that area must make a DC 24 Dexterity saving throw, taking 91 (26d6) fire damage on a failed save, or half as much damage on a successful one.

Frightful Presence. Each creature of the dragon's choice that is within 120 feet of the dragon must succeed on a DC 21 Wisdom saving throw or become frightened for 1 minute.

LEGENDARY ACTIONS
The dragon can take 3 legendary actions, choosing from the options below.

Detect. The dragon makes a Wisdom (Perception) check.
Tail Attack (Costs 2 Actions). The dragon makes a tail attack.
Wing Attack (Costs 2 Actions). The dragon beats its wings. Each creature within 15 feet must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone.
`;

const result = convertFromText(statBlockText);
console.log(result.markdown);
```

**Parser Capabilities:**
- Detects creature name, size, type, and alignment from header
- Parses AC, HP (average and formula), and speed
- Extracts ability scores from multiple formats
- Identifies skills, senses, languages, and CR
- Separates traits, actions, reactions, and legendary actions
- Parses attack entries with to-hit, reach/range, and damage

### 3. Natural Language (Quick Concepts)

Describe creatures informally when you don't have exact stats. The parser extracts what it can and estimates the rest.

```typescript
import { convertFromNaturalLanguage } from './src';

// Simple description
const result1 = convertFromNaturalLanguage(
  "a pack of hungry wolves, about CR 1/4 each"
);

// More detailed description
const result2 = convertFromNaturalLanguage(
  "a large fire elemental, CR 5, immune to fire, deals fire damage with its attacks"
);

// Complex creature
const result3 = convertFromNaturalLanguage(
  "an ancient lich with legendary actions, CR 21, undead spellcaster with paralyzing touch"
);
```

**What the NL Parser Extracts:**
- CR from mentions like "CR 5", "challenge rating 5", "about CR 1/4"
- Size from "tiny", "small", "medium", "large", "huge", "gargantuan"
- Creature type from 70+ keywords (dragon, undead, fiend, etc.)
- Movement types from "can fly", "swim speed", "burrows", etc.
- Attack types from weapon mentions (sword, claws, bite, etc.)
- Special traits from "legendary", "spellcaster", "immune to fire", etc.

**Confidence Scoring:**
The parser returns a confidence score (0.0 to 1.0). Low confidence (< 0.3) indicates too little information was extracted and will throw an error.

## Conversion Functions

### convertFromStatBlock

Primary function for JSON input with full type safety.

```typescript
function convertFromStatBlock(
  statBlock: DnD5eMonster,
  options?: ConversionOptions
): ConversionResult;
```

### convertFromText

Parses and converts text stat blocks.

```typescript
function convertFromText(
  text: string,
  options?: ConversionOptions
): ConversionResult;
```

### convertFromNaturalLanguage

Parses informal descriptions and converts with estimated stats.

```typescript
function convertFromNaturalLanguage(
  description: string,
  options?: ConversionOptions
): ConversionResult;
```

### Utility Functions

```typescript
// Validate a stat block before conversion
const validation = validateStatBlock(statBlock);
if (!validation.isValid) {
  console.error(validation.errors);
}

// Preview what specializations will apply
const analysis = analyzeSpecializations(statBlock);
console.log(analysis.isSpellcaster);  // true/false
console.log(analysis.hasLegendaryActions);  // true/false
```

## Configuration Options

```typescript
interface ConversionOptions {
  // Include explanatory notes about conversion decisions
  // Default: true
  includeDesignNotes?: boolean;

  // Output format: 'markdown' | 'json' | 'both'
  // Default: 'markdown'
  outputFormat?: 'markdown' | 'json' | 'both';

  // Include verbose conversion log in output
  // Default: false
  verboseNotes?: boolean;

  // Markdown formatting options
  markdownOptions?: {
    // Starting header level (1-6)
    // Default: 1
    headerLevel?: number;

    // Include description/lore section
    // Default: true
    includeDescription?: boolean;

    // Include metadata tags
    // Default: true
    includeTags?: boolean;

    // Include conversion notes section
    // Default: true (if includeDesignNotes is true)
    includeConversionNotes?: boolean;
  };
}
```

**Example with Options:**

```typescript
const result = convertFromStatBlock(statBlock, {
  includeDesignNotes: true,
  outputFormat: 'both',
  verboseNotes: true,
  markdownOptions: {
    headerLevel: 2,
    includeDescription: true,
    includeTags: false,
  }
});

// Access both outputs
console.log(result.markdown);
console.log(JSON.stringify(result.adversary, null, 2));

// Review conversion log
result.conversionLog.forEach(step => console.log(step));
```

## Understanding Output

### ConversionResult Structure

```typescript
interface ConversionResult {
  // The fully converted Daggerheart adversary object
  adversary: DaggerheartAdversary;

  // Markdown-formatted stat block (if outputFormat includes markdown)
  markdown?: string;

  // Design notes explaining conversion decisions
  designNotes?: DesignNotes;

  // Step-by-step log of the conversion process
  conversionLog: string[];
}
```

### DaggerheartAdversary Structure

```typescript
interface DaggerheartAdversary {
  name: string;
  tier: Tier;           // 1, 2, 3, or 4
  type: AdversaryType;  // Minion, Standard, Solo, etc.
  difficulty: Difficulty;  // Minor, Major, Severe

  // Core stats
  evasion: number;
  thresholds: { minor: number; major: number; severe: number };
  hp: number;
  stress: number;

  // Combat
  attack: Attack;
  additionalAttacks?: Attack[];
  movement?: Movement;

  // Abilities
  features: Feature[];
  relentless?: RelentlessFeature;
  horde?: HordeFeature;

  // Narrative
  description: AdversaryDescription;
  motivesAndTactics: MotivesAndTactics;
  experience: Experience[];

  // Metadata
  tags?: string[];
  sourceSystem?: string;
  sourceCR?: number | string;
  conversionNotes?: string;
}
```

## Advanced Usage

### Individual Converters

For fine-grained control, use individual conversion functions:

```typescript
import {
  crToTier,
  classifyAdversary,
  convertCoreStats,
  convertAllAttacks,
  convertAllFeatures,
} from './src';

// Step-by-step conversion
const tier = crToTier(5);  // Tier.TWO
const classification = classifyAdversary(statBlock);
const coreStats = convertCoreStats(statBlock, classification);
const attacks = convertAllAttacks(statBlock, tier, classification.type);
const features = convertAllFeatures(statBlock);
```

### Specialized Converters

Apply creature-specific enhancements:

```typescript
import {
  isDragon, convertDragon,
  isUndead, convertUndead,
  isSpellcaster, convertSpellcasting,
  isConstructOrOoze, convertConstructOrOoze,
} from './src';

if (isDragon(statBlock)) {
  const dragonResult = convertDragon(statBlock);
  // Access: breathWeapon, color, ageCategory, thematicFeatures
}

if (isUndead(statBlock)) {
  const undeadResult = convertUndead(statBlock);
  // Access: undeadType, thematicFeatures, motives, vulnerabilities
}
```

### Custom Formatting

```typescript
import { formatAsMarkdown, formatCompact } from './src';

// Full markdown stat block
const fullMarkdown = formatAsMarkdown(adversary);

// Compact single-line format for quick reference
const compact = formatCompact(adversary);
// "Goblin | T1 Minion | E:11 | HP:1 | +1 Scimitar 1d6+1 phy"

// Multiple adversaries in one document
import { formatMultipleAsMarkdown } from './src';
const document = formatMultipleAsMarkdown([goblin, orc, troll]);
```

## Error Handling

### Text Parsing Errors

```typescript
import { parseStatBlockSafe } from './src';

const result = parseStatBlockSafe(text);

if (!result.result) {
  console.error("Parsing failed:", result.errors);
} else {
  if (result.warnings.length > 0) {
    console.warn("Parsing warnings:", result.warnings);
  }
  // Use result.result
}
```

### Conversion Errors

```typescript
try {
  const result = convertFromText(text);
} catch (error) {
  if (error.message.includes('confidence too low')) {
    console.error("Not enough information to convert. Please provide more details.");
  } else if (error.message.includes('Missing required field')) {
    console.error("Stat block incomplete:", error.message);
  }
}
```

### Validation

```typescript
import { validateStatBlock, validateCoreStats } from './src';

// Pre-conversion validation
const preValidation = validateStatBlock(statBlock);
if (!preValidation.isValid) {
  preValidation.errors.forEach(e => console.error(e));
}

// Post-conversion stat validation
const statsValidation = validateCoreStats(coreStats);
if (!statsValidation.isValid) {
  statsValidation.issues.forEach(i => console.warn(i));
}
```

## Best Practices

1. **Use JSON for important conversions** - Highest accuracy and type safety
2. **Review conversion logs** - Enable `verboseNotes` for debugging
3. **Check confidence scores** - Low scores indicate missing information
4. **Validate before converting** - Catch errors early with `validateStatBlock`
5. **Use design notes** - They explain why decisions were made and help with adjustments
6. **Consider adversary type** - Solo creatures need more stress and features
7. **Test with your group** - Adjust thresholds and HP based on actual play
