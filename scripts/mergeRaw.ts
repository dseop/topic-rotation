/**
 * scripts/mergeRaw.ts
 *
 * Merge all generated-topic-*.json files under ../data into data/raw.json
 * Usage: node -r ts-node/register scripts/mergeRaw.ts
 */

import fs from "fs/promises";
import path from "path";

type Topic = { category: string; topic: string };

const DATA_DIR = path.resolve(__dirname, "..", "data");
const OUT_FILE = path.join(DATA_DIR, "raw.json");

function extractIndex(filename: string): number | null {
  // try to extract trailing numeric group, e.g. generated-topic-002.json or generated-topic-20250821-001.json
  const m = filename.match(/generated-topic-(?:\d+-)?(\d+)\.json$/);
  if (m && m[1]) return Number(m[1]);
  const m2 = filename.match(/(\d+)/);
  return m2 ? Number(m2[1]) : null;
}

async function mergeGeneratedIntoRaw(): Promise<void> {
  const entries = await fs.readdir(DATA_DIR);
  const generated = entries.filter((f) => /^generated-topic-.*\.json$/.test(f));

  if (generated.length === 0) {
    console.log("No generated-topic-*.json files found in", DATA_DIR);
    return;
  }

  // sort by extracted numeric index when possible, fallback to filename
  generated.sort((a, b) => {
    const ia = extractIndex(a);
    const ib = extractIndex(b);
    if (ia !== null && ib !== null) return ia - ib;
    return a.localeCompare(b);
  });

  const merged: Topic[] = [];

  for (const fname of generated) {
    const p = path.join(DATA_DIR, fname);
    try {
      const raw = await fs.readFile(p, "utf8");
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn(`${fname} does not contain a JSON array — skipping`);
        continue;
      }
      const valid = parsed.filter(
        (it: any) =>
          it && typeof it.category === "string" && typeof it.topic === "string",
      );
      console.log(
        `Including ${valid.length}/${parsed.length} items from ${fname}`,
      );
      merged.push(...(valid as Topic[]));
    } catch (err) {
      console.error("Failed to read/parse", fname, err);
    }
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(merged, null, 2), "utf8");
  console.log(`Wrote ${merged.length} topics to ${OUT_FILE}`);
}

if (require.main === module) {
  mergeGeneratedIntoRaw().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}

export { mergeGeneratedIntoRaw };
