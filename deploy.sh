#!/bin/bash
# NASA Space Bioscience Explorer - Quick Deploy Script

set -e

echo "🚀 NASA Space Bio Explorer Deploy Script"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Go to UI directory
cd "$(dirname "$0")/ui"

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

echo -e "${BLUE}✅ Build completed successfully!${NC}"
echo ""

# Deploy to Vercel
echo -e "${YELLOW}🌐 Deploying to Vercel Production...${NC}"
vercel --prod --yes

echo ""
echo -e "${GREEN}✨ Deployment completed!${NC}"
echo ""
echo -e "🌐 Production URL: ${BLUE}https://nasa-space-bio.vercel.app${NC}"
echo ""
echo "📊 Check your deployment:"
echo "   - Dashboard: https://vercel.com/okans-projects-fcf7250e/nasa-space-bio"
echo "   - Health: https://nasa-space-bio.vercel.app/api/health"
echo ""

