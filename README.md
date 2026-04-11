# SAIA Configuration Manager for OpenCode

Complete system for managing SAIA (GWDG Chat AI) configuration across multiple OpenCode projects.

**Repository:** https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin

## Overview

This package provides three components for SAIA integration:

1. **`generate-saia-config.sh`** - Fetches latest SAIA models from API and updates master configuration
2. **`copy-saia-config.sh`** - Copies master configuration to any project directory
3. **`src/saia.ts`** - OpenCode plugin that automatically updates and copies configuration on startup
4. **`opencode-saia.json`** - Master configuration file with all SAIA models and permissions

## What It Does

- **Automatic Updates**: Fetches latest SAIA models from GWDG Chat AI API
- **Master Configuration**: Stores the most up-to-date SAIA configuration centrally
- **Fast Deployment**: Quickly copies configuration to any project directory
- **Plugin Automation**: Automatically updates and copies when OpenCode starts
- **Full Permissions**: Includes all necessary OpenCode permissions for SAIA

## Installation

### Clone the Repository

```bash
git clone https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin.git
cd opencode-saia-plugin
```

### Install the Plugin

```bash
# Copy the entire src directory to OpenCode plugins (recommended)
cp -r src ~/.config/opencode/plugins/saia

# Make the scripts executable
chmod +x ~/.config/opencode/plugins/saia/generate-saia-config.sh
chmod +x ~/.config/opencode/plugins/saia/copy-saia-config.sh
```

### Configure Environment Variables

Add the following to your `~/.bashrc` or `~/.zshrc` to permanently set the SAIA API key and OpenCode location:

```bash
# SAIA API Key
export SAIA_API_KEY="your_api_key_here"

# OpenCode location (if not already in PATH)
export PATH="$PATH:/path/to/opencode"
```

Then reload your shell configuration:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

This copies the plugin along with all its scripts and configuration to `~/.config/opencode/plugins/saia/`. The plugin references the scripts from the same directory, so everything works self-contained.

## Quick Start

### Automatic (Recommended - Plugin)

Install the plugin and let it handle everything automatically:

```bash
# Install the plugin
cp -r src ~/.config/opencode/plugins/saia

# Make the scripts executable
chmod +x ~/.config/opencode/plugins/saia/generate-saia-config.sh
chmod +x ~/.config/opencode/plugins/saia/copy-saia-config.sh

# Set SAIA_API_KEY (if not already set)
export SAIA_API_KEY=your_key

# Start OpenCode in any directory
cd /path/to/your/project
opencode
```

**The plugin will:**
1. Fetch latest SAIA models from API
2. Update master configuration
3. Copy configuration to current directory
4. Show logs indicating success

### Manual (Scripts Only)

Use the scripts directly from the src directory:

```bash
# Step 1: Update master configuration with latest models
cd src
./generate-saia-config.sh

# Step 2: Copy to your project directory
cd /path/to/your/project
/path/to/opencode-saia-plugin/src/copy-saia-config.sh
```

## Files

All files are located in the `src/` directory:

### Scripts

- **`src/generate-saia-config.sh`**
  - Fetches latest SAIA models from `https://chat-ai.academiccloud.de/v1/models`
  - Generates complete `opencode.json` with SAIA provider, models, and permissions
  - Updates master configuration: `opencode-saia.json`
  - Shows model count and update status

- **`src/copy-saia-config.sh`**
  - Copies master configuration to current directory as `opencode.json`
  - Fast operation (no API calls)
  - Shows model count

### Plugin

- **`src/saia.ts`**
  - OpenCode plugin that runs both scripts automatically
  - Triggers when OpenCode starts in any directory
  - Always ensures latest models are available
  - Shows detailed logs
  - References scripts from the same directory

### Configuration

- **`src/opencode-saia.json`**
  - Master configuration file
  - Contains all 25+ SAIA models with descriptions
  - Includes full OpenCode permissions
  - Updated when new models are available

## Console Output

### When Plugin Runs

```
[SAIA Plugin] Updating SAIA configuration...
[SAIA Plugin] Running generate script to update master configuration...
[INFO] Fetching latest SAIA models...
[INFO] Found 25 SAIA models
[INFO] Master configuration is up to date (25 models)
[INFO] Generating opencode.json...
[INFO] Master configuration updated: /home/jaison/Documents/opencodesaia/opencode/packages/plugin/opencode-saia.json
[INFO] Copied opencode.json to current directory
[INFO] SAIA models are now available in this directory!
[SAIA Plugin] Running copy script to current directory...
[INFO] Master configuration has 25 SAIA models
[INFO] Copied opencode.json to current directory
[INFO] SAIA models are now available in this directory!
[SAIA Plugin] SAIA configuration updated and copied successfully
```

### When Running Generate Script

```
[INFO] Fetching latest SAIA models...
[INFO] Found 25 SAIA models
[INFO] Master configuration is up to date (25 models)
[INFO] Generating opencode.json...
[INFO] Master configuration updated: /path/to/opencode-saia.json
[INFO] Copied opencode.json to current directory
[INFO] SAIA models are now available in this directory!
```

### When Running Copy Script

```
[INFO] Master configuration has 25 SAIA models
[INFO] Copied opencode.json to current directory
[INFO] SAIA models are now available in this directory!
```

## Requirements

- **SAIA_API_KEY** environment variable (required for fetching models)
- **curl** (for fetching models from SAIA API)
- **jq** (for JSON processing)

## Configuration

The generated `opencode.json` includes:

- **SAIA Provider**: Configured with GWDG Chat AI endpoint
- **25+ Models**: All available SAIA models with categorized descriptions
- **Full Permissions**: bash, edit, read, grep, glob, list, lsp, skill, task, webfetch, websearch, codesearch, question
- **Default Model**: `saia/glm-4.7`

## Model Categories

Models are automatically categorized:

- **Planning - Advanced Reasoning**: Thinking and reasoning models (DeepSeek-R1, etc.)
- **Building - Specialized Coding**: Coder-specific models
- **Planning - Large Context**: Large context window models (120B, 235B, 675B)
- **Building - Agentic Coding**: Agentic coding models (GLM-4.7, Devstral)
- **General Purpose**: All other models

## Benefits

- **Always Up to Date**: Fetches latest models on every OpenCode startup (with plugin)
- **Fast Deployment**: Copy script is instant (no API calls)
- **Consistent**: All projects use the same master configuration
- **Easy Updates**: Update once, deploy to many projects
- **No Core Modifications**: Doesn't patch OpenCode's source code
- **Full Permissions**: Includes all necessary OpenCode permissions

## Workflow

### With Plugin (Automatic)

1. Install plugin once
2. Start OpenCode in any directory
3. Plugin automatically updates and copies configuration
4. SAIA models are available

### Without Plugin (Manual)

1. Run `generate-saia-config.sh` to update master configuration
2. Run `copy-saia-config.sh` in each project directory
3. Repeat step 1 when new models are available

## Troubleshooting

### Plugin Not Working

If the plugin doesn't create `opencode.json`:
1. Check if plugin directory exists: `ls ~/.config/opencode/plugins/saia`
2. Check if scripts exist in the plugin directory: `ls ~/.config/opencode/plugins/saia/`
3. Check SAIA_API_KEY is set: `echo $SAIA_API_KEY`
4. Check if master config exists: `ls ~/.config/opencode/plugins/saia/opencode-saia.json`

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
3. Consider using the SAIA fork for full integration: `/home/jaison/Documents/opencodesaia/install.sh`

## Location

**GitLab Repository:** https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin

All files are located in the `src/` directory of the repository.

**Clone the repository:**
```bash
git clone https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin.git
cd opencode-saia-plugin
```

## Alternative: Full SAIA Integration

For complete SAIA integration with OpenCode core code patches, use the SAIA fork:

```bash
cd /home/jaison/Documents/opencodesaia
./install.sh
```

This provides:
- Patched OpenCode core code
- SAIA custom loader
- Full provider registry integration
- All SAIA models appear in `/model` command
