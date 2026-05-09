import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { DailyReportDetail as DailyReportDetailType } from '@/types/character';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
} from 'lucide-react';
import { ReportRenderer } from './report/ReportRenderer';
import type { TemplateStyle } from './report/types';

// ── Markdown 粗体兼容处理 ─────────────────────────────────────────
function normalizeMarkdownFormatting(text: string): string {
  if (!text) return text;

  let result = '';
  let inCodeBlock = false;

  const lines = text.split('\n');
  for (const line of lines) {
    if (line.trim() === '```') {
      inCodeBlock = !inCodeBlock;
      result += line + '\n';
    } else if (inCodeBlock) {
      result += line + '\n';
    } else {
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*([「『【（][^\*]*?[」』】）])\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*\*([^\*？！，。、]+?[？！，。、]*?)\*\*/g, (match, content) => {
        const trimmedContent = content.trim();
        if (trimmedContent.length === 0) return match;
        return `<strong>${trimmedContent}</strong>`;
      });
      result += processedLine + '\n';
    }
  }

  return result.trim();
}

// ── 组件 Props ────────────────────────────────────────────────────
interface DailyReportDetailProps {
  report: DailyReportDetailType | null;
  isLoading: boolean;
  isOwner: boolean;
  onHide?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  /** 模板风格，可从外部传入覆盖 */
  templateStyle?: TemplateStyle;
}

export const DailyReportDetail: React.FC<DailyReportDetailProps> = ({
  report,
  isLoading,
  isOwner,
  onHide,
  onDelete,
  onBack,
  templateStyle = 'default',
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 判断是否有结构化数据可用
  const hasReportData = Boolean(
    report?.report_data &&
    Object.keys(report.report_data).length > 0
  );

  // ── 加载状态 ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  // ── 无数据状态 ──────────────────────────────────────────────────
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
        <Calendar className="w-12 h-12 mb-4 opacity-50" />
        <p>该日期暂无日报数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── 内容区 (由内部模板控制滚动) ───────────────────────── */}
      <div className="flex-1 min-h-0 flex flex-col">
        {hasReportData ? (
          <ReportRenderer
            data={report.report_data!}
            date={report.date}
            templateStyle={(templateStyle === 'default' && report.template_style) ? (report.template_style as TemplateStyle) : templateStyle}
          />
        ) : (
          /* Markdown 原文视图（降级 / 回退） */
          <div className="h-full overflow-y-auto pr-1 custom-scrollbar">
            <Card className="p-6 bg-white">
              <div className="prose prose-slate max-w-none break-words
                prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-0
                prose-h1:text-slate-800
                prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:mt-6
                prose-h2:text-slate-800
                prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2 prose-h3:mt-4
                prose-h3:text-slate-800
                prose-p:text-slate-700
                prose-li:text-slate-700
                prose-strong:text-slate-800
                prose-a:text-blue-600
                prose-ul:list-disc prose-ul:pl-6
                prose-ol:list-decimal prose-ol:pl-6
                prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:pl-4 prose-blockquote:italic
                prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-blue-50">{children}</thead>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-700 border-b-2 border-blue-200">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-3 text-sm text-slate-700 border-b border-gray-100 hover:bg-gray-50">
                        {children}
                      </td>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-4 overflow-x-auto">
                        {children}
                      </pre>
                    ),
                    code: ({ className, children }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="bg-gray-100 text-pink-600 px-2 py-0.5 rounded text-sm font-mono break-all">
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className="text-sm font-mono text-slate-800 whitespace-pre-wrap break-all">
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {normalizeMarkdownFormatting(report.markdown || report.error || '暂无分析内容')}
                </ReactMarkdown>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* ── 底部操作按钮 ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
        <div>
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="text-xs h-9 bg-white"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> 返回日历
            </Button>
          )}
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onHide}
              className="text-xs h-9 bg-white"
            >
              {report.is_hidden ? (
                <><Eye className="w-4 h-4 mr-1" /> 显示</>
              ) : (
                <><EyeOff className="w-4 h-4 mr-1" /> 隐藏</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs h-9 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-1" /> 删除
            </Button>
          </div>
        )}
      </div>

      {/* ── 删除确认弹窗 ─────────────────────────────────────────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.5)' }}>
          <Card className="max-w-sm w-full p-6">
            <h4 className="font-medium text-slate-800 mb-2">
              确认删除日报？
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              删除后无法恢复，确定要删除 {report.date} 的日报吗？
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                取消
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onDelete?.();
                  setShowDeleteConfirm(false);
                }}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                确认删除
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
