import { matchesAnyVariant } from "@/lib/game/normalize";
import { seedToIndex } from "@/lib/security/hash";
import { deriveSequenceFromSeed } from "@/lib/security/seed";
import { baseVariant, isHighTrait, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

const PARTICIPANT_NAMES = [
  "Elena Voss", "Marcus Thorne", "Iris Chen", "Jonah Hale",
  "Mara Vex", "Silas Reed", "Noctua", "Subject-774",
];

export const level51: LevelDefinition = levelDef({
  id: 51,
  title: "Registro de participante",
  act: 6,
  archetypeTags: ["archive", "record", "identity"],
  mechanic: "archive_record",
  narrativeEntry: "Expediente 51-A. Un nombre entre cientos. ¿Cuál es el tuyo?",
  supportedModifiers: ["favor_logic", "reward_honesty", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 51, this.supportedModifiers);
    const borrowed = context.personality?.borrowedName ?? "Mara Vex";
    const records = PARTICIPANT_NAMES.filter((n) => n !== borrowed).slice(0, 5);
    records.push(borrowed);
    const shuffled = [...records].sort(
      (a, b) => seedToIndex(`${variant.params.levelSeed}:${a}`, 50) - seedToIndex(`${variant.params.levelSeed}:${b}`, 50),
    );
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "archive_record",
        records: shuffled.map((n, i) => ({ id: i, name: n })),
        correctName: borrowed,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { name?: string; recordId?: number };
    const correct = variant.params.correctName as string;
    const borrowed = context.personality?.borrowedName ?? correct;
    if (payload.name && matchesAnyVariant(payload.name, [correct, borrowed])) return { success: true };
    return { success: false, message: "Ese registro no te corresponde." };
  },
  hints: [
    { id: 1, text: "El archivo te prestó un nombre al inicio." },
    { id: 2, text: "Busca el nombre invertido en el nivel siete." },
    { id: 3, text: "Tu nombre prestado está en la lista." },
  ],
});

export const level52: LevelDefinition = levelDef({
  id: 52,
  title: "Código de acceso",
  act: 6,
  archetypeTags: ["archive", "code", "crossref"],
  mechanic: "archive_code",
  narrativeEntry: "Autorización requerida. El código son las iniciales de tres registros marcados.",
  supportedModifiers: ["favor_logic", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 52, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const marked = PARTICIPANT_NAMES.slice(0, 3);
    const code = marked.map((n) => n.split(" ").map((w) => w[0]).join("")).join("");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        markedRecords: marked,
        acceptedAnswers: [code, code.toLowerCase()],
        placeholder: "Código de acceso...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; code?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    const ans = payload.answer ?? payload.code ?? "";
    if (ans && matchesAnyVariant(ans.replace(/\s/g, ""), accepted)) return { success: true };
    return { success: false, message: "Acceso denegado." };
  },
  hints: [
    { id: 1, text: "Tres registros están resaltados." },
    { id: 2, text: "Toma la inicial de cada palabra de cada nombre." },
    { id: 3, text: "EVMTIC — iniciales de los tres nombres marcados." },
  ],
});

export const level53: LevelDefinition = levelDef({
  id: 53,
  title: "Documento redactado",
  act: 6,
  archetypeTags: ["archive", "redacted", "text"],
  mechanic: "redacted_text",
  narrativeEntry: "███ palabras censuradas. Solo los espacios sobreviven legibles.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 53, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const words = ["participante", "observado", "clasificado"];
    const word = words[seedToIndex(`${levelSeed}:word`, words.length)];
    const redacted = word.replace(/./g, "█");
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "redacted_text",
        displayText: `Estado: ${redacted}`,
        acceptedAnswers: [word, word.toUpperCase()],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Redacción incorrecta." };
  },
  hints: [
    { id: 1, text: "Cuenta los bloques censurados." },
    { id: 2, text: "Participante, observado o clasificado." },
    { id: 3, text: "Doce letras: participante." },
  ],
});

export const level54: LevelDefinition = levelDef({
  id: 54,
  title: "Línea temporal",
  act: 6,
  archetypeTags: ["archive", "timeline", "order"],
  mechanic: "timeline",
  narrativeEntry: "Cuatro eventos. Un orden cronológico. El archivo los mezcló.",
  supportedModifiers: ["favor_logic", "require_patience", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 54, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const events = [
      { id: "a", label: "Prueba de personalidad", year: 1 },
      { id: "b", label: "Primer umbral", year: 2 },
      { id: "c", label: "Promesa al archivo", year: 3 },
      { id: "d", label: "Carta elegida", year: 4 },
    ];
    const expectedOrder = events.map((e) => e.id);
    const shuffled = [...events].sort(
      (a, b) => seedToIndex(`${levelSeed}:${a.id}`, 20) - seedToIndex(`${levelSeed}:${b.id}`, 20),
    );
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "timeline",
        events: shuffled,
        expectedOrder,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { order?: string[] };
    const expected = variant.params.expectedOrder as string[];
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true };
    }
    return { success: false, message: "La cronología no coincide." };
  },
  hints: [
    { id: 1, text: "Primero la prueba, luego el umbral." },
    { id: 2, text: "La promesa precede a la carta del nivel diez." },
    { id: 3, text: "a → b → c → d." },
  ],
});

export const level55: LevelDefinition = levelDef({
  id: 55,
  title: "Referencia cruzada",
  act: 6,
  archetypeTags: ["archive", "crossref", "memory"],
  mechanic: "cross_reference",
  narrativeEntry: "Expediente 55 referencia al nivel 14. ¿Qué prometiste?",
  supportedModifiers: ["reward_honesty", "favor_logic", "resist_curiosity"],
  generateVariant(context) {
    const variant = baseVariant(context, 55, this.supportedModifiers);
    const promiseBroken = context.narrative.promise_broken as boolean | undefined;
    const correct = promiseBroken ? "romper" : "mantener";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        referenceLevel: 14,
        acceptedAnswers: [correct, "break", "keep", "romper la promesa", "mantener la promesa"],
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string };
    const promiseBroken = context.narrative.promise_broken as boolean | undefined;
    const correct = promiseBroken ? "romper" : "mantener";
    if (payload.answer && matchesAnyVariant(payload.answer, [correct, "break", "keep"])) {
      return { success: true };
    }
    return { success: false, message: "El expediente no concuerda." };
  },
  hints: [
    { id: 1, text: "Recuerda el nivel catorce." },
    { id: 2, text: "¿Rompiste o mantuviste la promesa?" },
    { id: 3, text: "Tu perfil determinó la acción correcta." },
  ],
});

export const level56: LevelDefinition = levelDef({
  id: 56,
  title: "Entrada eliminada",
  act: 6,
  archetypeTags: ["archive", "deleted", "recovery"],
  mechanic: "deleted_entry",
  narrativeEntry: "Registro borrado. Solo queda el número de expediente: ████.",
  supportedModifiers: ["favor_logic", "resist_curiosity", "require_initiative"],
  generateVariant(context) {
    const variant = baseVariant(context, 56, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const fileNum = 1000 + seedToIndex(`${levelSeed}:file`, 9000);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        hintDigits: String(fileNum).slice(0, 2),
        acceptedAnswers: [String(fileNum), String(fileNum % 10000)],
        placeholder: "Número de expediente...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; fileNumber?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    const ans = payload.answer ?? payload.fileNumber ?? "";
    if (ans && matchesAnyVariant(ans.replace(/\s/g, ""), accepted)) return { success: true };
    return { success: false, message: "Expediente no encontrado." };
  },
  hints: [
    { id: 1, text: "Las dos primeras cifras están visibles." },
    { id: 2, text: "Reconstruye el número de cuatro dígitos." },
    { id: 3, text: "Usa las pistas parciales del registro borrado." },
  ],
});

export const level57: LevelDefinition = levelDef({
  id: 57,
  title: "Testigos en conflicto",
  act: 6,
  archetypeTags: ["archive", "witness", "contradiction"],
  mechanic: "witness_conflict",
  narrativeEntry: "Dos participantes describen el mismo evento. Uno miente.",
  supportedModifiers: ["favor_logic", "reward_honesty", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 57, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const liarIdx = seedToIndex(`${levelSeed}:liar`, 2);
    const witnesses = [
      { id: "a", statement: "Vi cinco cartas en el nivel doce.", truthful: liarIdx !== 0 },
      { id: "b", statement: "Vi tres cartas en el nivel doce.", truthful: liarIdx !== 1 },
    ];
    const correct = witnesses.find((w) => w.truthful)?.id ?? "a";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "witness_conflict",
        witnesses,
        correctWitness: correct,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { witness?: string; choice?: string };
    const correct = variant.params.correctWitness as string;
    if (payload.witness === correct || payload.choice === correct) return { success: true };
    return { success: false, message: "El archivo no valida ese testimonio." };
  },
  hints: [
    { id: 1, text: "El nivel doce mostró cinco cartas." },
    { id: 2, text: "Uno de los testigos inventa el número." },
    { id: 3, text: "Cree al que dice cinco." },
  ],
});

export const level58: LevelDefinition = levelDef({
  id: 58,
  title: "Secuencia de archivos",
  act: 6,
  archetypeTags: ["archive", "sequence", "logic"],
  mechanic: "file_sequence",
  narrativeEntry: "Expedientes numerados: A-2, A-4, A-8, A-?. Completa la serie.",
  supportedModifiers: ["favor_logic", "favor_intuition", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 58, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        sequence: ["A-2", "A-4", "A-8", "A-?"],
        acceptedAnswers: ["A-16", "a-16", "16"],
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "Secuencia incorrecta." };
  },
  hints: [
    { id: 1, text: "Cada número duplica al anterior." },
    { id: 2, text: "2, 4, 8..." },
    { id: 3, text: "A-16." },
  ],
});

export const level59: LevelDefinition = levelDef({
  id: 59,
  title: "Autorización final",
  act: 6,
  archetypeTags: ["archive", "auth", "choices"],
  mechanic: "auth_code",
  narrativeEntry: "Código derivado de tus elecciones acumuladas. Umbral + promesa.",
  supportedModifiers: ["favor_logic", "reward_honesty", "favor_intuition"],
  generateVariant(context) {
    const variant = baseVariant(context, 59, this.supportedModifiers);
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    const promiseBroken = context.narrative.promise_broken ? "R" : "M";
    const code = `${threshold[0].toUpperCase()}${promiseBroken}`;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: [code, code.toLowerCase()],
        placeholder: "Código de autorización...",
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { answer?: string; code?: string };
    const threshold = (context.narrative.threshold_choice as string) ?? "silencio";
    const promiseBroken = context.narrative.promise_broken ? "R" : "M";
    const code = `${threshold[0].toUpperCase()}${promiseBroken}`;
    const ans = payload.answer ?? payload.code ?? "";
    if (ans && matchesAnyVariant(ans.replace(/\s/g, ""), [code, code.toLowerCase()])) {
      return { success: true };
    }
    return { success: false, message: "No autorizado." };
  },
  hints: [
    { id: 1, text: "Primera letra de tu carta del nivel diez." },
    { id: 2, text: "R si rompiste la promesa, M si la mantuviste." },
    { id: 3, text: "Dos letras: S/R, F/R, etc." },
  ],
});

export const level60: LevelDefinition = levelDef({
  id: 60,
  title: "El sello del archivo",
  act: 6,
  archetypeTags: ["archive", "seal", "completion"],
  mechanic: "archive_seal",
  narrativeEntry: "Cierra el expediente. Escribe: ARCHIVUM CLAUDITUR.",
  supportedModifiers: ["require_patience", "favor_logic", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 60, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: ["ARCHIVUM CLAUDITUR", "archivum clauditur", "Archivum Clauditur"],
        placeholder: "Frase de cierre...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      return { success: true, consequences: [{ key: "archive_sealed", value: true }] };
    }
    return { success: false, message: "El sello no acepta eso." };
  },
  hints: [
    { id: 1, text: "Latín ceremonial de cierre." },
    { id: 2, text: "ARCHIVUM CLAUDITUR — el archivo se cierra." },
    { id: 3, text: "Escríbelo exactamente como se indica." },
  ],
});

export const ACT6_LEVELS = [
  level51, level52, level53, level54, level55,
  level56, level57, level58, level59, level60,
];
