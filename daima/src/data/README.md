# 纹样库数据导入说明

## 📋 数据格式要求

### JSON文件结构
```json
{
  "patterns": [
    {
      "id": "pattern-001",
      "culturalArtifact": {
        "name": "文物名称",
        "image": "/images/artifacts/artifact.jpg",
        "description": "文物描述"
      },
      "extractedImage": {
        "image": "/images/extracted/pattern.jpg"
      },
      "patternName": {
        "name": "纹样名称"
      },
      "patternSemantics": {
        "description": "纹样语义描述"
      },
      "elementExtraction": {
        "image": "/images/elements/elements.jpg"
      },
      "vectorPattern": {
        "image": "/images/vectors/vector.svg"
      },
      "innovativePattern": {
        "image": "/images/innovative/innovative.jpg"
      }
    }
  ]
}
```

## 🎯 使用步骤

### 1. 准备数据
1. 点击"下载模板"按钮获取标准JSON模板
2. 按照模板格式填写你的文物和纹样数据
3. 确保图片路径正确（相对于public目录）

### 2. 导入数据
1. 点击"导入数据"按钮
2. 选择准备好的JSON文件
3. 系统会自动验证格式并导入数据

### 3. 管理数据
- **查看统计**: 右上角显示当前数据条数
- **搜索功能**: 使用搜索框查找特定纹样
- **清空数据**: 点击"清空数据"按钮重置

## 📁 图片资源管理

### 建议的目录结构
```
public/
├── images/
│   ├── artifacts/     # 文物原型图片
│   ├── extracted/     # 提取的纹样图片
│   ├── elements/      # 元素提取图片
│   ├── vectors/       # 矢量图文件
│   └── innovative/    # 创新纹样图片
```

### 图片格式要求
- **支持格式**: JPG, PNG, SVG
- **建议尺寸**: 500x500px 以上
- **文件大小**: 建议不超过2MB

## ⚠️ 注意事项

1. **JSON格式**: 必须是有效的JSON格式，注意逗号和引号
2. **图片路径**: 使用相对路径，以/开头
3. **数据备份**: 建议定期备份重要数据
4. **浏览器兼容**: 建议使用现代浏览器（Chrome, Firefox, Safari）

## 🔧 故障排除

### 常见问题
- **导入失败**: 检查JSON格式是否正确
- **图片不显示**: 确认图片路径和文件是否存在
- **数据丢失**: 刷新页面会清空未保存的数据

### 技术支持
如遇到问题，请检查浏览器控制台的错误信息。
