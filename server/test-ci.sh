#!/bin/bash

# Test CI Backend - Script pour tester localement la configuration CI

echo "🧪 Starting Backend CI Test..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to server directory
cd "$(dirname "$0")"

echo "${YELLOW}📦 Installing dependencies...${NC}"
yarn install --frozen-lockfile
if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo "${YELLOW}🔨 Building TypeScript...${NC}"
yarn build
if [ $? -ne 0 ]; then
    echo "${RED}❌ TypeScript build failed${NC}"
    exit 1
fi
echo "${GREEN}✅ Build successful${NC}"
echo ""

echo "${YELLOW}🧪 Running tests with coverage...${NC}"
yarn test:ci
if [ $? -ne 0 ]; then
    echo "${RED}❌ Tests failed${NC}"
    exit 1
fi
echo "${GREEN}✅ All tests passed${NC}"
echo ""

echo "${GREEN}🎉 CI Test completed successfully!${NC}"
