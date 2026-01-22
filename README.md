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
mkdir -p ~/.claude/skills/dh-npc
mkdir -p ~/.claude/skills/dh-loot
mkdir -p ~/.claude/skills/dh-encounter
mkdir -p ~/.claude/skills/daggerheart-docs

# Copy skill files
cp skills/dh-convert/SKILL.md ~/.claude/skills/dh-convert/
cp skills/dh-adversary/SKILL.md ~/.claude/skills/dh-adversary/
cp skills/dh-environment/SKILL.md ~/.claude/skills/dh-environment/
cp skills/dh-npc/SKILL.md ~/.claude/skills/dh-npc/
cp skills/dh-loot/SKILL.md ~/.claude/skills/dh-loot/
cp skills/dh-encounter/SKILL.md ~/.claude/skills/dh-encounter/

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

#### `/dh-npc` - Create Memorable NPCs

Creates NPCs with streamlined stat blocks focused on roleplay rather than combat.

**Includes:**
- Simplified stats (Difficulty, HP, Stress, Major/Severe thresholds)
- Race and age
- Physical description
- Name and motivations
- A secret (mundane to dangerous)
- A memorable quirk (speech, mannerism, or outlook)

---

#### `/dh-loot` - Generate Loot and Treasure

Generates thematic, tier-appropriate loot with interesting descriptions and plot hooks.

**Generates:**
- Currency (with flavor descriptions)
- Consumables (potions, scrolls, utility items)
- Equipment (weapons, armor with magical properties)
- Crafting materials (by creature type)
- Valuables and trade goods
- Unique treasures with names, history, and plot hooks

---

#### `/dh-encounter` - Generate Random Encounters

Creates dynamic encounters with multiple resolution paths and built-in complications.

**Includes:**
- The situation (what's happening when PCs arrive)
- Key players with wants, fears, and default actions
- Environmental details and tactical features
- A twist that makes it interesting
- Multiple resolution paths (combat, negotiation, stealth, creative)
- Aftermath and consequences
- Connections to larger plots

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

#### Example 4: Creating an NPC

**You:** `/dh-npc`

**You:** Create a suspicious innkeeper for a small village

**Claude responds with:**

```markdown
# RUMMAGE GLOAM

*Halfling Middle-aged, Innkeeper*

> A plump halfling with thinning hair he combs over obsessively, darting eyes that never quite meet yours, and flour-dusted clothes despite never seeming to cook.

---

## At a Glance

| Stat | Value |
|------|-------|
| **Difficulty** | 12 |
| **HP** | 5 |
| **Stress** | 2 |
| **Thresholds** | 4/8 |

---

## Motivations

- **Keep the inn running** - It's all he has left after his wife passed
- **Stay out of trouble** - He's seen what happens to people who get involved
- **Protect his niece** - She works as a barmaid and he's terrified for her safety

---

## The Secret

*Dangerous*

Rummage lets a group of smugglers use his cellar to store contraband in exchange for "protection money." He hates it but feels trapped - they've threatened his niece if he talks.

**If discovered:** He'll panic, then beg for help. If the PCs seem capable, he might desperately ask them to deal with the smugglers. If they seem threatening, he'll lie poorly and then try to warn the smugglers.

---

## The Quirk

**The Overexplainer**: Rummage gives exhaustingly detailed explanations for everything, especially things no one asked about. Ask for a room? He'll explain the history of each room, why one has a draft, which bed his grandmother died in.

*In play:* When PCs ask simple questions, give a rambling 30-second answer. Let players interrupt him - he won't be offended, he's used to it.

---

## Roleplaying Notes

**Voice/Demeanor:** Nervous, talks too fast, laughs at inappropriate moments

**Attitude toward strangers:** Overly welcoming in a way that feels rehearsed and slightly desperate

**What they want from PCs:** Ideally, for them to pay for a room and not ask questions. Secretly, he's hoping someone capable enough to help will walk through that door.

---

*Tags: npc, innkeeper, halfling, tier-1, nervous, secret-criminal-connection*
```

---

#### Example 5: Generating Loot

**You:** `/dh-loot`

**You:** Generate treasure for a Tier 3 dragon's hoard

**Claude responds with:**

```markdown
# ANCIENT WYRM'S HOARD

*Tier 3 Major Hoard*

---

## Currency

Three iron-bound chests overflowing with coin - approximately 2,400 gold pieces. The coins span centuries: tarnished silver imperials, gleaming dwarven trade bars, delicate elven crescents, and crude orcish slugs. Several handfuls of uncut gemstones are mixed throughout.

## Consumables

- **Bottled Dragon's Breath (2)**: Throw to create a 15ft cone of fire dealing 3d6 damage
- **Potion of Fire Immunity**: Complete immunity to fire for 1 hour
- **Scroll of Sending**: One-time long-distance message spell
- **Phoenix Down**: Single-use resurrection for a creature dead less than 1 minute

## Equipment

- **Dragonscale Shield** (+2 Evasion): Grants resistance to fire damage
- **Wyrmtooth Spear** (+2, returns when thrown): Deals +1d6 damage to dragons

## Materials

- **Pristine Dragon Scales (12)**: Worth 800 gold total, or can craft legendary armor
- **Dragon Heartblood (vial)**: Alchemical component worth 500 gold
- **Intact Fire Gland**: Can be used to craft a flame-producing item

## Valuables

- **Crown of the Fallen King**: Worth 600 gold, or priceless to the right kingdom
- **Tapestry of the First Flame**: Depicts the creation of dragons, 400 gold to a collector
- **Ivory chess set with jade pieces**: 200 gold, one piece is hollow and contains a tiny key

## Unique Treasure

### THE INEVITABLE CONCLUSION

*Greatsword | Tier 3 Rare | Value: 1,200 gold*

> A blade of black iron with veins of molten orange running through it like cooling lava. The crossguard is shaped like spread dragon wings, and the pommel contains a still-warm ember.

**Properties:**
- +2 to attack rolls
- Deals +2d6 fire damage
- Once per day, can cast Fireball centered on the wielder (wielder is immune)

**History:** Forged from the remains of the first dragon ever slain by mortals, this blade has killed seventeen dragons since. Each dragon that falls to it makes the blade burn slightly hotter.

**Plot Hook:** The blade is technically the rightful property of the Dragonslayer Order, who disbanded two centuries ago. Their descendants might have opinions about its new owner.

---

**Total Approximate Value:** ~6,500 gold

**Notes for GM:** The hollow chess piece key opens a vault in the fallen king's ruined castle. The tapestry might offend living dragons who see it.
```

---

#### Example 6: Generating a Random Encounter

**You:** `/dh-encounter`

**You:** Generate a Tier 1 urban encounter in a busy marketplace

**Claude responds with:**

```markdown
# THE PICKPOCKET'S PROBLEM

*Tier 1 Social/Combat Encounter — City Marketplace*

---

## The Situation

A young goblin girl, no older than twelve, crashes into the party's legs while fleeing through the crowded market. She's clutching a silk purse. Ten feet behind her, a red-faced merchant is shouting "THIEF!" and a city guard is pushing through the crowd toward both of them. The goblin looks up at the PCs with wide, terrified eyes.

## The Stakes

**What's at risk:** The girl's freedom (or hand, depending on local law), the merchant's coin, the PCs' reputation
**Who cares:** The goblin, the merchant, the guard, the crowd watching
**Time pressure:** The guard arrives in about 30 seconds. The crowd is forming a circle.

---

## Key Players

### Skitter, Goblin Pickpocket
- **Want:** To escape and bring money back to her family
- **Fear:** The punishment for theft (she's seen what they do)
- **Will:** Beg for help, offer to split the take, try to slip away in chaos

###Vendrick Brass, Merchant
- **Want:** His purse back, the thief punished publicly
- **Fear:** Looking weak (bad for business)
- **Will:** Demand maximum punishment, won't negotiate down easily

### Guard-Sergeant Hollis
- **Want:** To resolve this quickly and get back to his post
- **Fear:** Paperwork, crowds getting rowdy
- **Will:** Arrest the goblin, take statements, move on

---

## The Environment

Crowded marketplace at midday, stalls pressing in, too many people.

**Key Features:**
- **Crowd:** Difficult terrain, provides cover, could become hostile
- **Merchant stalls:** Can be ducked under, knocked over
- **Awning ropes:** Could be cut to create distraction
- **Storm drain:** Goblin-sized, leads to the undercity

---

## The Twist

The purse contains more than gold—there's a letter inside proving Vendrick has been bribing officials to ignore his watered-down goods. Skitter doesn't know what she has. Vendrick VERY much wants that letter back and will drop all charges if it's returned quietly.

---

## Resolution Paths

### Combat
- **Enemies:** 1 Guard-Sergeant (Tier 1 Standard), crowd turns hostile
- **Tactics:** Guard tries to subdue, not kill. Crowd throws produce, blocks exits.
- **Victory condition:** Fight is unwise—even winning makes PCs wanted criminals

### Negotiation
- **Leverage:** PCs could offer to pay for the "stolen" goods, vouch for the girl
- **Objections:** Vendrick wants punishment, not payment (unless they find the letter)
- **Deal possible:** If PCs discover the letter, Vendrick suddenly becomes very forgiving

### Stealth/Avoidance
- **Difficulty:** Easy to walk away, harder to help the girl escape
- **Consequence of failure:** Girl is arrested, PCs are questioned as accomplices
- **What they miss:** A potential ally, the blackmail material, the undercity connection

### Creative Solution
- **Hints:** The girl keeps glancing at the storm drain. The purse feels heavier than just coins. Vendrick seems MORE angry than a simple theft warrants.

---

## Aftermath

**If PCs help Skitter escape:** She's part of a network of street kids. They now have eyes and ears all over the city—and a contact in the undercity.

**If Vendrick gets the letter back:** He owes them a favor. A dangerous, compromised man now thinks of them as useful.

**If the letter becomes public:** Vendrick is ruined. His partners blame the PCs. The officials he bribed want to know who else knows.

---

## Loot/Rewards

- **The purse:** 15 gold and the incriminating letter
- **Skitter's gratitude:** Information, a guide to the undercity, a future favor
- **Vendrick's "gratitude":** A 50 gold "thank you" and a man who'll betray them later

---

## Connections

**This could lead to:** Undercity exploration, merchant guild politics, a street kid network as allies
**This connects to:** Local corruption, the thieves' guild, the PCs' reputation in this city

---

*Tags: encounter, urban, tier-1, moral-choice, faction-conflict, social*
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
│   ├── dh-environment/
│   ├── dh-npc/
│   ├── dh-loot/
│   └── dh-encounter/
└── tests/                # Test suite
```

---

## License

MIT

## Credits

Based on the Daggerheart RPG by Darrington Press. Conversion methodology informed by community guidelines and Mike Underwood's monster conversion advice.

---

**Questions or issues?** Open an issue on GitHub!
