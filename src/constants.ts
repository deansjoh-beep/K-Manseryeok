
export const HEAVENLY_STEMS = [
  { hanja: '甲', hangul: '갑', element: 'wood', polarity: 'yang' },
  { hanja: '乙', hangul: '을', element: 'wood', polarity: 'yin' },
  { hanja: '丙', hangul: '병', element: 'fire', polarity: 'yang' },
  { hanja: '丁', hangul: '정', element: 'fire', polarity: 'yin' },
  { hanja: '戊', hangul: '무', element: 'earth', polarity: 'yang' },
  { hanja: '己', hangul: '기', element: 'earth', polarity: 'yin' },
  { hanja: '庚', hangul: '경', element: 'metal', polarity: 'yang' },
  { hanja: '辛', hangul: '신', element: 'metal', polarity: 'yin' },
  { hanja: '壬', hangul: '임', element: 'water', polarity: 'yin' },
  { hanja: '癸', hangul: '계', element: 'water', polarity: 'yang' },
];

export const EARTHLY_BRANCHES = [
  { hanja: '子', hangul: '자', animal: '쥐', element: 'water', polarity: 'yin' },
  { hanja: '丑', hangul: '축', animal: '소', element: 'earth', polarity: 'yin' },
  { hanja: '寅', hangul: '인', animal: '호랑이', element: 'wood', polarity: 'yang' },
  { hanja: '卯', hangul: '묘', animal: '토끼', element: 'wood', polarity: 'yin' },
  { hanja: '辰', hangul: '진', animal: '용', element: 'earth', polarity: 'yang' },
  { hanja: '巳', hangul: '사', animal: '뱀', element: 'fire', polarity: 'yang' },
  { hanja: '午', hangul: '오', animal: '말', element: 'fire', polarity: 'yin' },
  { hanja: '未', hangul: '미', animal: '양', element: 'earth', polarity: 'yin' },
  { hanja: '申', hangul: '신', animal: '원숭이', element: 'metal', polarity: 'yang' },
  { hanja: '酉', hangul: '유', animal: '닭', element: 'metal', polarity: 'yin' },
  { hanja: '戌', hangul: '술', animal: '개', element: 'earth', polarity: 'yang' },
  { hanja: '亥', hangul: '해', animal: '돼지', element: 'water', polarity: 'yang' },
];

export const SOLAR_TERMS = [
  '소한', '대한', '입춘', '우수', '경칩', '춘분', '청명', '곡우', '입하', '소만', '망종', '하지',
  '소서', '대서', '입추', '처서', '백로', '추분', '한로', '상강', '입동', '소설', '대설', '동지'
];

export const SOLAR_TERMS_HANJA: Record<string, string> = {
  '소한': '小寒', '대한': '大寒', '입춘': '立春', '우수': '雨水', '경칩': '驚蟄', '춘분': '春分',
  '청명': '淸明', '곡우': '穀雨', '입하': '立夏', '소만': '小滿', '망종': '芒種', '하지': '夏至',
  '소서': '小暑', '대서': '大暑', '입추': '立秋', '처서': '處暑', '백로': '白露', '추분': '秋分',
  '한로': '寒露', '상강': '霜降', '입동': '立冬', '소설': '小雪', '대설': '大雪', '동지': '冬至'
};

export interface Ganji {
  stem: string;
  branch: string;
  stemHangul: string;
  branchHangul: string;
}

export interface Saju {
  year: Ganji;
  month: Ganji;
  day: Ganji;
  hour: Ganji;
}
