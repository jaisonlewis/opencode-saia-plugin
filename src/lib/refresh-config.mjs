/**
 * Shared SAIA config refresh logic
 *
 * Used by both the plugin (saia.ts) and the manual CLI (generate-saia-config.mjs).
 */

import path from "node:path"
import os from "node:os"
import fs from "node:fs/promises"

const CONFIG = path.join(os.homedir(), ".config", "opencode", "opencode.json")
const ENDPOINT = "https://chat-ai.academiccloud.de/v1/models"

const PERMISSIONS = {
  bash: "allow",
  edit: "allow",
  read: "allow",
  grep: "allow",
  glob: "allow",
  lsp: "allow",
  skill: "allow",
  task: "allow",
  webfetch: "allow",
  websearch: "allow",
  question: "allow",
  external_directory: "ask",
  doom_loop: "ask",
}

/**
 * Fetch SAIA models, merge into global opencode.json, return metadata.
 * @returns {{ modelCount: number, path: string }}
 */
export async function refreshSaiaConfig() {
  const apiKey = process.env.SAIA_API_KEY
  if (!apiKey) {
    throw new Error("SAIA_API_KEY not set")
  }

  const res = await fetch(ENDPOINT, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from SAIA API`)
  }

  const { data } = await res.json()
  const modelIds = data.map(m => m.id)

  let config = {}
  try {
    config = JSON.parse(await fs.readFile(CONFIG, "utf8"))
  } catch { /* missing or corrupt, start fresh */ }

  const models = {}
  for (const id of modelIds) {
    models[id] = { name: id, options: { "enable-tools": true } }
  }

  config.$schema ??= "https://opencode.ai/config.json"
  config.permission = { ...PERMISSIONS, ...(config.permission || {}) }
  config.provider ??= {}
  config.provider.saia = {
    npm: "@ai-sdk/openai-compatible",
    name: "SAIA (GWDG Chat AI)",
    options: {
      baseURL: "https://chat-ai.academiccloud.de/v1",
      apiKey: "{env:SAIA_API_KEY}",
      headers: { "inference-service": "saia-openai-gateway" },
    },
    models,
  }

  const current = config.model
  const currentIsSaia = typeof current === "string" && current.startsWith("saia/")
  const currentModelId = currentIsSaia ? current.slice(5) : null
  if (!current || (currentIsSaia && !modelIds.includes(currentModelId))) {
    config.model = modelIds.includes("glm-4.7") ? "saia/glm-4.7" : `saia/${modelIds[0]}`
  }

  const tmp = CONFIG + ".tmp"
  await fs.writeFile(tmp, JSON.stringify(config, null, 2) + "\n")
  await fs.rename(tmp, CONFIG)

  return { modelCount: modelIds.length, path: CONFIG }
}
