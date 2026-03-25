/**
 * Cloudflare Proxy: /api/alchm-quantities
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST } = createProxyHandlers({ path: "/api/alchm-quantities" });
