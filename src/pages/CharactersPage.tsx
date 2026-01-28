import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CharacterList } from '@/components/characters/CharacterList';
import { CreateCharacter } from '@/components/characters/CreateCharacter';
import { CharacterDetail } from '@/components/characters/CharacterDetail';

export const CharactersPage: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* 固定背景 */}
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#FFE1E1] to-[#E3F4FF] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />

      <div className="relative z-10 container mx-auto">
        <Routes>
          <Route path="/" element={<CharacterList />} />
          <Route path="/new" element={<CreateCharacter />} />
          <Route path="/:uid" element={<CharacterDetail />} />
        </Routes>
      </div>
    </div>
  );
}; 