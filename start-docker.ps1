# Docker 部署验证脚本

Write-Host "🐳 开始验证 Docker 部署..." -ForegroundColor Cyan

# 检查 Docker 是否安装
Write-Host "`n1️⃣ 检查 Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    docker --version
    Write-Host "✅ Docker 已安装" -ForegroundColor Green
} else {
    Write-Host "❌ Docker 未安装，请先安装 Docker Desktop" -ForegroundColor Red
    exit 1
}

# 检查 Docker Compose 是否可用
Write-Host "`n2️⃣ 检查 Docker Compose..." -ForegroundColor Yellow
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    docker-compose --version
    Write-Host "✅ Docker Compose 已安装" -ForegroundColor Green
} else {
    # 尝试使用 docker compose（新版本）
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $composeVersion
        Write-Host "✅ Docker Compose (V2) 已安装" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Compose 未安装" -ForegroundColor Red
        exit 1
    }
}

# 检查必要文件
Write-Host "`n3️⃣ 检查必要文件..." -ForegroundColor Yellow
$requiredFiles = @(
    "docker-compose.yml",
    "nginx.conf",
    "backend\Dockerfile",
    "backend\server.js",
    "backend\package.json"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file 不存在" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n❌ 缺少必要文件，请检查项目完整性" -ForegroundColor Red
    exit 1
}

# 检查环境变量文件
Write-Host "`n4️⃣ 检查环境变量..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "  ⚠️  .env 文件不存在，从 .env.example 复制..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "  ✅ 已创建 .env 文件" -ForegroundColor Green
        Write-Host "  ⚠️  请编辑 .env 文件，修改生产环境配置（特别是 JWT_SECRET）" -ForegroundColor Yellow
    } else {
        Write-Host "  ⚠️  .env 文件不存在，将使用默认配置" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✅ .env 文件已存在" -ForegroundColor Green
}

# 询问是否启动
Write-Host "`n✨ 验证完成！" -ForegroundColor Cyan
Write-Host "准备执行: docker compose up -d --build" -ForegroundColor Yellow
$response = Read-Host "是否现在启动？(Y/N)"

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n🚀 正在启动服务..." -ForegroundColor Cyan
    docker compose up -d --build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ 服务启动成功！" -ForegroundColor Green
        Write-Host "`n📋 服务状态:" -ForegroundColor Cyan
        docker compose ps
        
        Write-Host "`n🌐 访问地址:" -ForegroundColor Cyan
        Write-Host "  前端: http://localhost" -ForegroundColor White
        Write-Host "  后端: http://localhost:3000/api" -ForegroundColor White
        Write-Host "  健康检查: http://localhost:3000/api/health" -ForegroundColor White
        
        Write-Host "`n📝 查看日志:" -ForegroundColor Cyan
        Write-Host "  docker compose logs -f" -ForegroundColor White
        
        Write-Host "`n⏹️  停止服务:" -ForegroundColor Cyan
        Write-Host "  docker compose down" -ForegroundColor White
    } else {
        Write-Host "`n❌ 服务启动失败，请查看错误信息" -ForegroundColor Red
    }
} else {
    Write-Host "`n👍 稍后可以使用以下命令启动:" -ForegroundColor Cyan
    Write-Host "  docker compose up -d --build" -ForegroundColor White
}
