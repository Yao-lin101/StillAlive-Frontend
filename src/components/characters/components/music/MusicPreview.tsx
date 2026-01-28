import React from 'react';
import { Label } from '@/components/ui/label';

interface MusicPreviewProps {
  musicLink: string;
}

export const MusicPreview: React.FC<MusicPreviewProps> = ({ musicLink }) => {
  // 确保使用HTTPS
  let secureLink = musicLink.replace('http://', 'https://');

  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 检查是否是网易云音乐的outchain播放器链接
  if (secureLink.includes('music.163.com/outchain/player')) {
    if (isMobile) {
      // 移动设备：添加/m/路径
      secureLink = secureLink.replace('/outchain/', '/m/outchain/');
    }
  }

  return (
    <div className="mt-4 border rounded-md p-3 bg-gray-50 dark:bg-slate-800 dark:border-slate-700">
      <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">音乐预览</Label>
      <div className="w-full flex justify-center">
        <iframe
          frameBorder="no"
          style={{ border: 0 }}
          width={330}
          height={100}
          src={secureLink}
          className="mx-auto"
        ></iframe>
      </div>
    </div>
  );
}; 