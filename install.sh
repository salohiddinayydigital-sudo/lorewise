#!/usr/bin/env bash
# install.sh - Automated 1-click installer for Lorewise on macOS & Linux
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/salohiddinayydigital-sudo/lorewise/main/install.sh | bash
#   or: ./install.sh

set -e

echo ""
echo "=========================================================="
echo "         LOREWISE - The Media Buyer's Second Brain        "
echo "=========================================================="
echo ""

# 1. Check Node.js
echo "[1/4] Checking Node.js environment..."
if ! command -v node >/dev/null 2>&1; then
    echo "[-] Node.js is not found on PATH. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "  [+] Node.js detected: $NODE_VERSION"

# 2. Check Claude Code CLI
echo "[2/4] Checking Claude Code CLI..."
if ! command -v claude >/dev/null 2>&1; then
    echo "[-] Claude Code CLI ('claude') is not found on PATH."
    echo "  Please install Claude Code first: npm install -g @anthropic-ai/claude-code"
    exit 1
fi

echo "  [+] Claude Code CLI detected."

# 3. Add Marketplace
echo "[3/4] Adding Lorewise marketplace source..."
claude plugin marketplace add salohiddinayydigital-sudo/lorewise || true
echo "  [+] Marketplace registered."

# 4. Install Plugin
echo "[4/4] Installing Lorewise plugin (lorewise@lorewise)..."
if claude plugin install lorewise@lorewise; then
    echo "  [+] Lorewise plugin installed successfully!"
else
    echo "  [!] Retrying with local plugin directory..."
    claude plugin install .
fi

echo ""
echo "=========================================================="
echo "             INSTALLATION COMPLETE!                       "
echo "=========================================================="
echo ""
echo "To experience Lorewise immediately, open Claude Code and run:"
echo "  /lorewise:start"
echo ""
echo "For a 3-minute interactive demo, select 'Demo Shop (synthetic)'."
echo "Command cheat sheet: COMMANDS-QUICK-REF.md"
echo ""
