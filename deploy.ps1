Write-Host "🚀 TrendSense Production Deployment" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "📝 Please copy .env.example to .env and configure your API keys" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Error: Docker is not running" -ForegroundColor Red
    Write-Host "Please start Docker and try again" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment check passed" -ForegroundColor Green
Write-Host ""
Write-Host "🔨 Building containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build

Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

Write-Host ""
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🏥 Health check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8000/health"
    Write-Host "Backend status: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "Backend not ready yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access points:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost"
Write-Host "   Backend API: http://localhost:8000"
Write-Host "   API Docs: http://localhost:8000/docs"
Write-Host ""
Write-Host "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Yellow
Write-Host "🛑 Stop services: docker-compose -f docker-compose.prod.yml down" -ForegroundColor Yellow
