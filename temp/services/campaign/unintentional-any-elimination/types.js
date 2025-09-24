"use strict";
/**
 * Unintentional Any Elimination System Types
 * TypeScript interfaces for classification, replacement, and progress tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafetyProtocolError = exports.ClassificationError = exports.CodeDomain = exports.AnyTypeCategory = void 0;
var AnyTypeCategory;
(function (AnyTypeCategory) {
    AnyTypeCategory["ERROR_HANDLING"] = "error_handling";
    AnyTypeCategory["EXTERNAL_API"] = "external_api";
    AnyTypeCategory["TEST_MOCK"] = "test_mock";
    AnyTypeCategory["DYNAMIC_CONFIG"] = "dynamic_config";
    AnyTypeCategory["LEGACY_COMPATIBILITY"] = "legacy_compatibility";
    AnyTypeCategory["ARRAY_TYPE"] = "array_type";
    AnyTypeCategory["RECORD_TYPE"] = "record_type";
    AnyTypeCategory["FUNCTION_PARAM"] = "function_param";
    AnyTypeCategory["RETURN_TYPE"] = "return_type";
    AnyTypeCategory["TYPE_ASSERTION"] = "type_assertion";
})(AnyTypeCategory || (exports.AnyTypeCategory = AnyTypeCategory = {}));
var CodeDomain;
(function (CodeDomain) {
    CodeDomain["ASTROLOGICAL"] = "astrological";
    CodeDomain["RECIPE"] = "recipe";
    CodeDomain["CAMPAIGN"] = "campaign";
    CodeDomain["INTELLIGENCE"] = "intelligence";
    CodeDomain["SERVICE"] = "service";
    CodeDomain["COMPONENT"] = "component";
    CodeDomain["UTILITY"] = "utility";
    CodeDomain["TEST"] = "test";
})(CodeDomain || (exports.CodeDomain = CodeDomain = {}));
// Error Handling Types
class ClassificationError extends Error {
    constructor(message, context, cause) {
        super(message);
        this.context = context;
        this.cause = cause;
        this.name = 'ClassificationError';
    }
}
exports.ClassificationError = ClassificationError;
class SafetyProtocolError extends Error {
    constructor(message, rollbackPath, affectedFiles) {
        super(message);
        this.rollbackPath = rollbackPath;
        this.affectedFiles = affectedFiles;
        this.name = 'SafetyProtocolError';
    }
}
exports.SafetyProtocolError = SafetyProtocolError;
