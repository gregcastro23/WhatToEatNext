export function resolveCSSModule(modulePath) {
  try {
    return require(`@styles/${modulePath}`);
  } catch (e) {
    // console.warn(`CSS Module not found: ${modulePath}`);
    return {};
  }
} 