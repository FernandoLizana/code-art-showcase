const ACCENT_MAP: Record<string, string> = {
  á: "a",
  é: "e",
  í: "i",
  ó: "o",
  ú: "u",
  ü: "u",
  ñ: "n",
  à: "a",
  è: "e",
  ì: "i",
  ò: "o",
  ù: "u",
};

export function normalizeAnswer(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/^(la|el|los|las|the)\s+/i, "")
    .replace(/\s+/g, " ")
    .split("")
    .map((c) => ACCENT_MAP[c] ?? c)
    .join("");
}

export function answersMatch(input: string, expected: string): boolean {
  return normalizeAnswer(input) === normalizeAnswer(expected);
}

export function matchesAnyVariant(input: string, variants: string[]): boolean {
  const normalized = normalizeAnswer(input);
  return variants.some((v) => normalizeAnswer(v) === normalized);
}

export function stripArticles(input: string): string {
  return input.replace(/^(la|el|los|las|the)\s+/i, "").trim();
}
