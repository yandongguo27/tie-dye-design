@echo off
echo ========================================
echo  修复GitHub Pages部署 - 移动文件到根目录
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] 备份当前文件...
if not exist "backup" mkdir backup
xcopy "daima\*" "backup\" /E /I /H /Y >nul 2>&1
echo ✓ 备份完成

echo.
echo [2/4] 移动项目文件到根目录...
xcopy "daima\index.html" "." /Y >nul 2>&1
xcopy "daima\package.json" "." /Y >nul 2>&1
xcopy "daima\package-lock.json" "." /Y >nul 2>&1
xcopy "daima\vite.config.ts" "." /Y >nul 2>&1
xcopy "daima\tsconfig*.json" "." /Y >nul 2>&1
xcopy "daima\postcss.config.js" "." /Y >nul 2>&1
xcopy "daima\tailwind.config.js" "." /Y >nul 2>&1
xcopy "daima\eslint.config.js" "." /Y >nul 2>&1
xcopy "daima\src" "src\" /E /I /H /Y >nul 2>&1
xcopy "daima\public" "public\" /E /I /H /Y >nul 2>&1
xcopy "daima\dist" "dist\" /E /I /H /Y >nul 2>&1
echo ✓ 文件移动完成

echo.
echo [3/4] 提交更改到Git...
git add .
git commit -m "fix: 移动项目文件到根目录以支持GitHub Pages"
echo ✓ Git提交完成

echo.
echo [4/4] 推送更改...
git push origin main
echo ✓ 推送完成

echo.
echo ========================================
echo        修复完成！请按以下步骤操作:
echo ========================================
echo.
echo 1. 等待GitHub Pages重新部署 (2-5分钟)
echo 2. 访问: https://yandongguo27.github.io/tie-dye-design/
echo 3. 如果仍有问题，清除浏览器缓存后重试
echo.
echo ========================================

pause