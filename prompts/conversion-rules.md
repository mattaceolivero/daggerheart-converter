# Conversion Rules Reference

This document contains the detailed rules for converting D&D 5e statistics to Daggerheart equivalents.

## CR to Tier Mapping

| D&D 5e CR | Daggerheart Tier | Description |
|-----------|------------------|-------------|
| 0 - 2 | Tier 1 | Basic threats for new adventurers |
| 3 - 6 | Tier 2 | Moderate challenges for experienced parties |
| 7 - 13 | Tier 3 | Serious threats for veteran adventurers |
| 14 - 30 | Tier 4 | Epic threats for legendary heroes |

**Fractional CR:** CR 1/8, 1/4, 1/2 all map to Tier 1.

## Adversary Type Classification

Classification priority (first match wins):

1. **Swarm** - Name contains "swarm" or has swarm subtype
2. **Solo** - Has legendary actions, mythic actions, legendary resistance, lair actions, or CR >= 10
3. **Minion** - CR 0 or CR <= 0.25, or low HP relative to CR
4. **Horde** - Has Pack Tactics at low CR
5. **Role-based** - Assigned based on abilities:
   - **Support**: Healing spells, protective abilities
   - **Leader**: Command/rally abilities, auras
   - **Bruiser**: High STR, melee multiattack
   - **Ranged**: More ranged than melee attacks
   - **Skulk**: High DEX, mobility traits
6. **Standard** - Default fallback

## Difficulty Classification

| Adversary Type | Difficulty |
|----------------|------------|
| Minion | Minor |
| Standard (CR < Tier x 3) | Minor |
| Standard (CR >= Tier x 3) | Major |
| Solo, Leader | Severe |

## Core Stat Formulas

### Evasion (from AC)

**Formula:** `floor(AC * 0.8) + Tier`

| D&D AC | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|--------|--------|--------|--------|--------|
| 12 | 10 | 11 | 12 | 13 |
| 15 | 13 | 14 | 15 | 16 |
| 18 | 15 | 16 | 17 | 18 |

### Hit Points

| Type | Formula | Minimum |
|------|---------|---------|
| Minion | 1 | 1 |
| Standard | floor(D&D HP / 10) | Tier x 2 |
| Solo | floor(D&D HP / 8) | Tier x 4 |

### Stress Pool

| Type | Formula |
|------|---------|
| Minion | 0 |
| Standard | Tier |
| Solo | Tier x 2 |

Additional Stress for spellcasters: `ceil(total spell slots / 3)`

### Damage Thresholds

**Minor Difficulty:** Tier+2 / Tier*2+4 / Tier*3+6
**Major Difficulty:** Tier+3 / Tier*2+6 / Tier*3+9
**Severe Difficulty:** Tier+4 / Tier*2+8 / Tier*3+12

| Tier | Minor Diff | Major Diff | Severe Diff |
|------|------------|------------|-------------|
| 1 | 3/6/9 | 4/8/12 | 5/10/15 |
| 2 | 4/8/12 | 5/10/15 | 6/12/18 |
| 3 | 5/10/15 | 6/12/18 | 7/14/21 |
| 4 | 6/12/18 | 7/14/21 | 8/16/24 |

## Attack Conversion

### Attack Modifier

**Formula:** `floor(D&D to-hit / 2) + Tier`

Solo creatures add +1.

### Damage Dice

| Average Damage | Daggerheart Dice |
|----------------|------------------|
| 1-5 | 1d6 |
| 6-10 | 1d8 |
| 11-16 | 1d10 |
| 17-22 | 1d12 |
| 23-30 | 2d8 |
| 31+ | 2d10 |

**Damage Modifier:** Tier (Solo: Tier + 1)

### Multiattack Enhancement

- 2 attacks: +1 die size (1d6 -> 1d8)
- 3+ attacks: +2 die sizes (1d6 -> 1d10)

### Damage Types

| D&D Types | Daggerheart |
|-----------|-------------|
| Slashing, Piercing, Bludgeoning | Physical |
| Fire, Cold, Lightning, etc. | Magic |

### Range Conversion

| D&D Range | Daggerheart |
|-----------|-------------|
| 5 ft. | Melee |
| 10 ft. | Very Close |
| 15-30 ft. | Close |
| 60-80 ft. | Far |
| 120+ ft. | Very Far |

## Feature Conversion

### Stress Cost Mapping

| D&D Mechanic | Stress Cost |
|--------------|-------------|
| At-will | None (free) |
| Recharge 5-6 | 1 Stress |
| Recharge 6 | 2 Stress |
| 1/short rest | 1 Stress |
| 3/day | 1 Stress |
| 1/long rest | 2 Stress |
| 1/day | 2 Stress |
| Legendary Action (1) | 1 Stress |
| Legendary Action (2) | 2 Stress |
| Legendary Action (3) | 3 Stress |

### Feature Types

| D&D Pattern | Daggerheart Feature |
|-------------|---------------------|
| Always active | Passive |
| Has recharge/uses | Action with Stress cost |
| Triggered condition | Reaction |

### Condition Mapping

| D&D Condition | Daggerheart |
|---------------|-------------|
| Blinded, Deafened | Disoriented |
| Charmed | Charmed |
| Frightened | Frightened |
| Grappled, Restrained | Restrained |
| Poisoned, Prone | Vulnerable |
| Paralyzed, Stunned, Incapacitated, Petrified, Unconscious | Incapacitated |
| Invisible | Hidden |

### Saving Throw to Reaction Roll

| D&D Save | Daggerheart Attribute |
|----------|----------------------|
| Strength, Constitution | Strength |
| Dexterity | Agility |
| Intelligence | Knowledge |
| Wisdom | Instinct |
| Charisma | Presence |

**DC Conversion:** `floor(DC / 2) + 8`

## Spellcasting Conversion

| Spell Level | Stress Cost |
|-------------|-------------|
| Cantrips | None (Passive) |
| 1st-3rd | 1 Stress |
| 4th-6th | 2 Stress |
| 7th-9th | 3 Stress |

Damage cantrips become a magic attack at Far range with Tier d8 damage.

## Legendary Actions

Converted to **Relentless** feature:
- 3 legendary actions = Relentless(3)
- Acts multiple times per round
- Individual legendary actions become Action features with Stress cost = action cost

**Legendary Resistance** becomes **Legendary Resilience**:
- Reaction: When failing a Reaction Roll, spend 2 Stress to succeed instead

## Specialized Creature Types

### Dragons
- Color determines breath damage type
- Age category (wyrmling/young/adult/ancient) based on CR
- Breath weapon: 2-3 Stress, damage scales with age
- Adult+ get Wing Buffet, Tail Sweep, Legendary Resilience

### Undead
- Subtype-specific features (Incorporeal, Life Drain, Possession)
- Radiant vulnerability common
- Vampires: sunlight/stake weakness
- Liches: Paralyzing Touch, Undying Soul

### Constructs
- Artificial: Immune to poison, disease, exhaustion
- Golems: Magic resistance, spell-warded
- Cannot be polymorphed or healed normally

### Oozes
- Shapeless: Move through tiny spaces
- Acidic Body: Contact damage
- Division: Split when damaged (2 Stress)
- Mindless: Immune to psychic/charm
