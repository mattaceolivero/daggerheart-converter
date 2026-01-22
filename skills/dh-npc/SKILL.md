---
name: dh-npc
description: "Creates Daggerheart NPCs with streamlined stat blocks focused on roleplay. Use when the user wants to create a shopkeeper, innkeeper, noble, commoner, or any non-combat-focused character. Includes name, appearance, motivations, a secret, and a memorable quirk."
version: 1.0.0
---

# Daggerheart NPC Creator Skill

Creates memorable NPCs with minimal combat stats and rich roleplay hooks.

## Reference Document
@~/.claude/skills/daggerheart-docs/daggerheart-reference.md

## When to Use This Skill

Use `/dh-npc` when creating:
- Shopkeepers, innkeepers, tavern owners
- Nobles, politicians, guild leaders
- Commoners, farmers, travelers
- Quest givers, informants, contacts
- Any character focused on social interaction rather than combat

For combat-focused creatures, use `/dh-adversary` instead.

## Input Parameters

When creating an NPC, gather this information (ask if not provided):

1. **Role/Occupation** - What do they do?
2. **Setting/Location** - Where are they found?
3. **Tier** (optional) - For scaling difficulty (1-4)
4. **Tone** (optional) - Friendly, neutral, suspicious, hostile
5. **Any specific traits** the user wants

## NPC Statistics (Simplified)

NPCs use stripped-down stat blocks since they rarely engage in full combat.

### Difficulty by Tier

| Tier | Difficulty | Description |
|------|------------|-------------|
| 1 | 10-12 | Common folk, children, elderly |
| 2 | 13-15 | Trained individuals, guards, merchants |
| 3 | 16-18 | Experts, veterans, nobility |
| 4 | 19+ | Masters, legendary figures |

### HP by Resilience

| Type | HP | Examples |
|------|-----|----------|
| Frail | 2-3 | Children, elderly, scholars |
| Average | 4-6 | Most commoners, merchants |
| Hardy | 7-10 | Guards, laborers, soldiers |
| Tough | 11-15 | Veterans, bodyguards |

### Stress

| Type | Stress | Description |
|------|--------|-------------|
| Nervous | 1 | Easily flustered, inexperienced |
| Steady | 2-3 | Most NPCs |
| Composed | 4-5 | Leaders, veterans, nobles |

### Damage Thresholds (Major/Severe only)

| Tier | Major | Severe |
|------|-------|--------|
| 1 | 4 | 8 |
| 2 | 6 | 12 |
| 3 | 8 | 16 |
| 4 | 10 | 20 |

## Roleplay Elements

### Race Options
Use Daggerheart ancestries or setting-appropriate races:
- Human, Elf, Dwarf, Halfling
- Faun, Firbolg, Fungril
- Galapa, Goblin, Katari
- Ribbet, Simiah, Drakona
- Custom/setting-specific

### Naming Philosophy

**CRITICAL: Avoid standard fantasy names.** No "Thorin Ironforge" dwarves or "Elderleaf Moonshadow" elves.

Create names that are:
- **Unexpected** - Names that make players pause and remember
- **Evocative** - Sound interesting when spoken aloud
- **Non-obvious** - Avoid race-based naming tropes

**Naming Techniques:**

1. **Mundane objects as names**: Brick, Solder, Cupboard, Needle, Thimble, Ratchet
2. **Verbs as names**: Tumble, Clinch, Swerve, Rummage, Dawdle, Lurch
3. **Sounds/textures**: Crinkle, Velvet, Gravel, Hum, Whisper, Crackle
4. **Food/drink inspired**: Barley, Juniper, Cardamom, Brine, Marrow, Tallow
5. **Weather/time**: Dusk, Squall, Frost-not-Frosty, Gloam, Drizzle, Haze
6. **Compound oddities**: Saltpan, Ironweed, Dusthollow, Kettleblack, Waxworth
7. **Near-words**: Slightly off real words - Vennick, Thrask, Quillem, Brindel, Scarn
8. **Cultural mashups**: Mix unexpected linguistic roots - Yoruvo, Kethani, Zubric

**Examples of GOOD names:**
- Kettleworth Scarn
- Vex Tumbledown
- Brindel Saltpan
- Quillem Gravel
- Thrask Cupboard
- Solder Waxworth
- Yoruvo Clinch
- Needle Gloam
- Hum Kettleblack
- Rummage Thorne

**Examples of BAD names (too standard):**
- Thorin Stonehammer (dwarf cliché)
- Elderan Moonshadow (elf cliché)
- Bilbo Greenleaf (halfling cliché)
- Grimjaw Bloodaxe (orc cliché)
- Lady Seraphina Goldweave (noble cliché)

**The Test:** If a name could appear in a generic fantasy name generator, don't use it.

### Age Categories
| Category | Human Equivalent | Notes |
|----------|------------------|-------|
| Child | 5-12 | Naive, curious, energetic |
| Young | 13-25 | Ambitious, idealistic |
| Adult | 26-50 | Established, experienced |
| Middle-aged | 51-70 | Wise, settled, sometimes bitter |
| Elderly | 71+ | Weathered, full of stories |

### Motivation Types
Every NPC should have 2-3 motivations:

**Survival Motivations:**
- Protect family/loved ones
- Earn enough to survive
- Stay safe from [threat]
- Find shelter/stability

**Ambition Motivations:**
- Gain wealth/status
- Learn a skill/secret
- Rise in social standing
- Build something lasting

**Connection Motivations:**
- Find love/companionship
- Reconnect with someone
- Prove themselves to others
- Belong to a community

**Principle Motivations:**
- Uphold justice/honor
- Preserve tradition
- Spread their faith
- Right a past wrong

### Secret Types

Secrets should be specific and actionable - something that could become a plot hook.

**Mundane Secrets (low stakes):**
- Has a crush on someone inappropriate
- Cheats at cards/games
- Is actually terrible at their job
- Has an embarrassing hobby
- Pretends to be more successful than they are
- Owes money to someone in town

**Personal Secrets (medium stakes):**
- Has a child no one knows about
- Is in a secret relationship
- Witnessed a crime but said nothing
- Has a hidden addiction
- Is planning to leave/betray their employer
- Knows the location of something valuable

**Dangerous Secrets (high stakes):**
- Is a spy/informant for [faction]
- Committed a serious crime (murder, theft)
- Knows a powerful person's dark secret
- Is hiding their true identity
- Is being blackmailed
- Owes a dangerous debt to criminals/supernatural

### Quirk Categories

Every NPC needs ONE memorable quirk:

**Speech Patterns:**
- Always speaks in questions
- Uses overly formal language
- Peppers speech with a foreign language
- Speaks incredibly slowly/quickly
- Always whispers or always shouts
- Uses bizarre metaphors
- Refers to self in third person
- Constantly uses a particular phrase

**Physical Mannerisms:**
- Constantly fidgets with something
- Never makes eye contact / intense eye contact
- Dramatic hand gestures
- Nervous laugh after every sentence
- Always eating or drinking something
- Touches people when talking
- Paces constantly
- Has a distinctive walk/limp

**Behavioral Quirks:**
- Pathologically honest/lies constantly
- Overly suspicious of everyone
- Treats everyone like old friends
- Obsessed with cleanliness/order
- Collects something unusual
- Superstitious about specific things
- Always bargaining/negotiating
- Gives unsolicited advice

**Outlook Quirks:**
- Relentlessly optimistic despite everything
- Convinced the world is ending soon
- Believes in conspiracy theories
- Thinks they're destined for greatness
- Fatalistic about everything
- Overly nostalgic for "the old days"
- Deeply religious in unusual ways
- Philosophical about mundane things

## Output Format

```markdown
# [NAME]

*[Race] [Age Category], [Occupation]*

> [1-2 sentence physical description focusing on immediately noticeable features]

---

## At a Glance

| Stat | Value |
|------|-------|
| **Difficulty** | [X] |
| **HP** | [X] |
| **Stress** | [X] |
| **Thresholds** | [Major]/[Severe] |

---

## Motivations

- [Primary motivation - what drives them daily]
- [Secondary motivation - deeper desire]
- [Optional third motivation]

---

## The Secret

*[Secret type: Mundane/Personal/Dangerous]*

[Description of what they're hiding and why it matters]

**If discovered:** [How they react, what consequences might follow]

---

## The Quirk

**[Quirk name]**: [Description of the quirk and how it manifests]

*In play:* [Suggestion for how to portray this at the table]

---

## Roleplaying Notes

**Voice/Demeanor:** [Brief acting notes]

**Attitude toward strangers:** [How they initially treat the PCs]

**What they want from PCs:** [If anything]

---

*Tags: [npc, occupation, location, tone]*
```

## Example

**User:** "Create a blacksmith NPC for a Tier 2 town"

**Output:**

```markdown
# SOLDER KETTLEBLACK

*Dwarf Adult, Blacksmith*

> A stocky dwarf woman with soot-stained arms, a singed beard she refuses to trim, and a prominent burn scar across her left cheek that she wears with pride.

---

## At a Glance

| Stat | Value |
|------|-------|
| **Difficulty** | 14 |
| **HP** | 8 |
| **Stress** | 3 |
| **Thresholds** | 6/12 |

---

## Motivations

- **Keep the forge burning** - Her family has run this smithy for six generations
- **Find a worthy apprentice** - She has no children and fears the craft dying with her
- **Outdo her rival** - A human smith in the next town claims to be better

---

## The Secret

*Personal*

Solder is slowly going blind. The years of staring into the forge have damaged her eyes, and she can barely see fine details anymore. She's been hiding it by memorizing her workspace and relying on touch.

**If discovered:** She'll beg the PCs not to tell anyone - it would ruin her reputation and her livelihood. She might offer free repairs or a discount in exchange for silence.

---

## The Quirk

**The Forge Test**: Solder judges everyone by their hands. She'll grab a person's hands without asking and examine them, declaring whether they're "workers" or "soft folk." She trusts workers implicitly and treats soft folk with barely concealed disdain.

*In play:* When PCs first meet her, have her grab their hands and make a judgment. Warriors and laborers get respect; nobles and scholars get dismissive grunts.

---

## Roleplaying Notes

**Voice/Demeanor:** Gruff, direct, no-nonsense. Speaks in short sentences. Grunts more than talks.

**Attitude toward strangers:** Suspicious until they prove they're useful or hardworking.

**What they want from PCs:** Good steel if they're traders. News of other smiths if they're travelers. A strong back for a day's work if they look capable.

---

*Tags: npc, blacksmith, dwarf, tier-2, craftsperson*
```

## Quick Generation Tips

1. **Start with the quirk** - It makes the NPC memorable instantly
2. **Make secrets actionable** - They should be potential plot hooks
3. **Motivations create conflict** - At least one should oppose the PCs or create tension
4. **Physical descriptions** - Focus on 2-3 details, not a full portrait
5. **Keep stats minimal** - Only needed if combat becomes possible
6. **Connect to the world** - Reference places, factions, or events in the setting
