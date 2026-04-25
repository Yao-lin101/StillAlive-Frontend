import React, { useState, useEffect, useRef, useCallback } from 'react';

interface WaveformProps {
  lineCount?: number;
  lineWidth?: number;
  lineColor?: string;
  height?: number;
  className?: string;
  isPlaying?: boolean;
  analyser?: AnalyserNode | null;
}

const Waveform: React.FC<WaveformProps> = ({
  lineCount = 60,
  lineWidth = 2,
  lineColor = 'rgba(255, 255, 255, 0.8)',
  height = 40,
  className = '',
  isPlaying = false,
  analyser = null
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // 生成静态波形数据
  const generateStaticWaveform = useCallback(() => {
    const data = [];
    const frequencies = [0.05, 0.15, 0.3, 0.8];
    const amplitudes = [0.5, 0.3, 0.2, 0.1];
    const phases = frequencies.map(() => Math.random() * Math.PI * 2);

    for (let i = 0; i < lineCount; i++) {
      let value = 0;
      frequencies.forEach((freq, index) => {
        value += Math.sin(i * freq + phases[index]) * amplitudes[index];
      });

      const noise = (Math.random() - 0.5) * 0.5;
      const enhanceExtremes = (x: number) => Math.sign(x) * Math.pow(Math.abs(x), 0.7);
      value = enhanceExtremes(value + noise);

      const normalized = (value + 1.2) / 2.4;
      const spike = Math.random() < 0.1 ? Math.random() * 0.3 : 0;
      const final = Math.max(0.05, Math.min(0.95, normalized + spike));
      data.push(final);
    }

    const smoothedData = [];
    const smoothFactor = 0.15;
    for (let i = 0; i < data.length; i++) {
      const prev = i > 0 ? data[i - 1] : data[i];
      const next = i < data.length - 1 ? data[i + 1] : data[i];
      smoothedData.push(
        data[i] * (1 - smoothFactor) +
        ((prev + next) / 2) * smoothFactor
      );
    }

    return smoothedData;
  }, [lineCount]);

  const [staticData, setStaticData] = useState<number[]>([]);

  useEffect(() => {
    setStaticData(generateStaticWaveform());
  }, [generateStaticWaveform]);

  // 实时渲染来自分析器的数据
  useEffect(() => {
    if (!analyser || !isPlaying || !containerRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const lines = containerRef.current.children;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // 将频谱数据映射到可视化的线条上
      const step = Math.max(1, Math.floor(dataArray.length / lineCount));
      
      for (let i = 0; i < lineCount; i++) {
        let sum = 0;
        let count = 0;
        for (let j = 0; j < step; j++) {
          const index = i * step + j;
          if (index < dataArray.length) {
            sum += dataArray[index];
            count++;
          }
        }
        
        const avg = count > 0 ? sum / count : 0;
        const normalized = avg / 255;
        
        // 增益调整：让频段更具视觉冲击力，稍微增强高频的可视化
        const boost = 1 + (i / lineCount) * 0.5;
        const value = Math.max(0.05, Math.min(0.95, normalized * 1.2 * boost));
        
        const line = lines[i] as HTMLDivElement;
        if (line) {
          line.style.height = `${value * height}px`;
          // 如果使用真实数据驱动，不再需要 CSS 的 bounce 动画，直接缩放为1
          line.style.transform = 'scaleY(1)';
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isPlaying, lineCount, height]);

  // 当处于静态模拟模式且暂停时重置高度
  useEffect(() => {
    if (!analyser && !isPlaying && containerRef.current) {
      const lines = containerRef.current.children;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] as HTMLDivElement;
        if (line) {
          line.style.height = '2px';
        }
      }
    }
  }, [analyser, isPlaying]);

  return (
    <>
      <style>
        {`
          @keyframes waveform-bounce {
            0%, 100% {
              transform: scaleY(0.7);
            }
            50% {
              transform: scaleY(1);
            }
          }
          .waveform-line {
            transition: height 0.1s ease, transform 0.4s ease, background-color 0.4s ease;
            transform-origin: center;
          }
          .waveform-line.playing-simulated {
            animation: waveform-bounce 1s ease-in-out infinite;
            animation-delay: calc(var(--index) * 0.05s);
          }
        `}
      </style>
      <div
        ref={containerRef}
        className={`flex items-center justify-center gap-[2px] ${className}`}
        style={{ height: `${height}px` }}
      >
        {staticData.map((amplitude, index) => (
          <div
            key={index}
            className={`waveform-line ${isPlaying && !analyser ? 'playing-simulated' : ''}`}
            style={{
              width: `${lineWidth}px`,
              // 初始状态：如果使用Analyser则由内部接管，否则使用静态生成的振幅
              height: analyser ? '2px' : (isPlaying ? `${amplitude * height}px` : '2px'),
              backgroundColor: lineColor,
              transform: isPlaying && !analyser ? 'scaleY(0.7)' : 'scaleY(1)',
              '--index': index,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
};

interface MusicPlayerProps {
  musicUrl: string;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({
  musicUrl,
  isPlaying: externalIsPlaying,
  onPlayingChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [useCORS, setUseCORS] = useState(true);

  const cleanupAudioContext = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      // 避免在组件卸载时立即抛出挂起的Promise错误
      audioContextRef.current.close().catch(e => console.log('AudioContext close error:', e));
      audioContextRef.current = null;
    }
    setAnalyser(null);
  }, []);

  // 初始化或重新加载音频
  useEffect(() => {
    try {
      const url = new URL(musicUrl.startsWith('//') ? `https:${musicUrl}` : musicUrl);
      const id = url.searchParams.get('id');

      if (id) {
        // 使用带有 CORS 响应头的第三方解析 API 替代官方接口
        // 官方的 302 跳转缺少 CORS 头会导致浏览器直接拦截跨域请求
        const audio = new Audio();
        
        // 尝试跨域以支持 Web Audio API 获取数据
        if (useCORS) {
          audio.crossOrigin = "anonymous";
        }
        
        // 必须在设置 src 之前设置 crossOrigin，否则浏览器可能会在赋予 CORS 属性前就发出非 CORS 请求，导致错误！
        audio.src = `https://api.injahow.cn/meting/?server=netease&type=url&id=${id}`;
        
        audio.loop = true;
        const handleEnded = () => {
          audio.currentTime = 0;
          audio.play().catch(err => console.error('Failed to restart audio:', err));
        };
        audio.addEventListener('ended', handleEnded);

        // 监听跨域错误，如果启用CORS导致无法加载，则降级为不使用CORS纯模拟模式
        const handleError = (e: Event) => {
          // 忽略由于组件卸载时手动将 src 置空而触发的错误
          if (audio.error && audio.error.message && audio.error.message.includes('Empty src')) {
            return;
          }
          
          if (useCORS) {
            console.error('⚠️ Audio playback failed with CORS enabled. Falling back to simulated visualization.');
            console.error('Audio MediaError details:', audio.error ? {
              code: audio.error.code,
              message: audio.error.message
            } : 'No error details');
            
            setUseCORS(false); // 这将触发组件重新渲染并重新创建一个不带 crossOrigin 的 Audio
            cleanupAudioContext();
          }
        };
        
        audio.addEventListener('error', handleError);

        audioRef.current = audio;
        
        // 保存用于清理的引用
        return () => {
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          audio.pause();
          audio.src = '';
          audioRef.current = null;
          setIsPlaying(false);
          cleanupAudioContext();
        };
      } else {
        audioRef.current = null;
      }
    } catch (error) {
      console.error('Failed to parse music URL:', error);
      audioRef.current = null;
    }

    return () => {
      setIsPlaying(false);
      cleanupAudioContext();
    };
  }, [musicUrl, useCORS, cleanupAudioContext]);

  const initAudioContext = () => {
    if (!audioRef.current || !useCORS) return;
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      try {
        const ctx = new AudioContextClass();
        audioContextRef.current = ctx;
        
        const analyserNode = ctx.createAnalyser();
        analyserNode.fftSize = 256; // 128 个频率数据点
        analyserNode.smoothingTimeConstant = 0.8; // 平滑过渡时间
        
        const sourceNode = ctx.createMediaElementSource(audioRef.current);
        sourceNode.connect(analyserNode);
        analyserNode.connect(ctx.destination);
        
        sourceRef.current = sourceNode;
        setAnalyser(analyserNode);
      } catch (err) {
        console.error('Failed to initialize AudioContext:', err);
        setUseCORS(false); // 如果上下文创建失败也降级
      }
    }
  };

  // 响应外部播放状态变化
  useEffect(() => {
    if (audioRef.current && typeof externalIsPlaying !== 'undefined') {
      if (externalIsPlaying && !isPlaying) {
        // 在实际尝试播放前初始化 AudioContext (需要用户交互后初始化)
        if (useCORS && !audioContextRef.current) {
          initAudioContext();
        }

        audioRef.current.play()
          .then(() => {
            if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
              audioContextRef.current.resume();
            }
            setIsPlaying(true);
            onPlayingChange?.(true);
          })
          .catch(err => {
            console.error('Failed to play audio:', err);
            onPlayingChange?.(false);
          });
      } else if (!externalIsPlaying && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayingChange?.(false);
      }
    }
  }, [externalIsPlaying, isPlaying, onPlayingChange, useCORS]);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
      <Waveform
        lineCount={60}
        height={40}
        lineWidth={2}
        lineColor="rgba(255, 255, 255, 0.8)"
        isPlaying={isPlaying}
        analyser={analyser}
      />
    </div>
  );
};

export default MusicPlayer; 