# Allergen Taxonomy Research Commands for AI Agents

## Overview

This document contains ready-to-use research commands for AI agents to build comprehensive allergen taxonomies for the remaining 13 UK allergens (excluding gluten, which is already complete).

**Purpose:** Each command can be given to an AI agent to research and create a detailed taxonomy document following the same format as the gluten taxonomy.

**Reference Template:** All agents should use `03-gluten-allergen-taxonomy.md` as the gold standard for structure, detail level, and format.

---

## How to Use These Commands

1. **Launch an AI agent** (Task tool with general-purpose subagent)
2. **Copy-paste the command** for the allergen you want to research
3. **Agent will research** using UK FSA, NHS, and Allergy UK sources
4. **Agent delivers** a comprehensive markdown taxonomy document
5. **Review and refine** based on UK-specific needs
6. **Convert to TypeScript** and add to `allergen-taxonomies.ts`

---

## Status Tracking

**Completed:**
- ✅ Gluten (03-gluten-allergen-taxonomy.md exists)

**Basic implementation (needs specialist agent review):**
- ⚠️ Dairy/Milk (basic version exists, command below for comprehensive version)

**Pending research:**
- ❌ Peanuts
- ❌ Tree Nuts
- ❌ Eggs
- ❌ Fish
- ❌ Shellfish
- ❌ Molluscs
- ❌ Soy/Soya
- ❌ Sesame
- ❌ Celery
- ❌ Mustard
- ❌ Lupin
- ❌ Sulphites

---

# Agent Research Commands

---

## 1. DAIRY/MILK ALLERGY

```
Research and create a comprehensive dairy/milk allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research dairy/milk allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain dairy/milk or milk derivatives)
   - SAFE alternatives (dairy-free, plant-based alternatives)
   - TRICKY CASES (lactose-free vs dairy-free, ghee, etc.)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Primary dairy products (milk, cheese, butter, cream, yogurt)
- Milk proteins (whey, casein, lactose)
- Hidden sources (baked goods, processed meats, chocolate)
- Plant-based alternatives (coconut milk, oat milk, almond milk, etc.)
- UK brands (Alpro, Oatly, etc.)
- Confusing cases (lactose-free milk still contains milk proteins)

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Dairy/Milk
- Primary dairy products
- Cheese varieties
- Butter and cream products
- Yogurt and fermented products
- Milk proteins and derivatives
- Hidden sources in UK products

## ✅ SAFE - Does Not Contain Dairy/Milk
- Plant-based milk alternatives
- Dairy-free cheese/butter/yogurt
- Safe cooking oils and fats
- Vegan alternatives

## ⚠️ TRICKY CASES
- Lactose-free vs dairy-free (lactose-free still has milk proteins)
- Ghee/clarified butter (may contain trace milk proteins)
- Dark chocolate vs milk chocolate
- Cross-contamination warnings

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK milk allergy information
- NHS milk allergy resources
- UK dairy-free product labels

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive dairy/milk safe/unsafe lists that can be converted into a DAIRY_TAXONOMY for allergen-taxonomies.ts
```

---

## 2. PEANUTS ALLERGY

```
Research and create a comprehensive peanuts allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research peanuts allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain peanuts or peanut derivatives)
   - SAFE alternatives (peanut-free options)
   - TRICKY CASES (peanuts vs tree nuts distinction)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Peanut products (peanut butter, peanut oil, peanuts)
- Hidden sources (satay sauce, some curries, African cuisine)
- Peanut vs tree nuts (different allergen - important distinction)
- Cross-contamination warnings
- UK confectionery containing peanuts
- Peanut flour and derivatives

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Peanuts
- Peanut products
- Foods commonly containing peanuts
- Hidden sources (sauces, international cuisine)
- UK-specific products

## ✅ SAFE - Does Not Contain Peanuts
- Tree nut butters (if no tree nut allergy)
- Seed butters (sunflower, tahini)
- Safe alternatives
- Confusing items that DON'T have peanuts

## ⚠️ TRICKY CASES
- Peanuts are legumes, NOT tree nuts
- Refined peanut oil (may be safe but controversial)
- Cross-contamination in manufacturing
- "May contain peanuts" labeling

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK peanut allergy information
- Anaphylaxis UK resources
- NHS peanut allergy resources

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive peanuts safe/unsafe lists that can be converted into a PEANUTS_TAXONOMY for allergen-taxonomies.ts
```

---

## 3. TREE NUTS ALLERGY

```
Research and create a comprehensive tree nuts allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research tree nuts allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain tree nuts or derivatives)
   - SAFE alternatives (nut-free options)
   - TRICKY CASES (coconut, nutmeg, water chestnuts - NOT tree nuts)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- All tree nut types (almonds, walnuts, cashews, pecans, pistachios, hazelnuts, macadamia, brazil nuts)
- Nut butters and oils
- Hidden sources (pesto, marzipan, nougat, praline)
- Items that SOUND like nuts but aren't (coconut, nutmeg, butternut squash)
- Cross-contamination warnings
- UK bakery and confectionery products

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Tree Nuts
- All tree nut varieties
- Nut butters and spreads
- Baked goods and confectionery
- Hidden sources (marzipan, pesto, etc.)
- UK-specific products

## ✅ SAFE - Does Not Contain Tree Nuts
- Peanuts (different allergen category)
- Coconut (despite name, it's a fruit)
- Nutmeg (a spice, not a nut)
- Water chestnuts (a vegetable)
- Pine nuts (seeds, often safe but check)
- Seed alternatives (sunflower seeds, pumpkin seeds)

## ⚠️ TRICKY CASES
- Coconut is NOT a tree nut (it's a fruit)
- Nutmeg is NOT a tree nut (it's a spice)
- Water chestnuts are NOT nuts (they're vegetables)
- Pine nuts debate (seeds, but may cause reactions)
- Butternut squash is NOT a nut

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK tree nuts information
- Anaphylaxis UK resources
- NHS tree nut allergy resources

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive tree nuts safe/unsafe lists that can be converted into a TREE_NUTS_TAXONOMY for allergen-taxonomies.ts
```

---

## 4. EGGS ALLERGY

```
Research and create a comprehensive eggs allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research eggs allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain eggs or egg derivatives)
   - SAFE alternatives (egg-free substitutes)
   - TRICKY CASES (mayonnaise, meringue, pasta)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Egg products (whole eggs, egg whites, egg yolks)
- Egg derivatives (albumin, lecithin from eggs, lysozyme)
- Hidden sources (mayonnaise, pasta, baked goods, meringue)
- Egg-free alternatives (egg replacers, aquafaba, flax eggs)
- UK bakery and processed foods
- Vaccines and medications containing egg proteins

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Eggs
- Egg products (whole, whites, yolks)
- Egg derivatives (albumin, lysozyme)
- Baked goods and pasta
- Mayonnaise and condiments
- Hidden sources in UK products

## ✅ SAFE - Does Not Contain Eggs
- Egg replacers (commercial products)
- Aquafaba (chickpea water)
- Flax eggs, chia eggs
- Vegan mayonnaise
- Egg-free pasta varieties

## ⚠️ TRICKY CASES
- Lecithin (usually soy-based, but can be egg-based - check labels)
- Egg-washed bread (contains egg on crust)
- Some pasta contains eggs (fresh pasta often does)
- Flu vaccines (may contain egg proteins)

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK egg allergy information
- NHS egg allergy resources
- UK vegan product information

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive eggs safe/unsafe lists that can be converted into an EGGS_TAXONOMY for allergen-taxonomies.ts
```

---

## 5. FISH ALLERGY

```
Research and create a comprehensive fish allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research fish allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain fish or fish derivatives)
   - SAFE alternatives (fish-free protein sources)
   - TRICKY CASES (fish sauce, Worcestershire sauce, Caesar dressing)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- All fish varieties (cod, haddock, salmon, tuna, mackerel, etc.)
- Fish derivatives (fish sauce, fish oil, fish stock)
- Hidden sources (Worcestershire sauce, Caesar dressing, some Thai/Asian sauces)
- UK fish products (fish fingers, fish cakes)
- Omega-3 supplements (often fish-based)
- Fish vs shellfish (different allergen categories)

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Fish
- All fish varieties
- Fish derivatives (sauce, oil, stock)
- Fish-based products
- Hidden sources in sauces and condiments
- UK-specific fish products

## ✅ SAFE - Does Not Contain Fish
- Shellfish (different allergen - but may share cross-contamination)
- Plant-based omega-3 (algae-based)
- Fish-free sauces
- Meat and poultry alternatives

## ⚠️ TRICKY CASES
- Worcestershire sauce (contains anchovies in most brands)
- Caesar dressing (traditionally contains anchovies)
- Fish sauce in Thai/Vietnamese cuisine
- Omega-3 supplements (check if algae-based vs fish-based)
- Imitation crab (surimi - made from fish)

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK fish allergy information
- NHS fish allergy resources
- UK Asian food product labels

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive fish safe/unsafe lists that can be converted into a FISH_TAXONOMY for allergen-taxonomies.ts
```

---

## 6. SHELLFISH ALLERGY (Crustaceans)

```
Research and create a comprehensive shellfish/crustaceans allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research shellfish/crustaceans allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain crustaceans or derivatives)
   - SAFE alternatives (shellfish-free protein sources)
   - TRICKY CASES (shellfish vs molluscs, prawn crackers, fish sauce)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Crustacean types (prawns, shrimp, crab, lobster, crayfish, langoustine)
- Shellfish derivatives (prawn paste, shrimp paste, shellfish stock)
- Hidden sources (some Asian sauces, prawn crackers, seafood flavoring)
- UK shellfish products
- Shellfish vs molluscs (different but related)
- Glucosamine supplements (often shellfish-derived)

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Shellfish/Crustaceans
- All crustacean varieties
- Shellfish derivatives (paste, stock)
- Prawn crackers
- Hidden sources in Asian cuisine
- UK-specific shellfish products

## ✅ SAFE - Does Not Contain Shellfish
- Fish (different allergen)
- Molluscs (different allergen, but may cross-react)
- Plant-based seafood alternatives
- Meat and poultry

## ⚠️ TRICKY CASES
- Shellfish vs molluscs (separate allergens in UK law)
- Prawn crackers (contain shrimp despite name)
- Some fish sauces (may contain shrimp)
- Glucosamine supplements (often from shellfish)
- Shared equipment in fish markets

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK shellfish allergy information
- NHS shellfish allergy resources
- UK seafood product labels

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive shellfish safe/unsafe lists that can be converted into a SHELLFISH_TAXONOMY for allergen-taxonomies.ts
```

---

## 7. MOLLUSCS ALLERGY

```
Research and create a comprehensive molluscs allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research molluscs allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain molluscs or derivatives)
   - SAFE alternatives (mollusc-free protein sources)
   - TRICKY CASES (squid ink pasta, escargot, oyster sauce)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Mollusc types (squid, octopus, mussels, oysters, clams, scallops, snails/winkles)
- Mollusc derivatives (oyster sauce, squid ink)
- Hidden sources (some pasta, Asian sauces)
- UK mollusc products
- Molluscs vs shellfish (different categories)
- Cross-contamination in seafood

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Molluscs
- All mollusc varieties
- Mollusc derivatives (oyster sauce, squid ink)
- Escargot (snails)
- Hidden sources in cuisine
- UK-specific products

## ✅ SAFE - Does Not Contain Molluscs
- Fish (different allergen)
- Crustaceans (different allergen, but may cross-react)
- Plant-based alternatives
- Meat and poultry

## ⚠️ TRICKY CASES
- Squid ink pasta (contains molluscs)
- Oyster sauce (contains oysters)
- Escargot is molluscs (snails)
- Whelks, winkles, periwinkles (all molluscs)
- Cross-contamination at seafood counters

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK molluscs information
- NHS mollusc allergy resources
- UK seafood labeling

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive molluscs safe/unsafe lists that can be converted into a MOLLUSCS_TAXONOMY for allergen-taxonomies.ts
```

---

## 8. SOY/SOYA ALLERGY

```
Research and create a comprehensive soy/soya allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research soy/soya allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain soy or soy derivatives)
   - SAFE alternatives (soy-free options)
   - TRICKY CASES (soy lecithin, soy oil, edamame)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Soy products (soy sauce, tofu, tempeh, edamame, soy milk)
- Soy derivatives (soy lecithin, soy protein, soy flour)
- Hidden sources (many processed foods, vegetable oil blends)
- Soy vs soya spelling (UK uses "soya", US uses "soy")
- Asian cuisine heavy in soy
- Soy-free alternatives

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Soy/Soya
- Primary soy products
- Soy derivatives (lecithin, protein, flour)
- Asian cuisine staples (soy sauce, miso, tempeh)
- Hidden sources in UK processed foods
- Vegetable oil containing soy

## ✅ SAFE - Does Not Contain Soy
- Coconut aminos (soy sauce alternative)
- Chickpeas (used instead of edamame)
- Soy-free lecithin (sunflower lecithin)
- Other legumes (if no legume allergy)

## ⚠️ TRICKY CASES
- Soy lecithin (highly processed, may be tolerated by some)
- Soy oil (refined, may be tolerated by some)
- Edamame are soybeans
- "Vegetable oil" may contain soy (check labels)
- Tamari vs soy sauce (tamari can be wheat-free but still contains soy)

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK soya allergy information
- NHS soya allergy resources
- UK food product labels (soya vs soy spelling)

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive soy/soya safe/unsafe lists that can be converted into a SOY_TAXONOMY for allergen-taxonomies.ts
```

---

## 9. SESAME ALLERGY

```
Research and create a comprehensive sesame allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research sesame allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain sesame or sesame derivatives)
   - SAFE alternatives (sesame-free options)
   - TRICKY CASES (tahini, hummus, halva, bagels)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Sesame products (sesame seeds, sesame oil, tahini)
- Middle Eastern cuisine (hummus, halva, baba ganoush)
- Baked goods (sesame seed buns, bagels, breadsticks)
- Hidden sources (some bread, crackers, snacks)
- UK bakery products
- Sesame-free alternatives

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Sesame
- Sesame seeds and oil
- Tahini and tahini-based products
- Hummus (traditional contains tahini)
- Halva, halawa
- Baked goods with sesame
- UK-specific products

## ✅ SAFE - Does Not Contain Sesame
- Sesame-free bread and buns
- Tahini-free hummus
- Alternative seed toppings (poppy, chia, sunflower)
- Sunflower seed butter (tahini alternative)

## ⚠️ TRICKY CASES
- Tahini is sesame seed paste
- Most traditional hummus contains tahini
- Bagels often have sesame seeds
- Some bread has sesame on top (check)
- Goma (Japanese sesame) and gomashio (sesame salt)

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK sesame allergy information
- NHS sesame allergy resources
- UK bakery labeling

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive sesame safe/unsafe lists that can be converted into a SESAME_TAXONOMY for allergen-taxonomies.ts
```

---

## 10. CELERY ALLERGY

```
Research and create a comprehensive celery allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research celery allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain celery or celery derivatives)
   - SAFE alternatives (celery-free options)
   - TRICKY CASES (celeriac, celery salt, stocks and bouillon)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Celery products (celery stalks, celery leaves, celeriac/celery root)
- Celery derivatives (celery salt, celery seed, celery juice)
- Hidden sources (stocks, bouillon cubes, soups, some spice mixes)
- UK stock cubes and gravy products
- Celery-free alternatives
- Celeriac vs celery (both contain allergen)

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Celery
- Celery stalks and leaves
- Celeriac (celery root)
- Celery salt and celery seed
- Stock cubes and bouillon
- Soups and stews
- UK-specific products (OXO, Knorr, etc.)

## ✅ SAFE - Does Not Contain Celery
- Celery-free stock cubes
- Homemade stock without celery
- Alternative vegetables (carrots, parsnips)
- Celery-free spice blends

## ⚠️ TRICKY CASES
- Celeriac is NOT safe (it's celery root)
- Many stock cubes contain celery (check UK brands)
- Celery salt contains celery
- Some spice blends include celery seed
- Bouillon cubes often have celery

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK celery allergy information
- NHS celery allergy resources
- UK stock cube and bouillon labeling

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive celery safe/unsafe lists that can be converted into a CELERY_TAXONOMY for allergen-taxonomies.ts
```

---

## 11. MUSTARD ALLERGY

```
Research and create a comprehensive mustard allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research mustard allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain mustard or mustard derivatives)
   - SAFE alternatives (mustard-free condiments)
   - TRICKY CASES (curry powder, piccalilli, some sauces)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Mustard products (mustard condiment, mustard seeds, mustard powder)
- Mustard derivatives (mustard oil, mustard greens)
- Hidden sources (curry powder, some sauces, salad dressings, piccalilli)
- UK condiments and sauces
- Indian cuisine (mustard seeds common)
- Mustard-free alternatives

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Mustard
- Mustard condiment (yellow, Dijon, wholegrain)
- Mustard seeds and powder
- Curry powder (often contains mustard)
- Piccalilli
- Some sauces and dressings
- UK-specific products

## ✅ SAFE - Does Not Contain Mustard
- Mustard-free sauces
- Ketchup (check labels)
- Mayonnaise (usually safe, check labels)
- Alternative spices

## ⚠️ TRICKY CASES
- Curry powder often contains mustard seeds
- Piccalilli contains mustard
- Some salad dressings have mustard
- Mustard greens contain mustard allergen
- Indian cuisine uses mustard seeds extensively

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK mustard allergy information
- NHS mustard allergy resources
- UK condiment labeling

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive mustard safe/unsafe lists that can be converted into a MUSTARD_TAXONOMY for allergen-taxonomies.ts
```

---

## 12. LUPIN ALLERGY

```
Research and create a comprehensive lupin allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research lupin allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain lupin or lupin derivatives)
   - SAFE alternatives (lupin-free options)
   - TRICKY CASES (lupin flour in bread, cross-reactivity with peanuts)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Lupin products (lupin beans, lupin flour)
- Hidden sources (some bread, gluten-free products, pasta, pastries)
- Continental European foods (more common in France, Italy)
- Cross-reactivity with peanuts (lupin is a legume)
- UK gluten-free products (some use lupin flour)
- Lupin-free alternatives

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Lupin
- Lupin beans and seeds
- Lupin flour
- Some bread products (especially European)
- Some gluten-free products
- Some pasta
- UK and European products

## ✅ SAFE - Does Not Contain Lupin
- Most UK bread (less common than in EU)
- Other flours (wheat, rice, etc.)
- Other legumes (if no legume allergy)

## ⚠️ TRICKY CASES
- Lupin is a legume (related to peanuts)
- Cross-reactivity with peanut allergy (some people react to both)
- More common in European baked goods than UK
- Some gluten-free products use lupin flour
- May be labeled as "lupine" or "lupin"

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK lupin allergy information
- NHS lupin allergy resources
- European food labeling (lupin more common in EU)

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive lupin safe/unsafe lists that can be converted into a LUPIN_TAXONOMY for allergen-taxonomies.ts
```

---

## 13. SULPHITES ALLERGY

```
Research and create a comprehensive sulphites allergen taxonomy following the format used in "03-gluten-allergen-taxonomy.md".

TASK:
1. Research sulphites allergy using UK Food Standards Agency (FSA) guidance and Allergy UK resources
2. Create comprehensive lists of:
   - UNSAFE foods (contain sulphites or sulphur dioxide)
   - SAFE alternatives (sulphite-free options)
   - TRICKY CASES (wine, dried fruit, some medications)
3. Include UK-specific products and brands where relevant

KEY AREAS TO COVER:
- Sulphite sources (sulphur dioxide, sodium metabisulphite, etc.)
- Wine and alcoholic drinks (very common source)
- Dried fruits (often treated with sulphites)
- Processed foods (preservative E220-228)
- Medications (some contain sulphites)
- UK labeling requirements (must declare if >10mg/kg)
- Sulphite-free alternatives

OUTPUT FORMAT:
## ❌ UNSAFE - Contains Sulphites
- Wine and beer (most contain sulphites)
- Dried fruits (apricots, raisins, etc.)
- Fruit juices and cordials
- Processed meats
- Pickled foods
- E numbers E220-E228
- UK-specific products

## ✅ SAFE - Does Not Contain Sulphites
- Fresh fruits and vegetables
- Sulphite-free wine (rare but exists)
- Unsulphured dried fruits
- Fresh meats
- Most fresh foods

## ⚠️ TRICKY CASES
- Wine almost always contains sulphites (even "organic")
- "Contains sulphites" must be on label if >10mg/kg in UK
- Dried apricots are often bright orange due to sulphites
- Some asthma inhalers contain sulphites
- E220-E228 are all sulphites
- Sulphur dioxide vs sulphites (same allergen)

SOURCES TO USE:
- UK Food Standards Agency allergen guidance
- Allergy UK sulphites information
- NHS sulphites resources
- UK wine labeling
- UK E-number guidance

REFERENCE DOCUMENT:
Use "Markdown Docs/Prompt & Knowledge MD Docs to implement/03-gluten-allergen-taxonomy.md" as the template for structure and detail level.

DELIVERABLE:
A markdown document with comprehensive sulphites safe/unsafe lists that can be converted into a SULPHITES_TAXONOMY for allergen-taxonomies.ts
```

---

## Implementation Workflow

Once agent research is complete for each allergen:

1. **Review the agent's output** - Check for UK-specific accuracy
2. **Save as markdown** - Store in this directory with naming: `05-[allergen]-taxonomy.md`
3. **Convert to TypeScript** - Add to `allergen-taxonomies.ts`:

```typescript
export const [ALLERGEN]_TAXONOMY: AllergenTaxonomy = {
  unsafe: [
    // Items from agent's ❌ UNSAFE section
  ],
  safe: [
    // Items from agent's ✅ SAFE section
  ]
};
```

4. **Add to exports:**
```typescript
export const ALLERGEN_TAXONOMIES = {
  gluten: GLUTEN_TAXONOMY,
  milk: DAIRY_TAXONOMY,
  [allergen_id]: [ALLERGEN]_TAXONOMY, // ← Add here
};
```

5. **Test thoroughly** - Use the test cases from agent's tricky cases section

---

## Notes

- **Priority order:** Start with most common allergies (dairy, eggs, peanuts, tree nuts)
- **UK focus:** All agents should prioritize UK FSA guidance and UK products
- **Expandability:** Easy to add more allergens following the same pattern
- **Maintenance:** Update taxonomies as new products/edge cases are discovered

---

**Status:** Ready to launch agents for research
**Expected timeline:** 1-2 allergens per week
**Total estimated time:** 6-8 weeks for all 13 allergens
