import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import { SparklesText } from "@/components/magicui/sparkles-text";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <SparklesText
          text="StillAlive"
          colors={{ first: "#64748b", second: "#94a3b8" }}
          className="text-5xl font-bold"
        />
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">开始创建和管理您的角色</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate('/characters')}
              size="lg"
              className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              进入角色管理
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              立即登录
            </Button>
          )}

          <Button
            onClick={() => navigate('/survivors')}
            size="lg"
            variant="outline"
            className="border-slate-400 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-900/20 transition-all duration-300"
          >
            🌟 探索存活者
          </Button>
        </div>
      </div>
    </div>
  );
}; 