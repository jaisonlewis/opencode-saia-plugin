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

# Auto-configure opencode.json
if (-not (Test-Path $configFile)) {
    $configDir = Split-Path $configFile -Parent
    New-Item -ItemType Directory -Force -Path $configDir | Out-Null
    $config = @{
        '$schema' = "https://opencode.ai/config.json"
        plugin = @("./saia")
    } | ConvertTo-Json -Depth 10
    $config | Set-Content $configFile -Encoding UTF8
    Write-Host "✓ Created $configFile with plugin registration"
} else {
    $config = Get-Content $configFile -Raw | ConvertFrom-Json
    if ($config.plugin -contains "./saia") {
        Write-Host "✓ Plugin already registered in $configFile"
    } else {
        if (-not $config.plugin) { $config.plugin = @() }
        $config.plugin += "./saia"
        $config | ConvertTo-Json -Depth 10 | Set-Content $configFile -Encoding UTF8
        Write-Host "✓ Added plugin registration to $configFile"
    }
}

Write-Host ""
Write-Host "Done. Run: opencode"
