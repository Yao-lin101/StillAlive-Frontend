import React, { useState } from 'react';
import type { TemplateProps, ReportCommentSlot } from '../types';
import { StepsChart } from '../modules/StepsChart';
import { ActivityTimeline } from '../modules/ActivityTimeline';
import { AppUsageChart } from '../modules/AppUsageChart';
import { LLMComment } from '../modules/LLMComment';

// ── 主题色彩配置 ──────────────────────────────────────────
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

type TabId = 'summary' | 'schedule' | 'activity' | 'findings' | 'chat';

// ── 子组件 ──────────────────────────────────────────────────

const TabNav: React.FC<{ activeTab: TabId; setActiveTab: (id: TabId) => void; statuses?: Record<string, string> }> = ({ activeTab, setActiveTab, statuses }) => {
  const tabs: { id: TabId; label: string; color: string; sectionKey: string }[] = [
    { id: 'summary', label: '总体总结', color: THEME.accent1, sectionKey: 'title_summary' },
    { id: 'schedule', label: '作息分析', color: THEME.accent1, sectionKey: 'schedule' },
    { id: 'activity', label: '活动画像', color: THEME.accent2, sectionKey: 'activity' },
    { id: 'findings', label: '有趣发现', color: THEME.accent4, sectionKey: 'findings' },
    { id: 'chat', label: '水群聊天', color: THEME.accent3, sectionKey: 'chat' },
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '4px',
      background: '#F1F5F9',
      borderRadius: '12px',
      marginBottom: '20px',
      overflowX: 'auto',
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        const status = statuses?.[tab.sectionKey];
        const isUpdating = status === 'updating';

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: '90px',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
            {isUpdating && (
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: tab.color,
                animation: 'pulse 1.5s infinite'
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

// ── 模块实现 ────────────────────────────────────────────────

const TitleSection: React.FC<{ date: string; meta: any; title: string | null }> = ({ date, meta, title }) => {
  const dateObj = new Date(date);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const formattedDate = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
  const cutoffTime = meta?.data_cutoff_time;

  let cutoffLabel = '';
  if (cutoffTime) {
    const dt = new Date(cutoffTime);
    cutoffLabel = dt.toDateString() !== dateObj.toDateString() ? '全天数据' : `截至 ${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F0FDFA 100%)',
      borderRadius: '16px',
      padding: '24px 32px',
      marginBottom: '20px',
      border: '1px solid #E0E7FF',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#1E1B4B' }}>
          {formattedDate}
          <span style={{ fontSize: '16px', fontWeight: 500, color: THEME.textMuted, marginLeft: '8px' }}>{weekdays[dateObj.getDay()]}</span>
        </h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '11px', padding: '2px 8px', background: '#FFF', borderRadius: '12px', border: '1px solid #E0E7FF', color: THEME.accent1 }}>{cutoffLabel}</span>
          <span style={{ fontSize: '11px', padding: '2px 8px', background: '#E2E8F0', borderRadius: '12px', color: THEME.textMuted }}>{meta?.total_records} 记录</span>
        </div>
      </div>
      {title && <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E1B4B', paddingTop: '12px', borderTop: '1px solid rgba(99,102,241,0.1)' }}>{title}</div>}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
// 主模板
// ══════════════════════════════════════════════════════════════════

export const DefaultTemplate: React.FC<TemplateProps> = ({ data, date }) => {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const { meta, steps, activity, apps, llm } = data;
  const statuses = llm?.sections_status;

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
                {llm.schedule_slots?.map((slot, i) => <SlotComment key={i} slot={slot} color={THEME.accent1} />)}
              </div>
            )}
          </div>
        );
      case 'activity':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ background: '#FFF', padding: '20px', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
              <AppUsageChart data={apps} barColor="#D1FAE5" accentColor={THEME.accent2} />
            </div>
            <LLMComment comment={llm.activity} status={statuses?.activity} />
            {(llm.activity_slots?.length ?? 0) > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: THEME.textMuted, marginBottom: '12px' }}>活动详情</div>
                {llm.activity_slots?.map((slot, i) => <SlotComment key={i} slot={slot} color={THEME.accent2} />)}
              </div>
            )}
          </div>
        );
      case 'findings':
        return <LLMComment comment={llm.findings} status={statuses?.findings} />;
      case 'chat':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LLMComment comment={llm.chat} status={statuses?.chat} />
            {llm.chat_items?.map((item, i) => (
              <div key={i} style={{ padding: '16px', background: '#FFF1F2', borderRadius: '12px', border: '1px solid #FCE7F3' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: THEME.accent3 }}>{item.ref} · {item.topic}</span>
                  <span style={{ fontSize: '10px', color: THEME.textMuted }}>{item.analyzed_at}</span>
                </div>
                <div style={{ fontSize: '14px', color: THEME.text, lineHeight: 1.6 }}>{item.comment}</div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ fontFamily: '"Inter", sans-serif', color: THEME.text, padding: '4px' }}>
      <TitleSection date={date} meta={meta} title={llm.title} />
      <TabNav activeTab={activeTab} setActiveTab={setActiveTab} statuses={statuses} />
      <div style={{ minHeight: '300px' }}>
        {renderContent()}
      </div>
    </div>
  );
};
