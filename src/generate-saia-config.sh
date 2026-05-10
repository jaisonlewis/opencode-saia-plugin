#!/usr/bin/env bash
set -euo pipefail

# SAIA Configuration Manager
# Fetches latest models and generates a clean opencode.json via jq

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MASTER_CONFIG="$SCRIPT_DIR/opencode-saia.json"

SAIA_API_KEY="${SAIA_API_KEY:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [[ -z "$SAIA_API_KEY" ]]; then
    print_error "SAIA_API_KEY environment variable not set"
    print_info "Please set it with: export SAIA_API_KEY=your_key"
    exit 1
fi

print_info "Fetching latest SAIA models..."

MODELS_JSON=$(curl -sf --max-time 30 \
    "https://chat-ai.academiccloud.de/v1/models" \
    -H "Authorization: Bearer $SAIA_API_KEY")

if ! echo "$MODELS_JSON" | jq -e '.data' >/dev/null 2>&1; then
    print_error "API response is missing .data array"
    exit 1
fi

MODEL_COUNT=$(echo "$MODELS_JSON" | jq -r '.data | length')
print_info "Found $MODEL_COUNT SAIA models"

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

# Build the entire config in one jq invocation — no temp files, no shell loops
jq -n \
  --arg schema "https://opencode.ai/config.json" \
  --argjson models "$(echo "$MODELS_JSON" | jq '
    .data | map(.id) | sort | map(. as $id |
      (if ($id | test("thinking|reasoning|r1")) then "Planning - Advanced Reasoning"
       elif ($id | test("coder")) then "Building - Specialized Coding"
       elif ($id | test("large|120b|235b|675b")) then "Planning - Large Context"
       elif ($id | test("glm-4\\.7|devstral")) then "Building - Agentic Coding"
       else "General Purpose"
       end) as $desc |
      { ($id): { name: "\($id) (\($desc))" } }
    ) | add // {}
  ')" \
  '{
    "$schema": $schema,
    permission: {
      bash: "allow",
      edit: "allow",
      read: "allow",
      grep: "allow",
      glob: "allow",
      lsp: "allow",
      skill: "allow",
      task: "allow",
      webfetch: "allow",
      websearch: "allow",
      question: "allow",
      external_directory: "ask",
      doom_loop: "ask"
    },
    formatter: {},
    model: "saia/glm-4.7",
    provider: {
      saia: {
        npm: "@ai-sdk/openai-compatible",
        name: "SAIA (GWDG Chat AI)",
        options: {
          baseURL: "https://chat-ai.academiccloud.de/v1",
          apiKey: "{env:SAIA_API_KEY}"
        },
        models: $models
      }
    }
  }' > "$MASTER_CONFIG"

print_info "Master configuration updated: $MASTER_CONFIG"

# Copy to current directory (silent overwrite by design)
cp "$MASTER_CONFIG" ./opencode.json
print_info "Copied opencode.json to current directory"
print_info "SAIA models are now available in this directory!"
