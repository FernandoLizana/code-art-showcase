export const MAJOR_ARCANA = [
  { id: 0, name: "El Loco", slug: "loco" },
  { id: 1, name: "El Mago", slug: "mago" },
  { id: 2, name: "La Sacerdotisa", slug: "sacerdotisa" },
  { id: 3, name: "La Emperatriz", slug: "emperatriz" },
  { id: 4, name: "El Emperador", slug: "emperador" },
  { id: 5, name: "El Hierofante", slug: "hierofante" },
  { id: 6, name: "Los Enamorados", slug: "enamorados" },
  { id: 7, name: "El Carro", slug: "carro" },
  { id: 8, name: "La Fuerza", slug: "fuerza" },
  { id: 9, name: "El Ermitaño", slug: "ermitano" },
  { id: 10, name: "La Rueda de la Fortuna", slug: "rueda" },
  { id: 11, name: "La Justicia", slug: "justicia" },
  { id: 12, name: "El Colgado", slug: "colgado" },
  { id: 13, name: "La Muerte", slug: "muerte" },
  { id: 14, name: "La Temperancia", slug: "temperancia" },
  { id: 15, name: "El Diablo", slug: "diablo" },
  { id: 16, name: "La Torre", slug: "torre" },
  { id: 17, name: "La Estrella", slug: "estrella" },
  { id: 18, name: "La Luna", slug: "luna" },
  { id: 19, name: "El Sol", slug: "sol" },
  { id: 20, name: "El Juicio", slug: "juicio" },
  { id: 21, name: "El Mundo", slug: "mundo" },
] as const;

export const SEFIROT = [
  { id: "keter", name: "Kéter", label: "Corona" },
  { id: "jojma", name: "Jojmá", label: "Sabiduría" },
  { id: "bina", name: "Biná", label: "Entendimiento" },
  { id: "jesed", name: "Jesed", label: "Misericordia" },
  { id: "guevura", name: "Guevurá", label: "Rigor" },
  { id: "tiferet", name: "Tiféret", label: "Belleza" },
  { id: "netzaj", name: "Netzaj", label: "Victoria" },
  { id: "hod", name: "Hod", label: "Esplendor" },
  { id: "yesod", name: "Yesod", label: "Fundamento" },
  { id: "maljut", name: "Maljut", label: "Reino" },
] as const;

export const VALID_TREE_CONNECTIONS: [string, string][] = [
  ["keter", "jojma"],
  ["keter", "bina"],
  ["keter", "tiferet"],
  ["jojma", "bina"],
  ["jojma", "tiferet"],
  ["jojma", "hesed"],
  ["bina", "tiferet"],
  ["bina", "gevurah"],
  ["jesed", "guevura"],
  ["jesed", "tiferet"],
  ["jesed", "netzaj"],
  ["guevura", "tiferet"],
  ["guevura", "hod"],
  ["tiferet", "netzaj"],
  ["tiferet", "hod"],
  ["tiferet", "yesod"],
  ["netzaj", "hod"],
  ["netzaj", "yesod"],
  ["hod", "yesod"],
  ["yesod", "maljut"],
];

// Normalized connection IDs (handle spelling variants)
export function normalizeSefiraId(id: string): string {
  const map: Record<string, string> = {
    keter: "keter",
    jojma: "jojma",
    jojmá: "jojma",
    bina: "bina",
    biná: "bina",
    jesed: "jesed",
    hesed: "jesed",
    guevura: "guevura",
    gevurah: "guevura",
    tiferet: "tiferet",
    tiféret: "tiferet",
    netzaj: "netzaj",
    hod: "hod",
    yesod: "yesod",
    maljut: "maljut",
  };
  return map[id.toLowerCase()] ?? id.toLowerCase();
}

export const REQUIRED_SEFIROT = SEFIROT.map((s) => s.id);

export const MIN_VALID_CONNECTIONS = 18;
