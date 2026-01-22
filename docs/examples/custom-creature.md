# Converting from Natural Language

This example demonstrates converting a creature from an informal description without a complete stat block.

## Natural Language Input

```
"A swarm of thousands of tiny shadow spiders, about CR 3. They crawl
over everything, biting and injecting fear toxin. The swarm can split
apart and reform, making it hard to pin down. Weak to bright light."
```

## Daggerheart Output

```markdown
# SHADOW SPIDER SWARM
**Tier 2 Swarm**

An undulating mass of countless tiny spiders made of living shadow,
their countless eyes glinting with malevolent hunger. They flow over
surfaces like dark water, leaving terror in their wake.

**Motives & Tactics:** Overwhelm, infest, inject terror, retreat into darkness

**Difficulty:** Minor | **Thresholds:** 4/8/12 | **HP:** 4 | **Stress:** 3
**ATK:** +3 | **Swarm Bites:** Very Close | 2d6+2 phy

**Experience:** Shadows +3, Fear +2, Infiltration +2

**Movement:** Standard (Close), can climb

## FEATURES

**Swarm** - **Passive:** The swarm can occupy the same space as other
creatures. The swarm can move through spaces large enough for a Tiny
creature.

**Shadow Form** - **Passive:** The swarm is resistant to physical damage.
Takes full damage from area effects.

**Light Sensitivity** - **Passive:** The swarm has disadvantage on
attacks and is Vulnerable while in bright light.

**Fear Toxin** - **Action (1 Stress):** A creature the swarm damaged
this turn must make an Instinct Reaction Roll (difficulty 14) or
become Frightened.

**Split and Reform** - **Reaction (1 Stress):** When the swarm takes
damage, it can split into two smaller swarms in adjacent spaces, then
reform at the start of its next turn. While split, both halves share
the same HP total.
```

## How the Parser Processed This

### Extracted Information

| Element | Extracted Value | Source Text |
|---------|-----------------|-------------|
| Name | Shadow Spider Swarm | "swarm of...shadow spiders" |
| CR | 3 | "about CR 3" |
| Type | Beast (Swarm) | "swarm of...spiders" |
| Size | Medium (swarm) | Inferred from swarm |
| Attacks | Bite | "biting" |
| Special | Fear effect | "injecting fear toxin" |
| Special | Can split | "split apart and reform" |
| Weakness | Light | "Weak to bright light" |

### Estimated Statistics

The natural language parser fills in gaps based on CR:

| Stat | Estimation Method | Value |
|------|-------------------|-------|
| AC | CR 3 default | 13 |
| HP | CR 3 typical | 45 (estimated) |
| STR | Beast default | 10 |
| DEX | Spider trait | 14 |
| CON | Swarm typical | 10 |
| INT | Beast default | 2 |
| WIS | Predator typical | 12 |
| CHA | Beast default | 6 |

### Conversion Decisions

**CR 3 = Tier 2:**
Standard mapping applied.

**Swarm Detection:**
- "swarm" keyword detected
- Assigned **Swarm** adversary type
- Added Swarm passive feature

**Shadow Creature:**
- "shadow" keyword detected
- Added resistance to physical damage
- Added Shadow Form passive

**Fear Toxin:**
- "fear toxin" extracted as special ability
- Created Action feature with Stress cost
- Linked to bite attack trigger

**Split and Reform:**
- "split apart and reform" phrase parsed
- Created as Reaction feature
- Allows tactical repositioning

**Light Weakness:**
- "Weak to bright light" parsed
- Created Light Sensitivity passive
- Applied Vulnerable + disadvantage in bright light

### Confidence Score

The parser returned a confidence of **0.72** (72%) because:

- **+0.20** - CR detected and valid
- **+0.15** - Creature type identified (beast/swarm)
- **+0.15** - Size inferred
- **+0.10** - Attack type found
- **+0.08** - Special abilities mentioned
- **+0.04** - Weakness identified

High enough confidence to proceed without user confirmation.

## Comparison: NL vs Full Stat Block

### What's Different

| Aspect | Natural Language | Full Stat Block |
|--------|------------------|-----------------|
| Accuracy | Estimated stats | Exact conversion |
| Features | Interpreted from description | Directly converted |
| Balance | Based on CR templates | Based on actual abilities |
| Speed | Fastest option | Requires complete data |

### When to Use Natural Language

**Good for:**
- Quick concept testing
- Homebrew creatures without stats
- Adapting creatures from non-D&D sources
- "I want something like..." requests

**Not ideal for:**
- Official monster conversions
- Precise mechanical translation
- Complex creatures with many abilities
- Creatures where exact numbers matter

## Making It More Accurate

### Adding Detail

More specific language improves accuracy:

```
"A CR 3 swarm of tiny shadow spiders. AC 13, about 45 HP. They deal
about 3d6 piercing damage with their bites plus fear poison (DC 12
Wisdom save). Can squeeze through tiny gaps. Resistant to physical
damage but vulnerable to radiant and fire. 30 ft speed, 30 ft climb."
```

This would yield:
- Exact AC -> precise Evasion
- HP estimate -> accurate Daggerheart HP
- Damage dice -> correct damage conversion
- Save DC -> proper difficulty number
- Movement speeds -> accurate movement features

### Hybrid Approach

You can also parse natural language then manually adjust:

```typescript
import { parseNaturalLanguage, convertFromStatBlock } from './src';

// Parse the description
const parsed = parseNaturalLanguage(description);

// Review what was extracted
console.log(parsed.statBlock);
console.log("Confidence:", parsed.confidence);
console.log("Missing:", parsed.missing);

// Manually fix any issues
parsed.statBlock.armorClass.value = 13;  // You know the exact AC
parsed.statBlock.hitPoints.average = 45;

// Now convert with corrected data
const result = convertFromStatBlock(parsed.statBlock);
```

## GM Tips for NL Creatures

- **Review the output** - Parser makes reasonable guesses, but verify
- **Adjust HP for encounter** - NL estimation may need tuning
- **Check feature balance** - Interpreted features may need cost adjustment
- **Add missing flavor** - Parser creates generic descriptions
- **Consider the source** - What inspired this creature? Capture that feeling

## Example: Iterating on the Concept

**First attempt:**
```
"shadow spider swarm, CR 3"
```
Result: Basic swarm with minimal features.

**Adding detail:**
```
"shadow spider swarm, CR 3, injects fear poison, weak to light"
```
Result: Adds Fear Toxin and Light Sensitivity.

**Full description:**
```
"A swarm of thousands of tiny shadow spiders, about CR 3. They crawl
over everything, biting and injecting fear toxin. The swarm can split
apart and reform, making it hard to pin down. Weak to bright light."
```
Result: Complete stat block with all intended features.

The more you describe, the more accurate the conversion.
