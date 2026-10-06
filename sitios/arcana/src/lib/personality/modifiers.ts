import type { PersonalityDimension, PersonalityModifier } from "@/types/game";

const MODIFIER_MAP: Record<PersonalityDimension, PersonalityModifier> = {
  picardia: "reward_honesty",
  bondad: "require_boundaries",
  dominancia: "reduce_control",
  sumision: "require_initiative",
  impulsividad: "require_patience",
  paciencia: "require_quick_action",
  pensamiento_logico: "favor_intuition",
  pensamiento_intuitivo: "favor_logic",
  escepticismo: "favor_intuition",
  apertura_simbolica: "favor_logic",
  curiosidad: "resist_curiosity",
  prudencia: "require_quick_action",
  empatia: "require_boundaries",
  individualismo: "reduce_control",
  perfeccionismo: "accept_incompleteness",
  tolerancia_ambiguedad: "favor_logic",
  necesidad_control: "reduce_control",
  capacidad_renuncia: "require_initiative",
};

export function getContraryModifiers(
  dominantDimension: PersonalityDimension,
  avoidedDimension: PersonalityDimension,
): PersonalityModifier[] {
  const primary = MODIFIER_MAP[dominantDimension];
  const secondary = MODIFIER_MAP[avoidedDimension];
  const modifiers = [primary];
  if (secondary !== primary) modifiers.push(secondary);
  return modifiers;
}

export function selectLevelModifier(
  supported: PersonalityModifier[],
  contrary: PersonalityModifier[],
  levelSeed: string,
): PersonalityModifier {
  for (const mod of contrary) {
    if (supported.includes(mod)) return mod;
  }
  const hash = levelSeed.charCodeAt(0) + levelSeed.charCodeAt(1);
  return supported[hash % supported.length] ?? supported[0];
}
