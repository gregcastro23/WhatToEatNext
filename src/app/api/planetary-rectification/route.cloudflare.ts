/**
 * Cloudflare Proxy: /api/planetary-rectification
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST } = createProxyHandlers({ path: "/api/planetary-rectification" });
