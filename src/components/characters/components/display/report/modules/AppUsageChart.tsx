/**
 * AppUsageChart — App 使用情况横向条形图
 *
 * 分手机 / 电脑两个 Tab，无数据时对应 Tab 不显示。
 * 整体无数据时返回 null。
 */

import React from 'react';
import type { ReportAppUsage, ReportAppItem } from '../types';

interface AppUsageChartProps {
  data: ReportAppUsage;
  barColor?: string;
  accentColor?: string;
  activeTab?: 'phone' | 'computer';
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

export const AppUsageChart: React.FC<AppUsageChartProps> = ({
  data,
  barColor = '#A7F3D0',
  accentColor = '#10B981',
  activeTab: externalTab,
}) => {
  const hasPhone = data?.has_phone && data.phone.length > 0;
  const hasComputer = data?.has_computer && data.computer.length > 0;

  const currentTab = externalTab || (hasPhone ? 'phone' : 'computer');

  if (!hasPhone && !hasComputer) return null;

  const displayList: ReportAppItem[] =
    currentTab === 'phone' ? (data.phone ?? []) : (data.computer ?? []);
  const maxCount = displayList.length > 0 ? displayList[0].count : 1;

  return (
    <div style={{ width: '100%' }}>
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
        今日活跃共采集 <span style={{ color: accentColor, fontWeight: 700 }}>{currentTab === 'phone' ? data.total_phone_records : data.total_computer_records}</span> 条样本
      </div>
    </div>
  );
};
