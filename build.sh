#!/bin/bash

# WhatsApp Widget Build Script
# This script prepares the widget for CDN deployment

set -e  # Exit on error

echo "🚀 Building WhatsApp Widget for CDN..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node/npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js/npm first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Clean dist directory
echo -e "${YELLOW}🧹 Cleaning dist directory...${NC}"
rm -rf dist/*

# Copy original file to dist
echo -e "${YELLOW}📋 Copying source file to dist...${NC}"
cp src/whatsapp-widget.js dist/whatsapp-widget.js

# Get file sizes for comparison
ORIGINAL_SIZE=$(du -h src/whatsapp-widget.js | cut -f1)

# Minify the widget
echo -e "${YELLOW}🗜️  Minifying JavaScript...${NC}"
npx terser src/whatsapp-widget.js \
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
echo -e "${YELLOW}🔒 Generating SRI hash...${NC}"
SRI_HASH=$(openssl dgst -sha384 -binary dist/whatsapp-widget.min.js | openssl base64 -A)
echo "sha384-$SRI_HASH" > dist/whatsapp-widget.min.js.sri

# Summary
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo ""
echo "📊 Build Summary:"
echo "  • Version: $VERSION"
echo "  • Original size: $ORIGINAL_SIZE"
echo "  • Minified size: $MINIFIED_SIZE"
echo "  • Files created:"
echo "    - dist/whatsapp-widget.js (original)"
echo "    - dist/whatsapp-widget.min.js (minified)"
echo "    - dist/whatsapp-widget.min.js.map (source map)"
echo "    - dist/whatsapp-widget.min.js.sri (SRI hash)"
echo ""
echo "📦 CDN URLs (after pushing to GitHub):"
echo "  • Latest: https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@latest/dist/whatsapp-widget.min.js"
echo "  • Version: https://cdn.jsdelivr.net/gh/plazatechnologies/whatsapp-widget@$VERSION/dist/whatsapp-widget.min.js"
echo ""
echo "🔒 SRI Hash for secure embedding:"
echo "  integrity=\"sha384-$SRI_HASH\""
echo ""
echo "📝 Next steps:"
echo "  1. Test locally: npm test"
echo "  2. Commit changes: git add -A && git commit -m 'Release v$VERSION'"
echo "  3. Tag version: git tag v$VERSION"
echo "  4. Push to GitHub: git push && git push --tags"