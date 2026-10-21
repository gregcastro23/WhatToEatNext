/** Bun's appended payload can invalidate the inherited macOS ad-hoc signature. */
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

if (process.platform === "darwin") {
  const binary = resolve(import.meta.dir, "../bin/alchm-mcp");
  execFileSync("codesign", ["--force", "--sign", "-", binary], {
    stdio: "inherit",
  });
  execFileSync("codesign", ["--verify", "--verbose=2", binary], {
    stdio: "inherit",
  });
}
