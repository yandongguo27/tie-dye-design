

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './styles.module.css';

type HelpContentType = 'tutorial' | 'features' | 'faq';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const HelpPage: React.FC = () => {
  const [activeContent, setActiveContent] = useState<HelpContentType>('tutorial');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '帮助指南 - 染纹创合';
    return () => { document.title = originalTitle; };
  }, []);

  const faqItems: FAQItem[] = [
    {
      id: 'faq-1',
      question: '上传的参考纹样有什么要求？',
      answer: '参考纹样最好是清晰、色彩鲜明的图片。建议选择具有明显纹理或图案的图片，这样AI能更好地学习和生成相似风格的纹样。图片大小建议在500x500像素以上，但不要超过10MB。'
    },
    {
      id: 'faq-2',
      question: '生成纹样需要多长时间？',
      answer: '通常情况下，生成3个候选纹样需要3-5秒时间。如果网络环境较差或服务器负载较高，可能需要更长时间。您可以在生成过程中看到进度提示。'
    },
    {
      id: 'faq-3',
      question: '如何提高生成纹样的质量？',
      answer: '提高生成质量的方法包括：选择高质量的参考图片、适当调整参数（如提高融合强度）、选择合适的风格组合。如果对结果不满意，可以尝试调整参数后重新生成。'
    },
    {
      id: 'faq-4',
      question: '生成的纹样可以商用吗？',
      answer: '是的，您使用染纹创合生成的所有纹样都拥有完整的商用权。您可以将这些纹样用于产品设计、商业销售等任何商业用途，无需支付额外费用。'
    },
    {
      id: 'faq-5',
      question: '支持哪些产品类型的应用？',
      answer: '目前支持平面和简单立体的产品类型，包括T恤、围巾、包包、笔记本封面、手机壳、耳环、项链吊坠等。对于复杂的立体产品，建议先拍摄平整的表面图片进行应用。'
    },
    {
      id: 'faq-6',
      question: '历史记录可以保存多久？',
      answer: '您的设计历史记录将永久保存，除非您主动删除。系统会定期备份数据，确保您的设计成果不会丢失。您可以随时查看、下载或删除历史记录。'
    },
    {
      id: 'faq-7',
      question: '可以批量生成纹样吗？',
      answer: '目前每次生成固定为3个候选纹样。如果需要更多选择，可以调整参数后多次生成。我们正在开发批量生成功能，敬请期待。'
    },
    {
      id: 'faq-8',
      question: '如何联系客服获得帮助？',
      answer: '如果您在使用过程中遇到任何问题，可以通过以下方式联系我们：\n\n邮箱：support@ranwenchuanghe.com\n微信：ranwenchuanghe\n工作时间：周一至周五 9:00-18:00'
    }
  ];

  const handleContentChange = (contentType: HelpContentType) => {
    setActiveContent(contentType);
  };

  const handleFAQToggle = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const renderTutorialContent = () => (
    <section className="help-content-section">
      <div className={`${styles.glassCard} rounded-2xl p-8`}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-graduation-cap mr-3 text-white/80"></i>
          入门教程
        </h2>
        
        <div className="space-y-6">
          <div className={styles.tutorialStep}>
            <div className={styles.stepNumber}>1</div>
            <h3 className="text-lg font-semibold text-white mb-3">上传参考纹样</h3>
            <p className="text-white/80 mb-4">在纹样设计页面，您可以上传两张参考纹样图片。这些图片将作为AI生成新纹样的基础。</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>点击"参考纹样 1"或"参考纹样 2"的上传区域</li>
              <li>选择本地图片文件或直接拖拽图片到上传区域</li>
              <li>上传后可以看到图片预览</li>
            </ul>
          </div>
          
          <div className={styles.tutorialStep}>
            <div className={styles.stepNumber}>2</div>
            <h3 className="text-lg font-semibold text-white mb-3">选择扎染风格</h3>
            <p className="text-white/80 mb-4">选择您喜欢的扎染风格，可以多选以混合不同风格特点。</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>传统蓝白晕染 - 经典的蓝白色调扎染效果</li>
              <li>撞色渐变扎染 - 多种颜色渐变融合的现代效果</li>
              <li>水墨风扎染 - 类似水墨画的写意效果</li>
              <li>几何线条扎染 - 规则几何图案的扎染效果</li>
            </ul>
          </div>
          
          <div className={styles.tutorialStep}>
            <div className={styles.stepNumber}>3</div>
            <h3 className="text-lg font-semibold text-white mb-3">调整细节参数</h3>
            <p className="text-white/80 mb-4">通过滑块调整各项参数，精确控制生成效果。</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>晕染浓度 - 控制颜色扩散的程度</li>
              <li>花纹疏密 - 调整纹样的密集程度</li>
              <li>融合强度 - 控制两张参考纹样的融合程度</li>
              <li>色彩饱和度 - 调整生成纹样的色彩鲜艳度</li>
              <li>纹样大小 - 控制生成纹样的整体尺寸</li>
            </ul>
          </div>
          
          <div className={styles.tutorialStep}>
            <div className={styles.stepNumber}>4</div>
            <h3 className="text-lg font-semibold text-white mb-3">生成创新纹样</h3>
            <p className="text-white/80 mb-4">点击"生成创新纹样"按钮，AI将根据您的设置生成独特的扎染纹样。</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>每次生成将产生3个候选纹样</li>
              <li>可以多次生成直到满意为止</li>
              <li>生成时间通常为3-5秒</li>
            </ul>
          </div>
          
          <div className={styles.tutorialStep}>
            <div className={styles.stepNumber}>5</div>
            <h3 className="text-lg font-semibold text-white mb-3">应用到产品</h3>
            <p className="text-white/80 mb-4">将生成的纹样应用到服饰、首饰或文创产品上，查看实际效果。</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>在服饰应用页面上传产品图片</li>
              <li>选择要应用的纹样</li>
              <li>生成并下载产品效果图</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );

  const renderFeaturesContent = () => (
    <section className="help-content-section">
      <div className={`${styles.glassCard} rounded-2xl p-8`}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-cogs mr-3 text-white/80"></i>
          功能详解
        </h2>
        
        <div className="space-y-6">
          <div className={styles.featureCard}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fas fa-cloud-upload-alt mr-3 text-white/70"></i>
              纹样上传功能
            </h3>
            <p className="text-white/80 mb-4">支持多种图片格式上传，包括JPG、PNG、GIF等。上传后自动进行图片优化和预处理，确保最佳的AI生成效果。</p>
            <div className="bg-white/5 rounded-lg p-3">
              <strong className="text-white/90">支持格式：</strong>
              <span className="text-white/70">JPG, PNG, GIF, BMP, TIFF</span>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fas fa-magic mr-3 text-white/70"></i>
              AI纹样生成
            </h3>
            <p className="text-white/80 mb-4">基于深度学习的AI算法，能够理解参考纹样的风格特征，并生成具有创新性的新纹样。支持多种风格融合和参数调整。</p>
            <div className="bg-white/5 rounded-lg p-3">
              <strong className="text-white/90">生成特点：</strong>
              <span className="text-white/70">原创性高、风格可控、细节丰富</span>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fas fa-tshirt mr-3 text-white/70"></i>
              产品应用功能
            </h3>
            <p className="text-white/80 mb-4">智能图像贴合技术，能够将生成的纹样自然地应用到各种产品表面，包括平面和简单立体的产品形态。</p>
            <div className="bg-white/5 rounded-lg p-3">
              <strong className="text-white/90">适用产品：</strong>
              <span className="text-white/70">T恤、围巾、包包、笔记本、耳环、手机壳等</span>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fas fa-history mr-3 text-white/70"></i>
              历史记录管理
            </h3>
            <p className="text-white/80 mb-4">自动保存所有设计历史，支持按时间、风格、参数等条件搜索和筛选。方便回顾和复用之前的设计成果。</p>
            <div className="bg-white/5 rounded-lg p-3">
              <strong className="text-white/90">记录内容：</strong>
              <span className="text-white/70">参考纹样、生成参数、生成结果、应用效果</span>
            </div>
          </div>
          
          <div className={styles.featureCard}>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
              <i className="fas fa-palette mr-3 text-white/70"></i>
              元素组合功能
            </h3>
            <p className="text-white/80 mb-4">支持单个元素的重复排列和组合，通过选择不同的构图方式（对称、放射状、重复排列等）创建复杂的纹样效果。</p>
            <div className="bg-white/5 rounded-lg p-3">
              <strong className="text-white/90">构图方式：</strong>
              <span className="text-white/70">对称、四角排列、中线对称、重复排列、放射状</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderFAQContent = () => (
    <section className="help-content-section">
      <div className={`${styles.glassCard} rounded-2xl p-8`}>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <i className="fas fa-question-circle mr-3 text-white/80"></i>
          常见问题
        </h2>
        
        <div className="space-y-0">
          {faqItems.map((item) => (
            <div key={item.id} className={styles.faqItem}>
              <div 
                className={`${styles.faqQuestion} ${expandedFAQ === item.id ? styles.active : ''}`}
                onClick={() => handleFAQToggle(item.id)}
              >
                <span>{item.question}</span>
                <i className={`fas fa-chevron-down text-white/60 transform transition-transform duration-300 ${expandedFAQ === item.id ? 'rotate-180' : ''}`}></i>
              </div>
              <div className={`${styles.faqAnswer} ${expandedFAQ === item.id ? styles.expanded : ''}`}>
                <p className="text-white/80 leading-relaxed whitespace-pre-line">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContent = () => {
    switch (activeContent) {
      case 'tutorial':
        return renderTutorialContent();
      case 'features':
        return renderFeaturesContent();
      case 'faq':
        return renderFAQContent();
      default:
        return renderTutorialContent();
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
              <Link to="/element-combine" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>元素组合</Link>
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>服饰/首饰应用</Link>
              <Link to="/history" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>历史记录</Link>
              <Link to="/help" className={`${styles.navLink} ${styles.active} text-white py-2`}>帮助指南</Link>
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
              <span className="text-white">帮助指南</span>
            </div>
            <h1 className="text-3xl font-bold text-white">帮助指南</h1>
            <p className="text-white/70 mt-2">了解如何使用染纹创合进行扎染纹样设计</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 内容导航区 */}
            <aside className="lg:col-span-1">
              <div className={`${styles.glassCard} rounded-2xl p-6`}>
                <h3 className="text-lg font-semibold text-white mb-6">帮助内容</h3>
                <nav className="space-y-2">
                  <div 
                    className={`${styles.helpNavItem} ${activeContent === 'tutorial' ? styles.active : ''}`}
                    onClick={() => handleContentChange('tutorial')}
                  >
                    <i className="fas fa-graduation-cap mr-3 text-white/70"></i>
                    <span className="text-white/90">入门教程</span>
                  </div>
                  <div 
                    className={`${styles.helpNavItem} ${activeContent === 'features' ? styles.active : ''}`}
                    onClick={() => handleContentChange('features')}
                  >
                    <i className="fas fa-cogs mr-3 text-white/70"></i>
                    <span className="text-white/90">功能详解</span>
                  </div>
                  <div 
                    className={`${styles.helpNavItem} ${activeContent === 'faq' ? styles.active : ''}`}
                    onClick={() => handleContentChange('faq')}
                  >
                    <i className="fas fa-question-circle mr-3 text-white/70"></i>
                    <span className="text-white/90">常见问题</span>
                  </div>
                </nav>
              </div>
            </aside>

            {/* 内容展示区 */}
            <main className="lg:col-span-3">
              {renderContent()}
            </main>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HelpPage;

