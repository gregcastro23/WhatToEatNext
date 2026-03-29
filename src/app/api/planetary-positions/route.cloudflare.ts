/**
 * Cloudflare Proxy: /api/planetary-positions
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({ path: "/api/planetary-positions" });
