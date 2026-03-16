import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import patternData from '../../data/pattern-data-complete.json';

interface PatternRow {
  id: string;
  culturalArtifact: {
    name: string;
    image: string;
    description: string;
  };
  vectorizedImage: {
    image: string;
  };
  patternName: {
    name: string;
  };
  patternSemantics: {
    description: string;
  };
  elementExtraction: {
    image: string;
  };
  dyeingTechnique: {
    description: string;
  };
  recomposition: {
    image: string;
  };
  innovativePattern: {
    image: string;
  };
  isSelected?: boolean;
}

const PatternLibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [importedPatternData, setImportedPatternData] = useState<PatternRow[]>([]);
  const [previewImage, setPreviewImage] = useState<{src: string, alt: string} | null>(null);


  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '纹样库 - 染纹创合';
    return () => { document.title = originalTitle; };
  }, []);

  // 处理ESC键关闭预览
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewImage) {
        closeImagePreview();
      }
    };

    if (previewImage) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [previewImage]);

  // 列标题
  const columnHeaders = [
    '文物原型',
    '矢量化图片', 
    '纹样名称',
    '纹样语义',
    '元素提取',
    '扎染技法',
    '重新构图',
    '创新纹样'
  ];

  // 创建空的表格行数据
  const generatePatternRows = (): PatternRow[] => {
    const rows: PatternRow[] = [];
    
    // 创建空行用于展示表格结构
    for (let i = 0; i < 16; i++) {
      rows.push({
        id: `row-${i}`,
        culturalArtifact: {
          name: '',
          image: '',
          description: ''
        },
        vectorizedImage: {
          image: ''
        },
        patternName: {
          name: ''
        },
        patternSemantics: {
          description: ''
        },
        elementExtraction: {
          image: ''
        },
        dyeingTechnique: {
          description: ''
        },
        recomposition: {
          image: ''
        },
        innovativePattern: {
          image: ''
        }
      });
    }
    return rows;
  };

  // 使用导入的数据或用户导入的数据或默认空数据
  const rawRows = importedPatternData.length > 0 ? importedPatternData : (patternData.patterns.length > 0 ? patternData.patterns : []);
  const displayRows: PatternRow[] = [...rawRows.slice(0, 16)];
  if (displayRows.length < 16) {
    displayRows.push(...generatePatternRows().slice(0, 16 - displayRows.length));
  }

  


  // 处理纹样选择
  const handlePatternSelect = (patternId: string) => {
    setSelectedPatterns(prev => 
      prev.includes(patternId) 
        ? prev.filter(id => id !== patternId)
        : [...prev, patternId]
    );
  };

  // 处理搜索
  const handleSearch = () => {
    console.log('搜索:', searchTerm);
  };

  // 处理图片预览
  const handleImagePreview = (src: string, alt: string) => {
    setPreviewImage({ src, alt });
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  // 处理JSON文件导入
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          if (jsonData.patterns && Array.isArray(jsonData.patterns)) {
            setImportedPatternData(jsonData.patterns);
            console.log('数据导入成功:', jsonData.patterns.length, '条记录');
          } else {
            alert('JSON格式不正确，请检查数据结构');
          }
        } catch (error) {
          alert('文件解析失败，请检查JSON格式');
        }
      };
      reader.readAsText(file);
    } else {
      alert('请选择JSON格式的文件');
    }
  };

  // 导出数据模板
  const handleExportTemplate = () => {
    const template = {
      patterns: [
        {
          id: "pattern-001",
          culturalArtifact: {
            name: "文物名称",
            image: "/images/artifacts/artifact.jpg",
            description: "文物描述"
          },
          vectorizedImage: {
            image: "/images/vectorized/pattern.jpg"
          },
          patternName: {
            name: "纹样名称"
          },
          patternSemantics: {
            description: "纹样语义描述"
          },
          elementExtraction: {
            image: "/images/elements/elements.jpg"
          },
          dyeingTechnique: {
            description: "扎染技法描述"
          },
          recomposition: {
            image: "/images/recomposition/recomposed.jpg"
          },
          innovativePattern: {
            image: "/images/innovative/innovative.jpg"
          }
        }
      ]
    };
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pattern-data-template.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // 清空数据
  const handleClearData = () => {
    if (confirm('确定要清空所有数据吗？')) {
      setImportedPatternData([]);
      setSelectedPatterns([]);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 顶部导航栏 */}
      <nav className={`fixed top-0 left-0 right-0 z-50 customNav`}>
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
            <div className="flex items-center space-x-8">
              <Link to="/home" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>首页</Link>
              <Link to="/pattern-vectorize" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>素材处理</Link>
              <Link to="/pattern-design" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>纹样设计</Link>
              <Link to="/element-combine" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>元素组合</Link>
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>文创应用</Link>
              <Link to="/pattern-library" className={`${styles.navLink} ${styles.active} text-white py-2`}>纹样库</Link>
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
              <span className="text-white">纹样库</span>
            </div>
            <h1 className="text-3xl font-bold text-white">纹样库</h1>
            <p className="text-white/70 mt-2">浏览和管理丰富的扎染纹样资源库</p>
          </header>

          {/* 数据管理工具栏 */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
            {/* 左侧数据管理按钮 */}
            <div className="flex flex-wrap gap-3">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="json-file-input"
              />
              <button
                onClick={() => document.getElementById('json-file-input')?.click()}
                className="customButton px-6 py-2 text-white font-medium"
              >
                <i className="fas fa-upload mr-2"></i>
                导入数据
              </button>
              <button
                onClick={handleExportTemplate}
                className="customButton px-6 py-2 text-white font-medium"
              >
                <i className="fas fa-download mr-2"></i>
                下载模板
              </button>
              {importedPatternData.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="customButton px-6 py-2 text-white font-medium"
                >
                  <i className="fas fa-trash mr-2"></i>
                  清空数据
                </button>
              )}
            </div>

            

            {/* 右侧搜索框和数据统计 */}
            <div className="flex items-center space-x-4">
              {displayRows.length > 0 && (
                <span className="text-white/70 text-sm">
                  共 {displayRows.length} 条记录
                </span>
              )}
              <div className="relative">
                <input
                  type="text"
                  placeholder="搜索纹样..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-80 px-6 py-3 pr-12 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <i className="fas fa-search text-lg"></i>
                </button>
              </div>
            </div>
          </div>

          {/* 纹样表格区域 */}
          <div className="customCard p-6">
            {/* 表格头部 */}
            <div className="grid grid-cols-8 gap-4 mb-6">
              {columnHeaders.map((header, index) => (
                <div key={index} className="text-center">
                  <div className={`${styles.headerCell} px-4 py-2 flex items-center justify-center`}>
                    <span className="text-gray-800 font-medium text-sm">{header}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 表格内容 */}
            <div className="space-y-4">
              {displayRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => handlePatternSelect(row.id)}
                  className={`grid grid-cols-8 gap-4 transition-all duration-300 ${
                    selectedPatterns.includes(row.id) ? 'bg-white/10 rounded-lg p-2' : ''
                  }`}
                >
                  
                  {/* 文物原型 */}
                  <div className={`${styles.patternCell} flex flex-col`}>
                    <div className={`${styles.imageCell} flex-1`}>
                      {row.culturalArtifact.image ? (
                        <img 
                          src={row.culturalArtifact.image} 
                          alt={row.culturalArtifact.name}
                          className="w-full h-full object-cover object-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImagePreview(row.culturalArtifact.image, row.culturalArtifact.name);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                          <i className="fas fa-vase-alt text-2xl mb-2"></i>
                          <span className="text-xs text-center">文物原型</span>
                        </div>
                      )}
                    </div>
                    {row.culturalArtifact.name && (
                      <div className="px-2 py-1 text-black text-xs text-center leading-tight">
                        {row.culturalArtifact.name}
                      </div>
                    )}
                  </div>

                  {/* 矢量化图片 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}>
                    {row.vectorizedImage.image ? (
                      <img 
                        src={row.vectorizedImage.image} 
                        alt="矢量化图片"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(row.vectorizedImage.image, "矢量化图片");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <i className="fas fa-vector-square text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 纹样名称 */}
                  <div className={`${styles.patternCell} ${styles.textCell}`}>
                    <div className="text-black font-medium text-center text-sm leading-relaxed whitespace-pre-line">
                      {row.patternName.name || '纹样名称'}
                    </div>
                  </div>

                  {/* 纹样语义 */}
                  <div className={`${styles.patternCell} ${styles.textCell} ${styles.semanticsCell}`}>
                    <div className="text-black text-sm leading-relaxed text-center">
                      {row.patternSemantics.description || '纹样语义描述'}
                    </div>
                  </div>

                  {/* 元素提取 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}>
                    {row.elementExtraction.image ? (
                      <img 
                        src={row.elementExtraction.image} 
                        alt="元素提取"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(row.elementExtraction.image, "元素提取");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <i className="fas fa-puzzle-piece text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 扎染技法 */}
                  <div className={`${styles.patternCell} ${styles.textCell} ${styles.semanticsCell}`}></div>

                  {/* 重新构图 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}></div>

                  {/* 创新纹样 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}>
                    {row.innovativePattern.image ? (
                      <img 
                        src={row.innovativePattern.image} 
                        alt="创新纹样"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(row.innovativePattern.image, "创新纹样");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <i className="fas fa-magic text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 选中状态指示器 */}
                  {selectedPatterns.includes(row.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 底部操作栏 */}
          {selectedPatterns.length > 0 && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
              <div className="customCard px-6 py-3 flex items-center space-x-4">
                <span className="text-white font-medium">
                  已选择 {selectedPatterns.length} 个纹样
                </span>
                <div className="flex space-x-3">
                  <button className="customButton px-4 py-2 text-white text-sm">
                    <i className="fas fa-download mr-2"></i>
                    批量下载
                  </button>
                  <button className="customButton px-4 py-2 text-white text-sm">
                    <i className="fas fa-heart mr-2"></i>
                    添加收藏
                  </button>
                  <button 
                    onClick={() => setSelectedPatterns([])}
                    className="customButton px-4 py-2 text-white text-sm"
                  >
                    <i className="fas fa-times mr-2"></i>
                    取消选择
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 图片预览模态框 */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <img 
              src={previewImage.src} 
              alt={previewImage.alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeImagePreview}
              className="absolute top-2 right-2 w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center text-white text-xl transition-all duration-200"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-center py-2 px-4 rounded">
              {previewImage.alt}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternLibraryPage;
