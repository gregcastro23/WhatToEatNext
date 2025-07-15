"use strict";
// ===== FLAVOR PROFILE TYPE DEFINITIONS =====
// Used for classifying flavor profiles across the application
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlavorProfileType = void 0;
/**
 * Enum for categorizing flavor profiles in various cuisines and ingredients
 */
let FlavorProfileType;
(function (FlavorProfileType) {
    FlavorProfileType["SAVORY"] = "SAVORY";
    FlavorProfileType["SWEET"] = "SWEET";
    FlavorProfileType["BITTER"] = "BITTER";
    FlavorProfileType["SOUR"] = "SOUR";
    FlavorProfileType["UMAMI"] = "UMAMI";
    FlavorProfileType["SPICY"] = "SPICY";
    FlavorProfileType["HERBAL"] = "HERBAL";
    FlavorProfileType["NEUTRAL"] = "NEUTRAL";
    FlavorProfileType["WARM"] = "WARM";
    FlavorProfileType["COOL"] = "COOL";
    FlavorProfileType["COMPLEX"] = "COMPLEX";
    FlavorProfileType["REFRESHING"] = "REFRESHING";
    FlavorProfileType["earthY"] = "earthY";
    FlavorProfileType["AROMATIC"] = "AROMATIC";
    FlavorProfileType["TANGY"] = "TANGY";
    FlavorProfileType["RICH"] = "RICH";
})(FlavorProfileType || (exports.FlavorProfileType = FlavorProfileType = {}));
exports.default = FlavorProfileType;
