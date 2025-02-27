import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import Input from '../ui/Input';
import { AnimatedSubscribeButton } from '@/components/magicui/animated-subscribe-button';
import { CheckIcon, XIcon } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacters';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';
import { UpdateCharacterData } from '@/types/character';

const updateCharacterSchema = z.object({
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

type UpdateCharacterFormData = z.infer<typeof updateCharacterSchema>;

export const CharacterDetail: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { character, isLoading, error, silentRefetch } = useCharacter(uid!);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [isRegeneratingKey, setIsRegeneratingKey] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateCharacterFormData>({
    resolver: zodResolver(updateCharacterSchema),
  });

  useEffect(() => {
    if (character) {
      reset({
        name: character.name,
        bio: character.bio || '',
      });
    }
  }, [character, reset]);

  const handleShowSecretKey = async () => {
    try {
      const key = await characterService.getSecretKey(uid!);
      setSecretKey(key);
    } catch (err) {
      setUpdateError(formatError(err));
    }
  };

  const handleRegenerateSecretKey = async () => {
    try {
      setIsRegeneratingKey(true);
      const key = await characterService.regenerateSecretKey(uid!);
      setSecretKey(key);
    } catch (err) {
      setUpdateError(formatError(err));
    } finally {
      setIsRegeneratingKey(false);
    }
  };

  const onSubmit = async (data: UpdateCharacterFormData) => {
    try {
      setIsSaving(true);
      setUpdateError(null);
      
      const updateData: UpdateCharacterData = {
        name: data.name,
        bio: data.bio,
      };

      if (data.avatar?.[0]) {
        updateData.avatar = data.avatar[0];
      }
      
      await characterService.update(uid!, updateData);
      setIsEditing(false);
      await silentRefetch();
    } catch (err) {
      setUpdateError(formatError(err));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="text-center text-red-500 p-4">
        {error || '角色不存在'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">角色详情</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/characters')}
          >
            返回列表
          </Button>
          <Button
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '取消编辑' : '编辑'}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex items-center space-x-4 mb-4">
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-500">
                    {character.name[0]}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-medium">更换头像</label>
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
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">角色名称</label>
              <Input
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">简介</label>
              <Input
                {...register('bio')}
                error={errors.bio?.message}
              />
            </div>

            {updateError && (
              <div className="text-sm text-red-500">
                {updateError}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? '保存中...' : '保存'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {character.avatar ? (
                <img
                  src={character.avatar}
                  alt={character.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl text-gray-500">
                    {character.name[0]}
                  </span>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{character.name}</h2>
                <p className="text-sm text-gray-500">
                  创建于 {new Date(character.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {character.bio && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">简介</h3>
                <p className="mt-1">{character.bio}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">角色状态</h3>
              <div className="flex items-center space-x-2">
                <AnimatedSubscribeButton 
                  className="w-32 h-9"
                  subscribeStatus={character.is_active}
                  onClick={async () => {
                    try {
                      await characterService.updateStatus(uid!, !character.is_active);
                      await silentRefetch();
                    } catch (err) {
                      setUpdateError(formatError(err));
                    }
                  }}
                >
                  <span className="group inline-flex items-center">
                    <XIcon className="mr-2 size-4" />
                    已禁用
                  </span>
                  <span className="group inline-flex items-center">
                    <CheckIcon className="mr-2 size-4" />
                    已启用
                  </span>
                </AnimatedSubscribeButton>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                禁用后，角色展示页面将无法访问
              </p>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">展示链接</h3>
              <div className="space-y-2">
                <div className="p-4 bg-gray-50 rounded-md">
                  {character.display_code ? (
                    <p className="font-mono text-sm break-all">
                      {`${import.meta.env.VITE_CHARACTER_DISPLAY_BASE_URL}/d/${character.display_code}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">展示链接未生成</p>
                  )}
                </div>
                <div className="space-x-2">
                  {character.display_code && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const url = `${import.meta.env.VITE_CHARACTER_DISPLAY_BASE_URL}/d/${character.display_code}`;
                        navigator.clipboard.writeText(url);
                      }}
                    >
                      复制链接
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setIsSaving(true);
                        await characterService.regenerateDisplayCode(uid!);
                        await silentRefetch();
                      } catch (err) {
                        setUpdateError(formatError(err));
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                  >
                    重新生成链接
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-500 mb-2">密钥管理</h3>
              <div className="space-y-2">
                {secretKey ? (
                  <div className="p-4 bg-gray-50 rounded-md">
                    <p className="font-mono text-sm break-all">{secretKey}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">点击下方按钮查看或重新生成密钥</p>
                )}
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleShowSecretKey}
                    disabled={!!secretKey}
                  >
                    查看密钥
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRegenerateSecretKey}
                    disabled={isRegeneratingKey}
                  >
                    {isRegeneratingKey ? '生成中...' : '重新生成密钥'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}; 