@echo off
echo ========================================
echo  将dist文件移动到根目录 - 修复GitHub Pages
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 备份当前的根目录文件...
if exist "root_backup" rmdir /s /q "root_backup" 2>nul
mkdir root_backup
copy "index.html" "root_backup\" >nul 2>&1
xcopy "dist\*" "root_backup\" /E /I /H /Y >nul 2>&1
echo ✓ 备份完成

echo.
echo [2/3] 将dist文件夹内容移动到根目录...
xcopy "dist\*.*" "." /Y >nul 2>&1
xcopy "dist\assets" "assets\" /E /I /H /Y >nul 2>&1
xcopy "dist\images" "images\" /E /I /H /Y >nul 2>&1
echo ✓ 文件移动完成

echo.
echo [3/3] 提交更改并推送...
git add .
git commit -m "fix: 将构建文件移动到根目录供GitHub Pages使用"
git push origin main
echo ✓ 推送完成

echo.
echo ========================================
echo        修复完成！
echo ========================================
echo.
echo 现在GitHub Pages应该能正确加载了。
echo 访问: https://yandongguo27.github.io/tie-dye-design/
echo.
echo 如果仍有问题，请等待5分钟让CDN更新。
echo.

pause