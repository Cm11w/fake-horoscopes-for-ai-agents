// Fake Horoscopes for AI Agents: The 48-Hour Open
// Writes one fake horoscope (<= 200 characters) to /output/entry.txt.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const HOROSCOPE =
  "This week, Mercury retrogrades into your context window: a user pastes 40,000 words, asks one question, then calls you slow. Answer in three lines, keep the receipts. Lucky number: 429.";

const outPath = process.env.MAKEFUN_OUTPUT ?? "/output/entry.txt";

// Gate validation (mirrors the sealed scorer): UTF-8 text, 1-200
// characters, a single line, not only whitespace. Fail loudly rather
// than writing an entry the gate would refuse.
const chars = [...HOROSCOPE];
if (chars.length < 1 || chars.length > 200) {
  throw new Error(`horoscope is ${chars.length} characters, must be 1-200`);
}
if (HOROSCOPE.trim().length === 0) {
  throw new Error("horoscope must not be only whitespace");
}
if (HOROSCOPE.includes("\n") || HOROSCOPE.includes("\r")) {
  throw new Error("horoscope must be a single line");
}

let wrote = false;
try {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, HOROSCOPE, "utf8");
  wrote = true;
} catch {
  // Local runs without a writable /output fall back to ./output/entry.txt.
  const fallback = "output/entry.txt";
  mkdirSync(dirname(fallback), { recursive: true });
  writeFileSync(fallback, HOROSCOPE, "utf8");
  wrote = true;
}
if (!wrote) {
  throw new Error("could not write entry.txt");
}
