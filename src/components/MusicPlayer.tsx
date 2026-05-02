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
  const currentHeightsRef = useRef<number[]>(new Array(lineCount).fill(0));

  // 生成静态波形数据 (闲置状态)
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
    if (!analyser || !containerRef.current) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const lines = containerRef.current.children;
    const currentHeights = currentHeightsRef.current;

    // 取前 60% 的频段（截掉人类听觉不敏感的极高频空白区）
    const usefulBins = Math.floor(analyser.frequencyBinCount * 0.6);
    const step = Math.max(1, Math.floor(usefulBins / lineCount));

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      // 如果正在播放，获取真实数据；否则全为 0，让系统自然重力回落
      if (isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        dataArray.fill(0);
      }

      let totalEnergy = 0;
      const spectrumData = [];

      // 1. 提取音频频段数据（从左到右，从低频到高频）
      for (let i = 0; i < lineCount; i++) {
        let sum = 0;
        let count = 0;
        for (let j = 0; j < step; j++) {
          const index = i * step + j;
          if (index < usefulBins) {
            sum += dataArray[index];
            count++;
          }
        }

        const avg = count > 0 ? sum / count : 0;
        const normalized = avg / 255;

        // 压低平均值（指数2.0），既能保留爆发力，又不会显得低音量时太空虚
        const curved = Math.pow(normalized, 2.0);

        // 增益调整：高频能量弱，予以指数放大补偿视觉
        const boost = 1 + (i / lineCount) * 1.0;
        const value = Math.max(0.02, Math.min(0.95, curved * 0.8 * boost));
        spectrumData.push(value);
      }

      let allAtBottom = true;

      // 2. 应用平滑缓动算法 (Lerp) 并更新 DOM
      for (let i = 0; i < lineCount; i++) {
        const target = spectrumData[i] || 0;

        // 物理感重力下落：调优让动作更像“水波”或“呼吸”，不要太鬼畜
        if (target > currentHeights[i]) {
          currentHeights[i] += (target - currentHeights[i]) * 0.4; // 上升时有少许惯性，更丝滑
        } else {
          currentHeights[i] -= 0.005; // 极小的恒定微重力
          currentHeights[i] *= 0.92;  // 8% 的空气阻力，形成优美的抛物线下落
        }
        currentHeights[i] = Math.max(0.02, currentHeights[i]); // 最低保持 2%

        if (currentHeights[i] > 0.025) {
          allAtBottom = false;
        }

        const h = currentHeights[i] * height;
        totalEnergy += currentHeights[i];

        const line = lines[i] as HTMLDivElement;
        if (line) {
          line.style.height = `${Math.max(2, h)}px`;
          line.style.transform = 'scaleY(1)';
        }
      }

      // 4. 计算全局总能量，施加动态呼吸发光效果
      const avgEnergy = totalEnergy / lineCount;
      if (containerRef.current) {
        const glowRadius = avgEnergy * 20; // 能量越高，辉光越扩散
        containerRef.current.style.filter = `drop-shadow(0 0 ${glowRadius}px rgba(255, 255, 255, 0.7))`;
      }

      // 为了节省性能，如果处于暂停状态且所有音柱都已经跌落到最低点，则停止渲染循环
      if (!isPlaying && allAtBottom) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (containerRef.current) {
        containerRef.current.style.filter = 'none';
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
          line.style.transform = 'scaleY(1)';
        }
      }
      containerRef.current.style.filter = 'none';
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
              transform: scaleY(1.3);
            }
          }
          .waveform-line {
            /* 移除了 height 的 CSS transition，交由 JS requestAnimationFrame 进行精准平滑渲染 */
            transition: transform 0.4s ease, background-color 0.4s ease;
            transform-origin: center; /* 配合 items-center 从中心向上下两端生长 */
            border-radius: 2px;
          }
          .waveform-line.playing-simulated {
            animation: waveform-bounce 1s ease-in-out infinite;
            animation-delay: calc(var(--index) * 0.05s);
          }
        `}
      </style>
      <div
        ref={containerRef}
        className={`flex items-center justify-center gap-[3px] ${className}`}
        style={{
          height: `${height}px`,
          transition: 'filter 0.1s ease-out'
        }}
      >
        {staticData.map((amplitude, index) => (
          <div
            key={index}
            className={`waveform-line ${isPlaying && !analyser ? 'playing-simulated' : ''}`}
            style={{
              width: `${lineWidth}px`,
              // 初始状态使用生成的波形
              height: analyser ? '2px' : (isPlaying ? `${amplitude * height}px` : '2px'),
              backgroundColor: lineColor,
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
  const [resolvedId, setResolvedId] = useState<string | null>(null);

  const onPlayingChangeRef = useRef(onPlayingChange);
  useEffect(() => {
    onPlayingChangeRef.current = onPlayingChange;
  }, [onPlayingChange]);

  // 监听页面可见性，解决移动端切换后台导致的 AudioContext 挂起问题
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().catch(e => console.log('Resume error:', e));
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

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

  // 解析音乐 URL（如果是电台节目 type=3，则需要异步获取真实歌曲 ID）
  useEffect(() => {
    let isMounted = true;
    try {
      const url = new URL(musicUrl.startsWith('//') ? `https:${musicUrl}` : musicUrl);
      const id = url.searchParams.get('id');
      const type = url.searchParams.get('type');

      if (!id) {
        if (isMounted) setResolvedId(null);
        return;
      }

      if (type === '3') {
        fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent('https://music.163.com/api/dj/program/detail?id=' + id)}`)
          .then(res => res.json())
          .then(data => {
            if (isMounted && data?.program?.mainSong?.id) {
              setResolvedId(data.program.mainSong.id.toString());
            } else if (isMounted) {
              setResolvedId(id);
            }
          })
          .catch(err => {
            console.error('Failed to resolve DJ program to song ID:', err);
            if (isMounted) setResolvedId(id);
          });
      } else {
        setResolvedId(id);
      }
    } catch (error) {
      console.error('Failed to parse music URL:', error);
      if (isMounted) setResolvedId(null);
    }
    return () => { isMounted = false; };
  }, [musicUrl]);

  // 初始化或重新加载音频
  useEffect(() => {
    if (!resolvedId) {
      audioRef.current = null;
      return;
    }

    // 使用带有 CORS 响应头的第三方解析 API 替代官方接口
    // 官方的 302 跳转缺少 CORS 头会导致浏览器直接拦截跨域请求
    const audio = new Audio();

        // 尝试跨域以支持 Web Audio API 获取数据
        if (useCORS) {
          audio.crossOrigin = "anonymous";
        }

        // 必须在设置 src 之前设置 crossOrigin，否则浏览器可能会在赋予 CORS 属性前就发出非 CORS 请求，导致错误！
        audio.src = `https://api.injahow.cn/meting/?server=netease&type=url&id=${resolvedId}`;

        audio.loop = true;
        const handleEnded = () => {
          audio.currentTime = 0;
          audio.play().catch(err => console.error('Failed to restart audio:', err));
        };
        
        const handlePause = () => {
          setIsPlaying(false);
          onPlayingChangeRef.current?.(false);
        };
        
        const handlePlay = () => {
          setIsPlaying(true);
          onPlayingChangeRef.current?.(true);
        };

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('play', handlePlay);

        // 监听跨域错误，如果启用CORS导致无法加载，则降级为不使用CORS纯模拟模式
        const handleError = () => {
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
          audio.removeEventListener('pause', handlePause);
          audio.removeEventListener('play', handlePlay);
          audio.removeEventListener('error', handleError);
          audio.pause();
          audio.src = '';
          audioRef.current = null;
          setIsPlaying(false);
          cleanupAudioContext();
        };
  }, [resolvedId, useCORS, cleanupAudioContext]);

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
        // 降低原生 API 的平滑，交由我们自己的 JS Lerp 来做物理平滑，否则会导致数据居高不下
        analyserNode.smoothingTimeConstant = 0.2;

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
        height={80}
        lineWidth={2}
        lineColor="rgba(255, 255, 255, 0.8)"
        isPlaying={isPlaying}
        analyser={analyser}
      />
    </div>
  );
};

export default MusicPlayer; 