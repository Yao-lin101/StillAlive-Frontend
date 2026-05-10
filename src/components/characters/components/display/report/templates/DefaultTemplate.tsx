/**
 * DefaultTemplate — 默认报告模板
 *
 * 基础设施全部由共享层提供，本文件只关注主题和内容渲染。
 *
 * 共享层：
 *   - useReportTemplate()  → tab 状态、scrollToNav、refs
 *   - TemplateShell        → 外层容器、nav 锚点、sticky 导航栏
 */

import React from 'react';
import type { TemplateProps, ReportCommentSlot } from '../types';
import { StepsChart } from '../modules/StepsChart';
import { ActivityTimeline } from '../modules/ActivityTimeline';
import { AppUsageChart } from '../modules/AppUsageChart';
import { LLMComment } from '../modules/LLMComment';
import { useReportTemplate, type TabId } from '../hooks/useReportTemplate';
import { TemplateShell } from '../components/TemplateShell';
import '@/styles/TemplateShell.css';

// ── 主题色彩配置 ──────────────────────────────────────────────────
const THEME = {
  bg: 'transparent',
  card: '#FFFFFF',
  cardBorder: '#F1F5F9',
  cardShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  accent1: '#6366F1',   // 靛蓝 — 作息
  accent2: '#10B981',   // 翠绿 — 活动
  accent3: '#EC4899',   // 玫红 — 聊天
  accent4: '#F59E0B',   // 琥珀 — 发现
  text: '#1E293B',
  textMuted: '#64748B',
  divider: '#F1F5F9',
};

// ── 子组件 ───────────────────────────────────────────────────────

const TabNav: React.FC<{
  activeTab: TabId;
  setActiveTab: (id: TabId) => void;
  statuses?: Record<string, string>;
}> = ({ activeTab, setActiveTab, statuses }) => {
  const tabs = ([
    { id: 'summary',  label: '总体总结', color: THEME.accent1, sectionKey: 'title_summary' },
    { id: 'schedule', label: '作息分析', color: THEME.accent1, sectionKey: 'schedule' },
    { id: 'activity', label: '活动画像', color: THEME.accent2, sectionKey: 'activity' },
    { id: 'findings', label: '有趣发现', color: THEME.accent4, sectionKey: 'findings' },
    { id: 'chat',     label: '水群聊天', color: THEME.accent3, sectionKey: 'chat' },
  ] as { id: TabId; label: string; color: string; sectionKey: string }[]).filter(tab => {
    if (tab.id === 'chat' && statuses?.chat === 'skipped') return false;
    return true;
  });

  return (
    <div className="template-shell__nav-tabs" style={{
      gap: '4px',
      padding: '4px',
      background: '#F1F5F9',
      borderRadius: '12px',
      // 通过 CSS 变量微调自适应参数
      ['--template-nav-tab-min-width' as any]: '0',
      ['--template-nav-gap' as any]: '4px',
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const isUpdating = statuses?.[tab.sectionKey] === 'updating';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="template-shell__nav-tab-item"
            style={{
              padding: '8px 12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: isActive ? '#FFFFFF' : 'transparent',
              color: isActive ? tab.color : THEME.textMuted,
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease',
              gap: '6px',
            }}
          >
            {tab.label}
            {isUpdating && (
              <div style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: tab.color,
                animation: 'pulse 1.5s infinite',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

const SlotComment: React.FC<{ slot: ReportCommentSlot; color: string }> = ({ slot, color }) => (
  <div style={{
    padding: '12px 16px',
    background: '#F8FAFC',
    borderRadius: '12px',
    borderLeft: `4px solid ${color}`,
    marginBottom: '12px',
  }}>
    <div style={{ fontSize: '12px', fontWeight: 700, color, marginBottom: '4px' }}>{slot.range}</div>
    <div style={{ fontSize: '14px', color: THEME.text, lineHeight: 1.6 }}>{slot.comment}</div>
  </div>
);

const TitleSection: React.FC<{ date: string; meta: any; title: string | null }> = ({ date, meta, title }) => {
  const dateObj = new Date(date);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const cutoffTime = meta?.data_cutoff_time;

  let cutoffLabel = '';
  if (cutoffTime) {
    const dt = new Date(cutoffTime);
    cutoffLabel = dt.toDateString() !== dateObj.toDateString()
      ? '全天数据'
      : `截至 ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDFA 100%)',
      borderRadius: '16px',
      padding: '20px 24px',
      marginBottom: '20px',
      border: '1px solid #E0E7FF',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1E1B4B', whiteSpace: 'nowrap' }}>
          {formattedDate}
          <span style={{ fontSize: '15px', fontWeight: 500, color: THEME.textMuted, marginLeft: '8px' }}>
            {weekdays[dateObj.getDay()]}
          </span>
        </h1>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px', padding: '2px 8px',
            background: '#FFF', borderRadius: '12px',
            border: '1px solid #E0E7FF', color: THEME.accent1, whiteSpace: 'nowrap',
          }}>
            {cutoffLabel}
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 8px',
            background: '#E2E8F0', borderRadius: '12px',
            color: THEME.textMuted, whiteSpace: 'nowrap',
          }}>
            {meta?.total_records} 记录
          </span>
        </div>
      </div>
      {title && (
        <div style={{
          fontSize: '17px', fontWeight: 700, color: '#1E1B4B',
          paddingTop: '12px', borderTop: '1px solid rgba(99,102,241,0.1)', lineHeight: 1.4,
        }}>
          {title}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// 主模板
// ══════════════════════════════════════════════════════════════════

export const DefaultTemplate: React.FC<TemplateProps> = ({ data, date }) => {
  const {
    containerRef, navRef,
    activeTab, activeActivityTab, activeChatTab,
    handleTabChange, handleActivityTabChange, handleChatTabChange,
  } = useReportTemplate();

  const { meta, steps, activity, apps, llm } = data;
  const statuses = llm?.sections_status;

  // ── 内容渲染 ─────────────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LLMComment comment={llm.overall} status={statuses?.title_summary} />
            {llm.raw_markdown && <LLMComment comment={llm.raw_markdown} placeholder="正在生成详细复盘..." />}
          </div>
        );

      case 'schedule':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
              <StepsChart data={steps} barColor="#E0E7FF" accentColor={THEME.accent1} />
            </div>
            <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
              <ActivityTimeline data={activity} activeColor={THEME.accent1} />
            </div>
            <LLMComment comment={llm.schedule} status={statuses?.schedule} />
            {(llm.schedule_slots?.length ?? 0) > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted, marginBottom: '12px' }}>时段点评</div>
                {(llm.schedule_slots || []).slice().reverse().map((slot, i) => <SlotComment key={i} slot={slot} color={THEME.accent1} />)}
              </div>
            )}
          </div>
        );

      case 'activity':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
              {[
                { id: 'analysis', label: '分析' },
                { id: 'phone',    label: '手机', show: apps.has_phone },
                { id: 'computer', label: '电脑', show: apps.has_computer },
              ].filter(t => t.show !== false).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleActivityTabChange(tab.id as any)}
                  style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    background: activeActivityTab === tab.id ? '#FFF' : 'transparent',
                    color: activeActivityTab === tab.id ? THEME.accent2 : THEME.textMuted,
                    boxShadow: activeActivityTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeActivityTab === 'analysis' ? (
              <>
                <LLMComment comment={llm.activity} status={statuses?.activity} />
                {(llm.activity_slots?.length ?? 0) > 0 && (
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted, marginBottom: '12px' }}>活动详情</div>
                    {(llm.activity_slots || []).slice().reverse().map((slot, i) => <SlotComment key={i} slot={slot} color={THEME.accent2} />)}
                  </div>
                )}
              </>
            ) : (
              <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                <AppUsageChart data={apps} barColor="#D1FAE5" accentColor={THEME.accent2} activeTab={activeActivityTab as 'phone' | 'computer'} />
              </div>
            )}
          </div>
        );

      case 'findings':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LLMComment comment={llm.findings} status={statuses?.findings} />
            {(llm.findings_slots?.length ?? 0) > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted, marginBottom: '12px' }}>发现详情</div>
                {(llm.findings_slots || []).slice().reverse().map((slot, i) => <SlotComment key={i} slot={slot} color={THEME.accent4} />)}
              </div>
            )}
          </div>
        );

      case 'chat': {
        const groupItems   = llm.chat_items?.filter(item => item.ref !== '私聊') || [];
        const privateItems = llm.chat_items?.filter(item => item.ref === '私聊') || [];
        const displayItems = activeChatTab === 'group' ? groupItems : privateItems;

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LLMComment comment={llm.chat} status={statuses?.chat} />
            <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
              {([
                { id: 'group',   label: `水群 (${groupItems.length})` },
                { id: 'private', label: `互动 (${privateItems.length})` },
              ] as { id: 'group' | 'private'; label: string }[]).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleChatTabChange(tab.id)}
                  style={{
                    padding: '6px 16px', borderRadius: '8px', border: 'none',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    background: activeChatTab === tab.id ? '#FFF' : 'transparent',
                    color: activeChatTab === tab.id ? THEME.accent3 : THEME.textMuted,
                    boxShadow: activeChatTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {displayItems.length > 0 ? (
              [...displayItems].reverse().map((item, i) => (
                <div key={i} style={{ padding: '16px', background: '#FFF1F2', borderRadius: '12px', border: '1px solid #FCE7F3' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.accent3 }}>{item.ref} · {item.topic}</span>
                    <span style={{ fontSize: '10px', color: THEME.textMuted }}>{item.analyzed_at}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: THEME.text, lineHeight: 1.6 }}>{item.comment}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: THEME.textMuted, fontSize: '14px' }}>
                今日暂无{activeChatTab === 'group' ? '水群记录' : '私聊互动'}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ── Shell 组装 ───────────────────────────────────────────────────
  return (
    <TemplateShell
      containerRef={containerRef}
      navRef={navRef}
      style={{
        fontFamily: '"Inter", sans-serif',
        color: THEME.text,
        padding: '4px',
        // 覆盖 nav 背景为纯白
        '--template-nav-bg': '#FFFFFF',
        '--template-nav-top': '-4px',
        '--template-nav-padding': '8px 4px',
        '--template-content-pt': '16px',
      } as React.CSSProperties}
      header={<TitleSection date={date} meta={meta} title={llm.title} />}
      nav={<TabNav activeTab={activeTab} setActiveTab={handleTabChange} statuses={statuses} />}
      content={renderContent()}
    />
  );
};
