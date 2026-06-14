---
name: Molecular Alchemy
colors:
  surface: '#11131e'
  surface-dim: '#11131e'
  surface-bright: '#373845'
  surface-container-lowest: '#0c0d18'
  surface-container-low: '#191b26'
  surface-container: '#1d1f2a'
  surface-container-high: '#282935'
  surface-container-highest: '#333440'
  on-surface: '#e2e1f1'
  on-surface-variant: '#b9cacb'
  inverse-surface: '#e2e1f1'
  inverse-on-surface: '#2e303c'
  outline: '#849495'
  outline-variant: '#3a494b'
  surface-tint: '#00dbe7'
  primary: '#e1fdff'
  on-primary: '#00363a'
  primary-container: '#00f2ff'
  on-primary-container: '#006a71'
  inverse-primary: '#00696f'
  secondary: '#ffb59e'
  on-secondary: '#5e1700'
  secondary-container: '#ff571a'
  on-secondary-container: '#521300'
  tertiary: '#e2ffe4'
  on-tertiary: '#003919'
  tertiary-container: '#00fb86'
  on-tertiary-container: '#006f37'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#74f5ff'
  primary-fixed-dim: '#00dbe7'
  on-primary-fixed: '#002022'
  on-primary-fixed-variant: '#004f54'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#3a0b00'
  on-secondary-fixed-variant: '#852400'
  tertiary-fixed: '#60ff99'
  tertiary-fixed-dim: '#00e479'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005228'
  background: '#11131e'
  on-background: '#e2e1f1'
  surface-variant: '#333440'
typography:
  headline-xl:
    fontFamily: Bodoni Moda
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Bodoni Moda
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Bodoni Moda
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  subheading:
    fontFamily: Bodoni Moda
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: JetBrains Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style
The brand personality is a fusion of cold, empirical science and esoteric mysticism—where the laboratory meets the sanctum. It targets elite culinary experimentalists and molecular gastronomists who view cooking as a ritual of phase shifts and elemental transmutations. 

The design style is **Glassmorphic Cyber-Occultism**. It utilizes deep obsidian voids to create infinite depth, layered with translucent "plasma" surfaces and glowing architectural borders. Visuals are reinforced by sacred geometry overlays (hexagonal grids, celestial orbits) and hyper-precise data visualizations. The emotional response should be one of profound focus, intellectual discovery, and a sense of witnessing "forbidden" scientific secrets.

## Colors
The palette is rooted in a pure black `Obsidian` base to maximize the luminance of the accent colors. 
- **Plasma Cyan (#00f2ff):** Used for primary interactions, kinetic equations, and high-energy data points.
- **Volcanic Orange (#ff4d00):** Reserved for thermodynamic warnings, heat-based variables, and transformative states.
- **Bioluminescent Green (#00ff88):** Applied to organic signatures, successful transmutations, and stable elemental balances.
- **Bismuth Silver & Cold Iron:** Muted metallics used for structural borders and inactive UI states to provide a grounding, physical contrast to the glowing digital elements.

## Typography
The typographic system creates a tension between the ancient and the futuristic. 
- **The Grimoire (Bodoni Moda):** High-contrast, elegant serifs are used for titles and headers. This evokes the feeling of a historical manuscript or a master's logbook. Use italics for subheadings to enhance the "mystical" aesthetic.
- **The Laboratory (JetBrains Mono):** All functional data, kinetic equations, and technical readouts use a monospaced font. This ensures maximum legibility for complex numbers and creates a rhythmic, systematic feel. 
- **Scaling:** Large display headers should reduce significantly on mobile to maintain the "etched" look without breaking the composition.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy rooted in mathematical symmetry. A 12-column system is used for desktop, but elements are often aligned to a central "axis" to mimic alchemical diagrams.

- **Rhythm:** A 4px baseline grid governs all internal component spacing.
- **Margins:** Generous outer margins (64px) ensure the central "apparatus" of the UI feels floating and precious.
- **Reflow:** On mobile, the 12-column grid collapses to a 4-column stack. Data-heavy tables convert into vertical "sigil" cards to maintain readability of monospaced strings.

## Elevation & Depth
Depth is not achieved through traditional shadows, but through **Luminous Stratification**:
- **Base Level:** Pure `#0a0a0a` background.
- **Mid Level (Glass):** Surfaces use a 10% opacity white fill with a 20px backdrop blur. This creates a "frosted obsidian" effect.
- **High Level (Glow):** Interactive elements do not cast shadows; they emit light. Use subtle outer glows (5-10px blur) using the primary or secondary accent colors to indicate focus or active states.
- **Borders:** All containers use a 1px "Cold Iron" border at 20% opacity. Active containers use a 1px gradient border transitioning from Plasma Cyan to transparent.

## Shapes
The shape language is primarily **Soft (Level 1)**. Elements use a 4px (0.25rem) corner radius to feel like precision-cut glass or laboratory slides. Avoid fully rounded "pill" shapes unless they represent fluid containers or mercury-like toggles. Circles are reserved for celestial charts, planetary transits, and orbital data visualizations to maintain the "Sacred Geometry" theme.

## Components
- **Buttons:** Ghost-style with 1px Plasma Cyan borders. On hover, the background fills with a 10% Cyan tint and a subtle outer glow. Text is always uppercase `label-caps`.
- **Data Cards:** Translucent backgrounds with a "header" section separated by a 1px horizontal rule. These contain the "Elemental Signatures."
- **Elemental Tags:** Small, rectangular chips with monospaced labels. The border color corresponds to the element (e.g., Green for Earth/Organic, Orange for Fire/Thermal).
- **Kinetic Energy Graphs:** Vector-based line charts using Primary Cyan. The area under the curve uses a subtle vertical gradient from Cyan to transparent.
- **Astrological Charts:** Interactive circular components with rotating rings. Symbols are etched in Bismuth Silver, turning Plasma Cyan when aligned.
- **Inputs:** Underlined rather than boxed, mimicking a signature line in a grimoire, but using the monospaced font to maintain the scientific feel.