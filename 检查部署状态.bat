@echo off
echo ========================================
echo  GitHub Pages部署状态检查
echo ========================================
echo.

echo 您的应用地址: https://yandongguo27.github.io/tie-dye-design/
echo.

echo 请按以下步骤检查部署状态:
echo.

echo 1. 打开GitHub仓库:
echo    https://github.com/yandongguo27/tie-dye-design
echo.

echo 2. 点击 "Actions" 标签页
echo    - 查看最新的workflow运行状态
echo    - 应该有一个 "pages build and deployment" 的workflow
echo    - 状态应该是绿色对勾(成功)或黄色圆圈(进行中)
echo.

echo 3. 如果workflow失败，点击进入查看错误信息
echo.

echo 4. 如果workflow成功但页面仍显示404:
echo    - 等待5-10分钟让CDN更新
echo    - 尝试清除浏览器缓存 (Ctrl+F5)
echo    - 尝试无痕模式访问
echo.

echo 5. 检查Pages设置是否正确:
echo    - 进入 Settings -^> Pages
echo    - Source: "Deploy from a branch"
echo    - Branch: "main"
echo    - Folder: "/ (root)"
echo.

echo ========================================
echo 常见问题解决方案:
echo ========================================
echo.

echo 问题1: 仍然显示404
echo 解决: 确认vite.config.ts中的base路径设置为 '/tie-dye-design/'
echo.

echo 问题2: 资源文件加载失败
echo 解决: 检查所有图片和资源路径是否正确
echo.

echo 问题3: 路由不工作
echo 解决: 单页应用需要正确的重定向配置(已添加)
echo.

pause