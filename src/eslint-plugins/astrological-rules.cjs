/**
 * Custom ESLint Plugin for Astrological Calculations
 *
 * Provides domain-specific linting rules to ensure accuracy and consistency
 * in astrological calculations, planetary position validation, elemental
 * properties, and transit date validation patterns.
 */

/**
 * Rule: Preserve planetary constants
 * Ensures that mathematical constants used in planetary calculations are not modified
 */
const preservePlanetaryConstants = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Preserve mathematical constants used in planetary calculations",
      category: "Astrological Accuracy",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const PROTECTED_CONSTANTS = [
      "DEGREES_PER_SIGN",
      "SIGNS_PER_CIRCLE",
      "MAX_LONGITUDE",
      "RELIABLE_POSITIONS",
      "MARCH2025_POSITIONS",
      "FALLBACK_POSITIONS",
      "TRANSIT_DATES",
      "RETROGRADE_PHASES",
      "ELEMENTAL_COMPATIBILITY",
      "SELF_REINFORCEMENT_THRESHOLD",
      "HARMONY_THRESHOLD",
    ];

    return {
      AssignmentExpression(node) {
        if (
          node.left.type === "Identifier" &&
          PROTECTED_CONSTANTS.includes(node.left.name)
        ) {
          context.report({
            node,
            message: `Planetary constant '${node.left.name}' should not be modified. Use a local variable instead.`,
          });
        }

        if (
          node.left.type === "MemberExpression" &&
          node.left.object.type === "Identifier" &&
          PROTECTED_CONSTANTS.includes(node.left.object.name)
        ) {
          context.report({
            node,
            message: `Planetary constant object '${node.left.object.name}' should not be modified. Create a copy instead.`,
          });
        }
      },

      UpdateExpression(node) {
        if (
          node.argument.type === "Identifier" &&
          PROTECTED_CONSTANTS.includes(node.argument.name)
        ) {
          context.report({
            node,
            message: `Planetary constant '${node.argument.name}' should not be modified with ${node.operator}.`,
          });
        }
      },
    };
  },
};

/**
 * Rule: Validate planetary position structure
 * Ensures planetary position objects have the required structure
 */
const validatePlanetaryPositionStructure = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate that planetary position objects have required properties",
      category: "Astrological Accuracy",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const REQUIRED_PROPERTIES = [
      "sign",
      "degree",
      "exactLongitude",
      "isRetrograde",
    ];

    function isPlanetaryPositionObject(node) {
      // Check if this looks like a planetary position object
      if (node.type !== "ObjectExpression") return false;

      const properties = node.properties
        .map((prop) =>
          prop.type === "Property" && prop.key.type === "Identifier"
            ? prop.key.name
            : null,
        )
        .filter(Boolean);

      // Must have at least 2 of the required properties to be considered a planetary position
      const matchingProps = REQUIRED_PROPERTIES.filter((prop) =>
        properties.includes(prop),
      );
      return matchingProps.length >= 2;
    }

    return {
      ObjectExpression(node) {
        if (!isPlanetaryPositionObject(node)) return;

        const properties = node.properties
          .map((prop) =>
            prop.type === "Property" && prop.key.type === "Identifier"
              ? prop.key.name
              : null,
          )
          .filter(Boolean);

        const missingProperties = REQUIRED_PROPERTIES.filter(
          (prop) => !properties.includes(prop),
        );

        if (missingProperties.length > 0) {
          context.report({
            node,
            message: `Planetary position object missing required properties: ${missingProperties.join(", ")}`,
          });
        }
      },
    };
  },
};

/**
 * Rule: Validate elemental properties
 * Ensures elemental properties objects follow the four-element system
 */
const validateElementalProperties = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Validate elemental properties follow the four-element system",
      category: "Astrological Accuracy",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const REQUIRED_ELEMENTS = ["Fire", "Water", "Earth", "Air"];

    function isElementalPropertiesObject(node) {
      if (node.type !== "ObjectExpression") return false;

      const properties = node.properties
        .map((prop) =>
          prop.type === "Property" && prop.key.type === "Identifier"
            ? prop.key.name
            : null,
        )
        .filter(Boolean);

      // Must have at least 2 elements to be considered elemental properties
      const matchingElements = REQUIRED_ELEMENTS.filter((element) =>
        properties.includes(element),
      );
      return matchingElements.length >= 2;
    }

    function validateElementValue(valueNode) {
      if (valueNode.type === "Literal" && typeof valueNode.value === "number") {
        const value = valueNode.value;
        if (value < 0 || value > 1) {
          return `Element value ${value} must be between 0 and 1`;
        }
      }
      return null;
    }

    return {
      ObjectExpression(node) {
        if (!isElementalPropertiesObject(node)) return;

        const properties = node.properties.filter(
          (prop) => prop.type === "Property",
        );
        const elementNames = properties
          .map((prop) =>
            prop.key.type === "Identifier" ? prop.key.name : null,
          )
          .filter(Boolean);

        // Check for missing elements
        const missingElements = REQUIRED_ELEMENTS.filter(
          (element) => !elementNames.includes(element),
        );
        if (missingElements.length > 0) {
          context.report({
            node,
            message: `Elemental properties missing required elements: ${missingElements.join(", ")}`,
          });
        }

        // Check for invalid element names
        const invalidElements = elementNames.filter(
          (name) => !REQUIRED_ELEMENTS.includes(name),
        );
        if (invalidElements.length > 0) {
          context.report({
            node,
            message: `Invalid element names: ${invalidElements.join(", ")}. Valid elements are: ${REQUIRED_ELEMENTS.join(", ")}`,
          });
        }

        // Validate element values
        properties.forEach((prop) => {
          if (
            prop.key.type === "Identifier" &&
            REQUIRED_ELEMENTS.includes(prop.key.name)
          ) {
            const error = validateElementValue(prop.value);
            if (error) {
              context.report({
                node: prop.value,
                message: error,
              });
            }
          }
        });
      },
    };
  },
};

/**
 * Rule: Require transit date validation
 * Warns when planetary positions are used without transit date validation
 */
const requireTransitDateValidation = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require transit date validation when using planetary positions",
      category: "Astrological Accuracy",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const filename = context.getFilename();
    const isAstrologicalFile =
      filename.includes("calculations") ||
      filename.includes("astrology") ||
      filename.includes("planetary");

    if (!isAstrologicalFile) return {};

    let hasValidationImport = false;
    let hasValidationCall = false;

    return {
      ImportDeclaration(node) {
        if (
          node.source.value &&
          (node.source.value.includes("transitValidation") ||
            node.source.value.includes("astrologicalValidation"))
        ) {
          hasValidationImport = true;
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === "Identifier" &&
          (node.callee.name.includes("validate") ||
            node.callee.name.includes("Transit") ||
            node.callee.name.includes("Position"))
        ) {
          hasValidationCall = true;
        }
      },

      "Program:exit"() {
        if (isAstrologicalFile && !hasValidationImport) {
          context.report({
            node: context.getSourceCode().ast,
            message:
              "Astrological calculation files should import transit validation utilities",
          });
        }

        if (isAstrologicalFile && hasValidationImport && !hasValidationCall) {
          context.report({
            node: context.getSourceCode().ast,
            message:
              "Consider adding transit date validation calls for planetary position accuracy",
          });
        }
      },
    };
  },
};

/**
 * Rule: Preserve fallback values
 * Ensures fallback values for astronomical calculations are not removed
 */
const preserveFallbackValues = {
  meta: {
    type: "problem",
    docs: {
      description: "Preserve fallback values for astronomical calculations",
      category: "Astrological Reliability",
      recommended: true,
    },
    fixable: null,
    schema: [],
  },
  create(context) {
    const FALLBACK_PATTERNS = [
      /FALLBACK/i,
      /DEFAULT/i,
      /RELIABLE/i,
      /MARCH2025/i,
      /BACKUP/i,
      /CACHED/i,
    ];

    function isFallbackVariable(name) {
      return FALLBACK_PATTERNS.some((pattern) => pattern.test(name));
    }

    return {
      VariableDeclarator(node) {
        if (node.id.type === "Identifier" && isFallbackVariable(node.id.name)) {
          // Check if it's being assigned null or undefined
          if (
            (node.init &&
              node.init.type === "Literal" &&
              node.init.value === null) ||
            (node.init.type === "Identifier" && node.init.name === "undefined")
          ) {
            context.report({
              node,
              message: `Fallback variable '${node.id.name}' should not be set to null or undefined`,
            });
          }
        }
      },

      AssignmentExpression(node) {
        if (
          node.left.type === "Identifier" &&
          isFallbackVariable(node.left.name)
        ) {
          if (
            (node.right.type === "Literal" && node.right.value === null) ||
            (node.right.type === "Identifier" &&
              node.right.name === "undefined")
          ) {
            context.report({
              node,
              message: `Fallback variable '${node.left.name}' should not be assigned null or undefined`,
            });
          }
        }
      },
    };
  },
};

/**
 * Export the plugin
 */
module.exports = {
  rules: {
    "preserve-planetary-constants": preservePlanetaryConstants,
    "validate-planetary-position-structure": validatePlanetaryPositionStructure,
    "validate-elemental-properties": validateElementalProperties,
    "require-transit-date-validation": requireTransitDateValidation,
    "preserve-fallback-values": preserveFallbackValues,
  },
  configs: {
    recommended: {
      rules: {
        "astrological/preserve-planetary-constants": "error",
        "astrological/validate-planetary-position-structure": "error",
        "astrological/validate-elemental-properties": "error",
        "astrological/require-transit-date-validation": "warn",
        "astrological/preserve-fallback-values": "error",
      },
    },
  },
};
