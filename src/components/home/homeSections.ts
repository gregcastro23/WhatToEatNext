/**
 * The homepage's live sections, named once: HomePageClient gives each section
 * its id, and the hero's "On this page" chips link to them.
 */

export interface HomeSectionAnchor {
  id: string;
  label: string;
}

interface HomeSectionIds {
  cuisines: string;
  ingredients: string;
  methods: string;
  sauces: string;
}

export const HOME_SECTION_IDS: Readonly<HomeSectionIds> = {
  cuisines: "tonight-cuisines",
  ingredients: "tonight-ingredients",
  methods: "tonight-methods",
  sauces: "tonight-sauces",
};

export const HOME_SECTION_ANCHORS: readonly HomeSectionAnchor[] = [
  { id: HOME_SECTION_IDS.cuisines, label: "Cuisines" },
  { id: HOME_SECTION_IDS.ingredients, label: "Ingredients" },
  { id: HOME_SECTION_IDS.methods, label: "Methods" },
  { id: HOME_SECTION_IDS.sauces, label: "Sauces" },
];
