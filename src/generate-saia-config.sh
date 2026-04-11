#!/usr/bin/env bash
set -euo pipefail

# SAIA Configuration Manager
# Updates master configuration in plugin folder and copies to current directory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MASTER_CONFIG="$SCRIPT_DIR/opencode-saia.json"

SAIA_API_KEY="${SAIA_API_KEY:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check for SAIA_API_KEY
if [[ -z "$SAIA_API_KEY" ]]; then
    print_error "SAIA_API_KEY environment variable not set"
    print_info "Please set it with: export SAIA_API_KEY=your_key"
    exit 1
fi

print_info "Fetching latest SAIA models..."

# Fetch models from SAIA API
MODELS_JSON=$(curl -s "https://chat-ai.academiccloud.de/v1/models" \
    -H "Authorization: Bearer $SAIA_API_KEY")

if [[ -z "$MODELS_JSON" ]]; then
    print_error "Failed to fetch models from SAIA API"
    exit 1
fi

MODEL_COUNT=$(echo "$MODELS_JSON" | jq -r '.data | length')
print_info "Found $MODEL_COUNT SAIA models"

# Check if master config exists and compare model count
if [[ -f "$MASTER_CONFIG" ]]; then
    OLD_COUNT=$(jq -r '.provider.saia.models | length' "$MASTER_CONFIG" 2>/dev/null || echo "0")
    if [[ "$OLD_COUNT" == "$MODEL_COUNT" ]]; then
        print_info "Master configuration is up to date ($MODEL_COUNT models)"
    else
        print_info "Updating master configuration ($OLD_COUNT -> $MODEL_COUNT models)"
    fi
else
    print_info "Creating master configuration with $MODEL_COUNT models"
fi

print_info "Generating opencode.json..."

# Generate the opencode.json configuration to master file
cat > "$MASTER_CONFIG" <<EOF
{
  "\$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": "allow",
    "edit": "allow",
    "read": "allow",
    "grep": "allow",
    "glob": "allow",
    "list": "allow",
    "lsp": "allow",
    "skill": "allow",
    "task": "allow",
    "todowrite": "allow",
    "todoread": "allow",
    "webfetch": "allow",
    "websearch": "allow",
    "codesearch": "allow",
    "question": "allow",
    "mymcp_*": "ask"
  },
  "model": "saia/glm-4.7",
  "provider": {
    "saia": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "SAIA (GWDG Chat AI)",
      "options": {
        "baseURL": "https://chat-ai.academiccloud.de/v1",
        "apiKey": "{env:SAIA_API_KEY}"
      },
      "models": {
EOF

# Add models
echo "$MODELS_JSON" | jq -r '.data[].id' | while read -r model_id; do
    desc="General Purpose"
    
    if [[ "$model_id" =~ (thinking|reasoning|r1) ]]; then
        desc="Planning - Advanced Reasoning"
    elif [[ "$model_id" =~ coder ]]; then
        desc="Building - Specialized Coding"
    elif [[ "$model_id" =~ (large|120b|235b|675b) ]]; then
        desc="Planning - Large Context"
    elif [[ "$model_id" =~ (glm-4.7|devstral) ]]; then
        desc="Building - Agentic Coding"
    fi
    
    if [[ -n "$model_id" ]]; then
        echo "        \"$model_id\": {\"name\": \"$model_id ($desc)\"}," >> "$MASTER_CONFIG"
    fi
done

# Remove trailing comma and close JSON
sed -i '$ s/,$//' "$MASTER_CONFIG"
cat >> "$MASTER_CONFIG" <<EOF
      }
    }
  }
}
EOF

print_info "Master configuration updated: $MASTER_CONFIG"

# Copy to current directory
cp "$MASTER_CONFIG" ./opencode.json
print_info "Copied opencode.json to current directory"
print_info "SAIA models are now available in this directory!"
