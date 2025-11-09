
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

interface ProcessedImage {
  original: string;
  edges: string;
  simplified: string;
  vector: string;
}

interface ProcessingOptions {
  edgeThreshold: number;
  blurRadius: number;
  contrastLevel: number;
  simplificationLevel: number;
}

const PatternVectorizePage: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [processedImages, setProcessedImages] = useState<ProcessedImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [options, setOptions] = useState<ProcessingOptions>({
    edgeThreshold: 50,
    blurRadius: 1,
    contrastLevel: 50,
    simplificationLevel: 50
  });

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageDataUrl = event.target?.result as string;
        setUploadedImage(imageDataUrl);
        setProcessedImages(null);
        setCurrentStep(1);
        
        // 自动开始处理
        await processUploadedImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理上传的图片
  const processUploadedImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    setCurrentStep(2);

    try {
      // 步骤1: 加载图片
      const image = new Image();
      image.src = imageDataUrl;
      await new Promise((resolve) => { image.onload = resolve; });

      // 步骤2: 边缘检测
      setCurrentStep(3);
      const edgesImage = await detectEdges(image);

      // 步骤3: 黑白简化
      setCurrentStep(4);
      const simplifiedImage = await simplifyToBlackWhite(image, edgesImage);

      // 步骤4: 矢量化处理
      setCurrentStep(5);
      const vectorImage = await vectorize(simplifiedImage, image);

      setProcessedImages({
        original: imageDataUrl,
        edges: edgesImage,
        simplified: simplifiedImage,
        vector: vectorImage
      });

      setCurrentStep(6);
    } catch (error) {
      console.error('处理图片时出错:', error);
      alert('处理失败，请重试');
      setCurrentStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  // 重新处理图片（参数调整后）
  const handleProcessImage = async () => {
    if (!uploadedImage) return;
    await processUploadedImage(uploadedImage);
  };

  // 边缘检测（Canny算法）
  const detectEdges = async (image: HTMLImageElement): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;

    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 转换为灰度
    const grayData = new Uint8Array(canvas.width * canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.floor(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayData[i / 4] = gray;
    }

    // 高斯模糊
    const blurred = gaussianBlur(grayData, canvas.width, canvas.height, options.blurRadius);

    // Sobel边缘检测
    const edges = sobelEdgeDetection(blurred, canvas.width, canvas.height);

    // 应用阈值
    const threshold = (options.edgeThreshold / 100) * 255;
    for (let i = 0; i < edges.length; i++) {
      edges[i] = edges[i] > threshold ? 255 : 0;
    }

    // 将边缘数据写回canvas
    for (let i = 0; i < edges.length; i++) {
      const val = edges[i];
      data[i * 4] = val;
      data[i * 4 + 1] = val;
      data[i * 4 + 2] = val;
      data[i * 4 + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  // 高斯模糊
  const gaussianBlur = (data: Uint8Array, width: number, height: number, radius: number): Uint8Array => {
    if (radius < 1) return data;

    const result = new Uint8Array(data.length);
    const kernel = createGaussianKernel(radius);
    const kernelSize = kernel.length;
    const half = Math.floor(kernelSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let weightSum = 0;

        for (let ky = -half; ky <= half; ky++) {
          for (let kx = -half; kx <= half; kx++) {
            const px = Math.min(Math.max(x + kx, 0), width - 1);
            const py = Math.min(Math.max(y + ky, 0), height - 1);
            const weight = kernel[ky + half] * kernel[kx + half];
            sum += data[py * width + px] * weight;
            weightSum += weight;
          }
        }

        result[y * width + x] = Math.round(sum / weightSum);
      }
    }

    return result;
  };

  // 创建高斯核
  const createGaussianKernel = (radius: number): number[] => {
    const size = radius * 2 + 1;
    const kernel = new Array(size);
    const sigma = radius / 3;
    const twoSigmaSquare = 2 * sigma * sigma;
    let sum = 0;

    for (let i = 0; i < size; i++) {
      const x = i - radius;
      kernel[i] = Math.exp(-(x * x) / twoSigmaSquare);
      sum += kernel[i];
    }

    // 归一化
    for (let i = 0; i < size; i++) {
      kernel[i] /= sum;
    }

    return kernel;
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

  // 黑白简化
  const simplifyToBlackWhite = async (
    originalImage: HTMLImageElement,
    edgesDataUrl: string
  ): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // 加载边缘图
    const edgeImage = new Image();
    edgeImage.src = edgesDataUrl;
    await new Promise((resolve) => { edgeImage.onload = resolve; });

    // 白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制原图（用于获取颜色信息）
    ctx.drawImage(originalImage, 0, 0);
    const originalData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 绘制边缘
    ctx.drawImage(edgeImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const originalPixels = originalData.data;

    // 应用对比度和简化
    const contrastFactor = (options.contrastLevel / 50);
    const simplifyLevel = options.simplificationLevel / 100;

    for (let i = 0; i < data.length; i += 4) {
      // 如果是边缘（黑色）
      if (data[i] < 128) {
        // 计算原图该位置的亮度
        const brightness = (originalPixels[i] + originalPixels[i + 1] + originalPixels[i + 2]) / 3;
        
        // 根据简化级别决定是否保留这个边缘点
        if (Math.random() > simplifyLevel * 0.3) {
          const darkness = Math.max(0, 255 - brightness * contrastFactor);
          data[i] = darkness;
          data[i + 1] = darkness;
          data[i + 2] = darkness;
        } else {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      } else {
        // 背景保持白色
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
      data[i + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  };

  // 矢量化处理（优化线条）
  const vectorize = async (simplifiedDataUrl: string, originalImage: HTMLImageElement): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;

    // 加载简化后的图片
    const simplifiedImage = new Image();
    simplifiedImage.src = simplifiedDataUrl;
    await new Promise((resolve) => { simplifiedImage.onload = resolve; });

    // 白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(simplifiedImage, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 细化线条（使边缘更清晰）
    const thinned = thinEdges(data, canvas.width, canvas.height);

    // 应用抗锯齿
    ctx.putImageData(thinned, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 绘制最终版本
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL('image/png');
  };

  // 细化边缘
  const thinEdges = (data: Uint8ClampedArray, width: number, height: number): ImageData => {
    const result = new ImageData(width, height);
    const resultData = result.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        if (data[idx] < 128) {
          // 检查邻域
          let neighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nIdx = ((y + dy) * width + (x + dx)) * 4;
              if (data[nIdx] < 128) neighbors++;
            }
          }

          // 如果邻居少于2个或多于6个，可能是噪点或内部填充
          if (neighbors >= 2 && neighbors <= 6) {
            resultData[idx] = 0;
            resultData[idx + 1] = 0;
            resultData[idx + 2] = 0;
            resultData[idx + 3] = 255;
          } else {
            resultData[idx] = 255;
            resultData[idx + 1] = 255;
            resultData[idx + 2] = 255;
            resultData[idx + 3] = 255;
          }
        } else {
          resultData[idx] = 255;
          resultData[idx + 1] = 255;
          resultData[idx + 2] = 255;
          resultData[idx + 3] = 255;
        }
      }
    }

    return result;
  };

  // 下载图片
  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
  };

  // 重置
  const handleReset = () => {
    setUploadedImage(null);
    setProcessedImages(null);
    setCurrentStep(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const steps = [
    '上传素材',
    '素材预览',
    '开始处理',
    '边缘检测',
    '黑白简化',
    '矢量优化',
    '完成输出'
  ];

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 ${styles.glassCard}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                <i className="fas fa-palette text-white text-lg"></i>
              </div>
              <span className="text-xl font-bold text-white">染纹创合</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/home" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                首页
              </Link>
              <Link to="/pattern-vectorize" className={`${styles.navLink} ${styles.active} text-white py-2`}>
                素材处理
              </Link>
              <Link to="/pattern-design" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                纹样设计
              </Link>
              <Link to="/element-combine" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                元素组合
              </Link>
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                服饰/首饰应用
              </Link>
              <Link to="/history" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                历史记录
              </Link>
              <Link to="/help" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>
                帮助指南
              </Link>
            </div>
            
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
              <span className="text-white">素材处理</span>
            </div>
            <h1 className="text-3xl font-bold text-white">素材处理 - 矢量化转换</h1>
            <p className="text-white/70 mt-2">将彩色图片转换为黑白线稿，生成可用于纹样设计的矢量素材</p>
          </header>

          {/* 处理步骤指示器 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index < currentStep 
                        ? 'bg-green-500 text-white' 
                        : index === currentStep 
                        ? 'bg-blue-500 text-white animate-pulse' 
                        : 'bg-white/10 text-white/50'
                    }`}>
                      {index < currentStep ? (
                        <i className="fas fa-check"></i>
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-2 ${
                      index <= currentStep ? 'text-white' : 'text-white/50'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                      index < currentStep ? 'bg-green-500' : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 上传区域 */}
          {!uploadedImage && (
            <section className={`${styles.glassCard} rounded-2xl p-12 mb-8`}>
              <div className="text-center">
                <div className={`${styles.uploadArea} rounded-xl p-12 mx-auto max-w-2xl`}>
                  <i className="fas fa-cloud-upload-alt text-6xl text-white/60 mb-6"></i>
                  <h3 className="text-2xl font-medium text-white mb-4">上传图片素材</h3>
                  <p className="text-white/70 mb-6">支持 JPG、PNG、GIF 等常见格式</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`${styles.glassButton} px-8 py-3 rounded-lg text-white font-medium text-lg`}
                  >
                    <i className="fas fa-folder-open mr-2"></i>
                    选择文件
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* 参数调整区域 */}
          {uploadedImage && (
            <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-sliders-h mr-3 text-white/80"></i>
                处理参数调整
                {isProcessing && <span className="ml-3 text-sm text-yellow-300 animate-pulse">正在处理中...</span>}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* 边缘检测阈值 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">边缘检测灵敏度</label>
                    <span className="text-white/70 text-sm">{options.edgeThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0"
                    max="100"
                    value={options.edgeThreshold}
                    onChange={(e) => setOptions({ ...options, edgeThreshold: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-white/60 mt-1">值越高，检测到的边缘越少</p>
                </div>

                {/* 模糊半径 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">边缘平滑度</label>
                    <span className="text-white/70 text-sm">{options.blurRadius}</span>
                  </div>
                  <input
                    type="range"
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0"
                    max="5"
                    value={options.blurRadius}
                    onChange={(e) => setOptions({ ...options, blurRadius: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-white/60 mt-1">值越高，线条越平滑</p>
                </div>

                {/* 对比度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">线条深度</label>
                    <span className="text-white/70 text-sm">{options.contrastLevel}%</span>
                  </div>
                  <input
                    type="range"
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0"
                    max="100"
                    value={options.contrastLevel}
                    onChange={(e) => setOptions({ ...options, contrastLevel: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-white/60 mt-1">控制线条的深浅程度</p>
                </div>

                {/* 简化程度 */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-white/90 font-medium">简化程度</label>
                    <span className="text-white/70 text-sm">{options.simplificationLevel}%</span>
                  </div>
                  <input
                    type="range"
                    className={`w-full h-2 ${styles.sliderTrack} appearance-none cursor-pointer`}
                    min="0"
                    max="100"
                    value={options.simplificationLevel}
                    onChange={(e) => setOptions({ ...options, simplificationLevel: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-white/60 mt-1">值越高，细节越少，越简洁</p>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className={`${styles.glassButton} px-8 py-3 rounded-lg text-white font-medium`}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      处理中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt mr-2"></i>
                      重新处理
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className={`${styles.glassButton} px-6 py-3 rounded-lg text-white font-medium`}
                >
                  <i className="fas fa-redo mr-2"></i>
                  重新上传
                </button>
              </div>
            </section>
          )}

          {/* 预览对比区域 */}
          {uploadedImage && (
            <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-images mr-3 text-white/80"></i>
                预览对比
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 原始图 */}
                <div className={`${styles.glassCard} rounded-xl p-4`}>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                    <i className="fas fa-image mr-2"></i>
                    原始图
                  </h3>
                  <div className={`${styles.imagePreview} rounded-lg overflow-hidden bg-white/5`}>
                    <img src={uploadedImage} alt="原始图" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* 线稿图 */}
                <div className={`${styles.glassCard} rounded-xl p-4`}>
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center justify-between">
                    <span>
                      <i className="fas fa-pencil-ruler mr-2"></i>
                      线稿图
                    </span>
                    {processedImages && (
                      <button
                        onClick={() => handleDownload(processedImages.vector, '线稿图.png')}
                        className="text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <i className="fas fa-download mr-1"></i>
                        下载
                      </button>
                    )}
                  </h3>
                  <div className={`${styles.imagePreview} rounded-lg overflow-hidden bg-white`}>
                    {processedImages ? (
                      <img src={processedImages.vector} alt="线稿图" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        {isProcessing ? (
                          <div className="text-center">
                            <i className="fas fa-spinner fa-spin text-4xl mb-3 text-blue-500"></i>
                            <p className="text-gray-600 font-medium">正在生成线稿...</p>
                            <p className="text-sm text-gray-400 mt-2">
                              {currentStep === 2 && '正在加载图片...'}
                              {currentStep === 3 && '正在检测边缘...'}
                              {currentStep === 4 && '正在黑白简化...'}
                              {currentStep === 5 && '正在矢量优化...'}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <i className="fas fa-image text-4xl mb-3 text-gray-300"></i>
                            <p className="text-gray-600">上传图片后自动生成</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* 处理结果详细展示 */}
          {processedImages && (
            <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-layer-group mr-3 text-white/80"></i>
                处理过程详解
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 边缘检测 */}
                <div className={`${styles.glassCard} rounded-xl p-4`}>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center justify-between">
                    <span>边缘检测</span>
                    <button
                      onClick={() => handleDownload(processedImages.edges, '边缘检测.png')}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </h4>
                  <div className="aspect-video rounded-lg overflow-hidden bg-white">
                    <img src={processedImages.edges} alt="边缘检测" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* 黑白简化 */}
                <div className={`${styles.glassCard} rounded-xl p-4`}>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center justify-between">
                    <span>黑白简化</span>
                    <button
                      onClick={() => handleDownload(processedImages.simplified, '黑白简化.png')}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </h4>
                  <div className="aspect-video rounded-lg overflow-hidden bg-white">
                    <img src={processedImages.simplified} alt="黑白简化" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* 矢量优化 */}
                <div className={`${styles.glassCard} rounded-xl p-4`}>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center justify-between">
                    <span>矢量优化</span>
                    <button
                      onClick={() => handleDownload(processedImages.vector, '矢量优化.png')}
                      className="text-xs px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                  </h4>
                  <div className="aspect-video rounded-lg overflow-hidden bg-white">
                    <img src={processedImages.vector} alt="矢量优化" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={handleReset}
                  className={`${styles.glassButton} px-6 py-3 rounded-lg text-white font-medium`}
                >
                  <i className="fas fa-redo mr-2"></i>
                  处理新图片
                </button>
                <Link
                  to="/pattern-design"
                  className={`${styles.glassButton} px-6 py-3 rounded-lg text-white font-medium inline-flex items-center`}
                >
                  <i className="fas fa-arrow-right mr-2"></i>
                  进入纹样设计
                </Link>
              </div>
            </section>
          )}

          {/* 使用说明 */}
          <section className={`${styles.glassCard} rounded-2xl p-6`}>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <i className="fas fa-info-circle mr-3 text-white/80"></i>
              使用说明
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/80">
              <div>
                <h3 className="font-medium text-white mb-2">📷 上传图片</h3>
                <ul className="space-y-1 text-white/70">
                  <li>• 支持 JPG、PNG、GIF 等格式</li>
                  <li>• 建议图片尺寸：800x600 以上</li>
                  <li>• 图片内容清晰，主体突出效果更佳</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">⚙️ 参数调整</h3>
                <ul className="space-y-1 text-white/70">
                  <li>• <strong>边缘灵敏度</strong>：控制检测到的边缘数量</li>
                  <li>• <strong>边缘平滑度</strong>：让线条更流畅自然</li>
                  <li>• <strong>线条深度</strong>：调整线条的深浅</li>
                  <li>• <strong>简化程度</strong>：减少细节，更简洁</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">🎨 处理流程</h3>
                <ul className="space-y-1 text-white/70">
                  <li>1. 边缘检测 - Sobel算法识别轮廓</li>
                  <li>2. 黑白简化 - 转换为黑白线稿</li>
                  <li>3. 矢量优化 - 细化和平滑线条</li>
                  <li>4. 输出结果 - 可直接用于纹样设计</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-white mb-2">💡 使用技巧</h3>
                <ul className="space-y-1 text-white/70">
                  <li>• 彩色图案优先降低边缘灵敏度</li>
                  <li>• 复杂图案适当提高简化程度</li>
                  <li>• 可多次调整参数对比效果</li>
                  <li>• 生成的线稿可直接用于下一步设计</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PatternVectorizePage;

