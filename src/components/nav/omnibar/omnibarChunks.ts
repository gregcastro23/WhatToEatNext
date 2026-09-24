/**
 * The omnibar's lazy half, one `import()` per chunk (plan D3). Kept in a
 * module of its own so tests can load the chunks through Jest's registry
 * (a native dynamic import there would load a second copy of React).
 */
export const loadDropdown = (): Promise<typeof import("./OmnibarDropdown")> => import("./OmnibarDropdown");
export const loadSheet = (): Promise<typeof import("./OmnibarSheet")> => import("./OmnibarSheet");
