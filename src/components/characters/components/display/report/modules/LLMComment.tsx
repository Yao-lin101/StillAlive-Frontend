/**
 * LLMComment — LLM 评论渲染块
 *
 * 负责展示每个模块的 LLM 文字评论。
 * comment 为 null 时显示占位符（等待 AI 评论中...）。
 * showPlaceholder=false 时，comment 为 null 则完全不渲染。
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface LLMCommentProps {
  comment: string | null;
  /** 当前模块的分析状态 */
  status?: 'pending' | 'updating' | 'done' | 'error';
  /** 是否在 comment 为空时显示占位符，默认 true */
  showPlaceholder?: boolean;
  /** 占位符文案 */
  placeholder?: string;
  /** 文字颜色 */
  color?: string;
  /** 是否以 Markdown 渲染（默认 true） */
  useMarkdown?: boolean;
  /** 渲染风格 */
  variant?: 'default' | 'glass';
}

export const LLMComment: React.FC<LLMCommentProps> = ({
  comment,
  status = 'done',
  showPlaceholder = true,
  placeholder = 'AI 深度分析生成中...',
  color = '#334155',
  useMarkdown = true,
  variant = 'default',
}) => {
  const isUpdating = status === 'updating';
  const isError = status === 'error';

  if (isError) {
    return (
      <div style={{ padding: '12px', background: '#FEF2F2', borderRadius: '12px', border: '1px solid #FEE2E2', color: '#991B1B', fontSize: '13px' }}>
        分析模块加载失败，请刷新重试。
      </div>
    );
  }

  if (!comment || isUpdating) {
    if (!showPlaceholder) return null;
    return (
      <div style={{
        padding: '16px',
        background: variant === 'glass' ? 'rgba(255, 255, 255, 0.4)' : (isUpdating ? '#F1F5F9' : '#F8FAFC'),
        borderRadius: '12px',
        border: variant === 'glass' ? '1px solid rgba(255, 255, 255, 0.6)' : '1px dashed #E2E8F0',
        backdropFilter: variant === 'glass' ? 'blur(8px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        transition: 'all 0.3s ease',
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isUpdating ? '#6366F1' : '#94A3B8',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }} />
        <span style={{
          fontSize: '13px',
          color: isUpdating ? '#6366F1' : '#94A3B8',
          fontWeight: 500,
          fontStyle: 'italic',
        }}>
          {isUpdating ? '正在根据最新数据更新分析...' : placeholder}
        </span>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .3; }
          }
        `}</style>
      </div>
    );
  }

  if (useMarkdown) {
    return (
      <div
        className="llm-comment-md"
        style={{ 
          color, 
          fontSize: '15px', 
          lineHeight: 1.8,
          letterSpacing: '0.01em',
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p style={{ margin: '0 0 12px 0' }}>{children}</p>
            ),
            strong: ({ children }) => (
              <strong style={{ color: '#0F172A', fontWeight: 700 }}>
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em style={{ color: '#475569', fontStyle: 'italic' }}>{children}</em>
            ),
            ul: ({ children }) => (
              <ul style={{ margin: '0 0 12px 0', paddingLeft: '20px', listStyleType: 'disc' }}>{children}</ul>
            ),
            li: ({ children }) => (
              <li style={{ marginBottom: '4px' }}>{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote style={{ 
                margin: '16px 0', 
                padding: '12px 16px', 
                background: variant === 'glass' ? 'rgba(255, 255, 255, 0.3)' : '#F1F5F9', 
                borderLeft: variant === 'glass' ? '4px solid #6d9afa' : '4px solid #CBD5E1',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '14px',
              }}>
                {children}
              </blockquote>
            ),
          }}
        >
          {comment}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <p style={{ fontSize: '15px', color, lineHeight: 1.8, margin: 0 }}>
      {comment}
    </p>
  );
};
