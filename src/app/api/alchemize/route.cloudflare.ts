/**
 * Cloudflare Proxy: /api/alchemize
 * Lightweight proxy for Cloudflare deployment
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({
  path: "/api/alchemize",
  methods: ["GET", "POST"],
});
