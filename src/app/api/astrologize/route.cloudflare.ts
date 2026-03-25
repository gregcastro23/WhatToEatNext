/**
 * Cloudflare Proxy: /api/astrologize
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST } = createProxyHandlers({ path: "/api/astrologize" });
