

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface UploadedFile {
  file: File;
  preview: string;
  scale: number;
  position: { x: number; y: number };
  features?: ImageFeatures;
}

interface ImageFeatures {
  colors: ColorInfo[];
  shapes: ShapeInfo;
  brightness: number;
  contrast: number;
  edges: number;
}

interface ColorInfo {
  rgb: { r: number; g: number; b: number };
  hex: string;
  percentage: number;
  name: string;
}

interface ShapeInfo {
  complexity: number;
  edges: number;
  symmetry: number;
  density: number;
}

interface PatternParameter {
  dyeConcentration: number;
  patternDensity: number;
  fusionStrength: number;
  colorSaturation: number;
  patternSize: number;
}

interface PatternCard {
  id: string;
  imageUrl: string;
  name: string;
  isSelected: boolean;
  category: string;
}

const PatternDesignPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 文件上传状态
  const [uploadedFile1, setUploadedFile1] = useState<UploadedFile | null>(null);
  const [uploadedFile2, setUploadedFile2] = useState<UploadedFile | null>(null);
  const [isExtracting1, setIsExtracting1] = useState<boolean>(false);
  const [isExtracting2, setIsExtracting2] = useState<boolean>(false);
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);
  
  // AI模型选择状态
  const [selectedModel, setSelectedModel] = useState<string>('innovative');
  
  // 风格选择状态
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  // 参数调整状态
  const [patternParameters, setPatternParameters] = useState<PatternParameter>({
    dyeConcentration: 50,
    patternDensity: 50,
    fusionStrength: 50,
    colorSaturation: 50,
    patternSize: 50
  });
  
  // 生成纹样状态
  const [generatedPatterns, setGeneratedPatterns] = useState<PatternCard[]>([
    {
      id: '1',
      imageUrl: 'https://s.coze.cn/image/s2W4vhhALC0/',
      name: '纹样设计 1',
      isSelected: true,
      category: '艺术'
    },
    {
      id: '2',
      imageUrl: 'https://s.coze.cn/image/iK33Od1nK1w/',
      name: '纹样设计 2',
      isSelected: false,
      category: '艺术'
    },
    {
      id: '3',
      imageUrl: 'https://s.coze.cn/image/j79a3f0GqX0/',
      name: '纹样设计 3',
      isSelected: false,
      category: '艺术'
    }
  ]);
  
  // 实时预览状态
  const [realTimePreviewImage, setRealTimePreviewImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '纹样设计 - 染纹创合';
    return () => {
      document.title = originalTitle;
    };
  }, []);
  
  // 实时预览更新
  useEffect(() => {
    if (uploadedFile1) {
      generatePatternFromImage();
    }
  }, [uploadedFile1, patternParameters, selectedStyles, selectedModel]);

  // 基于上传图片生成新的纹样
  const generatePatternFromImage = async () => {
    if (!uploadedFile1?.features) return;

    setIsGenerating(true);
    try {
      // 根据特征和参数生成新的纹样
      const newPatterns = await generatePatternsFromFeatures(uploadedFile1.features);
      
      setGeneratedPatterns(newPatterns);
      if (newPatterns.length > 0) {
        setRealTimePreviewImage(newPatterns[0].imageUrl);
        
        // 保存到历史记录
        saveToHistory({
          type: 'pattern',
          refImages: [uploadedFile1.preview, ...(uploadedFile2 ? [uploadedFile2.preview] : [])],
          generatedImage: newPatterns[0].imageUrl,
          features: uploadedFile1.features,
          parameters: patternParameters,
          styles: selectedStyles,
          model: selectedModel
        });
      }
    } catch (error) {
      console.error('生成纹样时出错:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 保存到历史记录
  const saveToHistory = (data: any) => {
    try {
      const historyKey = 'pattern_history';
      const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      const newRecord = {
        id: `history-${Date.now()}`,
        name: `纹样设计 - ${new Date().toLocaleDateString()}`,
        type: data.type,
        refImages: data.refImages,
        generatedImage: data.generatedImage,
        features: data.features,
        parameters: data.parameters,
        styles: data.styles,
        model: data.model,
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

  // 根据特征生成纹样
  const generatePatternsFromFeatures = async (features: ImageFeatures) => {
    const { colors, shapes } = features;
    const { dyeConcentration, patternDensity, fusionStrength, colorSaturation, patternSize } = patternParameters;

    // 这里可以添加更复杂的纹样生成算法
    // 目前使用简单的颜色和形状组合
    const patterns: PatternCard[] = [];
    
    // 生成3个不同的纹样变体
    for (let i = 0; i < 3; i++) {
      const pattern = await createPatternVariant(
        colors,
        shapes,
        dyeConcentration,
        patternDensity,
        fusionStrength,
        colorSaturation,
        patternSize,
        i
      );
      patterns.push(pattern);
    }

    return patterns;
  };

  // 创建纹样变体
  const createPatternVariant = async (
    colors: ColorInfo[],
    shapes: ShapeInfo,
    _dyeConcentration: number,
    _patternDensity: number,
    _fusionStrength: number,
    _colorSaturation: number,
    _patternSize: number,
    index: number
  ): Promise<PatternCard> => {
    // 这里可以添加更复杂的变体生成逻辑
    return {
      id: `generated-${Date.now()}-${index}`,
      imageUrl: await generatePatternImage(colors, shapes, patternParameters),
      name: `生成纹样 ${index + 1}`,
      isSelected: index === 0,
      category: '生成'
    };
  };

  // 生成纹样图片
  const generatePatternImage = async (
    colors: ColorInfo[],
    shapes: ShapeInfo,
    parameters: PatternParameter
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 600;
    canvas.height = 600;

    if (ctx) {
      const dominantColors = colors.map(c => c.rgb);
      const { dyeConcentration, patternDensity, fusionStrength, colorSaturation, patternSize } = parameters;
      
      // 背景色使用第一个主色
      const bgColor = dominantColors[0] || { r: 255, g: 255, b: 255 };
      ctx.fillStyle = `rgb(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 根据参数和形状特征生成扎染效果
      const complexityFactor = shapes.complexity / 100;
      const symmetryFactor = shapes.symmetry / 100;
      const densityFactor = shapes.density / 100;
      
      // 密度控制（结合图片密度特征）
      const numCircles = Math.floor((patternDensity / 5) * (0.5 + densityFactor * 0.5));
      const baseSize = patternSize * 2 * (0.7 + complexityFactor * 0.6); // 纹样大小受复杂度影响
      
      // 如果对称性高，创建对称图案
      const useSymmetry = symmetryFactor > 0.5;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < numCircles; i++) {
        let x, y;
        
        if (useSymmetry) {
          // 创建对称图案
          const angle = (i / numCircles) * Math.PI * 2;
          const distance = (Math.random() * 0.3 + 0.2) * canvas.width;
          x = centerX + Math.cos(angle) * distance;
          y = centerY + Math.sin(angle) * distance;
        } else {
          // 随机分布
          x = Math.random() * canvas.width;
          y = Math.random() * canvas.height;
        }
        
        const colorIndex = Math.floor(Math.random() * dominantColors.length);
        const color = dominantColors[colorIndex];
        
        // 根据饱和度调整颜色
        const saturationFactor = colorSaturation / 100;
        const r = Math.floor(color.r * saturationFactor);
        const g = Math.floor(color.g * saturationFactor);
        const b = Math.floor(color.b * saturationFactor);
        
        // 根据浓度调整透明度
        const alpha = dyeConcentration / 100;
        
        // 创建渐变效果模拟扎染晕染
        const radius = baseSize * (0.5 + Math.random() * 0.5);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 如果对称性高，镜像绘制
        if (useSymmetry && symmetryFactor > 0.7) {
          const mirrorX = canvas.width - x;
          const mirrorGradient = ctx.createRadialGradient(mirrorX, y, 0, mirrorX, y, radius);
          mirrorGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
          mirrorGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
          mirrorGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.fillStyle = mirrorGradient;
          ctx.beginPath();
          ctx.arc(mirrorX, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // 根据边缘密度添加细节纹理
      if (shapes.edges > 30) {
        ctx.globalAlpha = 0.3;
        const edgeLines = Math.floor(shapes.edges / 5);
        for (let i = 0; i < edgeLines; i++) {
          ctx.strokeStyle = `rgba(${dominantColors[0].r}, ${dominantColors[0].g}, ${dominantColors[0].b}, 0.3)`;
          ctx.lineWidth = 1 + Math.random() * 2;
          ctx.beginPath();
          ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
      
      // 添加融合效果
      if (fusionStrength > 0) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = fusionStrength / 200;
        
        for (let i = 0; i < numCircles / 2; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = baseSize * 1.5;
          
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
      }

      // 根据选择的风格应用特殊效果
      if (selectedStyles.includes('traditional')) {
        // 传统蓝白效果
        ctx.globalCompositeOperation = 'color';
        ctx.fillStyle = 'rgba(0, 100, 200, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    return canvas.toDataURL('image/png');
  };
  // 提取图片特征
  const extractImageFeatures = async (imageData: string): Promise<ImageFeatures> => {
    const image = new Image();
    image.src = imageData;
    await new Promise(resolve => image.onload = resolve);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    if (ctx) {
      ctx.drawImage(image, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // 提取主要颜色
      const colors = extractDominantColors(imgData);
      
      // 提取形状特征
      const shapes = detectShapes(imgData);
      
      // 计算亮度
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
      }
      const brightness = totalBrightness / (data.length / 4) / 255;
      
      // 计算对比度
      const avgBrightness = totalBrightness / (data.length / 4);
      let variance = 0;
      for (let i = 0; i < data.length; i += 4) {
        const pixelBrightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        variance += Math.pow(pixelBrightness - avgBrightness, 2);
      }
      const contrast = Math.sqrt(variance / (data.length / 4)) / 255;
      
      return {
        colors,
        shapes,
        brightness: Math.round(brightness * 100),
        contrast: Math.round(contrast * 100),
        edges: shapes.edges
      };
    }
    
    return {
      colors: [],
      shapes: { complexity: 0, edges: 0, symmetry: 0, density: 0 },
      brightness: 0,
      contrast: 0,
      edges: 0
    };
  };

  // 使用K-means算法提取主要颜色
  const extractDominantColors = (imageData: ImageData): ColorInfo[] => {
    const data = imageData.data;
    const pixels: { r: number; g: number; b: number }[] = [];
    
    // 采样像素（每隔10个像素采样一次以提高性能）
    for (let i = 0; i < data.length; i += 40) {
      pixels.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2]
      });
    }
    
    // K-means聚类找出主要颜色
    const k = 6; // 提取6种主要颜色
    const clusters = kMeansClustering(pixels, k);
    const totalPixels = pixels.length;
    
    // 转换为ColorInfo格式并排序
    return clusters
      .map(cluster => ({
        rgb: cluster.center,
        hex: rgbToHex(cluster.center),
        percentage: (cluster.pixels.length / totalPixels) * 100,
        name: getColorName(cluster.center)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  // K-means聚类算法
  const kMeansClustering = (pixels: { r: number; g: number; b: number }[], k: number) => {
    // 初始化聚类中心（使用K-means++算法）
    const centers: { r: number; g: number; b: number }[] = [];
    centers.push(pixels[Math.floor(Math.random() * pixels.length)]);
    
    for (let i = 1; i < k; i++) {
      const distances = pixels.map(pixel => {
        const minDist = Math.min(...centers.map(center => colorDistance(pixel, center)));
        return minDist;
      });
      const sumDist = distances.reduce((a, b) => a + b, 0);
      const probabilities = distances.map(d => d / sumDist);
      
      let random = Math.random();
      let cumulative = 0;
      for (let j = 0; j < pixels.length; j++) {
        cumulative += probabilities[j];
        if (random <= cumulative) {
          centers.push(pixels[j]);
          break;
        }
      }
    }
    
    // 迭代优化聚类中心
    for (let iter = 0; iter < 10; iter++) {
      const clusters = centers.map(() => ({ pixels: [] as typeof pixels, center: { r: 0, g: 0, b: 0 } }));
      
      // 分配像素到最近的聚类中心
      pixels.forEach(pixel => {
        let minDist = Infinity;
        let closestCluster = 0;
        centers.forEach((center, idx) => {
          const dist = colorDistance(pixel, center);
          if (dist < minDist) {
            minDist = dist;
            closestCluster = idx;
          }
        });
        clusters[closestCluster].pixels.push(pixel);
      });
      
      // 更新聚类中心
      clusters.forEach((cluster, idx) => {
        if (cluster.pixels.length > 0) {
          const avgR = cluster.pixels.reduce((sum, p) => sum + p.r, 0) / cluster.pixels.length;
          const avgG = cluster.pixels.reduce((sum, p) => sum + p.g, 0) / cluster.pixels.length;
          const avgB = cluster.pixels.reduce((sum, p) => sum + p.b, 0) / cluster.pixels.length;
          centers[idx] = { r: Math.round(avgR), g: Math.round(avgG), b: Math.round(avgB) };
          cluster.center = centers[idx];
        }
      });
    }
    
    return centers.map((center, idx) => ({
      center,
      pixels: pixels.filter(pixel => {
        let minDist = Infinity;
        let closestIdx = 0;
        centers.forEach((c, i) => {
          const dist = colorDistance(pixel, c);
          if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
          }
        });
        return closestIdx === idx;
      })
    }));
  };

  // 计算两个颜色之间的距离
  const colorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };

  // RGB转Hex
  const rgbToHex = (rgb: { r: number; g: number; b: number }) => {
    return '#' + [rgb.r, rgb.g, rgb.b]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('');
  };

  // 获取颜色名称
  const getColorName = (rgb: { r: number; g: number; b: number }): string => {
    const { r, g, b } = rgb;
    const brightness = (r + g + b) / 3;
    
    if (brightness < 50) return '深色';
    if (brightness > 200) return '浅色';
    
    if (r > g && r > b) {
      if (r - g < 50 && r - b < 50) return '灰色';
      if (g > b) return '橙色';
      return '红色';
    }
    if (g > r && g > b) {
      if (g - r < 50 && g - b < 50) return '灰色';
      if (b > r) return '青色';
      return '绿色';
    }
    if (b > r && b > g) {
      if (b - r < 50 && b - g < 50) return '灰色';
      if (r > g) return '紫色';
      return '蓝色';
    }
    return '灰色';
  };

  // 检测图像中的形状特征
  const detectShapes = (imageData: ImageData): ShapeInfo => {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // 转换为灰度图
    const grayData = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayData[i / 4] = gray;
    }
    
    // Sobel边缘检测
    const edges = sobelEdgeDetection(grayData, width, height);
    const edgeCount = edges.filter(e => e > 128).length;
    const edgeRatio = edgeCount / (width * height);
    
    // 计算复杂度（基于边缘密度）
    const complexity = Math.min(edgeRatio * 10, 1);
    
    // 计算对称性
    const symmetry = calculateSymmetry(grayData, width, height);
    
    // 计算密度（非空白区域占比）
    const nonWhitePixels = grayData.filter(g => g < 240).length;
    const density = nonWhitePixels / (width * height);
    
    return {
      complexity: Math.round(complexity * 100),
      edges: Math.round(edgeRatio * 100),
      symmetry: Math.round(symmetry * 100),
      density: Math.round(density * 100)
    };
  };

  // Sobel边缘检测
  const sobelEdgeDetection = (gray: Uint8Array, width: number, height: number): Uint8Array => {
    const edges = new Uint8Array(width * height);
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            gx += gray[idx] * sobelX[kernelIdx];
            gy += gray[idx] * sobelY[kernelIdx];
          }
        }
        
        edges[y * width + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
      }
    }
    
    return edges;
  };

  // 计算对称性
  const calculateSymmetry = (gray: Uint8Array, width: number, height: number): number => {
    let symmetryScore = 0;
    const centerX = Math.floor(width / 2);
    
    // 检查水平对称性
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < centerX; x++) {
        const left = gray[y * width + x];
        const right = gray[y * width + (width - 1 - x)];
        const diff = Math.abs(left - right) / 255;
        symmetryScore += 1 - diff;
      }
    }
    
    return symmetryScore / (height * centerX);
  };

  // 处理文件上传
  const handleFileUpload = async (file: File, uploadSlot: 'first' | 'second') => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const preview = e.target?.result as string;
      
      // 先设置预览，不包含特征
      const uploadedFile: UploadedFile = {
        file,
        preview,
        scale: 1,
        position: { x: 0, y: 0 }
      };
      
      if (uploadSlot === 'first') {
        setUploadedFile1(uploadedFile);
        setIsExtracting1(true);
      } else {
        setUploadedFile2(uploadedFile);
        setIsExtracting2(true);
      }
      
      // 异步提取图片特征
      try {
        const features = await extractImageFeatures(preview);
        
        const uploadedFileWithFeatures: UploadedFile = {
          ...uploadedFile,
          features
        };
        
        if (uploadSlot === 'first') {
          setUploadedFile1(uploadedFileWithFeatures);
          setIsExtracting1(false);
        } else {
          setUploadedFile2(uploadedFileWithFeatures);
          setIsExtracting2(false);
        }
      } catch (error) {
        console.error('特征提取失败:', error);
        if (uploadSlot === 'first') {
          setIsExtracting1(false);
        } else {
          setIsExtracting2(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };
  
  // 处理文件选择
  const handleFileSelect = (uploadSlot: 'first' | 'second') => {
    if (uploadSlot === 'first' && fileInputRef1.current) {
      fileInputRef1.current.click();
    } else if (uploadSlot === 'second' && fileInputRef2.current) {
      fileInputRef2.current.click();
    }
  };
  
  // 处理文件输入变化
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, uploadSlot: 'first' | 'second') => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0], uploadSlot);
    }
  };
  
  // 删除上传文件
  const handleDeleteUpload = (uploadSlot: 'first' | 'second') => {
    if (uploadSlot === 'first') {
      setUploadedFile1(null);
      if (fileInputRef1.current) {
        fileInputRef1.current.value = '';
      }
    } else {
      setUploadedFile2(null);
      if (fileInputRef2.current) {
        fileInputRef2.current.value = '';
      }
    }
  };
  
  // 缩放图片
  const handleZoomImage = (uploadSlot: 'first' | 'second', direction: 'in' | 'out') => {
    const updateFile = (file: UploadedFile | null): UploadedFile | null => {
      if (!file) return null;
      const newScale = direction === 'in' 
        ? Math.min(file.scale + 0.1, 3) 
        : Math.max(file.scale - 0.1, 0.5);
      return { ...file, scale: newScale };
    };
    
    if (uploadSlot === 'first') {
      setUploadedFile1(updateFile(uploadedFile1));
    } else {
      setUploadedFile2(updateFile(uploadedFile2));
    }
  };
  
  // 处理模型选择
  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };
  
  // 处理风格选择
  const handleStyleSelect = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };
  
  // 处理参数调整
  const handleParameterChange = (parameter: keyof PatternParameter, value: number) => {
    setPatternParameters(prev => ({
      ...prev,
      [parameter]: value
    }));
  };
  
  // 更新实时预览
  const updatePatternPreview = () => {
    const previewImages = [
      'https://s.coze.cn/image/lC_nww4ZQyQ/',
      'https://s.coze.cn/image/pxGgNA68_iQ/',
      'https://s.coze.cn/image/uvS3keRY5E4/'
    ];
    
    const { dyeConcentration, patternDensity } = patternParameters;
    let previewImageIndex = Math.floor((dyeConcentration + patternDensity) / 200 * previewImages.length);
    previewImageIndex = Math.min(previewImageIndex, previewImages.length - 1);
    
    setRealTimePreviewImage(previewImages[previewImageIndex]);
  };
  
  // 生成纹样
  const handleGeneratePatterns = async () => {
    setIsGenerating(true);
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsGenerating(false);
  };
  
  // 下载预览
  const handleDownloadPreview = () => {
    if (realTimePreviewImage) {
      const link = document.createElement('a');
      link.href = realTimePreviewImage;
      link.download = 'pattern_preview.png';
      link.click();
    }
  };
  
  // 清空所有生成纹样
  const handleClearAllPatterns = () => {
    if (confirm('确定要清空所有生成纹样吗？')) {
      setGeneratedPatterns([]);
    }
  };
  
  // 删除生成纹样
  const handleDeletePattern = (patternId: string) => {
    if (confirm('确定要删除这个纹样吗？')) {
      setGeneratedPatterns(prev => prev.filter(p => p.id !== patternId));
    }
  };
  
  // 选择生成纹样
  const handleSelectPattern = (patternId: string) => {
    setGeneratedPatterns(prev => 
      prev.map(p => ({
        ...p,
        isSelected: p.id === patternId
      }))
    );
  };
  
  // 重命名生成纹样
  const handleRenamePattern = (patternId: string, newName: string) => {
    setGeneratedPatterns(prev => 
      prev.map(p => 
        p.id === patternId ? { ...p, name: newName } : p
      )
    );
  };
  
  // 处理图片拖拽
  const handleImageDrag = (_e: React.MouseEvent<HTMLImageElement>, _uploadSlot: 'first' | 'second') => {
    // 双击进入拖拽模式的逻辑可以在这里实现
    // 为简化，暂时保留基础功能
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
              <Link to="/home" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                首页
              </Link>
              <Link to="/pattern-vectorize" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                素材处理
              </Link>
              <Link to="/pattern-design" className={`${styles.navLink} ${styles.active} text-white py-2`}>
                纹样设计
              </Link>
              <Link to="/element-combine" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                元素组合
              </Link>
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                文创应用
              </Link>
              <Link to="/pattern-library" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                纹样库
              </Link>
              <Link to="/history" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                历史记录
              </Link>
              <Link to="/help" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                帮助指南
              </Link>
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
              <span className="text-white">纹样设计</span>
            </div>
            <h1 className="text-3xl font-bold text-white">纹样设计</h1>
            <p className="text-white/70 mt-2">通过AI技术辅助您进行扎染纹样的创新设计</p>
          </header>

          {/* 参考纹样上传区 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <i className="fas fa-cloud-upload-alt mr-3 text-white/80"></i>
              参考纹样上传
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 参考纹样 1 */}
              <div className={`${styles.uploadArea} rounded-xl p-6 text-center aspect-[2/1] relative`}>
                {!uploadedFile1 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <i className="fas fa-image text-4xl text-white/60 mb-4"></i>
                    <h3 className="text-lg font-medium text-white mb-2">参考纹样 1</h3>
                    <p className="text-sm text-white/70 mb-4">点击上传或拖拽图片到此处</p>
                    <input 
                      type="file" 
                      ref={fileInputRef1}
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, 'first')}
                    />
                    <button 
                      onClick={() => handleFileSelect('first')}
                      className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                    >
                      <i className="fas fa-folder-open mr-2"></i>
                      选择文件
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="relative flex-1 overflow-hidden rounded-lg mb-4">
                      <img 
                        src={uploadedFile1.preview} 
                        alt="参考纹样 1 预览" 
                        className="w-full h-full object-contain bg-white/5"
                        style={{
                          transform: `scale(${uploadedFile1.scale})`,
                          left: `${uploadedFile1.position.x}px`,
                          top: `${uploadedFile1.position.y}px`,
                          position: 'relative'
                        }}
                        onDoubleClick={(e) => handleImageDrag(e, 'first')}
                      />
                      {isExtracting1 && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                          <i className="fas fa-spinner fa-spin text-4xl text-white mb-3"></i>
                          <p className="text-white text-sm font-medium">正在分析图片特征...</p>
                          <p className="text-white/70 text-xs mt-1">提取颜色、形状、纹理信息</p>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        双击调整大小和位置
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleDeleteUpload('first')}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        删除
                      </button>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleZoomImage('first', 'in')}
                          className="text-white/60 hover:text-white text-sm"
                        >
                          <i className="fas fa-search-plus mr-1"></i>
                          放大
                        </button>
                        <button 
                          onClick={() => handleZoomImage('first', 'out')}
                          className="text-white/60 hover:text-white text-sm"
                        >
                          <i className="fas fa-search-minus mr-1"></i>
                          缩小
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 参考纹样 2 */}
              <div className={`${styles.uploadArea} rounded-xl p-6 text-center aspect-[2/1] relative`}>
                {!uploadedFile2 ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <i className="fas fa-image text-4xl text-white/60 mb-4"></i>
                    <h3 className="text-lg font-medium text-white mb-2">参考纹样 2</h3>
                    <p className="text-sm text-white/70 mb-4">点击上传或拖拽图片到此处</p>
                    <input 
                      type="file" 
                      ref={fileInputRef2}
                      accept="image/*" 
                      className="hidden"
                      onChange={(e) => handleFileInputChange(e, 'second')}
                    />
                    <button 
                      onClick={() => handleFileSelect('second')}
                      className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                    >
                      <i className="fas fa-folder-open mr-2"></i>
                      选择文件
                    </button>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col">
                    <div className="relative flex-1 overflow-hidden rounded-lg mb-4">
                      <img 
                        src={uploadedFile2.preview} 
                        alt="参考纹样 2 预览" 
                        className="w-full h-full object-contain bg-white/5"
                        style={{
                          transform: `scale(${uploadedFile2.scale})`,
                          left: `${uploadedFile2.position.x}px`,
                          top: `${uploadedFile2.position.y}px`,
                          position: 'relative'
                        }}
                        onDoubleClick={(e) => handleImageDrag(e, 'second')}
                      />
                      {isExtracting2 && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center backdrop-blur-sm">
                          <i className="fas fa-spinner fa-spin text-4xl text-white mb-3"></i>
                          <p className="text-white text-sm font-medium">正在分析图片特征...</p>
                          <p className="text-white/70 text-xs mt-1">提取颜色、形状、纹理信息</p>
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        双击调整大小和位置
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => handleDeleteUpload('second')}
                        className="text-white/60 hover:text-white text-sm"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        删除
                      </button>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleZoomImage('second', 'in')}
                          className="text-white/60 hover:text-white text-sm"
                        >
                          <i className="fas fa-search-plus mr-1"></i>
                          放大
                        </button>
                        <button 
                          onClick={() => handleZoomImage('second', 'out')}
                          className="text-white/60 hover:text-white text-sm"
                        >
                          <i className="fas fa-search-minus mr-1"></i>
                          缩小
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </section>

          {/* 特征提取结果展示区 */}
          {(uploadedFile1?.features || uploadedFile2?.features) && (
            <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-chart-bar mr-3 text-white/80"></i>
                图片特征分析
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 参考纹样1的特征 */}
                {uploadedFile1?.features && (
                  <div className={`${styles.glassCard} rounded-xl p-5`}>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <i className="fas fa-image mr-2 text-white/70"></i>
                      参考纹样 1 特征
                    </h3>
                    
                    {/* 颜色特征 */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-white/90 mb-3">主要颜色</h4>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {uploadedFile1.features.colors.slice(0, 6).map((color, idx) => (
                          <div key={idx} className="relative group">
                            <div 
                              className="aspect-square rounded-lg shadow-md transition-transform hover:scale-110"
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} - ${color.percentage.toFixed(1)}%`}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-bold text-white drop-shadow-lg">
                                {color.percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {uploadedFile1.features.colors.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-full bg-white/10 text-white/80">
                            {color.name} ({color.percentage.toFixed(1)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* 形状特征 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white/90 mb-3">形状特征</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">复杂度</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                                style={{ width: `${uploadedFile1.features.shapes.complexity}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile1.features.shapes.complexity}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">边缘密度</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full"
                                style={{ width: `${uploadedFile1.features.shapes.edges}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile1.features.shapes.edges}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">对称性</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                style={{ width: `${uploadedFile1.features.shapes.symmetry}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile1.features.shapes.symmetry}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">图案密度</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-pink-400 to-red-500 rounded-full"
                                style={{ width: `${uploadedFile1.features.shapes.density}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile1.features.shapes.density}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 整体特征 */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {uploadedFile1.features.brightness}%
                        </div>
                        <div className="text-xs text-white/70">亮度</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {uploadedFile1.features.contrast}%
                        </div>
                        <div className="text-xs text-white/70">对比度</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 参考纹样2的特征 */}
                {uploadedFile2?.features && (
                  <div className={`${styles.glassCard} rounded-xl p-5`}>
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <i className="fas fa-image mr-2 text-white/70"></i>
                      参考纹样 2 特征
                    </h3>
                    
                    {/* 颜色特征 */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-white/90 mb-3">主要颜色</h4>
                      <div className="grid grid-cols-6 gap-2 mb-3">
                        {uploadedFile2.features.colors.slice(0, 6).map((color, idx) => (
                          <div key={idx} className="relative group">
                            <div 
                              className="aspect-square rounded-lg shadow-md transition-transform hover:scale-110"
                              style={{ backgroundColor: color.hex }}
                              title={`${color.name} - ${color.percentage.toFixed(1)}%`}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs font-bold text-white drop-shadow-lg">
                                {color.percentage.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {uploadedFile2.features.colors.slice(0, 3).map((color, idx) => (
                          <span key={idx} className="px-2 py-1 rounded-full bg-white/10 text-white/80">
                            {color.name} ({color.percentage.toFixed(1)}%)
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* 形状特征 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-white/90 mb-3">形状特征</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">复杂度</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                                style={{ width: `${uploadedFile2.features.shapes.complexity}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile2.features.shapes.complexity}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">边缘密度</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-400 to-teal-500 rounded-full"
                                style={{ width: `${uploadedFile2.features.shapes.edges}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile2.features.shapes.edges}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">对称性</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                                style={{ width: `${uploadedFile2.features.shapes.symmetry}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile2.features.shapes.symmetry}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/70">图案密度</span>
                          <div className="flex items-center space-x-2 flex-1 ml-4">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-pink-400 to-red-500 rounded-full"
                                style={{ width: `${uploadedFile2.features.shapes.density}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-white font-medium w-10 text-right">
                              {uploadedFile2.features.shapes.density}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 整体特征 */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {uploadedFile2.features.brightness}%
                        </div>
                        <div className="text-xs text-white/70">亮度</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-1">
                          {uploadedFile2.features.contrast}%
                        </div>
                        <div className="text-xs text-white/70">对比度</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 使用说明 */}
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-lightbulb text-yellow-400 text-xl mt-1"></i>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white mb-2">智能特征分析说明</h4>
                    <ul className="text-xs text-white/70 space-y-1">
                      <li>• <strong>颜色特征</strong>：使用K-means算法提取图片主要颜色，生成纹样时会优先使用这些颜色</li>
                      <li>• <strong>复杂度</strong>：反映图案的细节程度，复杂度高的图片会生成更精细的纹样</li>
                      <li>• <strong>对称性</strong>：对称性高的图片会生成对称或镜像的纹样效果</li>
                      <li>• <strong>图案密度</strong>：影响生成纹样的疏密程度，密度高则纹样更紧凑</li>
                      <li>• <strong>亮度和对比度</strong>：用于调整生成纹样的整体明暗和色彩对比</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 模型选择区 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <i className="fas fa-brain mr-3 text-white/80"></i>
              AI模型选择
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => handleModelSelect('innovative')}
                className={`${styles.modelOption} ${styles.glassCard} rounded-lg p-4 ${selectedModel === 'innovative' ? styles.selected : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-lightbulb text-2xl text-white/80"></i>
                  <div>
                    <h3 className="font-medium text-white">创新设计模型</h3>
                    <p className="text-sm text-white/70">生成新颖独特的纹样设计</p>
                  </div>
                </div>
              </div>
              <div 
                onClick={() => handleModelSelect('traditional')}
                className={`${styles.modelOption} ${styles.glassCard} rounded-lg p-4 ${selectedModel === 'traditional' ? styles.selected : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-scroll text-2xl text-white/80"></i>
                  <div>
                    <h3 className="font-medium text-white">传统风格模型</h3>
                    <p className="text-sm text-white/70">保持传统扎染艺术风格</p>
                  </div>
                </div>
              </div>
              <div 
                onClick={() => handleModelSelect('modern')}
                className={`${styles.modelOption} ${styles.glassCard} rounded-lg p-4 ${selectedModel === 'modern' ? styles.selected : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <i className="fas fa-paint-brush text-2xl text-white/80"></i>
                  <div>
                    <h3 className="font-medium text-white">现代艺术模型</h3>
                    <p className="text-sm text-white/70">融合现代艺术设计理念</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 纹样生成参数区 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <i className="fas fa-sliders-h mr-3 text-white/80"></i>
              纹样生成参数
            </h2>
            
            {/* 风格选择 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-white mb-4">扎染风格选择</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:translate-x-1">
                  <input 
                    type="checkbox" 
                    className={styles.checkboxCustom}
                    checked={selectedStyles.includes('traditional')}
                    onChange={() => handleStyleSelect('traditional')}
                  />
                  <span className="text-white/90">传统蓝白晕染</span>
                </label>
                <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:translate-x-1">
                  <input 
                    type="checkbox" 
                    className={styles.checkboxCustom}
                    checked={selectedStyles.includes('gradient')}
                    onChange={() => handleStyleSelect('gradient')}
                  />
                  <span className="text-white/90">撞色渐变扎染</span>
                </label>
                <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:translate-x-1">
                  <input 
                    type="checkbox" 
                    className={styles.checkboxCustom}
                    checked={selectedStyles.includes('ink')}
                    onChange={() => handleStyleSelect('ink')}
                  />
                  <span className="text-white/90">水墨风扎染</span>
                </label>
                <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-all duration-300 hover:translate-x-1">
                  <input 
                    type="checkbox" 
                    className={styles.checkboxCustom}
                    checked={selectedStyles.includes('geometric')}
                    onChange={() => handleStyleSelect('geometric')}
                  />
                  <span className="text-white/90">几何线条扎染</span>
                </label>
              </div>
            </div>
            
            {/* 细节参数 */}
            <div>
              <h3 className="text-lg font-medium text-white mb-4">细节参数调整</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 晕染浓度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">晕染浓度</label>
                    <span className="text-white/70 text-sm">{patternParameters.dyeConcentration}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0" 
                    max="100" 
                    value={patternParameters.dyeConcentration}
                    onChange={(e) => handleParameterChange('dyeConcentration', parseInt(e.target.value))}
                  />
                </div>
                
                {/* 花纹疏密 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">花纹疏密</label>
                    <span className="text-white/70 text-sm">{patternParameters.patternDensity}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0" 
                    max="100" 
                    value={patternParameters.patternDensity}
                    onChange={(e) => handleParameterChange('patternDensity', parseInt(e.target.value))}
                  />
                </div>
                
                {/* 融合强度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">融合强度</label>
                    <span className="text-white/70 text-sm">{patternParameters.fusionStrength}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0" 
                    max="100" 
                    value={patternParameters.fusionStrength}
                    onChange={(e) => handleParameterChange('fusionStrength', parseInt(e.target.value))}
                  />
                </div>
                
                {/* 色彩饱和度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">色彩饱和度</label>
                    <span className="text-white/70 text-sm">{patternParameters.colorSaturation}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0" 
                    max="100" 
                    value={patternParameters.colorSaturation}
                    onChange={(e) => handleParameterChange('colorSaturation', parseInt(e.target.value))}
                  />
                </div>
                
                {/* 纹样大小 */}
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">纹样大小</label>
                    <span className="text-white/70 text-sm">{patternParameters.patternSize}%</span>
                  </div>
                  <input 
                    type="range" 
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0" 
                    max="100" 
                    value={patternParameters.patternSize}
                    onChange={(e) => handleParameterChange('patternSize', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 操作按钮区 */}
          <section className="mb-8 text-center">
            <button 
              onClick={handleGeneratePatterns}
              disabled={isGenerating}
              className={`${styles.glassButton} px-12 py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-3"></i>
                  生成中...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-3"></i>
                  生成创新纹样
                </>
              )}
            </button>
          </section>
          
          {/* 实时预览区 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <i className="fas fa-eye mr-3 text-white/80"></i>
              实时纹样预览
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${styles.patternGrid} aspect-square rounded-xl relative overflow-hidden`}>
                {realTimePreviewImage ? (
                  <img 
                    src={realTimePreviewImage} 
                    alt="实时纹样预览" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <i className="fas fa-magic text-6xl text-white/40 mb-4"></i>
                      <p className="text-white/60">调整参数查看实时纹样效果</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-medium text-white mb-4">预览操作</h3>
                <p className="text-white/70 mb-6">调整左侧参数滑块，实时查看纹样效果变化。点击下载按钮保存当前预览效果。</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={updatePatternPreview}
                    className={`${styles.glassButton} flex-1 py-3 rounded-lg text-white font-medium`}
                  >
                    <i className="fas fa-sync-alt mr-2"></i>
                    更新预览
                  </button>
                  <button 
                    onClick={handleDownloadPreview}
                    className="bg-accent text-white flex-1 py-3 rounded-lg font-medium hover:bg-white/20 transition-all duration-300"
                  >
                    <i className="fas fa-download mr-2"></i>
                    下载预览
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 生成纹样管理区 */}
          <section className={`${styles.glassCard} rounded-2xl p-6`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <i className="fas fa-images mr-3 text-white/80"></i>
                生成纹样管理
              </h2>
              <button 
                onClick={handleClearAllPatterns}
                className="text-white/60 hover:text-white text-sm transition-all duration-300 hover:translate-x-1"
              >
                <i className="fas fa-trash-alt mr-1"></i>
                清空所有生成纹样
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generatedPatterns.length > 0 ? (
                generatedPatterns.map((pattern) => (
                  <div key={pattern.id} className={`${styles.glassCard} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02]`}>
                    <div className={`${styles.patternGrid} aspect-square relative`}>
                      <img 
                        src={pattern.imageUrl} 
                        alt={pattern.name} 
                        className="w-full h-full object-cover"
                      />
                      {pattern.isSelected && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-accent text-white text-xs px-2 py-1 rounded-full">待用纹样</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <input 
                        type="text" 
                        value={pattern.name}
                        onChange={(e) => handleRenamePattern(pattern.id, e.target.value)}
                        onBlur={(e) => handleRenamePattern(pattern.id, e.target.value)}
                        className="w-full bg-transparent text-white text-center font-medium mb-3 border-none outline-none hover:bg-white/10 rounded-lg p-2 transition-colors"
                      />
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => console.log('下载纹样')}
                          className={`${styles.glassButton} flex-1 py-2 px-3 rounded-lg text-white text-sm`}
                        >
                          <i className="fas fa-download mr-1"></i>
                          下载
                        </button>
                        <button 
                          onClick={() => handleDeletePattern(pattern.id)}
                          className={`${styles.glassButton} flex-1 py-2 px-3 rounded-lg text-white text-sm`}
                        >
                          <i className="fas fa-trash mr-1"></i>
                          删除
                        </button>
                        <button 
                          onClick={() => handleSelectPattern(pattern.id)}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                            pattern.isSelected 
                              ? 'bg-accent text-white' 
                              : `${styles.glassButton} text-white`
                          }`}
                        >
                          {pattern.isSelected ? '已选中' : '设为待用'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <i className="fas fa-images text-4xl text-white/40 mb-4"></i>
                  <p className="text-white/60">暂无生成纹样</p>
                </div>
              )}
            </div>
          </section>

          {/* 进入元素组合按钮 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mt-8`}>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-4">纹样设计完成</h2>
              <p className="text-white/70 mb-6">您的纹样设计已完成，现在可以进入元素组合页面进行进一步的创作</p>
              <button
                onClick={() => navigate('/element-combine')}
                className={`${styles.glassButton} px-8 py-3 rounded-lg text-white font-medium text-lg hover:scale-105 transition-transform`}
              >
                <i className="fas fa-arrow-right mr-2"></i>
                进入元素组合
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PatternDesignPage;

