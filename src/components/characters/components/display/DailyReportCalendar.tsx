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
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const MIN_YEAR = 2024;

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

  const currentYearValue = new Date().getFullYear();
  const years = useMemo(() => {
    const result: number[] = [];
    for (let year = currentYearValue; year >= MIN_YEAR; year--) {
      result.push(year);
    }
    return result;
  }, [currentYearValue]);

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
      
      if (newYear >= MIN_YEAR) {
        onMonthChange(newYear, newMonth);
      }
      setIsAnimating(false);
    }, 150);
  };

  const handleNextMonth = () => {
    const today = new Date();
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
      return;
    }
    
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

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const canGoNext = !isCurrentMonth;
  const canGoPrev = currentYear > MIN_YEAR || (currentYear === MIN_YEAR && currentMonth > 0);

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isAnimating || !canGoPrev}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-1.5">
          <BarChart3 className="w-4 h-4 text-blue-500" />
          
          <select
            value={currentYear}
            onChange={(e) => onMonthChange(parseInt(e.target.value), currentMonth)}
            className="bg-transparent border-none text-base font-medium text-slate-800 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
          
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(currentYear, parseInt(e.target.value))}
            className="bg-transparent border-none text-base font-medium text-slate-800 cursor-pointer hover:bg-gray-100 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTH_NAMES.map((month, index) => {
              const isDisabled = 
                currentYear === today.getFullYear() && index > today.getMonth();
              
              return (
                <option key={index} value={index} disabled={isDisabled}>
                  {month}
                </option>
              );
            })}
          </select>
        </div>
        
        <button
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          disabled={isAnimating || !canGoNext}
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-center text-xs font-medium text-gray-500 py-0.5"
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="h-[336px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            initial={{ opacity: 0, x: direction === 'left' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 'left' ? -20 : 20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 gap-0.5 h-full"
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
                        ? 'cursor-pointer hover:scale-105 bg-blue-50' 
                        : 'cursor-default text-gray-300'}
                      ${day.isSelected 
                        ? 'bg-gradient-to-br from-[#FFE1E1] to-[#E3F4FF] text-slate-700 shadow-sm' 
                        : ''}
                      ${day.isToday && !day.isSelected 
                        ? 'ring-1.5 ring-blue-400 ring-offset-1' 
                        : ''}
                      ${day.hasReport && !day.isSelected
                        ? 'text-slate-700 hover:bg-blue-100'
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
      </div>

      <div className="flex items-center justify-center gap-3 mt-1.5 pt-1.5 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 h-4 rounded-md bg-blue-50" />
          <span>有日报</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 h-4 rounded-md ring-1.5 ring-blue-400 ring-offset-1" />
          <span>今天</span>
        </div>
      </div>
    </div>
  );
};
