/**
 * /sauces?focus= (omnibar Phase 4): every link search emits resolves on the
 * page, hand-typed spellings are forgiven, and anything else is no focus.
 */
import { allSauces } from "@/data/sauces";
import { resolveSauceFocus, sauceHref } from "../sauceFocus";

const KEYS = Object.keys(allSauces);

describe("sauce focus links", () => {
  it.each(KEYS)("the search link for %s opens that sauce", (key) => {
    const focus = new URL(sauceHref(key), "https://alchm.kitchen").searchParams.get("focus") ?? undefined;
    expect(resolveSauceFocus(focus, KEYS)).toBe(key);
  });

  it.each([
    ["thaiGreenCurry", "thaiGreenCurry"],
    ["thai-green-curry", "thaiGreenCurry"],
    ["THAI GREEN CURRY", "thaiGreenCurry"],
    [["carbonara", "pesto"], "carbonara"],
  ])("%p → %s", (param, key) => {
    expect(resolveSauceFocus(param, KEYS)).toBe(key);
  });

  it.each([undefined, "", "nope", "carbonar"])("%p is no focus", (param) => {
    expect(resolveSauceFocus(param, KEYS)).toBeNull();
  });
});
