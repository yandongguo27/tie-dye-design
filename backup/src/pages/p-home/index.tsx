

import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    const originalTitle = document.title;
    document.title = '染纹创合 - 首页';
    return () => { document.title = originalTitle; };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleStartDesignClick = () => {
    navigate('/pattern-vectorize');
  };

  const handleGetStartedClick = () => {
    navigate('/pattern-vectorize');
  };

  const handleWatchDemoClick = () => {
    console.log('播放演示视频');
    // 这里可以添加视频播放逻辑
  };

  const handleLearnMoreClick = () => {
    navigate('/help');
  };

  const handleFeatureButtonClick = (index: number) => {
    switch(index) {
      case 0:
        navigate('/pattern-design');
        break;
      case 1:
        navigate('/element-combine');
        break;
      case 2:
        navigate('/application');
        break;
      default:
        console.log('未知功能');
    }
  };

  const handleCaseLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('打开案例详情');
    // 这里可以添加案例详情页面跳转
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
              <Link to="/home" className={`${styles.navLink} ${styles.active} text-white py-2`}>首页</Link>
              <Link to="/pattern-vectorize" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>素材处理</Link>
              <Link to="/pattern-design" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>纹样设计</Link>
              <Link to="/element-combine" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>元素组合</Link>
              <Link to="/application" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>文创应用</Link>
              <Link to="/pattern-library" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>纹样库</Link>
              <Link to="/history" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>历史记录</Link>
              <Link to="/help" className={`${styles.navLink} text-white/80 hover:text-white py-2`}>帮助指南</Link>
            </div>
            
            {/* 用户头像/登录 */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLoginClick}
                className={`${styles.glassButton} px-4 py-2 rounded-lg text-white text-sm font-medium`}
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                登录/注册
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="pt-20 min-h-screen">
        {/* 英雄区域 */}
        <section className={`relative ${styles.patternBg}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className={`${styles.heroGradient} rounded-3xl p-12 text-center`}>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                染纹创合
                <span className="block text-3xl md:text-4xl mt-2 text-white/80 font-normal">AI赋能的扎染纹样创新设计平台</span>
              </h1>
              <p className="text-xl text-white/70 mb-8 max-w-3xl mx-auto leading-relaxed">
                专为手工艺从业者打造，通过先进AI技术激发无限创意，让传统扎染艺术与现代科技完美融合，创造独特的纹样设计
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleStartDesignClick}
                  className={`${styles.ctaButton} px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg`}
                >
                  <i className="fas fa-magic mr-3"></i>
                  开始设计
                </button>
                <button 
                  onClick={handleWatchDemoClick}
                  className={`${styles.glassButton} px-6 py-4 rounded-xl text-white font-medium`}
                >
                  <i className="fas fa-play mr-3"></i>
                  观看演示
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 核心功能区域 */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">核心功能</h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">全方位的扎染纹样设计解决方案，从灵感获取到成品预览</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 纹样上传与参数调整 */}
              <div className={`${styles.featureCard} rounded-2xl p-8 text-center`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-cloud-upload-alt text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">智能纹样生成</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  上传参考纹样，通过AI算法融合创新，支持多种扎染风格选择和精细参数调整
                </p>
                <ul className="text-left space-y-2 text-white/60 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    双参考纹样上传
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    多种扎染风格选择
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    精细参数调节
                  </li>
                </ul>
                <button 
                  onClick={() => handleFeatureButtonClick(0)}
                  className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                >
                  立即体验
                </button>
              </div>
              
              {/* 元素组合设计 */}
              <div className={`${styles.featureCard} rounded-2xl p-8 text-center`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-cubes text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">元素组合设计</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  上传单个元素，选择多种构图方式进行创意组合，打造独特的重复纹样效果
                </p>
                <ul className="text-left space-y-2 text-white/60 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    元素上传与编辑
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    多种构图模式
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    参数化调整
                  </li>
                </ul>
                <button 
                  onClick={() => handleFeatureButtonClick(1)}
                  className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                >
                  开始组合
                </button>
              </div>
              
              {/* 产品应用预览 */}
              <div className={`${styles.featureCard} rounded-2xl p-8 text-center`}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-tshirt text-3xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">产品应用预览</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  将设计好的纹样应用到服饰、首饰等产品上，实时预览最终效果并下载高清效果图
                </p>
                <ul className="text-left space-y-2 text-white/60 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    服饰首饰图片上传
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    智能纹样贴合
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white/80 mr-2"></i>
                    高清效果图下载
                  </li>
                </ul>
                <button 
                  onClick={() => handleFeatureButtonClick(2)}
                  className={`${styles.glassButton} px-6 py-2 rounded-lg text-white font-medium`}
                >
                  查看效果
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 数据统计区域 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${styles.glassCard} rounded-3xl p-12`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div className="stat-item">
                  <div className={`${styles.statNumber} rounded-xl p-4 mb-4`}>
                    <div className="text-4xl font-bold text-white">10,000+</div>
                  </div>
                  <div className="text-white/70">设计作品</div>
                </div>
                <div className="stat-item">
                  <div className={`${styles.statNumber} rounded-xl p-4 mb-4`}>
                    <div className="text-4xl font-bold text-white">500+</div>
                  </div>
                  <div className="text-white/70">活跃用户</div>
                </div>
                <div className="stat-item">
                  <div className={`${styles.statNumber} rounded-xl p-4 mb-4`}>
                    <div className="text-4xl font-bold text-white">95%</div>
                  </div>
                  <div className="text-white/70">用户满意度</div>
                </div>
                <div className="stat-item">
                  <div className={`${styles.statNumber} rounded-xl p-4 mb-4`}>
                    <div className="text-4xl font-bold text-white">24/7</div>
                  </div>
                  <div className="text-white/70">技术支持</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 使用案例展示 */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">使用案例</h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">看看其他设计师如何使用染纹创合创造精彩作品</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 案例1 */}
              <div className={`${styles.featureCard} rounded-2xl overflow-hidden`}>
                <div className="aspect-square relative">
                  <img src="https://s.coze.cn/image/9uWfLv8qfHQ/" alt="传统蓝白扎染T恤设计" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">传统蓝白扎染T恤</h3>
                  <p className="text-white/70 mb-4">结合传统蓝白扎染风格，设计出简约而富有韵味的T恤纹样</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">张设计师</span>
                    <button onClick={handleCaseLinkClick} className="text-white/60 hover:text-white">
                      <i className="fas fa-external-link-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 案例2 */}
              <div className={`${styles.featureCard} rounded-2xl overflow-hidden`}>
                <div className="aspect-square relative">
                  <img src="https://s.coze.cn/image/ANAJakY9kvc/" alt="水墨风格围巾设计" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">水墨风格围巾</h3>
                  <p className="text-white/70 mb-4">运用水墨风扎染效果，创造出如诗如画的围巾纹样设计</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">李艺术家</span>
                    <button onClick={handleCaseLinkClick} className="text-white/60 hover:text-white">
                      <i className="fas fa-external-link-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* 案例3 */}
              <div className={`${styles.featureCard} rounded-2xl overflow-hidden`}>
                <div className="aspect-square relative">
                  <img src="https://s.coze.cn/image/LeSTn9yQQCY/" alt="几何线条首饰设计" className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">几何线条首饰</h3>
                  <p className="text-white/70 mb-4">现代几何线条与扎染艺术结合，打造独特的首饰纹样</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">王工匠</span>
                    <button onClick={handleCaseLinkClick} className="text-white/60 hover:text-white">
                      <i className="fas fa-external-link-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 快速开始区域 */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`${styles.heroGradient} rounded-3xl p-12 text-center`}>
              <h2 className="text-4xl font-bold text-white mb-6">准备开始您的创作之旅？</h2>
              <p className="text-xl text-white/70 mb-8">
                立即注册账号，免费体验AI扎染纹样设计的魅力，让创意无限延伸
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  onClick={handleGetStartedClick}
                  className={`${styles.ctaButton} px-8 py-4 rounded-xl text-white font-semibold text-lg shadow-lg`}
                >
                  <i className="fas fa-rocket mr-3"></i>
                  立即开始
                </button>
                <button 
                  onClick={handleLearnMoreClick}
                  className={`${styles.glassButton} px-6 py-4 rounded-xl text-white font-medium`}
                >
                  <i className="fas fa-book mr-3"></i>
                  了解更多
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 底部区域 */}
      <footer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* 公司信息 */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center">
                  <i className="fas fa-palette text-white text-lg"></i>
                </div>
                <span className="text-xl font-bold text-white">染纹创合</span>
              </div>
              <p className="text-white/70 mb-4 leading-relaxed">
                专业的AI扎染纹样设计平台，致力于为手工艺从业者提供最优质的设计工具和服务
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <i className="fab fa-weixin"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <i className="fab fa-weibo"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-gradient-to-br from-white/20 to-white/10 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                  <i className="fab fa-qq"></i>
                </a>
              </div>
            </div>
            
            {/* 产品功能 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">产品功能</h3>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/pattern-design" className="hover:text-white transition-colors">纹样组合</Link></li>
                <li><Link to="/element-combine" className="hover:text-white transition-colors">元素组合</Link></li>
                <li><Link to="/application" className="hover:text-white transition-colors">产品应用</Link></li>
                <li><Link to="/history" className="hover:text-white transition-colors">历史记录</Link></li>
              </ul>
            </div>
            
            {/* 帮助支持 */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">帮助支持</h3>
              <ul className="space-y-2 text-white/70">
                <li><Link to="/help" className="hover:text-white transition-colors">使用教程</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">常见问题</a></li>
                <li><a href="#" className="hover:text-white transition-colors">联系我们</a></li>
                <li><a href="#" className="hover:text-white transition-colors">隐私政策</a></li>
              </ul>
            </div>
          </div>
          
          {/* 版权信息 */}
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60">
              © 2024 染纹创合. 保留所有权利. | 
              <a href="#" className="hover:text-white transition-colors">隐私政策</a> | 
              <a href="#" className="hover:text-white transition-colors">服务条款</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

