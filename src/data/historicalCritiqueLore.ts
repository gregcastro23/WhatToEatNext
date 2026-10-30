/** Curated historical-style reflection text; never a live provider response. */
export const HISTORICAL_LORE_CRITIQUES: Record<
  string,
  (recipeName: string, cuisine?: string) => string
> = {
  "leonardo-da-vinci": (name) =>
    `The body should never be a tomb for other living creatures. In "${name}", observe the mathematical harmony of botanical essences — when vegetables and pure oils are united with geometric balance, the dish nourishes both the inventive intellect and vital spirit.`,
  socrates: (name) =>
    `We must examine what we consume: do we eat to live, or live to eat? "${name}" offers sustenance without decadent ostentation. When approached with temperance and mindful savoring, even a humble dish becomes a teacher of virtuous living.`,
  "carl-jung": (name) =>
    `Every recipe is an archetypal mandala of transformation. In preparing "${name}", the heat of the hearth mirrors the psychological crucible where shadow and light integrate. Notice how the fermented and layered notes evoke the collective unconscious of human culinary memory.`,
  cleopatra: (name) =>
    `True culinary mastery honors the sacred waters and aromatic gifts of the earth. "${name}" carries the royal harmony prized in Alexandria — fragrant herbs and radiant oils that revitalize the skin and elevate the palace table into a temple of vitality.`,
  "hildegard-of-bingen": (name) =>
    `Let the viriditas — the green life force instilled by the Divine — flourish through this meal. In "${name}", the warming spices and nourishing herbs calm melancholy of the bile and infuse the soul with celestial vitality and inner calm.`,
  "isaac-newton": (name) =>
    `Culinary transformation obeys immutable natural laws. The thermal conduction applied to "${name}" creates an equilibrium of chemical extraction. When crystalline salt and volatile aromas are measured with precision, harmony is mathematically inevitable.`,
  aristotle: (name) =>
    `Excellence is not an act, but a habit of moderation. In "${name}", the golden mean between dry and moist, heating and cooling, is preserved. When neither seasoning nor heat is taken to excess, true culinary eudaimonia is attained.`,
  paracelsus: (name) =>
    `The dose makes the poison and the remedy alike. Within "${name}", the three alchemical primes — Salt, Sulphur, and Mercury — dance between the fire and the vessel. Savor its volatile oils, for food is the daily medicine of the living alchemist.`,
};

