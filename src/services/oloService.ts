/**
 * Olo Service Interface
 *
 * Stub service to resolve compiler issues for the restaurant menu proxy.
 */
export const oloService = {
  isConfigured(): boolean {
    return !!process.env.OLO_API_KEY;
  },
  async getMenu(oloRestaurantId: string): Promise<any> {
    console.warn(`[OloService] getMenu called for ${oloRestaurantId} but integration is not active.`);
    return null;
  }
};
