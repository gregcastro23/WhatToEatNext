/**
 * Cloudflare Proxy: /api/food-diary
 */
import { createProxyHandlers } from "@/utils/createCloudflareProxy";
export const { GET, POST, PUT, DELETE } = createProxyHandlers({
  path: "/api/food-diary",
  methods: ["GET", "POST", "PUT", "DELETE"]
});
