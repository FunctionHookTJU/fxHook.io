<#
.SYNOPSIS
    监听 Git 仓库远程变化，自动拉取最新分支到本地。

.DESCRIPTION
    定期检查远程仓库是否有新的提交，一旦检测到更新则自动执行 git pull。
    适用于需要保持本地仓库与远程同步的场景（如部署服务器、持续集成等）。

.PARAMETER RepoPath
    Git 仓库的本地路径，默认为脚本所在项目的根目录。

.PARAMETER Branch
    要监听的分支名称，默认为当前所在分支。

.PARAMETER Interval
    检查间隔（秒），默认 60 秒。

.PARAMETER Remote
    远程仓库名称，默认 origin。

.PARAMETER Once
    只执行一次检查并拉取，不循环监听。

.EXAMPLE
    .\auto-pull.ps1
    每 60 秒检查一次远程 origin 的当前分支，有更新则自动拉取。

.EXAMPLE
    .\auto-pull.ps1 -Branch main -Interval 30
    每 30 秒检查远程 origin 的 main 分支，有更新则自动拉取。

.EXAMPLE
    .\auto-pull.ps1 -Once
    只执行一次检查并拉取，然后退出。

.NOTES
    需要 PowerShell 5.0+ 和 Git 已安装在系统 PATH 中。
#>

param(
    [string]$RepoPath = "",
    [string]$Branch = "",
    [int]$Interval = 60,
    [string]$Remote = "origin",
    [switch]$Once
)

$ErrorActionPreference = "Stop"

if (-not $RepoPath) {
    $RepoPath = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
}

if (-not (Test-Path $RepoPath)) {
    Write-Error "仓库路径不存在: $RepoPath"
    exit 1
}

Push-Location $RepoPath

try {
    if (-not (Test-Path ".git")) {
        Write-Error "指定路径不是 Git 仓库: $RepoPath"
        exit 1
    }

    if (-not $Branch) {
        $Branch = git rev-parse --abbrev-ref HEAD 2>$null
        if (-not $Branch -or $Branch -eq "HEAD") {
            Write-Error "无法获取当前分支名称，请使用 -Branch 参数指定"
            exit 1
        }
    }

    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Git 自动拉取监听器" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  仓库路径 : $RepoPath" -ForegroundColor White
    Write-Host "  远程仓库 : $Remote" -ForegroundColor White
    Write-Host "  监听分支 : $Branch" -ForegroundColor White
    Write-Host "  检查间隔 : $Interval 秒" -ForegroundColor White
    Write-Host "  运行模式 : $(if ($Once) { '单次' } else { '持续监听' })" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    $totalPulls = 0

    do {
        $timeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Write-Host "[$timeStamp] 正在检查远程更新..." -ForegroundColor Gray

        $ErrorActionPreference = "Continue"

        $fetchResult = git fetch $Remote $Branch 2>&1
        if ($LASTEXITCODE -ne 0) {
            $fetchError = $fetchResult -join " "
            Write-Host "[$timeStamp] 获取远程信息失败: $fetchError" -ForegroundColor Yellow
            Write-Host "[$timeStamp] 等待 $Interval 秒后重试..." -ForegroundColor Gray
            if (-not $Once) { Start-Sleep -Seconds $Interval }
            continue
        }

        $localHash = git rev-parse HEAD 2>$null
        $remoteHash = git rev-parse "$Remote/$Branch" 2>$null

        if (-not $localHash -or -not $remoteHash) {
            Write-Host "[$timeStamp] 无法获取 commit hash，请检查分支名称和远程配置" -ForegroundColor Red
            if (-not $Once) { Start-Sleep -Seconds $Interval }
            continue
        }

        if ($localHash -eq $remoteHash) {
            Write-Host "[$timeStamp] 本地已是最新，无需拉取" -ForegroundColor DarkGray
        }
        else {
            $behindCount = git rev-list --count HEAD.."$Remote/$Branch" 2>$null
            Write-Host "[$timeStamp] 检测到 $behindCount 个新提交，正在拉取..." -ForegroundColor Green

            $pullResult = git pull $Remote $Branch 2>&1
            if ($LASTEXITCODE -eq 0) {
                $totalPulls++
                $newHash = git rev-parse --short HEAD 2>$null
                Write-Host "[$timeStamp] 拉取成功! 当前 HEAD: $newHash (累计拉取: $totalPulls 次)" -ForegroundColor Green
            }
            else {
                $pullError = $pullResult -join " "
                Write-Host "[$timeStamp] 拉取失败: $pullError" -ForegroundColor Red
            }
        }

        if (-not $Once) {
            Write-Host "[$timeStamp] 等待 $Interval 秒后进行下一次检查..." -ForegroundColor Gray
            Start-Sleep -Seconds $Interval
        }
    } while (-not $Once)

    Write-Host ""
    Write-Host "任务完成，累计拉取 $totalPulls 次。" -ForegroundColor Cyan
}
finally {
    Pop-Location
}
