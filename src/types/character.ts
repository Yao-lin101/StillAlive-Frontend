export interface Character {
  uid: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  display_code: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_public: boolean;
  is_owner?: boolean;
  experience?: number;
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

export interface StatusConfigType {
  vital_signs?: {
    [key: string]: {
      label: string;
      key?: string;
      suffix?: string;
      description?: string;
      valueType?: 'number' | 'text' | 'string' | 'boolean';
      color?: {
        type: string;
        rules: Array<{
          value?: number;
          color: string;
          default?: string;
        }>;
      };
    };
  };
  display?: {
    default_message: string;
    default_music_url?: string;
    timeout_messages?: Array<{
      hours: number;
      message: string;
      music_link?: string;
    }>;
  };
  theme?: {
    background_url: string;
    mobile_background_url?: string;
    overlay_opacity: number;
    meteors_enabled?: boolean;
    feathers_enabled?: boolean;
    slideshow_interval?: number;
  };
}

export interface CharacterDetail extends Character {
  secret_key: string;
  status_config?: StatusConfigType;
}

export interface CreateCharacterData {
  name: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateCharacterData {
  name: string;
  bio?: string;
  avatar?: string;
  status_config?: StatusConfigType;
  is_active?: boolean;
  is_public?: boolean;
}

export interface WillConfig {
  is_enabled: boolean;
  content?: string;
  target_email: string;
  cc_emails: string[];
  timeout_hours: number;
  created_at: string;
}

export interface Message {
  id: number;
  content: string;
  created_at: string;
  ip_address?: string;
  location?: string;
}

export interface AIPersona {
  core_identity?: string;
  personality_traits?: string;
  language_style?: string;
}

export interface DailyReportConfig {
  is_enabled: boolean;
  visibility: 'private' | 'public';
  field_mappings: {
    phone_app?: string;
    computer_app?: string;
    steps?: string;
  };
  persona?: string;
  template_style?: string; // 修正为 string 以便与后端兼容，或者导入 TemplateStyle
  ai_persona?: AIPersona;
  created_at?: string;
  updated_at?: string;
}

// ── 结构化报告数据类型 ────────────────────────────────────────────────

export interface ReportStepsChart {
  labels: string[];
  values: number[];
  total: number;
  max_value: number;
}

export interface ReportActivityHour {
  hour: number;
  label: string;
  level: 0 | 1 | 2;  // 0=不活跃, 1=轻度, 2=高度
  active_minutes: number;
}

export interface ReportActivityTimeline {
  hours: ReportActivityHour[];
  global_ranges: string[];
  today_ranges: string[];
}

export interface ReportAppItem {
  name: string;
  count: number;
}

export interface ReportAppUsage {
  phone: ReportAppItem[];
  computer: ReportAppItem[];
  combined: ReportAppItem[];
  total_phone_records: number;
  total_computer_records: number;
  has_phone: boolean;
  has_computer: boolean;
}

export interface ReportPrivateTopic {
  time: string;
  topic: string;
  summary: string;
}

export interface ReportGroupChat {
  name: string;
  bot_nickname: string;
  user_nickname: string;
  topics: Array<{ time: string; summary: string }>;
}

export interface ReportChatData {
  has_private: boolean;
  has_group: boolean;
  private_topics: ReportPrivateTopic[];
  group_chats: ReportGroupChat[];
  total_message_blocks: number;
}

export interface ReportCommentSlot {
  range: string;
  comment: string;
  locked: boolean;
}

export interface ReportChatItem {
  ref: string;
  topic: string;
  comment: string;
  analyzed_at?: string;
}

export interface ReportLLMComments {
  version: number;
  title: string | null;
  overall: string | null;
  schedule: string | null;
  schedule_slots?: ReportCommentSlot[];
  activity: string | null;
  activity_slots?: ReportCommentSlot[];
  findings: string | null;
  findings_slots?: ReportCommentSlot[];
  chat: string | null;
  chat_items?: ReportChatItem[];
  has_content: boolean;
  sections_status?: Record<string, 'pending' | 'updating' | 'done' | 'error'>;
  raw_markdown?: string;
}

export interface ReportData {
  meta: {
    date: string;
    total_records: number;
    data_cutoff_time: string;
  };
  steps: ReportStepsChart;
  activity: ReportActivityTimeline;
  apps: ReportAppUsage;
  chat: ReportChatData;
  llm: ReportLLMComments;
}

export interface DailyReportDetail {
  date: string;
  is_hidden: boolean;
  markdown: string;
  template_style?: string;
  error?: string;
  report_data?: ReportData;
}


export interface DailyReportAnalysis {
  markdown: string;
  error?: string;
}

export interface DailyReport {
  id: number;
  date: string;
  is_hidden: boolean;
  raw_data: any;
  analysis_result: DailyReportAnalysis;
  created_at: string;
  updated_at: string;
}

export interface VitalSignOption {
  key: string;
  label: string;
  description?: string;
  valueType?: string;
} 