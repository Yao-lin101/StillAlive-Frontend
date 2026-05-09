import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { characterService } from '@/services/characterService';
import { DailyReportDetail } from '@/components/characters/components/display/DailyReportDetail';
import type { DailyReportDetail as DailyReportDetailType } from '@/types/character';
import { toast } from 'sonner';

export const DailyReportPage: React.FC = () => {
  const { code, date } = useParams<{ code: string; date: string }>();
  const [report, setReport] = useState<DailyReportDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!code || !date) return;
      try {
        setIsLoading(true);
        const reportData = await characterService.getDailyReportDetail(code, date);
        setReport(reportData);
      } catch (err) {
        console.error('Failed to fetch report or character:', err);
        toast.error('获取日报数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [code, date]);

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex flex-col">
      {/* 极简主内容区 */}
      <main className="flex-1 flex flex-col w-full max-w-5xl mx-auto p-2 md:p-6 h-screen overflow-hidden">
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="flex-1 p-0">
            <DailyReportDetail
              report={report}
              isLoading={isLoading}
              isOwner={false}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
