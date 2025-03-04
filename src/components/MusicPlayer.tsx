import React, { useState, useEffect, useRef } from 'react';

interface MusicPlayerProps {
  musicUrl: string;
  isPlaying?: boolean;
  onPlayingChange?: (playing: boolean) => void;
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

  // 组件不渲染任何UI
  return null;
};

export default MusicPlayer; 