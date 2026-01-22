---
name: dh-environment
description: "Creates Daggerheart battle environments with terrain features, hazards, and interactive elements. Use when the user wants to create a location for an encounter, asks for 'a dungeon room', 'a forest clearing', 'a combat arena', or describes an environment they want detailed with mechanical effects."
version: 1.0.0
---

# Daggerheart Environment Creator Skill

Creates detailed battle environments with terrain, hazards, and interactive elements.

## Reference Document
@~/.claude/skills/daggerheart-docs/daggerheart-reference.md

## Environment Components

### 1. Terrain Features

**Cover**
| Type | Effect |
|------|--------|
| Light Cover | +2 Evasion against ranged attacks |
| Heavy Cover | +4 Evasion against ranged attacks |
| Total Cover | Cannot be targeted by ranged attacks |

**Difficult Terrain**
- Movement costs double
- Examples: rubble, thick vegetation, shallow water, ice

**Elevation**
| Height | Effect |
|--------|--------|
| Slight (+5 ft) | +1 to ranged attacks |
| Moderate (+10-15 ft) | +2 to ranged attacks, fall damage 1d6 |
| High (+20+ ft) | +3 to ranged attacks, fall damage 2d6+ |

**Special Terrain**
- **Slippery**: Agility roll to move quickly or change direction
- **Unstable**: May collapse, Agility roll to avoid falling
- **Obscured**: Disadvantage on attacks, advantage on stealth

### 2. Hazards

**Hazard Statistics by Severity**

| Severity | Damage | Reaction Roll | Examples |
|----------|--------|---------------|----------|
| Minor    | 1d6    | 10-12         | Campfire, small trap |
| Moderate | 2d6    | 13-15         | Pit trap, acid pool |
| Major    | 3d6    | 16-18         | Lava edge, lightning |
| Severe   | 4d6+   | 19+           | Full immersion, collapse |

**Hazard Types**

**Damage Zones** (continuous effect)
```markdown
**[Hazard Name]**
*Area: [Size/Shape]*
Creatures entering or starting turn in area take **[X]d6 [type] damage**.
*Avoidance: [Attribute] Reaction Roll ([Difficulty]) for half damage*
```

**Traps** (triggered once)
```markdown
**[Trap Name]**
*Trigger: [Condition]*
*Detection: Knowledge/Instinct ([Difficulty])*
Deals **[X]d6 [type] damage** and [effect].
*Avoidance: [Attribute] Reaction Roll ([Difficulty])*
*Disarm: [Skill] ([Difficulty])*
```

**Environmental Effects** (ongoing)
```markdown
**[Effect Name]**
*Condition: [When active]*
[Description of effect on all creatures/specific creatures]
```

### 3. Interactive Elements

**Destructible Objects**
| Object | HP | Effect When Destroyed |
|--------|----|-----------------------|
| Wooden door | 5 | Opens path |
| Stone pillar | 10 | Creates difficult terrain, may damage nearby |
| Chandelier | 3 | Falls, 2d6 damage in area |
| Barrel | 2 | Contents spill (oil, water, etc.) |

**Activatable Elements**
```markdown
**[Element Name]**
*Activation: [How to use]*
*Effect: [What happens]*
*Uses: [Unlimited/Limited]*
```

**Environmental Weapons**
- Pushing enemies into hazards
- Dropping objects
- Collapsing structures
- Releasing contained elements

### 4. Atmosphere

**Lighting**
| Condition | Effect |
|-----------|--------|
| Bright | Normal vision |
| Dim | Disadvantage on far perception |
| Dark | Disadvantage on all perception, advantage on stealth |
| Magical darkness | Darkvision doesn't work |

**Weather/Conditions**
| Condition | Effect |
|-----------|--------|
| Rain | Disadvantage on ranged, fire damage halved |
| Wind | Disadvantage on ranged, flying difficult |
| Fog | Visibility limited to Close range |
| Extreme cold | 1d6 damage per hour without protection |
| Extreme heat | 1d6 damage per hour without protection |

## Environment Templates

### Forest Clearing
```markdown
## Forest Clearing

*A natural arena surrounded by ancient trees*

### Terrain
- **Dense undergrowth** (outer ring): Difficult terrain, light cover
- **Central clearing** (30 ft diameter): Open ground
- **Fallen log** (south): Heavy cover, can be climbed
- **Stream** (east edge): Difficult terrain, 2 ft deep

### Hazards
- **Thorn bushes** (scattered): 1d6 physical damage when pushed through

### Interactive Elements
- **Bee hive** (large oak, north): Can be knocked down, swarm attacks area
- **Loose branches** (canopy): Can be dropped with ranged attack

### Atmosphere
- **Lighting**: Dappled (dim in undergrowth, bright in clearing)
- **Sounds**: Bird calls, rustling leaves (Instinct 12 to hear approach)
```

### Dungeon Chamber
```markdown
## Ancient Ritual Chamber

*A stone room with faded magical circles and crumbling pillars*

### Terrain
- **Stone pillars** (4): Heavy cover, HP 10 each
- **Raised dais** (center): +5 ft elevation
- **Rubble piles** (corners): Difficult terrain, light cover
- **Collapsed section** (northwest): Total cover, blocks movement

### Hazards
**Unstable Floor** (marked tiles)
- Agility Reaction Roll (13) when stepped on
- Failure: Fall 10 ft into pit, 1d6 damage

**Residual Magic** (ritual circle on dais)
- Creatures starting turn on circle: Instinct Roll (14)
- Failure: 1d6 magic damage, random magical effect

### Interactive Elements
- **Ancient lever** (south wall): Opens/closes pit traps
- **Braziers** (4, at pillars): Can be pushed over, 1d6 fire damage
- **Cracked pillar** (northeast): HP 5, falling debris 2d6 in Close

### Atmosphere
- **Lighting**: Dark (magical torches provide dim in 10 ft)
- **Air**: Stale, faint smell of incense
```

### Urban Street
```markdown
## Narrow Market Street

*Crowded stalls and overhanging buildings create a maze of obstacles*

### Terrain
- **Market stalls** (both sides): Light cover, difficult terrain
- **Overhanging balconies** (10 ft up): Heavy cover, can be climbed
- **Alley entrances** (2): Narrow, single file only
- **Fountain** (center): Difficult terrain (water), light cover (basin)

### Hazards
**Cart collision** (if cart released)
- Strength Reaction Roll (14) to avoid
- Failure: 2d6 physical damage, knocked prone

**Falling debris** (if balcony attacked)
- Agility Reaction Roll (12) to avoid
- Failure: 1d6 physical damage

### Interactive Elements
- **Merchant cart** (south): Can be pushed, rolls down slope
- **Awning ropes** (above stalls): Cut to drop awning on enemies
- **Stack of crates** (north): Can be toppled, difficult terrain
- **Bell tower rope** (east): Rings alarm, attracts guards

### Atmosphere
- **Lighting**: Bright (midday) or dim (evening shadows)
- **Crowd**: Civilians flee, may block movement briefly
```

## Creation Process

### Step 1: Define Purpose
- What type of encounter? (Combat, exploration, social?)
- What's the narrative context?
- What tier of play?

### Step 2: Sketch Layout
- Size (Small: 30ft, Medium: 60ft, Large: 100ft+)
- Key terrain features
- Entry/exit points

### Step 3: Add Tactical Elements
- Cover positions
- Elevation changes
- Movement obstacles

### Step 4: Include Hazards
- Match severity to tier
- Consider triggered vs continuous
- Add avoidance options

### Step 5: Create Interactive Elements
- At least 2-3 things players can use
- Environmental weapons
- Tactical advantages to earn

### Step 6: Set Atmosphere
- Lighting
- Weather/conditions
- Sensory details

## Output Format

```markdown
# [Environment Name]

*[Evocative one-line description]*

## Overview
[2-3 sentences describing the space, mood, and purpose]

## Terrain Features

### [Feature Name]
*Location: [Where in the space]*
*Effect: [Mechanical impact]*

[Repeat for each major terrain feature]

## Hazards

### [Hazard Name]
*Type: [Damage zone/Trap/Environmental]*
*Area/Trigger: [Where and how]*
**Damage**: [Xd6 type]
**Avoidance**: [Attribute] Reaction Roll ([Difficulty])
[Additional effects]

## Interactive Elements

### [Element Name]
*Location: [Where]*
*Activation: [How to use]*
*Effect: [What happens]*

## Atmosphere
- **Lighting**: [Condition and effects]
- **Weather**: [If applicable]
- **Sounds**: [Ambient audio, detection DCs]
- **Smells**: [Atmospheric detail]

## Tactical Notes
[2-3 tips for running combat here]

## Suggested Adversaries
[Creatures that fit this environment thematically]

---

*Tags: [environment type tags]*
```

## Tips for Great Environments

1. **Three-dimensional thinking**: Include elevation, things to climb, things overhead
2. **Multiple zones**: Different areas with different tactical properties
3. **Player agency**: Interactive elements that reward creativity
4. **Risk/reward hazards**: Dangerous but potentially useful
5. **Thematic consistency**: Hazards and features should fit the location
6. **Dynamic elements**: Things that can change during combat
