import { StatusConfigType } from './character';

export interface DisplayConfig {
  default_message: string;
  default_music_url?: string;
  default_cover_url?: string;
  timeout_messages: Array<{
    hours: number;
    message: string;
    music_link?: string;
    cover_url?: string;
  }>;
}

export interface TimeoutMessage {
  hours: number;
  message: string;
  music_link?: string;
  raw_music_link?: string;
  cover_url?: string;
}

export interface DefaultMessage {
  message: string;
  music_url?: string;
  raw_music_url?: string;
  cover_url?: string;
}

export interface DisplayConfigCardProps {
  config: StatusConfigType;
  onUpdate: (config: StatusConfigType) => void;
  onSave: (config: StatusConfigType) => Promise<void>;
  isSaving: boolean;
} 