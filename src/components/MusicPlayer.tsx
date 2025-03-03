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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 从网易云音乐URL中提取歌曲ID并设置音频源和封面
  useEffect(() => {
    setIsPlaying(false);
    
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
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
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

  return (
    <div className="music-player-container">
      {/* 自定义UI */}
      <div className="flex justify-center items-center flex-col">
        <div 
          className={`relative w-16 h-16 rounded-full overflow-hidden cursor-pointer ${isPlaying ? 'animate-spin-slow' : ''}`}
          onClick={togglePlayPause}
          style={{ animationDuration: '8s' }}
        >
          <img 
            src={coverImage || defaultCoverImage} 
            alt="Album Cover" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // 如果封面图片加载失败，使用默认图片
              console.log('Cover image load failed, using default');
              (e.target as HTMLImageElement).src = defaultCoverImage || '';
            }}
          />
          
          {/* 播放/暂停图标覆盖 */}
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition-opacity duration-200 hover:bg-opacity-50">
            <div className="text-white">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </div>
          </div>
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