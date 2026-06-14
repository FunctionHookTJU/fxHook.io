@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

:: ============================================
::  Git 自动拉取监听器 (CMD 版本)
:: ============================================

set "REPO_PATH="
set "BRANCH="
set "INTERVAL=60"
set "REMOTE=origin"
set "ONCE=0"

:: 解析命令行参数
:parse_args
if "%~1"=="" goto :validate
if /i "%~1"=="-RepoPath"    set "REPO_PATH=%~2" & shift & shift & goto :parse_args
if /i "%~1"=="-Branch"      set "BRANCH=%~2"    & shift & shift & goto :parse_args
if /i "%~1"=="-Interval"    set "INTERVAL=%~2"  & shift & shift & goto :parse_args
if /i "%~1"=="-Remote"      set "REMOTE=%~2"    & shift & shift & goto :parse_args
if /i "%~1"=="-Once"        set "ONCE=1"         & shift & goto :parse_args
if /i "%~1"=="-Help"        goto :show_help
if /i "%~1"=="-h"           goto :show_help
if /i "%~1"=="--help"       goto :show_help
echo [警告] 未知参数: %~1
shift
goto :parse_args

:validate
:: 默认仓库路径为项目根目录 (脚本在 ps 文件夹中)
if "%REPO_PATH%"=="" set "REPO_PATH=%~dp0.."
:: 规范化路径
for %%i in ("%REPO_PATH%") do set "REPO_PATH=%%~fi"

if not exist "%REPO_PATH%" (
    echo [错误] 仓库路径不存在: %REPO_PATH%
    exit /b 1
)

if not exist "%REPO_PATH%\.git" (
    echo [错误] 指定路径不是 Git 仓库: %REPO_PATH%
    exit /b 1
)

:: 默认分支为 master
if "%BRANCH%"=="" set "BRANCH=master"

if "%ONCE%"=="1" (set "MODE_TEXT=单次") else (set "MODE_TEXT=持续监听")

echo ========================================
echo   Git 自动拉取监听器 (CMD)
echo ========================================
echo   仓库路径 : %REPO_PATH%
echo   远程仓库 : %REMOTE%
echo   监听分支 : %BRANCH%
echo   检查间隔 : %INTERVAL% 秒
echo   运行模式 : %MODE_TEXT%
echo ========================================
echo.

set "TOTAL_PULLS=0"

:loop
:: 获取时间戳
for /f "tokens=1-3 delims=/- " %%a in ('echo %date%') do (
    set "TS_DATE=%%a-%%b-%%c"
)
for /f "tokens=1-3 delims=:. " %%a in ('echo %time%') do (
    set "TS_TIME=%%a:%%b:%%c"
)
set "TIMESTAMP=%TS_DATE% %TS_TIME%"

echo [%TIMESTAMP%] 正在检查远程更新...

pushd "%REPO_PATH%"

:: git fetch
git fetch %REMOTE% %BRANCH% >nul 2>&1
if errorlevel 1 (
    echo [%TIMESTAMP%] 获取远程信息失败，等待 %INTERVAL% 秒后重试...
    popd
    if "%ONCE%"=="1" exit /b 1
    timeout /t %INTERVAL% /nobreak >nul
    goto :loop
)

:: 获取本地和远程 commit hash
for /f "delims=" %%i in ('git rev-parse HEAD 2^>nul') do set "LOCAL_HASH=%%i"
for /f "delims=" %%i in ('git rev-parse %REMOTE%/%BRANCH% 2^>nul') do set "REMOTE_HASH=%%i"

if "%LOCAL_HASH%"=="" (
    echo [%TIMESTAMP%] 无法获取本地 commit hash
    popd
    if "%ONCE%"=="1" exit /b 1
    timeout /t %INTERVAL% /nobreak >nul
    goto :loop
)

if "%REMOTE_HASH%"=="" (
    echo [%TIMESTAMP%] 无法获取远程 commit hash，请检查分支名称和远程配置
    popd
    if "%ONCE%"=="1" exit /b 1
    timeout /t %INTERVAL% /nobreak >nul
    goto :loop
)

if "%LOCAL_HASH%"=="%REMOTE_HASH%" (
    echo [%TIMESTAMP%] 本地已是最新，无需拉取
) else (
    for /f "delims=" %%i in ('git rev-list --count HEAD..%REMOTE%/%BRANCH% 2^>nul') do set "BEHIND=%%i"
    echo [%TIMESTAMP%] 检测到 %BEHIND% 个新提交，正在拉取...

    git pull %REMOTE% %BRANCH%
    if errorlevel 1 (
        echo [%TIMESTAMP%] 拉取失败!
    ) else (
        set /a TOTAL_PULLS+=1
        for /f "delims=" %%i in ('git rev-parse --short HEAD 2^>nul') do set "NEW_HASH=%%i"
        echo [%TIMESTAMP%] 拉取成功! 当前 HEAD: !NEW_HASH! (累计拉取: !TOTAL_PULLS! 次)
    )
)

popd

if "%ONCE%"=="1" goto :done

echo [%TIMESTAMP%] 等待 %INTERVAL% 秒后进行下一次检查...
timeout /t %INTERVAL% /nobreak >nul
goto :loop

:done
echo.
echo 任务完成，累计拉取 %TOTAL_PULLS% 次。
exit /b 0

:show_help
echo 用法: auto-pull.cmd [选项]
echo.
echo 选项:
echo   -RepoPath ^<路径^>    Git 仓库本地路径 (默认: 项目根目录)
echo   -Branch   ^<分支名^>  监听的分支 (默认: master)
echo   -Interval ^<秒数^>   检查间隔 (默认: 60)
echo   -Remote   ^<名称^>   远程仓库名 (默认: origin)
echo   -Once               仅执行一次后退出
echo   -Help               显示此帮助
echo.
echo 示例:
echo   auto-pull.cmd
echo   auto-pull.cmd -Branch main -Interval 30
echo   auto-pull.cmd -Once
exit /b 0
