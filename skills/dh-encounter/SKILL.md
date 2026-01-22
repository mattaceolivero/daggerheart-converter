---
name: dh-encounter
description: "Generates random encounters for Daggerheart. Use when the user needs a road encounter, dungeon room, wilderness event, or urban incident. Creates the situation, adversaries, environment, complications, and potential outcomes. Scales by tier and context."
version: 1.0.0
---

# Daggerheart Random Encounter Generator

Creates dynamic, interesting encounters with built-in complications and multiple resolution paths.

## Reference Document
@~/.claude/skills/daggerheart-docs/daggerheart-reference.md

## When to Use This Skill

Use `/dh-encounter` when creating:
- Random road/travel encounters
- Dungeon room contents
- Wilderness events
- Urban incidents
- Ambushes and surprises
- Social confrontations
- Environmental challenges

## Input Parameters

When generating encounters, gather:

1. **Tier** (1-4) - Scales difficulty and stakes
2. **Context/Location**:
   - Road/Travel
   - Wilderness (forest, mountain, swamp, desert, etc.)
   - Dungeon/Ruin
   - Urban (city, town, village)
   - Unusual (planar, underwater, aerial)
3. **Encounter Type** (optional):
   - Combat
   - Social
   - Exploration
   - Puzzle/Trap
   - Mixed
4. **Tone** (optional):
   - Dangerous, Mysterious, Humorous, Tragic, Tense

## Core Encounter Philosophy

**Every encounter needs:**
1. **A situation** - What's happening when the PCs arrive?
2. **Stakeholders** - Who wants what?
3. **Tension** - Why can't this resolve itself?
4. **Multiple paths** - At least 2-3 ways to handle it
5. **Consequences** - What happens based on choices?

**Avoid:**
- "You see 4 goblins. Roll initiative."
- Encounters with only one solution
- Random fights with no context
- Situations where murder is obviously optimal

## Encounter Types

### Combat Encounters

Not just "enemies attack" - add context:

**Combat Contexts:**
| Context | Example |
|---------|---------|
| Ambush | PCs are surprised, enemies have advantage |
| Interrupted | Enemies are doing something when PCs arrive |
| Territorial | Enemies defend a location, may parley |
| Desperate | Enemies fight for survival, may surrender |
| Hunting | Enemies are tracking the PCs specifically |
| Caught in crossfire | Two groups fighting, PCs stumble in |
| Protecting something | Enemies guard treasure, person, or location |
| Fleeing something worse | Enemies running FROM something |

**Combat Complications:**
- Hazardous terrain (use /dh-environment elements)
- Hostages or innocents present
- Time pressure (ritual completing, building collapsing)
- Third party arrives mid-fight
- Environmental changes (weather, fire spreading)
- Enemies have unexpected allies
- Key enemy tries to escape with something important

### Social Encounters

Conflict without (immediate) violence:

**Social Situations:**
| Situation | Tension |
|-----------|---------|
| Negotiation | Both sides want something the other has |
| Deception | Someone is lying, stakes if discovered |
| Persuasion | NPC needs convincing, has valid objections |
| Intimidation | Show of force, but violence has costs |
| Mediation | PCs caught between two parties |
| Performance | PCs must impress, entertain, or prove worth |
| Investigation | Question witnesses, find the truth |
| Infiltration | Social stealth, maintain cover |

**Social Complications:**
- NPC has leverage over a PC
- Cultural misunderstanding possible
- Hidden audience watching
- Time limit on negotiation
- NPC's stated goal isn't their real goal
- Third party benefits from failure
- Success creates a new enemy

### Exploration Encounters

Discovery and environment-focused:

**Exploration Situations:**
| Situation | Challenge |
|-----------|-----------|
| Obstacle | Path blocked, must find way around/through |
| Mystery | Strange phenomenon, investigate to understand |
| Discovery | Find something valuable/important/dangerous |
| Navigation | Lost, must find the way |
| Survival | Environment itself is the threat |
| Choice | Multiple paths, each with unknowns |

**Exploration Complications:**
- Discovery triggers a trap or guardian
- Resource depletion (light, food, rope)
- Weather/environment changes
- What they find isn't what it seems
- Someone else is looking for the same thing
- The way back is now blocked

### Puzzle/Trap Encounters

Mental challenges and hazards:

**Puzzle Types:**
| Type | Example |
|------|---------|
| Mechanical | Levers, pressure plates, moving parts |
| Logical | Riddles, sequences, patterns |
| Magical | Runes, wards, enchantments |
| Social | Passwords, protocols, rituals |
| Environmental | Use the space itself to proceed |

**Trap Types:**
| Type | Effect |
|------|--------|
| Damage | Direct harm (pits, blades, fire) |
| Containment | Locks PCs in, splits party |
| Alert | Summons enemies, triggers alarm |
| Transformation | Curses, polymorph, teleportation |
| Depletion | Drains resources, magic, health over time |

## Encounter Tables by Context

### Road/Travel Encounters

| d10 | Encounter Type |
|-----|----------------|
| 1-2 | Other travelers (merchants, pilgrims, refugees) |
| 3-4 | Creatures (beasts, monsters, territorial) |
| 5 | Bandits/Highwaymen (may negotiate) |
| 6 | Broken-down cart/injured traveler (real or trap?) |
| 7 | Patrol/Authority (checkpoint, search) |
| 8 | Weather/Environmental hazard |
| 9 | Discovery (ruins, corpse, hidden cache) |
| 10 | Unusual (fey, planar, unique) |

### Wilderness Encounters

| d10 | Encounter Type |
|-----|----------------|
| 1-2 | Predator (hunting, territorial, desperate) |
| 3 | Prey animals (stampede, trapped, sacred) |
| 4 | Natural hazard (cliff, river, storm) |
| 5 | Lair entrance (something lives here) |
| 6 | Other explorers (rivals, lost, friendly) |
| 7 | Ancient site (ruins, monument, battlefield) |
| 8 | Supernatural phenomenon (haunting, magic, curse) |
| 9 | Resource opportunity (herbs, water, shelter) |
| 10 | Something tracking THEM |

### Dungeon Encounters

| d10 | Encounter Type |
|-----|----------------|
| 1-2 | Guardian (stationary, patrols, triggered) |
| 3-4 | Trap (mechanical, magical, environmental) |
| 5 | Inhabitant (lives here, not hostile by default) |
| 6 | Previous explorers (dead, undead, trapped, rival) |
| 7 | Puzzle/Lock (blocks progress, hides treasure) |
| 8 | Environmental hazard (collapse, flood, gas) |
| 9 | Treasure cache (guarded? trapped? cursed?) |
| 10 | Something that shouldn't be here |

### Urban Encounters

| d10 | Encounter Type |
|-----|----------------|
| 1-2 | Crime in progress (theft, assault, scam) |
| 3 | Authority (guards, officials, inspectors) |
| 4 | Festival/Event (celebration, protest, funeral) |
| 5 | Merchant opportunity (rare goods, good deal, scam) |
| 6 | Old acquaintance (friend, enemy, debt) |
| 7 | Information opportunity (rumors, secrets, jobs) |
| 8 | Chase scene (someone fleeing, through crowds) |
| 9 | Unusual sight (magic, creature, phenomenon) |
| 10 | Wrong place, wrong time (witnessed something) |

## Scaling by Tier

### Tier 1 Encounters
- **Stakes:** Personal, local, immediate
- **Enemies:** Common threats, small groups
- **Complications:** Straightforward with one twist
- **Rewards:** Useful gear, local reputation, small coin

### Tier 2 Encounters
- **Stakes:** Community, regional, developing
- **Enemies:** Organized threats, leaders present
- **Complications:** Multiple factions, hidden agendas
- **Rewards:** Quality gear, faction standing, significant coin

### Tier 3 Encounters
- **Stakes:** Kingdom, major factions, long-term
- **Enemies:** Powerful individuals, elite groups
- **Complications:** Political implications, moral ambiguity
- **Rewards:** Exceptional gear, major influence, substantial wealth

### Tier 4 Encounters
- **Stakes:** World, planar, legendary
- **Enemies:** Legendary creatures, ancient powers
- **Complications:** Reality-altering, no good options
- **Rewards:** Legendary items, world-shaping influence, vast wealth

## The Twist Table

Every encounter should have at least one twist. Roll or choose:

| d12 | Twist |
|-----|-------|
| 1 | It's a trap/ambush |
| 2 | Someone is lying about their intentions |
| 3 | There's a third party watching/waiting |
| 4 | The "enemy" has a sympathetic motivation |
| 5 | The "victim" is actually the villain |
| 6 | Time pressure suddenly appears |
| 7 | An ally becomes a liability |
| 8 | The environment changes dramatically |
| 9 | What they want isn't what it seems |
| 10 | Victory creates a new problem |
| 11 | Someone the PCs know is involved |
| 12 | This connects to something bigger |

## Output Format

```markdown
# [ENCOUNTER NAME]

*[Tier X] [Type] Encounter — [Location/Context]*

---

## The Situation

[2-3 sentences describing what the PCs encounter. What do they see, hear, smell? What's happening RIGHT NOW?]

## The Stakes

**What's at risk:** [What could be lost or gained]
**Who cares:** [Who has skin in this game]
**Time pressure:** [Is there urgency? How long do they have?]

---

## Key Players

### [NPC/Creature/Group 1]
- **Want:** [What they're trying to achieve]
- **Fear:** [What they're trying to avoid]
- **Will:** [What they'll do if PCs don't intervene]

### [NPC/Creature/Group 2] (if applicable)
- **Want:** [Goal]
- **Fear:** [Concern]
- **Will:** [Default action]

---

## The Environment

[Brief description of the space - reference /dh-environment for full details if needed]

**Key Features:**
- [Tactical/useful element]
- [Hazard or obstacle]
- [Interactive element]

---

## The Twist

[The complication that makes this interesting]

---

## Resolution Paths

### Combat
[How this plays out if they fight]
- **Enemies:** [Quick stat reference or type]
- **Tactics:** [How enemies behave]
- **Victory condition:** [What ends the fight]

### Negotiation
[How this plays out if they talk]
- **Leverage:** [What do PCs have to offer?]
- **Objections:** [Why NPCs might refuse]
- **Deal possible:** [What agreement could be reached]

### Stealth/Avoidance
[How this plays out if they sneak or bypass]
- **Difficulty:** [What rolls needed]
- **Consequence of failure:** [What happens if caught]
- **What they miss:** [Trade-off for avoiding]

### Creative Solution
[Leave room for player creativity]
- **Hints:** [Environmental clues that suggest options]

---

## Aftermath

**If PCs succeed:** [Immediate and future consequences]

**If PCs fail:** [What goes wrong, is it recoverable?]

**If PCs avoid:** [What happens without their intervention]

---

## Loot/Rewards

[Quick loot summary - reference /dh-loot for full generation]

---

## Connections

**This could lead to:** [Future adventure hooks]
**This connects to:** [Larger plots if applicable]

---

*Tags: [encounter type, location, tier, themes]*
```

## Example

**User:** "Generate a Tier 2 road encounter for a forest highway"

```markdown
# THE MERCHANT'S DILEMMA

*Tier 2 Mixed Encounter — Forest Road*

---

## The Situation

The PCs round a bend to find a merchant's wagon stopped in the middle of the road. A well-dressed halfling stands between her wagon and three armed humans in mismatched armor. She's holding a strongbox. Everyone looks tense. No weapons drawn—yet.

## The Stakes

**What's at risk:** The merchant's life and livelihood; the bandits' freedom (or lives)
**Who cares:** The merchant, the bandits, whoever the strongbox contents belong to
**Time pressure:** A fourth bandit is circling through the trees to flank. PCs have about 2 minutes before positioning gets worse.

---

## Key Players

### Kettleworth Vance, Merchant
- **Want:** To survive with her cargo intact
- **Fear:** The bandits will discover what's REALLY in the strongbox
- **Will:** Stall, negotiate, eventually hand over decoy gold

### The Greenway Boys (3 visible, 1 hidden)
- **Want:** The strongbox—they were TOLD it would be here
- **Fear:** Getting caught, recognized, killed
- **Will:** Take the box and run. They're not killers unless cornered.

---

## The Environment

A narrow forest road, dappled sunlight, wagon blocking most of the path.

**Key Features:**
- **Dense treeline:** Difficult terrain, provides cover
- **The wagon:** Heavy cover, can be climbed for height advantage
- **Spooked horses:** Might bolt if combat erupts, dragging wagon
- **Muddy ditch:** Concealment but slows movement

---

## The Twist

Kettleworth isn't an innocent victim. The strongbox contains stolen documents proving a local lord's corruption—she's a spy for a rival faction. The bandits were hired by that lord to intercept her. Neither side is "good."

---

## Resolution Paths

### Combat
- **Enemies:** 3 Tier 2 Standard bandits (visible), 1 Tier 2 Skulk (hidden in trees)
- **Tactics:** Flanker attacks round 2. Others try to grab box and flee if outmatched.
- **Victory condition:** Bandits flee at 50% casualties or if leader drops

### Negotiation
- **Leverage:** PCs could offer escort, pay off bandits, or threaten credibly
- **Objections:** Bandits were paid in advance; they fear employer more than PCs
- **Deal possible:** Bandits might take a bribe AND the decoy gold, leave the real box

### Stealth/Avoidance
- **Difficulty:** Moderate (the hidden bandit might spot them)
- **Consequence of failure:** Bandits think PCs are reinforcements, attack
- **What they miss:** The documents, the reward, the connection to the lord

### Creative Solution
- **Hints:** The horses are nervous (could be stampeded). The wagon has oil flasks. Kettleworth keeps glancing at the treeline (she knows about the flanker).

---

## Aftermath

**If PCs save Kettleworth:** She's grateful but cagey. Offers 50 gold, refuses to open the strongbox. If pressed, admits she's "delivering something important." PCs could follow this thread.

**If bandits get the box:** Lord Vareth's corruption stays hidden. Kettleworth disappears. A week later, a faction contact approaches the PCs about "unfinished business."

**If PCs expose everyone:** Both factions now know about the PCs. One grateful, one hostile. The documents could be leverage... or a death sentence.

---

## Loot/Rewards

- **From bandits:** 23 gold, shortswords, leather armor, a note with instructions (leads to their employer)
- **From Kettleworth (if helped):** 50 gold, or 100 if PCs don't ask about the strongbox
- **The documents (if obtained):** Priceless to the right buyer, worthless to the wrong one, dangerous to hold

---

## Connections

**This could lead to:** Investigation into Lord Vareth, employment by either faction, the bandits' employer seeking revenge
**This connects to:** Local political intrigue, spy networks, noble corruption

---

*Tags: encounter, road, tier-2, bandits, moral-ambiguity, faction-conflict*
```

## Quick Generation Tips

1. **Start with the twist** - Build the encounter around what makes it interesting
2. **Everyone wants something** - No NPCs exist just to fight
3. **Environment matters** - Use the space, don't just fight in a white room
4. **Multiple solutions** - If there's only one answer, it's not an encounter, it's a railroad
5. **Consequences cascade** - Choices here should echo later
6. **Combat is a failure state** - Sometimes. Make peace viable when it should be.
7. **Let them run** - Not every encounter needs resolution. Fleeing is valid.
8. **Connect the dots** - Random encounters are better when they connect to the larger story
