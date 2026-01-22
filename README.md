# Daggerheart Converter & Creator

A toolkit for converting creatures from other TTRPG systems (D&D 5e, Pathfinder 2e, Numenera) to Daggerheart adversaries and creating custom adversaries and environments from scratch.

**Two ways to use this:**
1. **Claude Code Skills** (recommended) - Natural language interface via Claude Code
2. **TypeScript Library** - Programmatic API for developers

## Table of Contents

- [Quick Start: Claude Code Skills](#quick-start-claude-code-skills)
  - [Installation](#installation)
  - [Available Skills](#available-skills)
  - [Examples](#examples)
- [TypeScript Library](#typescript-library)
- [Quick Reference](#quick-reference)
- [License](#license)

---

## Quick Start: Claude Code Skills

These skills work with [Claude Code](https://claude.ai/code) to provide natural language creature conversion and creation.

### Installation

**Prerequisites:**
- [Claude Code](https://claude.ai/code) installed and configured

#### Option A: Quick Install (Recommended)

```bash
# Clone the repository
git clone https://github.com/mattaceolivero/daggerheart-converter.git
cd daggerheart-converter

# Run the install script
./install.sh
```

The install script will:
- Create the necessary directories in `~/.claude/skills/`
- Copy all skill files and reference documentation
- Verify the installation

#### Option B: Manual Install

If you prefer to install manually:

```bash
# Clone the repository
git clone https://github.com/mattaceolivero/daggerheart-converter.git
cd daggerheart-converter

# Create skills directories
mkdir -p ~/.claude/skills/dh-convert
mkdir -p ~/.claude/skills/dh-adversary
mkdir -p ~/.claude/skills/dh-environment
mkdir -p ~/.claude/skills/daggerheart-docs

# Copy skill files
cp skills/dh-convert/SKILL.md ~/.claude/skills/dh-convert/
cp skills/dh-adversary/SKILL.md ~/.claude/skills/dh-adversary/
cp skills/dh-environment/SKILL.md ~/.claude/skills/dh-environment/

# Copy reference documentation
cp docs/daggerheart-reference.md ~/.claude/skills/daggerheart-docs/
```

#### Verify Installation

In Claude Code, type `/dh-convert` - if the skill loads, you're ready!

---

### Available Skills

#### `/dh-convert` - Convert Existing Creatures

Converts creature stat blocks from other TTRPG systems to Daggerheart format.

**Supported Systems:**
- D&D 5th Edition
- Pathfinder 2e
- Numenera
- OSR systems

**Usage:** Just paste a stat block (text or image) and ask Claude to convert it!

---

#### `/dh-adversary` - Create Custom Adversaries

Creates balanced Daggerheart adversaries from scratch with encounter balancing.

**Parameters to provide:**
- Player level or tier
- Party size (for Battle Points calculation)
- Creature concept/description
- Desired adversary type (optional): Minion, Standard, Bruiser, Leader, Skulk, Ranged, Horde, Solo

---

#### `/dh-environment` - Create Battle Environments

Creates detailed combat environments with terrain, hazards, and interactive elements.

**Creates:**
- Terrain features (cover, elevation, difficult terrain)
- Hazards (traps, damage zones, environmental effects)
- Interactive elements (destructible objects, levers, environmental weapons)
- Atmosphere (lighting, weather, sensory details)

---

### Examples

#### Example 1: Converting a D&D 5e Creature

**You:** `/dh-convert`

**You:** Convert this to Daggerheart:

```
GOBLIN
Small humanoid (goblinoid), neutral evil

Armor Class 15 (leather armor, shield)
Hit Points 7 (2d6)
Speed 30 ft.

STR 8 (-1) DEX 14 (+2) CON 10 (+0) INT 10 (+0) WIS 8 (-1) CHA 8 (-1)

Skills Stealth +6
Senses darkvision 60 ft., passive Perception 9
Languages Common, Goblin
Challenge 1/4 (50 XP)

Nimble Escape. The goblin can take the Disengage or Hide action as a bonus action.

ACTIONS
Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target.
Hit: 5 (1d6 + 2) slashing damage.
```

**Claude responds with:**

```markdown
# GOBLIN

*Tier 1 Minion Adversary (Minor Difficulty)*

> A small, cunning humanoid with sharp features and malicious eyes.

---

**Evasion** 10 | **Thresholds** 2/4/6 | **HP** 1 | **Stress** 0

**Attack** +2, 1d6 physical, (Scimitar), [Very Close]

**Movement** Standard: Close

---

## Features

**Nimble Escape** (Passive)
Can disengage or hide freely when not the center of attention.

---

## Motives & Tactics

**Motives**: Survival, greed, pack loyalty
**Tactics**: Ambush in numbers, use hit-and-run tactics, flee when outmatched

---

## Loot

- 1d6 copper coins
- Scimitar (poor quality)
- Leather scraps (crafting material)

---

*Converted from D&D 5e (CR 1/4)*
```

---

#### Example 2: Creating a Custom Adversary

**You:** `/dh-adversary`

**You:** Create a corrupted forest guardian for my level 3 party of 4 players

**Claude responds with:**

```markdown
# BLIGHTWOOD SENTINEL

*Tier 2 Bruiser Adversary (Moderate Difficulty)*

> A twisted treant whose bark weeps black sap, its eyes glowing with malevolent green fire.

---

**Evasion** 12 | **Thresholds** 5/10/15 | **HP** 12 | **Stress** 4

**Attack** +6, 2d6+2 physical, (Corrupted Branch), [Close]
*On hit, target must make an Instinct Reaction Roll (13) or become Slowed.*

**Movement** Standard: Very Close (Rooted)

---

## Features

**Corrupted Bark** (Passive)
Resistance to physical damage. Vulnerable to fire damage.

**Spreading Blight** (Action, 2 Stress)
All creatures within Close range must make a Strength Reaction Roll (14) or take **2d6 magic damage** and become Poisoned until end of next turn. **Marks 1 Fear** on affected targets.

**Grasping Roots** (Reaction, 1 Stress)
*Trigger: A creature attempts to move away*
Target must make an Agility Reaction Roll (13) or be Restrained until they spend an action to break free.

**Regeneration** (Passive)
At the start of its turn, regains 2 HP if standing on natural ground. Fire damage prevents this for 1 round.

---

## Motives & Tactics

**Motives**: Spread corruption, defend territory, punish intruders
**Tactics**: Roots enemies in place, uses Spreading Blight on grouped targets, focuses on spellcasters

---

## Loot

- Corrupted heartwood (alchemical component, 50 gold value)
- Tainted sap (poison ingredient)
- Blightstone (magical focus, +1 to nature magic)

---

## Encounter Balance

**Battle Points Cost**: 4 BP
**Suggested Encounter** (for 4 PCs at level 3):
- Blightwood Sentinel (4 BP)
- 4 Blighted Sprites [Minion group] (1 BP)
- 2 Thorn Wolves [Standard] (4 BP)
- Total: 9/14 BP (Easy-Moderate)
```

---

#### Example 3: Creating a Battle Environment

**You:** `/dh-environment`

**You:** Create a volcanic forge where cultists are performing a summoning ritual

**Claude responds with:**

```markdown
# THE OBSIDIAN FORGE

*A massive volcanic cavern where rivers of magma flow around ancient dwarven forging platforms*

## Overview

The cult has repurposed this abandoned dwarven forge for their dark ritual. Massive chains suspend platforms over bubbling lava, while the heat creates shimmering air that distorts vision. The central ritual circle pulses with eldritch energy.

## Terrain Features

### Forging Platforms (Main Areas)
*Location: Three stone platforms connected by chains*
*Effect: Stable ground, but shake when chains are struck (Agility 12 to stay standing)*

### Chain Bridges
*Location: Connecting the platforms*
*Effect: Difficult terrain, single file only. Can be cut (HP 8) to drop anyone on them.*

### Magma Channels
*Location: Between all platforms*
*Effect: Cannot be crossed. Instant death if fully submerged.*

### Ruined Anvils
*Location: Scattered on platforms*
*Effect: Heavy cover, can be pushed (2d6 physical if hits creature)*

## Hazards

### Lava Spray
*Type: Damage zone (periodic)*
*Area: Random 10ft radius each round*
**Damage**: 2d6 fire damage
**Avoidance**: Agility Reaction Roll (14) for half damage
*Warning signs: Bubbling intensifies before spray*

### Ritual Backlash
*Type: Environmental (if ritual circle disrupted)*
*Area: Close range from circle*
**Damage**: 3d6 magic damage
**Avoidance**: Instinct Reaction Roll (15)
*Applies: Dazed until end of next turn*

### Unstable Platform (Northeast)
*Type: Trap*
*Trigger: More than 2 creatures on platform*
**Damage**: 2d6 falling + 1d6 fire (edge of lava)
**Avoidance**: Agility Reaction Roll (13) to leap to safety

## Interactive Elements

### Great Bellows (South Platform)
*Location: Massive dwarven bellows mechanism*
*Activation: Strength action to pump*
*Effect: Creates 20ft cone of superheated air - 1d6 fire damage, pushes creatures back*

### Quenching Trough
*Location: East platform*
*Activation: Tip over (Strength action)*
*Effect: Creates steam cloud (heavily obscured) for 2 rounds, cools nearby lava temporarily*

### Ritual Braziers (4)
*Location: Corners of central platform*
*Activation: Extinguish (action) or knock over*
*Effect: Each extinguished brazier weakens the ritual. All 4 = ritual fails. Knocking over deals 1d6 fire in Close.*

### Suspended Cage
*Location: Above east platform*
*Activation: Cut rope (ranged attack, AC 12)*
*Effect: Drops on area below - 2d6 physical damage, Restrained*

## Atmosphere

- **Lighting**: Dim (orange glow from lava), bright near ritual circle
- **Heat**: Uncomfortable - disadvantage on concentration after 10 minutes
- **Sounds**: Roaring lava, chanting, metal groaning
- **Smells**: Sulfur, burning, ozone from ritual

## Tactical Notes

1. The chain bridges are key chokepoints - cutting them can split enemy forces
2. Smart players will use the bellows and quenching trough to control the battlefield
3. The ritual braziers give players a secondary objective beyond just killing cultists
4. Lava spray keeps everyone moving - don't let the fight become static

## Suggested Adversaries

- **Cult Leader** (Leader) - Performing the ritual on central platform
- **Flame Cultists** (Standard, 3-4) - Defending the braziers
- **Magma Elemental** (Bruiser) - Emerges from lava if ritual reaches 50%
- **Ember Sprites** (Minion group) - Harassment from above
```

---

## TypeScript Library

For developers who want to use this programmatically.

### Installation

```bash
git clone https://github.com/mattaceolivero/daggerheart-converter.git
cd daggerheart-converter
npm install
npm run build
```

### Basic Usage

```typescript
import {
  convertFromStatBlock,
  convertFromText,
  convertFromNaturalLanguage
} from './src';

// Convert from JSON stat block
const result1 = convertFromStatBlock(goblinStatBlock);
console.log(result1.markdown);

// Convert from text (copied from a book or PDF)
const result2 = convertFromText(`
  GOBLIN
  Small humanoid (goblinoid), neutral evil
  Armor Class 15 (leather armor, shield)
  Hit Points 7 (2d6)
  ...
`);

// Convert from natural language description
const result3 = convertFromNaturalLanguage(
  "a CR 1/4 small goblin with a scimitar that can disengage as a bonus action"
);
```

### Configuration Options

```typescript
const result = convertFromStatBlock(statBlock, {
  includeDesignNotes: true,    // Add conversion rationale and GM tips
  outputFormat: 'both',        // 'markdown', 'json', or 'both'
  verboseNotes: false,         // Include detailed conversion log
  markdownOptions: {
    headerLevel: 1,            // Starting header level (1-6)
    includeDescription: true,  // Include flavor text
    includeTags: true,         // Include metadata tags
  }
});
```

---

## Quick Reference

### Player Level to Tier

| Level | Tier |
|-------|------|
| 1     | 1    |
| 2-4   | 2    |
| 5-7   | 3    |
| 8-10  | 4    |

### Battle Points Formula

```
BP = (3 x Party Size) + 2
```

| Adversary Type | BP Cost |
|----------------|---------|
| Minion (group) | 1       |
| Standard       | 2       |
| Skulk/Ranged   | 2       |
| Leader         | 3       |
| Bruiser        | 4       |
| Solo           | 5       |

### Source System Tier Mapping

| System | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|--------|--------|--------|--------|
| D&D 5e CR | 0-2 | 3-6 | 7-13 | 14+ |
| Numenera Level | 1-2 | 3-4 | 5-6 | 7-10 |
| PF2e Level | -1 to 3 | 4-8 | 9-14 | 15+ |

---

## Project Structure

```
daggerheart-converter/
├── src/
│   ├── models/           # Data models (Daggerheart, D&D 5e, PF2e)
│   ├── parsers/          # Text stat block parsing
│   ├── converters/       # Conversion logic
│   ├── generators/       # Content generation
│   ├── formatters/       # Output formatting
│   └── orchestrator/     # Main conversion pipeline
├── docs/
│   ├── daggerheart-reference.md  # Full rules reference
│   ├── conversion-rules.md       # Conversion methodology
│   └── examples/                 # Sample conversions
├── skills/               # Claude Code skill files
│   ├── dh-convert/
│   ├── dh-adversary/
│   └── dh-environment/
└── tests/                # Test suite
```

---

## License

MIT

## Credits

Based on the Daggerheart RPG by Darrington Press. Conversion methodology informed by community guidelines and Mike Underwood's monster conversion advice.

---

**Questions or issues?** Open an issue on GitHub!
