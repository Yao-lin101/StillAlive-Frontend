export interface Character {
  uid: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  display_code: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CharacterDetail extends Character {
  secret_key: string;
}

export interface CreateCharacterData {
  name: string;
  bio?: string;
  avatar?: File;
}

export interface UpdateCharacterData {
  name: string;
  bio?: string;
  avatar?: File;
} 