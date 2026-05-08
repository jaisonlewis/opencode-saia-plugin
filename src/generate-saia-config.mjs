#!/usr/bin/env node
/**
 * SAIA Configuration Generator (Cross-Platform)
 *
 * Fetches latest SAIA models from API and generates master configuration.
 * Works on Linux, macOS, and Windows (Node.js 18+).
 */

import { writeFileSync, readFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { get } from "https"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MASTER_CONFIG = join(__dirname, "opencode-saia.json")
const SAIA_API_KEY = process.env.SAIA_API_KEY || ""

const RED = "\x1b[31m"
const GREEN = "\x1b[32m"
const NC = "\x1b[0m"

function printInfo(msg) {
  console.log(`${GREEN}[INFO]${NC} ${msg}`)
}

function printError(msg) {
  console.error(`${RED}[ERROR]${NC} ${msg}`)
  process.exitCode = 1
}

if (!SAIA_API_KEY) {
  printError("SAIA_API_KEY environment variable not set")
  console.error("Please set it with: export SAIA_API_KEY=your_key  (Linux/macOS)")
  console.error("                 or: $env:SAIA_API_KEY = 'your_key'  (PowerShell)")
  console.error("                 or: set SAIA_API_KEY=your_key       (CMD)")
  process.exit(1)
}

function fetchModels() {
  return new Promise((resolve, reject) => {
    const req = get("https://chat-ai.academiccloud.de/v1/models", {
      headers: {
        Authorization: `Bearer ${SAIA_API_KEY}`,
      },
      timeout: 30000,
    }, (res) => {
      let data = ""
      res.on("data", (chunk) => { data += chunk })
      res.on("end", () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 200)}`))
          return
        }
        try {
          const json = JSON.parse(data)
          if (!Array.isArray(json.data)) {
            reject(new Error("API response missing .data array"))
            return
          }
          resolve(json)
        } catch (err) {
          reject(new Error(`Invalid JSON: ${err.message}`))
        }
      })
    })
    req.on("error", reject)
    req.on("timeout", () => {
      req.destroy()
      reject(new Error("Request timed out after 30s"))
    })
  })
}

function categorizeModel(id) {
  if (/thinking|reasoning|r1/i.test(id)) return "Planning - Advanced Reasoning"
  if (/coder/i.test(id)) return "Building - Specialized Coding"
  if (/large|120b|235b|675b/i.test(id)) return "Planning - Large Context"
  if (/glm-4\.7|devstral/i.test(id)) return "Building - Agentic Coding"
  return "General Purpose"
}

async function main() {
  printInfo("Fetching latest SAIA models...")

  let modelsJson
  try {
    modelsJson = await fetchModels()
  } catch (err) {
    printError(`Failed to fetch models: ${err.message}`)
    process.exit(1)
  }

  const models = modelsJson.data
  printInfo(`Found ${models.length} SAIA models`)

  const modelsObj = {}
  for (const m of models) {
    const id = m.id
    const desc = categorizeModel(id)
    modelsObj[id] = { name: `${id} (${desc})` }
  }

  const oldCount = existsSync(MASTER_CONFIG)
    ? (() => {
        try {
          const old = JSON.parse(readFileSync(MASTER_CONFIG, "utf8"))
          return Object.keys(old.provider?.saia?.models || {}).length
        } catch {
          return 0
        }
      })()
    : 0

  if (oldCount === models.length) {
    printInfo(`Master configuration is up to date (${models.length} models)`)
  } else {
    printInfo(`Updating master configuration (${oldCount} -> ${models.length} models)`)
  }

  const config = {
    "$schema": "https://opencode.ai/config.json",
    permission: {
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
    },
    formatter: true,
    model: "saia/glm-4.7",
    provider: {
      saia: {
        npm: "@ai-sdk/openai-compatible",
        name: "SAIA (GWDG Chat AI)",
        options: {
          baseURL: "https://chat-ai.academiccloud.de/v1",
          apiKey: "{env:SAIA_API_KEY}",
        },
        models: modelsObj,
      },
    },
  }

  writeFileSync(MASTER_CONFIG, JSON.stringify(config, null, 2) + "\n")
  printInfo(`Master configuration updated: ${MASTER_CONFIG}`)

  // Copy to current directory (silent overwrite by design)
  const cwd = process.cwd()
  const target = join(cwd, "opencode.json")
  writeFileSync(target, JSON.stringify(config, null, 2) + "\n")
  printInfo("Copied opencode.json to current directory")
  printInfo("SAIA models are now available in this directory!")
}

main().catch((err) => {
  printError(err.message)
  process.exit(1)
})
