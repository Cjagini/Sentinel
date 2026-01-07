#!/bin/bash
# Sentinel Project - Setup Script
# Run this script after cloning the repository to set up the development environment

set -e  # Exit on any error

echo "================================"
echo "Sentinel Project Setup Script"
echo "================================"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Step 2: Generate Prisma Client
echo "Step 2: Generating Prisma Client..."
npm run prisma:generate
echo "✓ Prisma Client generated"
echo ""

# Step 3: Database migrations
echo "Step 3: Running database migrations..."
echo "Ensure PostgreSQL is running and DATABASE_URL is correct in .env.local"
npx prisma migrate deploy
echo "✓ Database migrations applied"
echo ""

# Step 4: Build the project
echo "Step 4: Building Next.js project..."
npm run build
echo "✓ Next.js build complete"
echo ""

# Step 5: Run linting
echo "Step 5: Running ESLint..."
npm run lint
echo "✓ Code quality check passed"
echo ""

echo "================================"
echo "Setup Complete! ✓"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. In another terminal, start worker: npm run worker"
echo "3. Test API endpoints using curl or Postman"
echo ""
echo "See QUICKSTART.md for more information."
