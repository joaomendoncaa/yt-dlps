import fs from "node:fs";

const SOURCE = Bun.argv[2];

if (!fs.existsSync(SOURCE)) throw new Error(`File ${SOURCE} does not exist`);

const text = fs.readFileSync(SOURCE, "utf8");

function calc(wordCount: number, wordsPerMinute = 250): string {
  const totalMinutes = wordCount / wordsPerMinute;
  const minutes = Math.floor(totalMinutes);
  const seconds = Math.round((totalMinutes - minutes) * 60);

  return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
}

function count(text: string): number {
  const words = text.trim().match(/\b\w+\b/g);
  return words ? words.length : 0;
}

console.log(calc(count(text)));
