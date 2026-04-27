import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyReportCalendarProps {
  reportDates: number[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  currentYear: number;
  currentMonth: number;
  onMonthChange: (year: number, month: number) => void;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export const DailyReportCalendar: React.FC<DailyReportCalendarProps> = ({
  reportDates,
  selectedDate,
  onDateSelect,
  currentYear,
  currentMonth,
  onMonthChange
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    const days: Array<{
      day: number | null;
      isCurrentMonth: boolean;
      hasReport: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
    
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({
        day: null,
        isCurrentMonth: false,
        hasReport: false,
        isSelected: false,
        isToday: false
      });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const hasReport = reportDates.includes(day);
      const isSelected = !!(selectedDate 
        && selectedDate.getFullYear() === currentYear 
        && selectedDate.getMonth() === currentMonth 
        && selectedDate.getDate() === day);
      const isToday = isCurrentMonth && today.getDate() === day;
      
      days.push({
        day,
        isCurrentMonth: true,
        hasReport,
        isSelected,
        isToday
      });
    }
    
    return days;
  }, [currentYear, currentMonth, reportDates, selectedDate]);

  const handlePrevMonth = () => {
    setIsAnimating(true);
    setDirection('right');
    setTimeout(() => {
      let newYear = currentYear;
      let newMonth = currentMonth - 1;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      
      onMonthChange(newYear, newMonth);
      setIsAnimating(false);
    }, 150);
  };

  const handleNextMonth = () => {
    setIsAnimating(true);
    setDirection('left');
    setTimeout(() => {
      let newYear = currentYear;
      let newMonth = currentMonth + 1;
      
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      
      onMonthChange(newYear, newMonth);
      setIsAnimating(false);
    }, 150);
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    onDateSelect(date);
  };

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isAnimating}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        
        <h3 className="text-base font-medium text-slate-800 dark:text-white flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          {currentYear}年 {monthNames[currentMonth]}
        </h3>
        
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          disabled={isAnimating}
        >
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-0.5"
          >
            {weekday}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentYear}-${currentMonth}`}
          initial={{ opacity: 0, x: direction === 'left' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-0.5"
        >
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className="h-14 flex items-center justify-center"
            >
              {day.day !== null ? (
                <button
                  onClick={() => day.hasReport && handleDayClick(day.day!)}
                  disabled={!day.hasReport}
                  className={`
                    relative w-full h-full flex items-center justify-center rounded-md text-sm font-medium
                    transition-all duration-200
                    ${day.hasReport 
                      ? 'cursor-pointer hover:scale-105 bg-blue-50 dark:bg-blue-900/20' 
                      : 'cursor-default text-gray-300 dark:text-gray-700'}
                    ${day.isSelected 
                      ? 'bg-gradient-to-br from-[#FFE1E1] to-[#E3F4FF] dark:from-slate-600 dark:to-slate-700 text-slate-700 dark:text-white shadow-sm' 
                      : ''}
                    ${day.isToday && !day.isSelected 
                      ? 'ring-1.5 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-slate-800' 
                      : ''}
                    ${day.hasReport && !day.isSelected
                      ? 'text-slate-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : ''}
                  `}
                >
                  {day.day}
                </button>
              ) : (
                <div className="w-full h-full" />
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-center gap-3 mt-1.5 pt-1.5 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
          <span>有日报</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 h-4 rounded-md ring-1.5 ring-blue-400 dark:ring-blue-500 ring-offset-1 dark:ring-offset-slate-800" />
          <span>今天</span>
        </div>
      </div>
    </div>
  );
};
