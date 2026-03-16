# 扎染纹样设计应用 - GitHub Pages 部署指南

## 📋 部署步骤

### 步骤1: 准备工作
确保您的项目已经构建完成，并且所有更改已提交到Git。

### 步骤2: 创建GitHub仓库
1. 打开 [GitHub.com](https://github.com) 并登录
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `tie-dye-design` 或 `dyeing-pattern-design` (建议使用英文)
   - **Description**: 扎染纹样设计与文化创意应用
   - **Visibility**: Public (公开，这样同学才能访问)
4. **不要勾选** "Add a README file"、"Add .gitignore"、"Choose a license"
5. 点击 "Create repository"

### 步骤3: 获取仓库URL
创建仓库后，GitHub会显示仓库URL，格式如下：
```
https://github.com/你的用户名/tie-dye-design.git
```
复制这个URL，准备下一步使用。

### 步骤4: 运行部署脚本
双击运行 `github-pages部署.bat` 文件，按照提示操作。

### 步骤5: 启用GitHub Pages
1. 进入您的GitHub仓库页面
2. 点击顶部的 **"Settings"** 标签
3. 在左侧菜单中找到并点击 **"Pages"**
4. 在 "Source" 部分：
   - Branch: 选择 **"main"**
   - Folder: 选择 **"/ (root)"**
5. 点击 **"Save"**

### 步骤6: 等待部署
- GitHub Pages 通常需要 2-5 分钟来部署
- 部署完成后，您会看到绿色提示和访问链接
- 访问地址格式：`https://你的用户名.github.io/仓库名称/`

## 🔧 手动部署步骤 (如果脚本失败)

如果自动脚本遇到问题，可以手动执行以下命令：

```bash
# 1. 提交所有更改
git add .
git commit -m "准备GitHub Pages部署"

# 2. 重新构建
npm run build

# 3. 添加远程仓库 (替换为您的仓库URL)
git remote add origin https://github.com/你的用户名/仓库名.git

# 4. 推送代码
git branch -M main
git push -u origin main
```

## 🎯 最终结果

部署成功后，您的同学可以通过以下方式访问应用：
- **主页面**: `https://你的用户名.github.io/仓库名/`
- **纹样库**: `https://你的用户名.github.io/仓库名/pattern-library`
- **其他页面**: 相应路由

## 🛠️ 故障排除

### 问题1: 页面显示404
- 确保GitHub Pages设置正确选择了main分支
- 等待几分钟让部署完成

### 问题2: 样式或图片不显示
- 检查 `dist` 文件夹是否完整上传
- 确保所有资源文件都在 `dist` 文件夹中

### 问题3: 路由不工作
- GitHub Pages对SPA路由需要特殊配置
- 如果遇到路由问题，可以添加 `.nojekyll` 文件

## 📞 获取帮助

如果遇到问题：
1. 检查浏览器开发者工具的控制台错误
2. 确认GitHub仓库设置正确
3. 查看GitHub Pages部署状态

---

**🎉 部署完成后，分享您的应用链接给同学吧！**