# SAIA Plugin for OpenCode

One-file plugin that keeps your SAIA (GWDG Chat AI) model list automatically refreshed in OpenCode.

**Repository:** https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin

## What It Does

- **Automatic Updates**: On every OpenCode launch, fetches the latest SAIA model list from the API
- **Global Config**: Updates `~/.config/opencode/opencode.json` so SAIA works in every directory
- **Preserves Your Settings**: Only touches `provider.saia` — never overwrites your permissions, agents, MCP servers, or chosen default model
- **Self-Healing**: If SAIA removes a model you had selected, it auto-switches to `glm-4.7` (or the first available model)
- **Zero Blocking**: 3-second hard timeout, fire-and-forget. A flaky network or SAIA outage never delays your OpenCode startup
- **Cross-Platform**: Pure Node.js — no curl, jq, or OS-specific wrappers needed

## One-Time Setup

### 1. Set SAIA_API_KEY

**Linux / macOS (Bash/Zsh):**
Add to your `~/.bashrc` or `~/.zshrc`:

```bash
export SAIA_API_KEY="your_api_key_here"
```

Then reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

**Windows (PowerShell — persistent):**
```powershell
[Environment]::SetEnvironmentVariable("SAIA_API_KEY", "your_api_key_here", "User")
```

**Windows (CMD — current session only):**
```cmd
set SAIA_API_KEY=your_api_key_here
```

### 2. Install the Plugin

```bash
mkdir -p ~/.config/opencode/plugins
curl -fsSL https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/saia.ts \
  -o ~/.config/opencode/plugins/saia.ts
```

### 3. Register the Plugin

Add this to `~/.config/opencode/opencode.json` (create the file if it doesn't exist):

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./saia"]
}
```

### 4. Add Permissions (Optional but Recommended)

If you want the same permission set everywhere, also add this to the global config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./saia"],
  "permission": {
    "bash": "allow",
    "edit": "allow",
    "read": "allow",
    "grep": "allow",
    "glob": "allow",
    "lsp": "allow",
    "skill": "allow",
    "task": "allow",
    "webfetch": "allow",
    "websearch": "allow",
    "question": "allow",
    "external_directory": "ask",
    "doom_loop": "ask"
  }
}
```

### 5. Launch OpenCode

```bash
cd ~/any-project
opencode
```

On first launch the plugin refreshes the model list in the background. From then on, SAIA models are always current.

## Manual Refresh (Without Launching OpenCode)

If you want to update the model list without starting OpenCode, use the standalone Node.js script:

```bash
cd ~/.config/opencode/plugins
node -e "$(curl -fsSL https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/generate-saia-config.mjs)"
```

Or clone the repo and run it locally:

```bash
git clone https://gitlab-ce.gwdg.de/jlewis/opencode-saia-plugin.git
cd opencode-saia-plugin/src
node generate-saia-config.mjs   # fetches latest models
node copy-saia-config.mjs        # copies to current directory
```

## Files

| File | Purpose |
|------|---------|
| `src/saia.ts` | **The plugin** — drop into `~/.config/opencode/plugins/` |
| `src/generate-saia-config.mjs` | Standalone Node.js refresher (manual use) |
| `src/copy-saia-config.mjs` | Standalone Node.js copier (manual use) |
| `src/generate-saia-config.sh` | Bash version for systems preferring shell scripts |
| `src/copy-saia-config.sh` | Bash version for systems preferring shell scripts |
| `src/opencode-saia.json` | Example full config with permissions and all 21 models |

## How the Plugin Works

1. **Startup hook**: OpenCode loads `~/.config/opencode/plugins/saia.ts` because you registered `"plugin": ["./saia"]`
2. **Fire and forget**: The plugin starts an async refresh and immediately returns `{}` so OpenCode startup is never blocked
3. **Fetch with timeout**: `fetch()` to SAIA's `/v1/models` endpoint with a 3-second `AbortSignal.timeout`
4. **Read existing config**: Parses the current `~/.config/opencode/opencode.json` so your settings are preserved
5. **Build provider block**: Creates the `provider.saia` object with all current models
6. **Smart default model**: Only changes `config.model` if it's empty or points to a model that no longer exists
7. **Atomic write**: Writes to a `.tmp` file, then `fs.rename()` — even if you `^C` mid-write, you never get a broken config
8. **Silent on failure**: Network errors, missing API key, or API outages are swallowed. Worst case: yesterday's model list stays for one more launch

## Requirements

- **OpenCode** (official install from [opencode.ai](https://opencode.ai))
- **Node.js** (already required by OpenCode)
- **SAIA_API_KEY** environment variable

No additional dependencies. The plugin uses only Node.js built-ins (`node:path`, `node:os`, `node:fs/promises`, `fetch`).

## Troubleshooting

### Plugin doesn't seem to run

1. Verify the file is in the right place: `ls ~/.config/opencode/plugins/saia.ts`
2. Verify the plugin is registered in your global config: `cat ~/.config/opencode/opencode.json | jq '.plugin'`
3. Make sure `SAIA_API_KEY` is exported in the shell where you run `opencode`
4. Check if the global config was updated after launch: `cat ~/.config/opencode/opencode.json | jq '.provider.saia.models | length'`

### SAIA_API_KEY not set

The plugin silently skips if `SAIA_API_KEY` is missing. Set it and restart OpenCode.

### Broken config after crash

Because of atomic writes (`writeFile` + `rename`), a crash during the write never leaves a half-written file. If you're still worried, keep a backup:

```bash
cp ~/.config/opencode/opencode.json ~/.config/opencode/opencode.json.bak
```

## Alternative: Full SAIA Integration

This plugin works with the **standard OpenCode installation**. No patches or forks required.

For users who want SAIA models hardcoded into OpenCode's `/model` command without any config file, a patched OpenCode fork exists. **Most users should use this plugin instead.**
