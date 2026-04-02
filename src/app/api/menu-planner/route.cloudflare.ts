/**
 * Cloudflare Proxy: /api/menu-planner
 * Lightweight proxy for Cloudflare deployment
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";

export const { GET, POST } = createProxyHandlers({
  path: "/api/menu-planner",
  methods: ["GET", "POST"],
});
