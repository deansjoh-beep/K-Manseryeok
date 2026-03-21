
/**
 * KASI (Korea Astronomy and Space Science Institute) API Service
 * Documentation: https://www.data.go.kr/data/15012690/openapi.do
 */

const KASI_BASE_URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';

export interface Holiday {
  dateName: string;
  isHoliday: string;
  locdate: number; // YYYYMMDD
}

export async function fetchHolidays(year: number, month: number): Promise<Holiday[]> {
  const apiKey = import.meta.env.VITE_KASI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_KASI_API_KEY') {
    console.warn('KASI_API_KEY is not configured. Using local holiday logic.');
    return [];
  }

  try {
    const monthStr = month.toString().padStart(2, '0');
    const url = `${KASI_BASE_URL}/getHoliDeInfo?serviceKey=${apiKey}&solYear=${year}&solMonth=${monthStr}&_type=json`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('KASI API request failed');
    
    const data = await response.json();
    const items = data.response?.body?.items?.item;
    
    if (!items) return [];
    return Array.isArray(items) ? items : [items];
  } catch (error) {
    console.error('Error fetching holidays from KASI:', error);
    return [];
  }
}
