import fs from "fs/promises";
import path from "path";

type Topic = { category: string; topic: string };

const normalizeText = (s: string) => {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/["'`]/g, "")
    .replace(/[.,!?;:()\[\]{}]/g, "")
    .normalize("NFKC");
};

// simple character-level dedupe: keep first occurrence of identical normalized text
const charLevelDedup = (topics: Topic[]) => {
  const seen = new Set<string>();
  const result: Topic[] = [];
  for (const t of topics) {
    const key = `${t.category}::${normalizeText(t.topic)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(t);
  }
  return result;
};

// Fetch similarity matrix from external embedding API
// Expectation: POST ${apiBase}/embed with { inputs: string[] }
// Response: { embeddings: number[][] } where embeddings[i][j] is similarity between i and j
const fetchSimilarityMatrix = async (texts: string[], apiBase: string) => {
  const url = `${apiBase.replace(/\/$/, "")}/embed`;
  const fetchFn = (globalThis as any).fetch;
  if (typeof fetchFn !== "function")
    throw new Error(
      "global fetch is not available in this Node runtime. Use Node 18+ or provide a fetch polyfill.",
    );

  const res = await fetchFn(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: texts }),
  });
  if (!res.ok)
    throw new Error(`Embed API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.embeddings))
    throw new Error("Invalid embed API response: missing embeddings array");
  return data.embeddings as number[][];
};

const main = async () => {
  const DATA_DIR = path.resolve(__dirname, "..", "data");
  const FILE = path.join(DATA_DIR, "raw.json");

  const raw = await fs.readFile(FILE, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("raw.json is not an array");

  const topics: Topic[] = parsed;

  console.log(`Loaded ${topics.length} topics from raw.json`);

  const charDedup = charLevelDedup(topics);
  console.log(`After character-level dedupe: ${charDedup.length}`);

  // Request similarity matrix from external embed API
  const apiBase =
    process.env.EMBED_API_BASE ||
    process.env.EMBED_API_URL ||
    "http://localhost:3000";
  const texts = charDedup.map((t) => t.topic);

  const threshold = 0.88;
  let pairs: Array<{ a: number; b: number; score: number }> = [];
  try {
    const sim = await fetchSimilarityMatrix(texts, apiBase);
    if (!Array.isArray(sim) || sim.length !== texts.length)
      throw new Error("Similarity matrix size mismatch");

    for (let i = 0; i < sim.length; i++) {
      for (let j = i + 1; j < sim[i].length; j++) {
        const s = sim[i][j];
        if (typeof s !== "number") continue;
        if (s >= threshold) pairs.push({ a: i, b: j, score: s });
      }
    }
  } catch (e) {
    console.error("Failed to get similarity matrix from embed API:", e);
    // fall back to no pairs
    pairs = [];
  }

  console.log(
    `Found ${pairs.length} candidate duplicate pairs (threshold ${threshold})`,
  );

  // Write candidates to disk for manual review
  const out = path.join(DATA_DIR, "dedupe-candidates.json");
  await fs.writeFile(
    out,
    JSON.stringify(
      pairs.map((p) => ({
        a: charDedup[p.a],
        b: charDedup[p.b],
        score: p.score,
      })),
      null,
      2,
    ),
    "utf8",
  );

  console.log(`Wrote dedupe candidates to ${out}`);
};

if (require.main === module)
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });

export { main };
