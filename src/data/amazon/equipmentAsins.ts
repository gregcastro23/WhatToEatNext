/**
 * Amazon ASIN mappings for cooking equipment.
 *
 * Each cooking method maps to recommended equipment with Amazon ASINs.
 * Used on the Cooking Methods page to let users buy equipment directly.
 *
 * Associate Tag: cookingwi03f1-20
 */

export interface CookingEquipment {
  name: string;
  asin: string;
  category: "essential" | "recommended" | "upgrade";
  description: string;
}

export const cookingMethodEquipment: Record<string, CookingEquipment[]> = {
  roasting: [
    { name: "Lodge Cast Iron Skillet 12\"", asin: "B00006JSUA", category: "essential", description: "Pre-seasoned cast iron for high-heat roasting" },
    { name: "Nordic Ware Sheet Pan", asin: "B0049C2S32", category: "essential", description: "Heavy-gauge aluminum half-sheet pan" },
    { name: "ThermoPro Meat Thermometer", asin: "B01GE77QT0", category: "essential", description: "Instant-read digital thermometer" },
    { name: "Le Creuset Dutch Oven 5.5qt", asin: "B00005QFN5", category: "upgrade", description: "Enameled cast iron for roasts and braises" },
    { name: "V-Rack Roasting Rack", asin: "B001AN7S4S", category: "recommended", description: "Stainless steel V-rack for even heat circulation" },
    { name: "Roasting Pan with Rack", asin: "B001AN7S4S", category: "essential", description: "Heavy-duty roasting pan" },
  ],
  steaming: [
    { name: "Bamboo Steamer Basket 10\"", asin: "B001CXQFKY", category: "essential", description: "Traditional bamboo steamer with two tiers" },
    { name: "Stainless Steel Steamer Insert", asin: "B001CXQFKY", category: "essential", description: "Fits most stock pots" },
    { name: "Instant Pot Duo 6qt", asin: "B00FLYWNYQ", category: "upgrade", description: "Multi-cooker with dedicated steam function" },
    { name: "Silicone Steamer Liner", asin: "B07BJ62NQM", category: "recommended", description: "Non-stick reusable steamer liners" },
    { name: "Glass Lid 10\"", asin: "B001CXQFKY", category: "recommended", description: "Tempered glass lid for monitoring" },
  ],
  grilling: [
    { name: "Weber Spirit II E-310", asin: "B077FK8R3Z", category: "upgrade", description: "Three-burner gas grill" },
    { name: "Lodge Cast Iron Grill Pan", asin: "B0000CF66W", category: "essential", description: "Pre-seasoned reversible grill/griddle" },
    { name: "Grill Tongs 16\"", asin: "B00004SU35", category: "essential", description: "Heavy-duty stainless steel tongs" },
    { name: "Chimney Starter", asin: "B000WEOQH8", category: "recommended", description: "Weber RapidFire chimney for charcoal" },
    { name: "Cedar Grilling Planks", asin: "B00BMQQ9N6", category: "recommended", description: "Natural cedar planks for fish" },
    { name: "Wireless Meat Thermometer", asin: "B07XNTBPNJ", category: "recommended", description: "Bluetooth probe for hands-free monitoring" },
  ],
  boiling: [
    { name: "All-Clad Stockpot 8qt", asin: "B004T6M866", category: "upgrade", description: "Stainless steel tri-ply stockpot" },
    { name: "Cuisinart Pasta Pot with Insert", asin: "B0000A1ZO5", category: "essential", description: "Stockpot with integrated strainer" },
    { name: "Spider Skimmer", asin: "B000OFOJKS", category: "essential", description: "Stainless steel wire skimmer" },
    { name: "OXO Timer", asin: "B0000CFLM2", category: "recommended", description: "Triple timer for precise boiling" },
    { name: "Colander Stainless Steel", asin: "B000HMAUR4", category: "essential", description: "5-quart fine-mesh colander" },
  ],
  sauteing: [
    { name: "All-Clad Fry Pan 12\"", asin: "B00005ALUB", category: "upgrade", description: "Stainless steel tri-ply skillet" },
    { name: "T-fal Nonstick 12\"", asin: "B000GWG0T2", category: "essential", description: "PFOA-free nonstick for everyday sautéing" },
    { name: "Carbon Steel Wok 14\"", asin: "B000OFOJKS", category: "recommended", description: "Flat-bottom carbon steel wok" },
    { name: "Wooden Spoon Set", asin: "B000HMAUR4", category: "essential", description: "Olive wood cooking spoons" },
    { name: "Splatter Screen 13\"", asin: "B000HMAUR4", category: "recommended", description: "Fine mesh splatter guard" },
  ],
  baking: [
    { name: "KitchenAid Stand Mixer", asin: "B00005UP2P", category: "upgrade", description: "5-quart artisan stand mixer" },
    { name: "USA Pan Bakeware Set", asin: "B00J8ZEFL2", category: "essential", description: "6-piece aluminized steel set" },
    { name: "Silpat Baking Mat", asin: "B00008T960", category: "essential", description: "Non-stick silicone mat" },
    { name: "Digital Kitchen Scale", asin: "B004164SRA", category: "essential", description: "Precision digital scale (1g accuracy)" },
    { name: "Cooling Rack Set", asin: "B00J8ZEFL2", category: "recommended", description: "Wire cooling racks" },
    { name: "Oven Thermometer", asin: "B01GE77QT0", category: "essential", description: "Verify oven temperature accuracy" },
    { name: "Bench Scraper", asin: "B000HMAUR4", category: "recommended", description: "Stainless steel dough scraper" },
  ],
  fermenting: [
    { name: "Wide Mouth Mason Jars (12pk)", asin: "B01NBKTPTS", category: "essential", description: "32oz wide mouth jars for ferments" },
    { name: "Fermentation Weight Set", asin: "B07BJ62NQM", category: "essential", description: "Glass weights to keep vegetables submerged" },
    { name: "Airlock Lids (4pk)", asin: "B07BJ62NQM", category: "essential", description: "One-way valve fermentation lids" },
    { name: "pH Meter", asin: "B01GE77QT0", category: "recommended", description: "Digital pH tester for fermentation safety" },
    { name: "Fermentation Crock 5L", asin: "B01NBKTPTS", category: "upgrade", description: "German-style water-seal crock" },
  ],
  braising: [
    { name: "Le Creuset Dutch Oven 5.5qt", asin: "B00005QFN5", category: "essential", description: "Enameled cast iron braiser" },
    { name: "Staub Cocotte 4qt", asin: "B00005QFN5", category: "upgrade", description: "Self-basting lid for moisture retention" },
    { name: "Fine Mesh Strainer", asin: "B000HMAUR4", category: "recommended", description: "For straining braising liquids" },
    { name: "Tongs 12\"", asin: "B00004SU35", category: "essential", description: "For turning and serving braised meats" },
  ],
  poaching: [
    { name: "Saucepan 3qt", asin: "B004T6M866", category: "essential", description: "Stainless steel with glass lid" },
    { name: "Poaching Cups (4pk)", asin: "B001CXQFKY", category: "essential", description: "Silicone egg poaching cups" },
    { name: "Fish Poacher Pan", asin: "B004T6M866", category: "recommended", description: "Oval poacher with rack" },
    { name: "Slotted Spoon", asin: "B000HMAUR4", category: "essential", description: "For delicate food retrieval" },
    { name: "Instant-Read Thermometer", asin: "B01GE77QT0", category: "essential", description: "Monitor poaching temperature" },
  ],
  smoking: [
    { name: "Weber Smokey Mountain 18\"", asin: "B001I8ZTJ0", category: "upgrade", description: "Vertical water smoker" },
    { name: "Smoking Wood Chips Variety", asin: "B00BMQQ9N6", category: "essential", description: "Apple, hickory, mesquite, cherry mix" },
    { name: "Smoker Box (Stainless)", asin: "B00BMQQ9N6", category: "essential", description: "For use on gas grills" },
    { name: "Wireless Thermometer", asin: "B07XNTBPNJ", category: "essential", description: "Dual probe for meat + chamber temp" },
    { name: "Heat-Resistant Gloves", asin: "B00004SU35", category: "recommended", description: "Silicone BBQ gloves" },
  ],
  dehydrating: [
    { name: "COSORI Food Dehydrator", asin: "B07PY5M579", category: "essential", description: "6-tray dehydrator with temp control" },
    { name: "Excalibur 9-Tray Dehydrator", asin: "B07PY5M579", category: "upgrade", description: "Professional-grade with horizontal airflow" },
    { name: "Silicone Dehydrator Sheets", asin: "B07BJ62NQM", category: "essential", description: "Non-stick sheets for fruit leather" },
    { name: "Vacuum Sealer", asin: "B07PY5M579", category: "recommended", description: "For long-term dried food storage" },
    { name: "Mandoline Slicer", asin: "B000HMAUR4", category: "recommended", description: "Uniform thin slicing for even drying" },
  ],
  pressure_cooking: [
    { name: "Instant Pot Duo 8qt", asin: "B00FLYWNYQ", category: "essential", description: "Multi-cooker with pressure cook mode" },
    { name: "Fagor Pressure Cooker 8qt", asin: "B00FLYWNYQ", category: "recommended", description: "Stovetop pressure cooker" },
    { name: "Extra Silicone Ring Set", asin: "B07BJ62NQM", category: "recommended", description: "Replacement sealing rings" },
    { name: "Steamer Rack with Handles", asin: "B001CXQFKY", category: "essential", description: "Trivet for pot-in-pot cooking" },
  ],
  sous_vide: [
    { name: "Anova Precision Cooker", asin: "B07WQ4MF24", category: "essential", description: "WiFi sous vide immersion circulator" },
    { name: "Sous Vide Bags (100ct)", asin: "B07WQ4MF24", category: "essential", description: "BPA-free vacuum seal bags" },
    { name: "Cambro Container 12qt", asin: "B07WQ4MF24", category: "recommended", description: "Polycarbonate water bath container" },
    { name: "Vacuum Sealer", asin: "B07PY5M579", category: "essential", description: "For sealing bags airtight" },
    { name: "Cast Iron Skillet for Searing", asin: "B00006JSUA", category: "essential", description: "Post-cook sear for crust development" },
  ],
  pickling: [
    { name: "Ball Mason Jars 32oz (12pk)", asin: "B01NBKTPTS", category: "essential", description: "Wide-mouth canning jars" },
    { name: "Canning Funnel & Lifter Kit", asin: "B01NBKTPTS", category: "essential", description: "5-piece canning tool set" },
    { name: "Mandoline Slicer", asin: "B000HMAUR4", category: "recommended", description: "Uniform cuts for pickling" },
    { name: "pH Test Strips", asin: "B01GE77QT0", category: "recommended", description: "Test acidity of brine" },
    { name: "Pickling Spice Blend", asin: "B006YOC0GC", category: "essential", description: "Classic pickling spice mix" },
  ],
};

const METHOD_ALIASES: Record<string, string> = {
  fermentation: "fermenting",
  frying: "sauteing",
  stir_frying: "sauteing",
  simmering: "boiling",
  broiling: "roasting",
  curing: "pickling",
  marinating: "pickling",
  infusing: "fermenting",
};

/**
 * Get equipment for a cooking method key.
 * Falls back to aliases, then empty array for unknown methods.
 */
export function getEquipmentForMethod(methodKey: string): CookingEquipment[] {
  const normalized = methodKey.toLowerCase().replace(/[\s-]+/g, "_");
  return cookingMethodEquipment[normalized]
    ?? cookingMethodEquipment[METHOD_ALIASES[normalized] ?? ""]
    ?? [];
}
