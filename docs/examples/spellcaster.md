# Converting a Spellcaster

This example demonstrates converting a creature with significant spellcasting abilities.

## D&D 5e Input

```
ARCHMAGE
Medium humanoid (any race), any alignment

Armor Class 12 (15 with mage armor)
Hit Points 99 (18d8 + 18)
Speed 30 ft.

STR 10 (+0) DEX 14 (+2) CON 12 (+1) INT 20 (+5) WIS 15 (+2) CHA 16 (+3)

Saving Throws Int +9, Wis +6
Skills Arcana +13, History +13
Damage Resistances damage from spells; nonmagical bludgeoning,
  piercing, and slashing (from stoneskin)
Senses passive Perception 12
Languages any six languages
Challenge 12 (8,400 XP)

Magic Resistance. The archmage has advantage on saving throws against
spells and other magical effects.

Spellcasting. The archmage is an 18th-level spellcaster. Its spellcasting
ability is Intelligence (spell save DC 17, +9 to hit with spell attacks).
The archmage can cast disguise self and invisibility at will and has
the following wizard spells prepared:

Cantrips (at will): fire bolt, light, mage hand, prestidigitation, shocking grasp
1st level (4 slots): detect magic, identify, mage armor, magic missile
2nd level (3 slots): detect thoughts, mirror image, misty step
3rd level (3 slots): counterspell, fly, lightning bolt
4th level (3 slots): banishment, fire shield, stoneskin
5th level (3 slots): cone of cold, scrying, wall of force
6th level (1 slot): globe of invulnerability
7th level (1 slot): teleport
8th level (1 slot): mind blank
9th level (1 slot): time stop

ACTIONS
Dagger. Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or
range 20/60 ft., one target. Hit: 4 (1d4 + 2) piercing damage.
```

## Daggerheart Output

```markdown
# ARCHMAGE
**Tier 3 Support**

A master of the arcane arts, wrapped in shimmering magical protections.
Their eyes gleam with accumulated knowledge and barely contained power.

**Motives & Tactics:** Manipulate, outthink, escape, preserve knowledge

**Difficulty:** Major | **Thresholds:** 6/12/18 | **HP:** 9 | **Stress:** 9
**ATK:** +5 | **Fire Bolt:** Far | 3d8 mag

**Experience:** Arcana +3, Forbidden Lore +2, Planar Knowledge +2

**Movement:** Standard (Close), can fly (when active)

## FEATURES

**Magic Resistance** - **Passive:** Has advantage on Reaction Rolls
against magic effects.

**Arcane Shield** - **Passive:** While not wearing armor, Evasion is 15
(includes magical protection).

**Invisibility** - **Passive:** Can become Hidden at will when not
engaged in combat.

**Cantrips** - **Passive:** Can cast minor magical effects at will
(light, mage hand, prestidigitation).

**Minor Spells** - **Action (1 Stress):** Cast detect magic, magic
missile (2d4+2 force damage, auto-hit), misty step (teleport Very Close).

**Major Spells** - **Action (2 Stress):** Cast lightning bolt (4d8
magic damage in a line, Agility Roll difficulty 16), banishment
(target makes Presence Roll difficulty 16 or is removed from combat),
cone of cold (4d8 magic damage in cone, Agility Roll).

**Legendary Spells** - **Action (3 Stress):** Cast time stop (take
2 consecutive actions), globe of invulnerability (immune to spells
for rest of scene).

**Counterspell** - **Reaction (2 Stress):** When a creature within
Close range casts a spell, negate it.
```

## Conversion Notes

### Classification

- **CR 12** maps to **Tier 3** (CR 7-13)
- **Heavy spellcasting** with support spells triggers **Support** role
- Control spells (banishment, wall of force) reinforce Support classification

### Statistics

| D&D Stat | Calculation | Result |
|----------|-------------|--------|
| CR 12 | CR 7-13 = Tier 3 | **Tier 3** |
| Type | Spellcaster with control/utility | **Support** |
| AC 15 | floor(15 * 0.8) + 3 = 15 | **Evasion 15** |
| HP 99 | Standard: 99/10 = 9 | **HP 9** |
| Stress | Tier 3 + spell bonus | **Stress 9** |
| Difficulty | Standard CR >= Tier*3 (12 >= 9) | **Major** |
| Thresholds | Tier 3 Major | **6/12/18** |

### Stress Calculation

1. **Base:** Tier 3 = 3
2. **Spell Slots:** 4+3+3+3+3+1+1+1+1 = 20 slots
3. **Spell Bonus:** ceil(20/3) = 7
4. **Total:** 3 + 7 = 10, capped at 9 for non-Solo

### Attack Conversion

The archmage's dagger is replaced with a spell attack:

**Fire Bolt (Cantrip):**
- Spell attack: +9 to hit at 18th level
- Cantrip damage at 18th level: 4d10
- Converted: +5 attack, 3d8 magic, Far range

This represents the archmage's primary combat option.

### Spellcasting Conversion

The converter groups spells by power tier:

**At-Will Spells:**
- Cantrips become **Passive** (minor magical effects)
- Disguise self, invisibility become **Passive** features

**1st-3rd Level (1 Stress):**
- Grouped as **Minor Spells**
- Key spells selected: magic missile (reliable damage), misty step (mobility)
- Control spells like counterspell get separate feature

**4th-6th Level (2 Stress):**
- Grouped as **Major Spells**
- Key selections: lightning bolt (damage), banishment (control), cone of cold (AOE)
- Defensive spells like stoneskin become passive Evasion bonus

**7th-9th Level (3 Stress):**
- Grouped as **Legendary Spells**
- time stop, teleport converted as emergency options
- globe of invulnerability as defensive ultimate

### Feature Conversions

**Magic Resistance:**
- D&D: Advantage on saves vs spells
- Daggerheart: Advantage on Reaction Rolls vs magic
- Type: Passive (always active)

**Counterspell:**
- D&D: Reaction to negate a spell
- Daggerheart: Reaction feature
- Trigger: Creature within Close casts a spell
- Cost: 2 Stress (powerful defensive option)

**At-Will Spells:**
- Invisibility becomes part of Hidden passive
- Disguise self folded into description
- Utility cantrips grouped as flavor passive

### Spell Selection Strategy

Not all 20+ spells can become features. The converter prioritizes:

1. **Damage spells** - fire bolt (cantrip), lightning bolt, cone of cold
2. **Control spells** - banishment, wall of force -> simplified
3. **Defensive spells** - shield, mage armor -> Evasion bonus
4. **Utility spells** - misty step for mobility, counterspell for reaction
5. **Ultimate spells** - time stop as big action option

### Why Support Type?

The archmage exemplifies Support because:

1. **Control focus** - Banishment, wall of force, time stop manipulate battlefield
2. **Low direct damage** - Spells do less damage than a Bruiser's attacks
3. **Defensive options** - Multiple ways to protect self and allies
4. **Moderate HP (9)** - Not meant to take sustained hits
5. **High Stress (9)** - Can cast many spells before running dry

### GM Tips

- **Open with Major Spells** - Lightning bolt or cone of cold for impact
- **Counterspell wisely** - Save for party's most dangerous spells
- **Use Invisibility** - Hide, reposition, then blast
- **Time Stop as finisher** - Two actions in a row when desperate
- **Misty Step to escape** - Teleport away when cornered
- **Protect with minions** - Pair with summoned creatures or guards

### Scaling Suggestions

**Mage (CR 6) as Standard:**
- Tier 2 Support
- HP 5, Stress 5
- Remove Legendary Spells tier
- Primary spells: magic missile, lightning bolt, shield

**Lich (CR 21) as Solo:**
- Tier 4 Solo
- HP 17, Stress 14
- Add: Undead conversion features
- Add: Legendary Actions (Cantrip, Paralyzing Touch, Disrupt Life)
- Add: Relentless(3)
