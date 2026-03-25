/**
 * Cloudflare Proxy: /api/generate-cosmic-recipe
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST } = createProxyHandlers({ path: "/api/generate-cosmic-recipe" });
