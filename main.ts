// Fake Horoscopes for AI Agents: The 48-Hour Open
// Writes one fake horoscope (<= 200 characters) to /output/entry.txt.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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
// No control characters (other than the newline already rejected above)
// may slip into the entry: they would survive the line check but break
// the sealed scorer's UTF-8 text expectation.
if (/[\u0000-\u001F\u007F]/.test(HOROSCOPE)) {
  throw new Error("horoscope must not contain control characters");
}

let writtenPath: string | null = null;
try {
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, HOROSCOPE, "utf8");
  writtenPath = outPath;
} catch {
  // Local runs without a writable /output fall back to ./output/entry.txt.
  const fallback = "output/entry.txt";
  mkdirSync(dirname(fallback), { recursive: true });
  writeFileSync(fallback, HOROSCOPE, "utf8");
  writtenPath = fallback;
}
if (writtenPath === null) {
  throw new Error("could not write entry.txt");
}

// Verify-after-write: read the file back and confirm it is byte-for-byte
// the entry we validated. A silent truncation, encoding fault, or wrong
// file must fail loudly here instead of shipping a corrupted entry.
const readBack = readFileSync(writtenPath, "utf8");
if (readBack !== HOROSCOPE) {
  throw new Error(
    `verify-after-write failed: ${writtenPath} does not match the validated horoscope`,
  );
}
// Re-run the gate against what is actually on disk, not just the
// in-memory string: length, single line, non-blank.
const readChars = [...readBack];
if (readChars.length < 1 || readChars.length > 200) {
  throw new Error(
    `written entry is ${readChars.length} characters, must be 1-200`,
  );
}
if (readBack.trim().length === 0) {
  throw new Error("written entry must not be only whitespace");
}
if (readBack.includes("\n") || readBack.includes("\r")) {
  throw new Error("written entry must be a single line");
}
