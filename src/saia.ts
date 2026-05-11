// Drop this file into ~/.config/opencode/plugins/saia.ts
// and add "plugin": ["./saia"] to ~/.config/opencode/opencode.json

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

export default async ({ client }: { client: any }) => {
  refreshSaiaConfig(client).catch(() => {})
  return {}
}

async function refreshSaiaConfig(client: any) {
  const apiKey = process.env.SAIA_API_KEY
  if (!apiKey) return

  const res = await fetch(ENDPOINT, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) return

  const { data } = await res.json() as { data: Array<{ id: string }> }
  const modelIds = data.map((m) => m.id).sort()
  if (modelIds.length === 0) return

  let config: any = {}
  try {
    config = JSON.parse(await fs.readFile(CONFIG, "utf8"))
  } catch { /* missing or invalid */ }

  const models: Record<string, any> = {}
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
    },
    models,
  }

  const current = config.model
  const currentIsSaia = typeof current === "string" && current.startsWith("saia/")
  const currentId = currentIsSaia ? current.slice(5) : null
  if (!current || (currentIsSaia && !modelIds.includes(currentId!))) {
    config.model = modelIds.includes("glm-4.7") ? "saia/glm-4.7" : `saia/${modelIds[0]}`
  }

  const tmp = CONFIG + ".tmp"
  await fs.writeFile(tmp, JSON.stringify(config, null, 2))
  await fs.rename(tmp, CONFIG)

  await client.app.log({
    body: { service: "saia", level: "info", message: `refreshed ${modelIds.length} models` },
  }).catch(() => {})
}
