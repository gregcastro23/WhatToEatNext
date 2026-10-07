/**
 * The keyboard focus ring every interactive control in the recipe builder
 * shares. `focus-visible` keeps it off mouse clicks; the obsidian surfaces
 * hide the browser's default outline, so without it a keyboard user loses
 * their place.
 *
 * @file src/components/recipe-builder/focusRing.ts
 */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400";
