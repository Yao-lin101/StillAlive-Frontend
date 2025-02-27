import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import { HomePage } from './pages/HomePage';
import { CharactersPage } from './pages/CharactersPage';
import { CharacterDisplayPage } from '@/pages/CharacterDisplayPage';
import './App.css'

function App() {
  // 使用 access_token 检查用户是否已登录
  const isAuthenticated = localStorage.getItem('access_token') !== null;

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route 
            path="/login" 
            element={
              !isAuthenticated ? (
                <div className="min-h-screen flex items-center justify-center p-4">
                  <LoginForm />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              !isAuthenticated ? (
                <div className="min-h-screen flex items-center justify-center p-4">
                  <RegisterForm />
                </div>
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
          <Route path="/" element={<HomePage />} />
          <Route
            path="/characters/*"
            element={isAuthenticated ? <CharactersPage /> : <Navigate to="/login" replace />}
          />
          <Route path="/d/:code" element={<CharacterDisplayPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
