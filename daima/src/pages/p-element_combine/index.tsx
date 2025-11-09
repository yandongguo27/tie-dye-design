

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface CompositionType {
  id: string;
  name: string;
  icon: string;
}

interface UploadedElement {
  id: string;
  file: File;
  preview: string;
  features: {
    colors: string[];
    shapes: any[];
  };
}

const ElementCombinePage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [selectedComposition, setSelectedComposition] = useState<string>('symmetric');
  const [uploadedElements, setUploadedElements] = useState<UploadedElement[]>([]);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const [combinedPreview, setCombinedPreview] = useState<string>('');
  const [elementSize, setElementSize] = useState<number>(50);
  const [spacing, setSpacing] = useState<number>(50);
  const [rotation, setRotation] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isUpdatingPreview, setIsUpdatingPreview] = useState<boolean>(false);
  const [showCombinationPreview, setShowCombinationPreview] = useState<boolean>(false);
  const [showMultiAnglePreview, setShowMultiAnglePreview] = useState<boolean>(false);
  const [isSetAsActive, setIsSetAsActive] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const elementImageRef = useRef<HTMLImageElement>(null);
  const currentScaleRef = useRef<number>(1);
  const currentXRef = useRef<number>(0);
  const currentYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);

  // 构图选项
  const compositionOptions: CompositionType[] = [
    { id: 'symmetric', name: '对称', icon: 'fas fa-balance-scale' },
    { id: 'corners', name: '置于四角', icon: 'fas fa-th' },
    { id: 'center-line', name: '中线对称', icon: 'fas fa-minus' },
    { id: 'repeat', name: '重复排列', icon: 'fas fa-copy' },
    { id: 'radial', name: '放射状', icon: 'fas fa-circle-notch' },
    { id: 'random', name: '随机分布', icon: 'fas fa-dice' }
  ];

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '元素组合 - 染纹创合';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 监听参数变化，自动更新组合预览
  useEffect(() => {
    if (uploadedElements.length > 0) {
      generateCombination();
    }
  }, [selectedComposition, elementSize, spacing, rotation, opacity]);

  // 导航处理
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // 文件选择处理
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 提取图片特征
  const extractImageFeatures = async (imageData: string): Promise<{colors: string[], shapes: any[]}> => {
    const image = new Image();
    image.src = imageData;
    await new Promise(resolve => image.onload = resolve);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    if (ctx) {
      ctx.drawImage(image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // 提取主要颜色
      const colors = extractDominantColors(imageData);
      
      // 提取形状特征
      const shapes = detectShapes(imageData);
      
      return { colors, shapes };
    }
    
    return { colors: [], shapes: [] };
  };

  // 提取主要颜色
  const extractDominantColors = (imageData: ImageData): string[] => {
    const colorMap = new Map<string, number>();
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const color = `rgb(${r},${g},${b})`;
      colorMap.set(color, (colorMap.get(color) || 0) + 1);
    }
    
    // 获取出现频率最高的颜色
    return Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([color]) => color);
  };

  // 检测形状
  const detectShapes = (imageData: ImageData): any[] => {
    // 这里可以添加更复杂的形状检测算法
    return [];
  };

  // 文件上传处理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 读取图片并提取特征
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const preview = e.target.result as string;
          const features = await extractImageFeatures(preview);
          
          const newElement: UploadedElement = {
            id: Date.now().toString(),
            file,
            preview,
            features
          };
          
          setUploadedElements(prev => [...prev, newElement]);
          setShowImagePreview(true);
          
          if (elementImageRef.current) {
            elementImageRef.current.src = preview;
          }
          
          // 生成组合预览
          generateCombination();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 生成元素组合
  const generateCombination = async () => {
    if (uploadedElements.length === 0) return;

    setIsUpdatingPreview(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 800;

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 根据选择的构图方式排列元素
        await arrangeElements(ctx, uploadedElements, selectedComposition, {
          size: elementSize,
          spacing: spacing,
          rotation: rotation,
          opacity: opacity / 100
        });

        setCombinedPreview(canvas.toDataURL('image/png'));
      }
    } catch (error) {
      console.error('生成组合预览时出错:', error);
    } finally {
      setIsUpdatingPreview(false);
    }
  };

  // 根据构图方式排列元素
  const arrangeElements = async (
    ctx: CanvasRenderingContext2D,
    elements: UploadedElement[],
    composition: string,
    params: {
      size: number;
      spacing: number;
      rotation: number;
      opacity: number;
    }
  ) => {
    const { size, spacing, rotation, opacity } = params;
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // 加载所有图片
    const baseImages = await Promise.all(
      elements.map(element => {
        return new Promise<HTMLImageElement>((resolve) => {
          const img = new Image();
          img.src = element.preview;
          img.onload = () => resolve(img);
        });
      })
    );

    // 根据构图类型决定要使用的图片数量和排列
    let images: HTMLImageElement[] = [];
    
    switch (composition) {
      case 'symmetric':
        // 对称：每个元素复制成对称的两个
        images = baseImages.flatMap(img => [img, img]);
        break;
      case 'corners':
        // 四角：确保至少4个元素
        while (images.length < 4) {
          images.push(...baseImages);
        }
        images = images.slice(0, 4);
        break;
      case 'center-line':
        // 中线对称：每个元素复制成对称的两个
        images = baseImages.flatMap(img => [img, img]);
        break;
      case 'repeat':
        // 重复排列：复制元素形成3x3网格
        const repeatCount = 9;
        while (images.length < repeatCount) {
          images.push(...baseImages);
        }
        images = images.slice(0, repeatCount);
        break;
      case 'radial':
        // 放射状：复制成12个元素围成圆圈
        const radialCount = 12;
        while (images.length < radialCount) {
          images.push(...baseImages);
        }
        images = images.slice(0, radialCount);
        break;
      case 'random':
        // 随机分布：复制成15-20个元素随机分布
        // 使用固定种子确保相同输入产生相同数量
        const seededRandomForCount = (seed: number) => {
          const x = Math.sin(seed * 9999) * 10000;
          return x - Math.floor(x);
        };
        const randomCount = 15 + Math.floor(seededRandomForCount(baseImages.length * 7) * 6);
        while (images.length < randomCount) {
          images.push(...baseImages);
        }
        images = images.slice(0, randomCount);
        break;
      default:
        images = baseImages;
    }

    ctx.globalAlpha = opacity;

    switch (composition) {
      case 'symmetric':
        // 对称排列 - 左右对称，每一半的元素在各自一侧
        const halfCount = Math.floor(images.length / 2);
        images.forEach((img, index) => {
          const isLeft = index < halfCount;
          const posIndex = isLeft ? index : index - halfCount;
          const side = isLeft ? -1 : 1;
          
          const yOffset = (posIndex - (halfCount - 1) / 2) * (size * 1.3);
          const x = centerX + side * spacing * 1.5;
          const y = centerY + yOffset;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        });
        break;

      case 'corners':
        // 置于四角
        const cornerPositions = [
          { x: spacing, y: spacing },                           // 左上
          { x: ctx.canvas.width - spacing, y: spacing },       // 右上
          { x: spacing, y: ctx.canvas.height - spacing },      // 左下
          { x: ctx.canvas.width - spacing, y: ctx.canvas.height - spacing } // 右下
        ];
        
        images.forEach((img, index) => {
          const pos = cornerPositions[index % 4];
          
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        });
        break;

      case 'center-line':
        // 中线对称 - 沿中心垂直线对称分布
        images.forEach((img, index) => {
          const isLeft = index % 2 === 0;
          const pairIndex = Math.floor(index / 2);
          const yOffset = (pairIndex - (images.length / 4)) * (spacing * 0.8);
          
          const x = centerX + (isLeft ? -spacing : spacing);
          const y = centerY + yOffset;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation * Math.PI / 180);
          
          // 镜像翻转右侧的元素
          if (!isLeft) {
            ctx.scale(-1, 1);
          }
          
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        });
        break;

      case 'repeat':
        // 重复排列 - 规则网格平铺
        const cols = Math.ceil(Math.sqrt(images.length));
        const rows = Math.ceil(images.length / cols);
        const cellSpacing = spacing * 1.2;
        
        images.forEach((img, index) => {
          const row = Math.floor(index / cols);
          const col = index % cols;
          const x = centerX + (col - (cols-1)/2) * cellSpacing;
          const y = centerY + (row - (rows-1)/2) * cellSpacing;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        });
        break;

      case 'radial':
        // 放射状排列 - 围成一个圆圈
        const radius = spacing * 1.5;
        images.forEach((img, index) => {
          const angle = (index / images.length) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          ctx.save();
          ctx.translate(x, y);
          // 让元素朝向中心
          ctx.rotate((angle + Math.PI / 2 + rotation * Math.PI / 180));
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        });
        break;

      case 'random':
        // 随机分布
        const margin = size;
        const maxX = ctx.canvas.width - margin;
        const maxY = ctx.canvas.height - margin;
        
        // 使用固定种子的伪随机数，确保相同输入产生相同结果
        const seededRandom = (seed: number) => {
          const x = Math.sin(seed * 12345.6789) * 10000;
          return x - Math.floor(x);
        };
        
        images.forEach((img, index) => {
          const x = margin + seededRandom(index * 2 + 1) * (maxX - margin);
          const y = margin + seededRandom(index * 2 + 2) * (maxY - margin);
          const randomRotation = rotation + (seededRandom(index * 3 + 3) - 0.5) * 90; // ±45度随机旋转
          const randomSize = size * (0.7 + seededRandom(index * 4 + 4) * 0.6); // 大小在70%-130%之间
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(randomRotation * Math.PI / 180);
          ctx.drawImage(img, -randomSize/2, -randomSize/2, randomSize, randomSize);
          ctx.restore();
        });
        break;

      default:
        // 默认网格排列
        const defaultCols = Math.ceil(Math.sqrt(images.length));
        const defaultRows = Math.ceil(images.length / defaultCols);
        
        images.forEach((img, index) => {
          const row = Math.floor(index / defaultCols);
          const col = index % defaultCols;
          const x = centerX + (col - (defaultCols-1)/2) * spacing;
          const y = centerY + (row - (defaultRows-1)/2) * spacing;
          
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.drawImage(img, -size/2, -size/2, size, size);
          ctx.restore();
        });
    }
  };

  // 删除元素
  const handleRemoveElement = () => {
    setUploadedElements([]);
    setShowImagePreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 构图选择处理
  const handleCompositionSelect = (compositionId: string) => {
    setSelectedComposition(compositionId);
    updateParameterControls(compositionId);
  };

  // 根据构图类型更新参数控制
  const updateParameterControls = (compositionType: string) => {
    // 这里可以根据构图类型控制参数的可用性
    // 当前所有参数都可用，保持不变
  };

  // 生成组合纹样
  const handleGenerateCombination = async () => {
    if (uploadedElements.length === 0) {
      alert('请先上传元素图片');
      return;
    }

    setIsGenerating(true);

    try {
      // 生成组合
      await generateCombination();
      
      // 保存到历史记录
      if (combinedPreview) {
        saveToHistory({
          type: 'combination',
          compositionType: selectedComposition,
          elements: uploadedElements.map(e => e.preview),
          resultImage: combinedPreview,
          params: {
            elementSize,
            spacing,
            rotation,
            opacity
          }
        });
      }
      
      setIsGenerating(false);
      setShowCombinationPreview(true);
      setShowMultiAnglePreview(true);
    } catch (error) {
      console.error('生成组合时出错:', error);
      setIsGenerating(false);
    }
  };

  // 保存到历史记录
  const saveToHistory = (data: any) => {
    try {
      const historyKey = 'pattern_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const compositionName = compositionOptions.find(c => c.id === data.compositionType)?.name || '组合';
      
      const newRecord = {
        id: `history-${Date.now()}`,
        name: `${compositionName} - 元素组合`,
        type: data.type,
        compositionType: data.compositionType,
        elements: data.elements,
        resultImage: data.resultImage,
        params: data.params,
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

  // 更新预览
  const handleUpdatePreview = () => {
    setIsUpdatingPreview(true);

    setTimeout(() => {
      setIsUpdatingPreview(false);
    }, 1000);
  };

  // 下载组合纹样
  const handleDownloadCombination = () => {
    if (!combinedPreview) {
      alert('请先生成组合纹样');
      return;
    }
    const link = document.createElement('a');
    link.href = combinedPreview;
    link.download = 'combination_pattern.png';
    link.click();
  };

  // 下载预览图
  const handleDownloadPreview = () => {
    if (elementImageRef.current) {
      const link = document.createElement('a');
      link.href = elementImageRef.current.src;
      link.download = 'preview_image.png';
      link.click();
    }
  };

  // 设为待用纹样
  const handleSetAsActive = () => {
    setIsSetAsActive(true);
    
    setTimeout(() => {
      navigate('/application?patternId=combination_123');
    }, 1000);
  };

  // 调整大小功能
  const handleResizeToggle = () => {
    setIsResizing(!isResizing);
    setIsMoving(false);
  };

  // 移动功能
  const handleMoveToggle = () => {
    setIsMoving(!isMoving);
    setIsResizing(false);
  };

  // 鼠标滚轮调整大小
  const handleMouseWheel = (event: React.WheelEvent<HTMLImageElement>) => {
    if (isResizing && elementImageRef.current) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      currentScaleRef.current = Math.max(0.1, Math.min(3, currentScaleRef.current + delta));
      updateImageTransform();
    }
  };

  // 鼠标拖动移动图片
  const handleMouseDown = (event: React.MouseEvent<HTMLImageElement>) => {
    if (isMoving) {
      event.preventDefault();
      startXRef.current = event.clientX - currentXRef.current;
      startYRef.current = event.clientY - currentYRef.current;

      const handleMouseMove = (e: MouseEvent) => {
        currentXRef.current = e.clientX - startXRef.current;
        currentYRef.current = e.clientY - startYRef.current;
        updateImageTransform();
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // 更新图片变换
  const updateImageTransform = () => {
    if (elementImageRef.current) {
      elementImageRef.current.style.transform = `scale(${currentScaleRef.current}) translate(${currentXRef.current}px, ${currentYRef.current}px)`;
    }
  };

  // 拖拽上传处理
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('bg-white/15');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove('bg-white/15');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('bg-white/15');

    const file = event.dataTransfer.files?.[0];
    if (file) {
      const fileList = new DataTransfer();
      fileList.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = fileList.files;
        handleFileUpload({ target: fileInputRef.current } as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

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
              <Link to="/element-combine" className={`${styles.navLink} ${styles.active} text-white py-2`}>元素组合</Link>
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>服饰/首饰应用</Link>
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
              <span className="text-white">元素组合</span>
            </div>
            <h1 className="text-3xl font-bold text-white">元素组合</h1>
            <p className="text-white/70 mt-2">通过元素上传和构图选择进行纹样重组设计</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧输入区 */}
            <div className="lg:col-span-1 space-y-8">
              {/* 元素上传区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-cloud-upload-alt mr-3 text-white/80"></i>
                  元素上传
                </h2>
                <div 
                  className={`${styles.uploadArea} rounded-xl p-6 text-center aspect-square relative`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={`h-full flex flex-col items-center justify-center ${showImagePreview ? 'hidden' : ''}`}>
                    <i className="fas fa-image text-4xl text-white/60 mb-4"></i>
                    <h3 className="text-lg font-medium text-white mb-2">上传元素图片</h3>
                    <p className="text-sm text-white/70 mb-4">点击上传或拖拽图片到此处</p>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*" 
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button 
                      onClick={handleFileSelect}
                      className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                    >
                      <i className="fas fa-folder-open mr-2"></i>
                      选择文件
                    </button>
                  </div>
                  <div className={`absolute inset-0 flex flex-col items-center justify-center ${!showImagePreview ? 'hidden' : ''}`}>
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        ref={elementImageRef}
                        src="" 
                        alt="元素预览" 
                        className="max-w-full max-h-full object-contain rounded-lg"
                        onWheel={handleMouseWheel}
                        onMouseDown={handleMouseDown}
                        style={{
                          cursor: isResizing ? 'nwse-resize' : isMoving ? 'move' : 'default'
                        }}
                      />
                      {/* 调整控制按钮 */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                        <button 
                          onClick={handleResizeToggle}
                          className={`${styles.glassButton} p-2 rounded-full text-white ${isResizing ? 'bg-accent' : ''}`}
                        >
                          <i className="fas fa-expand-alt"></i>
                        </button>
                        <button 
                          onClick={handleMoveToggle}
                          className={`${styles.glassButton} p-2 rounded-full text-white ${isMoving ? 'bg-accent' : ''}`}
                        >
                          <i className="fas fa-arrows-alt"></i>
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={handleRemoveElement}
                      className="text-white/60 hover:text-white text-sm mt-4"
                    >
                      <i className="fas fa-trash mr-1"></i>
                      删除
                    </button>
                  </div>
                </div>
              </section>

              {/* 构图选择区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-th-large mr-3 text-white/80"></i>
                  构图选择
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {compositionOptions.map((option) => (
                    <div 
                      key={option.id}
                      onClick={() => handleCompositionSelect(option.id)}
                      className={`${styles.compositionOption} ${selectedComposition === option.id ? styles.selected : ''} rounded-xl p-4 text-center`}
                    >
                      <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center">
                        <i className={`${option.icon} text-white text-lg`}></i>
                      </div>
                      <span className="text-sm text-white/90">{option.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 重组参数区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-sliders-h mr-3 text-white/80"></i>
                  重组参数
                </h2>
                
                {/* 元素大小 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">元素大小</label>
                    <span className="text-white/70 text-sm">{elementSize}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer ${styles.parameterControl} ${styles.active}`}
                    min="10" 
                    max="200" 
                    value={elementSize}
                    onChange={(e) => setElementSize(Number(e.target.value))}
                  />
                </div>
                
                {/* 间距调整 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">间距调整</label>
                    <span className="text-white/70 text-sm">{spacing}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer ${styles.parameterControl} ${styles.active}`}
                    min="0" 
                    max="100" 
                    value={spacing}
                    onChange={(e) => setSpacing(Number(e.target.value))}
                  />
                </div>
                
                {/* 旋转角度 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">旋转角度</label>
                    <span className="text-white/70 text-sm">{rotation}°</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer ${styles.parameterControl} ${styles.active}`}
                    min="0" 
                    max="360" 
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                  />
                </div>
                
                {/* 透明度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">透明度</label>
                    <span className="text-white/70 text-sm">{opacity}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer ${styles.parameterControl} ${styles.active}`}
                    min="0" 
                    max="100" 
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                  />
                </div>
              </section>

              {/* 操作按钮区 */}
              <section className="text-center">
                <button 
                  onClick={handleGenerateCombination}
                  disabled={isGenerating}
                  className={`${styles.glassButton} px-12 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <i className={`${isGenerating ? 'fas fa-spinner fa-spin' : 'fas fa-magic'} mr-3`}></i>
                  {isGenerating ? '生成中...' : '生成组合纹样'}
                </button>
              </section>
            </div>

            {/* 右侧预览区 */}
            <div className="lg:col-span-2">
              {/* 组合纹样展示区 */}
              <section className={`${styles.glassCard} rounded-2xl p-6`}>
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                  <i className="fas fa-eye mr-3 text-white/80"></i>
                  组合纹样预览
                </h2>
                
                <div className={`${styles.patternGrid} aspect-square rounded-xl mb-6 relative overflow-hidden`}>
                  <div className="w-full h-full flex items-center justify-center">
                    {!combinedPreview ? (
                      <div className="text-center">
                        <i className="fas fa-magic text-6xl text-white/40 mb-4"></i>
                        <p className="text-white/60">上传元素并选择构图后生成组合纹样</p>
                      </div>
                    ) : (
                      <img src={combinedPreview} alt="组合纹样预览" className="w-full h-full object-cover" />
                    )}
                  </div>
                </div>
                
                {/* 多角度预览 */}
                {showMultiAnglePreview && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white/60 text-sm">正面</span>
                    </div>
                    <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white/60 text-sm">45°角</span>
                    </div>
                    <div className="aspect-square bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-white/60 text-sm">侧面</span>
                    </div>
                  </div>
                )}
                
                {/* 操作按钮 */}
                <div className="flex flex-wrap justify-center gap-4 mt-6">
                  <button 
                    onClick={handleUpdatePreview}
                    disabled={isUpdatingPreview}
                    className={`${styles.glassButton} px-6 py-3 rounded-lg text-white font-medium`}
                  >
                    <i className={`${isUpdatingPreview ? 'fas fa-spinner fa-spin' : 'fas fa-sync-alt'} mr-2`}></i>
                    {isUpdatingPreview ? '更新中...' : '更新预览'}
                  </button>
                  <button 
                    onClick={handleDownloadCombination}
                    className={`${styles.glassButton} px-6 py-3 rounded-lg text-white font-medium`}
                  >
                    <i className="fas fa-download mr-2"></i>
                    下载组合纹样
                  </button>
                  <button 
                    onClick={handleDownloadPreview}
                    className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    <i className="fas fa-image mr-2"></i>
                    下载预览图
                  </button>
                  <button 
                    onClick={handleSetAsActive}
                    disabled={isSetAsActive}
                    className={`${isSetAsActive ? 'bg-green-500' : styles.glassButton} text-white px-6 py-3 rounded-lg font-medium`}
                  >
                    <i className="fas fa-check mr-2"></i>
                    {isSetAsActive ? '已设为待用' : '设为待用纹样'}
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ElementCombinePage;

