import { useState, useEffect } from 'react';
import { Character, CharacterDetail } from '@/types/character';
import { characterService } from '@/services/characterService';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      const data = await characterService.list();
      setCharacters(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  return { characters, isLoading, error, refetch: fetchCharacters };
}

export function useCharacter(uid: string) {
  const [character, setCharacter] = useState<CharacterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCharacter = async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const data = await characterService.get(uid);
      setCharacter(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // 静默刷新，不显示加载状态
  const silentRefetch = () => fetchCharacter(false);

  useEffect(() => {
    fetchCharacter();
  }, [uid]);

  return { 
    character, 
    isLoading, 
    error, 
    refetch: fetchCharacter,
    silentRefetch 
  };
} 