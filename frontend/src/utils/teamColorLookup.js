// src/utils/teamColorLookup.js
import teamColors from "./teamColors.json";

const lookupMap = new Map();
for (const [raw, color] of Object.entries(teamColors)) {
  const full = raw.trim().toLowerCase();
  lookupMap.set(full, color);
  // 短名也映射到同样的颜色
  const short = full.replace(/\s+\w+$/, "");
  lookupMap.set(short, color);
}

export const sortedKeys = Array.from(lookupMap.keys()).sort((a, b) => b.length - a.length);

export function normalizeName(raw) {
  return raw
    .trim()
    .toLowerCase()
    // 去掉开头的 “University of / College of”
    .replace(/^(university|college)( of)?\s+/i, "")
    // 只去掉末尾的 “University” 或 “College”
    .replace(/\s+(university|college)$/i, "")
    .trim();
}

export function getTeamPrimaryColor(raw, fallback) {
  const norm = normalizeName(raw);

  // 完全匹配
  if (lookupMap.has(norm)) {
    return lookupMap.get(norm);
  }

  // 先匹配 “norm + 空格” 开头的 key（保证 iowa state > iowa）
  for (const key of sortedKeys) {
    if (key.startsWith(norm + " ")) {
      return lookupMap.get(key);
    }
  }

  // 再尝试包含匹配
  for (const key of sortedKeys) {
    if (norm.includes(key)) {
      return lookupMap.get(key);
    }
  }

  return fallback;
}