declare module "@opennextjs/cloudflare" {
  export function defineCloudflareConfig<T = Record<string, unknown>>(
    config: T,
  ): T & { buildCommand?: string };
}
