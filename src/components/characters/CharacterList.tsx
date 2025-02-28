import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCharacters } from '@/hooks/useCharacters';
import { Character } from '@/types/character';
import { LogOut, Ticket } from 'lucide-react';
import authService from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from '@/hooks/useUser';
import { API_URL } from '@/config';

interface InvitationCode {
  code: string;
  created_at: string;
  is_used: boolean;
}

export const CharacterList = React.memo(() => {
  const navigate = useNavigate();
  const { characters, isLoading, error } = useCharacters();
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [invitationCodes, setInvitationCodes] = useState<InvitationCode[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const isSuperuser = useMemo(() => user?.is_superuser ?? false, [user]);

  const handleLogout = useCallback(() => {
    authService.clearTokens();
    window.dispatchEvent(new Event('auth-change'));
  }, []);

  const fetchInvitationCodes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/users/list_invitations/`, {
        headers: {
          'Authorization': `Bearer ${authService.getTokens().access}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInvitationCodes(data.results);
      }
    } catch (error) {
      console.error('获取邀请码列表失败:', error);
    }
  }, []);

  useEffect(() => {
    if (isDialogOpen) {
      fetchInvitationCodes();
    }
  }, [isDialogOpen, fetchInvitationCodes]);

  const handleCreateInvitation = useCallback(async () => {
    try {
      setIsCreating(true);
      const response = await fetch(`${API_URL}/api/v1/users/create_invitation/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getTokens().access}`
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error('创建邀请码失败');
      }

      await fetchInvitationCodes();
    } catch (error) {
      console.error('创建邀请码失败:', error);
    } finally {
      setIsCreating(false);
    }
  }, [fetchInvitationCodes]);

  const handleNavigateToNew = useCallback(() => {
    navigate('/characters/new');
  }, [navigate]);

  const handleNavigateToCharacter = useCallback((uid: string) => {
    navigate(`/characters/${uid}`);
  }, [navigate]);

  const renderCharacterCard = useCallback((character: Character) => (
    <Card
      key={character.uid}
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => handleNavigateToCharacter(character.uid)}
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-4">
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl text-gray-500">
                {character.name[0]}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold">{character.name}</h3>
            <p className="text-sm text-gray-500">
              创建于 {new Date(character.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {character.bio && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {character.bio}
          </p>
        )}
      </div>
    </Card>
  ), [handleNavigateToCharacter]);

  const charactersList = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {characters.map(renderCharacterCard)}
    </div>
  ), [characters, renderCharacterCard]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">我的角色</h1>
        <div className="flex items-center gap-4">
          <Button onClick={handleNavigateToNew}>
            创建角色
          </Button>
          {isSuperuser && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" title="邀请码管理">
                  <Ticket className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>邀请码管理</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Button
                    onClick={handleCreateInvitation}
                    disabled={isCreating}
                    className="w-full"
                  >
                    {isCreating ? '生成中...' : '生成新邀请码'}
                  </Button>
                  <div className="space-y-2">
                    <Label>有效的邀请码</Label>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {invitationCodes
                        .filter(code => !code.is_used)
                        .map(code => (
                          <div key={code.code} className="flex items-center justify-between p-2 bg-secondary rounded">
                            <code className="font-mono">{code.code}</code>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(code.created_at).toLocaleDateString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(code.code);
                                }}
                              >
                                复制
                              </Button>
                            </div>
                          </div>
                        ))}
                      {invitationCodes.filter(code => !code.is_used).length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          暂无可用的邀请码
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleLogout}
            title="退出登录"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <p>您还没有创建任何角色</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleNavigateToNew}
          >
            立即创建
          </Button>
        </div>
      ) : charactersList}
    </div>
  );
});

export default CharacterList; 