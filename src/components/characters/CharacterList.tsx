import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCharacters } from '@/hooks/useCharacters';
import { Character } from '@/types/character';

export const CharacterList: React.FC = () => {
  const navigate = useNavigate();
  const { characters, isLoading, error } = useCharacters();

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
        <Button onClick={() => navigate('/characters/new')}>
          创建角色
        </Button>
      </div>

      {characters.length === 0 ? (
        <div className="text-center text-gray-500 p-8">
          <p>您还没有创建任何角色</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/characters/new')}
          >
            立即创建
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character: Character) => (
            <Card
              key={character.uid}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/characters/${character.uid}`)}
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
          ))}
        </div>
      )}
    </div>
  );
}; 