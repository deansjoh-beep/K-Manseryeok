
import { Solar } from 'lunar-javascript';

function checkMonth(year, month, day) {
  const solar = Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  // eightChar.setDayGanjiType(1); // Instance method
  console.log(`${year}-${month}-${day} -> Year: ${eightChar.getYear()}, Month: ${eightChar.getMonth()}, Day: ${eightChar.getDay()}`);
}

console.log("Checking 2026 Month Ganji:");
checkMonth(2026, 3, 1);  // Should be Gyeong-in (庚寅)
checkMonth(2026, 3, 10); // Should be Sin-myo (辛卯)
checkMonth(2026, 4, 1);  // Should be Sin-myo (辛卯)
checkMonth(2026, 4, 10); // Should be Im-jin (壬辰)
