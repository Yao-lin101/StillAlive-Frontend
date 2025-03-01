import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';

const updateCharacterSchema = z.object({
  name: z.string().min(1, '请输入角色名称'),
  bio: z.string().max(500, '简介最多500字').optional(),
  avatar: z.string().url('请输入有效的URL地址').optional().or(z.literal('')),
  qqNumber: z.string().regex(/^\d{5,11}$/, 'QQ号格式不正确').optional().or(z.literal('')),
});

type UpdateCharacterFormData = z.infer<typeof updateCharacterSchema>;

interface CharacterFormProps {
  character: {
    name: string;
    bio?: string | null;
    avatar?: string | null;
  };
  onSubmit: (data: UpdateCharacterFormData) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
  updateError?: string | null;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  character,
  onSubmit,
  onCancel,
  isSaving,
  updateError
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UpdateCharacterFormData>({
    resolver: zodResolver(updateCharacterSchema),
    defaultValues: {
      name: character.name,
      bio: character.bio || '',
      avatar: character.avatar || '',
    }
  });

  const qqNumber = watch('qqNumber');
  const avatarUrl = watch('avatar');
  const [previewAvatar, setPreviewAvatar] = React.useState<string | null>(character.avatar || null);

  // 当QQ号变化时更新预览
  useEffect(() => {
    if (qqNumber && /^\d{5,11}$/.test(qqNumber)) {
      const url = `https://q.qlogo.cn/headimg_dl?dst_uin=${qqNumber}&spec=640&img_type=jpg`;
      setPreviewAvatar(url);
      setValue('avatar', url);
    }
  }, [qqNumber, setValue]);

  // 当头像URL变化时更新预览
  useEffect(() => {
    if (avatarUrl) {
      setPreviewAvatar(avatarUrl);
    } else {
      setPreviewAvatar(null);
    }
  }, [avatarUrl]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        {previewAvatar ? (
          <img
            src={previewAvatar}
            alt={character.name}
            className="w-24 h-24 rounded-full object-cover"
            onError={() => setPreviewAvatar(null)}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-3xl text-gray-500">
              {character.name[0]}
            </span>
          </div>
        )}
        <div className="flex-1 space-y-4">
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
          onClick={onCancel}
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
  );
}; 