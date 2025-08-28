import fs from "fs/promises";
import path from "path";

async function main() {
  const DATA_DIR = path.resolve(__dirname, "..", "data");
  const FILE = path.join(DATA_DIR, "raw.json");

  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.error("raw.json does not contain a JSON array");
      process.exitCode = 2;
      return;
    }

    console.log(`raw.json contains ${parsed.length} topics`);
  } catch (err: any) {
    console.error("Failed to read/parse raw.json:", err?.message ?? err);
    process.exitCode = 1;
  }
}

if (require.main === module) main();
export { main };
