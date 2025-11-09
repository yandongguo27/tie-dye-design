

import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface PatternOption {
  id: string;
  name: string;
  image: string;
}

const ApplicationPage: React.FC = () => {
  // 状态管理
  const [selectedProductFile, setSelectedProductFile] = useState<File | null>(null);
  const [showProductPreview, setShowProductPreview] = useState(false);
  const [productImageSrc, setProductImageSrc] = useState('');
  const [showPatternSelectorModal, setShowPatternSelectorModal] = useState(false);
  const [selectedPatternId, setSelectedPatternId] = useState('pattern1');
  const [selectedSize, setSelectedSize] = useState('300x300');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultImageSrc, setResultImageSrc] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  // Refs for image manipulation
  const productImageRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startWidthRef = useRef(0);
  const startHeightRef = useRef(0);
  const startLeftRef = useRef(0);
  const startTopRef = useRef(0);

  // 纹样选项数据
  const patternOptions: PatternOption[] = [
    { id: 'pattern1', name: '传统蓝白', image: 'https://s.coze.cn/image/048pAbfo5GE/' },
    { id: 'pattern2', name: '撞色渐变', image: 'https://s.coze.cn/image/fI_v5eeonEg/' },
    { id: 'pattern3', name: '水墨风格', image: 'https://s.coze.cn/image/8VkwF8f9SJk/' },
    { id: 'pattern4', name: '几何线条', image: 'https://s.coze.cn/image/URtyre_S0Zs/' }
  ];

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '产品应用 - 染纹创合';
    return () => { document.title = originalTitle; };
  }, []);

  // 保存到历史记录
  const saveToHistory = (data: any) => {
    try {
      const historyKey = 'pattern_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const newRecord = {
        id: `history-${Date.now()}`,
        name: `${data.patternName} - 产品应用`,
        type: data.type,
        productImage: data.productImage,
        patternImage: data.patternImage,
        patternName: data.patternName,
        resultImage: data.resultImage,
        size: data.size,
        time: new Date().toLocaleString('zh-CN'),
        timestamp: Date.now()
      };
      
      existingHistory.unshift(newRecord);
      
      // 只保留最近100条记录
      if (existingHistory.length > 100) {
        existingHistory.length = 100;
      }
      
      localStorage.setItem(historyKey, JSON.stringify(existingHistory));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  };

  // 文件输入处理
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedProductFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProductImageSrc(e.target.result as string);
          setShowProductPreview(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 移除产品图片
  const handleRemoveProduct = () => {
    setSelectedProductFile(null);
    setProductImageSrc('');
    setShowProductPreview(false);
    if (productImageRef.current) {
      productImageRef.current.style.width = '';
      productImageRef.current.style.height = '';
      productImageRef.current.style.left = '';
      productImageRef.current.style.top = '';
    }
  };

  // 切换纹样
  const handleSwitchPattern = () => {
    setShowPatternSelectorModal(true);
  };

  // 关闭模态弹窗
  const handleCloseModal = () => {
    setShowPatternSelectorModal(false);
  };

  // 选择纹样
  const handlePatternSelect = (patternId: string) => {
    setSelectedPatternId(patternId);
  };

  // 确认选择纹样
  const handleConfirmPatternSelection = () => {
    setShowPatternSelectorModal(false);
  };

  // 尺寸选择
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setCustomWidth('');
    setCustomHeight('');
  };

  // 自定义尺寸输入
  const handleCustomWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomWidth(event.target.value);
    setSelectedSize('custom');
  };

  const handleCustomHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomHeight(event.target.value);
    setSelectedSize('custom');
  };

  // 生成产品效果图 - 实际将纹样应用到产品上
  const handleGeneratePreview = async () => {
    if (!productImageSrc) {
      alert('请先上传产品图片');
      return;
    }

    setIsGenerating(true);
    setShowResult(false);

    try {
      // 创建 canvas 进行图片合成
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
      }

      // 加载产品图片
      const productImg = new Image();
      productImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        productImg.onload = resolve;
        productImg.onerror = reject;
        productImg.src = productImageSrc;
      });

      // 加载纹样图片
      const patternImg = new Image();
      patternImg.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        patternImg.onload = resolve;
        patternImg.onerror = reject;
        patternImg.src = currentPattern.image;
      });

      // 设置 canvas 大小
      canvas.width = productImg.width;
      canvas.height = productImg.height;

      // 绘制产品图片作为底图
      ctx.drawImage(productImg, 0, 0);

      // 根据选择的尺寸计算纹样大小
      let patternWidth, patternHeight;
      if (selectedSize === 'custom') {
        patternWidth = parseInt(customWidth) || 300;
        patternHeight = parseInt(customHeight) || 300;
      } else {
        const [width, height] = selectedSize.split('x').map(Number);
        patternWidth = width;
        patternHeight = height;
      }

      // 将纹样绘制在产品中心位置
      const x = (canvas.width - patternWidth) / 2;
      const y = (canvas.height - patternHeight) / 2;

      // 使用混合模式使纹样更自然地融入产品
      ctx.globalAlpha = 0.8;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(patternImg, x, y, patternWidth, patternHeight);
      
      // 恢复默认设置
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = 'source-over';

      // 将结果转换为图片
      const resultDataUrl = canvas.toDataURL('image/png');
      
      setIsGenerating(false);
      setShowResult(true);
      setResultImageSrc(resultDataUrl);

      // 保存到历史记录
      saveToHistory({
        type: 'application',
        productImage: productImageSrc,
        patternImage: currentPattern.image,
        patternName: currentPattern.name,
        resultImage: resultDataUrl,
        size: selectedSize === 'custom' ? `${customWidth}x${customHeight}` : selectedSize
      });
      
    } catch (error) {
      console.error('生成预览时出错:', error);
      alert('生成预览失败，请重试');
      setIsGenerating(false);
    }
  };

  // 下载效果图
  const handleDownloadResult = () => {
    if (resultImageSrc) {
      const link = document.createElement('a');
      link.href = resultImageSrc;
      link.download = 'product-preview.png';
      link.click();
    }
  };

  // 重新生成
  const handleRegenerateResult = () => {
    handleGeneratePreview();
  };

  // 图片调整功能
  const handleResizeToggle = () => {
    setIsResizing(!isResizing);
    setIsMoving(false);
    if (productImageRef.current) {
      productImageRef.current.style.cursor = isResizing ? 'default' : 'nwse-resize';
    }
  };

  const handleMoveToggle = () => {
    setIsMoving(!isMoving);
    setIsResizing(false);
    if (productImageRef.current) {
      productImageRef.current.style.cursor = isMoving ? 'default' : 'move';
    }
  };

  const handleImageMouseDown = (event: React.MouseEvent<HTMLImageElement>) => {
    if (isResizing || isMoving) {
      event.preventDefault();
      startXRef.current = event.clientX;
      startYRef.current = event.clientY;
      
      if (productImageRef.current) {
        const style = window.getComputedStyle(productImageRef.current);
        if (isResizing) {
          startWidthRef.current = parseInt(style.width, 10);
          startHeightRef.current = parseInt(style.height, 10);
        } else if (isMoving) {
          startLeftRef.current = parseInt(style.left, 10) || 0;
          startTopRef.current = parseInt(style.top, 10) || 0;
        }
      }
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    event.preventDefault();
    
    if (productImageRef.current) {
      if (isResizing) {
        const width = startWidthRef.current + (event.clientX - startXRef.current);
        const height = startHeightRef.current + (event.clientY - startYRef.current);
        
        if (width > 50 && height > 50) {
          productImageRef.current.style.width = width + 'px';
          productImageRef.current.style.height = height + 'px';
        }
      } else if (isMoving) {
        const left = startLeftRef.current + (event.clientX - startXRef.current);
        const top = startTopRef.current + (event.clientY - startYRef.current);
        
        const container = productImageRef.current.parentElement;
        if (container) {
          const containerRect = container.getBoundingClientRect();
          const imageRect = productImageRef.current.getBoundingClientRect();
          
          if (left <= containerRect.width - imageRect.width && left >= 0) {
            productImageRef.current.style.left = left + 'px';
          }
          if (top <= containerRect.height - imageRect.height && top >= 0) {
            productImageRef.current.style.top = top + 'px';
          }
        }
      }
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // 获取当前选中的纹样
  const currentPattern = patternOptions.find(p => p.id === selectedPatternId) || patternOptions[0];

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${styles.glassCard}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                <i className="fas fa-palette text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-white">染纹创合</span>
            </div>
            
            {/* 主导航菜单 */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>首页</Link>
              <Link to="/pattern-design" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>纹样设计</Link>
              <Link to="/element-combine" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>元素组合</Link>
              <Link to="/application" className={`${styles.navLink} ${styles.active} text-white py-2`}>服饰/首饰应用</Link>
              <Link to="/history" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>历史记录</Link>
              <Link to="/help" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>帮助指南</Link>
            </div>
            
            {/* 用户头像 */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center">
                <i className="fas fa-user text-white text-sm"></i>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 页面头部 */}
          <header className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-white/60 mb-2">
              <Link to="/home" className="hover:text-white">首页</Link>
              <i className="fas fa-chevron-right text-xs"></i>
              <span className="text-white">产品应用</span>
            </div>
            <h1 className="text-3xl font-bold text-white">产品应用</h1>
            <p className="text-white/70 mt-2">将您设计的精美纹样应用到服饰、首饰或文创产品上</p>
          </header>

          {/* 左侧输入区 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
              {/* 产品图片上传区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-tshirt mr-3 text-white/80"></i>
                  产品图片上传
                </h2>
                <div className={`${styles.uploadArea} rounded-xl p-6 text-center`}>
                  {!showProductPreview ? (
                    <div>
                      <i className="fas fa-cloud-upload-alt text-4xl text-white/60 mb-4"></i>
                      <h3 className="text-lg font-medium text-white mb-2">上传产品图片</h3>
                      <p className="text-sm text-white/70 mb-4">请上传平整的服饰/首饰/文创产品图片，如T恤、围巾、耳环、笔记本封面等</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={handleFileInputChange}
                        ref={(input) => {
                          // Create a hidden file input and trigger it on button click
                          const handleSelectFile = () => {
                            input?.click();
                          };
                          // Add click handler to the button
                          const button = document.getElementById('select-product-file');
                          if (button) {
                            button.onclick = handleSelectFile;
                          }
                        }}
                      />
                      <button 
                        id="select-product-file"
                        className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                      >
                        <i className="fas fa-folder-open mr-2"></i>
                        选择文件
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="relative w-full aspect-square bg-white/5 rounded-lg overflow-hidden mb-4">
                        <img 
                          ref={productImageRef}
                          src={productImageSrc} 
                          alt="产品图片预览" 
                          className="absolute top-0 left-0 w-full h-full object-contain"
                          onMouseDown={handleImageMouseDown}
                        />
                        {/* 调整控制按钮 */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                          <button 
                            onClick={handleResizeToggle}
                            className={`${styles.glassButton} px-3 py-1 rounded-lg text-white text-sm ${isResizing ? 'bg-white/20' : ''}`}
                          >
                            <i className="fas fa-expand-arrows-alt mr-1"></i>
                            调整大小
                          </button>
                          <button 
                            onClick={handleMoveToggle}
                            className={`${styles.glassButton} px-3 py-1 rounded-lg text-white text-sm ${isMoving ? 'bg-white/20' : ''}`}
                          >
                            <i className="fas fa-arrows-alt mr-1"></i>
                            移动位置
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={handleRemoveProduct}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        删除
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* 已选中的待用纹样区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-star mr-3 text-white/80"></i>
                  已选中的待用纹样
                </h2>
                <div className="text-center">
                  <div className="mb-4">
                    <div className={`${styles.patternGrid} w-32 h-32 mx-auto rounded-lg overflow-hidden`}>
                      <img 
                        src={currentPattern.image} 
                        alt="已选中的待用纹样" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleSwitchPattern}
                    className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                  >
                    <i className="fas fa-exchange-alt mr-2"></i>
                    切换纹样
                  </button>
                </div>
              </section>

              {/* 效果图尺寸选择区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-expand-arrows-alt mr-3 text-white/80"></i>
                  效果图尺寸选择
                </h2>
                <div className="space-y-4">
                  {/* 预设尺寸 */}
                  <div className="space-y-2">
                    <label className="block text-white/90 font-medium">预设尺寸</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div 
                        className={`${styles.sizeOption} ${selectedSize === '300x300' ? styles.selected : ''} rounded-lg p-3 text-center`}
                        onClick={() => handleSizeSelect('300x300')}
                      >
                        <div className="text-white font-medium text-sm">小</div>
                        <div className="text-white/70 text-xs">300x300</div>
                      </div>
                      <div 
                        className={`${styles.sizeOption} ${selectedSize === '600x600' ? styles.selected : ''} rounded-lg p-3 text-center`}
                        onClick={() => handleSizeSelect('600x600')}
                      >
                        <div className="text-white font-medium text-sm">中</div>
                        <div className="text-white/70 text-xs">600x600</div>
                      </div>
                      <div 
                        className={`${styles.sizeOption} ${selectedSize === '1200x1200' ? styles.selected : ''} rounded-lg p-3 text-center`}
                        onClick={() => handleSizeSelect('1200x1200')}
                      >
                        <div className="text-white font-medium text-sm">大</div>
                        <div className="text-white/70 text-xs">1200x1200</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 自定义尺寸 */}
                  <div className="space-y-2">
                    <label className="block text-white/90 font-medium">自定义尺寸</label>
                    <div className="flex space-x-2">
                      <input 
                        type="number" 
                        placeholder="宽度" 
                        value={customWidth}
                        onChange={handleCustomWidthChange}
                        className="w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                      />
                      <span className="text-white/70 flex items-center">:</span>
                      <input 
                        type="number" 
                        placeholder="高度" 
                        value={customHeight}
                        onChange={handleCustomHeightChange}
                        className="w-24 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                      />
                    </div>
                    <p className="text-xs text-white/50">建议保持比例，最大尺寸为2000x2000</p>
                  </div>
                </div>
              </section>

              {/* 操作按钮区 */}
              <section className="text-center">
                <button 
                  onClick={handleGeneratePreview}
                  disabled={isGenerating}
                  className={`${styles.glassButton} px-12 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 w-full`}
                >
                  {isGenerating ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-3"></i>
                      生成中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic mr-3"></i>
                      生成产品效果图
                    </>
                  )}
                </button>
              </section>
            </div>

            {/* 右侧预览区 */}
            <div className="lg:col-span-2">
              {/* 产品效果图展示区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-eye mr-3 text-white/80"></i>
                  产品效果图预览
                </h2>
                
                {/* 生成前的提示 */}
                {!isGenerating && !showResult && (
                  <div className="text-center py-16">
                    <i className="fas fa-image text-6xl text-white/30 mb-4"></i>
                    <h3 className="text-lg font-medium text-white/70 mb-2">等待生成效果图</h3>
                    <p className="text-white/50">上传产品图片并选择纹样后，点击"生成产品效果图"按钮</p>
                  </div>
                )}
                
                {/* 生成中的状态 */}
                {isGenerating && (
                  <div className="text-center py-16">
                    <i className="fas fa-spinner fa-spin text-6xl text-white/60 mb-4"></i>
                    <h3 className="text-lg font-medium text-white/70 mb-2">正在生成效果图...</h3>
                    <p className="text-white/50">请稍等，AI正在为您生成精美的产品效果图</p>
                  </div>
                )}
                
                {/* 生成后的结果 */}
                {showResult && (
                  <div>
                    <div className="text-center mb-6">
                      <img 
                        src={resultImageSrc} 
                        alt="产品效果图" 
                        className="max-w-full rounded-lg shadow-lg"
                      />
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button 
                        onClick={handleDownloadResult}
                        className={`${styles.glassButton} px-8 py-3 rounded-lg text-white font-medium`}
                      >
                        <i className="fas fa-download mr-2"></i>
                        下载效果图
                      </button>
                      <button 
                        onClick={handleRegenerateResult}
                        className={`${styles.glassButton} px-8 py-3 rounded-lg text-white font-medium`}
                      >
                        <i className="fas fa-redo mr-2"></i>
                        重新生成
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* 纹样选择器模态弹窗 */}
      {showPatternSelectorModal && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className={`${styles.glassCard} rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto`}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">选择纹样</h3>
                <button 
                  onClick={handleCloseModal}
                  className="text-white/60 hover:text-white text-xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {patternOptions.map((pattern) => (
                  <div 
                    key={pattern.id}
                    className={`cursor-pointer rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${selectedPatternId === pattern.id ? 'ring-2 ring-white/50' : ''}`}
                    onClick={() => handlePatternSelect(pattern.id)}
                  >
                    <div className={`${styles.patternGrid} aspect-square`}>
                      <img 
                        src={pattern.image} 
                        alt={`纹样选项 ${pattern.name}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2 text-center">
                      <span className="text-white/80 text-sm">{pattern.name}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={handleCloseModal}
                  className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                >
                  取消
                </button>
                <button 
                  onClick={handleConfirmPatternSelection}
                  className="bg-accent text-white px-6 py-2 rounded-lg font-medium"
                >
                  确认选择
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationPage;

