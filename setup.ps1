# Sentinel Project - Setup Script (Windows)
# Run this script after cloning the repository to set up the development environment

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Sentinel Project Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install dependencies
Write-Host "Step 1: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 2: Generate Prisma Client
Write-Host "Step 2: Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to generate Prisma Client" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma Client generated" -ForegroundColor Green
Write-Host ""

# Step 3: Database migrations
Write-Host "Step 3: Running database migrations..." -ForegroundColor Yellow
Write-Host "Ensure PostgreSQL is running and DATABASE_URL is correct in .env.local" -ForegroundColor Gray
npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Migration failed. Ensure database exists." -ForegroundColor Yellow
    Write-Host "You may need to run: npx prisma db push" -ForegroundColor Gray
} else {
    Write-Host "✓ Database migrations applied" -ForegroundColor Green
}
Write-Host ""

# Step 4: Build the project
Write-Host "Step 4: Building Next.js project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Next.js build complete" -ForegroundColor Green
Write-Host ""

# Step 5: Run linting
Write-Host "Step 5: Running ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Linting warnings found (non-critical)" -ForegroundColor Yellow
} else {
    Write-Host "✓ Code quality check passed" -ForegroundColor Green
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete! ✓" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start development server: npm run dev" -ForegroundColor White
Write-Host "2. In another terminal, start worker: npm run worker" -ForegroundColor White
Write-Host "3. Test API endpoints using curl or Postman" -ForegroundColor White
Write-Host ""
Write-Host "See QUICKSTART.md for more information." -ForegroundColor Gray
