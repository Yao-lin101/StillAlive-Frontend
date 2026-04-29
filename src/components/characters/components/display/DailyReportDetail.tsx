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
  ChevronLeft
} from 'lucide-react';

function normalizeMarkdownFormatting(text: string): string {
  if (!text) return text;
  
  let result = '';
  let inCodeBlock = false;
  
  // 按行处理，跳过代码块内的内容
  const lines = text.split('\n');
  for (const line of lines) {
    // 检查是否是代码块的开始或结束
    if (line.trim() === '```') {
      inCodeBlock = !inCodeBlock;
      result += line + '\n';
    } else if (inCodeBlock) {
      // 在代码块内，直接添加，不做处理
      result += line + '\n';
    } else {
      // 不在代码块内，处理粗体
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

interface DailyReportDetailProps {
  report: DailyReportDetailType | null;
  isLoading: boolean;
  isOwner: boolean;
  onHide?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
}

export const DailyReportDetail: React.FC<DailyReportDetailProps> = ({
  report,
  isLoading,
  isOwner,
  onHide,
  onDelete,
  onBack
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-500">
        <Calendar className="w-12 h-12 mb-4 opacity-50" />
        <p>该日期暂无日报数据</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-800">
            {report.date} 日报分析
          </h3>
          {report.is_hidden && (
            <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              已隐藏
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 pr-2 -mr-2">
        <Card className="p-6 bg-white">
          <div className="prose prose-slate max-w-none 
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
                      <code className="bg-gray-100 text-pink-600 px-2 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="text-sm font-mono text-slate-800 whitespace-pre-wrap">
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

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
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
