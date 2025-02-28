import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import { SparklesText } from "@/components/magicui/sparkles-text";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <SparklesText 
          text="StillAlive" 
          colors={{ first: "#A07CFE", second: "#FE8FB5" }}
          className="text-5xl font-bold"
        />
        <p className="text-xl text-gray-600 mt-4">开始创建和管理您的角色</p>
        {isAuthenticated ? (
          <Button
            onClick={() => navigate('/characters')}
            size="lg"
            className="mt-6"
          >
            进入角色管理
          </Button>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="mt-6"
          >
            立即登录
          </Button>
        )}
      </div>
    </div>
  );
}; 