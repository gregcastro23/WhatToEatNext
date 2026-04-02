/**
 * Cloudflare Proxy: /api/group-recommendations
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({ path: "/api/group-recommendations" });
