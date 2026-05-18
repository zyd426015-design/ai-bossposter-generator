import React, { useState } from "react";
import { format, addDays, subDays, isSameDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { zhCN } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { HOLIDAYS, SOLAR_TERMS } from "../lib/holidays";
import { cn } from "../lib/utils";

interface CalendarSelectorProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export function CalendarSelector({ selectedDate, onChange }: CalendarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const handlePrevDay = () => onChange(subDays(selectedDate, 1));
  const handleNextDay = () => onChange(addDays(selectedDate, 1));

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const weekDays = ["一", "二", "三", "四", "五", "六", "日"];

  const getDayLabel = (date: Date) => {
    const monthDay = format(date, "MM-dd");
    const holiday = HOLIDAYS.find((h) => h.date === monthDay);
    if (holiday) return holiday.name;
    const solarTerm = SOLAR_TERMS.find((s) => s.date === monthDay);
    if (solarTerm) return solarTerm.name;
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 mb-6 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={handlePrevDay}
          className="p-2 text-stone-400 hover:text-[#C91F37] hover:bg-stone-50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div 
          className="flex items-center gap-2 cursor-pointer group select-none"
          onClick={() => {
            setIsOpen(!isOpen);
            setCurrentMonth(startOfMonth(selectedDate));
          }}
        >
          <CalendarIcon className="w-5 h-5 text-[#D4AF37] group-hover:text-[#C91F37] transition-colors" />
          <span className="text-lg font-bold text-stone-800 font-serif tracking-wide">
            {format(selectedDate, "yyyy年MM月dd日", { locale: zhCN })}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
        </div>

        <button
          onClick={handleNextDay}
          className="p-2 text-stone-400 hover:text-[#C91F37] hover:bg-stone-50 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="p-4 border-t border-stone-100 bg-stone-50/50">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1.5 text-stone-500 hover:text-[#C91F37] hover:bg-stone-200 rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            <span className="font-medium text-stone-700">{format(currentMonth, "yyyy年MM月", { locale: zhCN })}</span>
            <button onClick={handleNextMonth} className="p-1.5 text-stone-500 hover:text-[#C91F37] hover:bg-stone-200 rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-medium text-stone-400 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const label = getDayLabel(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    onChange(day);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center py-1.5 rounded-lg transition-all min-h-[48px]",
                    !isCurrentMonth && "opacity-30",
                    isSelected 
                      ? "bg-[#C91F37] text-white shadow-md" 
                      : "hover:bg-stone-200 text-stone-700"
                  )}
                  style={!isSelected && label ? { backgroundColor: "rgba(254, 242, 242, 0.5)", color: "#C91F37" } : {}}
                >
                  <span className={cn("text-sm", isSelected ? "font-bold" : (!isCurrentMonth ? "font-normal" : "font-medium"))}>
                    {format(day, "d")}
                  </span>
                  {label && (
                    <span className={cn(
                      "text-[10px] mt-0.5 leading-tight truncate w-full px-0.5 text-center",
                      isSelected ? "text-red-100 font-medium" : "text-[#C91F37] font-medium"
                    )}>
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
