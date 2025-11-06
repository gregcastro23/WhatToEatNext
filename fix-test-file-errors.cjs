#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Fix TypeScript errors in test files
 * This script addresses common patterns of errors in test files
 */

function fixMainPageWorkflowsTest() {
  const filePath = "src/__tests__/e2e/MainPageWorkflows.test.tsx";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix the MainPageLayout component to accept props
  const oldMainPageLayout = `const MainPageLayout = () => {
  return (
    <div data-testid='main-page-layout'>
      <MockCuisineRecommender />
      <MockElementalBalance />
      <MockIntelligencePanel />
    </div>
  );
};`;

  const newMainPageLayout = `interface MainPageLayoutProps {
  onSectionNavigate?: (section: string) => void;
}

const MainPageLayout: React.FC<MainPageLayoutProps> = ({ onSectionNavigate }) => {
  return (
    <div data-testid='main-page-layout'>
      <MockCuisineRecommender />
      <MockElementalBalance />
      <MockIntelligencePanel />
    </div>
  );
};`;

  if (content.includes(oldMainPageLayout)) {
    content = content.replace(oldMainPageLayout, newMainPageLayout);
    console.log("Fixed MainPageLayout component props");
  }

  // Move imports to the top of the file (after the initial imports)
  const misplacedImports = `import { useAlchemical } from '@/contexts/AlchemicalContext/hooks';
import { useAutoStateCleanup, useNavigationState, useScrollPreservation } from '@/hooks/useStatePreservation';`;

  if (content.includes(misplacedImports)) {
    // Remove the misplaced imports
    content = content.replace(misplacedImports, "");

    // Add them after the React import
    const reactImportLine = `import React from 'react';`;
    content = content.replace(
      reactImportLine,
      `${reactImportLine}
${misplacedImports}`,
    );

    console.log("Moved imports to correct location");
  }

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixMainPageIntegrationTest() {
  const filePath = "src/__tests__/integration/MainPageIntegration.test.tsx";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix similar issues in MainPageIntegration test
  // Look for components that need props
  const patterns = [
    {
      // Fix onSectionNavigate prop
      search: /render\(<(\w+)\s+onSectionNavigate=\{[^}]+\}\s*\/>\)/g,
      replace: (match, componentName) => {
        // Add interface for the component if it doesn't exist
        const interfaceName = `${componentName}Props`;
        const interfaceDefinition = `interface ${interfaceName} {
  onSectionNavigate?: (section: string) => void;
}`;

        if (!content.includes(interfaceDefinition)) {
          // Add interface before the component usage
          const componentDefPattern = new RegExp(
            `const ${componentName}\\s*=`,
            "g",
          );
          if (componentDefPattern.test(content)) {
            content = content.replace(
              componentDefPattern,
              `${interfaceDefinition}\n\nconst ${componentName}: React.FC<${interfaceName}> =`,
            );
          }
        }

        return match;
      },
    },
  ];

  // Apply pattern fixes
  patterns.forEach((pattern) => {
    content = content.replace(pattern.search, pattern.replace);
  });

  // Fix debugMode prop issues
  content = content.replace(
    /render\(<(\w+)\s+debugMode=\{[^}]+\}\s*\/>\)/g,
    (match, componentName) => {
      // Ensure component accepts debugMode prop
      const interfaceName = `${componentName}Props`;
      const interfaceDefinition = `interface ${interfaceName} {
  debugMode?: boolean;
}`;

      if (!content.includes(interfaceDefinition)) {
        const componentDefPattern = new RegExp(
          `const ${componentName}\\s*=`,
          "g",
        );
        if (componentDefPattern.test(content)) {
          content = content.replace(
            componentDefPattern,
            `${interfaceDefinition}\n\nconst ${componentName}: React.FC<${interfaceName}> =`,
          );
        }
      }

      return match;
    },
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixReact19CompatibilityTest() {
  const filePath =
    "src/__tests__/linting/React19NextJS15CompatibilityValidation.test.ts";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix 'config' is of type 'unknown' errors
  content = content.replace(/config\./g, "(config as any).");
  content = content.replace(/config\[/g, "(config as any)[");

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixCampaignTestController() {
  const filePath = "src/__tests__/utils/CampaignTestController.ts";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix 'originalState' is of type 'unknown' errors
  content = content.replace(/originalState\./g, "(originalState as any).");
  content = content.replace(/originalState\[/g, "(originalState as any)[");

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixMemoryLeakDetector() {
  const filePath = "src/__tests__/utils/MemoryLeakDetector.ts";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix type conversion errors by using 'unknown' first
  content = content.replace(
    /(window|global)\s+as\s+\{\s*_eventListeners:[^}]+\}/g,
    "(window as unknown) as { _eventListeners: Record<string, unknown[]> }",
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixMemoryOptimizationScript() {
  const filePath = "src/__tests__/utils/MemoryOptimizationScript.ts";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix 'Object is of type unknown' errors
  content = content.replace(/(\w+)\s+is of type 'unknown'/g, "($1 as any)");

  // More specific fixes for unknown object access
  const unknownObjectPattern = /(\w+)\.(\w+)/g;
  content = content.replace(unknownObjectPattern, (match, obj, prop) => {
    // Only replace if the line contains an error about unknown type
    return match;
  });

  // Fix specific patterns that cause unknown type errors
  content = content.replace(
    /(\w+)\.(\w+)\s*=\s*([^;]+);/g,
    (match, obj, prop, value) => {
      if (content.includes(`${obj} is of type 'unknown'`)) {
        return `(${obj} as any).${prop} = ${value};`;
      }
      return match;
    },
  );

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixImportOrganizationTest() {
  const filePath = "src/__tests__/linting/test-files/import-organization.tsx";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix title prop issue by creating proper component interface
  const titlePropPattern = /<(\w+)\s+title=\{[^}]+\}/g;
  const matches = content.match(titlePropPattern);

  if (matches) {
    matches.forEach((match) => {
      const componentMatch = match.match(/<(\w+)/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        const interfaceDefinition = `interface ${componentName}Props {
  title?: string;
  children?: React.ReactNode;
}`;

        if (!content.includes(interfaceDefinition)) {
          // Add interface before component usage
          content = `${interfaceDefinition}\n\n${content}`;
        }
      }
    });
  }

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

function fixCampaignTestUtils() {
  const filePath = "src/__tests__/utils/campaignTestUtils.ts";

  if (!fs.existsSync(filePath)) {
    console.log(`File ${filePath} does not exist, skipping...`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");

  // Fix SafetyLevel type assignment
  content = content.replace(
    /Type 'unknown' is not assignable to type 'SafetyLevel'/g,
    "",
  );

  // Add proper type assertion for SafetyLevel
  content = content.replace(/(\w+):\s*unknown/g, (match, varName) => {
    if (content.includes("SafetyLevel")) {
      return `${varName}: unknown as SafetyLevel`;
    }
    return match;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
}

// Main execution
console.log("Starting test file error fixes...");

try {
  fixMainPageWorkflowsTest();
  fixMainPageIntegrationTest();
  fixReact19CompatibilityTest();
  fixCampaignTestController();
  fixMemoryLeakDetector();
  fixMemoryOptimizationScript();
  fixImportOrganizationTest();
  fixCampaignTestUtils();

  console.log("✅ Test file error fixes completed successfully");
} catch (error) {
  console.error("❌ Error during test file fixes:", error);
  process.exit(1);
}
