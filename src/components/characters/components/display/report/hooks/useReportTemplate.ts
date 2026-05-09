/**
 * useReportTemplate — 报告模板共享行为 Hook
 *
 * 封装所有模板共用的基础设施：
 *   - 三个 Tab 状态（主 Tab / 活动子 Tab / 聊天子 Tab）
 *   - scrollToNav：自动判断内部/外部滚动容器，切换 Tab 后回到导航栏
 *   - containerRef + navRef：供 TemplateShell 使用
 *
 * 使用方式：
 *   const { containerRef, navRef, activeTab, handleTabChange, ... } = useReportTemplate();
 */

import { useState, useRef, useCallback } from 'react';

export type TabId = 'summary' | 'schedule' | 'activity' | 'findings' | 'chat';
export type ActivityTabId = 'analysis' | 'phone' | 'computer';
export type ChatTabId = 'group' | 'private';

export interface UseReportTemplateReturn {
  // Refs — 传给 TemplateShell
  containerRef: React.RefObject<HTMLDivElement | null>;
  navRef: React.RefObject<HTMLDivElement | null>;

  // 状态
  activeTab: TabId;
  activeActivityTab: ActivityTabId;
  activeChatTab: ChatTabId;

  // Handlers（内置 scrollToNav）
  handleTabChange: (id: TabId) => void;
  handleActivityTabChange: (id: ActivityTabId) => void;
  handleChatTabChange: (id: ChatTabId) => void;

  // 暴露原始 setter，供模板有特殊需求时使用
  scrollToNav: () => void;
}

export function useReportTemplate(): UseReportTemplateReturn {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [activeActivityTab, setActiveActivityTab] = useState<ActivityTabId>('analysis');
  const [activeChatTab, setActiveChatTab] = useState<ChatTabId>('group');

  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /**
   * 自动检测滚动容器（内部 vs window），并平滑滚动到导航锚点。
   * - 内部滚动：容器自身有 overflow，用 container.scrollTo
   * - 外部滚动：容器撑满 window，用 window.scrollTo
   */
  const scrollToNav = useCallback(() => {
    setTimeout(() => {
      const container = containerRef.current;
      const nav = navRef.current;
      if (!nav || !container) return;

      const isInternalScroll = container.scrollHeight > container.clientHeight + 10;

      if (isInternalScroll) {
        container.scrollTo({
          top: nav.offsetTop - 10,
          behavior: 'smooth',
        });
      } else {
        const rect = nav.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        window.scrollTo({
          top: rect.top + scrollTop - 10,
          behavior: 'smooth',
        });
      }
    }, 50);
  }, []);

  const handleTabChange = useCallback(
    (id: TabId) => {
      setActiveTab(id);
      scrollToNav();
    },
    [scrollToNav],
  );

  const handleActivityTabChange = useCallback(
    (id: ActivityTabId) => {
      setActiveActivityTab(id);
      scrollToNav();
    },
    [scrollToNav],
  );

  const handleChatTabChange = useCallback(
    (id: ChatTabId) => {
      setActiveChatTab(id);
      scrollToNav();
    },
    [scrollToNav],
  );

  return {
    containerRef,
    navRef,
    activeTab,
    activeActivityTab,
    activeChatTab,
    handleTabChange,
    handleActivityTabChange,
    handleChatTabChange,
    scrollToNav,
  };
}
