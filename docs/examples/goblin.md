# Converting a Goblin

This example demonstrates a simple conversion of a low-CR creature.

## D&D 5e Input

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

Nimble Escape. The goblin can take the Disengage or Hide action as a
bonus action on each of its turns.

ACTIONS
Scimitar. Melee Weapon Attack: +4 to hit, reach 5 ft., one target.
Hit: 5 (1d6 + 2) slashing damage.

Shortbow. Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target.
Hit: 5 (1d6 + 2) piercing damage.
```

## Daggerheart Output

```markdown
# GOBLIN
**Tier 1 Minion**

A small, cunning humanoid with sharp features, beady eyes, and a
malicious grin. Goblins are cowardly alone but dangerous in numbers.

**Motives & Tactics:** Ambush, overwhelm, flee when outmatched

**Difficulty:** Minor | **Thresholds:** 3/6/9 | **HP:** 1 | **Stress:** 0
**ATK:** +3 | **Scimitar:** Very Close | 1d6+1 phy

**Experience:** Sneaking +2, Ambush +1

## FEATURES

**Nimble Escape** - **Passive:** Can freely disengage or hide when
not the center of attention.

**Darkvision** - **Passive:** Can see in darkness.
```

## Conversion Notes

### Classification

- **CR 1/4** maps to **Tier 1**
- **Low CR (1/4)** with low HP (7) triggers **Minion** classification
- Minions always have **1 HP** regardless of original HP

### Statistics

| D&D Stat | Calculation | Result |
|----------|-------------|--------|
| CR 1/4 | CR 0-2 = Tier 1 | **Tier 1** |
| Type | CR <= 0.25 = Minion | **Minion** |
| AC 15 | floor(15 * 0.8) + 1 = 13 | **Evasion 13** |
| HP 7 | Minion = 1 | **HP 1** |
| Stress | Minion = 0 | **Stress 0** |
| Difficulty | Minion = Minor | **Minor** |
| Thresholds | Tier 1 Minor | **3/6/9** |

### Attack Conversion

**Scimitar:**
- To-hit +4: floor(4/2) + 1 = 3 -> **+3**
- Damage 1d6+2 (avg 5.5): stays **1d6** base
- Modifier: Tier 1 = **+1**
- Slashing = **Physical**
- Reach 5 ft. = **Very Close**

**Shortbow:**
- Listed as additional attack (not primary for melee-focused goblin)
- Range 80 ft. = **Far**
- Same damage profile

### Feature Conversion

**Nimble Escape:**
- Original: "Can take Disengage or Hide as bonus action"
- Daggerheart: No bonus action economy, becomes **Passive**
- Simplified: "Can freely disengage or hide when not the center of attention"
- Cost: **None** (always available)

**Darkvision:**
- Converted from senses to **Passive** feature
- Simplified: "Can see in darkness"

### Why Minion Type?

Goblins at CR 1/4 are designed in D&D to be fought in groups. The Minion type in Daggerheart:

1. **1 HP** - Dies in one hit, creating satisfying group combat
2. **0 Stress** - No special abilities to track
3. **Minor Difficulty** - Lowest damage thresholds
4. **Simple stat block** - Easy to run many at once

### GM Tips

- **Deploy in groups** of 3-6 for a balanced Tier 1 encounter
- **Use Nimble Escape** to have goblins flee and regroup
- **Pair with a Leader** (Goblin Boss as Leader type) for tactical variety
- **Environmental ambushes** - Have them attack from hidden positions using their Sneaking experience

### Scaling Suggestions

**Goblin Boss (CR 1) as Leader:**
- Tier 1 Leader instead of Minion
- HP 3, Stress 2
- Add "Rally" action: Allies gain advantage on next attack

**Goblin Horde:**
- Convert multiple goblins to single Horde type
- HP 4-6, representing the group
- Damage reduces when HP drops below half
