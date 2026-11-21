/**
 * @jest-environment node
 *
 * The live ticket checklist must agree with the scorer: it may never show
 * every requirement met for a cut the scorer rejects, or the reverse.
 */
import { BUTCHER_CUTS, getCutById } from "@/data/butcher/cutsCatalogue";
import { satisfiesPhysicsConstraint } from "@/lib/butcher/science/butcherGame";
import { ORDER_TICKETS } from "@/lib/butcher/science/butcherTickets";
import { ticketCutChecks, ticketMethodCheck } from "@/lib/butcher/science/ticketChecklist";

describe("ticket checklist", () => {
  it("passes every cut check exactly when the scorer accepts the cut, for every ticket and cut", () => {
    for (const ticket of ORDER_TICKETS) {
      for (const cut of BUTCHER_CUTS) {
        const checklist = ticketCutChecks(ticket, cut).every((c) => c.met);
        const scorer = satisfiesPhysicsConstraint(cut, ticket).matches;
        expect({ ticket: ticket.id, cut: cut.id, ok: checklist }).toEqual({ ticket: ticket.id, cut: cut.id, ok: scorer });
      }
    }
  });

  it("names the failing requirement and the cut's actual value", () => {
    const ticket = ORDER_TICKETS.find((t) => t.id === "mst-high-marbling-sear");
    const spinalis = getCutById("spinalis-cap");
    expect(ticket && spinalis).toBeTruthy();
    if (!ticket || !spinalis) return;
    const fat = ticketCutChecks(ticket, spinalis).find((c) => c.id === "min-fat");
    expect(fat).toEqual({ id: "min-fat", label: "Fat ≥ 16.0 g", actual: "11.4 g", met: false });
  });

  it("checks the method against the ticket's target method", () => {
    const ticket = ORDER_TICKETS.find((t) => t.id === "mst-collagen-braise");
    expect(ticket).toBeDefined();
    if (!ticket) return;
    expect(ticketMethodCheck(ticket, "collagen-braise").met).toBe(true);
    expect(ticketMethodCheck(ticket, "reverse-sear").met).toBe(false);
  });
});
