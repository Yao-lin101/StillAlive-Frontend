import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { HomePage } from './pages/HomePage';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterDisplayPage } from '@/pages/CharacterDisplayPage';
import authService from '@/lib/auth';
import './App.css'

// 创建认证上下文
export const AuthContext = createContext<boolean>(false);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      console.log('检查认证状态...');
      const { access } = authService.getTokens();
      const newAuthState = !!access;
      console.log('认证状态:', newAuthState ? '已登录' : '未登录');
      setIsAuthenticated(newAuthState);
    };

    // 初始检查
    checkAuth();

    // 监听 storage 变化
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Storage 变化:', e.key);
      if (e.key === 'access_token') {
        checkAuth();
      }
    };

    // 监听自定义认证事件
    const handleAuthChange = () => {
      console.log('收到认证状态变化事件');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return (
    <AuthContext.Provider value={isAuthenticated}>
      <Router>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <main className="flex-1 relative">
            <Routes>
              <Route 
                path="/login" 
                element={
                  !isAuthenticated ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <LoginForm />
                    </div>
                  ) : (
                    <Navigate to="/characters" replace />
                  )
                } 
              />
              <Route 
                path="/register" 
                element={
                  !isAuthenticated ? (
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <RegisterForm />
                    </div>
                  ) : (
                    <Navigate to="/characters" replace />
                  )
                } 
              />
              <Route path="/" element={<HomePage />} />
              <Route
                path="/characters/*"
                element={isAuthenticated ? <CharactersPage /> : <Navigate to="/" replace />}
              />
              <Route path="/d/:code" element={<CharacterDisplayPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
