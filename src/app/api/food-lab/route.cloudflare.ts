/**
 * Cloudflare Proxy: /api/food-lab
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST, PUT, DELETE } = createProxyHandlers({
  path: "/api/food-lab",
  methods: ["GET", "POST", "PUT", "DELETE"]
});
