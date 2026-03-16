@echo off
echo ========================================
echo  扎染纹样设计应用 - GitHub Pages部署
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] 提交本地更改...
git add .
git commit -m "feat: 准备GitHub Pages部署"
echo ✓ 本地提交完成

echo.
echo [2/5] 重新构建生产版本...
if exist "dist" rmdir /s /q "dist"
call npm run build
if errorlevel 1 (
    echo 错误: 构建失败
    pause
    exit /b 1
)
echo ✓ 构建完成

echo.
echo [3/5] 配置GitHub Pages...
echo 请按以下步骤操作:
echo 1. 打开 https://github.com/new 创建新仓库
echo 2. 仓库名称建议: tie-dye-design 或 dyeing-pattern-design
echo 3. 不要初始化README、.gitignore、license
echo 4. 创建仓库后，复制仓库URL
echo.
set /p repo_url="请输入GitHub仓库URL (https://github.com/username/repo.git): "

echo.
echo [4/5] 推送代码到GitHub...
if "%repo_url%"=="" (
    echo 错误: 仓库URL不能为空
    pause
    exit /b 1
)

git remote add origin "%repo_url%" 2>nul
git branch -M main
git push -u origin main
if errorlevel 1 (
    echo 错误: 推送失败，请检查URL是否正确
    pause
    exit /b 1
)
echo ✓ 代码推送完成

echo.
echo [5/5] 启用GitHub Pages...
echo 请按以下步骤启用GitHub Pages:
echo 1. 进入GitHub仓库页面
echo 2. 点击 "Settings" 标签
echo 3. 在左侧菜单中找到 "Pages"
echo 4. 在 "Source" 下拉菜单中选择 "Deploy from a branch"
echo 5. 在 "Branch" 下拉菜单中选择 "main" 分支
echo 6. 点击 "Save"
echo.
echo 等待几分钟后，您的应用将在以下地址可用:
echo https://[您的用户名].github.io/[仓库名称]/
echo.
echo 例如: https://yourusername.github.io/tie-dye-design/
echo.

pause