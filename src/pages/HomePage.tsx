import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import { SparklesText } from "@/components/magicui/sparkles-text";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { cn } from "@/lib/utils";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);

  return (
    <div className="relative min-h-[80vh] flex flex-col items-center justify-center p-4 overflow-hidden w-full">
      <InteractiveGridPattern
        width={60}
        height={60}
        squares={[40, 40]}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]",
          "inset-y-[-20%] h-[150%] skew-y-6 opacity-60 ml-[-20%]"
        )}
        squaresClassName="hover:fill-[#E3F4FF] dark:hover:fill-blue-900/50 stroke-gray-400/20"
      />
      <div className="relative z-10 text-center space-y-8">
        <SparklesText
          text="StillAlive"
          colors={{ first: "#FFB5B5", second: "#90D5FF" }}
          className="text-5xl font-bold"
        />
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">又活一天！</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
          {isAuthenticated ? (
            <Button
              onClick={() => navigate('/characters')}
              size="lg"
              className="bg-[#E3F4FF] hover:bg-[#d0ecff] text-[#5fa2e9] hover:text-[#5fa2e9] font-medium shadow-[0_0_15px_#d0ecff] hover:shadow-[0_0_20px_#d0ecff] border border-[#d0ecff] transition-all duration-300"
            >
              进入角色管理
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-[#E3F4FF] hover:bg-[#d0ecff] text-[#5fa2e9] hover:text-[#5fa2e9] font-medium shadow-[0_0_15px_#d0ecff] hover:shadow-[0_0_20px_#d0ecff] border border-[#d0ecff] transition-all duration-300"
            >
              立即登录
            </Button>
          )}

          <Button
            onClick={() => navigate('/survivors')}
            size="lg"
            variant="outline"
            className="bg-[#FFE1E1] hover:bg-[#ffd1d1] text-[#dc879b] hover:text-[#dc879b] font-medium shadow-[0_0_15px_#ffd1d1] hover:shadow-[0_0_20px_#ffd1d1] border border-[#ffd1d1] transition-all duration-300"
          >
            探索存活者
          </Button>
        </div>
      </div>
    </div>
  );
}; 