
import { Solar } from 'lunar-javascript';

const date = Solar.fromYmd(2026, 3, 30);
const eightChar = date.getLunar().getEightChar();

console.log("Date: 2026-03-30");
console.log("Year Ganji:", eightChar.getYear());
console.log("Month Ganji:", eightChar.getMonth());
console.log("Day Ganji:", eightChar.getDay());
