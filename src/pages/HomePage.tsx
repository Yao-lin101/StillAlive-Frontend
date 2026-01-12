import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import { SparklesText } from "@/components/magicui/sparkles-text";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <SparklesText
          text="StillAlive"
          colors={{ first: "#A07CFE", second: "#FE8FB5" }}
          className="text-5xl font-bold"
        />
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">开始创建和管理您的角色</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate('/characters')}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              进入角色管理
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              立即登录
            </Button>
          )}

          <Button
            onClick={() => navigate('/survivors')}
            size="lg"
            variant="outline"
            className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 transition-all duration-300"
          >
            🌟 探索存活者
          </Button>
        </div>
      </div>
    </div>
  );
}; 