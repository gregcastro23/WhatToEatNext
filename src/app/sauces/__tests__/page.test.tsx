/**
 * /sauces?focus= (omnibar Phase 4): a focused sauce renders above the
 * recommender, server-side, with its key ingredients linked where they are
 * cards; one canonical /sauces either way; no focus changes nothing.
 */
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("../SaucesClient", () => ({ __esModule: true, default: () => null }));

import SaucesPage, { generateMetadata } from "../page";

async function html(focus?: string): Promise<string> {
  return renderToStaticMarkup(await SaucesPage({ searchParams: Promise.resolve(focus === undefined ? {} : { focus }) }));
}

describe("/sauces?focus=", () => {
  it("carbonara: the sauce card, with black pepper linked to its dossier", async () => {
    const page = await html("carbonara");
    expect(page).toContain('id="sauce-focus"');
    expect(page).toContain(">Carbonara</h2>");
    expect(page).toContain('href="/ingredients/black-pepper"');
    expect(page).toContain("Method");
  });

  it("a hand-typed spelling finds the sauce", async () => {
    expect(await html("thai-green-curry")).toContain('id="sauce-focus"');
  });

  it.each([undefined, "nope"])("focus %p renders the page as before, with no card", async (focus) => {
    const page = await html(focus);
    expect(page).not.toContain('id="sauce-focus"');
    expect(page).toContain("Cosmic Sauce Recommender");
  });

  it("titles the focused sauce and keeps one canonical /sauces", async () => {
    const focused = await generateMetadata({ searchParams: Promise.resolve({ focus: "carbonara" }) });
    const plain = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(focused.title).toBe("Carbonara · Sauces");
    expect(plain.title).toBe("Cosmic Sauce Recommender");
    expect(focused.alternates).toEqual({ canonical: "/sauces" });
    expect(plain.alternates).toEqual({ canonical: "/sauces" });
  });

  it("resolves canonical catalogue sauce IDs such as italian:mother:besciamella and japanese:mother:dashi", async () => {
    const besciamella = await html("italian:mother:besciamella");
    expect(besciamella).toContain('id="sauce-focus"');
    expect(besciamella).toContain(">Besciamella</h2>");

    const dashi = await html("japanese:mother:dashi");
    expect(dashi).toContain('id="sauce-focus"');
    expect(dashi).toContain(">Dashi</h2>");

    const dashiMeta = await generateMetadata({
      searchParams: Promise.resolve({ focus: "japanese:mother:dashi" }),
    });
    expect(dashiMeta.title).toBe("Dashi · Sauces");
    expect(dashiMeta.alternates).toEqual({ canonical: "/sauces" });
  });
});
