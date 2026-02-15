import React, { useState, useEffect, useRef } from 'react';

interface WaveformProps {
  lineCount?: number;
  lineWidth?: number;
  lineColor?: string;
  height?: number;
  className?: string;
  isPlaying?: boolean;
}

const Waveform: React.FC<WaveformProps> = ({
  lineCount = 60,
  lineWidth = 2,
  lineColor = 'rgba(255, 255, 255, 0.8)',
  height = 40,
  className = '',
  isPlaying = false
}) => {
  // 生成静态波形数据
  const generateStaticWaveform = () => {
    const data = [];
    // 生成多个频率的基础波形，增加频率范围
    const frequencies = [0.05, 0.15, 0.3, 0.8];
    const amplitudes = [0.5, 0.3, 0.2, 0.1];  // 增加基础振幅
    const phases = frequencies.map(() => Math.random() * Math.PI * 2);

    for (let i = 0; i < lineCount; i++) {
      // 叠加多个正弦波
      let value = 0;
      frequencies.forEach((freq, index) => {
        value += Math.sin(i * freq + phases[index]) * amplitudes[index];
      });

      // 增加随机噪声的强度
      const noise = (Math.random() - 0.5) * 0.5;

      // 使用指数函数增强极值
      const enhanceExtremes = (x: number) => Math.sign(x) * Math.pow(Math.abs(x), 0.7);
      value = enhanceExtremes(value + noise);

      // 规范化到更大的范围
      const normalized = (value + 1.2) / 2.4;  // 将 [-1.2, 1.2] 映射到 [0, 1]

      // 增加随机峰值
      const spike = Math.random() < 0.1 ? Math.random() * 0.3 : 0;  // 10%概率出现峰值

      // 确保值在0.05到0.95之间，增加对比度
      const final = Math.max(0.05, Math.min(0.95, normalized + spike));
      data.push(final);
    }

    // 平滑处理，减小平滑因子使波形更尖锐
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
  };

  const waveformData = generateStaticWaveform();

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
            transition: all 0.4s ease;
            transform-origin: center;
          }
          .waveform-line.playing {
            animation: waveform-bounce 1s ease-in-out infinite;
            animation-delay: calc(var(--index) * 0.05s);
          }
          .waveform-line:not(.playing) {
            height: 2px !important;
          }
        `}
      </style>
      <div
        className={`flex items-center justify-center gap-[2px] ${className}`}
        style={{ height: `${height}px` }}
      >
        {waveformData.map((amplitude, index) => (
          <div
            key={index}
            className={`waveform-line ${isPlaying ? 'playing' : ''}`}
            style={{
              width: `${lineWidth}px`,
              height: `${amplitude * height}px`,
              backgroundColor: lineColor,
              transform: isPlaying ? 'scaleY(0.7)' : 'scaleY(1)',
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

  // 从网易云音乐URL中提取歌曲ID并设置音频源
  useEffect(() => {
    try {
      // 尝试从URL中提取歌曲ID
      const url = new URL(musicUrl.startsWith('//') ? `https:${musicUrl}` : musicUrl);
      const id = url.searchParams.get('id');

      if (id) {
        // 创建音频元素
        const audio = new Audio(`https://music.163.com/song/media/outer/url?id=${id}.mp3`);
        // 设置循环播放
        audio.loop = true;
        audio.addEventListener('ended', () => {
          audio.currentTime = 0;
          audio.play().catch(err => console.error('Failed to restart audio:', err));
        });
        audioRef.current = audio;
      } else {
        audioRef.current = null;
      }
    } catch (error) {
      console.error('Failed to parse music URL:', error);
      audioRef.current = null;
    }

    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    };
  }, [musicUrl]);

  // 响应外部播放状态变化
  useEffect(() => {
    if (audioRef.current && typeof externalIsPlaying !== 'undefined') {
      if (externalIsPlaying && !isPlaying) {
        audioRef.current.play()
          .then(() => {
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
  }, [externalIsPlaying, isPlaying, onPlayingChange]);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
      <Waveform
        lineCount={60}
        height={40}
        lineWidth={2}
        lineColor="rgba(255, 255, 255, 0.8)"
        isPlaying={isPlaying}
      />
    </div>
  );
};

export default MusicPlayer; 