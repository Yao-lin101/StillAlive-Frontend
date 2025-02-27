import { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { characterService } from '@/services/characterService';
import { formatError } from '@/lib/utils';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await characterService.list();
        setCharacters(data);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  return { characters, isLoading, error };
}

export function useCharacter(uid: string) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await characterService.get(uid);
        setCharacter(data);
      } catch (err) {
        setError(formatError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (uid) {
      fetchCharacter();
    }
  }, [uid]);

  return { character, isLoading, error };
} 