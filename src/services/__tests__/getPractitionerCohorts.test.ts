/**
 * @jest-environment node
 *
 * Regression guard for the Practitioner Cohorts panel. It must report:
 *  - paidPro from the SAME revenue breakdown that drives the Commerce MRR panel
 *    (Stripe-backed payers only) — never the ~950 comp/provisioned premium subs,
 *    which used to make "Paid Pro" contradict "MRR $0".
 *  - onboarded + elemental from the canonical user_profiles columns, NOT the
 *    vestigial users.profile JSONB (which showed ~61 onboarded / 99.6% Unknown).
 */

jest.mock("@/lib/database", () => ({ executeQuery: jest.fn() }));
jest.mock("@/services/subscriptionRevenueService", () => ({
  getSubscriptionRevenueBreakdown: jest.fn(),
}));

import { executeQuery } from "@/lib/database";
import { getSubscriptionRevenueBreakdown } from "@/services/subscriptionRevenueService";
import { getPractitionerCohorts } from "@/services/dashboardPanelsService";

const mockQ = executeQuery as jest.Mock;
const mockRev = getSubscriptionRevenueBreakdown as jest.Mock;

describe("getPractitionerCohorts", () => {
  beforeEach(() => jest.clearAllMocks());

  it("uses canonical sources + revenue paidSubs (never JSONB, never all-active subs)", async () => {
    // 955 provisioned premium, 0 paying — the trap the old query fell into.
    mockRev.mockResolvedValue({ paidSubs: 0, provisionedSubs: 955, mrr: 0 });
    mockQ.mockImplementation((sql: string) => {
      if (/FROM users\b/.test(sql) && /is_active/.test(sql))
        return Promise.resolve({ rows: [{ count: 200 }] }); // active
      if (/FROM users\b/.test(sql))
        return Promise.resolve({ rows: [{ count: 4528 }] }); // total signups
      if (/user_profiles/.test(sql) && /onboarding_completed/.test(sql))
        return Promise.resolve({ rows: [{ count: 5 }] });
      if (/user_interactions/.test(sql))
        return Promise.resolve({ rows: [{ count: 3 }] });
      if (/dominant_element/.test(sql))
        return Promise.resolve({
          rows: [
            { element: "Fire", count: 918 },
            { element: "Earth", count: 921 },
          ],
        });
      return Promise.resolve({ rows: [{ count: 0 }] });
    });

    const result = await getPractitionerCohorts();

    expect(result.funnel.paidPro).toBe(0); // from revenue.paidSubs, NOT 955
    expect(result.funnel.onboarded).toBe(5); // canonical onboarding_completed
    expect(result.funnel.signup).toBe(4528);
    expect(result.elementalBreakdown).toEqual([
      { element: "Fire", count: 918 },
      { element: "Earth", count: 921 },
    ]);

    // The vestigial users.profile JSONB must NOT be queried for cohorts.
    const sqls = mockQ.mock.calls.map((c) => String(c[0]));
    expect(sqls.some((s) => /profile->/.test(s))).toBe(false);
  });
});
