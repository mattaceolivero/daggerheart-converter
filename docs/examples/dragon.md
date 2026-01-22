# Converting a Dragon

This example demonstrates converting a complex creature with legendary actions.

## D&D 5e Input

```
ADULT RED DRAGON
Huge dragon, chaotic evil

Armor Class 19 (natural armor)
Hit Points 256 (19d12 + 133)
Speed 40 ft., climb 40 ft., fly 80 ft.

STR 27 (+8) DEX 10 (+0) CON 25 (+7) INT 16 (+3) WIS 13 (+1) CHA 21 (+5)

Saving Throws Dex +6, Con +13, Wis +7, Cha +11
Skills Perception +13, Stealth +6
Damage Immunities fire
Senses blindsight 60 ft., darkvision 120 ft., passive Perception 23
Languages Common, Draconic
Challenge 17 (18,000 XP)

Legendary Resistance (3/Day). If the dragon fails a saving throw, it
can choose to succeed instead.

ACTIONS
Multiattack. The dragon can use its Frightful Presence. It then makes
three attacks: one with its bite and two with its claws.

Bite. Melee Weapon Attack: +14 to hit, reach 10 ft., one target.
Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage.

Claw. Melee Weapon Attack: +14 to hit, reach 5 ft., one target.
Hit: 15 (2d6 + 8) slashing damage.

Tail. Melee Weapon Attack: +14 to hit, reach 15 ft., one target.
Hit: 17 (2d8 + 8) bludgeoning damage.

Frightful Presence. Each creature of the dragon's choice that is within
120 feet must succeed on a DC 19 Wisdom saving throw or become
frightened for 1 minute.

Fire Breath (Recharge 5-6). The dragon exhales fire in a 60-foot cone.
Each creature in that area must make a DC 21 Dexterity saving throw,
taking 63 (18d6) fire damage on a failed save, or half on a success.

LEGENDARY ACTIONS
The dragon can take 3 legendary actions, choosing from the options below.

Detect. The dragon makes a Wisdom (Perception) check.
Tail Attack (Costs 2 Actions). The dragon makes a tail attack.
Wing Attack (Costs 2 Actions). The dragon beats its wings. Each creature
within 10 feet must succeed on a DC 22 Dexterity saving throw or take
15 (2d6 + 8) bludgeoning damage and be knocked prone.
```

## Daggerheart Output

```markdown
# ADULT RED DRAGON
**Tier 4 Solo**

A massive, flame-wreathed terror with scales like smoldering embers
and eyes that burn with malevolent intelligence. The most fearsome
and greedy of dragonkind.

**Motives & Tactics:** Dominate, hoard, incinerate, terrify

**Difficulty:** Severe | **Thresholds:** 8/16/24 | **HP:** 32 | **Stress:** 11
**ATK:** +8 | **Bite:** Close | 2d10+5 phy (+ fire damage)

**Experience:** Flame +3, Domination +2, Ancient Lore +2

**Movement:** Standard (Close), can fly, can climb

## FEATURES

**Fire Immunity** - **Passive:** Immune to fire damage.

**Legendary Resilience** - **Reaction:** When failing a Reaction Roll,
spend 2 Stress to succeed instead.

**Frightful Presence** - **Action (1 Stress):** All creatures within
Far range must make an Instinct Reaction Roll (difficulty 17) or
become Frightened.

**Fire Breath** - **Action (2 Stress):** All creatures in a Close-range
cone must make an Agility Reaction Roll (difficulty 18). On failure,
take 6d8 magic damage. On success, take half damage.

**Tail Sweep** - **Reaction (2 Stress):** When a creature moves behind
the dragon, make a tail attack against them.

**Wing Buffet** - **Action (2 Stress):** All creatures within Very
Close range must make an Agility Reaction Roll (difficulty 18) or
take 2d6+5 physical damage and become Vulnerable.

## RELENTLESS

The dragon acts 3 times per round, taking legendary actions between
other creatures' turns.
```

## Conversion Notes

### Classification

- **CR 17** maps to **Tier 4** (CR 14+ = Tier 4)
- **Legendary Actions** trigger **Solo** classification
- Solo creatures are designed to fight alone against a full party

### Statistics

| D&D Stat | Calculation | Result |
|----------|-------------|--------|
| CR 17 | CR 14+ = Tier 4 | **Tier 4** |
| Type | Has legendary actions | **Solo** |
| AC 19 | floor(19 * 0.8) + 4 = 19 | **Evasion 19** |
| HP 256 | Solo: 256/8 = 32 | **HP 32** |
| Stress | Solo: 4*2 = 8, +3 legendary | **Stress 11** |
| Difficulty | Solo = Severe | **Severe** |
| Thresholds | Tier 4 Severe | **8/16/24** |

### Attack Conversion

**Bite (Primary Attack):**
- To-hit +14: floor(14/2) + 4 + 1 (Solo) = **+8**
- Damage 2d10+8 piercing + 2d6 fire (avg 26): **2d10** base
- Modifier: Tier 4 + 1 (Solo) = **+5**
- Mixed physical + fire = **Physical** (primary type)
- Reach 10 ft. = **Close**
- Fire damage noted as additional effect

**Multiattack Enhancement:**
- 3 attacks in Multiattack
- Would normally increase die size by +2 steps
- Already at 2d10, stays at that maximum

### Legendary Actions to Relentless

The dragon's 3 legendary actions per round become:

1. **Relentless(3)** - Can act 3 times per round
2. Individual legendary actions converted to features with Stress costs matching their action cost

**Tail Attack (2 actions)** becomes **Tail Sweep (2 Stress)**
**Wing Attack (2 actions)** becomes **Wing Buffet (2 Stress)**

### Feature Conversions

**Legendary Resistance (3/Day):**
- Becomes **Legendary Resilience** Reaction
- Costs 2 Stress per use
- Can use multiple times per fight (Stress-limited, not count-limited)

**Frightful Presence:**
- D&D: DC 19 Wisdom save, frightened 1 minute
- Daggerheart: Instinct Reaction Roll, difficulty floor(19/2)+8 = 17
- Condition: Frightened
- Cost: 1 Stress (moderate power, frequently useful)

**Fire Breath (Recharge 5-6):**
- Recharge 5-6 = 2 Stress cost
- D&D: DC 21 Dex save, 63 fire damage average
- Daggerheart: Agility Reaction Roll, difficulty 18
- Damage: Scaled to 6d8 magic (average 27 - appropriate for Tier 4)
- AOE: 60-foot cone = Close range cone

### Dragon Specialization Applied

The dragon converter detects:
- **Color:** Red (from name)
- **Age:** Adult (CR 17, between 11-17)
- **Breath Type:** Fire
- **Thematic Motives:** Dominate, hoard, incinerate, terrify

### Why Solo Type?

Adult dragons with legendary actions embody the Solo adversary:

1. **High HP (32)** - Takes sustained effort to defeat
2. **Relentless(3)** - Acts multiple times, keeping pressure on party
3. **Severe Difficulty** - Hardest to damage significantly
4. **High Stress (11)** - Can use powerful abilities multiple times
5. **Varied Features** - Multiple tactical options per turn

### GM Tips

- **Use Relentless strategically** - Spread actions throughout round
- **Combine Fire Breath with Wing Buffet** - Clump then burn
- **Frightful Presence first** - Apply Frightened before attacking
- **Legendary Resilience sparingly** - Save for critical saves
- **Terrain matters** - Use the dragon's flight and size
- **Consider Lair Actions** - Create environmental hazards (not shown)

### Scaling Suggestions

**Young Red Dragon (CR 10):**
- Tier 3 Solo
- HP 20, Stress 8
- Remove Wing Buffet
- Reduce Breath to 4d8

**Ancient Red Dragon (CR 24):**
- Tier 4 Solo
- HP 68, Stress 14
- Add: Volcanic Presence (Passive: Close range = difficult terrain, 1d6 fire)
- Increase Breath to 8d8
- Add: Relentless(5)
