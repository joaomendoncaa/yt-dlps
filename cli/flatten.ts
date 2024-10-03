import fs from "node:fs";
import path from "node:path";

const SOURCE = Bun.argv[2];
const OUTPUT = Bun.argv[3];

if (!SOURCE || typeof SOURCE !== "string")
  throw new Error("missing valid source path");

if (!OUTPUT || typeof OUTPUT !== "string")
  throw new Error("missing valid output path");

const videos = fs.readdirSync(SOURCE);

let markdown = "";
let index = "# [INDEX]\n\n";

const ids = new Map<string, string>();

for (let i = 0; i < videos.length; i++) {
  const video = videos[i];
  console.log(`writing ${video}`);

  const meta = JSON.parse(
    fs.readFileSync(path.join(SOURCE, video, "meta.json"), "utf8"),
  );

  ids.set(meta.id, crypto.randomUUID());

  const link = `https://x.com/search?q=%20${ids.get(meta.id)}&src=typed_query`;

  index += `- [${meta.category}] "${meta.title}": ${link}\n\n`;

  const summary = fs.readFileSync(
    path.join(SOURCE, video, "summary.txt"),
    "utf8",
  );

  markdown += `\`[${meta.category}]\`\n`;
  markdown += `"**${meta.title.toUpperCase()}**"\n`;
  markdown += `(${meta.participants.join(" x ")})\n`;
  markdown += `${meta.url}\n\n`;

  markdown += "\n\n";

  markdown += `${summary}\n\n`;

  markdown += "\n\n";

  markdown += `${ids.get(meta.id)}\n\n`;

  markdown += `![thumb](${path.resolve(path.join(SOURCE, video, "thumb.jpg"))})`;

  markdown += "---\n\n";
}

markdown = `${index}---\n\n${markdown}`;

console.log(`flattened to ${OUTPUT}`);
Bun.write(OUTPUT, markdown);
