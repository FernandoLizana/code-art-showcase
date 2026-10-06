import { matchesAnyVariant } from "@/lib/game/normalize";
import { config } from "@/lib/config";
import { seedToIndex } from "@/lib/security/hash";
import { deriveSequenceFromSeed } from "@/lib/security/seed";
import { baseVariant, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

export const level91: LevelDefinition = levelDef({
  id: 91,
  title: "Fragmentos del camino",
  act: 10,
  archetypeTags: ["place", "path", "fragments"],
  mechanic: "path_fragments",
  narrativeEntry: "Trozos de un mapa. Únelos en orden: norte, este, sur.",
  supportedModifiers: ["favor_logic", "favor_intuition", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 91, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const directions = ["norte", "este", "sur"];
    const shuffled = [...directions].sort(
      (a, b) => seedToIndex(`${levelSeed}:${a}`, 20) - seedToIndex(`${levelSeed}:${b}`, 20),
    );
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "path_fragments",
        fragments: shuffled,
        expectedOrder: directions,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: string[] };
    const expected = variant.params.expectedOrder as string[];
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true };
    }
    return { success: false, message: "El camino no conduce al lugar." };
  },
  hints: [
    { id: 1, text: "Sigue la brújula: N, E, S." },
    { id: 2, text: "Norte primero, luego este, luego sur." },
    { id: 3, text: "norte → este → sur." },
  ],
});

export const level92: LevelDefinition = levelDef({
  id: 92,
  title: "Coordenadas parciales",
  act: 10,
  archetypeTags: ["place", "coordinates", "partial"],
  mechanic: "map_partial",
  narrativeEntry: "Latitud visible. Longitud oculta hasta completar el ritual.",
  supportedModifiers: ["favor_logic", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 92, this.supportedModifiers);
    const coords = config.FINAL_SAFE_COORDINATES.split(",").map((c) => c.trim());
    const lat = coords[0] ?? "0.0";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "map_partial",
        partialLat: lat,
        hideLng: true,
        acceptedAnswers: [lat, `${lat},?`],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { lat?: string; answer?: string };
    const lat = variant.params.partialLat as string;
    if (payload.lat === lat) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, [lat])) return { success: true };
    return { success: false, message: "Esas coordenadas no resuenan." };
  },
  hints: [
    { id: 1, text: "La latitud ya está visible." },
    { id: 2, text: "Confírmala tal como aparece." },
    { id: 3, text: "Solo necesitas la primera coordenada aquí." },
  ],
});

export const level93: LevelDefinition = levelDef({
  id: 93,
  title: "Dirección simbólica",
  act: 10,
  archetypeTags: ["place", "direction", "symbols"],
  mechanic: "direction",
  narrativeEntry: "Símbolos apuntan. Sigue la secuencia del nivel cuatro.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 93, this.supportedModifiers);
    const symbols = context.symbols.length >= 4 ? context.symbols.slice(0, 4) : ["☉", "☽", "△", "▽"];
    const joined = symbols.join("");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        hintSymbols: symbols,
        acceptedAnswers: [joined, joined.toLowerCase(), symbols.join(" ")],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const symbols = context.symbols.length >= 4 ? context.symbols.slice(0, 4) : ["☉", "☽", "△", "▽"];
    const joined = symbols.join("");
    const accepted = [joined, ...((variant.params.acceptedAnswers as string[]) ?? [])];
    if (payload.answer && matchesAnyVariant(payload.answer.replace(/\s/g, ""), accepted.map((a) => a.replace(/\s/g, "")))) {
      return { success: true };
    }
    return { success: false, message: "Esa dirección no lleva al lugar." };
  },
  hints: [
    { id: 1, text: "Recuerda el nivel cuatro: No mires." },
    { id: 2, text: "Cuatro símbolos en orden." },
    { id: 3, text: "Escribe la secuencia sin espacios." },
  ],
});

export const level94: LevelDefinition = levelDef({
  id: 94,
  title: "Tres puertas",
  act: 10,
  archetypeTags: ["place", "doors", "recap"],
  mechanic: "three_doors",
  narrativeEntry: "Tres puertas como al inicio. Elige la que no elegiste antes.",
  supportedModifiers: ["favor_intuition", "reduce_control", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 94, this.supportedModifiers);
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    const doors = ["silencio", "filo", "raiz"];
    const notChosen = doors.filter((d) => d !== threshold);
    const levelSeed = variant.params.levelSeed as string;
    const correct = notChosen[seedToIndex(`${levelSeed}:door`, notChosen.length)];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        doors: doors.map((d) => ({ id: d, label: d.charAt(0).toUpperCase() + d.slice(1) })),
        priorChoice: threshold,
        correctChoice: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    if (payload.choice === threshold) {
      return { success: false, message: "Ya cruzaste esa puerta." };
    }
    if (payload.choice === variant.params.correctChoice) return { success: true };
    const doors = ["silencio", "filo", "raiz"];
    if (payload.choice && doors.includes(payload.choice) && payload.choice !== threshold) {
      return { success: true };
    }
    return { success: false, message: "Esa puerta no conduce al lugar." };
  },
  hints: [
    { id: 1, text: "Nivel diez: elegiste una carta." },
    { id: 2, text: "No repitas tu elección inicial." },
    { id: 3, text: "Cualquiera de las otras dos puertas abre." },
  ],
});

export const level95: LevelDefinition = levelDef({
  id: 95,
  title: "Nombre del lugar",
  act: 10,
  archetypeTags: ["place", "name", "assemble"],
  mechanic: "location_name",
  narrativeEntry: "Letras dispersas forman el nombre del destino.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 95, this.supportedModifiers);
    const label = config.FINAL_DESTINATION_LABEL;
    const words = label.split(" ").filter((w) => w.length > 2);
    const targetWord = words[0] ?? "Lugar";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        fragments: targetWord.split(""),
        acceptedAnswers: [targetWord, targetWord.toLowerCase(), label],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Ese no es el nombre del lugar." };
  },
  hints: [
    { id: 1, text: "Une las letras visibles." },
    { id: 2, text: "La primera palabra del destino final." },
    { id: 3, text: "Consulta FINAL_DESTINATION_LABEL en el despliegue." },
  ],
});

export const level96: LevelDefinition = levelDef({
  id: 96,
  title: "Ritual de llegada",
  act: 10,
  archetypeTags: ["place", "ritual", "arrival"],
  mechanic: "arrival_ritual",
  narrativeEntry: "Toca las esferas en orden: Kéter, Tiféret, Maljut.",
  supportedModifiers: ["favor_logic", "favor_intuition", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 96, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "arrival_ritual",
        sefirot: ["keter", "tiferet", "maljut"],
        expectedOrder: ["keter", "tiferet", "maljut"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: string[] };
    const expected = variant.params.expectedOrder as string[];
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true };
    }
    return { success: false, message: "El ritual no abre el umbral." };
  },
  hints: [
    { id: 1, text: "Del árbol de la vida: corona, centro, reino." },
    { id: 2, text: "Kéter → Tiféret → Maljut." },
    { id: 3, text: "Tres toques en ese orden." },
  ],
});

export const level97: LevelDefinition = levelDef({
  id: 97,
  title: "Palabras del cuaderno",
  act: 10,
  archetypeTags: ["place", "words", "password"],
  mechanic: "words_password",
  narrativeEntry: "El lugar exige una palabra que recogiste en el camino.",
  supportedModifiers: ["favor_logic", "reward_honesty", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 97, this.supportedModifiers);
    const words = context.words.length > 0 ? context.words : [context.personality?.borrowedName ?? "keter"];
    const password = words[words.length - 1];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        wordCount: words.length,
        acceptedAnswers: [password, password.toLowerCase(), ...words],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const words = context.words.length > 0 ? context.words : [context.personality?.borrowedName ?? "keter"];
    const accepted = [...words, ...((variant.params.acceptedAnswers as string[]) ?? [])];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "El lugar no reconoce esa palabra." };
  },
  hints: [
    { id: 1, text: "Revisa tu cuaderno y context.words." },
    { id: 2, text: "Nombre prestado, keter, o palabras de niveles." },
    { id: 3, text: "La última palabra acumulada suele ser la clave." },
  ],
});

export const level98: LevelDefinition = levelDef({
  id: 98,
  title: "Cerca del destino",
  act: 10,
  archetypeTags: ["place", "near", "anticipation"],
  mechanic: "near_destination",
  narrativeEntry: "Ya no estás en el juego. Estás cerca del lugar. Confirma.",
  supportedModifiers: ["require_patience", "accept_incompleteness", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 98, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: ["cerca", "listo", "si", "sí", "yes", "ready"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; ready?: boolean };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.ready) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Aún no estás preparado." };
  },
  hints: [
    { id: 1, text: "Confirma que estás listo." },
    { id: 2, text: "«Cerca» o «listo»." },
    { id: 3, text: "Un paso más y verás las coordenadas." },
  ],
});

export const level99: LevelDefinition = levelDef({
  id: 99,
  title: "Confirmación final",
  act: 10,
  archetypeTags: ["place", "confirmation", "final"],
  mechanic: "confirmation",
  narrativeEntry: "Antes del lugar: ¿Deseas conocer las coordenadas del destino?",
  supportedModifiers: ["require_patience", "reward_honesty", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 99, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "confirmation",
        acceptedAnswers: ["confirmo", "si", "sí", "yes", "acepto"],
        requiresExplicitConfirm: true,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; confirmed?: boolean };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.confirmed) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      return { success: true, consequences: [{ key: "final_confirmed", value: true }] };
    }
    return { success: false, message: "Debes confirmar explícitamente." };
  },
  hints: [
    { id: 1, text: "Este paso es irreversible." },
    { id: 2, text: "Escribe «confirmo» o «acepto»." },
    { id: 3, text: "Confirma para revelar el destino." },
  ],
});

export const level100: LevelDefinition = levelDef({
  id: 100,
  title: "El lugar",
  act: 10,
  archetypeTags: ["place", "destination", "coordinates"],
  mechanic: "final_destination",
  narrativeEntry: "No encontraste este lugar. Lo construiste. Las coordenadas te esperan.",
  supportedModifiers: ["require_patience", "reward_honesty", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 100, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "final_destination",
        coordinatesApiEndpoint: "/api/final/destino",
        showCoordinatesViaApi: true,
      },
    };
  },
  validate(submission, _context, _variant) {
    const payload = submission.payload as {
      coordinates?: string;
      answer?: string;
      arrived?: boolean;
      acknowledge?: boolean;
    };
    const expected = config.FINAL_SAFE_COORDINATES;
    const normalizedExpected = expected.replace(/\s/g, "");
    const submitted = (payload.coordinates ?? payload.answer ?? "").replace(/\s/g, "");
    if (payload.arrived || payload.acknowledge) return { success: true };
    if (submitted && matchesAnyVariant(submitted, [normalizedExpected, expected])) {
      return { success: true, consequences: [{ key: "game_complete", value: true }] };
    }
    if (submitted) {
      const [expLat, expLng] = expected.split(",").map((c) => parseFloat(c.trim()));
      const [subLat, subLng] = (payload.coordinates ?? payload.answer ?? "")
        .split(",")
        .map((c) => parseFloat(c.trim()));
      if (
        !isNaN(expLat) &&
        !isNaN(expLng) &&
        !isNaN(subLat) &&
        !isNaN(subLng) &&
        Math.abs(expLat - subLat) < 0.0001 &&
        Math.abs(expLng - subLng) < 0.0001
      ) {
        return { success: true, consequences: [{ key: "game_complete", value: true }] };
      }
    }
    return { success: false, message: "Esas coordenadas no coinciden con el destino." };
  },
  hints: [
    { id: 1, text: "Las coordenadas se muestran vía API al confirmar." },
    { id: 2, text: "Consulta /api/final/destino o la página final." },
    { id: 3, text: "Introduce las coordenadas exactas del destino seguro." },
  ],
});

export const ACT10_LEVELS = [
  level91, level92, level93, level94, level95,
  level96, level97, level98, level99, level100,
];
