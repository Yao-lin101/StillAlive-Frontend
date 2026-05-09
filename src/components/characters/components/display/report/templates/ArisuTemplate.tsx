import React, { useState } from 'react';
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

type TabId = 'summary' | 'schedule' | 'activity' | 'findings' | 'chat';

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
        style={{ width: '70px', height: '70px', objectFit: 'contain', flexShrink: 0, marginTop: '8px' }}
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

// ── 模块实现 ────────────────────────────────────────────────

export const ArisuTemplate: React.FC<TemplateProps> = ({ data, date }) => {
  const [activeTab, setActiveTab] = useState<TabId>('summary');
  const [activeActivityTab, setActiveActivityTab] = useState<'analysis' | 'phone' | 'computer'>('analysis');
  const [activeChatTab, setActiveChatTab] = useState<'group' | 'private'>('group');

  const containerRef = React.useRef<HTMLDivElement>(null);
  const navRef = React.useRef<HTMLDivElement>(null);

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
          // 外部滚动 (window): 定位到锚点在文档中的绝对位置
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

  const handleActivityTabChange = (id: 'analysis' | 'phone' | 'computer') => {
    setActiveActivityTab(id);
    scrollToNav();
  };

  const handleChatTabChange = (id: 'group' | 'private') => {
    setActiveChatTab(id);
    scrollToNav();
  };

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
                <LLMComment comment={llm.raw_markdown} placeholder="正在生成详细复盘..." variant="glass" />
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
                {llm.schedule_slots?.map((slot, i) => <SlotComment key={i} slot={slot} color={AQUA_THEME.sea} index={i} />)}
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
                    {llm.activity_slots?.map((slot, i) => <SlotComment key={i} slot={slot} color={AQUA_THEME.accent} index={i} />)}
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
                {llm.findings_slots?.map((slot, i) => <SlotComment key={i} slot={slot} color="#F59E0B" index={i} />)}
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
                style={{ width: '100px', height: '100px', objectFit: 'contain', float: 'right', marginLeft: '16px', marginBottom: '8px' }}
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
                        style={{ width: '60px', height: '60px', objectFit: 'contain', flexShrink: 0, marginTop: '12px' }}
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
              <div style={{ padding: '60px', textAlign: 'center', color: AQUA_THEME.textSub, fontSize: '14px', background: 'rgba(255,255,255,0.3)', borderRadius: '20px' }}>
                今日暂无{activeChatTab === 'group' ? '水群记录' : '私聊互动'}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="alice-template-container custom-scrollbar" 
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
        @font-face {
          font-family: 'LXGW WenKai';
          src: url('https://tc.ciallo.ccwu.cc/file/1775130743963_1774880718993_LXGWWenKai-Regular.woff2') format('woff2');
          font-weight: 400;
        }

        @font-face {
          font-family: 'LXGW WenKai';
          src: url('https://tc.ciallo.ccwu.cc/file/1775130739223_1774880715380_LXGWWenKai-Medium.woff2') format('woff2');
          font-weight: 600;
        }

        .alice-template-container {
          --alice-sky: #8fc5ff;
          --alice-sea: #6d9afa;
          --alice-text: #5E5358;
          --alice-sub: #8D818A;
          
          font-family: 'LXGW WenKai', 'Inter', -apple-system, sans-serif;
          color: var(--alice-text);
          padding: 12px;
          flex: 1;
          position: relative;
        }

        .page-shell {
          position: relative;
          border-radius: 32px;
          padding: 40px 24px;
          background-color: #dff4ff;
          background-image: 
            linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(242, 251, 255, 0.95)),
            linear-gradient(rgba(117, 193, 240, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(117, 193, 240, 0.08) 1px, transparent 1px);
          background-size: auto, 26px 26px, 26px 26px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 24px 70px rgba(90, 76, 90, 0.08);
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          padding: 32px;
          border-radius: 24px;
          color: #fff;
          margin-bottom: 28px;
          position: relative;
          box-shadow: 0 16px 40px rgba(77, 163, 210, 0.15);
          overflow: hidden;
        }

        .header-slideshow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
        }

        .slide {
          position: absolute;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          opacity: 0;
          animation: slideAnimation 30s infinite;
        }

        .slide:nth-child(1) { background-image: url('/assets/reports/alice/header-bg-1.avif'); animation-delay: 0s; }
        .slide:nth-child(2) { background-image: url('/assets/reports/alice/header-bg-2.avif'); animation-delay: 5s; }
        .slide:nth-child(3) { background-image: url('/assets/reports/alice/header-bg-3.avif'); animation-delay: 10s; }
        .slide:nth-child(4) { background-image: url('/assets/reports/alice/header-bg-4.avif'); animation-delay: 15s; }
        .slide:nth-child(5) { background-image: url('/assets/reports/alice/header-bg-5.avif'); animation-delay: 20s; }
        .slide:nth-child(6) { background-image: url('/assets/reports/alice/header-bg-6.avif'); animation-delay: 25s; }

        @keyframes slideAnimation {
          0% { opacity: 0; transform: scale(1.1); }
          2% { opacity: 1; }
          16% { opacity: 1; }
          18% { opacity: 0; transform: scale(1.05); }
          100% { opacity: 0; }
        }

        .header-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(120deg, rgba(44, 118, 161, 0.5) 0%, rgba(88, 176, 221, 0.35) 56%, rgba(174, 226, 247, 0.15) 100%);
          z-index: 1;
        }

        .header-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .header-title h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 600;
        }

        .header-subtitle {
          margin-top: 8px;
          font-size: 15px;
          opacity: 0.9;
        }

        .date-box {
          text-align: center;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(75, 148, 196, 0.05);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-item {
          padding: 16px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.8);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--alice-sea);
        }

        .stat-label {
          font-size: 12px;
          color: var(--alice-sub);
        }

        .nav-tabs {
          display: flex;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          margin-bottom: 24px;
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          flex-shrink: 0;
          min-height: fit-content;
        }

        .nav-tabs button {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          color: var(--alice-sub);
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
          -webkit-tap-highlight-color: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .nav-tabs button svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
        }

        .nav-tabs button:focus {
          outline: none;
        }

        .nav-tabs button.active {
          background: #fff;
          color: var(--alice-sea);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .sub-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-shrink: 0;
        }

        .sub-tabs button {
          padding: 6px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.8);
          background: rgba(255,255,255,0.4);
          font-size: 13px;
          font-weight: 600;
          color: var(--alice-sub);
          cursor: pointer;
        }

        .sub-tabs button.active {
          background: var(--alice-sea);
          color: #fff;
          border-color: var(--alice-sea);
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Mobile Optimizations ────────────────────────────────────── */
        @media (max-width: 768px) {
          .page-shell {
            padding: 20px 12px;
            border-radius: 20px;
          }

          .header {
            padding: 20px;
            margin-bottom: 20px;
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }

          .header-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
          }

          .header-title h1 {
            font-size: 24px;
          }

          .header-subtitle {
            font-size: 13px;
          }

          .date-box {
            padding: 10px 16px;
            align-self: center;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }

          .stat-item {
            padding: 12px;
          }

          .stat-value {
            font-size: 18px;
          }

          .nav-tabs {
            padding: 6px;
            gap: 4px;
            margin: 0 auto 16px auto;
            width: calc(100% - 8px);
            justify-content: center;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            flex-shrink: 0;
          }

          .nav-tabs button {
            padding: 8px 4px;
            font-size: 11px;
            min-width: 60px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .nav-tabs button svg {
            width: 16px;
            height: 16px;
          }

          .hero-grid {
            grid-template-columns: 1fr;
          }

          /* Emoticon floating adjustment */
          .section-overall-img {
            width: 70px !important;
            height: 70px !important;
            margin-left: 8px !important;
          }
        }
      `}</style>

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
            <div className="date-box">
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

      {/* Anchor for scrolling - Moved outside page-shell to match DefaultTemplate protocol */}
      <div ref={navRef} style={{ height: 0, overflow: 'hidden' }} />

      {/* Navigation - Moved outside page-shell to match DefaultTemplate protocol */}
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

      {/* Content Area */}
      <div className="page-shell" style={{ marginTop: 0, paddingTop: 0 }}>
        <div style={{ minHeight: '400px' }}>
          {renderContent()}
        </div>

        {/* Decorative elements (Icons) */}
        <div style={{ position: 'absolute', top: '10%', left: '-20px', opacity: 0.2, transform: 'rotate(-15deg)' }}><Shell className="w-8 h-8" /></div>
        <div style={{ position: 'absolute', top: '40%', right: '-15px', opacity: 0.2, transform: 'rotate(15deg)' }}><Star className="w-8 h-8" /></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '10px', opacity: 0.2 }}><Fish className="w-8 h-8" /></div>

        {/* Big Background text like in HTML */}
        <div style={{
          position: 'absolute',
          right: '20px',
          top: '40px',
          fontSize: '120px',
          fontWeight: 800,
          color: 'rgba(75, 169, 220, 0.15)',
          pointerEvents: 'none',
          zIndex: 0,
          fontFamily: 'monospace'
        }}>
        </div>
      </div>
    </div>
  );
};
