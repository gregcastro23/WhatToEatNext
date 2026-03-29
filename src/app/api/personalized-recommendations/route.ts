/**
 * Cloudflare Proxy: /api/personalized-recommendations
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({ path: "/api/personalized-recommendations" });
