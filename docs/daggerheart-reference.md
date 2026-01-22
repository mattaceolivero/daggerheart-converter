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
| Social/Support    | 1 BP | Non-combat focused, debuffs |
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

| Type     | Difficulty | Thresholds | HP    | Stress | ATK  | Damage    |
|----------|------------|------------|-------|--------|------|-----------|
| Minion   | 8-10       | 4/8        | 1     | 0      | -2   | 1d6+3     |
| Standard | 12         | 5/10       | 4     | 3      | +1   | 1d8+1     |
| Horde    | 8          | 4/8        | 4     | 2      | -2   | 1d6+3     |
| Leader   | 13         | 7/13       | 6     | 3      | +3   | 1d10+2    |
| Bruiser  | 11         | 8/15       | 6-8   | 3      | +2   | 1d10+3    |
| Solo     | 14         | 8/15       | 8     | 3      | +2   | 1d10+3    |

### Tier 2 (Player Levels 2-4)

| Type     | Difficulty | Thresholds | HP    | Stress | ATK  | Damage    |
|----------|------------|------------|-------|--------|------|-----------|
| Minion   | 10-12      | 6/12       | 1     | 0      | +1   | 1d8+2     |
| Standard | 14         | 10/20      | 4-6   | 3      | +2   | 2d8+2     |
| Support  | 13         | 9/18       | 3-4   | 3-4    | +2   | 2d8+1     |
| Skulk    | 14         | 9/17       | 4     | 5      | +3   | 2d8+2     |
| Bruiser  | 13-15      | 14/28-15/30| 5-8   | 2-3    | +2   | 2d10+3-2d12+3 |
| Solo     | 15         | 10/20      | 8     | 6      | +2   | 2d6+3     |

### Tier 3 (Player Levels 5-7)

| Type     | Difficulty | Thresholds | HP    | Stress | ATK  | Damage    |
|----------|------------|------------|-------|--------|------|-----------|
| Minion   | 12-14      | 8/16       | 1     | 0      | +3   | 2d6+2     |
| Standard | 16         | 15/30      | 6-8   | 4-5    | +4   | 3d8+3     |
| Support  | 16         | 24/38      | 8     | 5      | +4   | 3d10+6    |
| Skulk    | 16         | 16/32      | 6     | 5      | +0   | 3d8+2     |
| Ranged   | 18         | 20/36      | 6     | 6      | +4   | 3d8+5     |
| Bruiser  | 17         | 22/40      | 9     | 5      | +5   | 3d12      |
| Solo     | 17         | 20/40      | 10-12 | 7      | +5   | 3d10+5    |

### Tier 4 (Player Levels 8-10)

| Type     | Difficulty | Thresholds | HP    | Stress | ATK  | Damage    |
|----------|------------|------------|-------|--------|------|-----------|
| Minion   | 14-16      | 10/20      | 1     | 0      | +5   | 2d8+3     |
| Standard | 18         | 20/40      | 8-10  | 5      | +6   | 4d8+5     |
| Horde    | 17         | 24/48      | 7     | 6      | +2   | 4d10      |
| Social   | 19         | 27/47      | 4     | 3      | +7   | 4d8+5     |
| Leader   | 20         | 37/70      | 7     | 5      | +8   | 4d10+10   |
| Bruiser  | 18         | 30/60      | 10-12 | 6      | +8   | 4d10+6    |
| Solo     | 20         | 35/70      | 12    | 10     | +8   | 4d12+6    |

## Damage Types

Only **two** damage types exist in Daggerheart:

| Type | Description |
|------|-------------|
| **Physical (phy)** | Slashing, piercing, bludgeoning, crushing |
| **Magic (mag)** | Fire, cold, lightning, acid, poison, necrotic, radiant, psychic, force |

**Note:** Subtypes like "fire" or "acid" are flavor text, not mechanical types.

**Direct Damage:** Bypasses armor - target cannot use armor slots to reduce it.

## Feature Cost Guidelines

| Cost | Power Level | Usage |
|------|-------------|-------|
| Free | Least impactful | Passives, minor effects |
| Mark a Stress | Moderate impact | Creates natural cap per scene |
| Spend a Fear | Most powerful | GM's dramatic budget, big moments |

**Stress costs** naturally limit uses because most adversaries can't clear stress.

**Fear costs** come from the GM's Fear pool - a narrative resource.

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

### Support
- Moderate combat stats
- Focus on debuffing PCs
- Features that interfere with PC actions
- Often forces difficult choices

### Bruiser
- Higher HP and damage
- Slightly lower Difficulty (easier to hit)
- Features focused on dealing damage
- May have charge or slam abilities

### Leader
- Moderate combat stats
- Features that buff allies or debuff enemies
- Command abilities, auras
- Often stays in back line

### Skulk
- Higher Difficulty, lower HP
- Mobility features (teleport, dash)
- Stealth and ambush abilities
- Hit-and-run tactics

### Ranged
- Lower Difficulty and HP
- Strong ranged attacks (Far/Very Far)
- May have cover or escape abilities
- Vulnerable in melee

### Horde
- Swarm mechanics with degrading damage
- Starting damage vs reduced damage when at half HP
- Takes up space, difficult terrain
- Example: `Horde (1d4)` - deals 1d4 when at half+ HP marked

### Solo
- Boss-level threat
- Multiple actions per round via Relentless (X)
- Should have fear generation engine
- High Stress pool for many abilities
- May use Countdowns for dramatic tension

## Conditions

### Base Conditions (3 Core)
| Condition | Effect |
|-----------|--------|
| **Vulnerable** | Attacks against have advantage |
| **Restrained** | Can't move |
| **Hidden** | Can't be targeted, advantage on attacks |

### Custom Conditions
Adversaries and environments can define custom conditions with their own rules:
- Must define how to apply the condition
- Must define how to clear the condition
- Examples: Disoriented, Engulfed, Shrouded, Beguiled, Poisoned, Crystallizing

### Condition Clearing
Common clearing triggers:
- "until they roll with hope"
- "when they clear stress"
- "when they take the spotlight"
- "until they succeed on a [Attribute] Roll ([Difficulty])"
- "until the [adversary] is defeated"

## Range Bands

| Range | Description | D&D Equivalent |
|-------|-------------|----------------|
| Melee | Adjacent, touching | 5 ft |
| Very Close | Arm's reach | 10 ft |
| Close | Nearby, same room | 15-30 ft |
| Far | Across a room | 60-80 ft |
| Very Far | Long distance | 120+ ft |

## Experience Topics

Adversaries have Experience topics that provide bonuses:
- Can be used offensively (adversary attacks)
- GM can spend Fear to apply to PC rolls against the adversary
- Format: `Topic +X` (e.g., `Camouflage +2, Hungry +2`)

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
- GM Intrusions → Special abilities (Action, spend a Fear)

### Pathfinder 2e to Daggerheart
| PF2e Level | Daggerheart Tier |
|------------|------------------|
| -1 to 3    | Tier 1           |
| 4-8        | Tier 2           |
| 9-14       | Tier 3           |
| 15+        | Tier 4           |

## Environment Creation

### Environment Components
Environments are simpler than adversaries - they don't have HP, Stress, Thresholds, or Attack stats.

**Environment Stat Block:**
- **Tier and Type**: (Social, Event, Traversal)
- **Description**: Evocative one-line description
- **Impulses**: What the environment "wants" to do
- **Difficulty**: Target number for rolls against environment
- **Potential Adversaries**: Suggested creatures that fit
- **Features**: With GM prompting questions in italics

### Environment Types
| Type | Focus | Examples |
|------|-------|----------|
| **Social** | Interaction, roleplay | Grand Feast, City of Portals |
| **Event** | Timed scenarios | Heist, Chase |
| **Traversal** | Navigation, exploration | Crystal Wasteland, Dungeon |

### Environment Feature Format
Features include:
- **Passive**: Always active effects
- **Action**: GM spends spotlight or Fear
- **Reaction**: Triggered by PC actions

Each feature should include italicized GM prompting questions:
```
*What does it feel like? How does this change the situation?*
```

### Hazard Statistics
| Severity | Damage | Reaction Roll |
|----------|--------|---------------|
| Minor    | 1d6    | 10-12         |
| Moderate | 2d6    | 13-15         |
| Major    | 3d6    | 16-18         |
| Severe   | 4d6+   | 19+           |

## Common Mechanics

### Countdowns
Used for building tension or tracking progress:
- **Standard**: Ticks down on action rolls
- **Loop**: Resets after triggering
- Format: `Countdown (X)` or `Countdown (Loop X)`

### Tokens
Placed on stat blocks to track states:
- Can be spent for effects
- Can modify stats while present

### Relentless (X)
Solo adversaries can be spotlighted X times per GM turn.

### Evolution
Adversary transforms when conditions are met, gaining new stats/features.

---

## Sources

- [Daggerheart Homebrew Kit v1.0](https://www.daggerheart.com/homebrewkit/)
- [Daggerheart Adversaries & Environments v1.5](https://daggerheart.com)
- [Daggerheart Battle Guide](https://app.demiplane.com/nexus/daggerheart/rules/battle-guide)
- [Heart of Daggers - Making Custom Adversaries](https://heartofdaggers.com/products/making-custom-adversaries/)
- [Daggerheart Encounter Builder](https://coryroush.github.io/daggerheart-encounter-builder/)
- Mike Underwood's Monster Factory Stream (design process insights)
