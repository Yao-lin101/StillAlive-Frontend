import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCharacters } from '@/hooks/useCharacters';
import { Character } from '@/types/character';
import { Ticket } from 'lucide-react';
import authService from '@/lib/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from '@/hooks/useUser';
import { API_URL } from '@/config';
import { toast } from 'sonner';

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



  const fetchInvitationCodes = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/list_invitations/`, {
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
      const response = await fetch(`${API_URL}/users/create_invitation/`, {
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
    if (!isSuperuser && characters.length >= 3) {
      toast.error("最多只能创建3个角色");
      return;
    }
    navigate('/characters/new');
  }, [navigate, characters.length, isSuperuser]);

  const handleNavigateToCharacter = useCallback((uid: string) => {
    navigate(`/characters/${uid}`);
  }, [navigate]);

  const renderCharacterCard = useCallback((character: Character) => (
    <Card
      key={character.uid}
      className="group relative overflow-hidden cursor-pointer backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] transition-all duration-300 rounded-2xl"
      onClick={() => handleNavigateToCharacter(character.uid)}
    >
      {/* 渐变背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative p-6 space-y-4">
        <div className="flex items-center space-x-4">
          {character.avatar ? (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-white/30 dark:ring-white/10 group-hover:ring-[#90D5FF] dark:group-hover:ring-[#90D5FF] transition-all duration-300 shadow-md"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FFB5B5] to-[#90D5FF] flex items-center justify-center shadow-md ring-2 ring-white/30 dark:ring-white/10">
              <span className="text-2xl text-white font-bold">
                {character.name[0]}
              </span>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-[#90D5FF] dark:group-hover:text-[#90D5FF] transition-colors">{character.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              创建于 {new Date(character.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        {character.bio && (
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
            {character.bio}
          </p>
        )}
      </div>
    </Card>
  ), [handleNavigateToCharacter]);

  const charactersList = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out">
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
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center px-4 py-6 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white pl-2">我的角色</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleNavigateToNew}
              title={!isSuperuser && characters.length >= 3 ? "最多只能创建3个角色" : "创建角色"}
              className="bg-white/50 hover:bg-white/70 text-slate-800 dark:text-white dark:bg-white/20 dark:hover:bg-white/30 backdrop-blur-md border border-white/40 shadow-sm"
            >
              创建角色
            </Button>
            {isSuperuser && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="邀请码管理" className="bg-white/50 border-white/40">
                    <Ticket className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>邀请码管理</DialogTitle>
                    <DialogDescription>
                      管理邀请码，查看现有邀请码并生成新的邀请码
                    </DialogDescription>
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

          </div>
        </div>
      </div>

      {characters.length === 0 ? (
        <div className="mx-4 max-w-6xl mx-auto text-center text-slate-500 dark:text-gray-400 p-12 backdrop-blur-xl bg-white/30 dark:bg-black/30 border border-white/20 dark:border-white/10 rounded-2xl">
          <p className="text-lg">您还没有创建任何角色</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleNavigateToNew}
          >
            立即创建
          </Button>
        </div>
      ) : (
        <div className="px-4 pb-8 max-w-6xl mx-auto">
          {charactersList}
        </div>
      )}
    </div>
  );
});

export default CharacterList; 