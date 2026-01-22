# D&D to Daggerheart Monster Conversion Tool - PRD

## Project Overview

### Purpose
Create an intelligent agent that converts D&D 5th Edition (and other RPG system) monsters into Daggerheart-compatible adversaries while maintaining the narrative essence and mechanical role of the original creature.

### Target Users
- Game Masters running Daggerheart campaigns who want to adapt existing D&D adventures
- Homebrew creators adapting monsters from other systems
- GMs who want to quickly generate Daggerheart adversaries inspired by familiar D&D monsters

### Core Functionality
The tool should:
1. Accept D&D 5e monster stat blocks (text, JSON, or structured input)
2. Analyze the monster's role, theme, and mechanical identity
3. Generate a complete Daggerheart adversary stat block
4. Provide design notes explaining conversion decisions
5. Support monsters from other game systems beyond D&D 5e

---

## Background: Understanding the Systems

### Key Differences Between D&D 5e and Daggerheart

#### D&D 5e Monster Design
- **AC (Armor Class)**: Defense rating targets need to beat
- **Hit Points**: Large pools (can be 100+ for high CR)
- **Challenge Rating (CR)**: Power level indicator
- **Multiple attacks per turn**: Common via Multiattack
- **Saving throws**: Force players to roll saves
- **Damage resistances/immunities**: Granular damage typing
- **Actions/Bonus Actions/Reactions**: Structured action economy
- **Conditions**: Many specific conditions (prone, stunned, etc.)

#### Daggerheart Adversary Design
- **Difficulty**: Target number PCs roll against (typically 8-20)
- **Hit Points**: Much smaller (1-12 typically)
- **Damage Thresholds**: Major and Severe (determines HP loss)
- **Tier system**: 1-4, not CR
- **Stress**: Resource for adversary special abilities
- **Fear economy**: GM resource for adversary actions
- **Simplified damage types**: Physical or Magic only
- **Adversary types**: Minion, Standard, Skulk, Bruiser, Ranged, Support, Leader, Horde, Solo, Social
- **Features**: Passive, Action, Reaction (not bound to turn structure)
- **Spotlight system**: Instead of initiative order

### Design Philosophies

#### Daggerheart Core Principles (from Homebrew Kit)
1. **Balance narrative focus and dynamic combat**
2. **Streamline, then streamline again** - Avoid complexity
3. **Make the game tactile** - Use tokens, cards, physical elements
4. **Limit cognitive load** - GMs manage multiple adversaries
5. **Embrace collaboration** - Players contribute to fiction
6. **Design for flexibility** - Leave room for interpretation
7. **Think asymmetrically** - PCs and adversaries work differently

#### Key Design Guidance from Mike Underwood's Transcript

**On Limiting Cognitive Load:**
> "We want GMs to be able to read it and reread features really quickly and easily... We're always looking to be the most efficient to try to streamline to not write more in a feature than we need."

**On Maintaining Player Agency:**
> "I want to make it harder, but I want to maintain agency and control over their characters... The player is offered a choice. They are incentivized to do the thing that is that makes problems for them because otherwise they have to pay a price."

**On Feature Complexity:**
> "If a domain feature calls for the card to be placed in the player's vault, that card should probably have a higher Recall Cost, as a low Recall Cost would reduce the penalty."

**On Hit Points Philosophy:**
> "I think what they're going to do is they are going to have various things that debuff the player characters, make it harder for the PCs to eliminate them. But the thing I want to keep in mind is I want to make it harder, but I want to maintain agency."

---

## Conversion Methodology

### Step 1: Identify the Monster's Core Identity

#### Narrative Theme
- What IS this creature? (gibbering mouther = confusion/madness, gelatinous cube = ambush predator)
- What does it DO in combat? (disrupt, ambush, hit hard, support others)
- What makes it memorable?

#### Mechanical Role Analysis

**From D&D stat block, identify:**
- **Primary attack pattern**: Single big hit vs. many smaller hits
- **Special abilities**: What makes it unique?
- **Defensive capabilities**: Hard to hit vs. lots of HP
- **Mobility**: Fast, slow, teleporting, flying?
- **Control elements**: Does it restrict PC actions?

**Map to Daggerheart adversary type:**
- **Minion**: CR 1/8 - 1/4, dies in 1-2 hits, swarms
- **Standard**: Most CR 1-4 creatures
- **Skulk**: Stealth, ambush, tricky
- **Bruiser**: High damage, moderate HP
- **Ranged**: Attacks from distance
- **Support**: Buffs allies, debuffs enemies
- **Leader**: Commands others, battlefield control
- **Horde**: Groups that weaken when damaged
- **Solo**: Boss monsters, can act multiple times
- **Social**: Non-combat focused

### Step 2: Determine Tier

**Conversion Guide:**
- **CR 0-2**: Tier 1
- **CR 3-6**: Tier 2  
- **CR 7-12**: Tier 3
- **CR 13+**: Tier 4

**Adjustments:**
- Solo monsters: Can stay same tier but add Relentless feature
- Multiple weak enemies: Consider Horde or Minion type
- Special circumstances: Boss of a tier 1 adventure might be tier 2 Solo

### Step 3: Set Core Statistics

#### Difficulty (replaces AC)

**Tier-based defaults:**
- Tier 1: 11 (range 8-13)
- Tier 2: 14 (range 12-16)
- Tier 3: 17 (range 15-19)
- Tier 4: 20 (range 18-22)

**Adjustments from D&D AC:**
- AC 10-12: -1 to tier default
- AC 13-15: Tier default
- AC 16-18: +1 to tier default
- AC 19+: +2 to tier default

#### Damage Thresholds (Major/Severe)

**Tier defaults:**
- Tier 1: 7/12 to 8/15
- Tier 2: 10/20 to 13/28
- Tier 3: 20/32 to 22/40
- Tier 4: 25/45 to 35/70

**From D&D:**
- Low AC, high HP → Lower thresholds
- High AC, low HP → Higher thresholds
- Resistances → Higher thresholds
- Vulnerabilities → Lower thresholds

#### Hit Points

**Mike Underwood's guidance from transcript:**
- **1 HP**: Minions, cannon fodder (dies in one hit regardless of damage)
- **2 HP**: Stronger than minion, guaranteed down in two hits
- **3 HP**: Could be one-shot with severe damage
- **4-6 HP**: Safe bet for Standard adversaries, few hits to defeat
- **7-9 HP**: Tougher, will last whole fight - use cautiously
- **10+ HP**: Very difficult to defeat, use ONE per fight typically

**Conversion from D&D HP:**
- CR ÷ 10 = Base HP suggestion
- Adjust for adversary type:
  - Minion: 1 HP
  - Skulk: -1 HP
  - Standard: Base
  - Bruiser: +1 to +3 HP
  - Solo: +3 to +5 HP

#### Stress

**Typical by tier:**
- Tier 1: 2-3
- Tier 2: 3-5
- Tier 3: 4-6
- Tier 4: 5-10

**Factors:**
- Number of Stress-costing features
- Frequency of expected use
- Solo enemies: More stress (6-10)

#### Attack Modifier

**Tier defaults:**
- Tier 1: +1 (range -1 to +2)
- Tier 2: +2 (range +1 to +3)
- Tier 3: +3 (range +2 to +4)
- Tier 4: +4 (range +3 to +5)

**From D&D to-hit bonus:**
- +3 to +5: Tier default
- +6 to +8: +1 to tier default
- +9+: +2 to tier default
- +0 to +2: -1 to tier default

#### Damage

**Dice pool equals tier** (Tier 2 = 2d8, Tier 3 = 3d8, etc.)

**Damage die size by adversary type:**
- **Minion**: Flat damage (3-8 based on tier)
- **Skulk/Standard**: d6 or d8
- **Support/Social**: d4 or d6
- **Ranged**: d8 or d10
- **Bruiser/Solo**: d10 or d12
- **Horde**: Start high (d8-d10), reduce to d4-d6 when Horde triggers

**Damage bonuses:** +1 to +5 depending on tier and power level

**Damage type:** Physical OR Magic (not both)
- Natural weapons, weapons: Physical
- Spells, magical abilities: Magic

### Step 4: Convert Special Abilities to Features

#### Feature Types

**Passive Features:**
- Always active
- Set baseline behavior
- Examples: Movement special rules, resistances, Hidden triggers

**Action Features:**
- Used when GM spotlights adversary
- Cost: Free, mark Stress, or spend Fear
- Examples: Special attacks, buffs, area effects

**Reaction Features:**
- Have specific triggers
- Used without spotlight
- Cost: Free, mark Stress, or spend Fear
- Examples: Counterattacks, defensive abilities

#### Conversion Priorities

**From Mike Underwood's process with Gibbering Mouther:**

1. **Preserve the fantasy** - What makes this creature unique?
2. **Maintain player agency** - Avoid "you lose control" mechanics
3. **Offer choices** - "GM suggests action OR mark stress" not "you must do X"
4. **Streamline wording** - If it doesn't fit in the feature space, simplify
5. **Create synergy** - Features should work together thematically

#### Specific Conversion Patterns

**D&D "Save or Suck" Abilities:**

❌ **Avoid:** "Target is stunned, no actions"
✅ **Convert to:** "Target marks Stress or takes disadvantage on next roll"
✅ **Better:** "GM suggests an action, player can mark Stress instead"

**Example from transcript - Gibbering:**
```
Original D&D: Roll d8 to determine what you do (lose control)

Converted: "GM suggests a course of action. The player can take that 
action or mark a Stress instead."
```

**D&D Multiattack:**

- Standard attack = single attack
- Multiattack → Action feature that makes multiple attacks for a cost
- OR → Higher damage on standard attack
- OR → Reaction feature to attack again after successful hit

**D&D Resistances/Immunities:**

- "Resistant to physical damage" → Passive: Higher damage thresholds for physical
- "Immune to fire" → Passive: "Attacks that deal magic damage have disadvantage"
- Simplify - only Physical or Magic resistance

**D&D Legendary Actions:**

- → Solo adversary with Relentless(X) feature
- → Reaction features triggered by PC actions
- → Multiple Fear-cost Action features

**D&D Lair Actions:**

- → Environment stat block with features
- → Special adversary features triggered by location
- → Countdown mechanics

### Step 5: Write Motives & Tactics

Short, evocative phrases (3-6) that describe:
- What the adversary wants (motives)
- How it achieves goals (tactics)

**Format:** Verb phrases, alliterative when possible

**Examples from transcript:**
- Gibbering Mouther: "Confound, blind, consume"
- Gelatinous Cube: "Dissolve, engulf, hide"

**From D&D lore/abilities, extract:**
- Tactical behavior implied by abilities
- Personality from description
- Combat role

### Step 6: Choose Experience

1-2 experiences that represent the adversary's expertise

**Format:** Topic +X (where X = 1-3 typically)

**Examples:**
- "Shadows +3" (stealthy creatures)
- "Predator +3" (hunting beasts)
- "Magic +2" (spellcasters)
- "Intrusion +2" (thieves, assassins)

**Usage:** GM can add to Fear Die when ability is relevant, or give disadvantage to PCs

---

## Conversion Examples

### Example 1: Gibbering Mouther (from Transcript)

#### D&D 5e Stats
- **CR**: 2
- **AC**: 9
- **HP**: 67 (9d8 + 27)
- **Speed**: 10 ft., swim 10 ft.
- **Bite**: +2 to hit, 5 ft., 17 (5d6) damage
- **Gibbering**: DC 10 Wisdom save or can't take reactions, roll d8 for action
- **Aberrant Ground**: 10 ft. radius difficult terrain, DC 10 Strength save or speed 0
- **Blinding Spittle**: Dex save or blinded

#### Mike Underwood's Conversion Process (from transcript)

**Step 1 - Identify Type & Tier:**
- Tier 2 (CR 2)
- Originally Skulk, changed to Support (debuffs PCs, doesn't do much damage)

**Step 2 - Core Stats:**
- Difficulty: 13 (AC 9 = below average for tier)
- Thresholds: 9/18 (not tough)
- HP: 3-4 (wants multiple, so low HP each)
- Stress: 3-4
- Attack: +2, 2d8+1 physical

**Step 3 - Convert Abilities:**

**Aberrant Ground (Passive):**
- D&D: DC 10 Strength save in radius or speed 0
- Daggerheart: "If a PC moves into or within Very Close distance of the mouther, they must make a Strength Reaction Roll or become Restrained until they roll with Hope."

**Gibbering (Action - Spend Fear):**
- D&D: Wisdom save or lose control (roll d8)
- Daggerheart: "Target all PCs within Close distance. They must make an Instinct Reaction Roll or mark a Stress and become Disoriented. While Disoriented, when they take the spotlight, the GM suggests a course of action. The player can take that action or mark a Stress instead."
- **Key insight from Mike**: Maintains player agency - they choose whether to follow suggestion or pay cost

**Blinding Spittle (Action - Mark Stress):**
- D&D: Dex save or blinded
- Daggerheart: "Pick a point within Close range. All targets within Very Close of that point must make an Agility Reaction Roll or become Vulnerable until they next take the spotlight."

**Formless Flesh (Reaction - Mark Stress):**
- New ability to give defensive option
- "When mouther is targeted by attack within Very Close, mark Stress to give attacker disadvantage."

**Slow Movement (Passive):**
- Added from D&D speed 10 ft.
- "The mouther can only move within Very Close range as their normal movement."

**Step 4 - Write Up:**

```
GIBBERING MOUTHER
Tier 2 Support

A horrid mass of eyes, mouths, and formless flesh, staring in all 
directions. Its countless mouths yammer ceaselessly.

Motives & Tactics: Confound, blind, bite

Difficulty: 13 | Thresholds: 9/18 | HP: 4 | Stress: 3
ATK: +2 | Bite: Very Close | 2d8+1 phy

Experience: Disorienting +2

FEATURES

Slow Movement - Passive: The mouther can only move within Very 
Close range as their normal movement.

Aberrant Ground - Passive: If a PC moves into or within Very Close 
distance of the mouther, they must make a Strength Reaction Roll 
or become Restrained until they roll with Hope.

Gibbering - Action: Spend a Fear and target all PCs within Close 
distance. They must make an Instinct Reaction Roll or mark a 
Stress and become Disoriented. While Disoriented, when the PC 
takes the spotlight, the GM suggests a course of action. The 
player can take that action or mark a Stress instead. A PC 
clears Disoriented when they clear Stress or when there are no 
mouthers within Far distance when the PC takes the spotlight.

Blinding Spittle - Action: Mark a Stress and pick a point within 
Close range. All targets within Very Close of that point must 
make an Agility Reaction Roll or become Vulnerable until they 
next take the spotlight.

Formless Flesh - Reaction: When the mouther is targeted by an 
attack within Very Close, mark a Stress to give the attacker 
disadvantage.
```

**Design Notes:**
- Reduced HP to 4 (from D&D 67) - wants multiple mouthers deployed
- Changed to Support type - focuses on debuffing, not damage
- Gibbering preserves disorientation theme without removing player agency
- Features synergize: Ground restrains → Gibbering disorients → Spittle makes vulnerable → Bite attacks
- Stress costs limit how often it can use tricks (3 stress = 3 uses total of spittle + formless flesh)

### Example 2: Gelatinous Cube (from Transcript)

#### D&D 5e Stats
- **CR**: 2
- **AC**: 6
- **HP**: 84 (8d10 + 40)
- **Speed**: 15 ft.
- **Pseudopod**: +4 to hit, 5 ft., 10 (3d6) damage
- **Engulf**: Move into creatures, DC 12 Dex save or engulfed (restrained, 10/3d6 acid per turn)
- **Transparent**: DC 15 Perception to notice

#### Conversion Process

**Step 1:**
- Tier 2, Skulk (ambush predator)

**Step 2:**
- Difficulty: 16 (AC 6 = very low, but transparent = hard to spot)
- Thresholds: 16/32 (gelatinous = harder to damage effectively)
- HP: 6 (wants to last through fight once discovered)
- Stress: 5
- Attack: +0 (terrible at actually hitting, but engulf compensates)

**Step 3:**

**Transparent (Passive):**
```
Before they make their first attack or after they become Hidden, 
the cube is indistinguishable from the landscape around it until 
they next act or a PC succeeds on an Instinct Roll to identify them.
```

**I Didn't See It (Passive):**
```
When a PC moves within Melee range of the cube while it is Hidden, 
the cube immediately uses its Engulf feature on that PC.
```

**Engulf (Action - Mark Stress):**
```
Target within Melee range must make a Finesse Reaction Roll or 
become Swallowed. While Swallowed, a creature is Vulnerable and 
can only take actions to attack the cube. When the cube takes the 
spotlight, all Swallowed targets take 2d10 direct magic damage 
and must mark an Armor Slot without receiving its benefits. A 
Swallowed target can make a Strength Roll to escape the cube and 
clear Swallowed.
```

**Design Notes:**
- HP higher (6) than mouther because single creature, not swarm
- Very low attack bonus balances powerful Engulf
- Direct damage + armor slot marking = bypasses armor but still affected by tough characters
- Transparent + Hidden trigger makes ambush deadly
- Could scale to Solo by adding Relentless, more HP, and regeneration

---

## Special Conversion Considerations

### Converting Spellcasters

**Challenge:** D&D wizards have 20+ spells, Daggerheart adversaries have 3-5 features

**Solution:**
1. Pick 2-3 signature spells as Action features
2. Convert spell slots to Stress costs or Fear costs
3. Add Passive for spellcasting flavor
4. Give Experience: Magic +X

**Example Pattern:**
```
Spellcaster - Passive: The adversary can create minor magical 
effects appropriate to their tradition.

Signature Spell - Action: Spend a Fear to [spell effect converted 
to Daggerheart mechanics]

Defensive Magic - Reaction: Mark a Stress when targeted by magic 
damage to gain resistance until next spotlight.
```

### Converting Dragons

**Key elements:**
1. **Breath Weapon**: Action, spend Fear, area effect, Reaction Roll
2. **Frightful Presence**: Passive or Action, PCs lose Hope and/or mark Stress
3. **Flight**: Passive movement, Swooping Strike action
4. **Legendary Actions**: Solo with Relentless(3-5)
5. **Resistances**: Higher thresholds, physical resistance passive

**Type:** Always Solo for adult+, possibly Bruiser for young dragons

### Converting Undead

**Common conversions:**
- **Turn Undead immunity**: Passive
- **Necrotic damage**: Magic damage
- **Life drain**: Damage + target marks Stress or HP
- **Undead fortitude**: Higher HP, or Reaction to avoid marking HP

### Converting Demons/Devils

**Key features:**
- **Resistances**: "Resistant to physical damage"
- **Magical attacks**: All attacks deal magic damage
- **Summoning**: Action (spend Fear) to summon lesser demons as Minions
- **Telepathy**: Add to Experience or description

### Converting Beasts

**Simplest conversions:**
- Usually Standard or Bruiser
- Straightforward attacks
- Add Experience relevant to animal type (Predator, Tracking, etc.)
- One signature ability (wolf pack tactics, bear hug, etc.)

---

## Technical Implementation Guide

### Input Format

The tool should accept:

1. **Structured D&D stat block** (preferred):
```json
{
  "name": "Monster Name",
  "cr": 5,
  "type": "monstrosity",
  "size": "Large",
  "ac": 15,
  "hp": 85,
  "speed": "30 ft., fly 60 ft.",
  "stats": {
    "str": 18, "dex": 12, "con": 16,
    "int": 8, "wis": 10, "cha": 6
  },
  "attacks": [
    {
      "name": "Bite",
      "bonus": 6,
      "reach": "5 ft.",
      "damage": "2d8 + 4 piercing"
    }
  ],
  "special_abilities": [
    {
      "name": "Pack Tactics",
      "description": "Advantage on attack roll if ally within 5 ft."
    }
  ],
  "actions": [...],
  "reactions": [...]
}
```

2. **Plain text stat block** (parse it):
```
GIANT SPIDER
Large beast, unaligned
Armor Class 14 (natural armor)
Hit Points 26 (4d10 + 4)
Speed 30 ft., climb 30 ft.
STR 14 DEX 16 CON 12 INT 2 WIS 11 CHA 4
Skills Stealth +7
Senses blindsight 10 ft., darkvision 60 ft.
Challenge 1 (200 XP)
...
```

3. **Natural language description** (if structured parsing fails):
```
"I want to convert a gelatinous cube. It's CR 2, has high HP but very 
low AC. It's transparent so hard to see. It can engulf creatures and 
digest them with acid."
```

### Output Format

Generate a complete stat block in Markdown:

```markdown
# [MONSTER NAME]
**Tier X [Type]**

[Evocative description - 1-2 sentences]

**Motives & Tactics:** [3-6 verb phrases]

**Difficulty:** X | **Thresholds:** X/X | **HP:** X | **Stress:** X
**ATK:** +X | **[Attack Name]:** [Range] | XdX+X [phy/mag]

**Experience:** [Topic] +X, [Topic] +X

## FEATURES

**[Feature Name]** - **Passive:** [Description]

**[Feature Name]** - **Action:** [Cost if any] [Description]

**[Feature Name]** - **Reaction:** [Trigger] [Cost if any] [Description]

---

## DESIGN NOTES

**Original Creature:** D&D 5e CR X [Type]

**Conversion Decisions:**
- [Explain major choices]
- [Why this tier/type]
- [How abilities were adapted]
- [Potential variations or scaling]

**GM Tips:**
- [How to use effectively]
- [Synergies with other adversaries]
- [Environmental considerations]
```

### Processing Pipeline

```
1. PARSE INPUT
   ├─ Extract stat block data
   ├─ Identify key abilities
   └─ Note flavor/lore

2. ANALYZE ROLE
   ├─ Determine combat role
   ├─ Identify narrative theme
   └─ Assess power level

3. DETERMINE TIER & TYPE
   ├─ CR → Tier conversion
   ├─ Role → Adversary Type
   └─ Solo/group consideration

4. CALCULATE CORE STATS
   ├─ Difficulty (from AC)
   ├─ Thresholds (from AC/HP)
   ├─ HP (from CR/role)
   ├─ Stress (from features)
   ├─ Attack bonus (from to-hit)
   └─ Damage (from tier/type/damage)

5. CONVERT ABILITIES
   ├─ Identify 3-5 most important
   ├─ Passive abilities first
   ├─ Actions (with costs)
   ├─ Reactions (with triggers)
   └─ Ensure synergy

6. WRITE FLAVOR
   ├─ Motives & Tactics
   ├─ Description
   └─ Experience

7. GENERATE NOTES
   ├─ Explain decisions
   ├─ Provide GM guidance
   └─ Suggest variations
```

---

## Quality Assurance Checklist

Before finalizing conversion, verify:

### Balance
- [ ] Stats appropriate for tier?
- [ ] HP reasonable for intended role?
- [ ] Damage output balanced for tier?
- [ ] Features don't overcomplicate?

### Design Principles
- [ ] Cognitive load limited (3-5 features max)?
- [ ] Player agency preserved in abilities?
- [ ] Features streamlined and clear?
- [ ] Fits asymmetrical PC/adversary design?

### Narrative
- [ ] Core fantasy of monster preserved?
- [ ] Motives & tactics evocative?
- [ ] Description captures essence?
- [ ] Memorable and distinct?

### Usability
- [ ] Stat block easy to read at table?
- [ ] Features clearly worded?
- [ ] Costs and triggers obvious?
- [ ] GM notes helpful?

---

## Edge Cases & Special Situations

### Very High CR Creatures (CR 15+)

**Option 1:** Tier 4 Solo
- Relentless(4-5)
- 10-12 HP
- Multiple powerful features

**Option 2:** Multi-Phase Boss
- Tier 4 Solo that evolves
- Phase Change features
- 8 HP per phase

**Option 3:** Legendary + Lair
- Tier 4 Solo adversary
- Separate Environment stat block for lair
- Countdown mechanics for lair effects

### Swarms & Mob Creatures

**Option 1:** Horde
- One stat block
- Horde(XdX) feature
- HP and damage reduce at half HP

**Option 2:** Multiple Minions
- Individual creatures
- 1 HP each
- Group Attack feature

**Option 3:** Environmental Hazard
- Treat as Environment not adversary
- Features represent swarm attacking
- No traditional combat stats

### Constructs & Unusual Creature Types

**Golems:**
- High thresholds
- Resistance to magic or physical
- Immunity = "Attacks of X type have disadvantage"

**Oozes:**
- Low Difficulty
- Unique movement features
- Acidic damage as direct damage

**Ghosts/Incorporeal:**
- Spectral passive (move through objects)
- Immune to physical = "Resistant to physical damage"
- Special vulnerabilities as features

### Iconic D&D Monsters

**Beholder:**
- Tier 3-4 Solo
- Eye Rays as Action with list (like Gobstalker from homebrew kit)
- Anti-magic cone as passive
- Relentless(3)

**Mind Flayer:**
- Tier 2-3 Skulk or Standard
- Mind Blast action (area effect, Reaction Roll)
- Extract Brain as grapple + damage combo
- Experience: Psychic +3

**Tarrasque:**
- Tier 4 Solo
- Relentless(5)
- 12 HP
- Massive size as passive (can't be moved)
- Legendary resistance as Reaction (spend Fear to succeed on save)

---

## Extensibility: Beyond D&D 5e

The tool should support monsters from:

### Pathfinder 2e
- CR system similar to D&D
- More complex abilities → simplify to 3-5 features
- Three-action economy → Daggerheart spotlight

### Old School D&D (OSR)
- Lower numbers, deadlier
- HD → HP conversion
- THAC0 → Attack bonus
- Save or die → Save or mark multiple Stress

### 13th Age
- Escalation die → ignore
- Flexible attacks → pick most iconic
- Triggered abilities → Reaction features

### Dungeon World / PbtA
- Already narrative focused
- Monster moves → Features
- Instincts → Motives & Tactics
- HP → reduce to Daggerheart scale

### MORK BORG / Dark Fantasy
- Often more narrative than mechanical
- Capture tone and feel
- Create Features that evoke horror/dread
- Lower HP, higher threat through conditions

---

## Example Prompts for Agent

When using the agent, GMs might ask:

**Simple conversions:**
- "Convert a D&D owlbear to Daggerheart"
- "Turn this goblin stat block into a Tier 1 minion"

**With context:**
- "Convert a beholder, but make it less OP for Tier 3"
- "I need 5 Tier 2 adversaries from this dungeon module"

**With customization:**
- "Convert a dragon, but make it a Bruiser not Solo"
- "Turn these cultists into Minions with a Leader"

**From description:**
- "Create a Daggerheart version of a rust monster that eats magic items"
- "Convert a D&D necromancer who summons undead"

**Scaling:**
- "This is a Tier 2 troll, scale it up to Tier 4"
- "Take this CR 8 dragon and make it work for Tier 2"

---

## Reference Tables

### Quick CR to Tier Conversion
| D&D CR | DH Tier | Notes |
|--------|---------|-------|
| 0-1/4 | 1 | Minion or weak Standard |
| 1/2-2 | 1 | Standard or strong Standard |
| 3-4 | 2 | Standard |
| 5-6 | 2 | Strong Standard or weak Bruiser |
| 7-9 | 3 | Standard or Bruiser |
| 10-12 | 3 | Bruiser or weak Solo |
| 13-16 | 4 | Standard or Bruiser |
| 17-20 | 4 | Bruiser or Solo |
| 21+ | 4 | Solo with Relentless |

### Adversary Type Selection Guide

| D&D Traits | DH Type |
|------------|---------|
| Many weak enemies | Minion or Horde |
| Basic stats, no tricks | Standard |
| Stealth, cunning, ambush | Skulk |
| High damage, moderate defense | Bruiser |
| Ranged attacks, stays back | Ranged |
| Buffs allies, debuffs enemies | Support |
| Commands others, tactics | Leader |
| Huge HP, legendary actions | Solo |
| Intrigue, persuasion focused | Social |

### Feature Cost Guidelines

| Feature Power | Cost |
|---------------|------|
| Minor benefit, situational | None |
| Moderate benefit, frequent use | Mark Stress |
| Strong benefit, less frequent | Mark 2 Stress |
| Very powerful, scene-defining | Spend Fear |
| Devastating, once per fight | Spend 2+ Fear |

### Reaction Roll Difficulty by Tier

| Tier | Easy | Medium | Hard |
|------|------|--------|------|
| 1 | 10 | 12 | 14 |
| 2 | 12 | 15 | 18 |
| 3 | 15 | 18 | 21 |
| 4 | 18 | 21 | 24 |

---

## Success Criteria

A successful conversion will:

1. **Preserve the fantasy** - Feels like the original monster
2. **Fit the system** - Uses Daggerheart mechanics properly
3. **Be balanced** - Appropriate challenge for tier
4. **Be playable** - GM can run it without confusion
5. **Be memorable** - Creates interesting combat moments
6. **Maintain agency** - Doesn't rob players of choices
7. **Be streamlined** - No unnecessary complexity

**The ultimate test:** A GM should be able to pick up the converted stat block and run an exciting, thematic encounter without preparation or confusion.

---

## Appendices

### Appendix A: Daggerheart-Specific Terminology

**Terms the converter must understand:**
- **Spotlight**: Focus of action, who's currently acting
- **Mark**: To fill in a box/slot (HP, Stress, Armor)
- **Clear**: To unfill a box/slot
- **Hope**: Player resource (max 6)
- **Fear**: GM resource (max 12)
- **Stress**: Both PC and adversary resource
- **Difficulty**: Target number for PC rolls
- **Thresholds**: Major and Severe damage breakpoints
- **Range bands**: Melee, Very Close, Close, Far, Very Far
- **Reaction Roll**: Saving throw equivalent
- **Action Roll**: Attack or ability check
- **With Hope / With Fear**: Crit success / fail indicators
- **Vulnerable**: Take more damage
- **Hidden**: Can't be targeted
- **Restrained**: Can't move
- **Disoriented**: Custom condition (see Gibbering Mouther)

### Appendix B: Mike Underwood's Design Wisdom

**Key quotes from transcript to internalize:**

On simplification:
> "We're always looking to be the most efficient to try to streamline to not write more in a feature than we need to because we want GMs to be able to read it and reread features really quickly and easily."

On player agency with disorientation:
> "I want to make a an adversary that's about disorienting a player character and make it interesting to use in Daggerheart while trying to not rob the player of agency because for me that's kind of contra to the design principles of the game and I personally don't like it."

On choices over randomness:
> "By putting right, this puts the choice back in the player's hands, which I really like, but it also makes this process very much a one that is a dialogue."

On HP philosophy:
> "I think what they're going to do is they are going to have various things that debuff the player characters, make it harder for the PCs to eliminate them. But the thing I want to keep in mind is I want to make it harder, but I want to maintain agency and control over their characters."

On feature limits:
> "We have two passives, an action and a reaction. I will almost certainly revise this because it's a little bit um wonky, right? is a little bit involved, but I think it was a great suggestion and it's good to or I think it's good in these streams for me to take on adversaries that are a little bit trickier."

On testing:
> "That's probably something that I need to play test, right? Because this is exploring a space where the player and the GM are collaborating on what the character is doing in a way that is a little bit different than how things normally work in the game."

### Appendix C: Common Pitfalls to Avoid

❌ **Too many features** (>5)
✅ Limit to 3-5 features maximum

❌ **Copying D&D mechanics exactly** 
✅ Translate to Daggerheart philosophy

❌ **Removing player agency**
✅ Offer choices, even in debuffs

❌ **Overly complex feature wording**
✅ Streamline, use simple language

❌ **Forgetting asymmetrical design**
✅ Adversaries ≠ PCs, different rules

❌ **Too much cognitive load**
✅ Features should be quickly scannable

❌ **Mixing damage types within one attack**
✅ Physical OR Magic, not both

❌ **Not considering GM usability**
✅ Think about the GM running this at table

❌ **Ignoring narrative theme**
✅ Mechanics should reinforce fantasy

❌ **Unbalanced resource costs**
✅ Powerful = Fear cost, Moderate = Stress cost

---

## Conclusion

This converter should be a tool that respects both systems - honoring the rich tradition of D&D monster design while embracing the narrative-forward, player-agency-focused, streamlined philosophy of Daggerheart.

The goal is not just mechanical translation, but thoughtful adaptation that creates memorable, playable adversaries that GMs will be excited to use and players will be excited to face.

Remember Mike Underwood's closing wisdom: **"The important thing is not creating a strictly defined [thing] handed to [people] to inhabit, but rather giving them a jumping-off point, informed by their own life experience, that they can use to breathe life into [it]."**

---

**Document Version:** 1.0
**Created:** January 2026
**For use with:** Claude Code agent development
**Source Materials:** 
- Mike Underwood Daggerheart monster conversion stream transcript
- Daggerheart Homebrew Kit v1.0
- Daggerheart Adversaries & Environments v1.5
- D&D 5e SRD stat block examples
