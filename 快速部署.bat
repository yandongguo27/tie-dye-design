@echo off
echo ========================================
echo  扎染纹样设计应用 - 一键部署脚本
echo ========================================
echo.

cd /d "%~dp0daima"

echo [1/4] 检查构建状态...
if not exist "dist" (
    echo 错误: dist文件夹不存在，请先运行 npm run build
    pause
    exit /b 1
)
echo ✓ 构建文件存在

echo.
echo [2/4] 压缩部署文件...
if exist "deploy.zip" del "deploy.zip"
powershell "Compress-Archive -Path 'dist\*' -DestinationPath 'deploy.zip' -Force"
echo ✓ 文件压缩完成

echo.
echo [3/4] 生成部署信息...
echo 部署包大小: & dir deploy.zip | findstr "deploy.zip"
echo.

echo ========================================
echo        部署完成！请按以下步骤操作:
echo ========================================
echo.
echo 1. 打开浏览器访问: https://netlify.com
echo 2. 注册/登录Netlify账号
echo 3. 点击 "Deploy manually"
echo 4. 拖拽上传生成的 "deploy.zip" 文件
echo 5. 等待部署完成，获取在线访问地址
echo.
echo 备用方案:
echo - 直接拖拽 "dist" 文件夹到Netlify
echo - 上传到GitHub后连接Netlify自动部署
echo.
echo ========================================

pause