
import { Solar } from 'lunar-javascript';

function check(year, month, day) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  console.log(`${year}-${month}-${day} -> Month: ${eightChar.getMonth()}`);
}

check(2026, 3, 15);
check(2026, 4, 15);
