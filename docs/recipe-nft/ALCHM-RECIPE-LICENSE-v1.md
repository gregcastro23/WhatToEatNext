# Alchm Recipe License — v1.0

**Canonical license manifest for recipe NFTs minted by the Alchm Recipe Protocol.**
This document is the content-addressed manifest referenced on-chain by `licenseURI`;
its keccak256 hash is the `licenseHash` recorded in `AlchmRightsRegistry` and enforced
on every `RecipeRegistry.mintRecipe`.

- License: Alchm Recipe License
- Version: 1.0
- Underlying work: Alchm Planetary-Food Algorithm — U.S. Copyright Reg. No. **VA 2-434-962**
- Royalty: **5%** (ERC-2981) to the recipe creator on secondary sales.

## 1. What the NFT is

Each token represents one immutable, versioned recipe record: its content hash, its
deterministic alchemical computation commitment (ESMS totals, elemental shares, and the
thermodynamic physics — Kalchm, Monica, Heat, Entropy, Reactivity, Greg's Energy), its
ingredient-catalog root, authorship, and lineage. Heavy recipe and display data live
off-chain; the token anchors their hashes and locators.

## 2. What owning a token grants

The token holder receives:

- **Provenance & attribution** — verifiable, timestamped proof of the recipe record and
  its alchemical fingerprint, attributed to the recorded `creator`.
- **A personal, worldwide, non-exclusive license** to cook the recipe and to display,
  share, and discuss it, with attribution to alchm.kitchen and the creator.
- **Resale rights** in the token itself, subject to the 5% creator royalty.

## 3. What it does not grant

- It does **not** transfer the copyright in the underlying Alchm Planetary-Food Algorithm
  (VA 2-434-962) or any Alchm software, models, or trademarks. Those are retained by the
  rights holder recorded in `AlchmRightsRegistry`.
- It does **not** grant commercial rights to mass-reproduce, sell, or franchise the recipe
  as a packaged product without a separate written agreement.
- Transferring the token does not change the recorded `creator` or transfer the referenced
  copyright; it conveys only the rights in this manifest.

## 4. Determinism & immutability

The on-chain `contentHash` and `computationHash` are computed by the published alchemical
engine (`engineVersion`) over the recipe content and its quantity-weighted ESMS
aggregation (`aggregationMode`). A change to engine, aggregation mode, or recipe content
produces a different hash and therefore a different token; minted records are never mutated.

## 5. No warranty

Recipe and alchemical content are provided "as is," for culinary and entertainment
purposes. The alchemical/astrological computations are an expressive system, not
nutritional, medical, or dietary advice.

---

_This manifest is versioned. Superseding versions mint under a new `licenseHash`/`licenseURI`;
previously minted tokens retain the license version recorded at their mint._
