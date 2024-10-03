import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";
import { parseBpVideoTitle } from "./utils.ts";

const URL = Bun.argv[2];
const OUTPUT = Bun.argv[3];

if (!URL || typeof URL !== "string")
  throw new Error("missing valid playlist url");

if (!OUTPUT || typeof OUTPUT !== "string")
  throw new Error("missing valid output path");

console.log("Downloading playlist videos...");
await $`yt-dlp "${URL}" --default-search "ytsearch" -o "${OUTPUT}/%(id)s/video.webm" -n 10 --ignore-errors --skip-unavailable-fragments --yes-playlist`.nothrow();

for (const id of fs.readdirSync(OUTPUT)) {
  const [o, i] = [
    path.join(OUTPUT, id, "audio.mp3"),
    path.join(OUTPUT, id, "video.webm"),
  ];

  if (fs.existsSync(o)) {
    console.log(`skipping ${id} because audio already exists`);
    continue;
  }

  if (!fs.existsSync(i)) {
    console.log(`skipping ${id} because, can't find video`);
    continue;
  }

  await $`ffmpeg -i "${i}" -q:a 0 -map a "${o}"`;

  if (!fs.existsSync(o)) {
    console.log(`skipping ${id}, audio doesn't exist`);
    continue;
  }

  const url = `https://www.youtube.com/watch?v=${id}`;

  const metaList = (
    await $`yt-dlp --skip-download --print "%(id)s|%(title)s|%(duration>%H:%M:%S)s|%(webpage_url)s" "${url}"`.text()
  ).split("|");

  const meta = {
    ...{
      id: metaList[0],
      duration: metaList[2],
      url: metaList[3],
    },
    ...parseBpVideoTitle(metaList[1]),
  };

  console.log("meta", meta);

  Bun.write(path.join(OUTPUT, id, "meta.json"), JSON.stringify(meta));
}
