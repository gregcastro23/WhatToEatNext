'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alchemicalReducer = void 0;
var alchemical_1 = require("../../types/alchemical");
/**
 * Reducer for the AlchemicalContext
 */
var alchemicalReducer = function (state, action) {
    var _a;
    switch (action.type) {
        case alchemical_1.AlchemicalDispatchType.SET_SEASONAL_STATE:
            return __assign(__assign({}, state), { currentSeason: action.payload.season, lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_ELEMENTAL_PREFERENCE:
            return __assign(__assign({}, state), { elementalPreference: __assign(__assign({}, state.elementalPreference), (_a = {}, _a[action.payload.element] = action.payload.value, _a)), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_ELEMENTAL_STATE:
            var elementalState = __assign({ Fire: state.elementalState.Fire, Water: state.elementalState.Water, Earth: state.elementalState.Earth, Air: state.elementalState.Air }, action.payload);
            return __assign(__assign({}, state), { elementalState: elementalState, lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_ZODIAC_ENERGY:
            return __assign(__assign({}, state), { zodiacEnergy: action.payload, currentEnergy: __assign(__assign({}, state.currentEnergy), { zodiacEnergy: action.payload }), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_LUNAR_ENERGY:
            return __assign(__assign({}, state), { lunarEnergy: action.payload, currentEnergy: __assign(__assign({}, state.currentEnergy), { lunarEnergy: action.payload }), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_PLANETARY_ENERGY:
            var planetaryEnergy = Array.isArray(action.payload)
                ? action.payload
                : [action.payload];
            return __assign(__assign({}, state), { planetaryEnergy: planetaryEnergy, currentEnergy: __assign(__assign({}, state.currentEnergy), { planetaryEnergy: planetaryEnergy }), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_ASTROLOGICAL_STATE:
            return __assign(__assign({}, state), { astrologicalState: __assign({ currentZodiac: 'aries', sunSign: 'aries', lunarPhase: 'new moon', moonPhase: 'new moon', activePlanets: [] }, action.payload), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_ERROR:
            return __assign(__assign({}, state), { error: true, errorMessage: action.payload.message, errors: __spreadArray(__spreadArray([], state.errors, true), [action.payload.message], false), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.CLEAR_ERROR:
            return __assign(__assign({}, state), { error: false, errorMessage: '', lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.ADD_ERROR:
            return __assign(__assign({}, state), { errors: __spreadArray(__spreadArray([], state.errors, true), [action.payload], false), lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.UPDATE_STATE:
            return __assign(__assign(__assign({}, state), action.payload), { lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_ALCHEMICAL_VALUES:
            var alchemicalValues = __assign({ Spirit: state.alchemicalValues.Spirit, Essence: state.alchemicalValues.Essence, Matter: state.alchemicalValues.Matter, Substance: state.alchemicalValues.Substance }, action.payload);
            return __assign(__assign({}, state), { alchemicalValues: alchemicalValues, lastUpdated: new Date() });
        case alchemical_1.AlchemicalDispatchType.SET_LUNAR_PHASE:
            return __assign(__assign({}, state), { lunarPhase: action.payload, lastUpdated: new Date() });
        default:
            return state;
    }
};
exports.alchemicalReducer = alchemicalReducer;
