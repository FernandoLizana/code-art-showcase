import type { PersonalityDimension } from "@/types/game";

export interface ArchetypeDefinition {
  id: string;
  name: string;
  description: string;
  tarotCard: string;
  tarotCardId: number;
  primaryDimensions: PersonalityDimension[];
}

export const ARCHETYPES: ArchetypeDefinition[] = [
  {
    id: "observador",
    name: "El Observador",
    description: "Quien mira antes de tocar, y recuerda lo que otros olvidan.",
    tarotCard: "La Sacerdotisa",
    tarotCardId: 2,
    primaryDimensions: ["paciencia", "escepticismo", "prudencia"],
  },
  {
    id: "tramposo",
    name: "El Tramposo",
    description: "Encuentra atajos donde otros ven muros.",
    tarotCard: "El Mago",
    tarotCardId: 1,
    primaryDimensions: ["picardia", "impulsividad", "curiosidad"],
  },
  {
    id: "guardian",
    name: "El Guardián",
    description: "Protege lo que importa, incluso cuando duele.",
    tarotCard: "La Emperatriz",
    tarotCardId: 3,
    primaryDimensions: ["bondad", "empatia", "prudencia"],
  },
  {
    id: "dominante",
    name: "El Dominante",
    description: "Prefiere decidir antes que esperar.",
    tarotCard: "El Emperador",
    tarotCardId: 4,
    primaryDimensions: ["dominancia", "necesidad_control", "pensamiento_logico"],
  },
  {
    id: "errante",
    name: "El Errante",
    description: "Camina sin mapa porque confía en el camino.",
    tarotCard: "El Loco",
    tarotCardId: 0,
    primaryDimensions: ["curiosidad", "pensamiento_intuitivo", "tolerancia_ambiguedad"],
  },
  {
    id: "analista",
    name: "El Analista",
    description: "Descompone lo imposible en piezas manejables.",
    tarotCard: "El Ermitaño",
    tarotCardId: 9,
    primaryDimensions: ["pensamiento_logico", "perfeccionismo", "escepticismo"],
  },
  {
    id: "mistico",
    name: "El Místico",
    description: "Lee símbolos donde otros ven ruido.",
    tarotCard: "La Estrella",
    tarotCardId: 17,
    primaryDimensions: ["apertura_simbolica", "pensamiento_intuitivo", "tolerancia_ambiguedad"],
  },
  {
    id: "solitario",
    name: "El Solitario",
    description: "Confía en su propio criterio por encima del consenso.",
    tarotCard: "La Luna",
    tarotCardId: 18,
    primaryDimensions: ["individualismo", "escepticismo", "necesidad_control"],
  },
  {
    id: "compasivo",
    name: "El Compasivo",
    description: "Siente el peso ajeno como propio.",
    tarotCard: "La Temperancia",
    tarotCardId: 14,
    primaryDimensions: ["empatia", "bondad", "capacidad_renuncia"],
  },
  {
    id: "equilibrista",
    name: "El Equilibrista",
    description: "Nada en él domina del todo; todo en él responde.",
    tarotCard: "La Justicia",
    tarotCardId: 11,
    primaryDimensions: ["tolerancia_ambiguedad", "paciencia", "capacidad_renuncia"],
  },
  {
    id: "sumiso",
    name: "El Sumiso",
    description: "Cede el control cuando otros lo exigen.",
    tarotCard: "El Colgado",
    tarotCardId: 12,
    primaryDimensions: ["sumision", "empatia", "capacidad_renuncia"],
  },
  {
    id: "impulsivo",
    name: "El Impulsivo",
    description: "Actúa antes de que la duda llegue.",
    tarotCard: "La Torre",
    tarotCardId: 16,
    primaryDimensions: ["impulsividad", "curiosidad", "picardia"],
  },
];

export const BORROWED_NAMES = [
  "Mara Vex",
  "Silas Thorn",
  "Iris Noctis",
  "Caelum Ash",
  "Vera Hollow",
  "Orin Vale",
  "Lyra Moth",
  "Dorian Veil",
  "Nyx Calder",
  "Ember Solis",
  "Rune Hale",
  "Sera Wisp",
];
