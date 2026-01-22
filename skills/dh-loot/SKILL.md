---
name: dh-loot
description: "Generates loot, treasure, and rewards for Daggerheart. Use when the user wants treasure for a hoard, creature drops, quest rewards, or random loot tables. Scales by tier and includes gold, items, consumables, crafting materials, and unique treasures with story hooks."
version: 1.0.0
---

# Daggerheart Loot Generator Skill

Generates thematic, tier-appropriate loot with interesting descriptions and potential plot hooks.

## Reference Document
@~/.claude/skills/daggerheart-docs/daggerheart-reference.md

## When to Use This Skill

Use `/dh-loot` when creating:
- Creature drops after combat
- Treasure hoards in dungeons
- Quest rewards from NPCs
- Random loot tables for a region
- Merchant inventory
- Found items during exploration

## Input Parameters

When generating loot, gather this information:

1. **Tier** (1-4) - Scales value and power
2. **Context** - Where is the loot from?
   - Creature drop (specify creature type)
   - Treasure hoard (specify location)
   - Quest reward (specify quest giver)
   - Random find (specify environment)
3. **Quantity** - Single item, small haul, or major hoard?
4. **Theme** (optional) - Any specific flavor?

## Loot Categories

### 1. Currency (Handfuls/Bags/Chests)

| Tier | Handful | Bag | Chest |
|------|---------|-----|-------|
| 1 | 2d6 gold | 4d6 gold | 10d6 gold |
| 2 | 4d6 gold | 8d6 gold | 20d6 gold |
| 3 | 6d6 gold | 12d6 gold | 40d6 gold |
| 4 | 10d6 gold | 20d6 gold | 100d6 gold |

**Currency Flavor:**
- Don't just say "gold coins" - describe them
- Old empire coins with forgotten faces
- Trade bars stamped with guild marks
- Gemstones used as currency in certain regions
- Foreign coins that need exchanging
- Tarnished silver mixed with gold

### 2. Consumables

**Potions & Elixirs**

| Tier | Common | Uncommon | Rare |
|------|--------|----------|------|
| 1 | Healing Draught (restore 1d6 HP) | Antitoxin, Smokebomb | Potion of Invisibility (1 minute) |
| 2 | Greater Healing (restore 2d6 HP) | Potion of Speed, Fire Resistance | Potion of Flying (10 minutes) |
| 3 | Superior Healing (restore 3d6 HP) | Potion of Giant Strength | Potion of Regeneration |
| 4 | Supreme Healing (restore 4d6 HP) | Potion of Invulnerability | Potion of True Seeing |

**Scrolls & Talismans**

| Tier | Effect |
|------|--------|
| 1 | Single-use cantrip or Tier 1 spell |
| 2 | Single-use Tier 2 spell or minor enchantment |
| 3 | Single-use Tier 3 spell or moderate enchantment |
| 4 | Single-use Tier 4 spell or major enchantment |

**Utility Items**

- Torches that never go out (but can be extinguished)
- Rope that ties itself on command
- Chalk that writes on any surface
- Compass that points to the nearest [thing]
- Mirror that shows what was there an hour ago
- Bell that only the holder can hear

### 3. Equipment & Gear

**Weapons by Tier**

| Tier | Quality | Bonus | Special |
|------|---------|-------|---------|
| 1 | Serviceable | +0 | Well-made but mundane |
| 2 | Fine | +1 | Minor magical property |
| 3 | Exceptional | +2 | Significant magical property |
| 4 | Legendary | +3 | Major magical property + history |

**Armor by Tier**

| Tier | Quality | Bonus | Special |
|------|---------|-------|---------|
| 1 | Sturdy | +0 | Reliable but plain |
| 2 | Reinforced | +1 Evasion | Minor enchantment |
| 3 | Masterwork | +2 Evasion | Significant enchantment |
| 4 | Legendary | +3 Evasion | Major enchantment + history |

**Equipment Properties**

Roll or choose interesting properties:

*Elemental:*
- Flaming (sheds light, +1d4 fire damage)
- Frosted (cold to touch, +1d4 cold damage)
- Shocking (hums with energy, +1d4 lightning)
- Venomous (drips poison, +1d4 poison)

*Utility:*
- Returning (comes back when thrown)
- Silent (makes no sound)
- Glowing (sheds light on command)
- Featherlight (weighs almost nothing)
- Unbreakable (cannot be damaged)

*Combat:*
- Keen (crits on 19-20)
- Brutal (+1 damage die on crit)
- Guardian (+1 to ally Evasion within Close)
- Vampiric (heal 1 HP on killing blow)

### 4. Crafting Materials

**By Creature Type**

| Creature | Materials | Uses |
|----------|-----------|------|
| Beast | Hide, fangs, claws, bones | Armor, weapons, tools |
| Dragon | Scales, teeth, blood, heart | Legendary items, potions |
| Undead | Bone dust, ectoplasm, grave dirt | Necromantic components |
| Construct | Gears, cores, animated metal | Mechanical items |
| Elemental | Essence, crystallized element | Enchanting, alchemy |
| Fey | Glamour dust, moonpetals | Illusion items, charms |
| Fiend | Brimstone, ichor, horn | Dark items, bindings |
| Aberration | Chitin, eye fluid, void residue | Strange items, wards |

**Material Quality by Tier**

| Tier | Quality | Value | Crafting Bonus |
|------|---------|-------|----------------|
| 1 | Common | 5-15 gold | None |
| 2 | Quality | 20-50 gold | +1 to craft |
| 3 | Rare | 75-200 gold | +2 to craft |
| 4 | Pristine | 300+ gold | +3 to craft |

### 5. Valuables & Trade Goods

**Art Objects**

| Tier | Examples | Value |
|------|----------|-------|
| 1 | Silver ring, carved figurine, small painting | 10-25 gold |
| 2 | Gold necklace, tapestry, marble bust | 50-100 gold |
| 3 | Jeweled dagger, masterwork painting, ancient artifact | 200-500 gold |
| 4 | Crown jewels, legendary artwork, divine relic | 1000+ gold |

**Trade Goods**

- Bolts of silk, exotic spices, rare wines
- Preserved monster parts, alchemical reagents
- Maps to hidden locations, coded messages
- Deeds to property, letters of credit
- Favors owed, introductions to important people

### 6. Unique Treasures (The Good Stuff)

Every hoard should have at least ONE unique item with:
- A distinctive name
- An unusual appearance
- A minor magical effect OR interesting history
- A potential plot hook

**Unique Item Template:**

```markdown
### [ITEM NAME]

*[Item type] ([Tier] [Rarity])*

> [1-2 sentence physical description]

**Property:** [What it does mechanically]

**History:** [Brief backstory - who made it, who owned it]

**Plot Hook:** [Why this might matter beyond its function]
```

## Naming Unique Items

Like NPCs, avoid generic names. Use the same techniques:

**Good Names:**
- The Creditor's Smile (dagger)
- Widow's Teeth (arrows)
- The Argument Settler (warhammer)
- Conspiracy of Crows (cloak)
- The Last Reasonable Option (crossbow)
- Grandmother's Grudge (poison)
- The Comfortable Silence (boots)
- Bankruptcy (a very large sword)

**Bad Names:**
- Sword of Flames
- Ring of Protection
- Boots of Speed
- Staff of Power

**The Test:** If it sounds like a video game item, rename it.

## Loot Tables by Context

### Creature Drops

**Minions (per group):**
- Handful of coins
- 50% chance: 1 common consumable
- 25% chance: 1 crafting material

**Standard:**
- Bag of coins
- 1 consumable
- 1 crafting material
- 25% chance: 1 piece of equipment

**Bruiser/Leader:**
- Bag of coins
- 1d3 consumables
- 2 crafting materials (quality)
- 50% chance: 1 piece of fine equipment
- 25% chance: 1 unique item

**Solo:**
- Chest of coins
- 2d4 consumables
- 3 crafting materials (rare+)
- 1 piece of exceptional equipment
- 1 unique item with plot hook

### Treasure Hoards

**Small Hoard (hidden cache, minor tomb):**
- 2d4 bags of coins
- 1d4 consumables
- 1d3 valuables
- 1 piece of equipment
- 50% chance: 1 unique item

**Medium Hoard (dragon's stash, bandit treasury):**
- 1d4 chests of coins
- 2d6 consumables
- 2d4 valuables
- 1d4 pieces of equipment
- 1 unique item
- 25% chance: second unique item

**Major Hoard (ancient vault, legendary creature):**
- 2d6 chests of coins
- 4d6 consumables
- 3d6 valuables
- 2d4 pieces of equipment (mixed quality)
- 2d3 unique items with plot hooks
- 1 legendary item

### Quest Rewards

**Minor Quest:**
- Bag of coins
- 1 consumable OR 1 piece of equipment
- Information or a favor

**Standard Quest:**
- 2 bags of coins
- Choice of consumables or equipment
- Access to services/locations
- Possible unique item

**Major Quest:**
- Chest of coins
- Significant equipment upgrade
- Unique item with personal connection
- Reputation/status reward
- Plot advancement

## Output Format

### Single Item

```markdown
## [ITEM NAME]

*[Type] | [Tier] [Rarity] | Value: [X] gold*

> [Physical description]

**Properties:**
- [Mechanical effect]
- [Secondary effect if any]

**History:** [Backstory]

**Plot Hook:** [Why it matters]
```

### Loot Haul

```markdown
# [CONTEXT] Loot

*[Tier X] [Type of loot source]*

---

## Currency
- [Description and amount]

## Consumables
- [Item]: [Effect]
- [Item]: [Effect]

## Equipment
- [Item]: [Properties]

## Materials
- [Material]: [Quantity, quality, uses]

## Valuables
- [Item]: [Value, description]

## Unique Treasure

### [UNIQUE ITEM NAME]
[Full unique item block]

---

**Total Approximate Value:** [X] gold

**Notes for GM:** [Any plot hooks or complications]
```

## Example

**User:** "Generate loot for a Tier 2 undead knight boss"

**Output:**

```markdown
# DEATH KNIGHT CASTELLAN Loot

*Tier 2 Solo Drop*

---

## Currency

A leather pouch containing 47 gold pieces - old imperial coins bearing the face of an emperor dead three centuries. The gold is untarnished, as if freshly minted.

## Consumables

- **Grave Dust Vial (3)**: When thrown, creates a 10ft cloud of obscuring fog that undead can see through. Lasts 1 minute.
- **Binding Candle**: When lit near a corpse, prevents it from rising as undead for 24 hours.

## Equipment

- **Castellan's Chainmail** (Fine, +1 Evasion): Black iron links that never rust. The wearer feels a faint chill but gains resistance to fear effects.

## Materials

- **Death Knight Essence** (Rare): A faintly glowing wisp trapped in the knight's collapsed armor. Used in crafting items that interact with undead. Worth 150 gold to the right buyer.
- **Grave Iron Fragments** (Quality): Metal from the knight's blade, still holding necrotic energy. Can be reforged into a weapon that deals +1d4 necrotic damage. Worth 60 gold.

## Valuables

- **Signet Ring**: Bears the crest of House Valoreth, a noble family believed extinct. Worth 75 gold, or potentially much more to the right heir.
- **Faded Portrait**: A small locket containing a painted portrait of a young woman. The back reads "Until the last sunset. - K"

## Unique Treasure

### THE FINAL OATH

*Longsword | Tier 2 Rare | Value: 400 gold*

> A blade of blackened steel with a single word etched in Old Imperial along the fuller: "REMEMBER." The crossguard is shaped like skeletal hands clasped in prayer.

**Properties:**
- +1 to attack rolls
- Deals +1d4 necrotic damage to living creatures
- Once per day, the wielder can speak the command word ("Remember") to gain advantage on their next attack against a creature that has harmed an ally

**History:** This blade belonged to Ser Aldric Valoreth, who swore to protect his lord's daughter unto death. He kept that oath—the curse that bound him as a death knight was his refusal to abandon his post even after death claimed him. The daughter he guarded died of old age decades ago.

**Plot Hook:** House Valoreth's distant descendants still exist, living as commoners unaware of their lineage. The blade "remembers" them—it grows warm when pointed toward a true heir.

---

**Total Approximate Value:** ~800 gold (not counting the sword's historical significance)

**Notes for GM:**
- The signet ring and sword create a potential questline about House Valoreth
- The portrait's "K" could be the daughter or someone else entirely
- A necromancer would pay triple for that essence
```

## Quick Generation Tips

1. **Every hoard tells a story** - Who put this here? Why?
2. **Mix useful and useless** - Some loot is just *interesting*
3. **Unique items need names** - Not "Magic Sword +1"
4. **Include trade goods** - Not everything is weapons and potions
5. **Add complications** - Cursed items, stolen goods, fragile things
6. **Scale to tier** - Tier 1 shouldn't find legendary artifacts
7. **Connect to the world** - Reference factions, history, places
