#!/bin/bash
set -e

if [ -z "$SAIA_API_KEY" ]; then
  echo "Error: SAIA_API_KEY is not set."
  echo "Get your key from https://chat-ai.academiccloud.de/ then run:"
  echo "  export SAIA_API_KEY=your_key_here"
  exit 1
fi

PLUGIN_DIR="${HOME}/.config/opencode/plugins"
mkdir -p "$PLUGIN_DIR"

echo "Downloading saia.ts..."
curl -fsSL https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/saia.ts \
  -o "$PLUGIN_DIR/saia.ts"

echo ""
echo "✓ Plugin installed to $PLUGIN_DIR/saia.ts"
echo ""
echo "Next: add this to ~/.config/opencode/opencode.json (create if missing):"
echo ""
echo '  {'
echo '    "$schema": "https://opencode.ai/config.json",'
echo '    "plugin": ["./saia"]'
echo '  }'
echo ""
echo "Then run: opencode"
