/**
 * Cloudflare Proxy: /api/onboarding
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST, PUT } = createProxyHandlers({
  path: "/api/onboarding",
  methods: ["GET", "POST", "PUT"]
});
