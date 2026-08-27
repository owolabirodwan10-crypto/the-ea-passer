# deploy.ps1 - Complete deployment script for EAPASER
# Save this file in the root directory of your project

param(
    [switch]$Prod,
    [switch]$Preview,
    [switch]$Force
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  🚀 EAPASER DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set deployment target
if ($Prod) {
    $DeployTarget = "--prod"
    $TargetName = "PRODUCTION"
} elseif ($Preview) {
    $DeployTarget = ""
    $TargetName = "PREVIEW"
} else {
    $DeployTarget = "--prod"
    $TargetName = "PRODUCTION (default)"
}

Write-Host "📦 Deployment Target: $TargetName" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check Node.js version
Write-Host "📋 Step 1: Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node -v
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies if needed
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules already exists. Skipping installation." -ForegroundColor Gray
} else {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
}
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "🔧 Step 3: Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma Client!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma Client generated successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Test database connection
Write-Host "🔄 Step 4: Testing database connection..." -ForegroundColor Yellow
try {
    $testResult = npx prisma db pull --print 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Database connection test failed, but continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Database connection test warning: $_" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Push database schema
Write-Host "📊 Step 5: Pushing database schema..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Database push failed, but continuing with deployment..." -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Build the application
Write-Host "🏗️  Step 6: Building the application..." -ForegroundColor Yellow
$buildCommand = if ($Force) { "npm run build -- --no-lint" } else { "npm run build" }
Invoke-Expression $buildCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Please fix the errors and try again." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Common fixes:" -ForegroundColor Yellow
    Write-Host "  1. Check for TypeScript errors in your code" -ForegroundColor Gray
    Write-Host "  2. Run 'npm run lint' to see linting errors" -ForegroundColor Gray
    Write-Host "  3. Make sure all imports are correct" -ForegroundColor Gray
    Write-Host "  4. Check that all environment variables are set" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 7: Check Vercel CLI
Write-Host "🔍 Step 7: Checking Vercel CLI..." -ForegroundColor Yellow
$vercelExists = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelExists) {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found!" -ForegroundColor Green
}
Write-Host ""

# Step 8: Login to Vercel if needed
Write-Host "🔐 Step 8: Checking Vercel login status..." -ForegroundColor Yellow
$vercelWhoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Vercel. Please login:" -ForegroundColor Yellow
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to login to Vercel!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Logged in successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ Already logged in to Vercel" -ForegroundColor Green
}
Write-Host ""

# Step 9: Set environment variables
Write-Host "🌐 Step 9: Setting up environment variables..." -ForegroundColor Yellow
Write-Host "Checking if DATABASE_URL is set..." -ForegroundColor Gray
$envCheck = vercel env ls 2>&1
if ($envCheck -match "DATABASE_URL") {
    Write-Host "✅ DATABASE_URL is set" -ForegroundColor Green
} else {
    Write-Host "⚠️  DATABASE_URL not found. Please add it:" -ForegroundColor Yellow
    Write-Host "   Run: vercel env add DATABASE_URL" -ForegroundColor Gray
    Write-Host "   Value: postgresql://postgres:Owolabi12312@db.hxdqwotmwhacbfzpszlk.supabase.co:5432/postgres?sslmode=require" -ForegroundColor Gray
}
Write-Host ""

# Step 10: Deploy to Vercel
Write-Host "🚀 Step 10: Deploying to Vercel ($TargetName)..." -ForegroundColor Yellow
Write-Host ""

# Build the deploy command
$deployCommand = "vercel $DeployTarget"

if ($Force) {
    $deployCommand += " --force"
}

if ($Prod) {
    # For production, also include specific build
    $deployCommand += " --yes"  # Skip prompts
}

Write-Host "Running: $deployCommand" -ForegroundColor Gray
Write-Host ""

# Execute deployment
Invoke-Expression $deployCommand

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "Check the error messages above." -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "  1. Run 'vercel logs' to see detailed logs" -ForegroundColor Gray
    Write-Host "  2. Check that all environment variables are set in Vercel" -ForegroundColor Gray
    Write-Host "  3. Try 'vercel --prod --force' to force deploy" -ForegroundColor Gray
    Write-Host "  4. Check Vercel dashboard for more details" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Step 11: Display success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your app is now live at:"
Write-Host "   https://eapaser-flahqpoq5-my-ip-address.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 View deployment details:" -ForegroundColor Yellow
Write-Host "   vercel list" -ForegroundColor Gray
Write-Host "   vercel inspect" -ForegroundColor Gray
Write-Host ""

# Open the deployment in browser
$openBrowser = Read-Host "Open deployment in browser? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Process "https://eapaser-flahqpoq5-my-ip-address.vercel.app"
}

Write-Host ""
Write-Host "🎉 Happy coding!" -ForegroundColor Magenta
Write-Host ""