---
name: dh-adversary
description: "Creates Daggerheart adversaries from scratch based on player level, party size, desired difficulty, and description. Use when the user wants to create a custom creature, asks for 'a Tier X adversary', 'a minion', 'a bruiser', or describes a creature concept they want built. Always includes encounter balancing via Battle Points."
version: 1.0.0
---

# Daggerheart Adversary Creator Skill

Creates balanced Daggerheart adversaries from descriptions and requirements.

## Reference Document
@~/.claude/skills/daggerheart-docs/daggerheart-reference.md

## Input Requirements

When creating an adversary, gather this information (ask if not provided):

1. **Player Level** (1-10) or **Tier** (1-4)
   - Level 1 = Tier 1
   - Levels 2-4 = Tier 2
   - Levels 5-7 = Tier 3
   - Levels 8-10 = Tier 4

2. **Adversary Type** (if specified):
   - Minion, Standard, Bruiser, Leader, Skulk, Ranged, Horde, Solo

3. **Party Size** (for encounter balancing)

4. **Desired Difficulty** (optional):
   - Easy, Moderate, Hard, Deadly

5. **Creature Description**:
   - Concept, theme, special abilities desired

## Battle Points System

### Formula
```
Base Battle Points = (3 x Party Size) + 2
```

| Party Size | Base BP |
|------------|---------|
| 2 PCs      | 8 BP    |
| 3 PCs      | 11 BP   |
| 4 PCs      | 14 BP   |
| 5 PCs      | 17 BP   |
| 6 PCs      | 20 BP   |

### Adversary Costs
| Type          | Cost |
|---------------|------|
| Minion (group)| 1 BP |
| Social/Support| 1 BP |
| Horde         | 2 BP |
| Ranged        | 2 BP |
| Skulk         | 2 BP |
| Standard      | 2 BP |
| Leader        | 3 BP |
| Bruiser       | 4 BP |
| Solo          | 5 BP |

### Difficulty Modifiers
- **Easy**: -1 BP
- **Hard**: +2 BP
- **Lower tier adversaries**: +1 BP
- **No heavy hitters (Bruiser/Solo/Leader)**: +1 BP

## Statistics by Tier and Type

### Tier 1

| Type     | Evasion | Thresholds | HP    | Stress | Attack | Damage  |
|----------|---------|------------|-------|--------|--------|---------|
| Minion   | 8-10    | 2/4/6      | 1     | 0      | +2     | 1d6     |
| Standard | 10-12   | 3/6/9      | 4-6   | 2      | +3     | 1d6+1   |
| Bruiser  | 9-11    | 4/8/12     | 6-8   | 3      | +4     | 1d8+2   |
| Leader   | 10-12   | 3/6/9      | 5-7   | 3      | +3     | 1d6+1   |
| Solo     | 12-14   | 5/10/15    | 10-15 | 5      | +4     | 1d10+2  |

### Tier 2

| Type     | Evasion | Thresholds | HP    | Stress | Attack | Damage  |
|----------|---------|------------|-------|--------|--------|---------|
| Minion   | 10-12   | 3/6/9      | 1     | 0      | +3     | 1d6+1   |
| Standard | 12-14   | 4/8/12     | 6-10  | 3      | +5     | 1d8+2   |
| Bruiser  | 11-13   | 5/10/15    | 10-14 | 4      | +6     | 2d6+2   |
| Leader   | 12-14   | 4/8/12     | 8-12  | 4      | +5     | 1d8+2   |
| Solo     | 14-16   | 6/12/18    | 18-25 | 7      | +6     | 2d8+3   |

### Tier 3

| Type     | Evasion | Thresholds | HP    | Stress | Attack | Damage  |
|----------|---------|------------|-------|--------|--------|---------|
| Minion   | 12-14   | 4/8/12     | 1     | 0      | +5     | 1d8+2   |
| Standard | 14-16   | 5/10/15    | 10-16 | 4      | +7     | 2d6+3   |
| Bruiser  | 13-15   | 6/12/18    | 16-22 | 5      | +8     | 2d8+4   |
| Leader   | 14-16   | 5/10/15    | 12-18 | 5      | +7     | 2d6+3   |
| Solo     | 16-18   | 7/14/21    | 28-40 | 9      | +8     | 2d10+4  |

### Tier 4

| Type     | Evasion | Thresholds | HP    | Stress | Attack | Damage  |
|----------|---------|------------|-------|--------|--------|---------|
| Minion   | 14-16   | 5/10/15    | 1     | 0      | +7     | 2d6+2   |
| Standard | 16-18   | 6/12/18    | 16-24 | 5      | +9     | 2d8+4   |
| Bruiser  | 15-17   | 7/14/21    | 24-32 | 6      | +10    | 3d8+5   |
| Leader   | 16-18   | 6/12/18    | 18-26 | 6      | +9     | 2d8+4   |
| Solo     | 18-20   | 8/16/24    | 40-60 | 11     | +11    | 3d10+5  |

## Feature Guidelines by Type

### Minion Features
- None (keep simple)
- Maybe one passive if thematic

### Standard Features
- 1 Passive
- 1 Action OR 1 Reaction

### Bruiser Features
- 1 Passive (damage-related)
- 1-2 Actions (high damage)
- Optional: 1 Reaction

### Leader Features
- 1-2 Passives (auras, buffs)
- 1-2 Actions (commands, buffs)
- 1 Reaction (protect allies)

### Skulk Features
- 1 Passive (stealth, mobility)
- 1 Action (ambush, escape)
- 1 Reaction (dodge, vanish)

### Solo Features
- 2-3 Passives (immunities, resistances)
- 3-4 Actions (varied capabilities)
- 2-3 Reactions (legendary actions)
- Relentless: 2+ actions per turn
- Legendary Resilience: Auto-succeed saves

## Fear Mechanics

For intimidating creatures, include:

**Fear Generation:**
```markdown
**Terrifying Presence** (Action, 1 Stress)
All enemies within [Range] must make an Instinct Reaction Roll (difficulty [X]) or **mark 1 Fear** and become Frightened.
```

**Fear Consumption:**
```markdown
**[Element] Fury** (Action, 1 Fear)
**Requires:** Target has Fear marked. [Description]. Deals **[X]d10 magic damage**. Target clears their Fear.
```

## Creation Process

### Step 1: Determine Parameters
- Tier (from player level)
- Type (from description or specified)
- Battle Points budget

### Step 2: Set Base Statistics
Use the tier/type tables above.

### Step 3: Design Features
Based on type guidelines and creature concept:
- Name features thematically
- Include damage dice explicitly
- Add Reaction Rolls where appropriate
- Include conditions applied

### Step 4: Write Motives & Tactics
- 2-3 motivations
- Combat behavior description

### Step 5: Add Loot
Always include appropriate loot for the creature type and tier.

### Step 6: Calculate Encounter Balance
Provide Battle Points cost and suggestions for party composition.

## Output Format

```markdown
# [Creature Name]

*Tier [X] [Type] Adversary ([Difficulty] Difficulty)*

> [Evocative short description]

---

**Evasion** [X] | **Thresholds** [X]/[X]/[X] | **HP** [X] | **Stress** [X]

**Attack** +[X], [Dice] [Type], ([Name]), [[Range]]
*[Additional effects]*

**Movement** Standard: [Range], [Special movements]

---

## Features

**[Feature Name]** ([Type], [Cost])
[Description with **damage** and **conditions** bolded]
*Reaction Roll: [Attribute] ([Difficulty])*
*Applies: [Conditions]*
*Damage: [Dice] [Type]*

---

## Motives & Tactics

**Motives**: [Motivations]
**Tactics**: [Combat behavior]

---

## Experience

**Topics**: [Relevant knowledge areas]

---

## Loot

[What can be harvested/found]

---

## Encounter Balance

**Battle Points Cost**: [X] BP
**Suggested Encounter** (for [X] PCs at level [Y]):
- [This creature] ([X] BP)
- [Suggested additions to fill budget]
- Total: [X]/[Y] BP ([Difficulty])

---

*Tags: [relevant tags]*
```

## Example Request and Response

**User**: "Create a corrupted forest guardian for my level 3 party of 4 players"

**Process**:
1. Level 3 -> Tier 2
2. "Guardian" suggests Bruiser or Standard
3. 4 PCs = 14 BP budget
4. Corrupted theme -> nature + dark abilities

**Output**: A Tier 2 Bruiser with vine attacks, corruption spread, regeneration in forests, and appropriate loot (corrupted heartwood, tainted sap).
