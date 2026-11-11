/**
 * Tests to verify React Rules of Hooks compliance in components
 * that previously had try-catch wrapping hook calls (the primary crash cause).
 */
import fs from "fs";
import path from "path";

describe("EnhancedCookingMethodRecommender — hooks compliance", () => {
  it("does not wrap useAlchemical in try-catch", () => {
    const source = fs.readFileSync(
      path.join(
        process.cwd(),
        "src/components/recommendations/EnhancedCookingMethodRecommender.tsx",
      ),
      "utf8",
    );

    // The old crashing pattern — must NOT exist
    expect(source).not.toMatch(/try\s*\{[\s\S]*?useAlchemical\(\)[\s\S]*?\}\s*catch/);
  });
});
