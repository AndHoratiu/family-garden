// Helpers pentru filtrarea produselor pe sezon

export const SEASONS = {
  primavara: { key: "primavara", label: "Primăvara", emoji: "🌸", months: [3, 4, 5], color: "bg-pink-100 text-pink-700 ring-pink-200" },
  vara: { key: "vara", label: "Vara", emoji: "☀️", months: [6, 7, 8], color: "bg-amber-100 text-amber-700 ring-amber-200" },
  toamna: { key: "toamna", label: "Toamna", emoji: "🍂", months: [9, 10, 11], color: "bg-orange-100 text-orange-700 ring-orange-200" },
  iarna: { key: "iarna", label: "Iarna", emoji: "❄️", months: [12, 1, 2], color: "bg-sky-100 text-sky-700 ring-sky-200" },
  totAnul: { key: "totAnul", label: "Tot anul", emoji: "🔄", months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], color: "bg-emerald-100 text-emerald-700 ring-emerald-200" },
};

export const SEASON_FILTERS = [
  { key: "all", label: "Toate sezoanele", emoji: "🗓️" },
  SEASONS.primavara,
  SEASONS.vara,
  SEASONS.toamna,
  SEASONS.iarna,
  SEASONS.totAnul,
];

const norm = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ş/g, "s")
    .replace(/ţ/g, "t")
    .replace(/[^a-z]/g, " ")
    .trim();

// Parse season string like "Primăvară - Vară" → ["primavara", "vara"]
// "Tot anul" → ["totAnul"] (mapped to all 4 too)
export function parseSeasons(seasonString) {
  const n = norm(seasonString);
  if (!n) return [];
  if (n.includes("tot anul") || n.includes("totanul")) return ["totAnul", "primavara", "vara", "toamna", "iarna"];

  const result = [];
  if (n.includes("primavara") || n.includes("primavar")) result.push("primavara");
  if (n.includes("vara") && !n.includes("primavara")) result.push("vara");
  if (/\bvara\b/.test(n)) {
    if (!result.includes("vara")) result.push("vara");
  }
  if (n.includes("toamna")) result.push("toamna");
  if (n.includes("iarna")) result.push("iarna");

  // Handle ranges like "primavara - toamna" → fill in vara
  if (result.includes("primavara") && result.includes("toamna") && !result.includes("vara")) {
    result.splice(result.indexOf("toamna"), 0, "vara");
  }

  return result.length > 0 ? result : [];
}

export function getCurrentSeasonKey() {
  const month = new Date().getMonth() + 1;
  if ([3, 4, 5].includes(month)) return "primavara";
  if ([6, 7, 8].includes(month)) return "vara";
  if ([9, 10, 11].includes(month)) return "toamna";
  return "iarna";
}

export function isProductInSeason(productSeasonString, seasonKey) {
  if (!seasonKey || seasonKey === "all") return true;
  const seasons = parseSeasons(productSeasonString);
  return seasons.includes(seasonKey);
}

export function getProductSeasonBadges(productSeasonString) {
  const seasons = parseSeasons(productSeasonString);
  // If "tot anul", show single "Tot anul" badge instead of all 4
  if (seasons.includes("totAnul")) return [SEASONS.totAnul];
  return seasons.map((k) => SEASONS[k]).filter(Boolean);
}
