import { _logger } from "@/lib/logger";

/**
 * Olo Service Interface
 *
 * Stub service to resolve compiler issues for the restaurant menu proxy.
 */
export const oloService = {
  isConfigured(): boolean {
    return !!process.env.OLO_API_KEY;
  },
  async getMenu(oloRestaurantId: string): Promise<unknown> {
    _logger.warn(`[OloService] getMenu called for ${oloRestaurantId} but integration is not active.`);
    return null;
  }
};
