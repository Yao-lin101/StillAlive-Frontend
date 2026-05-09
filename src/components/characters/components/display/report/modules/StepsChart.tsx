/**
 * StepsChart — 纯 CSS/SVG 步数柱状图
 *
 * 无数据时返回 null，不占位。
 */

import React from 'react';
import type { ReportStepsChart } from '../types';

interface StepsChartProps {
  data: ReportStepsChart;
  /** 图表高度（px），由外部主题控制 */
  barColor?: string;
  accentColor?: string;
}

export const StepsChart: React.FC<StepsChartProps> = ({
  data,
  barColor = 'rgba(99, 102, 241, 0.4)',
  accentColor = '#6366F1',
}) => {
  if (!data || !data.labels || data.labels.length === 0) return null;

  const maxVal = data.max_value || 1;
  const barCount = data.labels.length;

  return (
    <div style={{ width: '100%' }}>
      {/* 总步数标注 */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px',
        marginBottom: '16px',
      }}>
        <span style={{
          fontSize: '32px',
          fontWeight: 800,
          color: '#1E293B',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {data.total.toLocaleString()}
        </span>
        <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>步</span>
      </div>

      {/* 柱状图 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: barCount > 16 ? '2px' : '4px',
        height: '100px',
        width: '100%',
        paddingBottom: '4px',
        borderBottom: '1px solid #F1F5F9',
      }}>
        {data.values.map((val, i) => {
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          const isActive = val > 0;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
                height: '100%',
              }}
              title={`${data.labels[i]}：${val.toLocaleString()} 步`}
            >
              <div
                style={{
                  width: '100%',
                  height: `${Math.max(heightPct, isActive ? 4 : 0)}%`,
                  background: isActive
                    ? `linear-gradient(to top, ${barColor}, ${accentColor})`
                    : '#F1F5F9',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  minHeight: isActive ? '4px' : '0',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* X轴标签（只显示整点） */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '8px',
        padding: '0 2px',
      }}>
        {['00:00', '06:00', '12:00', '18:00', '24:00'].map(h => (
          <span key={h} style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>{h}</span>
        ))}
      </div>
    </div>
  );
};
