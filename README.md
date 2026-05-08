# SAIA Configuration Manager for OpenCode

Complete system for managing SAIA (GWDG Chat AI) configuration across multiple OpenCode projects.

**Repository:** https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin

## Overview

This package provides scripts and configuration for SAIA integration:

1. **`generate-saia-config.sh`** - Bash: fetches latest SAIA models and updates master configuration
2. **`copy-saia-config.sh`** - Bash: copies master configuration to any project directory
3. **`generate-saia-config.mjs`** - Node.js: cross-platform version (Linux/macOS/Windows)
4. **`copy-saia-config.mjs`** - Node.js: cross-platform version (Linux/macOS/Windows)
5. **`src/saia.ts`** - Experimental OpenCode plugin (auto-loading not functional in OpenCode 1.4.7)
6. **`opencode-saia.json`** - Master configuration file with all SAIA models and permissions

## What It Does

- **Automatic Updates**: Fetches latest SAIA models from GWDG Chat AI API
- **Master Configuration**: Stores the most up-to-date SAIA configuration centrally
- **Fast Deployment**: Quickly copies configuration to any project directory
- **Cross-Platform**: Node.js scripts work on Linux, macOS, and Windows
- **Full Permissions**: Includes all necessary OpenCode permissions for SAIA
- **Formatters Enabled**: Automatic code formatting via OpenCode built-in formatters

## Installation

Install official version of Opencode from https://opencode.ai/

### Clone the Repository

```bash
git clone https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin.git
cd opencode-saia-plugin
```

### Configure Environment Variables

Add the following to your `~/.bashrc` or `~/.zshrc`:

```bash
export SAIA_API_KEY="your_api_key_here"
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

## Quick Start

### Linux / macOS (Bash)

Copy the scripts to a location in your PATH for easy access:

```bash
# One-time setup
cp src/generate-saia-config.sh ~/.local/bin/
cp src/copy-saia-config.sh ~/.local/bin/
chmod +x ~/.local/bin/generate-saia-config.sh ~/.local/bin/copy-saia-config.sh

# Or use them directly from the repo
cd /path/to/opencode-saia-plugin/src

# Update master config (requires SAIA_API_KEY)
./generate-saia-config.sh

# Copy to any project directory
./copy-saia-config.sh
```

The `copy-saia-config.sh` script copies the master `opencode-saia.json` to the current directory as `opencode.json`. Start OpenCode in that directory — SAIA models will be available.

### Windows / Cross-Platform (Node.js)

The `.mjs` scripts work on any OS with Node.js (already required for OpenCode):

```bash
# Or use them directly from the repo
cd /path/to/opencode-saia-plugin/src

# Update master config (requires SAIA_API_KEY)
node generate-saia-config.mjs

# Copy to any project directory
node copy-saia-config.mjs
```

On Windows PowerShell:
```powershell
cd C:\path\to\opencode-saia-plugin\src
node generate-saia-config.mjs
node copy-saia-config.mjs
```

## Files

All files are located in the `src/` directory:

### Scripts

- **`src/generate-saia-config.sh`** (Linux/macOS)
  - Fetches latest SAIA models from `https://chat-ai.academiccloud.de/v1/models`
  - Generates complete `opencode.json` with SAIA provider, models, and permissions
  - Updates master configuration: `opencode-saia.json`
  - Shows model count and update status

- **`src/copy-saia-config.sh`** (Linux/macOS)
  - Copies master configuration to current directory as `opencode.json`
  - Fast operation (no API calls)
  - Shows model count

- **`src/generate-saia-config.mjs`** (Cross-platform)
  - Node.js equivalent of the bash script
  - No external dependencies beyond Node.js itself
  - Works on Linux, macOS, and Windows

- **`src/copy-saia-config.mjs`** (Cross-platform)
  - Node.js equivalent of the bash script
  - Works on Linux, macOS, and Windows

### Plugin (Experimental)

- **`src/saia.ts`**
  - OpenCode plugin intended to run both scripts automatically on startup
  - Currently non-functional: OpenCode 1.4.7 does not auto-execute `.ts` plugins from `~/.config/opencode/plugins/`
  - Use the shell scripts directly instead

### Configuration

- **`src/opencode-saia.json`**
  - Master configuration file
  - Contains all 21 SAIA models with descriptions
  - Includes full OpenCode permissions
  - Updated when new models are available

## Requirements

- **SAIA_API_KEY** environment variable (required for fetching models)
- **curl** (for bash scripts — fetching models from SAIA API)
- **jq** (for bash scripts — JSON processing)
- **Node.js** (for `.mjs` scripts — already required by OpenCode)

## Configuration

The generated `opencode.json` includes:

- **SAIA Provider**: Configured with GWDG Chat AI endpoint
- **21 Models**: All available SAIA models with categorized descriptions
- **Full Permissions**: bash, edit, read, grep, glob, lsp, skill, task, webfetch, websearch, question, external_directory, doom_loop
- **Default Model**: `saia/glm-4.7`

## Model Categories

Models are automatically categorized:

- **Planning - Advanced Reasoning**: Thinking and reasoning models (DeepSeek-R1, etc.)
- **Building - Specialized Coding**: Coder-specific models
- **Planning - Large Context**: Large context window models (120B, 235B, 675B)
- **Building - Agentic Coding**: Agentic coding models (GLM-4.7, Devstral)
- **General Purpose**: All other models

## Benefits

- **Always Up to Date**: Run `generate-saia-config.sh` to refresh models from the API
- **Fast Deployment**: `copy-saia-config.sh` is instant (no API calls)
- **Consistent**: All projects use the same master configuration
- **Easy Updates**: Update once, deploy to many projects
- **No Core Modifications**: Doesn't patch OpenCode's source code
- **Full Permissions**: Includes all necessary OpenCode permissions
- **Formatters Enabled**: Code formatting via OpenCode's built-in formatter support

## Workflow

1. Run `generate-saia-config.sh` to update master configuration with latest models
2. Run `copy-saia-config.sh` in each project directory where you want SAIA models
3. Start OpenCode in that directory
4. Repeat step 1 when new models are available

## Troubleshooting

### Models Not Available

If SAIA models don't appear in OpenCode:
1. Verify `opencode.json` exists in the project directory
2. Check the config is valid: `jq . opencode.json`
3. Ensure SAIA_API_KEY is set in the environment where you run OpenCode

### Script Fails

If a script fails:
1. Verify SAIA_API_KEY is set correctly
2. Check internet connectivity
3. Verify `curl` and `jq` are installed
4. Check SAIA API is accessible: `curl -H "Authorization: Bearer $SAIA_API_KEY" https://chat-ai.academiccloud.de/v1/models`

### Models Not Appearing in OpenCode

If SAIA models don't appear in OpenCode:
1. Verify `opencode.json` exists in the directory
2. Check that SAIA is in the provider registry
3. Consider using the SAIA fork for full integration (see Alternative section below)

## Location

**GitLab Repository:** https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin

All files are located in the `src/` directory of the repository.

**Clone the repository:**
```bash
git clone https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin.git
cd opencode-saia-plugin
```

## Alternative: Full SAIA Integration

This project works with the **standard OpenCode installation** from [opencode.ai](https://opencode.ai). No patches or forks are required — the shell scripts and `opencode.json` configuration are fully compatible with the official release.

For users who want deeper integration (e.g., SAIA models appearing in the `/model` command without a config file, or a custom provider loader), a patched OpenCode fork exists:

```bash
cd /path/to/opencode-fork
./install.sh
```

The fork provides:
- Patched OpenCode core code
- SAIA custom loader
- Full provider registry integration
- All SAIA models appear in `/model` command

**Most users should use the standard OpenCode + this project's scripts.**
