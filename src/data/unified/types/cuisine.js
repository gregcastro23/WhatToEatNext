"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CulinaryFlavor = exports.CulinaryTemperature = exports.CulinaryTradition = void 0;
/**
 * Defines culinary tradition categorization
 */
let CulinaryTradition;
(function (CulinaryTradition) {
    CulinaryTradition["Asian"] = "Asian";
    CulinaryTradition["European"] = "European";
    CulinaryTradition["Mediterranean"] = "Mediterranean";
    CulinaryTradition["MiddleEastern"] = "Middle Eastern";
    CulinaryTradition["African"] = "African";
    CulinaryTradition["SouthAmerican"] = "South American";
    CulinaryTradition["NorthAmerican"] = "North American";
    CulinaryTradition["Caribbean"] = "Caribbean";
    CulinaryTradition["Fusion"] = "Fusion";
    CulinaryTradition["Other"] = "Other";
})(CulinaryTradition || (exports.CulinaryTradition = CulinaryTradition = {}));
/**
 * Defines temperature categorization
 */
let CulinaryTemperature;
(function (CulinaryTemperature) {
    CulinaryTemperature["Hot"] = "Hot";
    CulinaryTemperature["Warm"] = "Warm";
    CulinaryTemperature["Neutral"] = "Neutral";
    CulinaryTemperature["Cool"] = "Cool";
    CulinaryTemperature["Cold"] = "Cold";
})(CulinaryTemperature || (exports.CulinaryTemperature = CulinaryTemperature = {}));
/**
 * Defines flavor profile categorization
 */
let CulinaryFlavor;
(function (CulinaryFlavor) {
    CulinaryFlavor["Sweet"] = "Sweet";
    CulinaryFlavor["Salty"] = "Salty";
    CulinaryFlavor["Sour"] = "Sour";
    CulinaryFlavor["Bitter"] = "Bitter";
    CulinaryFlavor["Umami"] = "Umami";
    CulinaryFlavor["Spicy"] = "Spicy";
    CulinaryFlavor["Aromatic"] = "Aromatic";
    CulinaryFlavor["Pungent"] = "Pungent";
    CulinaryFlavor["Astringent"] = "Astringent";
    CulinaryFlavor["Rich"] = "Rich";
    CulinaryFlavor["Refreshing"] = "Refreshing";
})(CulinaryFlavor || (exports.CulinaryFlavor = CulinaryFlavor = {}));
