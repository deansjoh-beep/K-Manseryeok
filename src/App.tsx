import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  setYear,
  setMonth
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon, 
  Info, 
  X, 
  ArrowLeft,
  Search, 
  StickyNote, 
  Save, 
  Trash2,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { getDayGanji, getLunarDate, getSolarTerm, getFullSaju, isPublicHoliday, getMonthGanji, getYearGanji, getMonthTransition } from './utils/calendar';
import { Saju, EARTHLY_BRANCHES, HEAVENLY_STEMS, SOLAR_TERMS_HANJA } from './constants';
import { fetchHolidays, Holiday } from './services/kasiService';

const ELEMENT_COLORS: Record<string, string> = {
  wood: '#82c9a1', // light emerald
  fire: '#e57385', // pinkish red
  earth: '#f4cc70', // warm yellow
  metal: '#ffffff', // white
  water: '#5d6d7e', // greyish blue
};

const HanjaBox = ({ char, size = 'sm', className = "" }: { char: string, size?: 'sm' | 'lg', className?: string }) => {
  const stem = HEAVENLY_STEMS.find(s => s.hanja === char);
  const branch = EARTHLY_BRANCHES.find(b => b.hanja === char);
  const meta = stem || branch;
  
  if (!meta) return <span className="text-stone-800 dark:text-stone-200">{char}</span>;

  const bgColor = ELEMENT_COLORS[meta.element as string];
  const isYang = meta.polarity === 'yang';
  const isMetal = meta.element === 'metal';
  
  const boxSize = size === 'lg' ? 'w-[58px] h-[58px]' : 'w-[29px] h-[29px]';
  const svgSize = size === 'lg' ? 'w-10 h-10' : 'w-5 h-5';

  // Yin/Yang stroke weights: Yang is thick, Yin is thin
  const fontWeight = isYang ? '700' : '200';
  const strokeWidth = isYang ? '2' : '0.5';
  const textColor = isMetal ? '#5d6d7e' : 'white';
  const borderColor = isMetal ? 'border-sky-200' : 'border-black/5';

  return (
    <div 
      className={`${boxSize} flex items-center justify-center rounded-[1.2rem] shadow-sm border ${borderColor} ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      <svg viewBox="0 0 100 100" className={svgSize}>
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          fontSize="80"
          fontWeight={fontWeight}
          fill={textColor}
          stroke={textColor}
          strokeWidth={strokeWidth}
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          {char}
        </text>
      </svg>
    </div>
  );
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthGanjiExpanded, setIsMonthGanjiExpanded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [sajuData, setSajuData] = useState<Saju | null>(null);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [showReadme, setShowReadme] = useState(false);
  
  // Memo state
  const [memos, setMemos] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('k-calendar-memos');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentMemo, setCurrentMemo] = useState('');

  // Ganji Search state
  const [searchStem, setSearchStem] = useState('甲');
  const [searchBranch, setSearchBranch] = useState('子');
  const [searchResults, setSearchResults] = useState<Date[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchDate, setSearchDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [searchDateGanji, setSearchDateGanji] = useState<any>(null);
  const [preSearchDate, setPreSearchDate] = useState<Date | null>(null);

  // KASI Holidays state
  const [apiHolidays, setApiHolidays] = useState<Holiday[]>([]);

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('k-calendar-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('k-calendar-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const loadHolidays = async () => {
      const holidays = await fetchHolidays(currentDate.getFullYear(), currentDate.getMonth() + 1);
      setApiHolidays(holidays);
    };
    loadHolidays();
  }, [currentDate]);

  useEffect(() => {
    localStorage.setItem('k-calendar-memos', JSON.stringify(memos));
  }, [memos]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    setCurrentMemo(memos[dateKey] || '');
    const saju = getFullSaju(date.getFullYear(), date.getMonth() + 1, date.getDate(), selectedHour);
    setSajuData(saju);
    setShowDetail(true);
  };

  const saveMemo = () => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      if (currentMemo.trim()) {
        setMemos(prev => ({ ...prev, [dateKey]: currentMemo }));
      } else {
        const newMemos = { ...memos };
        delete newMemos[dateKey];
        setMemos(newMemos);
      }
    }
  };

  const deleteMemo = () => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const newMemos = { ...memos };
      delete newMemos[dateKey];
      setMemos(newMemos);
      setCurrentMemo('');
    }
  };

  const searchGanji = () => {
    const results: Date[] = [];
    const year = currentDate.getFullYear();
    // Search within the current year
    for (let m = 0; m < 12; m++) {
      const daysInMonth = endOfMonth(new Date(year, m, 1)).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, m, d);
        const ganji = getDayGanji(year, m + 1, d);
        if (ganji.stem === searchStem && ganji.branch === searchBranch) {
          results.push(date);
        }
      }
    }
    setSearchResults(results);
  };

  const deriveGanjiFromDate = () => {
    const date = new Date(searchDate);
    if (!isNaN(date.getTime())) {
      const ganji = getDayGanji(date.getFullYear(), date.getMonth() + 1, date.getDate());
      setSearchDateGanji(ganji);
    }
  };

  const toggleSearch = () => {
    if (!showSearch) {
      setPreSearchDate(currentDate);
    }
    setShowSearch(!showSearch);
  };

  const goBackToPreSearch = () => {
    if (preSearchDate) {
      setCurrentDate(preSearchDate);
      setPreSearchDate(null);
      setShowSearch(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      const saju = getFullSaju(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate(), selectedHour);
      setSajuData(saju);
    }
  }, [selectedHour]);

  const years = Array.from({ length: 101 }, (_, i) => 1950 + i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans p-4 md:p-8 ${darkMode ? 'bg-stone-950 text-stone-200' : 'bg-stone-50 text-stone-900'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <HanjaBox char={getYearGanji(currentDate).stem} size="lg" className="rounded-r-none border-r-0" />
              <HanjaBox char={getYearGanji(currentDate).branch} size="lg" className="rounded-l-none" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button 
              onClick={() => setShowReadme(true)}
              className="p-2 bg-white dark:bg-stone-900 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              title="도움말 및 정보"
            >
              <Info className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleSearch}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm border text-sm font-bold transition-colors ${showSearch ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'}`}
            >
              <Search className="w-4 h-4" />
              {showSearch ? '검색 닫기' : '검색하기'}
            </button>
            
            <div className="flex items-center gap-4 bg-white dark:bg-stone-900 p-2 rounded-xl shadow-sm border border-stone-200 dark:border-stone-800">
              <select 
                value={currentDate.getFullYear()} 
                onChange={(e) => setCurrentDate(setYear(currentDate, parseInt(e.target.value)))}
                className="bg-transparent font-medium focus:outline-none cursor-pointer px-2 dark:text-white"
              >
                {years.map(y => <option key={y} value={y} className="dark:bg-stone-900">{y}년</option>)}
              </select>
              <select 
                value={currentDate.getMonth()} 
                onChange={(e) => setCurrentDate(setMonth(currentDate, parseInt(e.target.value)))}
                className="bg-transparent font-medium focus:outline-none cursor-pointer px-2 dark:text-white"
              >
                {months.map(m => <option key={m} value={m} className="dark:bg-stone-900">{m + 1}월</option>)}
              </select>
              <div className="flex gap-1 border-l border-stone-200 dark:border-stone-800 pl-2">
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2 py-1 text-xs font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors mr-1"
                >
                  오늘
                </button>
                <button onClick={prevMonth} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors dark:text-stone-400">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors dark:text-stone-400">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Ganji Search Panel */}
        <AnimatePresence>
          {showSearch && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-8 bg-white dark:bg-stone-900 rounded-2xl shadow-lg border border-stone-200 dark:border-stone-800 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-stone-800 dark:text-white">검색 및 도출</h2>
                  {preSearchDate && (
                    <button 
                      onClick={goBackToPreSearch}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      검색 이전으로 돌아가기
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Ganji to Date Search */}
                  <div>
                    <h3 className="text-sm font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                      <Search className="w-4 h-4 text-emerald-600" />
                      {currentDate.getFullYear()}년 일진(日辰)으로 날짜 찾기
                    </h3>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">천간</label>
                        <select 
                          value={searchStem}
                          onChange={(e) => setSearchStem(e.target.value)}
                          className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        >
                          {HEAVENLY_STEMS.map(s => <option key={s.hanja} value={s.hanja} className="dark:bg-stone-800">{s.hanja}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">지지</label>
                        <select 
                          value={searchBranch}
                          onChange={(e) => setSearchBranch(e.target.value)}
                          className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        >
                          {EARTHLY_BRANCHES.map(b => <option key={b.hanja} value={b.hanja} className="dark:bg-stone-800">{b.hanja}</option>)}
                        </select>
                      </div>
                      <button 
                        onClick={searchGanji}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                      >
                        검색
                      </button>
                    </div>

                    {searchResults.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <p className="text-xs font-bold text-stone-500 mb-2">검색 결과: {searchResults.length}건</p>
                        <div className="flex flex-wrap gap-2">
                          {searchResults.map((date, idx) => (
                            <button 
                              key={idx}
                              onClick={() => {
                                setCurrentDate(date);
                                handleDateClick(date);
                              }}
                              className="bg-stone-100 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-stone-700 dark:text-stone-300 hover:text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              {format(date, 'yyyy년 MM월 dd일')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Date to Ganji Derivation */}
                  <div className="border-l border-stone-100 dark:border-stone-800 pl-0 md:pl-8">
                    <h3 className="text-sm font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-emerald-600" />
                      날짜로 일진(日辰) 도출하기
                    </h3>
                    <div className="flex flex-wrap items-end gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">날짜 선택</label>
                        <input 
                          type="date"
                          value={searchDate}
                          onChange={(e) => setSearchDate(e.target.value)}
                          className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                        />
                      </div>
                      <button 
                        onClick={deriveGanjiFromDate}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                      >
                        도출하기
                      </button>
                    </div>

                    {searchDateGanji && (
                      <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
                        <div className="flex items-center gap-4">
                          <div className="flex">
                            <HanjaBox char={searchDateGanji.stem} className="rounded-r-none border-r-0 w-12 h-12 text-xl" />
                            <HanjaBox char={searchDateGanji.branch} className="rounded-l-none w-12 h-12 text-xl" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-stone-800 dark:text-white">
                              {searchDateGanji.stemHangul}{searchDateGanji.branchHangul} ({searchDateGanji.stem}{searchDateGanji.branch})
                            </p>
                            <button 
                              onClick={() => {
                                const date = new Date(searchDate);
                                setCurrentDate(date);
                                handleDateClick(date);
                              }}
                              className="text-xs text-emerald-600 font-bold hover:underline mt-1"
                            >
                              달력에서 보기
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Month Ganji Table */}
        <div className="mb-8 bg-white dark:bg-stone-900 rounded-3xl shadow-xl border border-stone-200 dark:border-stone-800 p-6">
          <button 
            onClick={() => setIsMonthGanjiExpanded(!isMonthGanjiExpanded)}
            className="w-full flex items-center justify-between text-xl font-bold text-stone-800 dark:text-white group"
          >
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              {currentDate.getFullYear()}년 월별 간지
            </div>
            <div className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
              {isMonthGanjiExpanded ? <ChevronUp className="w-6 h-6 text-stone-400" /> : <ChevronDown className="w-6 h-6 text-stone-400" />}
            </div>
          </button>

          <AnimatePresence>
            {isMonthGanjiExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                    <div className="grid grid-cols-12 bg-black border-b border-stone-800">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={`month-label-${i}`} className="py-2 text-center text-2xl font-bold text-white border-r border-stone-800 last:border-r-0">
                          {i + 1}월
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-12 bg-white dark:bg-stone-900">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const month = i + 1;
                        const ganji = getMonthGanji(currentDate.getFullYear(), month);
                        const transition = getMonthTransition(currentDate.getFullYear(), month);
                        const isTodayMonth = new Date().getFullYear() === currentDate.getFullYear() && new Date().getMonth() === i;
                        return (
                          <div 
                            key={`month-ganji-${i}`} 
                            className={`p-3 flex flex-col items-center justify-center gap-2 border-r border-stone-200 dark:border-stone-800 last:border-r-0 ${isTodayMonth ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/30 dark:bg-emerald-900/10' : ''}`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex">
                                <HanjaBox char={ganji.stem} className="rounded-r-none border-r-0 scale-90" />
                                <HanjaBox char={ganji.branch} className="rounded-l-none scale-90" />
                              </div>
                              <span className="text-[9px] font-bold text-stone-400">초순</span>
                            </div>
                            
                            {transition && (
                              <div className="flex flex-col items-center gap-1 mt-1 pt-1 border-t border-stone-100 dark:border-stone-800 w-full">
                                <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 mb-1">
                                  <span>{transition.day}일 ({transition.term})</span>
                                  <ChevronDown className="w-2 h-2" />
                                </div>
                                <div className="flex">
                                  <HanjaBox char={transition.nextGanji.stem} className="rounded-r-none border-r-0 scale-75" />
                                  <HanjaBox char={transition.nextGanji.branch} className="rounded-l-none scale-75" />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 overflow-hidden">
          {/* Weekdays */}
          <div className="grid grid-cols-7 bg-black border-b border-stone-800">
            {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
              <div key={day} className={`py-3 text-center text-2xl font-bold uppercase tracking-wider ${i === 0 ? 'text-red-300' : i === 6 ? 'text-blue-300' : 'text-white'}`}>
                {day}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, i) => {
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, monthStart);
              const dayOfWeek = date.getDay();
              const ganji = getDayGanji(date.getFullYear(), date.getMonth() + 1, date.getDate());
              const lunar = getLunarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
              const solarTerm = getSolarTerm(date.getFullYear(), date.getMonth() + 1, date.getDate());
              
              const dateKey = format(date, 'yyyy-MM-dd');
              const hasMemo = !!memos[dateKey];
              
              // Check for holidays (Local + API)
              const localHoliday = isPublicHoliday(date.getFullYear(), date.getMonth() + 1, date.getDate());
              const apiHoliday = apiHolidays.find(h => h.locdate === parseInt(format(date, 'yyyyMMdd')));
              const holidayName = apiHoliday?.dateName || localHoliday;
              const isHoliday = !!holidayName;

              return (
                <motion.div
                  key={date.toString()}
                  whileHover={{ backgroundColor: darkMode ? '#1c1917' : '#f8fafc' }}
                  onClick={() => handleDateClick(date)}
                  className={`min-h-[100px] md:min-h-[120px] p-2 border-t border-r border-stone-100 dark:border-stone-800 cursor-pointer transition-colors relative flex flex-col
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                    ${isToday ? 'bg-emerald-50/50 dark:bg-emerald-900/10 ring-2 ring-emerald-500 ring-inset z-10' : ''}
                    ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}
                  `}
                >
                  {/* Solar Term - Top Left */}
                  {solarTerm && (
                    <div className="absolute top-2 left-2 text-[10px] text-emerald-600 font-bold">
                      {SOLAR_TERMS_HANJA[solarTerm] || solarTerm}
                    </div>
                  )}

                  {/* Lunar Date - Top Right */}
                  <div className="absolute top-2 right-2 text-[10px] text-stone-400 font-medium">
                    {lunar.month}.{String(lunar.day).padStart(2, '0')}{lunar.isLeap ? ' 윤' : ''}
                  </div>

                  <div className="flex-1 flex items-center justify-center">
                    {/* Solar Date - Centered, 1.5x Larger (text-4xl) */}
                    <div className={`text-4xl font-bold ${isHoliday || dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-stone-700 dark:text-stone-300'}`}>
                      {format(date, 'd')}
                    </div>
                  </div>

                  {/* Spacer for Hanja row height (h-6) to keep solar date centered in remaining space */}
                  <div className="h-6" />

                  {/* Ganji (Hanja Box) - Bottom Left */}
                  <div className="absolute bottom-2 left-2 flex">
                    <HanjaBox char={ganji.stem} className="rounded-r-none border-r-0" />
                    <HanjaBox char={ganji.branch} className="rounded-l-none" />
                  </div>

                  {/* Holiday Name - Bottom Right */}
                  {holidayName && (
                    <div className="absolute bottom-2 right-2 text-[9px] font-bold text-red-500 text-right max-w-[50px] leading-tight">
                      {holidayName}
                    </div>
                  )}

                  {hasMemo && (
                    <div className="absolute top-1/2 left-1 -translate-y-1/2">
                      <StickyNote className="w-3 h-3 text-amber-400 opacity-60" />
                    </div>
                  )}

                  {isToday && (
                    <div className="absolute bottom-1 right-1/2 translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Sidebar / Modal */}
      <AnimatePresence>
        {showDetail && selectedDate && sajuData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetail(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-200 dark:border-stone-800"
            >
              <div className="bg-stone-900 dark:bg-black p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{format(selectedDate, 'yyyy년 MM월 dd일')}</h2>
                  <p className="text-stone-400 text-sm">사주팔자 상세 분석</p>
                </div>
                <button 
                  onClick={() => setShowDetail(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8">
                <div className="flex flex-col gap-6">
                  {/* Memo Section */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                    <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <StickyNote className="w-4 h-4" />
                      오늘의 메모
                    </h3>
                    <textarea 
                      value={currentMemo}
                      onChange={(e) => setCurrentMemo(e.target.value)}
                      placeholder="이 날의 특별한 일이나 메모를 기록하세요..."
                      className="w-full h-24 bg-white/50 dark:bg-stone-800/50 border border-amber-200 dark:border-amber-900/30 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none dark:text-white"
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button 
                        onClick={deleteMemo}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="메모 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={saveMemo}
                        className="flex items-center gap-2 bg-amber-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        저장하기
                      </button>
                    </div>
                  </div>

                  {/* Hour Selector */}
                  <div className="flex items-center justify-between bg-stone-50 dark:bg-stone-800 p-3 rounded-2xl border border-stone-100 dark:border-stone-700">
                    <span className="text-sm font-bold text-stone-600 dark:text-stone-400">태어난 시각</span>
                    <select 
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(parseInt(e.target.value))}
                      className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i} className="dark:bg-stone-900">{i}시 ({Math.floor(((i + 1) % 24) / 2) === 0 ? '子' : EARTHLY_BRANCHES[Math.floor(((i + 1) % 24) / 2)].hanja}시)</option>
                      ))}
                    </select>
                  </div>

                  {/* Saju Grid */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: '시주', data: sajuData.hour },
                      { label: '일주', data: sajuData.day },
                      { label: '월주', data: sajuData.month },
                      { label: '년주', data: sajuData.year },
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{item.label}</span>
                        <div className="w-full aspect-[2/3] bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 flex flex-col items-center justify-center shadow-sm">
                          <HanjaBox char={item.data.stem} size="lg" className="rounded-b-none border-b-0" />
                          <HanjaBox char={item.data.branch} size="lg" className="rounded-t-none" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Info Box */}
                  <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/30 flex gap-3">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        만세력의 월건(月建)은 절기를 기준으로 계산되었습니다. 
                        사주 분석은 한국 표준시 및 전통 역법을 따릅니다.
                      </p>
                      <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 italic">
                        * 월별 간지는 절기(입춘, 대설 등)를 기점으로 바뀝니다. 
                        1969년 12월의 경우, 12월 7일(대설) 전까지는 을해(乙亥)월, 이후는 병자(丙子)월입니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-12 pb-8 border-t border-stone-200 dark:border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-stone-500 dark:text-stone-400 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-bold text-emerald-600 font-calligraphy text-lg">萬歲曆</span>
          <span>© 2026 현대 명리학 달력</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setShowReadme(true)}
            className="hover:text-emerald-600 transition-colors flex items-center gap-1 font-medium"
          >
            <Info className="w-4 h-4" />
            도움말 및 산출 로직 보기
          </button>
          <button 
            onClick={() => window.open('/saju_rules.json', '_blank')}
            className="hover:text-emerald-600 transition-colors flex items-center gap-1"
          >
            명리 규칙(JSON) 보기
          </button>
        </div>
      </footer>

      {/* README Modal */}
      <AnimatePresence>
        {showReadme && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-stone-900 w-full max-w-3xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 dark:border-stone-800"
            >
              <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-950">
                <div className="flex items-center gap-3">
                  <Info className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-bold dark:text-white">도움말 및 산출 로직</h2>
                </div>
                <button 
                  onClick={() => setShowReadme(false)}
                  className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-full transition-colors dark:text-stone-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto prose dark:prose-invert max-w-none prose-emerald">
                <ReactMarkdown>
                  {`# 萬歲曆 (K-Calendar)

현대 명리학의 체용(體用) 변화 원칙과 정밀한 천문 데이터를 결합한 **현대식 만세력 달력**입니다.

## 1. 개요
본 애플리케이션은 전통적인 만세력의 원리를 충실히 따르면서도, 현대적인 UI/UX와 정밀한 로직을 통해 사용자에게 정확한 사주 정보를 제공합니다. 특히 절기(節氣)를 기준으로 한 월건(月建) 변화를 시각적으로 명확히 구현하였습니다.

---

## 2. 음력 및 절기 표시 규칙

### 음력 데이터 (Lunar Date)
*   **정확도**: \`lunar-javascript\` 라이브러리를 사용하여 한국 표준시 기준의 정밀한 음력 데이터를 산출합니다.
*   **표기 방식**: 달력의 각 날짜 우측 상단에 \`월.일\` 형태로 표시됩니다. (예: 1.15)
*   **윤달 표시**: 해당 월이 윤달인 경우 숫자 뒤에 **'윤'**이라는 표기를 추가하여 구분합니다.

### 24절기 (Solar Terms)
*   **표기**: 절기가 해당하는 날짜 좌측 상단에 한자(漢字)로 표시됩니다. (예: 立春, 雨水)
*   **기준**: 태양의 황경을 기준으로 계산된 정밀한 시각을 바탕으로 해당 날짜를 특정합니다.

---

## 3. 만세력 산출 로직 (Saju Logic)

사주(四柱)의 네 기둥인 년, 월, 일, 시주를 계산하는 핵심 로직은 다음과 같습니다.
 
 #### 오호돈법 (五虎遁法) 및 오시돈법 (五鼠遁法) 반영
 *   **월건(月建) 산출**: 년간(年干)을 기준으로 월간(月干)을 정하는 **오호돈법**을 엄격히 준수합니다. (예: 甲/己년의 인월은 丙寅월)
 *   **시주(時柱) 산출**: 일간(日干)을 기준으로 시간(時干)을 정하는 **오시돈법**을 적용합니다.
 *   **야자시/조자시**: 본 앱은 현대 명리학의 표준에 따라 **23시(子時)를 기점으로 일진이 바뀌는 방식**을 기본으로 채택하고 있습니다.

### 년주 (Year Ganji)
*   단순히 양력 1월 1일이나 음력 1월 1일을 기준으로 하지 않습니다.
*   명리학의 전통에 따라 **입춘(立春)** 절기가 들어오는 시각을 기준으로 한 해의 시작을 결정합니다.

### 월주 (Month Ganji)
*   **절기 기준**: 매월의 시작은 24절기 중 **절(節)**에 해당하는 12개 절기를 기준으로 합니다.
    *   *입춘, 경칩, 청명, 입하, 망종, 소서, 입추, 백로, 한로, 입동, 대설, 소한*
*   **전환점 표시**: 본 달력은 월별 간지 테이블에서 해당 월의 절기 전환일과 전환 전/후의 간지를 모두 시각화하여 보여줍니다.

### 일주 (Day Ganji)
*   60갑자의 순환 주기에 따라 계산됩니다.
*   한국 표준시(KST)를 기준으로 자정(00:00)에 일진이 변경되는 것을 원칙으로 합니다.

### 시주 (Hour Ganji)
*   **일간(日干) 기준**: 해당 날짜의 일간에 따라 시주의 천간이 결정되는 '시두법(時頭法)'을 적용합니다.
*   **시간대**: 24시간을 12개의 지지(地支)로 나누어 2시간 단위로 계산합니다. (자시, 축시, 인시 등)

---

## 4. 현대 명리학의 체용(體用) 변화 적용

본 만세력은 현대 명리학에서 강조하는 **체용 변화(體용 變化)** 원칙을 데이터 구조에 반영하였습니다. (\`saju_rules.json\` 참조)

*   **천간**: 임(壬)과 계(癸)의 음양 성질을 현대적 해석에 따라 조정하여 적용합니다.
*   **지지**: 자(子), 사(巳), 오(午), 해(亥)의 경우, 본래의 오행 성질과 실제 사용되는 음양의 쓰임(체용)이 다른 점을 고려하여 분석 로직에 반영하였습니다.
*   **시각화**: 양(陽)의 기운은 굵은 획으로, 음(陰)의 기운은 가는 획으로 표현하여 시각적으로도 오행의 강약을 느낄 수 있도록 설계되었습니다.

---

## 5. 주요 기능 및 기술 스택

*   **공공데이터 포털 API 연동**: 한국천문연구원(KASI)의 특일 정보 API를 통해 공휴일 및 대체 공휴일을 실시간으로 반영합니다.
*   **다크 모드 지원**: 사용자의 환경에 맞춘 시각적 편의성을 제공합니다.
*   **검색 기능**: 특정 연도와 월로 즉시 이동할 수 있는 빠른 검색 기능을 제공합니다.
*   **서체 디자인**: 제목 및 주요 강조 부문에 'East Sea Dokdo' 서체를 사용하여 전통 서예의 느낌을 살렸습니다.

---

## 6. 라이선스 및 참조
본 프로젝트는 명리학의 대중화와 현대화를 위해 제작되었습니다. 상세한 로직 및 규칙은 소스 코드 내의 \`saju_rules.json\` 및 \`src/utils/calendar.ts\`를 참조하시기 바랍니다.`}
                </ReactMarkdown>
              </div>
              <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
                <button 
                  onClick={() => setShowReadme(false)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-none"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
