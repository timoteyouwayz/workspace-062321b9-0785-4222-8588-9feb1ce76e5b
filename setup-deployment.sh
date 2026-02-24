#!/bin/bash
# Deployment Setup Script
# Run this after uploading files to your cPanel folder
# Usage: bash setup-deployment.sh

set -e  # Exit on any error

echo "🚀 Starting Requisition System Setup..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your actual values:${NC}"
    echo "   - NEXT_PUBLIC_APP_URL"
    echo "   - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"
    echo "   - GOOGLE_SERVICE_ACCOUNT_KEY"
    echo "   - GOOGLE_DRIVE_FOLDER_ID, GOOGLE_SHEETS_ID"
    echo "   - EMAIL_SMTP_* settings"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    if command -v bun &> /dev/null; then
        bun install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo -e "${RED}❌ Neither bun nor npm found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi

# Check database
if [ ! -f "data/dev.db" ]; then
    echo -e "${YELLOW}Setting up database...${NC}"
    mkdir -p data
    if command -v bun &> /dev/null; then
        bun prisma db push --skip-generate
        bun prisma db seed
    else
        npx prisma db push --skip-generate
        npx prisma db seed
    fi
    echo -e "${GREEN}✓ Database initialized${NC}"
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi

# Create upload directories
echo -e "${YELLOW}Creating upload directories...${NC}"
mkdir -p uploads/receipts
mkdir -p logs
echo -e "${GREEN}✓ Upload directories created${NC}"

# Build the application
echo -e "${YELLOW}Building application...${NC}"
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi
echo -e "${GREEN}✓ Build completed${NC}"

echo ""
echo -e "${GREEN}========================================"
echo "✅ Setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run: bun start (or npm start)"
echo "3. Visit: http://localhost:3000"
echo ""
echo "Default credentials (if seeded):"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "For production deployment, see DEPLOYMENT.md"
echo "========================================"
