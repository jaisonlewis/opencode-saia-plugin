import type { Plugin } from "./index"
import { execSync } from "child_process"
import { existsSync } from "fs"
import { join, dirname } from "path"

/**
 * SAIA Plugin for OpenCode
 * 
 * Automatically updates and copies SAIA configuration when OpenCode starts.
 */

export const SAIAPlugin: Plugin = async ({ directory }) => {
  console.log("[SAIA Plugin] Updating SAIA configuration...")
  
  // Get the plugin directory from the current file location
  const pluginDir = dirname(__filename)
  const generateScript = join(pluginDir, "..", "generate-saia-config.sh")
  const copyScript = join(pluginDir, "..", "copy-saia-config.sh")
  const scriptDir = dirname(generateScript)
  
  // Check if scripts exist
  if (!existsSync(generateScript)) {
    console.log("[SAIA Plugin] Generate script not found at:", generateScript)
    return {}
  }
  
  if (!existsSync(copyScript)) {
    console.log("[SAIA Plugin] Copy script not found at:", copyScript)
    return {}
  }
  
  try {
    // Step 1: Update master configuration with latest models
    console.log("[SAIA Plugin] Running generate script to update master configuration...")
    execSync(generateScript, { 
      cwd: scriptDir,
      stdio: "inherit"
    })
  } catch (error) {
    console.log("[SAIA Plugin] Failed to generate SAIA configuration:", error)
  }
  
  try {
    // Step 2: Copy to current directory
    console.log("[SAIA Plugin] Running copy script to current directory...")
    execSync(copyScript, { 
      cwd: directory || process.cwd(),
      stdio: "inherit"
    })
    console.log("[SAIA Plugin] SAIA configuration updated and copied successfully")
  } catch (error) {
    console.log("[SAIA Plugin] Failed to copy SAIA configuration:", error)
  }
  
  return {}
}
