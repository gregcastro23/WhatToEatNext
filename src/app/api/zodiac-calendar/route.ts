/**
 * Cloudflare Proxy: /api/zodiac-calendar
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({ path: "/api/zodiac-calendar" });
