# SAIA Plugin for OpenCode

Drop `saia.ts` into `~/.config/opencode/plugins/`, set `SAIA_API_KEY`, launch `opencode`. The plugin keeps your global `~/.config/opencode/opencode.json` in sync with SAIA's current model list — refreshed in the background on every launch, with the new list available from the next launch onward. Permissions (bash, edit, read, grep, etc.) are pre-added automatically so you don't have to configure them manually.

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

### 3. Register the Plugin

Add to `~/.config/opencode/opencode.json` (create if missing):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./saia"]
}
```

The plugin adds permissions automatically on first run.

### 4. Launch

```bash
opencode
```

First launch refreshes the model list in the background. From then on, SAIA models are always current.

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

1. **Startup**: OpenCode loads the plugin because you registered `"plugin": ["./saia"]`
2. **Fire-and-forget**: Starts an async refresh, immediately returns `{}` — never blocks startup
3. **Fetch**: `fetch()` to SAIA's `/v1/models` with a 3-second hard timeout (`AbortSignal.timeout`)
4. **Merge**: Reads existing `~/.config/opencode/opencode.json`, only mutates `provider.saia`
5. **Permissions**: Adds the standard SAIA permission set if missing (bash, edit, read, grep, glob, lsp, skill, task, webfetch, websearch, question, external_directory: ask, doom_loop: ask)
6. **Model selection**: Only changes `config.model` if empty or the chosen model disappeared
7. **Atomic write**: Writes to `.tmp`, then `fs.rename()` — crash-safe, never half-written
8. **Next launch**: Updated config is picked up on the next `opencode` start
9. **Silent failures**: Network errors or missing API key are swallowed. Worst case: yesterday's list stays for one more launch

## Requirements

- **OpenCode** (official install from [opencode.ai](https://opencode.ai))
- **Node.js** (already required by OpenCode)
- **SAIA_API_KEY** environment variable

No additional dependencies. Pure Node.js built-ins only.
