# Daggerheart Converter & Creator

A comprehensive tool for converting creatures from other TTRPG systems to Daggerheart and creating custom adversaries and environments from scratch.

## Available Skills

### /dh-convert
Converts creature stat blocks from other systems (D&D 5e, Numenera, Pathfinder 2e) to Daggerheart adversaries.
- Accepts images or text of stat blocks
- Handles all creature types
- Always includes loot
@~/.claude/skills/dh-convert/SKILL.md

### /dh-adversary
Creates Daggerheart adversaries from scratch based on player level, party size, and description.
- Uses Battle Points for encounter balancing
- Full creative freedom unless specified
- Includes Fear mechanics and damage dice
@~/.claude/skills/dh-adversary/SKILL.md

### /dh-environment
Creates battle environments with terrain, hazards, and interactive elements.
- Terrain features with mechanical effects
- Hazards scaled by tier
- Interactive elements for creative combat
@~/.claude/skills/dh-environment/SKILL.md

### /dh-npc
Creates memorable NPCs with streamlined stat blocks focused on roleplay.
- Simplified stats (Difficulty, HP, Stress, Thresholds)
- Name, race, age, physical description
- Motivations and a secret (mundane to dangerous)
- A memorable quirk (speech, mannerism, outlook)
@~/.claude/skills/dh-npc/SKILL.md

### /dh-loot
Generates thematic, tier-appropriate loot with interesting descriptions.
- Currency, consumables, equipment, materials
- Unique treasures with names and plot hooks
- Scales by tier and context (creature drops, hoards, quest rewards)
@~/.claude/skills/dh-loot/SKILL.md

## Quick Reference

### Player Level to Tier
| Level | Tier |
|-------|------|
| 1     | 1    |
| 2-4   | 2    |
| 5-7   | 3    |
| 8-10  | 4    |

### Battle Points
```
BP = (3 × Party Size) + 2
```

| Adversary Type | BP Cost |
|----------------|---------|
| Minion (group) | 1       |
| Standard       | 2       |
| Leader         | 3       |
| Bruiser        | 4       |
| Solo           | 5       |

### Source System Conversion
| System | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|--------|--------|--------|--------|
| D&D 5e CR | 0-2 | 3-6 | 7-13 | 14+ |
| Numenera Level | 1-2 | 3-4 | 5-6 | 7-10 |
| PF2e Level | -1 to 3 | 4-8 | 9-14 | 15+ |

## Project Structure

```
src/
  models/           # Data models (D&D 5e, Daggerheart)
  parsers/          # Text stat block parsing
  converters/       # Conversion logic
  formatters/       # Output formatters
  orchestrator/     # Main conversion pipeline
docs/
  daggerheart-reference.md  # Full rules reference
  conversion-rules.md       # D&D 5e conversion details
scripts/            # Test conversion scripts
```

## Quick Commands

```bash
# Convert a D&D 5e creature (text)
npx tsx scripts/convert.ts

# Convert a dragon
npx tsx scripts/convert-dragon.ts

# Build the project
npm run build

# Run tests
npm test
```

## Key Features

- **Damage Dice**: All abilities show explicit damage (e.g., **2d8+4 physical damage**)
- **Fear Mechanics**: Frightful abilities mark Fear, powerful abilities consume Fear
- **Encounter Balancing**: Battle Points system for balanced encounters
- **Loot**: Always included based on creature type and tier
- **Multi-System Support**: D&D 5e, Numenera, Pathfinder 2e
