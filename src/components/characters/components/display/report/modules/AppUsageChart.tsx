/**
 * AppUsageChart — App 使用情况横向条形图
 *
 * 分手机 / 电脑两个 Tab，无数据时对应 Tab 不显示。
 * 整体无数据时返回 null。
 */

import React, { useState } from 'react';
import type { ReportAppUsage, ReportAppItem } from '../types';

interface AppUsageChartProps {
  data: ReportAppUsage;
  barColor?: string;
  accentColor?: string;
}

const HorizontalBar: React.FC<{
  item: ReportAppItem;
  max: number;
  barColor: string;
  accentColor: string;
  rank: number;
}> = ({ item, max, barColor, accentColor, rank }) => {
  const pct = max > 0 ? (item.count / max) * 100 : 0;
  const isTop3 = rank < 3;

  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
          {/* 排名标签 */}
          <div style={{
            fontSize: '11px',
            fontWeight: 700,
            color: isTop3 ? accentColor : '#94A3B8',
            minWidth: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isTop3 ? `${accentColor}15` : '#F1F5F9',
            borderRadius: '6px',
          }}>
            {rank + 1}
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: isTop3 ? 600 : 500,
            color: isTop3 ? '#1E293B' : '#475569',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.name}
          </span>
        </div>
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: isTop3 ? accentColor : '#64748B',
          marginLeft: '10px',
          flexShrink: 0,
        }}>
          {item.count} <span style={{ fontSize: '11px', fontWeight: 500, opacity: 0.7 }}>次</span>
        </span>
      </div>
      <div style={{
        height: '6px',
        background: '#F1F5F9',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: isTop3
            ? `linear-gradient(to right, ${barColor}, ${accentColor})`
            : '#CBD5E1',
          borderRadius: '3px',
          transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }} />
      </div>
    </div>
  );
};

type AppTab = 'phone' | 'computer';

export const AppUsageChart: React.FC<AppUsageChartProps> = ({
  data,
  barColor = '#A7F3D0',
  accentColor = '#10B981',
}) => {
  const hasPhone = data?.has_phone && data.phone.length > 0;
  const hasComputer = data?.has_computer && data.computer.length > 0;

  const defaultTab: AppTab = hasPhone ? 'phone' : 'computer';
  const [activeTab, setActiveTab] = useState<AppTab>(defaultTab);

  if (!hasPhone && !hasComputer) return null;

  const displayList: ReportAppItem[] =
    activeTab === 'phone' ? (data.phone ?? []) : (data.computer ?? []);
  const maxCount = displayList.length > 0 ? displayList[0].count : 1;

  const tabs: { key: AppTab; label: string; icon: string; show: boolean }[] = [
    { key: 'phone', label: '手机', icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', show: hasPhone },
    { key: 'computer', label: '电脑', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', show: hasComputer },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Tab 切换 */}
      {hasPhone && hasComputer && (
        <div style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '20px',
          background: '#F1F5F9',
          borderRadius: '10px',
          padding: '4px',
          width: 'fit-content',
        }}>
          {tabs.filter(t => t.show).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: activeTab === tab.key ? '#FFFFFF' : 'transparent',
                color: activeTab === tab.key ? accentColor : '#64748B',
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 条形图列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {displayList.map((item, i) => (
          <HorizontalBar
            key={`${item.name}-${i}`}
            item={item}
            max={maxCount}
            barColor={barColor}
            accentColor={accentColor}
            rank={i}
          />
        ))}
      </div>

      {/* 底部统计 */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: '1px dashed #F1F5F9',
        fontSize: '12px',
        color: '#94A3B8',
        fontWeight: 500,
        textAlign: 'right',
      }}>
        今日活跃共采集 <span style={{ color: accentColor, fontWeight: 700 }}>{activeTab === 'phone' ? data.total_phone_records : data.total_computer_records}</span> 条样本
      </div>
    </div>
  );
};
