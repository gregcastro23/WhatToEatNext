/**
 * Cloudflare Proxy: /api/current-moment
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({ path: "/api/current-moment" });
