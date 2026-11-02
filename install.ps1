#!/usr/bin/env pwsh
#Requires -Version 5.1

if (-not $env:SAIA_API_KEY) {
  Write-Error "SAIA_API_KEY is not set. Get your key from https://chat-ai.academiccloud.de/ then run:"
  Write-Error "  [Environment]::SetEnvironmentVariable('SAIA_API_KEY', 'your_key_here', 'User')"
  exit 1
}

$pluginDir = Join-Path $env:USERPROFILE ".config\opencode\plugins"
$pluginPath = Join-Path $pluginDir "saia.ts"
$configFile = Join-Path $env:USERPROFILE ".config\opencode\opencode.json"

New-Item -ItemType Directory -Force -Path $pluginDir | Out-Null

Write-Host "Downloading saia.ts..."
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/jaisonlewis/opencode-saia-plugin/master/src/saia.ts" -OutFile $pluginPath -UseBasicParsing

Write-Host ""

# Local plugins are discovered automatically in supported V1 and V2 releases.
# V2 configured paths require directories, so do not register this file explicitly.
if (-not (Test-Path $configFile)) {
    $configDir = Split-Path $configFile -Parent
    New-Item -ItemType Directory -Force -Path $configDir | Out-Null
    $config = @{
        '$schema' = "https://opencode.ai/config.json"
    } | ConvertTo-Json -Depth 10
    $config | Set-Content $configFile -Encoding UTF8
    Write-Host "✓ Created $configFile"
} else {
    Write-Host "✓ Keeping existing $configFile; local plugin discovery needs no registration"
}

Write-Host ""
Write-Host "Done. Run: opencode"
