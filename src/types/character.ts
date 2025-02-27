export interface Character {
  uid: string;
  name: string;
  avatar: string | null;
  bio: string;
  display_url: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface CharacterDetail extends Character {
  secret_key: string;
}

export interface CreateCharacterData {
  name: string;
  avatar?: File;
  bio?: string;
  display_url?: string;
}

export interface UpdateCharacterData {
  name?: string;
  avatar?: File;
  bio?: string;
  display_url?: string;
  is_active?: boolean;
} 