import React, { useState, useRef } from 'react';
import type { TemplateProps, TemplateStyle } from '../types';
import {
  ClipboardList,
  Clock,
  Smartphone,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export type TabId = 'summary' | 'schedule' | 'activity' | 'findings' | 'chat';

export interface ReportLayoutProps extends TemplateProps {
  /** 模板样式标识 */
  templateStyle: TemplateStyle;
  /** 模板容器类名 */
  containerClassName?: string;
  /** 头部渲染 */
  header: React.ReactNode;
  /** 统计概览区渲染（可选） */
  stats?: React.ReactNode;
  /** 额外背景装饰（可选） */
  decorations?: React.ReactNode;
  /** 自定义各标签页内容的渲染 */
  children: (activeTab: TabId) => React.ReactNode;
  /** 允许覆盖标签页配置 */
  tabsConfig?: Array<{ id: TabId; label: string; Icon: any; show?: boolean; sectionKey?: string }>;
}

/**
 * ReportLayout - 日报模板的基础框架
 * 统一处理：标签页切换、滚动回顶、吸顶逻辑、状态管理、更新指示器
 */
export const ReportLayout: React.FC<ReportLayoutProps> = ({
  data,
  templateStyle,
  containerClassName = '',
  header,
  stats,
  decorations,
  children,
  tabsConfig
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const statuses = data.llm?.sections_status;

  // ── 统一滚动处理 ──────────────────────────────────────────────
  const scrollToNav = () => {
    setTimeout(() => {
      if (navRef.current && containerRef.current) {
        // 自动检测滚动容器：如果内部容器高度受限且内容溢出，则内部滚动
        const isInternalScroll = containerRef.current.scrollHeight > containerRef.current.clientHeight + 10;

        if (isInternalScroll) {
          containerRef.current.scrollTo({
            top: navRef.current.offsetTop - 10,
            behavior: 'smooth'
          });
        } else {
          // 否则可能是外部滚动（如全屏页面）
          const rect = navRef.current.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          window.scrollTo({
            top: rect.top + scrollTop - 10,
            behavior: 'smooth'
          });
        }
      }
    }, 50);
  };

  const handleTabChange = (id: TabId) => {
    setActiveTab(id);
    scrollToNav();
  };

  // ── 标签页配置 ────────────────────────────────────────────────
  const defaultTabs = [
    { id: 'summary', label: '总结', Icon: ClipboardList, sectionKey: 'title_summary' },
    { id: 'schedule', label: '作息', Icon: Clock, sectionKey: 'schedule' },
    { id: 'activity', label: '活跃', Icon: Smartphone, sectionKey: 'activity' },
    { id: 'findings', label: '发现', Icon: Sparkles, sectionKey: 'findings' },
    { id: 'chat', label: '聊天', Icon: MessageSquare, sectionKey: 'chat', show: data.llm.chat_items && data.llm.chat_items.length > 0 },
  ].filter(t => t.show !== false) as any[];

  const finalTabs = tabsConfig || defaultTabs;

  return (
    <div
      ref={containerRef}
      className={`report-layout-container ${templateStyle}-template ${containerClassName} custom-scrollbar`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        position: 'relative',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        .report-layout-container {
          --report-accent: #6366F1;
          --report-nav-bg: rgba(255, 255, 255, 0.8);
          --report-nav-item-bg: transparent;
          --report-nav-item-active-bg: #FFFFFF;
          --report-nav-item-color: #64748B;
          --report-nav-item-active-color: var(--report-accent);
          --report-nav-radius: 12px;
          --report-nav-padding: 8px;
        }

        .alice-template-container {
          --report-accent: #6d9afa;
          --report-nav-bg: rgba(255, 255, 255, 0.8);
          --report-nav-item-active-bg: #FFFFFF;
          --report-nav-item-color: #8D818A;
          --report-nav-item-active-color: #6d9afa;
        }

        .report-nav-tabs-wrapper {
          display: flex;
          gap: 8px;
          padding: var(--report-nav-padding);
          background: var(--report-nav-bg);
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.3s ease;
          border-radius: var(--report-nav-radius);
          margin-bottom: 20px;
        }

        .report-nav-tabs-wrapper button {
          flex: 1;
          padding: 10px 4px;
          border: none;
          background: var(--report-nav-item-bg);
          border-radius: calc(var(--report-nav-radius) - 2px);
          font-size: 13px;
          font-weight: 600;
          color: var(--report-nav-item-color);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
          position: relative;
          outline: none;
        }

        .report-nav-tabs-wrapper button.active {
          background: var(--report-nav-item-active-bg);
          color: var(--report-nav-item-active-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .report-nav-tabs-wrapper button svg {
          width: 18px;
          height: 18px;
        }

        .updating-pulse {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--report-accent);
          animation: reportPulse 1.5s infinite;
        }

        @keyframes reportPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .report-nav-tabs-wrapper {
            padding: 6px;
            gap: 4px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .report-nav-tabs-wrapper button {
            min-width: 64px;
            padding: 8px 4px;
            font-size: 11px;
          }
          .report-nav-tabs-wrapper button svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>

      {/* 头部区域 */}
      <div className="report-header-section">
        {header}
      </div>

      {/* 统计概览区（可选） */}
      {stats && (
        <div className="report-stats-section">
          {stats}
        </div>
      )}

      {/* 锚点 & 导航栏 */}
      <div ref={navRef} style={{ height: 0, overflow: 'hidden' }} />
      <div className="report-nav-tabs-wrapper nav-tabs">
        {finalTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const status = tab.sectionKey ? statuses?.[tab.sectionKey] : null;
          const isUpdating = status === 'updating';

          return (
            <button
              key={tab.id}
              className={isActive ? 'active' : ''}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.Icon && <tab.Icon size={18} />}
              <span>{tab.label}</span>
              {isUpdating && (
                <div className="updating-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="report-content-area">
        {children(activeTab)}
      </div>

      {/* 背景装饰（可选） */}
      {decorations}
    </div>
  );
};
