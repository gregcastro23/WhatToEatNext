/**
 * Test helper: make `useHardenedPolling` actually poll under jsdom.
 *
 * jest.config.js sets `testEnvironmentOptions.pretendToBeVisual: false`, which
 * leaves jsdom in its default document state: `visibilityState === "prerender"`
 * and therefore `document.hidden === true`.
 *
 * `useHardenedPolling` is visibility-aware by design — it skips a poll while
 * the tab is hidden so backgrounded operator tabs stop hammering the API. Under
 * jsdom that guard is always tripped, so a panel rendered in a test never
 * fetches and sits on its loading state forever. The symptom is a `waitFor`
 * timeout against a DOM still showing "Loading…", with no error and no clue
 * that visibility was the cause.
 *
 * Call `makeDocumentVisible()` in a `beforeAll` for any suite that renders a
 * polling panel. It poisons the two getters directly rather than trusting the
 * ambient environment, so the suite tests the panel's own behavior instead of
 * jsdom's defaults.
 */

let restore: (() => void) | null = null;

/**
 * Force `document.hidden === false` / `visibilityState === "visible"` for the
 * duration of a suite. Returns a restore function; also idempotent, so calling
 * it twice will not stack descriptors.
 */
export function makeDocumentVisible(): () => void {
  if (restore) return restore;

  const hiddenDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "hidden",
  );
  const stateDescriptor = Object.getOwnPropertyDescriptor(
    Document.prototype,
    "visibilityState",
  );

  Object.defineProperty(document, "hidden", {
    configurable: true,
    get: () => false,
  });
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => "visible",
  });

  restore = () => {
    delete (document as unknown as Record<string, unknown>).hidden;
    delete (document as unknown as Record<string, unknown>).visibilityState;
    if (hiddenDescriptor) {
      Object.defineProperty(Document.prototype, "hidden", hiddenDescriptor);
    }
    if (stateDescriptor) {
      Object.defineProperty(
        Document.prototype,
        "visibilityState",
        stateDescriptor,
      );
    }
    restore = null;
  };

  return restore;
}
