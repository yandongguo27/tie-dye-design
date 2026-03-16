

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './styles.module.css';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: boolean;
  email?: boolean;
  password?: boolean;
  confirmPassword?: boolean;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态管理
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  // 密码可见性状态
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 表单数据状态
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false
  });
  
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // 错误状态
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});
  const [registerErrors, setRegisterErrors] = useState<FormErrors>({});
  const [loginMessage, setLoginMessage] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  // 设置页面标题
  useEffect(() => {
    const originalTitle = document.title;
    document.title = '登录/注册 - 染纹创合';
    return () => {
      document.title = originalTitle;
    };
  }, []);

  // 验证函数
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Tab切换处理
  const handleTabSwitch = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    // 清空错误信息
    setLoginErrors({});
    setRegisterErrors({});
    setLoginMessage('');
    setRegisterMessage('');
  };

  // 登录表单输入处理
  const handleLoginInputChange = (field: keyof LoginFormData, value: string | boolean) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (typeof value === 'string' && value.trim()) {
      setLoginErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // 注册表单输入处理
  const handleRegisterInputChange = (field: keyof RegisterFormData, value: string) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
    // 清除对应字段的错误
    if (value.trim()) {
      setRegisterErrors(prev => ({ ...prev, [field]: false }));
    }
  };

  // 登录表单提交
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: FormErrors = {};
    
    // 验证用户名/邮箱
    if (!loginForm.username.trim()) {
      errors.username = true;
    } else if (!validateEmail(loginForm.username) && loginForm.username.length < 3) {
      errors.username = true;
    }
    
    // 验证密码
    if (!loginForm.password) {
      errors.password = true;
    }
    
    setLoginErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsLoginSubmitting(true);
      
      // 模拟登录过程
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
  };

  // 注册表单提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: FormErrors = {};
    
    // 验证用户名
    if (registerForm.username.length < 3) {
      errors.username = true;
    }
    
    // 验证邮箱
    if (!validateEmail(registerForm.email)) {
      errors.email = true;
    }
    
    // 验证密码
    if (registerForm.password.length < 6) {
      errors.password = true;
    }
    
    // 验证确认密码
    if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = true;
    }
    
    setRegisterErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      setIsRegisterSubmitting(true);
      
      // 模拟注册过程
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
  };

  // 忘记密码处理
  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateEmail(resetEmail)) {
      setLoginMessage('重置密码链接已发送到您的邮箱');
      setShowForgotPasswordModal(false);
      setResetEmail('');
    } else {
      alert('请输入有效的邮箱地址');
    }
  };

  // 第三方登录处理
  const handleSocialLogin = (provider: 'wechat' | 'qq' | 'weibo') => {
    const messages = {
      wechat: '微信登录功能开发中',
      qq: 'QQ登录功能开发中',
      weibo: '微博登录功能开发中'
    };
    setLoginMessage(messages[provider]);
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
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          {/* 登录/注册表单卡片 */}
          <div className={`${styles.glassCard} rounded-2xl p-8`}>
            {/* 页面标题 */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'login' ? '欢迎回来' : '创建账户'}
              </h1>
              <p className="text-white/70">
                {activeTab === 'login' 
                  ? '登录您的账户，开始创作之旅' 
                  : '加入我们，开启您的创意之旅'
                }
              </p>
            </div>

            {/* Tab切换 */}
            <div className="flex mb-8 bg-white/10 rounded-xl p-1">
              <button 
                onClick={() => handleTabSwitch('login')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
                  activeTab === 'login' ? styles.tabActive : styles.tabInactive
                }`}
              >
                <i className="fas fa-sign-in-alt mr-2"></i>
                登录
              </button>
              <button 
                onClick={() => handleTabSwitch('register')}
                className={`flex-1 py-3 px-4 rounded-lg text-center font-medium transition-all duration-300 ${
                  activeTab === 'register' ? styles.tabActive : styles.tabInactive
                }`}
              >
                <i className="fas fa-user-plus mr-2"></i>
                注册
              </button>
            </div>

            {/* 登录表单 */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                {/* 用户名/邮箱输入 */}
                <div className="space-y-2">
                  <label htmlFor="login-username" className="block text-sm font-medium text-white/90">
                    用户名/邮箱
                  </label>
                  <input 
                    type="text" 
                    id="login-username" 
                    value={loginForm.username}
                    onChange={(e) => handleLoginInputChange('username', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                    placeholder="请输入用户名或邮箱"
                    required
                  />
                  <div className={`${styles.errorMessage} ${loginErrors.username ? 'show' : ''}`}>
                    请输入有效的用户名或邮箱
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <label htmlFor="login-password" className="block text-sm font-medium text-white/90">
                    密码
                  </label>
                  <div className="relative">
                    <input 
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-password" 
                      value={loginForm.password}
                      onChange={(e) => handleLoginInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                      placeholder="请输入密码"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      <i className={`fas ${showLoginPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className={`${styles.errorMessage} ${loginErrors.password ? 'show' : ''}`}>
                    密码不能为空
                  </div>
                </div>

                {/* 记住密码 */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={loginForm.rememberMe}
                      onChange={(e) => handleLoginInputChange('rememberMe', e.target.checked)}
                      className="w-4 h-4 text-white/60 bg-white/20 border-white/30 rounded focus:ring-white/50"
                    />
                    <span className="text-sm text-white/80">记住密码</span>
                  </label>
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    忘记密码？
                  </button>
                </div>

                {/* 登录按钮 */}
                <button 
                  type="submit" 
                  disabled={isLoginSubmitting}
                  className={`w-full py-3 px-4 rounded-lg ${styles.glassButton} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {isLoginSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      登录中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      登录
                    </>
                  )}
                </button>

                {/* 登录状态消息 */}
                {loginMessage && (
                  <div className="text-center">
                    <div className={`${styles.successMessage} show`}>
                      {loginMessage}
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* 注册表单 */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                {/* 用户名输入 */}
                <div className="space-y-2">
                  <label htmlFor="register-username" className="block text-sm font-medium text-white/90">
                    用户名
                  </label>
                  <input 
                    type="text" 
                    id="register-username" 
                    value={registerForm.username}
                    onChange={(e) => handleRegisterInputChange('username', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                    placeholder="请输入用户名"
                    required
                  />
                  <div className={`${styles.errorMessage} ${registerErrors.username ? 'show' : ''}`}>
                    用户名长度至少3个字符
                  </div>
                </div>

                {/* 邮箱输入 */}
                <div className="space-y-2">
                  <label htmlFor="register-email" className="block text-sm font-medium text-white/90">
                    邮箱
                  </label>
                  <input 
                    type="email" 
                    id="register-email" 
                    value={registerForm.email}
                    onChange={(e) => handleRegisterInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                    placeholder="请输入邮箱地址"
                    required
                  />
                  <div className={`${styles.errorMessage} ${registerErrors.email ? 'show' : ''}`}>
                    请输入有效的邮箱地址
                  </div>
                </div>

                {/* 密码输入 */}
                <div className="space-y-2">
                  <label htmlFor="register-password" className="block text-sm font-medium text-white/90">
                    密码
                  </label>
                  <div className="relative">
                    <input 
                      type={showRegisterPassword ? 'text' : 'password'}
                      id="register-password" 
                      value={registerForm.password}
                      onChange={(e) => handleRegisterInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                      placeholder="请输入密码（至少6位）"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      <i className={`fas ${showRegisterPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className={`${styles.errorMessage} ${registerErrors.password ? 'show' : ''}`}>
                    密码长度至少6个字符
                  </div>
                </div>

                {/* 确认密码输入 */}
                <div className="space-y-2">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-white/90">
                    确认密码
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirm-password" 
                      value={registerForm.confirmPassword}
                      onChange={(e) => handleRegisterInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3 pr-12 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                      placeholder="请再次输入密码"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  <div className={`${styles.errorMessage} ${registerErrors.confirmPassword ? 'show' : ''}`}>
                    两次输入的密码不一致
                  </div>
                </div>

                {/* 注册按钮 */}
                <button 
                  type="submit" 
                  disabled={isRegisterSubmitting}
                  className={`w-full py-3 px-4 rounded-lg ${styles.glassButton} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {isRegisterSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      注册中...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus mr-2"></i>
                      注册
                    </>
                  )}
                </button>

                {/* 注册状态消息 */}
                {registerMessage && (
                  <div className="text-center">
                    <div className={`${styles.successMessage} show`}>
                      {registerMessage}
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* 分割线 */}
            <div className="my-8 flex items-center">
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">或</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </div>

            {/* 第三方登录 */}
            <div className="space-y-4">
              <h3 className="text-center text-white/80 text-sm mb-4">使用第三方账号登录</h3>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => handleSocialLogin('wechat')}
                  className={`${styles.socialButton} p-4 rounded-xl text-center`}
                >
                  <i className="fab fa-weixin text-2xl text-green-400 mb-2"></i>
                  <div className="text-xs text-white/70">微信</div>
                </button>
                <button 
                  onClick={() => handleSocialLogin('qq')}
                  className={`${styles.socialButton} p-4 rounded-xl text-center`}
                >
                  <i className="fab fa-qq text-2xl text-blue-400 mb-2"></i>
                  <div className="text-xs text-white/70">QQ</div>
                </button>
                <button 
                  onClick={() => handleSocialLogin('weibo')}
                  className={`${styles.socialButton} p-4 rounded-xl text-center`}
                >
                  <i className="fab fa-weibo text-2xl text-red-400 mb-2"></i>
                  <div className="text-xs text-white/70">微博</div>
                </button>
              </div>
            </div>
          </div>

          {/* 底部链接 */}
          <div className="text-center mt-8 space-y-2">
            <p className="text-white/60 text-sm">
              登录即表示您同意我们的
              <button className="hover:text-white transition-colors mx-1">服务条款</button>
              和
              <button className="hover:text-white transition-colors mx-1">隐私政策</button>
            </p>
          </div>
        </div>
      </main>

      {/* 忘记密码模态框 */}
      {showForgotPasswordModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowForgotPasswordModal(false);
            }
          }}
        >
          <div className={`${styles.glassCard} rounded-2xl p-6 m-4 max-w-md w-full`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">重置密码</h3>
              <button 
                onClick={() => setShowForgotPasswordModal(false)}
                className="text-white/60 hover:text-white"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-white/90 mb-2">
                  邮箱地址
                </label>
                <input 
                  type="email" 
                  id="reset-email" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg ${styles.glassInput} text-white placeholder-white/50`}
                  placeholder="请输入您的邮箱地址" 
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowForgotPasswordModal(false)}
                  className={`flex-1 py-3 px-4 rounded-lg ${styles.glassButton} text-white font-medium`}
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 px-4 rounded-lg bg-accent text-white font-medium"
                >
                  发送重置链接
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

