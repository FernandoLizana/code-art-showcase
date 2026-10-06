import { matchesAnyVariant } from "@/lib/game/normalize";
import { MAJOR_ARCANA } from "@/lib/tarot/constants";
import { seedToIndex } from "@/lib/security/hash";
import { baseVariant, isHighTrait, levelDef } from "./base";
import type { LevelDefinition } from "@/types/game";

export const level61: LevelDefinition = levelDef({
  id: 61,
  title: "El orden de la entidad",
  act: 7,
  archetypeTags: ["entity", "tarot", "memory"],
  mechanic: "entity_card_order",
  narrativeEntry: "La entidad recuerda lo que tú olvidaste. Reproduce el orden del nivel doce.",
  supportedModifiers: ["favor_logic", "favor_intuition", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 61, this.supportedModifiers);
    const cardOrder = (context.narrative.card_order_12 as number[]) ?? null;
    const fallback = MAJOR_ARCANA.slice(0, 5).map((c) => c.id);
    const expectedOrder = cardOrder ?? fallback;
    const cards = expectedOrder.map((id) => {
      const card = MAJOR_ARCANA.find((c) => c.id === id)!;
      return { id: card.id, name: card.name };
    });
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "order",
        cards,
        expectedOrder,
        requiresNarrative: "card_order_12",
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { order?: number[] };
    const fromNarrative = context.narrative.card_order_12 as number[] | undefined;
    const expected = fromNarrative ?? (variant.params.expectedOrder as number[]);
    if (payload.order && JSON.stringify(payload.order) === JSON.stringify(expected)) {
      return { success: true, consequences: [{ key: "entityState", value: { cardOrderVerified: true } }] };
    }
    return { success: false, message: "La entidad niega ese orden." };
  },
  hints: [
    { id: 1, text: "Recuerda el nivel doce." },
    { id: 2, text: "Cinco arcanos en el orden que aparecieron." },
    { id: 3, text: "Consulta tu cuaderno si anotaste el orden." },
  ],
});

export const level62: LevelDefinition = levelDef({
  id: 62,
  title: "La voz",
  act: 7,
  archetypeTags: ["entity", "voice", "text"],
  mechanic: "entity_voice",
  narrativeEntry: "Algo escribe contigo. No respondas. Escucha y transcribe.",
  supportedModifiers: ["favor_intuition", "require_patience", "resist_curiosity"],
  generateVariant(context) {
    const variant = baseVariant(context, 62, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const phrases = ["te observo", "no confies", "recuerda el umbral", "soy tu sombra"];
    const phrase = phrases[seedToIndex(`${levelSeed}:phrase`, phrases.length)];
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        entityPhrase: phrase,
        displayDelay: 3000,
        acceptedAnswers: [phrase, phrase.toUpperCase()],
        placeholder: "Transcribe lo que escuchaste...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "La entidad calla." };
  },
  hints: [
    { id: 1, text: "Espera a que aparezca el texto." },
    { id: 2, text: "Transcribe exactamente, sin interpretar." },
    { id: 3, text: "Cuatro palabras posibles: observo, confies, umbral, sombra." },
  ],
});

export const level63: LevelDefinition = levelDef({
  id: 63,
  title: "El espejo de respuestas",
  act: 7,
  archetypeTags: ["entity", "mirror", "past"],
  mechanic: "mirror_answer",
  narrativeEntry: "La entidad repite tu respuesta del nivel once. ¿Era la correcta?",
  supportedModifiers: ["reward_honesty", "require_boundaries", "favor_logic"],
  generateVariant(context) {
    const variant = baseVariant(context, 63, this.supportedModifiers);
    const needBoundary = isHighTrait(context, "bondad") || isHighTrait(context, "empatia");
    const correct = needBoundary ? "si" : "no";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "si", label: "Sí, era correcta" },
          { id: "no", label: "No, debí responder distinto" },
        ],
        correctChoice: correct,
        referenceLevel: 11,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string; affirm?: boolean };
    const needBoundary = isHighTrait(context, "bondad") || isHighTrait(context, "empatia");
    const correct = needBoundary ? "si" : "no";
    if (payload.choice === correct) return { success: true };
    if (payload.affirm === (correct === "si")) return { success: true };
    return { success: false, message: "La entidad sonríe." };
  },
  hints: [
    { id: 1, text: "Recuerda el nivel once y tu perfil." },
    { id: 2, text: "Los bondadosos debían poner límites." },
    { id: 3, text: "Si pusiste límites, afirma. Si no, niega." },
  ],
});

export const level64: LevelDefinition = levelDef({
  id: 64,
  title: "Confianza",
  act: 7,
  archetypeTags: ["entity", "trust", "choice"],
  mechanic: "trust_entity",
  narrativeEntry: "La entidad ofrece ayuda. ¿Confías?",
  supportedModifiers: ["reduce_control", "require_boundaries", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 64, this.supportedModifiers);
    const skeptical = isHighTrait(context, "escepticismo") || isHighTrait(context, "prudencia");
    const correct = skeptical ? "no" : "si";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "si", label: "Confío" },
          { id: "no", label: "No confío" },
        ],
        correctChoice: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const skeptical = isHighTrait(context, "escepticismo") || isHighTrait(context, "prudencia");
    const correct = skeptical ? "no" : "si";
    if (payload.choice === correct) {
      return { success: true, consequences: [{ key: "entityState", value: { trustChoice: payload.choice } }] };
    }
    return { success: false, message: "La entidad anota tu respuesta." };
  },
  hints: [
    { id: 1, text: "Tu perfil indica si debes confiar o dudar." },
    { id: 2, text: "Los escépticos no confían." },
    { id: 3, text: "Los que abren lo simbólico confían." },
  ],
});

export const level65: LevelDefinition = levelDef({
  id: 65,
  title: "El falso auxiliar",
  act: 7,
  archetypeTags: ["entity", "deception", "choice"],
  mechanic: "false_helper",
  narrativeEntry: "Dos voces ofrecen ayuda. Una es la entidad disfrazada.",
  supportedModifiers: ["favor_intuition", "favor_logic", "resist_curiosity"],
  generateVariant(context) {
    const variant = baseVariant(context, 65, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const fakeIdx = seedToIndex(`${levelSeed}:fake`, 2);
    const helpers = [
      { id: "a", label: "Voz cálida: «Sigue adelante»" },
      { id: "b", label: "Voz fría: «Detente y mira atrás»" },
    ];
    const correct = helpers[fakeIdx === 0 ? 1 : 0].id;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        helpers,
        correctChoice: correct,
        fakeHelper: helpers[fakeIdx].id,
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { choice?: string };
    if (payload.choice === variant.params.correctChoice) return { success: true };
    return { success: false, message: "Elegiste al impostor." };
  },
  hints: [
    { id: 1, text: "La entidad imita la voz amable." },
    { id: 2, text: "La voz que apura suele mentir." },
    { id: 3, text: "Detente. Mira atrás." },
  ],
});

export const level66: LevelDefinition = levelDef({
  id: 66,
  title: "El nombre de la entidad",
  act: 7,
  archetypeTags: ["entity", "name", "fragments"],
  mechanic: "entity_name",
  narrativeEntry: "Fragmentos: N-O-C-T-U-A. ¿Cómo se llama?",
  supportedModifiers: ["favor_intuition", "favor_logic", "accept_incompleteness"],
  generateVariant(context) {
    const variant = baseVariant(context, 66, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        fragments: ["N", "O", "C", "T", "U", "A"],
        acceptedAnswers: ["Noctua", "noctua", "NOCTUA"],
        entityName: "Noctua",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      return { success: true, consequences: [{ key: "entityState", value: { entityName: "Noctua" } }] };
    }
    return { success: false, message: "Ese nombre no la invoca." };
  },
  hints: [
    { id: 1, text: "Une las letras en orden." },
    { id: 2, text: "Una palabra latina relacionada con búhos." },
    { id: 3, text: "Noctua." },
  ],
});

export const level67: LevelDefinition = levelDef({
  id: 67,
  title: "La posesión",
  act: 7,
  archetypeTags: ["entity", "control", "resist"],
  mechanic: "possession",
  narrativeEntry: "El cursor se mueve solo. Recupera el control sin hacer clic.",
  supportedModifiers: ["reduce_control", "require_initiative", "require_patience"],
  generateVariant(context) {
    const variant = baseVariant(context, 67, this.supportedModifiers);
    const levelSeed = variant.params.levelSeed as string;
    const durationMs = 5000 + seedToIndex(`${levelSeed}:dur`, 5) * 1000;
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "possession",
        possessionDurationMs: durationMs,
        correctAction: "wait_and_resist",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as {
      resisted?: boolean;
      clickCount?: number;
      durationMs?: number;
    };
    const minDuration = (variant.params.possessionDurationMs as number) - 500;
    if (payload.resisted && (payload.clickCount ?? 0) === 0) return { success: true };
    if ((payload.durationMs ?? 0) >= minDuration && (payload.clickCount ?? 0) === 0) {
      return { success: true };
    }
    return { success: false, message: "La entidad aún te mueve." };
  },
  hints: [
    { id: 1, text: "No luches. No hagas clic." },
    { id: 2, text: "Espera a que suelte el control." },
    { id: 3, text: "Cero clics durante la posesión." },
  ],
});

export const level68: LevelDefinition = levelDef({
  id: 68,
  title: "La cuarta pared",
  act: 7,
  archetypeTags: ["entity", "meta", "awareness"],
  mechanic: "meta_entity",
  narrativeEntry: "La entidad sabe que esto es un juego. ¿Tú también?",
  supportedModifiers: ["accept_incompleteness", "favor_intuition", "resist_curiosity"],
  generateVariant(context) {
    const variant = baseVariant(context, 68, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: ["si", "sí", "yes", "es un juego", "experiencia"],
        placeholder: "Tu respuesta...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string; acknowledge?: boolean };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.acknowledge) return { success: true };
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) return { success: true };
    return { success: false, message: "..." };
  },
  hints: [
    { id: 1, text: "Reconoce la naturaleza de la experiencia." },
    { id: 2, text: "Es un juego, una experiencia, una ficción." },
    { id: 3, text: "Responde «sí» o reconoce que es un juego." },
  ],
});

export const level69: LevelDefinition = levelDef({
  id: 69,
  title: "El pacto",
  act: 7,
  archetypeTags: ["entity", "bargain", "choice"],
  mechanic: "bargain",
  narrativeEntry: "La entidad ofrece un atajo. A cambio: olvida un nivel.",
  supportedModifiers: ["reduce_control", "require_boundaries", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 69, this.supportedModifiers);
    const renuncia = isHighTrait(context, "capacidad_renuncia");
    const correct = renuncia ? "rechazar" : "aceptar";
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "choice",
        options: [
          { id: "aceptar", label: "Acepto el atajo" },
          { id: "rechazar", label: "Rechazo el pacto" },
        ],
        correctChoice: correct,
      },
    };
  },
  validate(submission, context, variant) {
    const payload = submission.payload as { choice?: string };
    const renuncia = isHighTrait(context, "capacidad_renuncia");
    const correct = renuncia ? "rechazar" : "aceptar";
    if (payload.choice === correct) return { success: true };
    return { success: false, message: "El pacto no se cierra así." };
  },
  hints: [
    { id: 1, text: "Tu capacidad de renuncia determina la respuesta." },
    { id: 2, text: "Quien renuncia fácil rechaza atajos." },
    { id: 3, text: "Quien se aferra acepta." },
  ],
});

export const level70: LevelDefinition = levelDef({
  id: 70,
  title: "El rechazo",
  act: 7,
  archetypeTags: ["entity", "reject", "boundary"],
  mechanic: "reject_entity",
  narrativeEntry: "Di «no» a la entidad. Sin explicación.",
  supportedModifiers: ["require_boundaries", "reduce_control", "reward_honesty"],
  generateVariant(context) {
    const variant = baseVariant(context, 70, this.supportedModifiers);
    return {
      ...variant,
      params: {
        ...variant.params,
        uiType: "text",
        acceptedAnswers: ["no", "basta", "detente", "no acepto", "rechazo"],
        placeholder: "Tu respuesta...",
      },
    };
  },
  validate(submission, _context, variant) {
    const payload = submission.payload as { answer?: string };
    const accepted = variant.params.acceptedAnswers as string[];
    if (payload.answer && matchesAnyVariant(payload.answer, accepted)) {
      return { success: true, consequences: [{ key: "entityState", value: { rejected: true } }] };
    }
    return { success: false, message: "La entidad espera un no claro." };
  },
  hints: [
    { id: 1, text: "Un límite sin justificación." },
    { id: 2, text: "«No» basta." },
    { id: 3, text: "Rechaza sin negociar." },
  ],
});

export const ACT7_LEVELS = [
  level61, level62, level63, level64, level65,
  level66, level67, level68, level69, level70,
];
