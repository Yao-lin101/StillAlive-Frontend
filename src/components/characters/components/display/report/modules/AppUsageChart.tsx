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
  activeTab?: 'phone' | 'computer' | 'computer_2';
}

const formatDuration = (mins: number | undefined) => {
  if (mins === undefined || mins <= 0) return '';
  if (mins < 1) {
    return `${Math.round(mins * 60)}秒`;
  }
  if (mins < 60) {
    return `${Math.round(mins)}分钟`;
  }
  const hrs = Math.floor(mins / 60);
  const remainingMins = Math.round(mins % 60);
  if (remainingMins === 0) {
    return `${hrs}小时`;
  }
  return `${hrs}小时${remainingMins}分钟`;
};

const HorizontalBar: React.FC<{
  item: ReportAppItem;
  max: number;
  barColor: string;
  accentColor: string;
  rank: number;
  hasDurationData: boolean;
}> = ({ item, max, barColor, accentColor, rank, hasDurationData }) => {
  const pct = max > 0 ? ((hasDurationData ? (item.duration ?? 0) : item.count) / max) * 100 : 0;
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
          {item.duration !== undefined && item.duration > 0 && (
            <span style={{ fontSize: '12px', fontWeight: 500, marginLeft: '6px', opacity: 0.8 }}>
              ({formatDuration(item.duration)})
            </span>
          )}
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
  const hasComputer = (data?.has_computer && data.computer.length > 0) || (data?.computer_2 && data.computer_2.length > 0);

  const currentTab = externalTab || (hasPhone ? 'phone' : 'computer');

  if (!hasPhone && !hasComputer) return null;

  const displayList: ReportAppItem[] =
    currentTab === 'phone'
      ? (data.phone ?? [])
      : currentTab === 'computer_2'
      ? (data.computer_2 ?? [])
      : (data.computer ?? []);

  const hasDurationData = displayList.some(item => item.duration !== undefined && item.duration > 0);
  
  // 优先按照时长降序排序；如果时长相同或无时长，按照次数降序排序
  const sortedDisplayList = [...displayList].sort((a, b) => {
    if (hasDurationData) {
      const durA = a.duration ?? 0;
      const durB = b.duration ?? 0;
      if (durB !== durA) return durB - durA;
    }
    return b.count - a.count;
  });

  const maxVal = Math.max(hasDurationData
    ? Math.max(...sortedDisplayList.map(item => item.duration ?? 0))
    : Math.max(...sortedDisplayList.map(item => item.count)), 1);

  return (
    <div style={{ width: '100%' }}>
      {/* 条形图列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {sortedDisplayList.map((item, i) => (
          <HorizontalBar
            key={`${item.name}-${i}`}
            item={item}
            max={maxVal}
            barColor={barColor}
            accentColor={accentColor}
            rank={i}
            hasDurationData={hasDurationData}
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <div>
          {currentTab === 'phone' && data.total_phone_duration !== undefined && data.total_phone_duration > 0 && (
            <span>
              手机活跃时长: <span style={{ color: accentColor, fontWeight: 700 }}>{formatDuration(data.total_phone_duration)}</span>
            </span>
          )}
          {currentTab !== 'phone' && data.total_computer_duration !== undefined && data.total_computer_duration > 0 && (
            <span>
              电脑活跃时长: <span style={{ color: accentColor, fontWeight: 700 }}>{formatDuration(data.total_computer_duration)}</span>
            </span>
          )}
        </div>
        <div>
          今日活跃共采集 <span style={{ color: accentColor, fontWeight: 700 }}>{currentTab === 'phone' ? data.total_phone_records : data.total_computer_records}</span> 条样本
        </div>
      </div>
    </div>
  );
};
