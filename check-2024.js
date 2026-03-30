
import { Solar } from 'lunar-javascript';

const date = Solar.fromYmd(2024, 1, 15);
const eightChar = date.getLunar().getEightChar();

console.log("Date: 2024-01-15");
console.log("Year Ganji:", eightChar.getYear());
console.log("Month Ganji:", eightChar.getMonth());
