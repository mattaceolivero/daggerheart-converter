# Conversion Rules Reference

This document details how D&D 5e statistics and abilities are converted to Daggerheart equivalents.

## Table of Contents

- [CR to Tier Mapping](#cr-to-tier-mapping)
- [Type Classification](#type-classification)
- [Core Stat Conversion](#core-stat-conversion)
- [Attack Conversion](#attack-conversion)
- [Feature Conversion](#feature-conversion)
- [Specialized Conversions](#specialized-conversions)

## CR to Tier Mapping

Challenge Rating maps to Daggerheart Tier as follows:

| D&D 5e CR | Daggerheart Tier | Description |
|-----------|------------------|-------------|
| 0 - 2 | Tier 1 | Basic threats for new adventurers |
| 3 - 6 | Tier 2 | Moderate challenges for experienced parties |
| 7 - 13 | Tier 3 | Serious threats for veteran adventurers |
| 14 - 30 | Tier 4 | Epic threats for legendary heroes |

**Fractional CR Handling:**
- CR 1/8 (0.125) = Tier 1
- CR 1/4 (0.25) = Tier 1
- CR 1/2 (0.5) = Tier 1

## Type Classification

The converter analyzes the D&D stat block to determine the appropriate Daggerheart adversary type.

### Classification Priority

1. **Swarm** - Detected by "swarm" subtype or name
2. **Solo** - Has legendary actions, mythic actions, legendary resistance, lair actions, or CR >= 10
3. **Minion** - CR 0 or CR <= 0.25, or low HP relative to CR
4. **Horde** - Has Pack Tactics at low CR
5. **Role-based** - Support, Leader, Bruiser, Ranged, Skulk based on abilities
6. **Standard** - Default fallback

### Combat Role Detection

| Indicators | Assigned Role |
|------------|---------------|
| Healing spells, protective abilities, buffs | Support |
| Command/rally abilities, auras affecting allies | Leader |
| High STR, melee multiattack, high damage | Bruiser |
| Ranged attacks outnumber melee, attack spells | Ranged (Artillery) |
| High DEX, mobility traits, stealth | Skulk (Skirmisher) |
| Crowd control spells, restraining abilities | Controller |

## Core Stat Conversion

### Evasion (from AC)

**Formula:** `floor(AC * 0.8) + Tier`

| D&D AC | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|--------|--------|--------|--------|
| 10 | 9 | 10 | 11 | 12 |
| 12 | 10 | 11 | 12 | 13 |
| 14 | 12 | 13 | 14 | 15 |
| 16 | 13 | 14 | 15 | 16 |
| 18 | 15 | 16 | 17 | 18 |
| 20 | 17 | 18 | 19 | 20 |

### Difficulty Classification

| Adversary Type | Difficulty |
|----------------|------------|
| Minion | Minor |
| Standard (CR < Tier * 3) | Minor |
| Standard (CR >= Tier * 3) | Major |
| Solo, Leader | Severe |

### Damage Thresholds

Thresholds are calculated based on Tier and Difficulty:

**Minor Difficulty:**
- Minor: Tier + 2
- Major: Tier * 2 + 4
- Severe: Tier * 3 + 6

**Major Difficulty:**
- Minor: Tier + 3
- Major: Tier * 2 + 6
- Severe: Tier * 3 + 9

**Severe Difficulty:**
- Minor: Tier + 4
- Major: Tier * 2 + 8
- Severe: Tier * 3 + 12

**Reference Table (Minor/Major/Severe):**

| Tier | Minor Diff | Major Diff | Severe Diff |
|------|------------|------------|-------------|
| 1 | 3/6/9 | 4/8/12 | 5/10/15 |
| 2 | 4/8/12 | 5/10/15 | 6/12/18 |
| 3 | 5/10/15 | 6/12/18 | 7/14/21 |
| 4 | 6/12/18 | 7/14/21 | 8/16/24 |

### Hit Points

**Conversion Rules:**
- **Minion:** Always 1 HP (dies in one hit regardless of damage)
- **Standard:** floor(D&D HP / 10), minimum Tier * 2
- **Solo:** floor(D&D HP / 8), minimum Tier * 4

**Examples:**

| D&D HP | Type | Tier | Daggerheart HP |
|--------|------|------|----------------|
| 7 | Minion | 1 | 1 |
| 52 | Standard | 2 | 5 |
| 52 | Solo | 2 | 8 (minimum) |
| 207 | Standard | 3 | 20 |
| 546 | Solo | 4 | 68 |

### Stress Pool

**Calculation:**
- **Minion:** 0 Stress (no special abilities)
- **Standard:** Tier
- **Solo:** Tier * 2

Additional stress is added based on:
- Spellcasting: +ceil(total spell slots / 3)
- Legendary Actions: +legendary action count

## Attack Conversion

### Attack Modifier

**Formula:** `floor(D&D to-hit / 2) + Tier`

Solo creatures add an additional +1 to attack modifier.

| D&D To-Hit | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|------------|--------|--------|--------|--------|
| +4 | +3 | +4 | +5 | +6 |
| +6 | +4 | +5 | +6 | +7 |
| +8 | +5 | +6 | +7 | +8 |
| +10 | +6 | +7 | +8 | +9 |

### Damage Dice Scaling

Based on average damage per hit:

| Avg Damage | Daggerheart Dice |
|------------|------------------|
| 1-5 | 1d6 |
| 6-10 | 1d8 |
| 11-16 | 1d10 |
| 17-22 | 1d12 |
| 23-30 | 2d8 |
| 31+ | 2d10 |

**Damage Modifier:** Tier value (Solo: Tier + 1)

### Damage Type Mapping

| D&D Damage Types | Daggerheart |
|------------------|-------------|
| Slashing, Piercing, Bludgeoning | Physical (phy) |
| Fire, Cold, Lightning, Thunder, Acid, Poison, Force, Necrotic, Radiant, Psychic | Magic (mag) |

**Rule:** If a D&D attack has multiple damage types, the primary (larger) determines the Daggerheart type. If mixed physical/magical, magic takes precedence.

### Range Conversion

| D&D Range | Daggerheart Range |
|-----------|-------------------|
| 5 ft. (melee) | Melee |
| 10 ft. | Very Close |
| 15-30 ft. | Close |
| 60-80 ft. | Far |
| 120+ ft. | Very Far |

### Multiattack Enhancement

When a creature has Multiattack:
- 2 attacks: +1 damage die size (1d6 -> 1d8)
- 3+ attacks: +2 damage die sizes (1d6 -> 1d10)

The enhanced damage represents the consolidated output of multiple attacks.

## Feature Conversion

### Trait to Feature Type

| D&D Trait Pattern | Daggerheart Feature |
|-------------------|---------------------|
| Always active, no action | Passive |
| Has recharge or limited uses | Action with Stress cost |
| Triggered condition | Reaction |

### Cost Mapping

| D&D Mechanic | Daggerheart Cost |
|--------------|------------------|
| At-will | None (free) |
| Recharge 5-6 | 1 Stress |
| Recharge 6 | 2 Stress |
| 1/short rest | 1 Stress |
| 3/day | 1 Stress |
| 1/long rest | 2 Stress |
| 1/day | 2 Stress |
| Legendary Action (1 action) | 1 Stress |
| Legendary Action (2 actions) | 2 Stress |
| Legendary Action (3 actions) | 3 Stress |

### Common Passive Conversions

| D&D Trait | Daggerheart Passive |
|-----------|---------------------|
| Pack Tactics | Advantage when ally is close |
| Magic Resistance | Advantage on saves vs spells |
| Spider Climb | Can climb difficult surfaces |
| Flyby | No opportunity attacks when flying |
| Regeneration | Recovers HP at turn start |
| Keen Senses | Advantage on perception |
| Amphibious | Breathes air and water |

### Legendary Resistance Conversion

D&D's Legendary Resistance becomes a Reaction feature:

**Legendary Resilience** - Reaction: When failing a Reaction Roll, can choose to succeed instead. Costs 2 Stress.

### Spellcasting Conversion

Spells are grouped by usage frequency:

| Spell Category | Feature Type | Cost |
|----------------|--------------|------|
| Cantrips | Passive (at-will casting) | None |
| 1st-3rd level | Action | 1 Stress |
| 4th-6th level | Action | 2 Stress |
| 7th-9th level | Action | 3 Stress |
| At-will (innate) | Passive | None |
| 3/day (innate) | Action | 1 Stress |
| 1/day (innate) | Action | 2 Stress |

### Saving Throw to Reaction Roll

| D&D Save | Daggerheart Attribute |
|----------|----------------------|
| Strength | Strength |
| Dexterity | Agility |
| Constitution | Strength |
| Intelligence | Knowledge |
| Wisdom | Instinct |
| Charisma | Presence |

**Difficulty Conversion:** `floor(DC / 2) + 8`

| D&D DC | Daggerheart Difficulty |
|--------|------------------------|
| 10 | 13 |
| 12 | 14 |
| 14 | 15 |
| 16 | 16 |
| 18 | 17 |
| 20 | 18 |

### Condition Mapping

| D&D Condition | Daggerheart Condition |
|---------------|----------------------|
| Blinded | Disoriented |
| Charmed | Charmed |
| Deafened | Disoriented |
| Frightened | Frightened |
| Grappled | Restrained |
| Incapacitated | Incapacitated |
| Invisible | Hidden |
| Paralyzed | Incapacitated |
| Petrified | Incapacitated |
| Poisoned | Vulnerable |
| Prone | Vulnerable |
| Restrained | Restrained |
| Stunned | Incapacitated |
| Unconscious | Incapacitated |

## Specialized Conversions

### Dragon Conversion

**Color Detection:** Detects from name or subtypes (red, blue, green, black, white, gold, silver, bronze, brass, copper)

**Age Category:** Determined by CR
- Wyrmling: CR 1-4
- Young: CR 5-10
- Adult: CR 11-17
- Ancient: CR 18+

**Breath Weapon:**
- Recharge 5-6 = 2 Stress cost
- Recharge 6 = 3 Stress cost
- Damage scales from 2d8 (wyrmling) to 8d8 (ancient)
- Damage type from dragon color (fire, cold, lightning, acid, poison)

**Legendary Features by Age:**
- Young+: Terrifying Presence (1 Stress)
- Adult+: Wing Buffet (2 Stress), Tail Sweep (2 Stress), Legendary Resilience

### Undead Conversion

**Subtype Detection:** skeleton, zombie, ghost, vampire, lich, wight, mummy, wraith, specter, ghoul, revenant, shadow, banshee, death knight, demilich, nightwalker, boneclaw

**Thematic Features by Type:**
- Skeleton/Zombie: Deathless (resistance to non-magical weapons)
- Ghost/Specter: Incorporeal, Possession
- Vampire: Life Drain, Charm Gaze, Regeneration
- Lich: Paralyzing Touch, Undying Soul
- Mummy: Dreadful Glare, Rotting Fist

**Vulnerabilities Added:**
- Most undead: Radiant damage vulnerability
- Vampire: Sunlight, running water, stakes
- Mummy: Fire
- Zombie: Critical hits

### Construct/Ooze Conversion

**Construct Subtypes:** golem, shield_guardian, homunculus, animated_object

**Construct Features:**
- Artificial: Immune to poison, disease, exhaustion
- Unchanging: Cannot be polymorphed or healed by normal magic
- Spell-Warded (golems): Magic resistance
- Siege Engine (some): Double damage to structures

**Ooze Subtypes:** gelatinous_cube, black_pudding, ochre_jelly, gray_ooze

**Ooze Features:**
- Shapeless: Can move through tiny spaces
- Acidic Body: Deals damage when touched
- Division: When split, creates two smaller oozes (2 Stress)
- Engulf: Can engulf creatures (1 Stress)
- Mindless: Immune to psychic and charm

### Spellcaster Conversion

**Detection:** Has spellcasting trait (traditional or innate)

**Stress Bonus:** ceil(total spell slots / 3)

**Magic Attack Feature:** If creature has damage cantrips, gains a magic attack:
- Attack name from cantrip (Firebolt, Ray of Frost, etc.)
- Range: Far
- Damage: Tier d8 magic
- Can add secondary effects (slow, burning, etc.)

**Key Spell Selection:** Prioritizes damage and control spells for feature conversion
