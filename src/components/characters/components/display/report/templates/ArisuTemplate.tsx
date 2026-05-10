import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { TemplateProps, ReportCommentSlot } from '../types';
import { StepsChart } from '../modules/StepsChart';
import { ActivityTimeline } from '../modules/ActivityTimeline';
import { AppUsageChart } from '../modules/AppUsageChart';
import { LLMComment } from '../modules/LLMComment';
import {
  ClipboardList,
  Clock,
  Smartphone,
  Sparkles,
  MessageSquare,
  Shell,
  Star,
  Fish
} from 'lucide-react';
import { useReportTemplate, type TabId } from '../hooks/useReportTemplate';
import { TemplateShell } from '../components/TemplateShell';
import '@/styles/ArisuTemplate.css';
import '@/styles/TemplateShell.css';

// ── 主题色彩配置 (水色系) ──────────────────────────────────────────
const AQUA_THEME = {
  sky: '#8fc5ff',
  sea: '#6d9afa',
  deep: '#5A4C5A',
  foam: '#f5f8ff',
  paper: '#fffdfc',
  accent: '#74c8f3',
  textMain: '#5E5358',
  textSub: '#8D818A',
  card: 'rgba(255, 255, 255, 0.85)',
  border: 'rgba(255, 255, 255, 0.9)',
  shadow: 'rgba(90, 76, 90, 0.08)',
};

// ── 子组件 ──────────────────────────────────────────────────

const GlassCard: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; className?: string }> = ({ children, style, className }) => (
  <div className={`glass-card ${className || ''}`} style={style}>
    {children}
  </div>
);

const SlotComment: React.FC<{ slot: ReportCommentSlot; color: string; index: number }> = ({ slot, color, index }) => {
  const emoticonId = React.useMemo(() => {
    const str = slot.comment || '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    const num = Math.abs(hash % 10) + 1;
    return num.toString().padStart(2, '0');
  }, [slot.comment]);

  const isLeft = index % 2 === 0;

  return (
    <div className="fade-in" style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start',
      flexDirection: isLeft ? 'row' : 'row-reverse',
      marginBottom: '20px'
    }}>
      <img 
        src={`/assets/reports/alice/Arisu_${emoticonId}.avif`}
        alt="Arisu"
        style={{ width: '70px', height: '70px', objectFit: 'contain', flexShrink: 0, marginTop: '8px', borderRadius: '16px' }}
      />
      <div style={{
        flex: 1,
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.6)',
        borderRadius: '16px',
        borderLeft: isLeft ? `4px solid ${color}` : 'none',
        borderRight: !isLeft ? `4px solid ${color}` : 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
      }}>
        <div style={{ 
          fontSize: '12px', 
          fontWeight: 700, 
          color, 
          marginBottom: '6px', 
          fontFamily: 'monospace',
          textAlign: isLeft ? 'left' : 'right'
        }}>{slot.range}</div>
        <div style={{ fontSize: '14px', color: AQUA_THEME.textMain, lineHeight: 1.6 }}>{slot.comment}</div>
      </div>
    </div>
  );
};

// ── 加载状态组件 ──────────────────────────────────────────────

export const ArisuLoading: React.FC = () => {
  return (
    <div className="alice-loading-container fade-in">
      <div className="alice-loading-grid" />
      <div className="alice-loading-content">
        <div className="alice-avatar-wrapper">
          <img 
            src="/assets/reports/alice/Arisu_06.avif" 
            alt="Loading..." 
            className="alice-loading-avatar" 
          />
          <div className="alice-loading-ring" />
        </div>
        <div className="alice-loading-text">
          <h3 className="alice-loading-title">Arisu is Logging in...</h3>
          <p className="alice-loading-subtitle">正在同步勇者的冒险纪录，请老师稍等……Loading...</p>
        </div>
        <div className="alice-progress-container">
          <div className="alice-progress-bar" />
        </div>
        <div className="alice-loading-status">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </div>
      </div>
    </div>
  );
};

// ── 模块实现 ────────────────────────────────────────────────

export const ArisuTemplate: React.FC<TemplateProps> = ({ data, date, variant, code }) => {
  const navigate = useNavigate();
  const {
    containerRef,
    navRef,
    activeTab,
    activeActivityTab,
    activeChatTab,
    handleTabChange,
    handleActivityTabChange,
    handleChatTabChange
  } = useReportTemplate();

  const { meta, steps, activity, apps, llm } = data;
  const statuses = llm?.sections_status;

  const dateObj = new Date(date);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const formattedDate = `${dateObj.getFullYear()} / ${(dateObj.getMonth() + 1).toString().padStart(2, '0')} / ${dateObj.getDate().toString().padStart(2, '0')}`;

  const totalSteps = steps?.total || 0;
  const totalApps = (apps?.total_phone_records || 0) + (apps?.total_computer_records || 0);
  const totalChats = llm.chat_items?.length || 0;

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'block', position: 'relative', marginBottom: '24px' }}>
              <img
                src="/assets/reports/alice/Emoticon_04.webp"
                alt="character emoticon"
                className="section-overall-img"
                style={{ width: '100px', height: '100px', objectFit: 'contain', float: 'right', marginLeft: '16px', marginBottom: '8px' }}
              />
              <LLMComment comment={llm.overall} status={statuses?.title_summary} variant="glass" />
              <div style={{ clear: 'both' }}></div>
            </div>
            {llm.raw_markdown && (
              <div style={{ marginTop: '12px' }}>
                <LLMComment comment={llm.raw_markdown} placeholder="正在通过千年学院数据中心生成详细复盘，请老师稍等……Loading..." variant="glass" />
              </div>
            )}
          </div>
        );
      case 'schedule':
        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <GlassCard style={{ padding: '24px' }}>
              <StepsChart data={steps} barColor="rgba(114, 200, 244, 0.2)" accentColor={AQUA_THEME.sea} />
            </GlassCard>
            <GlassCard style={{ padding: '24px' }}>
              <ActivityTimeline data={activity} activeColor={AQUA_THEME.sea} />
            </GlassCard>
            <div style={{ display: 'block', position: 'relative', marginBottom: '24px' }}>
              <img
                src="/assets/reports/alice/Emoticon_03.webp"
                alt="character emoticon"
                className="section-overall-img"
                style={{ width: '100px', height: '100px', objectFit: 'contain', float: 'right', marginLeft: '16px', marginBottom: '8px' }}
              />
              <LLMComment comment={llm.schedule} status={statuses?.schedule} variant="glass" />
              <div style={{ clear: 'both' }}></div>
            </div>
            {(llm.schedule_slots?.length ?? 0) > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: AQUA_THEME.textSub, marginBottom: '16px', paddingLeft: '4px' }}>时段点评</div>
                {[...(llm.schedule_slots || [])].reverse().map((slot, i) => <SlotComment key={i} slot={slot} color={AQUA_THEME.sea} index={i} />)}
              </div>
            )}
          </div>
        );
      case 'activity':
        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="sub-tabs">
              {[
                { id: 'analysis', label: '分析' },
                { id: 'phone', label: '手机', show: apps.has_phone },
                { id: 'computer', label: '电脑', show: apps.has_computer }
              ].filter(t => t.show !== false).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleActivityTabChange(tab.id as any)}
                  className={activeActivityTab === tab.id ? 'active' : ''}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeActivityTab === 'analysis' ? (
              <>
                <div style={{ display: 'block', position: 'relative', marginBottom: '24px' }}>
                  <img
                    src="/assets/reports/alice/Emoticon_02.webp"
                    alt="character emoticon"
                    className="section-overall-img"
                    style={{ width: '100px', height: '100px', objectFit: 'contain', float: 'right', marginLeft: '16px', marginBottom: '8px' }}
                  />
                  <LLMComment comment={llm.activity} status={statuses?.activity} variant="glass" />
                  <div style={{ clear: 'both' }}></div>
                </div>
                {(llm.activity_slots?.length ?? 0) > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: AQUA_THEME.textSub, marginBottom: '16px', paddingLeft: '4px' }}>活动详情</div>
                    {[...(llm.activity_slots || [])].reverse().map((slot, i) => <SlotComment key={i} slot={slot} color={AQUA_THEME.accent} index={i} />)}
                  </div>
                )}
              </>
            ) : (
              <GlassCard style={{ padding: '24px' }}>
                <AppUsageChart
                  data={apps}
                  barColor="rgba(168, 230, 207, 0.3)"
                  accentColor="#10B981"
                  activeTab={activeActivityTab as 'phone' | 'computer'}
                />
              </GlassCard>
            )}
          </div>
        );
      case 'findings':
        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'block', position: 'relative', marginBottom: '24px' }}>
              <img
                src="/assets/reports/alice/Emoticon_01.webp"
                alt="character emoticon"
                className="section-overall-img"
                style={{ width: '100px', height: '100px', objectFit: 'contain', float: 'right', marginLeft: '16px', marginBottom: '8px' }}
              />
              <LLMComment comment={llm.findings} status={statuses?.findings} variant="glass" />
              <div style={{ clear: 'both' }}></div>
            </div>
            {(llm.findings_slots?.length ?? 0) > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: AQUA_THEME.textSub, marginBottom: '16px', paddingLeft: '4px' }}>发现详情</div>
                {[...(llm.findings_slots || [])].reverse().map((slot, i) => <SlotComment key={i} slot={slot} color="#F59E0B" index={i} />)}
              </div>
            )}
          </div>
        );
      case 'chat':
        const groupItems = llm.chat_items?.filter(item => item.ref !== '私聊') || [];
        const privateItems = llm.chat_items?.filter(item => item.ref === '私聊') || [];
        const displayItems = activeChatTab === 'group' ? groupItems : privateItems;

        return (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'block', position: 'relative', marginBottom: '24px' }}>
              <img
                src="/assets/reports/alice/Emoticon_05.webp"
                alt="character emoticon"
                className="section-overall-img"
                style={{ width: '100px', height: '100px', objectFit: 'contain', float: 'right', marginLeft: '16px', marginBottom: '8px', borderRadius: '16px' }}
              />
              <LLMComment comment={llm.chat} status={statuses?.chat} variant="glass" />
              <div style={{ clear: 'both' }}></div>
            </div>

            <div className="sub-tabs">
              <button
                onClick={() => handleChatTabChange('group')}
                className={activeChatTab === 'group' ? 'active' : ''}
              >
                水群 ({groupItems.length})
              </button>
              <button
                onClick={() => handleChatTabChange('private')}
                className={activeChatTab === 'private' ? 'active' : ''}
              >
                互动 ({privateItems.length})
              </button>
            </div>

            {displayItems.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {displayItems.map((item, i) => {
                  const emoticonId = ((i + 7) % 10 + 1).toString().padStart(2, '0');
                  const isLeft = i % 2 === 0;
                  return (
                    <div key={i} className="fade-in" style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                      flexDirection: isLeft ? 'row' : 'row-reverse',
                      marginBottom: '8px'
                    }}>
                      <img 
                        src={`/assets/reports/alice/Arisu_${emoticonId}.avif`}
                        alt="Arisu"
                        style={{ width: '60px', height: '60px', objectFit: 'contain', flexShrink: 0, marginTop: '12px', borderRadius: '16px' }}
                      />
                      <GlassCard style={{ 
                        flex: 1, 
                        padding: '20px', 
                        borderLeft: isLeft ? `4px solid ${AQUA_THEME.sea}` : 'none',
                        borderRight: !isLeft ? `4px solid ${AQUA_THEME.sea}` : 'none'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          marginBottom: '8px',
                          flexDirection: isLeft ? 'row' : 'row-reverse'
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: AQUA_THEME.sea }}>{item.ref} · {item.topic}</span>
                          <span style={{ fontSize: '11px', color: AQUA_THEME.textSub, fontFamily: 'monospace' }}>{item.analyzed_at}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: AQUA_THEME.textMain, lineHeight: 1.6, textAlign: isLeft ? 'left' : 'right' }}>{item.comment}</div>
                      </GlassCard>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '60px', textAlign: 'center', color: AQUA_THEME.textSub, fontSize: '14px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px', lineHeight: 1.6 }}>
                {activeChatTab === 'group' 
                  ? '报告老师！爱丽丝未能检索到今日的“水群”任务数据……大概是队友们都在存档休息吧？邦邦咔邦！' 
                  : '报告老师！爱丽丝今日尚未接收到来自老师的关键通讯。Loading... 爱丽丝会一直在这里待命的！'}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const header = (
    <div className="page-shell">
      {/* Header Section */}
      <div className="header">
        <div className="header-slideshow">
          <div className="slide"></div>
          <div className="slide"></div>
          <div className="slide"></div>
          <div className="slide"></div>
          <div className="slide"></div>
          <div className="slide"></div>
        </div>
        <div className="header-overlay"></div>

        <div className="header-content">
          <div className="header-title">
            <div style={{ fontSize: '13px', letterSpacing: '2px', marginBottom: '8px', opacity: 0.8 }}>DAILY REPORT</div>
            <h1>{llm.title || '今日日报'}</h1>
            <div className="header-subtitle">{meta?.data_cutoff_time ? `Data until ${new Date(meta.data_cutoff_time).toLocaleTimeString()}` : 'Full Day Summary'}</div>
          </div>
          <div 
            className="date-box clickable" 
            onClick={() => {
              if (variant === 'modal' && code) {
                navigate(`/d/${code}/report/${date}`);
              } else if (variant === 'page' && code) {
                navigate(`/d/${code}`);
              }
            }}
            title={variant === 'modal' ? '查看独立详情页' : '返回角色主页'}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', marginBottom: '4px' }}>{weekdays[dateObj.getDay()]}</div>
            <div style={{ fontSize: '15px', fontWeight: 700 }}>{formattedDate}</div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">今日步数</span>
          <span className="stat-value">{totalSteps.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">活跃数据</span>
          <span className="stat-value">{totalApps.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">聊天互动</span>
          <span className="stat-value">{totalChats}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">数据记录</span>
          <span className="stat-value">{meta?.total_records || 0}</span>
        </div>
      </div>
    </div>
  );

  const nav = (
    <div className="nav-tabs">
      {[
        { id: 'summary', label: '总结', Icon: ClipboardList },
        { id: 'schedule', label: '作息', Icon: Clock },
        { id: 'activity', label: '活跃', Icon: Smartphone },
        { id: 'findings', label: '发现', Icon: Sparkles },
        { id: 'chat', label: '聊天', Icon: MessageSquare },
      ].map(tab => (
        <button
          key={tab.id}
          className={activeTab === tab.id ? 'active' : ''}
          onClick={() => handleTabChange(tab.id as TabId)}
        >
          <tab.Icon />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  const content = (
    <div className="page-shell" style={{ marginTop: 0, paddingTop: 0 }}>
      <div style={{ minHeight: '400px' }}>
        {renderContent()}
      </div>

      {/* Decorative elements (Icons) */}
      <div style={{ position: 'absolute', top: '10%', left: '-20px', opacity: 0.2, transform: 'rotate(-15deg)' }}><Shell className="w-8 h-8" /></div>
      <div style={{ position: 'absolute', top: '40%', right: '-15px', opacity: 0.2, transform: 'rotate(15deg)' }}><Star className="w-8 h-8" /></div>
      <div style={{ position: 'absolute', bottom: '10%', left: '10px', opacity: 0.2 }}><Fish className="w-8 h-8" /></div>
    </div>
  );

  return (
    <TemplateShell
      containerRef={containerRef}
      navRef={navRef}
      className="alice-template-container"
      style={{
        '--template-nav-bg': 'transparent', // Arisu uses a blurred background handled in CSS
        '--template-nav-top': '0px',
        '--template-nav-padding': '0px'
      } as React.CSSProperties}
      header={header}
      nav={nav}
      content={content}
    />
  );
};
