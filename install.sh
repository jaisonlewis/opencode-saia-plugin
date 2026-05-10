#!/bin/bash
set -e

if [ -z "$SAIA_API_KEY" ]; then
  echo "Error: SAIA_API_KEY is not set."
  echo "Get your key from https://chat-ai.academiccloud.de/ then run:"
  echo "  export SAIA_API_KEY=your_key_here"
  exit 1
fi

PLUGIN_DIR="${HOME}/.config/opencode/plugins"
CONFIG_FILE="${HOME}/.config/opencode/opencode.json"

mkdir -p "$PLUGIN_DIR"

echo "Downloading saia.ts..."
curl -fsSL https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/saia.ts \
  -o "$PLUGIN_DIR/saia.ts"

echo ""

# Auto-configure opencode.json
if [ ! -f "$CONFIG_FILE" ]; then
  mkdir -p "$(dirname "$CONFIG_FILE")"
  cat > "$CONFIG_FILE" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["./saia"]
}
EOF
  echo "✓ Created $CONFIG_FILE with plugin registration"
else
  if grep -q '"plugin"' "$CONFIG_FILE" 2>/dev/null && grep -q '"./saia"' "$CONFIG_FILE" 2>/dev/null; then
    echo "✓ Plugin already registered in $CONFIG_FILE"
  elif command -v python3 >/dev/null 2>&1; then
    python3 -c "
import json
with open('$CONFIG_FILE', 'r') as f:
    config = json.load(f)
config.setdefault('plugin', [])
if './saia' not in config['plugin']:
    config['plugin'].append('./saia')
with open('$CONFIG_FILE', 'w') as f:
    json.dump(config, f, indent=2)
    f.write('\n')
"
    echo "✓ Added plugin registration to $CONFIG_FILE"
  else
    echo "⚠ Config file exists. Please ensure it contains: \"plugin\": [\"./saia\"]"
  fi
fi

echo ""
echo "Done. Run: opencode"
