import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AuthContext } from '@/App';
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Particles } from "@/components/ui/particles";
import { TypingAnimation } from "@/components/ui/typing-animation";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = React.useContext(AuthContext);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFE1E1] to-[#E3F4FF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 w-full z-0">
      {/* Decorative background orbs with animation */}
      {/* Decorative background orbs with animation - REMOVED */}

      <Particles
        className="absolute inset-0 z-0 pointer-events-none"
        quantity={100}
        ease={80}
        color="#ffffff"
        refresh
      />

      {/* Main Glass Card */}
      <div className="relative z-10 mx-4 px-4 w-full max-w-3xl">
        <div className="backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-3xl p-12 text-center w-full transform transition-all hover:scale-[1.01] duration-500 overflow-hidden group">

          {/* Card Glint Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl" />

          <div className="space-y-10 relative z-20">
            <div className="space-y-4">
              <SparklesText
                text="StillAlive"
                colors={{ first: "#90D5FF", second: "#FFB5B5" }}
                className="text-6xl md:text-8xl font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.1)]"
              />
              <TypingAnimation
                className="text-xl md:text-2xl text-slate-600 dark:text-white/90 font-medium tracking-wide drop-shadow-sm"
              >
                又活一天！
              </TypingAnimation>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-8">
              {isAuthenticated ? (
                <Button
                  onClick={() => navigate('/characters')}
                  size="lg"
                  className="bg-white/50 hover:bg-white/70 text-slate-800 dark:text-white dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.4)] transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl w-full sm:w-auto"
                >
                  进入角色管理
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  size="lg"
                  className="bg-white/50 hover:bg-white/70 text-slate-800 dark:text-white dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-md border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.4)] transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl w-full sm:w-auto"
                >
                  立即登录
                </Button>
              )}

              <Button
                onClick={() => navigate('/survivors')}
                size="lg"
                variant="ghost"
                className="bg-transparent hover:bg-white/30 text-slate-700 dark:text-white border-2 border-slate-300/40 hover:border-slate-400/60 dark:border-white/30 dark:hover:border-white/60 shadow-[0_0_10px_rgba(0,0,0,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 text-lg px-8 py-6 h-auto rounded-xl w-full sm:w-auto"
              >
                Pokemon Gettodaze！
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};