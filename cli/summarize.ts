import fs from "node:fs";
import path from "node:path";
import { $ } from "bun";

const SOURCE = Bun.argv[2];

if (!SOURCE || typeof SOURCE !== "string")
  throw new Error("missing valid source path");

if (!fs.existsSync(path.join(SOURCE, "transcriptions.json")))
  throw new Error("missing transcriptions.json");

const { text: summary } = JSON.parse(
  fs.readFileSync(path.join(SOURCE, "transcriptions.json"), "utf8"),
);

const metadata = JSON.parse(
  fs.readFileSync(path.join(SOURCE, "meta.json"), "utf8"),
);

const modelfile = path.resolve(
  process.cwd(),
  "_tmp",
  `bp.${metadata.id}.modelfile`,
);

const modelname = `bp.${metadata.id}`;

const category = metadata.category.length > 0 ? metadata.category : "talk";
const title = metadata.title ? `about: ${metadata.title}` : null;
const participants =
  metadata.participants && metadata.participants.length > 0
    ? `featuring ${metadata.participants.join(", ")}`
    : null;

console.log("meta: ", {
  category,
  title,
  participants,
});

Bun.write(
  modelfile,
  /*Modelfile*/ `
FROM llama3.2:1b

SYSTEM """
You are tasked with summarizing this Solana conference's ${category}, ${title}, ${participants}, in the following format:

1º A brief TLDR of everything that happened in the talk.
2º A bullet point list of the highlights from the talk (if any).

Strictly stick to this format and do not deviate!

Additionally, follow this rules for the summary:

- Be brief and to the point.
- Prioritize making less lengthy bullet points without
- Prioritize making as few bullet points as possible without missing highlights
- If a topic has 2 highlights, make 2 bullet poits instead of a big one. 
- Don't talk about details, focus on pertinent highlights from the input.

Example of a good response:

\`\`\`
TLDR 

Kevin bowers showcased the history of Firedancer since development began to date, and announced that there's an hybrid version of it called Frankendacer live on mainnet today. Additionally an early version of Firedancer is running on testnet.

HIGHLIGHTS

• Kevin Bowers compared optimizing validators to upgrading infrastructure like water mains or highways, aiming for efficient systems that work seamlessly.
• The team has made significant progress in two years, open-sourcing tech stacks, rebuilding the validator, creating custom hardware, and releasing general technical innovations.
• FrankenDancer is now seen as a useful modular high-performance platform for validator development, with Agave potentially being made comparably performant.
• The ecosystem can evolve to expose validator capacity, allowing the community to grow into this new capacity.
• Kevin Bowers showed remote monitoring of a running FrankenDancer instance on mainnet, providing real-world visibility into the protocol's operation.
\`\`\`
"""
`,
);

await $`OLLAMA_USE_GPU=1 ollama create "${modelname}" -f "${modelfile}"`;

console.log(`spinning up ${modelname}`);
const output =
  await $`OLLAMA_USE_GPU=1 ollama run "${modelname}" "${summary}"`.text();

console.log("output: ", output.trim());

Bun.write(path.join(SOURCE, "summary.txt"), output.trim());

await $`ollama rm ${modelname}`;

fs.unlinkSync(modelfile);

console.log(`done summarizing ${SOURCE}`);
