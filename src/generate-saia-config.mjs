#!/usr/bin/env node
/**
 * Manual SAIA config refresh
 *
 * Fetches latest models and updates ~/.config/opencode/opencode.json.
 * Same logic as the plugin, but logs to stdout and exits non-zero on failure.
 */

import { refreshSaiaConfig } from "./lib/refresh-config.mjs"

const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const NC = "\x1b[0m"

function log(msg)  { console.log(`${GREEN}[INFO]${NC} ${msg}`) }
function err(msg)  { console.error(`${RED}[ERROR]${NC} ${msg}`) }

async function main() {
  const { modelCount, path } = await refreshSaiaConfig()
  log(`Refreshed ${modelCount} SAIA models → ${path}`)
}

main().catch((e) => {
  err(e.message)
  process.exit(1)
})
