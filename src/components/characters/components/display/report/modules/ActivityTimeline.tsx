/**
 * ActivityTimeline — 24小时活跃时段热力图
 *
 * 24个格子，按活跃度显示不同深度颜色。
 * 无数据时返回 null。
 */

import React from 'react';
import type { ReportActivityTimeline } from '../types';

interface ActivityTimelineProps {
  data: ReportActivityTimeline;
  activeColor?: string;
  lightColor?: string;
}

const LEVEL_LABELS = ['休眠', '轻度活跃', '高度活跃'];

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  data,
  activeColor = '#6366F1',
  lightColor = '#A5B4FC',
}) => {
  if (!data || !data.hours || data.hours.length === 0) return null;

  const hasAnyActivity = data.hours.some(h => h.level > 0);
  if (!hasAnyActivity && data.global_ranges.length === 0) return null;

  return (
    <div style={{ width: '100%' }}>
      {/* 热力格子 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(24, 1fr)',
        gap: '4px',
        marginBottom: '10px',
      }}>
        {data.hours.map(h => {
          const bgColor =
            h.level === 2
              ? activeColor
              : h.level === 1
              ? lightColor
              : '#F1F5F9';

          return (
            <div
              key={h.hour}
              title={`${h.label}:00 — ${LEVEL_LABELS[h.level]}${h.active_minutes > 0 ? ` (${h.active_minutes}分钟)` : ''}`}
              style={{
                height: '24px',
                borderRadius: '4px',
                background: bgColor,
                cursor: 'default',
                transition: 'all 0.2s ease',
                border: h.level === 0 ? '1px solid #F8FAFC' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* X轴标签 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px',
        padding: '0 2px',
      }}>
        {['00:00', '06:00', '12:00', '18:00', '23:59'].map(h => (
          <span key={h} style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{h}</span>
        ))}
      </div>

      {/* 图例 */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {[
          { color: '#F1F5F9', label: '未活跃' },
          { color: lightColor, label: '轻度活跃' },
          { color: activeColor, label: '高度活跃' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px', height: '12px',
              borderRadius: '3px',
              background: item.color,
            }} />
            <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* 活跃时间段文字 */}
      {data.today_ranges.length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#F8FAFC', 
          borderRadius: '12px',
          border: '1px solid #F1F5F9'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
            今日在线时段
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.today_ranges.map((range, i) => (
              <span key={i} style={{
                fontSize: '13px',
                fontWeight: 600,
                padding: '4px 12px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: activeColor,
                boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              }}>
                {range}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
