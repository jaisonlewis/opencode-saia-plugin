import { existsSync } from "fs"
import { join, dirname } from "path"

/**
 * SAIA Plugin for OpenCode (Experimental)
 *
 * Intended to automatically update and copy SAIA configuration on startup.
 * When OpenCode loads this plugin, it calls the exported function with:
 *   - directory: current working directory
 *   - $: Bun shell API for cross-platform command execution
 *
 * NOTE: Auto-loading of .ts plugins from ~/.config/opencode/plugins/ is
 * not functional in OpenCode 1.4.7. Use the standalone scripts directly instead:
 *   - generate-saia-config.mjs (fetches latest models from API)
 *   - copy-saia-config.mjs (copies master config to current directory)
 */

export const SAIAPlugin = async (ctx: {
  directory: string
  $: (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>
}): Promise<Record<string, unknown>> => {
  const { directory, $ } = ctx
  console.log("[SAIA Plugin] Updating SAIA configuration...")

  const pluginDir = dirname(__filename)
  const generateScript = join(pluginDir, "generate-saia-config.mjs")
  const copyScript = join(pluginDir, "copy-saia-config.mjs")

  if (!existsSync(generateScript)) {
    console.error("[SAIA Plugin] Generate script not found at:", generateScript)
    return {}
  }

  if (!existsSync(copyScript)) {
    console.error("[SAIA Plugin] Copy script not found at:", copyScript)
    return {}
  }

  try {
    console.log("[SAIA Plugin] Running generate script...")
    await $`node ${generateScript}`
  } catch (error) {
    console.error("[SAIA Plugin] Failed to generate SAIA configuration:", error)
  }

  try {
    console.log("[SAIA Plugin] Running copy script...")
    await $`node ${copyScript}`
    console.log("[SAIA Plugin] SAIA configuration updated and copied successfully")
  } catch (error) {
    console.error("[SAIA Plugin] Failed to copy SAIA configuration:", error)
  }

  return {}
}
