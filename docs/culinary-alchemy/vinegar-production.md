# Alchemical Representation of Vinegar Production

This document outlines how the process of making and using vinegar is represented within the WhatToEatNext project's alchemical and culinary framework.

## The Two-Stage Process of Vinegar Creation

Vinegar production is a "double fermentation" process, which we model using our existing `fermentation` cooking method and its connection to alchemical pillars.

### Stage 1: Alcoholic Fermentation (Sugar → Alcohol)

-   **Process**: Yeast converts sugars from a base ingredient (like fruit or grain) into ethanol. This is an anaerobic process (without oxygen).
-   **Alchemical Interpretation**: This initial transformation aligns with the **Pillar of Transformation**. It represents the breakdown of a raw `Matter` (sugar-rich ingredient) and the creation of a more volatile `Essence` (alcohol). The `fermentation` cooking method, with its high `entropy` (0.70) and `reactivity` (0.65), accurately models this biological chaos and change.
    -   **Elemental Effect**: The process is primarily influenced by **Water** (the liquid medium) and **Earth** (the raw ingredients).

### Stage 2: Acetic Fermentation (Alcohol → Acetic Acid)

-   **Process**: *Acetobacter*, an aerobic bacteria, oxidizes the ethanol, converting it into acetic acid. This is where the "mother of vinegar," a key culture, is often used.
-   **Alchemical Interpretation**: This second stage is a refinement and concentration. It's a move from volatile `Essence` (alcohol) towards a sharp, clarifying `Spirit` (acetic acid). This is still governed by the `fermentation` method, but the focus shifts. The introduction of oxygen (`Air`) is critical.
    -   **Elemental Effect**: This stage introduces a strong **Air** component, which works with the existing **Water** and **Fire** (the metabolic energy of the bacteria) to create the final product.

## Distillation and Pickling as Alchemical Processes

### Distilling

-   **Process**: Distillation in our system doesn't create vinegar directly, but rather produces a pure distilled alcohol that is then fermented. It can also be used to concentrate acetic acid.
-   **Our Method (`distilling`)**: The `distilling` cooking method is defined in `src/data/cooking/methods/transformation/distilling.ts`.
-   **Alchemical Interpretation**: This method is heavily aligned with the **Pillar of Purity** (a conceptual pillar). It uses high **Fire** and **Air** to separate the `Spirit` of a substance from its `Matter`. When applied to fermented liquids, it extracts the most volatile and pure essence, be it alcohol or concentrated acid.

### Pickling

-   **Process**: Using the high acidity of vinegar to preserve and flavor food.
-   **Our Method (`pickling`)**: The `pickling` cooking method is defined in `src/data/cooking/methods/traditional/pickling.ts`. It correctly identifies two paths: preservation in a vinegar solution (quick pickling) and preservation through a salt brine (fermented pickling).
-   **Alchemical Interpretation**: Pickling is aligned with the **Pillar of Preservation**.
    -   **Quick Pickling**: This directly imparts the acidic `Spirit` of the vinegar into an ingredient, transforming its texture and flavor while preserving its `Matter`. It's a direct application of one substance's properties to another.
    -   **Fermented Pickling**: This relies on the `fermentation` process, where the transformative power comes from microbes rather than a pre-made acid.

## Connecting Vinegars to Cooking Methods

In `src/data/ingredients/vinegars/consolidated_vinegars.ts`, each vinegar has a `cookingMethods` property. This array directly links the ingredient to the methods it's best suited for, such as `pickling`, `marinades`, and `dressings`. This allows our recommendation engine to suggest, for example, that a user who wants to pickle something could use Apple Cider Vinegar. 