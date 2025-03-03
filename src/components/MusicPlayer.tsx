import React, { useState, useEffect, useRef } from 'react';

interface MusicPlayerProps {
  musicUrl: string;
  coverUrl?: string;
  defaultCoverImage?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  musicUrl, 
  coverUrl,
  defaultCoverImage = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [songId, setSongId] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [songInfo, setSongInfo] = useState<{ name?: string; artist?: string } | null>(null);
  const [rotationDegree, setRotationDegree] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // 从网易云音乐URL中提取歌曲ID并设置音频源和封面
  useEffect(() => {
    setIsPlaying(false);
    
    // 重置旋转角度
    setRotationDegree(0);
    
    try {
      // 如果提供了自定义封面URL，优先使用
      if (coverUrl) {
        setCoverImage(coverUrl);
      }
      
      // 尝试从URL中提取歌曲ID
      // 网易云音乐iframe URL格式通常为：//music.163.com/outchain/player?type=2&id=SONG_ID&auto=0&height=66
      const url = new URL(musicUrl.startsWith('//') ? `https:${musicUrl}` : musicUrl);
      const id = url.searchParams.get('id');
      
      if (id) {
        setSongId(id);
        
        // 如果没有提供自定义封面，则使用网易云音乐的封面
        if (!coverUrl) {
          // 设置封面图片URL
          // 使用网易云音乐的封面图片URL格式
          setCoverImage(`https://p1.music.126.net/v0joo2QoT_1P3DpcoPbB3Q==/${id}.jpg?param=200y200`);
        }
        
        // 创建音频元素
        const audio = new Audio(`https://music.163.com/song/media/outer/url?id=${id}.mp3`);
        // 设置循环播放
        audio.loop = true;
        audio.addEventListener('ended', () => {
          // 由于设置了循环播放，这个事件通常不会触发
          // 但保留以防万一循环播放失效
          audio.currentTime = 0;
          audio.play().catch(err => console.error('Failed to restart audio:', err));
        });
        audioRef.current = audio;
        
        // 只有在没有提供自定义封面时，才尝试获取歌曲信息
        if (!coverUrl) {
          // 尝试获取歌曲信息
          fetch(`https://autumnfish.cn/song/detail?ids=${id}`)
            .then(response => response.json())
            .then(data => {
              if (data && data.songs && data.songs.length > 0) {
                const song = data.songs[0];
                if (song.al?.picUrl) {
                  setCoverImage(song.al.picUrl);
                }
                setSongInfo({
                  name: song.name,
                  artist: song.ar?.[0]?.name
                });
              }
            })
            .catch(error => {
              console.error('Failed to fetch song info:', error);
            });
        }
      } else {
        setSongId(null);
        if (!coverUrl) {
          setCoverImage(null);
        }
        audioRef.current = null;
        setSongInfo(null);
      }
    } catch (error) {
      console.error('Failed to parse music URL:', error);
      setSongId(null);
      if (!coverUrl) {
        setCoverImage(null);
      }
      audioRef.current = null;
      setSongInfo(null);
    }
  }, [musicUrl, coverUrl]);

  // 处理旋转动画
  useEffect(() => {
    const updateRotation = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }
      
      // 计算时间差，转换为旋转角度增量
      // 15秒旋转360度，所以每毫秒旋转 360 / (15 * 1000) 度
      const elapsed = timestamp - lastTimeRef.current;
      const rotationIncrement = (elapsed * 360) / (15 * 1000);
      
      // 更新旋转角度，保持在0-360范围内
      setRotationDegree(prev => (prev + rotationIncrement) % 360);
      
      lastTimeRef.current = timestamp;
      animationRef.current = requestAnimationFrame(updateRotation);
    };
    
    if (isPlaying) {
      // 开始动画
      animationRef.current = requestAnimationFrame(updateRotation);
    } else if (animationRef.current) {
      // 停止动画但保持当前角度
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      lastTimeRef.current = null;
    }
    
    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        lastTimeRef.current = null;
      }
    };
  }, [isPlaying]);

  // 处理播放/暂停
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Failed to play audio:', err);
          });
      }
    } else if (songId) {
      // 如果没有音频元素但有歌曲ID，重新创建
      const audio = new Audio(`https://music.163.com/song/media/outer/url?id=${songId}.mp3`);
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
      });
      audioRef.current = audio;
      
      // 尝试播放
      audio.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(err => {
          console.error('Failed to play audio:', err);
        });
    }
  };

  // 定义动画样式 - 只应用于封面图片
  const coverStyle = {
    transform: `rotate(${rotationDegree}deg)`,
  };

  // 定义容器样式 - 应用呼吸效果
  const containerStyle = {
    boxShadow: isPlaying ? '0 0 0 0 rgba(255, 255, 255, 0.7)' : 'none',
    animation: isPlaying ? 'breathing 2s ease-in-out infinite' : 'none',
    transition: isPlaying ? 'none' : 'box-shadow 0.3s ease-out'
  };

  return (
    <div className="music-player-container">
      {/* 添加全局样式 */}
      <style>
        {`
          @keyframes breathing {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
            }
            
            70% {
              box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
            }
            
            100% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
          }
        `}
      </style>
      
      {/* 自定义UI */}
      <div className="flex justify-center items-center flex-col">
        <div 
          className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer"
          onClick={togglePlayPause}
          style={containerStyle}
        >
          <img 
            src={coverImage || defaultCoverImage} 
            alt="Album Cover" 
            className="w-full h-full object-cover"
            style={coverStyle}
            onError={(e) => {
              // 如果封面图片加载失败，使用默认图片
              console.log('Cover image load failed, using default');
              (e.target as HTMLImageElement).src = defaultCoverImage || '';
            }}
          />
          
          {/* 播放按钮覆盖 - 只在非播放状态显示 */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-200 hover:bg-opacity-50">
              <div className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </div>
            </div>
          )}
        </div>
        
        {/* 歌曲信息 */}
        {songInfo && (
          <div className="text-center mt-2 text-xs text-gray-600">
            <div className="font-medium">{songInfo.name}</div>
            {songInfo.artist && <div>{songInfo.artist}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer; 