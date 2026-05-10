// Drop this file into ~/.config/opencode/plugins/saia.ts
// and add "plugin": ["./saia"] to ~/.config/opencode/opencode.json

// @ts-ignore — plugin runs inside opencode's bundled runtime
import { refreshSaiaConfig } from "./lib/refresh-config.mjs"

export default async ({ client }: { client: any }) => {
  // fire-and-forget: never block startup, never throw
  ;(async () => {
    try {
      const result = await refreshSaiaConfig()
      await client.app.log({
        body: { service: "saia", level: "info", message: `refreshed ${result.modelCount} models` },
      })
    } catch { /* silent on all errors */ }
  })()
  return {}
}
