
import { Solar } from 'lunar-javascript';

function check(year) {
  const solar = Solar.fromYmd(year, 2, 15); // Middle of Feb, usually after Ipchun
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  console.log(`${year} Year: ${eightChar.getYear()}, 1st Month (Tiger): ${eightChar.getMonth()}`);
}

console.log("Checking Oho-don-beop:");
check(2024); // Gap-jin (Gap year) -> Should be Byeong-in (丙寅)
check(2025); // Eul-sa (Eul year) -> Should be Mu-in (戊寅)
check(2026); // Byeong-oh (Byeong year) -> Should be Gyeong-in (庚寅)
check(2027); // Jeong-mi (Jeong year) -> Should be Im-in (壬寅)
check(2028); // Mu-sin (Mu year) -> Should be Gap-in (甲寅)
check(2029); // Gi-yu (Gi year) -> Should be Byeong-in (丙寅)
