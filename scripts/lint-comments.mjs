#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const BASELINE = `${ROOT}/.comment-baseline.json`;
const UPDATE = process.argv.includes("--update");

const EXTS = new Set(["ts", "tsx", "js", "jsx", "mjs", "cjs", "css", "scss"]);
const ALLOWED =
  /@ts-|@type\b|biome-ignore|eslint-|^\s*\/?\s*<reference|^!|^\s*@license|^\s*@preserve/;

function sourceFiles() {
  const out = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard"],
    { cwd: ROOT, encoding: "utf8" },
  );
  return out
    .split("\n")
    .filter(Boolean)
    .filter((f) => EXTS.has(f.split(".").pop()))
    .filter((f) => !/(^|\/)(node_modules|dist|\.next|\.turbo)\//.test(f))
    .filter((f) => !f.endsWith("next-env.d.ts"));
}

// Walk the source once, tracking strings so `//` and `/*` inside them don't
// count. Returns the number of physical lines carrying a non-directive comment.
function countComments(src, lineComments) {
  const lines = new Set();
  let i = 0;
  let line = 1;
  const n = src.length;
  const atLine = (text, from, to) => {
    if (ALLOWED.test(text)) return;
    let l = from;
    for (let k = from; k <= to && k < n; k++) if (src[k] === "\n") l++;
    // mark every physical line the comment spans
    let cur = line;
    for (let k = from; k <= to && k < n; k++) {
      lines.add(cur);
      if (src[k] === "\n") cur++;
    }
    void l;
  };
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === "\n") {
      line++;
      i++;
    } else if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === "\\") i++;
        else if (src[i] === "\n") line++;
        i++;
      }
      i++;
    } else if (lineComments && c === "/" && d === "/") {
      let j = i;
      while (j < n && src[j] !== "\n") j++;
      atLine(src.slice(i, j), i, j - 1);
      i = j;
    } else if (c === "/" && d === "*") {
      let j = i + 2;
      while (j < n && !(src[j] === "*" && src[j + 1] === "/")) j++;
      const end = Math.min(j + 1, n - 1);
      const startLine = line;
      let cur = startLine;
      const text = src.slice(i, end + 1);
      if (!ALLOWED.test(text)) {
        for (let k = i; k <= end; k++) {
          lines.add(cur);
          if (src[k] === "\n") cur++;
        }
      }
      for (let k = i; k <= end; k++) if (src[k] === "\n") line++;
      i = end + 1;
    } else {
      i++;
    }
  }
  return lines.size;
}

const counts = {};
for (const f of sourceFiles()) {
  const ext = f.split(".").pop();
  const lineComments = ext !== "css";
  const c = countComments(readFileSync(`${ROOT}/${f}`, "utf8"), lineComments);
  if (c > 0) counts[f] = c;
}

let baseline = {};
try {
  baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
} catch {}

if (UPDATE) {
  // Ratchet: a file's allowance can only drop, never rise.
  const next = {};
  for (const [f, c] of Object.entries(counts)) {
    const prev = baseline[f] ?? c;
    const allowed = Math.min(c, prev);
    if (allowed > 0) next[f] = allowed;
  }
  writeFileSync(BASELINE, `${JSON.stringify(next, null, 2)}\n`);
  console.log(`Wrote baseline for ${Object.keys(next).length} file(s).`);
  process.exit(0);
}

const violations = [];
for (const [f, c] of Object.entries(counts)) {
  const allowed = baseline[f] ?? 0;
  if (c > allowed)
    violations.push(`${f}: ${c} comment line(s), baseline ${allowed}`);
}
// A file that beat its baseline must have the baseline lowered in the same PR.
for (const [f, allowed] of Object.entries(baseline)) {
  const c = counts[f] ?? 0;
  if (c < allowed)
    violations.push(
      `${relative(".", f)}: ${c} comment line(s) < baseline ${allowed} — run 'pnpm lint:comments:update' to ratchet down`,
    );
}

if (violations.length) {
  console.error(`Comment check failed:\n  ${violations.join("\n  ")}`);
  process.exit(1);
}
console.log(
  `Comment check passed. ${Object.keys(counts).length} file(s) still hold comments (baseline).`,
);
