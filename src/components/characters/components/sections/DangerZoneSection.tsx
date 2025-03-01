import React from 'react';
import { Button } from '@/components/ui/button';

interface DangerZoneSectionProps {
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  onDelete: () => Promise<void>;
  onCancelDelete: () => void;
  onShowDeleteConfirm: () => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  showDeleteConfirm,
  isDeleting,
  onDelete,
  onCancelDelete,
  onShowDeleteConfirm
}) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-sm font-medium text-red-500 mb-2">危险操作</h3>
      <div className="space-y-2">
        {showDeleteConfirm ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-500">确定要删除这个角色吗？此操作不可恢复。</p>
            <div className="space-x-2">
              <Button
                variant="destructive"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? '删除中...' : '确认删除'}
              </Button>
              <Button
                variant="outline"
                onClick={onCancelDelete}
              >
                取消
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="destructive"
            onClick={onShowDeleteConfirm}
          >
            删除角色
          </Button>
        )}
      </div>
    </div>
  );
}; 