// Re-export contexts to provide a consistent API
export * from "./AlchemicalContext";
export * from "./ChartContext";
export * from "./PopupContext";
export * from "./TarotContext";
export * from "./ThemeContext";

// Re-export commonly used hooks from contexts
export { useAstrologicalState } from "../hooks/useAstrologicalState";

// Server-safe exports
import * as alchemicalServer from "./AlchemicalContext/server";

export const _serverExports = {
  alchemical: alchemicalServer,
};
