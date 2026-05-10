/**
 * TemplateShell — 报告模板共享结构容器
 *
 * 封装所有模板共用的布局协议：
 *   - 外层 scroll 容器（flex + overflow 配置）
 *   - nav 锚点（切换 Tab 后 scrollToNav 的目标）
 *   - sticky 吸顶导航栏（通过 CSS 变量 --template-nav-bg 允许各模板覆盖背景色）
 *   - 内容区
 *
 * 使用方式：
 *   <TemplateShell
 *     containerRef={containerRef}
 *     navRef={navRef}
 *     header={<MyHeader />}
 *     nav={<MyTabBar />}
 *     content={<MyContent />}
 *   />
 *
 * CSS 变量（可在模板自身 CSS 中覆盖）：
 *   --template-nav-bg      导航栏背景色（默认 #fff）
 *   --template-nav-padding 导航栏内边距（默认 8px 0）
 *   --template-nav-top     sticky top 偏移（默认 -4px，抵消父 padding）
 */

import React from 'react';

export interface TemplateShellProps {
  /** 来自 useReportTemplate 的 containerRef */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** 来自 useReportTemplate 的 navRef（滚动锚点） */
  navRef: React.RefObject<HTMLDivElement | null>;
  /** 模板自己的头部区域（banner、统计等），随页面滚动 */
  header: React.ReactNode;
  /** 模板自己的主 Tab 导航栏，将被 sticky 定位 */
  nav: React.ReactNode;
  /** 当前 Tab 的内容区域 */
  content: React.ReactNode;
  /** 额外 className，附加到最外层容器 */
  className?: string;
  /** 额外 style，覆盖最外层容器样式 */
  style?: React.CSSProperties;
}

export const TemplateShell: React.FC<TemplateShellProps> = ({
  containerRef,
  navRef,
  header,
  nav,
  content,
  className,
  style,
}) => (
  <div
    ref={containerRef}
    className={`template-shell custom-scrollbar${className ? ` ${className}` : ''}`}
    style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      position: 'relative',
      overflowY: 'auto',
      overflowX: 'hidden',
      overscrollBehaviorY: 'contain',
      ...style,
    }}
  >
    {/* Header：随内容滚动 */}
    {header}

    {/* 锚点：Tab 切换后 scrollToNav 的滚动目标，放在导航栏之前 */}
    <div ref={navRef} style={{ height: 0, overflow: 'hidden' }} />

    {/* 导航栏：sticky 吸顶，背景色通过 CSS 变量覆盖 */}
    <div className="template-shell__nav">
      {nav}
    </div>

    {/* 内容区 */}
    <div className="template-shell__content">
      {content}
    </div>
  </div>
);
