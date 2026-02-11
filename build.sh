#!/bin/bash

# WhatsApp Widget Build Script
# This script prepares the widget for CDN deployment
#
# Source files in src/ are concatenated in dependency order into a single IIFE,
# then minified with Terser for production use.

set -e  # Exit on error

echo "Building WhatsApp Widget for CDN..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ── Source files in concatenation order (dependency-safe) ──────────────
SRC_FILES=(
  src/_open.js
  src/utils.js
  src/tracking.js
  src/config.js
  src/message.js
  src/ui-tooltip.js
  src/ui-button.js
  src/ui-animations.js
  src/init.js
  src/_close.js
)

# Check if node/npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js/npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Clean dist directory
echo -e "${YELLOW}Cleaning dist directory...${NC}"
rm -rf dist/*

# Verify all source files exist
for f in "${SRC_FILES[@]}"; do
    if [ ! -f "$f" ]; then
        echo "Missing source file: $f"
        exit 1
    fi
done

# Concatenate source files into a single IIFE
echo -e "${YELLOW}Concatenating source files...${NC}"
cat "${SRC_FILES[@]}" > dist/whatsapp-widget.js

# Get file sizes for comparison
ORIGINAL_SIZE=$(du -h dist/whatsapp-widget.js | cut -f1)

# Minify the widget
echo -e "${YELLOW}Minifying JavaScript...${NC}"
npx terser dist/whatsapp-widget.js \
    --compress \
    --mangle \
    --output dist/whatsapp-widget.min.js \
    --source-map "url='whatsapp-widget.min.js.map'"

# Get minified size
MINIFIED_SIZE=$(du -h dist/whatsapp-widget.min.js | cut -f1)

# Create version file
VERSION=$(node -p "require('./package.json').version")
echo "$VERSION" > dist/VERSION

# Generate SRI hash for security
echo -e "${YELLOW}Generating SRI hash...${NC}"
SRI_HASH=$(openssl dgst -sha384 -binary dist/whatsapp-widget.min.js | openssl base64 -A)
echo "sha384-$SRI_HASH" > dist/whatsapp-widget.min.js.sri

# Summary
echo -e "${GREEN}Build completed successfully!${NC}"
echo ""
echo "Build Summary:"
echo "  Version: $VERSION"
echo "  Source files: ${#SRC_FILES[@]}"
echo "  Concatenated size: $ORIGINAL_SIZE"
echo "  Minified size: $MINIFIED_SIZE"
echo "  Files created:"
echo "    - dist/whatsapp-widget.js (concatenated)"
echo "    - dist/whatsapp-widget.min.js (minified)"
echo "    - dist/whatsapp-widget.min.js.map (source map)"
echo "    - dist/whatsapp-widget.min.js.sri (SRI hash)"
echo ""
echo "CDN URLs (after pushing to GitHub):"
echo "  Latest: https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js"
echo "  Version: https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@$VERSION/dist/whatsapp-widget.min.js"
echo ""
echo "SRI Hash for secure embedding:"
echo "  integrity=\"sha384-$SRI_HASH\""
