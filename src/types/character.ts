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

export type StatusValueType = 'number' | 'text';

export type StatusRule = {
  type: 'threshold' | 'range' | 'enum';
  rules: Array<{
    min?: number;
    max?: number;
    value?: number | string;
    color: string;
    default?: boolean;
    label?: string;  // For enum type, display text
  }>;
};

export type StatusConfig = {
  key: string;        // 状态的键名，用于API通信
  label: string;      // 状态的显示名称
  valueType: StatusValueType; // 值的类型
  description?: string; // 描述
  suffix?: string;    // 单位（仅用于数值类型）
  color: StatusRule;  // 保持与后端兼容
};

export type VitalSigns = {
  [key: string]: StatusConfig;
};

export type StatusConfigType = {
  vital_signs: VitalSigns;
};

export interface CharacterDetail extends Character {
  secret_key: string;
  status_config?: StatusConfigType;
}

export interface CreateCharacterData {
  name: string;
  bio?: string;
  avatar?: File;
}

export interface UpdateCharacterData {
  name?: string;
  bio?: string;
  avatar?: File;
  status_config?: StatusConfigType;
  is_active?: boolean;
} 