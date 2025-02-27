import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('access_token') !== null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">欢迎来到 StillAlive</h1>
        <p className="text-xl text-gray-600">开始创建和管理您的角色</p>
        {isAuthenticated ? (
          <Button
            onClick={() => navigate('/characters')}
            size="lg"
          >
            进入角色管理
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            size="lg"
          >
            立即登录
          </Button>
        )}
      </div>
    </div>
  );
}; 