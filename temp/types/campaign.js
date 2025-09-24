"use strict";
/**
 * Campaign Infrastructure Types
 * Perfect Codebase Campaign - Type Definitions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCategory = exports.PhaseStatus = exports.RecoveryAction = exports.CorruptionSeverity = exports.SafetyEventSeverity = exports.SafetyEventType = exports.SafetyLevel = void 0;
// Enums
var SafetyLevel;
(function (SafetyLevel) {
    SafetyLevel["LOW"] = "LOW";
    SafetyLevel["MEDIUM"] = "MEDIUM";
    SafetyLevel["HIGH"] = "HIGH";
    SafetyLevel["MAXIMUM"] = "MAXIMUM";
})(SafetyLevel || (exports.SafetyLevel = SafetyLevel = {}));
var SafetyEventType;
(function (SafetyEventType) {
    SafetyEventType["CHECKPOINT_CREATED"] = "CHECKPOINT_CREATED";
    SafetyEventType["ROLLBACK_TRIGGERED"] = "ROLLBACK_TRIGGERED";
    SafetyEventType["CORRUPTION_DETECTED"] = "CORRUPTION_DETECTED";
    SafetyEventType["BUILD_FAILURE"] = "BUILD_FAILURE";
    SafetyEventType["TEST_FAILURE"] = "TEST_FAILURE";
    SafetyEventType["EMERGENCY_RECOVERY"] = "EMERGENCY_RECOVERY";
})(SafetyEventType || (exports.SafetyEventType = SafetyEventType = {}));
var SafetyEventSeverity;
(function (SafetyEventSeverity) {
    SafetyEventSeverity["INFO"] = "INFO";
    SafetyEventSeverity["WARNING"] = "WARNING";
    SafetyEventSeverity["ERROR"] = "ERROR";
    SafetyEventSeverity["CRITICAL"] = "CRITICAL";
})(SafetyEventSeverity || (exports.SafetyEventSeverity = SafetyEventSeverity = {}));
var CorruptionSeverity;
(function (CorruptionSeverity) {
    CorruptionSeverity["LOW"] = "LOW";
    CorruptionSeverity["MEDIUM"] = "MEDIUM";
    CorruptionSeverity["HIGH"] = "HIGH";
    CorruptionSeverity["CRITICAL"] = "CRITICAL";
})(CorruptionSeverity || (exports.CorruptionSeverity = CorruptionSeverity = {}));
var RecoveryAction;
(function (RecoveryAction) {
    RecoveryAction["CONTINUE"] = "CONTINUE";
    RecoveryAction["RETRY"] = "RETRY";
    RecoveryAction["ROLLBACK"] = "ROLLBACK";
    RecoveryAction["EMERGENCY_RESTORE"] = "EMERGENCY_RESTORE";
})(RecoveryAction || (exports.RecoveryAction = RecoveryAction = {}));
var PhaseStatus;
(function (PhaseStatus) {
    PhaseStatus["NOT_STARTED"] = "NOT_STARTED";
    PhaseStatus["IN_PROGRESS"] = "IN_PROGRESS";
    PhaseStatus["COMPLETED"] = "COMPLETED";
    PhaseStatus["FAILED"] = "FAILED";
    PhaseStatus["ROLLED_BACK"] = "ROLLED_BACK";
})(PhaseStatus || (exports.PhaseStatus = PhaseStatus = {}));
var ErrorCategory;
(function (ErrorCategory) {
    // High-priority TypeScript errors
    ErrorCategory["TS2352_TYPE_CONVERSION"] = "TS2352";
    ErrorCategory["TS2345_ARGUMENT_MISMATCH"] = "TS2345";
    ErrorCategory["TS2698_SPREAD_TYPE"] = "TS2698";
    ErrorCategory["TS2304_CANNOT_FIND_NAME"] = "TS2304";
    ErrorCategory["TS2362_ARITHMETIC_OPERATION"] = "TS2362";
    // Linting categories
    ErrorCategory["EXPLICIT_ANY_WARNING"] = "explicit-any";
    ErrorCategory["UNUSED_VARIABLES"] = "unused-vars";
    ErrorCategory["CONSOLE_STATEMENTS"] = "no-console";
    // Safety categories
    ErrorCategory["CORRUPTION_DETECTED"] = "corruption";
    ErrorCategory["BUILD_FAILURE"] = "build-fail";
    ErrorCategory["TEST_FAILURE"] = "test-fail";
})(ErrorCategory || (exports.ErrorCategory = ErrorCategory = {}));
