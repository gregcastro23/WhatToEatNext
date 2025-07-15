export async function resolveCSSModule(modulePath) {
  try {
    const module = await import(`@styles/${modulePath}`);
    return module.default || module;
  } catch (e) {
    // console.warn(`CSS Module not found: ${modulePath}`);
    return {};
  }
} 