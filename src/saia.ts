import { execSync } from "child_process"
import { existsSync } from "fs"
import { join, dirname } from "path"

/**
 * SAIA Plugin for OpenCode (Experimental)
 *
 * Intended to automatically update and copy SAIA configuration on startup.
 * NOTE: Auto-loading of .ts plugins from ~/.config/opencode/plugins/ is
 * not functional in OpenCode 1.4.7. Use the shell scripts directly instead:
 *   - generate-saia-config.sh (fetches latest models from API)
 *   - copy-saia-config.sh (copies master config to current directory)
 */

export const SAIAPlugin = async ({ directory }: { directory: string }) => {
  console.log("[SAIA Plugin] Updating SAIA configuration...")

  const pluginDir = dirname(__filename)
  const generateScript = join(pluginDir, "generate-saia-config.sh")
  const copyScript = join(pluginDir, "copy-saia-config.sh")

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
    execSync(generateScript, {
      cwd: pluginDir,
      stdio: "inherit"
    })
  } catch (error) {
    console.error("[SAIA Plugin] Failed to generate SAIA configuration:", error)
  }

  try {
    console.log("[SAIA Plugin] Running copy script...")
    execSync(copyScript, {
      cwd: directory,
      stdio: "inherit"
    })
    console.log("[SAIA Plugin] SAIA configuration updated and copied successfully")
  } catch (error) {
    console.error("[SAIA Plugin] Failed to copy SAIA configuration:", error)
  }

  return {}
}
