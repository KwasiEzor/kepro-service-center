#!/bin/bash

# Pre-deployment quality check script
# Runs all checks before deploying to production

set -e  # Exit on any error

echo "🔍 Starting pre-deployment checks..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Track failures
FAILED=0

# Function to print status
print_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ $1${NC}"
  else
    echo -e "${RED}✗ $1${NC}"
    FAILED=1
  fi
}

# 1. Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
REQUIRED_VERSION="v18"
if [[ $NODE_VERSION == $REQUIRED_VERSION* ]] || [[ $NODE_VERSION > $REQUIRED_VERSION ]]; then
  print_status "Node.js version: $NODE_VERSION"
else
  echo -e "${YELLOW}⚠ Node.js $NODE_VERSION detected. Recommended: $REQUIRED_VERSION or higher${NC}"
fi
echo ""

# 2. Check for required environment variables
echo "🔐 Checking environment variables..."
if [ -f .env ] || [ -f .env.local ]; then
  if grep -q "VITE_GEMINI_API_KEY" .env .env.local 2>/dev/null; then
    print_status "VITE_GEMINI_API_KEY found"
  else
    echo -e "${RED}✗ VITE_GEMINI_API_KEY not found in .env or .env.local${NC}"
    FAILED=1
  fi
else
  echo -e "${YELLOW}⚠ No .env or .env.local file found${NC}"
fi
echo ""

# 3. Install dependencies
echo "📥 Installing dependencies..."
npm ci --silent
print_status "Dependencies installed"
echo ""

# 4. TypeScript type checking
echo "🔤 Running TypeScript type check..."
npm run lint
print_status "TypeScript type check passed"
echo ""

# 5. Check for unused dependencies
echo "📊 Checking for unused dependencies..."
npx depcheck --ignores="@types/*,vite,tailwindcss,autoprefixer,concurrently,tsx" > /dev/null 2>&1
print_status "Dependency check passed"
echo ""

# 6. Build project
echo "🏗️  Building project..."
npm run clean
npm run build
print_status "Build completed"
echo ""

# 7. Check build output
echo "📂 Checking build output..."
if [ -d "dist" ]; then
  DIST_SIZE=$(du -sh dist | cut -f1)
  echo -e "${GREEN}✓ Build output: $DIST_SIZE${NC}"

  # Check for index.html
  if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}✗ Missing dist/index.html${NC}"
    FAILED=1
  else
    print_status "index.html present"
  fi

  # Check for assets
  if [ ! -d "dist/assets" ]; then
    echo -e "${YELLOW}⚠ No assets directory found${NC}"
  else
    ASSET_COUNT=$(ls -1 dist/assets | wc -l)
    echo -e "${GREEN}✓ Assets: $ASSET_COUNT files${NC}"
  fi
else
  echo -e "${RED}✗ Build output directory not found${NC}"
  FAILED=1
fi
echo ""

# 8. Security audit (non-blocking)
echo "🔒 Running security audit..."
npm audit --audit-level=high || echo -e "${YELLOW}⚠ Security vulnerabilities found (non-blocking)${NC}"
echo ""

# 9. Check for console.log statements (warning only)
echo "🧹 Checking for console statements..."
CONSOLE_COUNT=$(grep -r "console\\.log" src/ --include="*.tsx" --include="*.ts" | wc -l)
if [ $CONSOLE_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠ Found $CONSOLE_COUNT console.log statements${NC}"
else
  print_status "No console.log statements found"
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All pre-deployment checks passed!${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Ready to deploy 🚀"
  exit 0
else
  echo -e "${RED}✗ Pre-deployment checks failed${NC}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Fix errors above before deploying"
  exit 1
fi
