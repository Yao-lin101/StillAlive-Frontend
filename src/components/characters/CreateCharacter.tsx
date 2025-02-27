import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Input from '../ui/Input';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { CreateCharacterData } from '@/types/character';

const createCharacterSchema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  bio: z.string().max(500, '简介最多500字').optional(),
  avatar: z.string().url('请输入有效的URL地址').optional().or(z.literal('')),
  qqNumber: z.string().regex(/^\d{5,11}$/, 'QQ号格式不正确').optional().or(z.literal('')),
});

type CreateCharacterFormData = z.infer<typeof createCharacterSchema>;

export const CreateCharacter: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateCharacterFormData>({
    resolver: zodResolver(createCharacterSchema),
  });

  const qqNumber = watch('qqNumber');
  const avatarUrl = watch('avatar');

  // 当QQ号变化时更新预览
  React.useEffect(() => {
    if (qqNumber && /^\d{5,11}$/.test(qqNumber)) {
      const url = `https://q1.qlogo.cn/g?b=qq&nk=${qqNumber}&s=100`;
      setPreviewAvatar(url);
      setValue('avatar', url);
    }
  }, [qqNumber, setValue]);

  // 当头像URL变化时更新预览
  React.useEffect(() => {
    if (avatarUrl) {
      setPreviewAvatar(avatarUrl);
    }
  }, [avatarUrl]);

  const onSubmit = async (data: CreateCharacterFormData) => {
    try {
      setIsCreating(true);
      setError(null);

      const createData: CreateCharacterData = {
        name: data.name,
        bio: data.bio,
        avatar: data.avatar
      };

      const character = await characterService.create(createData);
      navigate(`/characters/${character.uid}`);
    } catch (err) {
      setError(formatError(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">创建角色</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/characters')}
        >
          返回列表
        </Button>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">角色名称</label>
            <Input
              {...register('name')}
              error={errors.name?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">QQ号</label>
              <Input
                type="text"
                placeholder="输入QQ号自动获取头像"
                {...register('qqNumber')}
                error={errors.qqNumber?.message}
              />
              <p className="text-xs text-gray-500">
                输入QQ号自动获取头像
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">头像URL</label>
              <Input
                type="text"
                placeholder="https://example.com/avatar.jpg"
                {...register('avatar')}
                error={errors.avatar?.message}
              />
              <p className="text-xs text-gray-500">
                也可以直接输入头像图片的URL地址
              </p>
            </div>
          </div>

          {previewAvatar && (
            <div className="flex items-center space-x-4">
              <img
                src={previewAvatar}
                alt="头像预览"
                className="w-16 h-16 rounded-full object-cover"
                onError={() => setPreviewAvatar(null)}
              />
              <span className="text-sm text-gray-500">头像预览</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">简介</label>
            <Input
              {...register('bio')}
              error={errors.bio?.message}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/characters')}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
            >
              {isCreating ? '创建中...' : '创建'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}; 