# Daggerheart Reference Guide

Comprehensive reference for adversary creation, encounter balancing, and conversion.

## Player Level to Tier Mapping

| Player Level | Daggerheart Tier | Threat Description |
|--------------|------------------|-------------------|
| 1            | Tier 1           | New adventurers   |
| 2-4          | Tier 2           | Experienced       |
| 5-7          | Tier 3           | Veterans          |
| 8-10         | Tier 4           | Legendary heroes  |

## Battle Points System

### Base Formula
```
Battle Points = (3 × number of PCs) + 2
```

| Party Size | Base Battle Points |
|------------|-------------------|
| 2 PCs      | 8 BP              |
| 3 PCs      | 11 BP             |
| 4 PCs      | 14 BP             |
| 5 PCs      | 17 BP             |
| 6 PCs      | 20 BP             |

### Battle Point Costs by Adversary Type

| Adversary Type    | Cost | Description |
|-------------------|------|-------------|
| Minion (group)    | 1 BP | Group size = party size |
| Social/Support    | 1 BP | Non-combat focused |
| Horde             | 2 BP | Swarm mechanics |
| Ranged            | 2 BP | Ranged attackers |
| Skulk             | 2 BP | Stealth/mobility |
| Standard          | 2 BP | Typical adversary |
| Leader            | 3 BP | Buffs/commands allies |
| Bruiser           | 4 BP | High damage dealer |
| Solo              | 5 BP | Boss-level threat |

### Difficulty Modifiers

**Easier Encounters (subtract):**
- -1 BP: Shorter or less dangerous fight
- -2 BP: Using 2+ Solo adversaries
- -2 BP: Adding +1d4 damage to all adversary attacks

**Harder Encounters (add):**
- +1 BP: Adversaries from lower tier
- +1 BP: No Bruisers, Hordes, Leaders, or Solos
- +2 BP: More dangerous or longer fight

## Adversary Statistics by Tier

### Tier 1 (Player Level 1)

| Type     | Evasion | Thresholds  | HP    | Stress | Attack | Damage    |
|----------|---------|-------------|-------|--------|--------|-----------|
| Minion   | 8-10    | 2/4/6       | 1     | 0      | +2     | 1d6       |
| Standard | 10-12   | 3/6/9       | 4-6   | 2      | +3     | 1d6+1     |
| Bruiser  | 9-11    | 4/8/12      | 6-8   | 3      | +4     | 1d8+2     |
| Leader   | 10-12   | 3/6/9       | 5-7   | 3      | +3     | 1d6+1     |
| Solo     | 12-14   | 5/10/15     | 10-15 | 5      | +4     | 1d10+2    |

### Tier 2 (Player Levels 2-4)

| Type     | Evasion | Thresholds  | HP    | Stress | Attack | Damage    |
|----------|---------|-------------|-------|--------|--------|-----------|
| Minion   | 10-12   | 3/6/9       | 1     | 0      | +3     | 1d6+1     |
| Standard | 12-14   | 4/8/12      | 6-10  | 3      | +5     | 1d8+2     |
| Bruiser  | 11-13   | 5/10/15     | 10-14 | 4      | +6     | 2d6+2     |
| Leader   | 12-14   | 4/8/12      | 8-12  | 4      | +5     | 1d8+2     |
| Solo     | 14-16   | 6/12/18     | 18-25 | 7      | +6     | 2d8+3     |

### Tier 3 (Player Levels 5-7)

| Type     | Evasion | Thresholds  | HP    | Stress | Attack | Damage    |
|----------|---------|-------------|-------|--------|--------|-----------|
| Minion   | 12-14   | 4/8/12      | 1     | 0      | +5     | 1d8+2     |
| Standard | 14-16   | 5/10/15     | 10-16 | 4      | +7     | 2d6+3     |
| Bruiser  | 13-15   | 6/12/18     | 16-22 | 5      | +8     | 2d8+4     |
| Leader   | 14-16   | 5/10/15     | 12-18 | 5      | +7     | 2d6+3     |
| Solo     | 16-18   | 7/14/21     | 28-40 | 9      | +8     | 2d10+4    |

### Tier 4 (Player Levels 8-10)

| Type     | Evasion | Thresholds  | HP    | Stress | Attack | Damage    |
|----------|---------|-------------|-------|--------|--------|-----------|
| Minion   | 14-16   | 5/10/15     | 1     | 0      | +7     | 2d6+2     |
| Standard | 16-18   | 6/12/18     | 16-24 | 5      | +9     | 2d8+4     |
| Bruiser  | 15-17   | 7/14/21     | 24-32 | 6      | +10    | 3d8+5     |
| Leader   | 16-18   | 6/12/18     | 18-26 | 6      | +9     | 2d8+4     |
| Solo     | 18-20   | 8/16/24     | 40-60 | 11     | +11    | 3d10+5    |

## Adversary Role Features

### Minion
- Always 1 HP (one-hit kill)
- No Stress (no special abilities)
- Spawn in groups equal to party size
- Use simple attacks, no reactions

### Standard
- Balanced stats across the board
- 1-2 features (passive + action or reaction)
- Forms the core of most encounters

### Bruiser
- Higher HP and damage
- Lower Evasion (easier to hit)
- Features focused on dealing damage
- May have charge or slam abilities

### Leader
- Moderate combat stats
- Features that buff allies or debuff enemies
- Command abilities, auras
- Often stays in back line

### Skulk
- High Evasion, lower HP
- Mobility features (teleport, dash)
- Stealth and ambush abilities
- Hit-and-run tactics

### Ranged
- Lower Evasion and HP
- Strong ranged attacks (Far/Very Far)
- May have cover or escape abilities
- Vulnerable in melee

### Horde
- Swarm mechanics
- Damage reduces as HP drops
- Starting damage vs reduced damage
- Takes up space, difficult terrain

### Solo
- Boss-level threat
- Multiple actions per round (Relentless)
- Legendary abilities (reactions at end of turns)
- Legendary Resilience (auto-succeed saves)
- High Stress pool for many abilities

## Fear and Stress Mechanics

### Fear Generation
Abilities that frighten targets should **mark Fear**:
- Frightful Presence: "Targets must make an Instinct Reaction Roll or **mark 1 Fear** and become Frightened"
- Terrifying abilities add mechanical weight through Fear economy

### Fear Consumption
Powerful abilities can consume Fear for bonus effects:
- "**Requires:** Target has Fear marked"
- "Deals **Xd10 magic damage**. Target clears their Fear."
- Costs listed as "(Action, 1 Fear)"

### Stress Costs
| Ability Power | Stress Cost |
|---------------|-------------|
| Minor ability | 0-1 Stress  |
| Standard ability | 1-2 Stress |
| Powerful ability | 2-3 Stress |
| Legendary ability | 3+ Stress |

## Damage Types

| Type | Examples |
|------|----------|
| Physical | Slashing, piercing, bludgeoning, crushing |
| Magic | Fire, cold, lightning, acid, poison, necrotic, radiant, psychic, force |

## Range Bands

| Range | Description | D&D Equivalent |
|-------|-------------|----------------|
| Melee | Adjacent, touching | 5 ft |
| Very Close | Arm's reach | 10 ft |
| Close | Nearby, same room | 15-30 ft |
| Far | Across a room | 60-80 ft |
| Very Far | Long distance | 120+ ft |

## Conditions

| Condition | Effect |
|-----------|--------|
| Frightened | Disadvantage on attacks, can't approach source |
| Charmed | Won't attack charmer, advantage on social |
| Restrained | Can't move, disadvantage on Agility |
| Vulnerable | Attacks against have advantage |
| Hidden | Can't be targeted, advantage on attacks |
| Disoriented | Disadvantage on attacks and perception |
| Incapacitated | Can't take actions or reactions |

## Loot Guidelines

### By Tier
| Tier | Loot Value | Examples |
|------|------------|----------|
| 1 | Minor | Coins, simple items, consumables |
| 2 | Moderate | Quality equipment, useful items |
| 3 | Valuable | Rare materials, magical items |
| 4 | Legendary | Artifacts, unique treasures |

### By Creature Type
- **Beasts**: Pelts, claws, meat, organs
- **Constructs**: Mechanisms, power cores, materials
- **Undead**: Cursed items, phylacteries, dark relics
- **Dragons**: Scales, blood, teeth, hoard treasure
- **Humanoids**: Equipment, valuables, information

## Source System Conversion

### D&D 5e to Daggerheart
| D&D CR | Daggerheart Tier |
|--------|------------------|
| 0-2    | Tier 1           |
| 3-6    | Tier 2           |
| 7-13   | Tier 3           |
| 14+    | Tier 4           |

### Numenera to Daggerheart
| Numenera Level | Difficulty | Daggerheart Tier |
|----------------|------------|------------------|
| 1-2            | 3-6        | Tier 1           |
| 3-4            | 9-12       | Tier 2           |
| 5-6            | 15-18      | Tier 3           |
| 7-10           | 21-30      | Tier 4           |

**Numenera Stats Mapping:**
- Health → HP (roughly 1:1 or slightly higher)
- Armor → Damage reduction or threshold boost
- Damage → Use damage conversion table
- Level → Determines Tier and base stats
- Modifications → Become features or stat adjustments
- GM Intrusions → Special abilities (Action, 2 Stress)

### Pathfinder 2e to Daggerheart
| PF2e Level | Daggerheart Tier |
|------------|------------------|
| -1 to 3    | Tier 1           |
| 4-8        | Tier 2           |
| 9-14       | Tier 3           |
| 15+        | Tier 4           |

## Environment Creation

### Environment Components
1. **Terrain Features**: Cover, difficult terrain, elevation
2. **Hazards**: Damage zones, traps, environmental effects
3. **Interactive Elements**: Levers, doors, destructible objects
4. **Atmosphere**: Lighting, weather, ambient effects

### Hazard Statistics
| Severity | Damage | Reaction Roll |
|----------|--------|---------------|
| Minor    | 1d6    | 10-12         |
| Moderate | 2d6    | 13-15         |
| Major    | 3d6    | 16-18         |
| Severe   | 4d6+   | 19+           |

### Environment Types
- **Natural**: Forests, caves, mountains, water
- **Urban**: Streets, buildings, sewers, rooftops
- **Dungeon**: Corridors, chambers, traps, secrets
- **Otherworldly**: Elemental planes, dream realms, void

---

## Sources

- [Daggerheart Homebrew Kit](https://www.daggerheart.com/homebrewkit/)
- [Daggerheart Battle Guide](https://app.demiplane.com/nexus/daggerheart/rules/battle-guide)
- [Heart of Daggers - Making Custom Adversaries](https://heartofdaggers.com/products/making-custom-adversaries/)
- [Daggerheart Encounter Builder](https://coryroush.github.io/daggerheart-encounter-builder/)
