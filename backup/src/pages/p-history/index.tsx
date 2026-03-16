

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';
import { HistoryRecord, HistoryDetailData } from './types';

const HistoryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [currentDetailData, setCurrentDetailData] = useState<HistoryDetailData | null>(null);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '历史记录 - 染纹创合';
    return () => { document.title = originalTitle; };
  }, []);

  // 从 localStorage 读取历史记录数据
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);

  // 加载历史记录
  useEffect(() => {
    loadHistoryRecords();
  }, []);

  const loadHistoryRecords = () => {
    try {
      const historyKey = 'pattern_history';
      const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // 将保存的数据转换为HistoryRecord格式
      const records: HistoryRecord[] = savedHistory.map((item: any) => {
        if (item.type === 'application') {
          return {
            id: item.id,
            name: item.name,
            refImages: [item.productImage, item.patternImage],
            generatedImage: item.resultImage,
            applicationImage: item.resultImage,
            time: item.time,
            type: 'application'
          };
        } else if (item.type === 'combination') {
          return {
            id: item.id,
            name: item.name,
            refImages: item.elements || [],
            generatedImage: item.resultImage,
            applicationImage: item.resultImage,
            time: item.time,
            type: 'combination'
          };
        } else {
          return {
            id: item.id,
            name: item.name,
            refImages: item.refImages || [],
            generatedImage: item.generatedImage || item.resultImage,
            applicationImage: item.applicationImage || item.resultImage,
            time: item.time,
            type: item.type || 'pattern'
          };
        }
      });
      
      setHistoryRecords(records);
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setHistoryRecords([]);
    }
  };

  // 模拟详情数据
  const detailDataMap: Record<string, HistoryDetailData> = {
    'history-001': {
      name: '传统蓝白晕染设计',
      time: '2024-01-15 14:30',
      type: '纹样设计',
      ref1: 'https://s.coze.cn/image/nNTzvuK45vA/',
      ref2: 'https://s.coze.cn/image/T35yKRjsQ-U/',
      generated: 'https://s.coze.cn/image/gs1QuCo53Jg/',
      application: 'https://s.coze.cn/image/dBh5Uk5d78E/'
    },
    'history-002': {
      name: '水墨风扎染创新',
      time: '2024-01-14 09:15',
      type: '纹样设计',
      ref1: 'https://s.coze.cn/image/L1lxUJVKugo/',
      ref2: 'https://s.coze.cn/image/5dPyXd3Ov4w/',
      generated: 'https://s.coze.cn/image/aA1I1iyL0gQ/',
      application: 'https://s.coze.cn/image/B8EX5oSVtk8/'
    },
    'history-003': {
      name: '几何线条扎染实验',
      time: '2024-01-13 16:45',
      type: '纹样设计',
      ref1: 'https://s.coze.cn/image/_UAx87uFh74/',
      ref2: 'https://s.coze.cn/image/7DV5lzMPvvc/',
      generated: 'https://s.coze.cn/image/hyl9l9GPmKs/',
      application: 'https://s.coze.cn/image/JM3UGBM3hwg/'
    },
    'history-004': {
      name: '撞色渐变扎染创作',
      time: '2024-01-12 11:20',
      type: '纹样设计',
      ref1: 'https://s.coze.cn/image/N4xfIevqjo4/',
      ref2: 'https://s.coze.cn/image/UGG4ZtmYPlM/',
      generated: 'https://s.coze.cn/image/oZ0trV-p8PQ/',
      application: 'https://s.coze.cn/image/UAXLdh9k8mQ/'
    },
    'history-005': {
      name: '现代艺术风格扎染',
      time: '2024-01-11 13:50',
      type: '纹样设计',
      ref1: 'https://s.coze.cn/image/ot5gJt1XwBU/',
      ref2: 'https://s.coze.cn/image/zdiSYLHXmMo/',
      generated: 'https://s.coze.cn/image/8e-wKCNfdNo/',
      application: 'https://s.coze.cn/image/RUMkfXm5eVQ/'
    }
  };

  // 筛选逻辑
  const filteredRecords = historyRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTime = timeFilter === 'all'; // 简化处理，实际项目中需要根据时间筛选
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesTime && matchesType;
  });

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredRecords.map(record => record.id));
    } else {
      setSelectedRows([]);
    }
  };

  // 行选择
  const handleRowSelect = (recordId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, recordId]);
    } else {
      setSelectedRows(prev => prev.filter(id => id !== recordId));
    }
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) return;
    
    if (confirm(`确定要删除选中的 ${selectedRows.length} 条记录吗？`)) {
      try {
        const historyKey = 'pattern_history';
        const savedHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
        
        // 过滤掉选中的记录
        const updatedHistory = savedHistory.filter((item: any) => !selectedRows.includes(item.id));
        
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        
        // 重新加载历史记录
        loadHistoryRecords();
        setSelectedRows([]);
      } catch (error) {
        console.error('删除记录失败:', error);
        alert('删除失败，请重试');
      }
    }
  };

  // 清除筛选
  const handleClearFilters = () => {
    setSearchTerm('');
    setTimeFilter('all');
    setTypeFilter('all');
  };

  // 显示详情
  const handleShowDetail = (recordId: string) => {
    const data = detailDataMap[recordId];
    if (data) {
      setCurrentDetailData(data);
      setIsDetailDrawerOpen(true);
    }
  };

  // 关闭详情抽屉
  const handleCloseDrawer = () => {
    setIsDetailDrawerOpen(false);
    setCurrentDetailData(null);
  };

  // 删除单条记录
  const handleDeleteRecord = (recordId: string) => {
    if (confirm('确定要删除这条历史记录吗？')) {
      // 在实际项目中，这里应该调用API删除记录
      console.log(`删除历史记录 ${recordId}`);
      setSelectedRows(prev => prev.filter(id => id !== recordId));
    }
  };

  // 下载功能
  const handleDownload = (recordId: string) => {
    console.log(`下载历史记录 ${recordId}`);
    // 这里应该实现实际的下载逻辑
  };

  // 详情页下载
  const handleDetailDownload = () => {
    console.log('下载生成纹样');
    // 这里应该实现实际的下载逻辑
  };

  const handleApplicationDownload = () => {
    console.log('下载应用效果图');
    // 这里应该实现实际的下载逻辑
  };

  // 分页处理（简化）
  const handlePageChange = (page: number) => {
    console.log(`跳转到第 ${page} 页`);
    // 这里应该实现实际的分页逻辑
  };

  const isAllSelected = filteredRecords.length > 0 && selectedRows.length === filteredRecords.length;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < filteredRecords.length;

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
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>服饰/首饰应用</Link>
              <Link to="/history" className={`${styles.navLink} ${styles.active} text-white py-2`}>历史记录</Link>
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
              <span className="text-white">历史记录</span>
            </div>
            <h1 className="text-3xl font-bold text-white">历史记录</h1>
            <p className="text-white/70 mt-2">查看和管理您的设计历史记录</p>
          </header>

          {/* 工具栏区域 */}
          <section className={`${styles.glassCard} rounded-2xl p-6 mb-8`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* 搜索和筛选 */}
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                  <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60"></i>
                  <input 
                    type="text" 
                    placeholder="搜索设计名称..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${styles.searchInput} w-full pl-10 pr-4 py-2 rounded-lg text-white placeholder-white/60`}
                  />
                </div>
                
                {/* 时间范围筛选 */}
                <select 
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className={`${styles.filterSelect} px-4 py-2 rounded-lg text-white`}
                >
                  <option value="all">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">最近一周</option>
                  <option value="month">最近一个月</option>
                  <option value="quarter">最近三个月</option>
                </select>
                
                {/* 设计类型筛选 */}
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className={`${styles.filterSelect} px-4 py-2 rounded-lg text-white`}
                >
                  <option value="all">全部类型</option>
                  <option value="pattern">纹样设计</option>
                  <option value="element">元素组合</option>
                  <option value="application">产品应用</option>
                </select>
              </div>
              
              {/* 批量操作 */}
              <div className="flex items-center space-x-3">
                <button 
                  onClick={handleBatchDelete}
                  disabled={selectedRows.length === 0}
                  className={`${styles.glassButton} px-4 py-2 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <i className="fas fa-trash-alt mr-2"></i>
                  {selectedRows.length > 0 ? `批量删除 (${selectedRows.length})` : '批量删除'}
                </button>
                <button 
                  onClick={handleClearFilters}
                  className={`${styles.glassButton} px-4 py-2 rounded-lg text-white text-sm`}
                >
                  <i className="fas fa-undo mr-2"></i>
                  清除筛选
                </button>
                <button 
                  onClick={loadHistoryRecords}
                  className={`${styles.glassButton} px-4 py-2 rounded-lg text-white text-sm`}
                  title="刷新历史记录"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  刷新
                </button>
              </div>
            </div>
          </section>

          {/* 历史记录表格 */}
          <section className={`${styles.glassCard} rounded-2xl overflow-hidden mb-8`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      <input 
                        type="checkbox" 
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="mr-2"
                      />
                      设计名称
                      <i className="fas fa-sort ml-2 text-white/60 cursor-pointer"></i>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">参考纹样</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">生成纹样</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">应用效果图</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">
                      生成时间
                      <i className="fas fa-sort ml-2 text-white/60 cursor-pointer"></i>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white/90">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className={styles.tableRow}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedRows.includes(record.id)}
                          onChange={(e) => handleRowSelect(record.id, e.target.checked)}
                          className="mr-2"
                        />
                        <button 
                          onClick={() => handleShowDetail(record.id)}
                          className="text-white hover:text-white/80 font-medium text-left"
                        >
                          {record.name}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {record.refImages.map((image, index) => (
                            <img 
                              key={index}
                              src={image} 
                              alt={`参考纹样${index + 1}`} 
                              className="w-12 h-12 object-cover rounded border border-white/20" 
                            />
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <img 
                          src={record.generatedImage} 
                          alt="生成纹样" 
                          className="w-12 h-12 object-cover rounded border border-white/20" 
                        />
                      </td>
                      <td className="px-6 py-4">
                        <img 
                          src={record.applicationImage} 
                          alt="应用效果图" 
                          className="w-12 h-12 object-cover rounded border border-white/20" 
                        />
                      </td>
                      <td className="px-6 py-4 text-white/80 text-sm">{record.time}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleShowDetail(record.id)}
                            className={`${styles.actionButton} ${styles.glassButton} px-3 py-1 rounded text-white text-xs`}
                          >
                            <i className="fas fa-eye mr-1"></i>详情
                          </button>
                          <button 
                            onClick={() => handleDownload(record.id)}
                            className={`${styles.actionButton} ${styles.glassButton} px-3 py-1 rounded text-white text-xs`}
                          >
                            <i className="fas fa-download mr-1"></i>下载
                          </button>
                          <button 
                            onClick={() => handleDeleteRecord(record.id)}
                            className={`${styles.actionButton} ${styles.glassButton} px-3 py-1 rounded text-white text-xs`}
                          >
                            <i className="fas fa-trash mr-1"></i>删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 分页区域 */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="text-sm text-white/70">
              显示第 <span className="font-medium text-white">1</span> 到 <span className="font-medium text-white">5</span> 条，共 <span className="font-medium text-white">23</span> 条记录
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                disabled={true}
                className={`${styles.glassButton} px-3 py-2 rounded-lg text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="flex space-x-1">
                <button 
                  onClick={() => handlePageChange(1)}
                  className={`${styles.glassButton} px-3 py-2 rounded-lg text-white text-sm bg-accent border-accent`}
                >
                  1
                </button>
                <button 
                  onClick={() => handlePageChange(2)}
                  className={`${styles.glassButton} px-3 py-2 rounded-lg text-white text-sm`}
                >
                  2
                </button>
                <button 
                  onClick={() => handlePageChange(3)}
                  className={`${styles.glassButton} px-3 py-2 rounded-lg text-white text-sm`}
                >
                  3
                </button>
                <span className="px-3 py-2 text-white/60">...</span>
                <button 
                  onClick={() => handlePageChange(5)}
                  className={`${styles.glassButton} px-3 py-2 rounded-lg text-white text-sm`}
                >
                  5
                </button>
              </div>
              
              <button 
                onClick={() => handlePageChange(2)}
                className={`${styles.glassButton} px-3 py-2 rounded-lg text-white text-sm`}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* 历史记录详情抽屉 */}
      <div className={`${styles.detailDrawer} ${isDetailDrawerOpen ? styles.open : ''} fixed top-0 right-0 h-full w-full max-w-2xl z-50 ${styles.glassCard}`}>
        <div className="flex flex-col h-full">
          {/* 抽屉头部 */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h3 className="text-xl font-semibold text-white">设计详情</h3>
            <button 
              onClick={handleCloseDrawer}
              className={`${styles.glassButton} w-10 h-10 rounded-lg text-white flex items-center justify-center`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          {/* 抽屉内容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentDetailData && (
              <div>
                {/* 设计基本信息 */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">设计信息</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/80">设计名称：</span>
                      <span className="text-white font-medium">{currentDetailData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">生成时间：</span>
                      <span className="text-white">{currentDetailData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/80">设计类型：</span>
                      <span className="text-white">{currentDetailData.type}</span>
                    </div>
                  </div>
                </div>
                
                {/* 参考纹样 */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">参考纹样</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <img 
                        src={currentDetailData.ref1} 
                        alt="参考纹样1" 
                        className="w-full h-32 object-cover rounded-lg border border-white/20 mb-2" 
                      />
                      <p className="text-white/70 text-sm">参考纹样 1</p>
                    </div>
                    <div className="text-center">
                      <img 
                        src={currentDetailData.ref2} 
                        alt="参考纹样2" 
                        className="w-full h-32 object-cover rounded-lg border border-white/20 mb-2" 
                      />
                      <p className="text-white/70 text-sm">参考纹样 2</p>
                    </div>
                  </div>
                </div>
                
                {/* 生成参数 */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">生成参数</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/80">风格选择：</span>
                        <span className="text-white text-sm">传统蓝白晕染</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">晕染浓度：</span>
                        <span className="text-white text-sm">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">花纹疏密：</span>
                        <span className="text-white text-sm">40%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/80">融合强度：</span>
                        <span className="text-white text-sm">80%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">色彩饱和度：</span>
                        <span className="text-white text-sm">70%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">纹样大小：</span>
                        <span className="text-white text-sm">50%</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 生成纹样 */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">生成纹样</h4>
                  <div className="text-center">
                    <img 
                      src={currentDetailData.generated} 
                      alt="生成纹样" 
                      className="w-full max-w-md mx-auto h-48 object-cover rounded-lg border border-white/20 mb-4" 
                    />
                    <button 
                      onClick={handleDetailDownload}
                      className={`${styles.glassButton} px-6 py-2 rounded-lg text-white`}
                    >
                      <i className="fas fa-download mr-2"></i>下载生成纹样
                    </button>
                  </div>
                </div>
                
                {/* 应用效果图 */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-white mb-3">应用效果图</h4>
                  <div className="text-center">
                    <img 
                      src={currentDetailData.application} 
                      alt="应用效果图" 
                      className="w-full max-w-md mx-auto h-48 object-cover rounded-lg border border-white/20 mb-4" 
                    />
                    <button 
                      onClick={handleApplicationDownload}
                      className={`${styles.glassButton} px-6 py-2 rounded-lg text-white`}
                    >
                      <i className="fas fa-download mr-2"></i>下载效果图
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 遮罩层 */}
      <div 
        className={`${styles.overlay} ${isDetailDrawerOpen ? styles.open : ''} fixed inset-0 bg-black/50 z-40`}
        onClick={handleCloseDrawer}
      ></div>
    </div>
  );
};

export default HistoryPage;

