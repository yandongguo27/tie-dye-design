import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import patternData from '../../data/pattern-data-complete.json';
import { supabase } from '../../lib/supabaseClient';

const USER_PATTERNS_STORAGE_KEY = 'tie-dye-user-patterns';

type CommunityPatternRow = { id: string; payload: PatternRow };

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
  // Vite 配置了 base='/tie-dye-design/' 时，浏览器实际请求会带前缀。
  // 但 pattern-data json 里的 image 路径是以 '/images/...' 开头，未带 base 会导致 404。
  // 这里统一把资源路径补齐 base 前缀。
  const normalizeAssetPath = (src: string) => {
    if (!src) return src;
    const base = import.meta.env.BASE_URL || '/';
    if (src.startsWith(base)) return src;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
      return src;
    }
    return `${base}${src.replace(/^\/+/, '')}`;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [importedPatternData, setImportedPatternData] = useState<PatternRow[]>([]);
  const [basePatterns, setBasePatterns] = useState<PatternRow[]>([]);
  const [userAddedPatterns, setUserAddedPatterns] = useState<PatternRow[]>([]);
  const [isSavingPattern, setIsSavingPattern] = useState(false);
  const [editingPatternId, setEditingPatternId] = useState<string | null>(null);
  const [editingPatternScope, setEditingPatternScope] = useState<'base' | 'community' | null>(null);
  const [deletingPatternId, setDeletingPatternId] = useState<string | null>(null);
  const [cloudLoadError, setCloudLoadError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{src: string, alt: string} | null>(null);
  const [newPatternForm, setNewPatternForm] = useState({
    culturalArtifactImage: '',
    vectorizedImage: '',
    elementExtractionImage: '',
    recompositionImage: '',
    innovativePatternImage: '',
    patternName: '',
    patternSemantics: '',
    dyeingTechnique: ''
  });
  const isEditingMode = editingPatternId !== null;


  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '纹样库 - 染纹创合';
    return () => { document.title = originalTitle; };
  }, []);

  // 基础数据（默认16条或导入数据）可本地编辑/删除
  useEffect(() => {
    const sourceRows =
      importedPatternData.length > 0
        ? importedPatternData
        : (patternData.patterns.length > 0 ? patternData.patterns : []);
    setBasePatterns(sourceRows);
  }, [importedPatternData]);

  // 云端：拉取共享纹样 + 订阅新增；未配置时退回本地缓存
  useEffect(() => {
    if (supabase) {
      const client = supabase;
      setCloudLoadError(null);
      const load = async () => {
        const { data, error } = await client
          .from('community_patterns')
          .select('id, payload')
          .order('created_at', { ascending: true });
        if (error) {
          console.error(error);
          setCloudLoadError(error.message);
          return;
        }
        const rows = (data as CommunityPatternRow[] | null) ?? [];
        setUserAddedPatterns(
          rows.map((r) => ({ ...(r.payload as PatternRow), id: r.id }))
        );
      };
      void load();

      const channel = client
        .channel('community_patterns_inserts')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'community_patterns' },
          (payload: { new: unknown }) => {
            const row = payload.new as CommunityPatternRow;
            if (!row?.id || row.payload == null) return;
            const pattern = { ...(row.payload as PatternRow), id: row.id };
            setUserAddedPatterns((prev) => {
              if (prev.some((p) => p.id === pattern.id)) return prev;
              return [...prev, pattern];
            });
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'community_patterns' },
          (payload: { new: unknown }) => {
            const row = payload.new as CommunityPatternRow;
            if (!row?.id || row.payload == null) return;
            const pattern = { ...(row.payload as PatternRow), id: row.id };
            setUserAddedPatterns((prev) => prev.map((item) => (item.id === pattern.id ? pattern : item)));
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'community_patterns' },
          (payload: { old: { id?: string | number } }) => {
            const deletedId = String(payload.old?.id ?? '');
            if (!deletedId) return;
            setUserAddedPatterns((prev) => prev.filter((item) => item.id !== deletedId));
            setSelectedPatterns((prev) => prev.filter((id) => id !== deletedId));
          }
        )
        .subscribe();

      return () => {
        void client.removeChannel(channel);
      };
    }

    try {
      const raw = localStorage.getItem(USER_PATTERNS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setUserAddedPatterns(parsed);
      }
    } catch (error) {
      console.error('读取本地纹样数据失败:', error);
    }
    return undefined;
  }, []);

  // 未配置云端时，持久化到本机
  useEffect(() => {
    if (supabase) return;
    try {
      localStorage.setItem(USER_PATTERNS_STORAGE_KEY, JSON.stringify(userAddedPatterns));
    } catch (error) {
      console.error('保存本地纹样数据失败:', error);
    }
  }, [userAddedPatterns]);

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

  // 使用导入的数据或默认数据，并拼接用户新增数据
  const displayRows: PatternRow[] = [...basePatterns, ...userAddedPatterns];
  const userAddedPatternIdSet = new Set(userAddedPatterns.map((item) => item.id));

  


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

  const handleNewPatternFieldChange = (field: keyof typeof newPatternForm, value: string) => {
    setNewPatternForm(prev => ({ ...prev, [field]: value }));
  };

  const handleImageFileUpload = (
    field: 'culturalArtifactImage' | 'vectorizedImage' | 'elementExtractionImage' | 'recompositionImage' | 'innovativePatternImage',
    file?: File
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const fileData = reader.result;
      if (typeof fileData === 'string') {
        handleNewPatternFieldChange(field, fileData);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetPatternForm = () => {
    setNewPatternForm({
      culturalArtifactImage: '',
      vectorizedImage: '',
      elementExtractionImage: '',
      recompositionImage: '',
      innovativePatternImage: '',
      patternName: '',
      patternSemantics: '',
      dyeingTechnique: ''
    });
    setEditingPatternId(null);
    setEditingPatternScope(null);
  };

  const handleAddPattern = async () => {
    if (!newPatternForm.patternName.trim()) {
      alert('请至少填写“纹样名称”再添加');
      return;
    }

    const isEditingCommunityPattern = editingPatternScope === 'community' && Boolean(editingPatternId);
    const isEditingBasePattern = editingPatternScope === 'base' && Boolean(editingPatternId);
    const newPattern: PatternRow = {
      id: editingPatternId ?? `user-${Date.now()}`,
      culturalArtifact: {
        name: newPatternForm.patternName.trim(),
        image: newPatternForm.culturalArtifactImage.trim(),
        description: ''
      },
      vectorizedImage: {
        image: newPatternForm.vectorizedImage.trim()
      },
      patternName: {
        name: newPatternForm.patternName.trim()
      },
      patternSemantics: {
        description: newPatternForm.patternSemantics.trim()
      },
      elementExtraction: {
        image: newPatternForm.elementExtractionImage.trim()
      },
      dyeingTechnique: {
        description: newPatternForm.dyeingTechnique.trim()
      },
      recomposition: {
        image: newPatternForm.recompositionImage.trim()
      },
      innovativePattern: {
        image: newPatternForm.innovativePatternImage.trim()
      }
    };

    if (supabase && isEditingCommunityPattern) {
      const client = supabase;
      setIsSavingPattern(true);
      try {
        const { data, error } = await client
          .from('community_patterns')
          .update({ payload: newPattern })
          .eq('id', editingPatternId!)
          .select('id, payload')
          .single();
        if (error) throw error;
        const row = data as CommunityPatternRow;
        const merged = { ...(row.payload as PatternRow), id: row.id };
        setUserAddedPatterns((prev) => {
          if (prev.some((p) => p.id === merged.id)) {
            return prev.map((item) => (item.id === merged.id ? merged : item));
          }
          return [...prev, merged];
        });
        resetPatternForm();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        alert(`${editingPatternId ? '更新' : '保存'}到云端失败：${message}`);
      } finally {
        setIsSavingPattern(false);
      }
      return;
    }

    if (isEditingBasePattern) {
      if (importedPatternData.length > 0) {
        setImportedPatternData((prev) => prev.map((item) => (item.id === editingPatternId ? newPattern : item)));
      } else {
        setBasePatterns((prev) => prev.map((item) => (item.id === editingPatternId ? newPattern : item)));
      }
      resetPatternForm();
      return;
    }

    if (supabase) {
      const client = supabase;
      setIsSavingPattern(true);
      try {
        const { data, error } = await client
          .from('community_patterns')
          .insert({ payload: newPattern })
          .select('id, payload')
          .single();
        if (error) throw error;
        const row = data as CommunityPatternRow;
        const merged = { ...(row.payload as PatternRow), id: row.id };
        setUserAddedPatterns((prev) => {
          if (prev.some((p) => p.id === merged.id)) {
            return prev.map((item) => (item.id === merged.id ? merged : item));
          }
          return [...prev, merged];
        });
        resetPatternForm();
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        alert(`保存到云端失败：${message}`);
      } finally {
        setIsSavingPattern(false);
      }
      return;
    }

    setUserAddedPatterns((prev) => {
      if (editingPatternId && editingPatternScope === 'community') {
        return prev.map((item) => (item.id === editingPatternId ? newPattern : item));
      }
      return [...prev, newPattern];
    });
    resetPatternForm();
  };

  const handleStartEditPattern = (patternId: string) => {
    const isCommunityPattern = userAddedPatternIdSet.has(patternId);
    const sourceRows = isCommunityPattern ? userAddedPatterns : basePatterns;
    const target = sourceRows.find((item) => item.id === patternId);
    if (!target) return;
    setEditingPatternId(patternId);
    setEditingPatternScope(isCommunityPattern ? 'community' : 'base');
    setNewPatternForm({
      culturalArtifactImage: target.culturalArtifact.image || '',
      vectorizedImage: target.vectorizedImage.image || '',
      elementExtractionImage: target.elementExtraction.image || '',
      recompositionImage: target.recomposition.image || '',
      innovativePatternImage: target.innovativePattern.image || '',
      patternName: target.patternName.name || '',
      patternSemantics: target.patternSemantics.description || '',
      dyeingTechnique: target.dyeingTechnique.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePattern = async (patternId: string) => {
    const isCommunityPattern = userAddedPatternIdSet.has(patternId);
    const confirmMessage = isCommunityPattern
      ? '确定删除这条纹样吗？删除后所有访问者都将看不到该条目。'
      : '确定删除这条本地纹样吗？此操作仅影响当前页面数据。';
    if (!confirm(confirmMessage)) return;

    if (supabase && isCommunityPattern) {
      const client = supabase;
      setDeletingPatternId(patternId);
      try {
        const { error } = await client
          .from('community_patterns')
          .delete()
          .eq('id', patternId);
        if (error) throw error;
        setUserAddedPatterns((prev) => prev.filter((item) => item.id !== patternId));
        setSelectedPatterns((prev) => prev.filter((id) => id !== patternId));
        if (editingPatternId === patternId) {
          resetPatternForm();
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        alert(`删除失败：${message}`);
      } finally {
        setDeletingPatternId(null);
      }
      return;
    }

    if (isCommunityPattern) {
      setUserAddedPatterns((prev) => prev.filter((item) => item.id !== patternId));
    } else if (importedPatternData.length > 0) {
      setImportedPatternData((prev) => prev.filter((item) => item.id !== patternId));
    } else {
      setBasePatterns((prev) => prev.filter((item) => item.id !== patternId));
    }
    setSelectedPatterns((prev) => prev.filter((id) => id !== patternId));
    if (editingPatternId === patternId) {
      resetPatternForm();
    }
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
    if (confirm('确定要清空已导入的 JSON 数据吗？（访客共享纹样不会被删除）')) {
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

          {/* 访客新增纹样 */}
          <section className="customCard p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-2">
              {isEditingMode ? '编辑纹样（访客可修改）' : '新增纹样（访客可填写）'}
            </h2>
            {cloudLoadError && (
              <p className="text-amber-200 text-sm mb-4">
                云端加载失败：{cloudLoadError}（请检查表名是否为 community_patterns、RLS 是否允许匿名读取）
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                placeholder="文物原型（图片URL）"
                value={newPatternForm.culturalArtifactImage}
                onChange={(e) => handleNewPatternFieldChange('culturalArtifactImage', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="矢量化图片（图片URL）"
                value={newPatternForm.vectorizedImage}
                onChange={(e) => handleNewPatternFieldChange('vectorizedImage', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="元素提取（图片URL）"
                value={newPatternForm.elementExtractionImage}
                onChange={(e) => handleNewPatternFieldChange('elementExtractionImage', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="重新构图（图片URL）"
                value={newPatternForm.recompositionImage}
                onChange={(e) => handleNewPatternFieldChange('recompositionImage', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="创新纹样（图片URL）"
                value={newPatternForm.innovativePatternImage}
                onChange={(e) => handleNewPatternFieldChange('innovativePatternImage', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="纹样名称（必填）"
                value={newPatternForm.patternName}
                onChange={(e) => handleNewPatternFieldChange('patternName', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="纹样语义（文字）"
                value={newPatternForm.patternSemantics}
                onChange={(e) => handleNewPatternFieldChange('patternSemantics', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="text"
                placeholder="扎染技法（文字）"
                value={newPatternForm.dyeingTechnique}
                onChange={(e) => handleNewPatternFieldChange('dyeingTechnique', e.target.value)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 mb-4">
              <label className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 text-sm cursor-pointer hover:bg-white/15">
                上传文物原型
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileUpload('culturalArtifactImage', e.target.files?.[0])}
                />
              </label>
              <label className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 text-sm cursor-pointer hover:bg-white/15">
                上传矢量化图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileUpload('vectorizedImage', e.target.files?.[0])}
                />
              </label>
              <label className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 text-sm cursor-pointer hover:bg-white/15">
                上传元素提取
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileUpload('elementExtractionImage', e.target.files?.[0])}
                />
              </label>
              <label className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 text-sm cursor-pointer hover:bg-white/15">
                上传重新构图
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileUpload('recompositionImage', e.target.files?.[0])}
                />
              </label>
              <label className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 text-sm cursor-pointer hover:bg-white/15">
                上传创新纹样
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileUpload('innovativePatternImage', e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => void handleAddPattern()}
                disabled={isSavingPattern}
                className="customButton px-6 py-2 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-plus mr-2"></i>
                {isSavingPattern ? '保存中…' : isEditingMode ? '保存修改' : '添加到纹样库'}
              </button>
              {isEditingMode && (
                <button
                  type="button"
                  onClick={resetPatternForm}
                  className="customButton px-6 py-2 text-white font-medium"
                >
                  取消编辑
                </button>
              )}
            </div>
          </section>

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
                  className={`relative grid grid-cols-8 gap-4 transition-all duration-300 ${
                    selectedPatterns.includes(row.id) ? 'bg-white/10 rounded-lg p-2' : ''
                  }`}
                >
                  <div className="absolute -top-2 -left-2 z-20 flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEditPattern(row.id);
                      }}
                      className="px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs transition-colors"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleDeletePattern(row.id);
                      }}
                      disabled={deletingPatternId === row.id}
                      className="px-2 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deletingPatternId === row.id ? '删除中…' : '删除'}
                    </button>
                  </div>
                  
                  {/* 文物原型 */}
                  <div className={`${styles.patternCell} flex flex-col p-0`}>
                    <div className="h-[72%] w-full">
                      {row.culturalArtifact.image ? (
                        <img 
                          src={normalizeAssetPath(row.culturalArtifact.image)} 
                          alt={row.culturalArtifact.name}
                          className="w-full h-full object-cover object-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImagePreview(normalizeAssetPath(row.culturalArtifact.image), row.culturalArtifact.name);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
                          <i className="fas fa-vase-alt text-2xl mb-2"></i>
                          <span className="text-xs text-center">文物原型</span>
                        </div>
                      )}
                    </div>
                    <div className="h-[28%] w-full px-2 py-1.5 text-black text-xs text-center leading-tight flex items-center justify-center bg-gradient-to-b from-white/0 via-white/70 to-white/95">
                      <span className="line-clamp-3">
                        {row.culturalArtifact.name || '文物原型'}
                      </span>
                    </div>
                  </div>

                  {/* 矢量化图片 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}>
                    {row.vectorizedImage.image ? (
                      <img 
                        src={normalizeAssetPath(row.vectorizedImage.image)} 
                        alt="矢量化图片"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(normalizeAssetPath(row.vectorizedImage.image), "矢量化图片");
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
                        src={normalizeAssetPath(row.elementExtraction.image)} 
                        alt="元素提取"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(normalizeAssetPath(row.elementExtraction.image), "元素提取");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <i className="fas fa-puzzle-piece text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 扎染技法 */}
                  <div className={`${styles.patternCell} ${styles.textCell} ${styles.semanticsCell}`}>
                    <div className="text-black text-sm leading-relaxed text-center">
                      {row.dyeingTechnique.description || '扎染技法描述'}
                    </div>
                  </div>

                  {/* 重新构图 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}>
                    {row.recomposition.image ? (
                      <img 
                        src={normalizeAssetPath(row.recomposition.image)} 
                        alt="重新构图"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(normalizeAssetPath(row.recomposition.image), "重新构图");
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <i className="fas fa-drafting-compass text-xl"></i>
                      </div>
                    )}
                  </div>

                  {/* 创新纹样 */}
                  <div className={`${styles.patternCell} ${styles.imageCell}`}>
                    {row.innovativePattern.image ? (
                      <img 
                        src={normalizeAssetPath(row.innovativePattern.image)} 
                        alt="创新纹样"
                        className="w-full h-full object-cover object-center cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImagePreview(normalizeAssetPath(row.innovativePattern.image), "创新纹样");
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
