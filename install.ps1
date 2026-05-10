#!/usr/bin/env pwsh
#Requires -Version 5.1

if (-not $env:SAIA_API_KEY) {
  Write-Error "SAIA_API_KEY is not set. Get your key from https://chat-ai.academiccloud.de/ then run:"
  Write-Error "  [Environment]::SetEnvironmentVariable('SAIA_API_KEY', 'your_key_here', 'User')"
  exit 1
}

$pluginDir = Join-Path $env:USERPROFILE ".config\opencode\plugins"
New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null

$pluginUrl = "https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/saia.ts"
$pluginPath = Join-Path $pluginDir "saia.ts"

Write-Host "Downloading saia.ts..."
Invoke-WebRequest -Uri $pluginUrl -OutFile $pluginPath -UseBasicParsing

Write-Host ""
Write-Host "✓ Plugin installed to $pluginPath"
Write-Host ""
Write-Host "Next: add this to your opencode.json (usually in ~\.config\opencode\opencode.json):"
Write-Host ""
Write-Host '  {'
Write-Host '    "$schema": "https://opencode.ai/config.json",'
Write-Host '    "plugin": ["./saia"]'
Write-Host '  }'
Write-Host ""
Write-Host "Then run: opencode"
