/**
 * 报告渲染系统 — 共享类型
 *
 * 设计原则：
 *  - ReportRenderer 作为统一入口，根据 templateStyle 派发给不同模板
 *  - 每个模板由若干独立 Module 组合而成
 *  - 每个 Module 负责自己的"无数据时不渲染"逻辑
 */

import type {
  ReportData,
  ReportStepsChart,
  ReportActivityTimeline,
  ReportAppUsage,
  ReportAppItem,
  ReportChatData,
  ReportLLMComments,
  ReportCommentSlot,
  ReportChatItem,
} from '@/types/character';

// ── 模板注册表 ──────────────────────────────────────────────────────
/** 所有可用模板的标识符 */
export type TemplateStyle = 'default' | 'minimal' | 'retro' | 'alice';

/** 每个模板组件接收相同的 TemplateProps */
export interface TemplateProps {
  data: ReportData;
  date: string;
  variant?: 'modal' | 'page';
  code?: string;
}

// ── 各模块 Props ─────────────────────────────────────────────────────

export interface TitleModuleProps {
  date: string;
  totalRecords: number;
  cutoffTime: string;
  title?: string | null;         // LLM 生成的标题（可选）
}

export interface SummaryModuleProps {
  comment: string | null;        // LLM 整体总结评论
}

export interface ScheduleModuleProps {
  steps: ReportStepsChart;
  activity: ReportActivityTimeline;
  comment: string | null;        // LLM 作息分析评论
}

export interface ActivityModuleProps {
  apps: ReportAppUsage;
  comment: string | null;        // LLM 活动画像评论
}

export interface FindingsModuleProps {
  comment: string | null;        // LLM 有趣发现评论
}

export interface ChatModuleProps {
  chat: ReportChatData;
  comment: string | null;        // LLM 水群聊天评论
}

// ── Re-export for convenience ────────────────────────────────────────
export type {
  ReportData,
  ReportStepsChart,
  ReportActivityTimeline,
  ReportAppUsage,
  ReportAppItem,
  ReportChatData,
  ReportLLMComments,
  ReportCommentSlot,
  ReportChatItem,
};
