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

# Local plugins are discovered automatically in supported V1 and V2 releases.
# Do not add an explicit file registration: V2 configured paths require directories.
if [ ! -f "$CONFIG_FILE" ]; then
  mkdir -p "$(dirname "$CONFIG_FILE")"
  cat > "$CONFIG_FILE" << 'EOF'
{
  "$schema": "https://opencode.ai/config.json"
}
EOF
  echo "✓ Created $CONFIG_FILE"
else
  echo "✓ Keeping existing $CONFIG_FILE; local plugin discovery needs no registration"
fi

echo ""
echo "Done. Run: opencode"
