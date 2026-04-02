/**
 * Cloudflare Proxy: /api/recipes
 * Lightweight proxy for Cloudflare deployment
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({
  path: "/api/recipes",
  methods: ["GET", "POST"],
});
