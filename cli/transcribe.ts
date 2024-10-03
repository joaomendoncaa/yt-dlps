import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const SOURCE = Bun.argv[2];

if (!SOURCE || typeof SOURCE !== "string")
  throw new Error("missing valid source path");

if (fs.existsSync(path.join(SOURCE, "transcriptions.json")))
  throw new Error("transcriptions.json already exists");

console.log("whispering");

await $`whisper ${path.join(SOURCE, "audio.mp3")} --threads 12 --model medium --output_format json --output_dir "${SOURCE}" --language en`;

fs.renameSync(
  path.join(SOURCE, "audio.json"),
  path.join(SOURCE, "transcriptions.json"),
);
