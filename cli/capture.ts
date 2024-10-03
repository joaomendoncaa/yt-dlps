import { type RmDirOptions, existsSync, mkdirSync, rmdirSync } from "node:fs";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { $ } from "bun";
import pLimit from "p-limit";
import puppeteer from "puppeteer";

const SOURCE = Bun.argv[2];
const THUMB_WIDTH = 4000;
const THUMB_HEIGHT = 2000;
const BENTO_PATH = path.join(process.cwd(), "lib/bento-grid/dist/main.js");
const CWD = process.cwd();

if (!existsSync("_tmp")) mkdirSync("_tmp");

if (!SOURCE || typeof SOURCE !== "string")
  throw new Error("missing valid path");

if (!fs.existsSync(path.join(SOURCE, "video.webm"))) {
  throw new Error("missing valid video");
}

if (!fs.existsSync(BENTO_PATH)) {
  throw new Error("missing bento-grid facade in /lib/bento-grid");
}

const duration =
  await $`exiftool "${SOURCE}/video.webm" | awk '/Duration/ {print $NF}'`.text();

const [min, max] = [9, 14];
const capturesAmount = Math.floor(Math.random() * (max - min + 1)) + min;

const capturesStamps = new Array(capturesAmount).fill(0).map((_) => {
  const [h, m, s] = duration.split(":").map(Number);

  const [rh, rm, rs] = [
    Math.floor(Math.random() * h),
    Math.floor(Math.random() * m),
    Math.floor(Math.random() * s),
  ];

  return `${rh}:${rm}:${rs}`;
});

const images = [] as string[];
const limit = pLimit(os.cpus().length);
const tasks = capturesStamps.map((_, i: number) => {
  const output = path.join(CWD, `_tmp/frame-${i}.jpg`);
  images.push(output);

  return limit(
    () =>
      new Promise((res) => {
        const worker = new Worker(
          URL.createObjectURL(
            new Blob(
              [
                /*JS*/ `
                  import { $ } from 'bun';
                  await $\`ffmpeg -ss ${capturesStamps[i]} -y -i "${SOURCE}/video.webm" -frames:v 1 -q:v 2 ${output}\`.nothrow().quiet();
                  self.postMessage(1);
                `,
              ],
              { type: "application/javascript" },
            ),
          ),
        );

        worker.onmessage = res;
        worker.onerror = res;
      }),
  );
});

console.log(
  `⌛ generating ${capturesAmount} captures for ${SOURCE}:\n${capturesStamps.join(", ")}`,
);
await Promise.all(tasks);

Bun.write(
  "_tmp/index.html",
  /*HTML*/ `
<!DOCTYPE html>
<html lang="en">
  <head>
    <script type="module">
    </script>
    <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html {
          width: 100vw;
          height: 100vh;
        }
        body {
            display: flex;
            width: 100%;
            height: 100%;
            background-color: #ffffff;
        }
        .bento {
            width: 100vw;
            height: 100vh;
            padding: 6rem;
            gap: 4rem;
        }
        .bento div {
            overflow: hidden;
            border-radius: 55px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
        }
    </style>
  </head>
  <body>
    <div class="bento">
      ${images
        .map((path) => {
          return /*HTML*/ `<div class="item" data-min-width="${Math.floor(Math.random() * (10 - 5 + 1)) + 5}"  data-min-height="${Math.floor(Math.random() * (10 - 3 + 1)) + 3}" style="background-image: url('${`file://${path}`}');"></div>`;
        })
        .join()}
    </div>

    <script type="module">
        ${await Bun.file(BENTO_PATH).text()}
        new Bento(document.querySelector('.bento'))
    </script>
</body>
</html>`,
);

const b = await puppeteer.launch({ headless: true });
const e = await b.newPage();

await e.setViewport({
  width: THUMB_WIDTH,
  height: THUMB_HEIGHT,
});

await e.goto(`file://${path.join(CWD, "_tmp/index.html")}`);
await e.screenshot({ path: `${SOURCE}/thumb.jpg` });
await b.close();

rmdirSync(path.join(CWD, "_tmp"), {
  recursive: true,
  force: true,
} as RmDirOptions);

console.log("☑  capture done..");
