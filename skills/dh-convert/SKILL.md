---
name: dh-convert
description: "Converts creature stat blocks from other TTRPG systems (D&D 5e, Numenera, Pathfinder 2e, etc.) to Daggerheart adversaries. Use when the user provides an image or text of a stat block and wants it converted to Daggerheart format. Handles all creature types and includes loot."
version: 1.0.0
---

# Daggerheart Converter Skill

Converts creatures from other TTRPG systems to Daggerheart adversaries.

## Reference Document
@~/.claude/skills/daggerheart-docs/daggerheart-reference.md

## Supported Source Systems

### D&D 5e
| D&D CR | Daggerheart Tier |
|--------|------------------|
| 0-2    | Tier 1           |
| 3-6    | Tier 2           |
| 7-13   | Tier 3           |
| 14+    | Tier 4           |

### Numenera
| Level | Difficulty (x3) | Daggerheart Tier |
|-------|-----------------|------------------|
| 1-2   | 3-6             | Tier 1           |
| 3-4   | 9-12            | Tier 2           |
| 5-6   | 15-18           | Tier 3           |
| 7-10  | 21-30           | Tier 4           |

**Numenera Stats:**
- Health -> HP (roughly 1:1)
- Armor -> Threshold adjustment (+1-2 per armor)
- Damage -> Convert using damage table
- Modifications -> Features or stat adjustments
- GM Intrusions -> Special Actions (2 Stress)

### Pathfinder 2e
| PF2e Level | Daggerheart Tier |
|------------|------------------|
| -1 to 3    | Tier 1           |
| 4-8        | Tier 2           |
| 9-14       | Tier 3           |
| 15+        | Tier 4           |

## Conversion Process

### Step 1: Identify Source System
Determine if the stat block is from D&D 5e, Numenera, Pathfinder 2e, or another system based on stat format.

### Step 2: Determine Tier
Use the appropriate conversion table to map source difficulty to Daggerheart Tier.

### Step 3: Classify Adversary Type
Based on creature capabilities:
- **Minion**: Low HP, simple attacks, no special abilities
- **Standard**: Balanced, 1-2 features
- **Bruiser**: High damage, lower defense
- **Leader**: Buff/command abilities
- **Skulk**: High mobility, stealth
- **Ranged**: Long-range attacks
- **Horde**: Swarm mechanics
- **Solo**: Boss-level, legendary abilities

### Step 4: Convert Statistics
Use the tier tables from the reference document to set:
- Evasion
- Thresholds (Minor/Major/Severe)
- HP
- Stress
- Attack modifier
- Damage dice

### Step 5: Convert Features
Transform source abilities into Daggerheart features:
- Passive abilities -> Passive features
- Active abilities with limits -> Action features with Stress cost
- Reactive abilities -> Reaction features
- GM Intrusions (Numenera) -> Action features (2 Stress)

### Step 6: Add Fear Mechanics
For frightening abilities:
- Add "**mark 1 Fear**" to description
- Consider adding Fear-consuming abilities for powerful creatures

### Step 7: Include Loot
Always add appropriate loot based on:
- Creature type (beast, construct, undead, etc.)
- Tier (determines value)
- Narrative elements (what makes sense to harvest/find)

## Output Format

```markdown
# [Creature Name]

*Tier [X] [Type] Adversary ([Difficulty] Difficulty)*

> [Short description]

---

**Evasion** [X] | **Thresholds** [X]/[X]/[X] | **HP** [X] | **Stress** [X]

**Attack** +[X], [Dice] [Type], ([Name]), [[Range]]
*[Additional effects if any]*

**Movement** Standard: [Range], [Special movement types]

---

## Features

**[Feature Name]** ([Type], [Cost if any])
[Description with **damage dice** bolded]
*Reaction Roll: [Attribute] ([Difficulty])* (if applicable)
*Applies: [Conditions]* (if applicable)
*Damage: [Dice] [Type]* (if applicable)

---

## Motives & Tactics

**Motives**: [2-3 driving motivations]
**Tactics**: [How it fights]

---

## Experience

**Topics**: [Topic] +[X], [Topic] +[X]

---

## Loot

[Description of what can be harvested/found]

---

*Converted from [Source System] ([Original Difficulty/CR/Level])*

*Tags: [relevant tags]*
```

## Example: Converting Numenera Creature

**Input (from image):**
- Name: Hotskive
- Level: 3 (Difficulty 9)
- Health: 9
- Armor: 1
- Damage: 4 + 1 heat
- Movement: Short
- Special: Heat aura, cold immunity, tenacious

**Conversion:**
- Level 3 -> Tier 2
- Health 9 -> HP 10
- Armor 1 -> +1 to thresholds or Damage Resistance feature
- Damage 4+1 -> 2d6+2 Physical + 1d4 Magic (heat)
- Modifications -> Features (Speed defense as Evasion boost)
- GM Intrusion -> Scalding Vent (Action, 2 Stress)

## Tips

1. **Always include loot** - Players love loot
2. **Add Fear mechanics** to scary creatures
3. **Show damage dice** explicitly in descriptions
4. **Include GM Intrusions** as special abilities for Numenera
5. **Ask clarifying questions** if the stat block is unclear
