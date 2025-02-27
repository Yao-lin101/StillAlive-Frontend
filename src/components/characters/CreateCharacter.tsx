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
  avatar: z
    .instanceof(FileList)
    .optional()
    .refine(
      (files) => !files || files.length === 0 || files[0].size <= 5 * 1024 * 1024,
      '图片大小不能超过5MB'
    ),
});

type CreateCharacterFormData = z.infer<typeof createCharacterSchema>;

export const CreateCharacter: React.FC = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCharacterFormData>({
    resolver: zodResolver(createCharacterSchema),
  });

  const onSubmit = async (data: CreateCharacterFormData) => {
    try {
      setIsCreating(true);
      setError(null);

      const createData: CreateCharacterData = {
        name: data.name,
        bio: data.bio,
      };

      if (data.avatar?.[0]) {
        createData.avatar = data.avatar[0];
      }

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

          <div className="space-y-2">
            <label className="text-sm font-medium">头像</label>
            <Input
              type="file"
              accept="image/*"
              {...register('avatar')}
              error={errors.avatar?.message}
            />
            <p className="text-xs text-gray-500">
              支持jpg、png格式，大小不超过5MB
            </p>
          </div>

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