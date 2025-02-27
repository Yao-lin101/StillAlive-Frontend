import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CharacterList } from '@/components/characters/CharacterList';
import { CreateCharacter } from '@/components/characters/CreateCharacter';
import { CharacterDetail } from '@/components/characters/CharacterDetail';

export const CharactersPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Routes>
        <Route path="/" element={<CharacterList />} />
        <Route path="/new" element={<CreateCharacter />} />
        <Route path="/:uid" element={<CharacterDetail />} />
      </Routes>
    </div>
  );
}; 