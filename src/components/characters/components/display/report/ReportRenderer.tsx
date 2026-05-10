/**
 * ReportRenderer — 模板分派入口
 *
 * 根据 templateStyle 渲染对应模板。
 * 新增模板只需：
 *   1. 在 templates/ 下新建组件
 *   2. 在 TEMPLATE_MAP 中注册
 */

import React from 'react';
import type { TemplateStyle, TemplateProps } from './types';
import { DefaultTemplate } from './templates/DefaultTemplate';
import { ArisuTemplate, ArisuLoading } from './templates/ArisuTemplate';

// ── 模板注册表 ─────────────────────────────────────────────────────
const TEMPLATE_MAP: Record<TemplateStyle, React.FC<TemplateProps>> = {
  default: DefaultTemplate,
  alice: ArisuTemplate,
  // 未来扩展：
  // minimal: MinimalTemplate,
  // retro: RetroTemplate,
  minimal: DefaultTemplate,  // 占位，暂时降级到 default
  retro: DefaultTemplate,
};

// ── 加载状态注册表 ───────────────────────────────────────────────────
export const LOADING_MAP: Record<string, React.FC> = {
  alice: ArisuLoading,
};

interface ReportRendererProps extends TemplateProps {
  templateStyle?: TemplateStyle;
}

export const ReportRenderer: React.FC<ReportRendererProps> = ({
  data,
  date,
  templateStyle = 'default',
  variant,
  code,
}) => {
  const Template = TEMPLATE_MAP[templateStyle] ?? DefaultTemplate;
  return <Template data={data} date={date} variant={variant} code={code} />;
};
