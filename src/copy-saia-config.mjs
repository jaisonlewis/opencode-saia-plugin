#!/usr/bin/env node
/**
 * SAIA Configuration Copier (Cross-Platform)
 *
 * Copies the master SAIA configuration to the current directory.
 * Works on Linux, macOS, and Windows (Node.js 18+).
 */

import { readFileSync, writeFileSync, existsSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MASTER_CONFIG = join(__dirname, "opencode-saia.json")

const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const NC = "\x1b[0m"

function printInfo(msg) {
  console.log(`${GREEN}[INFO]${NC} ${msg}`)
}

function printError(msg) {
  console.error(`${RED}[ERROR]${NC} ${msg}`)
}

if (!existsSync(MASTER_CONFIG)) {
  printError(`Master configuration not found at: ${MASTER_CONFIG}`)
  printInfo("Run generate-saia-config.mjs first to create the master configuration")
  process.exit(1)
}

let modelCount = 0
try {
  const config = JSON.parse(readFileSync(MASTER_CONFIG, "utf8"))
  modelCount = Object.keys(config.provider?.saia?.models || {}).length
} catch {
  // ignore parse errors, count stays 0
}

printInfo(`Master configuration has ${modelCount} SAIA models`)

const target = join(process.cwd(), "opencode.json")
writeFileSync(target, readFileSync(MASTER_CONFIG, "utf8"))
printInfo("Copied opencode.json to current directory")
printInfo("SAIA models are now available in this directory!")
