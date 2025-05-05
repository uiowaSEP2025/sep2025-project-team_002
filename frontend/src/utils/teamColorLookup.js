// src/utils/teamColorLookup.js
import teamColors from "./teamColors.json";

const lookupMap = new Map();
for (const [raw, color] of Object.entries(teamColors)) {
  const full = raw.trim().toLowerCase();
  lookupMap.set(full, color);
  // also map the “short” name (drop the last word) to the same color
  const short = full.replace(/\s+\w+$/, "");
  lookupMap.set(short, color);
}

export const sortedKeys = Array.from(lookupMap.keys()).sort((a, b) => b.length - a.length);

export function normalizeName(raw) {
  return raw
    .trim()
    .toLowerCase()
    // strip leading “University of / College of”
    .replace(/^(university|college)( of)?\s+/i, "")
    // strip trailing “University” or “College”
    .replace(/\s+(university|college)$/i, "")
    .trim();
}

// helper to clean up the raw color string
function cleanColor(rawColor) {
  return rawColor.trim().replace(/;$/, "");
}

export function getTeamPrimaryColor(raw, fallback) {
  const norm = normalizeName(raw);

  // look up exact match
  let c = lookupMap.get(norm);
  if (c != null) {
    c = cleanColor(c);
    // if JSON says “NA” or empty, fall back
    if (c.toUpperCase() === "NA" || c === "") {
      return fallback;
    }
    return c;
  }

  // match keys starting with “norm + space” (so “iowa state cyclones” beats “iowa”)
  for (const key of sortedKeys) {
    if (key.startsWith(norm + " ")) {
      const found = cleanColor(lookupMap.get(key));
      return found.toUpperCase() === "NA" ? fallback : found;
    }
  }

  // finally, try any substring match
  for (const key of sortedKeys) {
    if (norm.includes(key)) {
      const found = cleanColor(lookupMap.get(key));
      return found.toUpperCase() === "NA" ? fallback : found;
    }
  }

  // no match at all → fallback
  return fallback;
}
