/**
 * @jest-environment node
 *
 * The root layout's metadata is inherited by every page that does not set the
 * same field. A page-specific field set here is therefore a site-wide claim:
 * `alternates.canonical: "/"` made /recipes, /cuisines, /ingredients… each
 * name the homepage as their canonical, and `openGraph.url` made every share
 * card point at the homepage (production, 2026-09-25).
 */
import { metadata } from "../layout";

// Only the metadata export is under test; the layout's components and fonts
// are stubbed so the module can load in node. A new import the layout gains
// fails this suite loudly rather than letting it pass.
jest.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
jest.mock("@/components/analytics/PageViewTracker", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/auth/SignInModal", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/economy/TokenShopModal", () => ({ __esModule: true, default: () => null }));
jest.mock("@/components/grocery-cart/GroceryCartDrawer", () => ({ GroceryCartDrawer: () => null }));
jest.mock("@/components/nav/AppChrome", () => ({ AppChromeFooter: () => null, AppChromeTabBar: () => null }));
jest.mock("@/components/nav/MobileGlassTabBar", () => ({ MobileGlassTabBar: () => null }));
jest.mock("@/components/nav/NavigationProgress", () => ({ NavigationProgress: () => null }));
jest.mock("@/components/nav/RedesignedFooter", () => ({ RedesignedFooter: () => null }));
jest.mock("@/components/nav/RedesignedHeader", () => ({ RedesignedHeader: () => null }));
jest.mock("@/components/pwa/PwaRegistration", () => ({ __esModule: true, default: () => null }));
jest.mock("../ClientProviders", () => ({ __esModule: true, default: () => null }));
jest.mock("../fonts/cormorantGaramond", () => ({ cormorantGaramond: { variable: "" } }));
jest.mock("../fonts/jetbrainsMono", () => ({ jetbrainsMono: { variable: "" } }));
jest.mock("../fonts/manrope", () => ({ manrope: { variable: "" } }));
jest.mock("../globals.css", () => ({}));

describe("root layout metadata", () => {
  it("sets no canonical, which every page without its own would inherit", () => {
    expect(metadata.alternates?.canonical).toBeUndefined();
  });

  it("sets no og:url, which every share card without its own would inherit", () => {
    const openGraph = metadata.openGraph as { url?: unknown } | undefined;
    expect(openGraph).toBeDefined();
    expect(openGraph?.url).toBeUndefined();
  });

  it("still resolves relative page canonicals against the site", () => {
    expect(metadata.metadataBase?.origin).toMatch(/^https?:\/\//);
  });
});
