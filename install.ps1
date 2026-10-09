# install.ps1 - Automated 1-click installer for Lorewise on Windows
# Usage:
#   irm https://raw.githubusercontent.com/salohiddinayydigital-sudo/lorewise/main/install.ps1 | iex
#   or: .\install.ps1

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "         LOREWISE - The Media Buyer's Second Brain        " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Node.js
Write-Host "[1/4] Checking Node.js environment..." -ForegroundColor White
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[-] Node.js is not found on PATH. Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

$nodeVersion = node --version
Write-Host "  [+] Node.js detected: $nodeVersion" -ForegroundColor Green

# 2. Check Claude Code CLI
Write-Host "[2/4] Checking Claude Code CLI..." -ForegroundColor White
$claudeCmd = Get-Command claude -ErrorAction SilentlyContinue
if (-not $claudeCmd) {
    Write-Host "[-] Claude Code CLI ('claude') is not found on PATH." -ForegroundColor Yellow
    Write-Host "  Please install Claude Code first: npm install -g @anthropic-ai/claude-code" -ForegroundColor Yellow
    exit 1
}

Write-Host "  [+] Claude Code CLI detected." -ForegroundColor Green

# 3. Add Marketplace
Write-Host "[3/4] Adding Lorewise marketplace source..." -ForegroundColor White
try {
    & claude plugin marketplace add salohiddinayydigital-sudo/lorewise
    Write-Host "  [+] Marketplace source registered successfully." -ForegroundColor Green
} catch {
    Write-Host "  [!] Notice: Marketplace may already be registered or using local cache." -ForegroundColor DarkYellow
}

# 4. Install Plugin
Write-Host "[4/4] Installing Lorewise plugin (lorewise@lorewise)..." -ForegroundColor White
try {
    & claude plugin install lorewise@lorewise
    Write-Host "  [+] Lorewise plugin installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "[-] Failed to install plugin via marketplace. Retrying local plugin install..." -ForegroundColor DarkYellow
    if (Test-Path "$PSScriptRoot\.claude-plugin\marketplace.json") {
        & claude plugin install .
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "             INSTALLATION COMPLETE!                       " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "To experience Lorewise immediately, open Claude Code and run:" -ForegroundColor White
Write-Host "  /lorewise:start" -ForegroundColor Cyan
Write-Host ""
Write-Host "For a 3-minute interactive demo, select 'Demo Shop (synthetic)'." -ForegroundColor Gray
Write-Host "Command cheat sheet: COMMANDS-QUICK-REF.md" -ForegroundColor Gray
Write-Host ""
