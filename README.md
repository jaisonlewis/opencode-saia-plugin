# SAIA Plugin for OpenCode

Drop `saia.ts` into `~/.config/opencode/plugins/`, set `SAIA_API_KEY`, launch `opencode`. The plugin keeps your global `~/.config/opencode/opencode.json` in sync with SAIA's current model list. OpenCode 1 refreshes in the background; OpenCode 2 awaits the refresh during plugin setup. The persisted model list is available on the next launch. Permissions (bash, edit, read, grep, etc.) are pre-added automatically so you don't have to configure them manually.

## Pre-setup

Before installing the plugin, ensure you have:

1. **OpenCode 1.18.29 or newer** (including OpenCode 2) - Download from [Opencode.ai](https://opencode.ai)
2. **SAIA API key** - Get from [SAIA AI](https://docs.hpc.gwdg.de/services/ai-services/saia/index.html#api-request)

## Version compatibility

One plugin file supports both APIs: OpenCode 1 calls `server()` and OpenCode 2 calls `setup()`. Both entry points share the same SAIA discovery logic.

**Minimum supported v1 version: 1.18.29.** Older v1 releases do not support the object entry point required for this shared format. They need a separate legacy release or entry point; renaming the file does not make it compatible.

Native plugin loading and model discovery were tested on Linux x64 with **1.18.29, 1.19.5, and 2.2.0**, using an offline model-catalog fixture. Other versions and platforms have not been tested. See [compatibility details and test instructions](docs/compatibility.md).

## Setup

### 1. Set SAIA_API_KEY

**Linux / macOS (permanent):**
```bash
echo 'export SAIA_API_KEY="your_api_key_here"' >> ~/.bashrc
source ~/.bashrc
```

Or for zsh:
```bash
echo 'export SAIA_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell — permanent):**
```powershell
[Environment]::SetEnvironmentVariable("SAIA_API_KEY", "your_api_key_here", "User")
```

### 2. Install the Plugin

**Linux / macOS (script):**
```bash
curl -fsSL https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/install.sh | bash
```

**Windows (PowerShell script):**
```powershell
Invoke-Expression (Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/install.ps1" -UseBasicParsing).Content
```

**Or install manually:**
```bash
mkdir -p ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/saia.ts \
  -o ~/.config/opencode/plugins/saia.ts
```

### 3. Launch

Both supported v1 and v2 releases automatically discover `saia.ts` in the plugins directory. No explicit registration is needed. Run:

```bash
opencode
```

If upgrading from an older installation, remove only the `"./saia"` entry from any `plugin` or `plugins` array in your config, leaving other plugins intact. OpenCode 2 requires explicitly configured local plugin paths to name directories; automatic discovery avoids that mismatch.

The first launch refreshes the persisted model list. Restart OpenCode to use newly discovered models. If the key is missing or discovery fails, the previous list is kept.

## Manual Refresh

If you want to refresh without restarting OpenCode (e.g., SAIA just added a model):

```bash
cd ~/.config/opencode/plugins
node generate-saia-config.mjs
```

Runs the same logic as the plugin, but logs to stdout and exits non-zero on failure.

## Files

| File | Purpose |
|------|---------|
| `src/saia.ts` | **The plugin** — single file, drop into `~/.config/opencode/plugins/` |
| `src/generate-saia-config.mjs` | Manual CLI — self-contained, for power users |
| `src/opencode-saia.json` | Example full config (reference / fallback snapshot) |

## How It Works

1. **Startup**: OpenCode automatically discovers `saia.ts` in its plugins directory
2. **Version-specific entry point**: V1 starts a background refresh and returns `{}`; V2 awaits refresh in `setup()`, bounded by the fetch timeout below
3. **Fetch**: `fetch()` to SAIA's `/v1/models` with a 3-second hard timeout (`AbortSignal.timeout`)
4. **Merge**: Reads existing `~/.config/opencode/opencode.json` and updates `provider.saia`, permissions, and the default model as described below
5. **Permissions**: Adds the standard SAIA permission set if missing (bash, edit, read, grep, glob, lsp, skill, task, webfetch, websearch, question, external_directory: ask, doom_loop: ask)
6. **Model selection**: Only changes `config.model` if empty or the chosen model disappeared
7. **Atomic write**: Skips unchanged content; otherwise writes to `.tmp`, then `fs.rename()` — avoids repeated config reloads and never leaves a half-written config
8. **Next launch**: Updated config is picked up on the next `opencode` start
9. **Silent failures**: Network errors or missing API key are swallowed. Worst case: yesterday's list stays for one more launch

## Requirements

- **OpenCode 1.18.29+ or OpenCode 2** (official install from [opencode.ai](https://opencode.ai))
- **Node.js** (already required by OpenCode)
- **SAIA_API_KEY** environment variable

No additional dependencies. Pure Node.js built-ins only.
