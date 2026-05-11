import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { characterService } from '@/services/characterService';
import { DailyReportDetail } from '@/components/characters/components/display/DailyReportDetail';
import type { DailyReportDetail as DailyReportDetailType } from '@/types/character';
import { toast } from 'sonner';

export const DailyReportPage: React.FC = () => {
  const { code, date } = useParams<{ code: string; date: string }>();
  const [report, setReport] = useState<DailyReportDetailType | null>(null);
  const [characterName, setCharacterName] = useState<string>('');
  const [templateStyle, setTemplateStyle] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!code || !date) return;
      try {
        setIsLoading(true);
        // 并行获取报告详情、角色公开信息和配置（以获取模板风格）
        const [reportData, characterData, configData] = await Promise.all([
          characterService.getDailyReportDetail(code, date),
          characterService.getPublicDisplay(code).catch(() => null),
          characterService.getDailyReportConfigPublic(code).catch(() => null)
        ]);
        
        setReport(reportData);
        if (characterData?.name) {
          setCharacterName(characterData.name);
        }
        if (configData?.template_style) {
          setTemplateStyle(configData.template_style);
        }
      } catch (err) {
        console.error('Failed to fetch report or character:', err);
        toast.error('获取日报数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code, date]);

  // 更新浏览器标签标题
  useEffect(() => {
    if (characterName && date) {
      const llmTitle = report?.report_data?.llm?.title;
      if (llmTitle) {
        document.title = `${characterName} | ${llmTitle} | ${date}`;
      } else {
        document.title = `${characterName} 的日报 (${date})`;
      }
    } else {
      document.title = 'Loading Report... | StillAlive';
    }

    return () => {
      document.title = 'StillAlive';
    };
  }, [characterName, date, report?.report_data?.llm?.title]);

  // 轮询逻辑：如果日报还在分析中，则持续获取最新状态
  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const checkIncomplete = (r: DailyReportDetailType | null) => {
      const llm = r?.report_data?.llm;
      if (!llm || llm.version < 2) return false;
      const statuses = llm.sections_status || {};
      return Object.values(statuses).some(s =>
        s === 'pending' || s === 'updating'
      );
    };

    if (report && code && date && checkIncomplete(report)) {
      pollInterval = setInterval(async () => {
        try {
          const newData = await characterService.getDailyReportDetail(code, date);
          if (newData) {
            setReport(newData);
            if (!checkIncomplete(newData)) {
              if (pollInterval) clearInterval(pollInterval);
            }
          }
        } catch (err) {
          console.error('Polling failed:', err);
        }
      }, 4000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [report?.date, code, date, !!report]);

  // 锁定 body 滚动，防止移动端橡皮筋效果导致漏出底色
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalHeight = window.getComputedStyle(document.body).height;
    const originalHtmlStyle = window.getComputedStyle(document.documentElement).overflow;
    const originalHtmlHeight = window.getComputedStyle(document.documentElement).height;

    const originalBg = document.body.style.backgroundColor;
    const originalHtmlBg = document.documentElement.style.backgroundColor;

    document.body.style.overflow = 'hidden';
    document.body.style.height = '100%';
    document.body.style.backgroundColor = '#F8FAFC'; // 匹配页面背景色
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.height = '100%';
    document.documentElement.style.backgroundColor = '#F8FAFC';

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.height = originalHeight;
      document.body.style.backgroundColor = originalBg;
      document.documentElement.style.overflow = originalHtmlStyle;
      document.documentElement.style.height = originalHtmlHeight;
      document.documentElement.style.backgroundColor = originalHtmlBg;
    };
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden overscroll-none bg-[#F8FAFC] dark:bg-slate-950 w-full z-0">
      {/* 响应式主内容区：移动端铺满，桌面端限制宽度 */}
      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto min-h-0 overflow-hidden">
        <DailyReportDetail
          report={report}
          isLoading={isLoading}
          isOwner={false}
          templateStyle={templateStyle as any}
          variant="page"
          code={code}
        />
      </main>
    </div>
  );
};
