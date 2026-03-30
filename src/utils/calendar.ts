
import { Solar, EightChar } from 'lunar-javascript';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES, Ganji, Saju } from '../constants';

// 사주 명리학 기준인 23시 자시를 기준으로 날짜가 바뀌도록 설정합니다.
EightChar.setDayGanjiType(1);

export function getSolarTerm(year: number, month: number, day: number): string | null {
  const solar = Solar.fromYmd(year, month, day);
  const term = solar.getLunar().getJieQi();
  // getJieQi() returns the name if it's a solar term day, otherwise empty string
  return term || null;
}

function parseGanji(ganjiStr: string): Ganji {
  const stem = ganjiStr[0];
  const branch = ganjiStr[1];
  return {
    stem,
    branch,
    stemHangul: HEAVENLY_STEMS.find(s => s.hanja === stem)?.hangul || '',
    branchHangul: EARTHLY_BRANCHES.find(b => b.hanja === branch)?.hangul || ''
  };
}

export function getDayGanji(year: number, month: number, day: number): Ganji {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  return parseGanji(eightChar.getDay());
}

export function getFullSaju(year: number, month: number, day: number, hour: number): Saju {
  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  
  return {
    year: parseGanji(eightChar.getYear()),
    month: parseGanji(eightChar.getMonth()),
    day: parseGanji(eightChar.getDay()),
    hour: parseGanji(eightChar.getTime())
  };
}

export function getYearGanji(date: Date): Ganji {
  // 해당 월의 15일을 기준으로 대표 년주를 가져옵니다.
  // 1월은 전년도 년주가, 2월은 입춘 이후 신년 년주가 주로 표시되도록 합니다.
  const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, 15);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  return parseGanji(eightChar.getYear());
}

export function getMonthGanji(year: number, month: number): Ganji {
  // Use the 1st of the month to get the starting month Ganji
  const solar = Solar.fromYmd(year, month, 1);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  return parseGanji(eightChar.getMonth());
}

export function getMonthTransition(year: number, month: number): { day: number, term: string, nextGanji: Ganji } | null {
  // Find the "Jie" (节) solar term in the month that changes the Saju month
  for (let d = 1; d <= 31; d++) {
    try {
      const solar = Solar.fromYmd(year, month, d);
      if (solar.getMonth() !== month) break;
      
      const lunar = solar.getLunar();
      const jieQi = lunar.getJieQi();
      
      // List of "Jie" terms that change the month
      const jieTerms = ['입춘', '경칩', '청명', '입하', '망종', '소서', '입추', '백로', '한로', '입동', '대설', '소한'];
      
      if (jieQi && jieTerms.includes(jieQi)) {
        // 절기 시각 이후의 월건을 가져오기 위해 다음 날의 데이터를 사용합니다.
        // (오호돈법 등 월건 산출 로직이 정확히 반영되도록 함)
        const nextDaySolar = solar.next(1);
        const nextEightChar = nextDaySolar.getLunar().getEightChar();
        return {
          day: d,
          term: jieQi,
          nextGanji: parseGanji(nextEightChar.getMonth())
        };
      }
    } catch (e) {
      break;
    }
  }
  return null;
}

export function getLunarDate(year: number, month: number, day: number) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  return {
    month: Math.abs(lunar.getMonth()),
    day: lunar.getDay(),
    isLeap: lunar.getMonth() < 0
  };
}

export function isPublicHoliday(year: number, month: number, day: number): string | null {
  // Solar holidays
  if (month === 1 && day === 1) return '신정';
  if (month === 3 && day === 1) return '삼일절';
  if (month === 5 && day === 5) return '어린이날';
  if (month === 6 && day === 6) return '현충일';
  if (month === 8 && day === 15) return '광복절';
  if (month === 10 && day === 3) return '개천절';
  if (month === 10 && day === 9) return '한글날';
  if (month === 12 && day === 25) return '크리스마스';

  // Lunar holidays (Seollal, Chuseok, Buddha's Birthday)
  const lunar = getLunarDate(year, month, day);
  
  // Seollal (Lunar 1/1) + day before/after
  if (!lunar.isLeap) {
    if (lunar.month === 1 && lunar.day === 1) return '설날';
    // Check day before/after for Seollal
    const prevDay = Solar.fromYmd(year, month, day).next(-1).getLunar();
    if (prevDay.getMonth() === 1 && prevDay.getDay() === 1) return '설날 연휴';
    const nextDay = Solar.fromYmd(year, month, day).next(1).getLunar();
    if (nextDay.getMonth() === 1 && nextDay.getDay() === 1) return '설날 연휴';

    // Chuseok (Lunar 8/15) + day before/after
    if (lunar.month === 8 && lunar.day === 15) return '추석';
    const prevDayC = Solar.fromYmd(year, month, day).next(-1).getLunar();
    if (prevDayC.getMonth() === 8 && prevDayC.getDay() === 15) return '추석 연휴';
    const nextDayC = Solar.fromYmd(year, month, day).next(1).getLunar();
    if (nextDayC.getMonth() === 8 && nextDayC.getDay() === 15) return '추석 연휴';

    // Buddha's Birthday (Lunar 4/8)
    if (lunar.month === 4 && lunar.day === 8) return '부처님 오신 날';
  }

  return null;
}
