import type { PersonalityDimension } from "@/types/game";

type PartialScores = Partial<Record<PersonalityDimension, number>>;

export interface PersonalityOption {
  text: string;
  scores: PartialScores;
}

export interface PersonalityQuestion {
  id: string;
  text: string;
  options: PersonalityOption[];
}

export interface PersonalityAnswer {
  questionId: string;
  optionIndex: number;
}

function q(
  id: string,
  text: string,
  options: [string, PartialScores][],
): PersonalityQuestion {
  return {
    id,
    text,
    options: options.map(([text, scores]) => ({ text, scores })),
  };
}

export const PERSONALITY_QUESTIONS: PersonalityQuestion[] = [
  q("q01", "Ves una billetera en la calle. ¿Qué haces primero?", [
    ["La recoges y buscas al dueño", { bondad: 3, empatia: 2 }],
    ["Observas si alguien la reclama", { prudencia: 3, paciencia: 2 }],
    ["La dejas donde está", { escepticismo: 2, individualismo: 2 }],
    ["La examinas antes de decidir", { curiosidad: 3, picardia: 1 }],
  ]),
  q("q02", "Alguien te acusa injustamente frente a otras personas. ¿Cómo reaccionas?", [
    ["Defiendes tu versión con calma", { paciencia: 2, pensamiento_logico: 2 }],
    ["Respondes de inmediato", { impulsividad: 3, dominancia: 2 }],
    ["Esperas a que se calme la situación", { prudencia: 3, sumision: 1 }],
    ["Señalas la manipulación emocional", { escepticismo: 3, pensamiento_logico: 2 }],
  ]),
  q("q03", "Una puerta indica claramente «No entrar». ¿Qué sientes?", [
    ["Respeto y curiosidad contenida", { prudencia: 3, curiosidad: 1 }],
    ["Un impulso irresistible de abrirla", { curiosidad: 3, impulsividad: 2 }],
    ["Indiferencia", { escepticismo: 2, individualismo: 2 }],
    ["Desconfianza hacia quien la cerró", { escepticismo: 3, pensamiento_logico: 1 }],
  ]),
  q("q04", "¿Prefieres descubrir un secreto o proteger a quien lo esconde?", [
    ["Descubrir el secreto", { curiosidad: 3, individualismo: 2 }],
    ["Proteger a quien lo esconde", { bondad: 3, empatia: 2 }],
    ["Depende de las consecuencias", { pensamiento_logico: 2, prudencia: 2 }],
    ["Ninguna de las dos me atrae", { escepticismo: 2, tolerancia_ambiguedad: 2 }],
  ]),
  q("q05", "Encuentras una carta de tarot boca abajo. ¿La giras?", [
    ["Sí, inmediatamente", { curiosidad: 3, impulsividad: 2, apertura_simbolica: 2 }],
    ["Espero un momento antes", { paciencia: 3, prudencia: 2 }],
    ["No la toco", { escepticismo: 2, necesidad_control: 2 }],
    ["La observo sin girarla", { pensamiento_intuitivo: 2, apertura_simbolica: 3 }],
  ]),
  q("q06", "Debes elegir entre ganar y evitar que otra persona pierda. ¿Qué eliges?", [
    ["Ganar", { dominancia: 2, individualismo: 3 }],
    ["Evitar que pierda", { bondad: 3, empatia: 2, capacidad_renuncia: 2 }],
    ["Busco una tercera opción", { pensamiento_logico: 3, picardia: 1 }],
    ["Renuncio a participar", { sumision: 2, capacidad_renuncia: 3 }],
  ]),
  q("q07", "Una persona desconocida te pide que confíes en ella. ¿Qué observas primero?", [
    ["Sus ojos", { empatia: 2, pensamiento_intuitivo: 2 }],
    ["Sus manos", { escepticismo: 2, prudencia: 2 }],
    ["El entorno", { pensamiento_logico: 3, prudencia: 2 }],
    ["Nada en particular; escucho", { paciencia: 2, tolerancia_ambiguedad: 2 }],
  ]),
  q("q08", "¿Sueles terminar lo que comienzas?", [
    ["Casi siempre", { perfeccionismo: 3, paciencia: 2 }],
    ["Cuando me interesa", { individualismo: 2, curiosidad: 2 }],
    ["A veces abandono", { impulsividad: 2, tolerancia_ambiguedad: 2 }],
    ["Termino lo esencial", { pensamiento_logico: 2, capacidad_renuncia: 2 }],
  ]),
  q("q09", "¿Te incomoda más equivocarte o no decidir?", [
    ["Equivocarme", { perfeccionismo: 3, necesidad_control: 2 }],
    ["No decidir", { impulsividad: 2, dominancia: 2 }],
    ["Ambas por igual", { tolerancia_ambiguedad: 3 }],
    ["Ninguna me incomoda mucho", { escepticismo: 2, paciencia: 2 }],
  ]),
  q("q10", "¿Qué harías si una voz pronuncia tu nombre desde una habitación vacía?", [
    ["Entraría a investigar", { curiosidad: 3, impulsividad: 2 }],
    ["Me iría", { prudencia: 3, escepticismo: 2 }],
    ["Respondería desde afuera", { pensamiento_logico: 2, dominancia: 2 }],
    ["Esperaría en silencio", { paciencia: 3, apertura_simbolica: 2 }],
  ]),
  q("q11", "En un grupo, ¿prefieres liderar o seguir?", [
    ["Liderar", { dominancia: 3, necesidad_control: 2 }],
    ["Seguir", { sumision: 3, empatia: 1 }],
    ["Depende del tema", { tolerancia_ambiguedad: 2, pensamiento_logico: 2 }],
    ["Observar desde fuera", { individualismo: 3, escepticismo: 1 }],
  ]),
  q("q12", "Un amigo te pide un favor que te incomoda. ¿Qué haces?", [
    ["Lo hago de todos modos", { bondad: 3, sumision: 2 }],
    ["Pongo un límite claro", { dominancia: 2, necesidad_control: 2 }],
    ["Busco un compromiso", { pensamiento_logico: 2, empatia: 2 }],
    ["Evito responder de inmediato", { prudencia: 3, paciencia: 2 }],
  ]),
  q("q13", "¿Confías más en la lógica o en la intuición?", [
    ["Lógica", { pensamiento_logico: 3, escepticismo: 2 }],
    ["Intuición", { pensamiento_intuitivo: 3, apertura_simbolica: 2 }],
    ["En ambas por igual", { tolerancia_ambiguedad: 3 }],
    ["En ninguna del todo", { escepticismo: 3 }],
  ]),
  q("q14", "Encuentras un diario ajeno entreabierto. ¿Lo lees?", [
    ["Solo una página", { curiosidad: 2, picardia: 2 }],
    ["Lo cierro sin leer", { bondad: 2, prudencia: 3 }],
    ["Lo leo completo", { curiosidad: 3, picardia: 3 }],
    ["Lo devuelvo a su lugar", { empatia: 2, necesidad_control: 2 }],
  ]),
  q("q15", "¿Qué te atrae más: lo conocido o lo desconocido?", [
    ["Lo desconocido", { curiosidad: 3, apertura_simbolica: 2 }],
    ["Lo conocido", { prudencia: 3, necesidad_control: 2 }],
    ["Un equilibrio", { tolerancia_ambiguedad: 2 }],
    ["Lo que puedo controlar", { dominancia: 2, pensamiento_logico: 2 }],
  ]),
  q("q16", "Alguien llora frente a ti sin explicación. ¿Qué haces?", [
    ["Me acerco en silencio", { empatia: 3, bondad: 2 }],
    ["Pregunto qué ocurre", { empatia: 2, impulsividad: 1 }],
    ["Le doy espacio", { prudencia: 2, paciencia: 2 }],
    ["Me siento incómodo y me retiro", { individualismo: 2, escepticismo: 1 }],
  ]),
  q("q17", "¿Prefieres un plan detallado o improvisar?", [
    ["Plan detallado", { perfeccionismo: 3, necesidad_control: 2 }],
    ["Improvisar", { impulsividad: 2, pensamiento_intuitivo: 2 }],
    ["Plan flexible", { tolerancia_ambiguedad: 2, pensamiento_logico: 1 }],
    ["Que otro planifique", { sumision: 2, paciencia: 1 }],
  ]),
  q("q18", "Un símbolo aparece repetidamente en sueños. ¿Qué piensas?", [
    ["Debe significar algo", { apertura_simbolica: 3, pensamiento_intuitivo: 2 }],
    ["Es coincidencia", { escepticismo: 3, pensamiento_logico: 2 }],
    ["Lo investigo", { curiosidad: 3, pensamiento_logico: 1 }],
    ["Lo anoto y sigo adelante", { paciencia: 2, prudencia: 2 }],
  ]),
  q("q19", "¿Te resulta fácil renunciar a algo que deseas?", [
    ["Sí, cuando es necesario", { capacidad_renuncia: 3, bondad: 1 }],
    ["Casi nunca", { dominancia: 2, necesidad_control: 2 }],
    ["Depende de la causa", { pensamiento_logico: 2, empatia: 2 }],
    ["Renuncio antes de intentar", { sumision: 2, prudencia: 2 }],
  ]),
  q("q20", "En un debate, ¿buscas ganar o entender?", [
    ["Ganar", { dominancia: 3, individualismo: 2 }],
    ["Entender", { empatia: 2, pensamiento_logico: 2 }],
    ["Ambas cosas", { perfeccionismo: 2, tolerancia_ambiguedad: 1 }],
    ["Evitar el debate", { sumision: 2, paciencia: 2 }],
  ]),
  q("q21", "¿Qué te molesta más: la mentira o la crueldad?", [
    ["La mentira", { escepticismo: 2, pensamiento_logico: 2 }],
    ["La crueldad", { bondad: 3, empatia: 2 }],
    ["Ambas por igual", { tolerancia_ambiguedad: 2 }],
    ["La manipulación", { escepticismo: 3, picardia: 1 }],
  ]),
  q("q22", "Te ofrecen un atajo dudoso hacia tu meta. ¿Lo tomas?", [
    ["Sí", { picardia: 3, impulsividad: 2 }],
    ["No", { bondad: 2, prudencia: 2 }],
    ["Evalúo los riesgos", { pensamiento_logico: 3, prudencia: 2 }],
    ["Busco otro camino", { perfeccionismo: 2, individualismo: 2 }],
  ]),
  q("q23", "¿Prefieres trabajar solo o en equipo?", [
    ["Solo", { individualismo: 3, necesidad_control: 2 }],
    ["En equipo", { empatia: 2, bondad: 2 }],
    ["Depende del proyecto", { tolerancia_ambiguedad: 2 }],
    ["Lidero el equipo", { dominancia: 3 }],
  ]),
  q("q24", "Un extraño te cuenta un secreto íntimo. ¿Cómo reaccionas?", [
    ["Escucho con atención", { empatia: 3, bondad: 2 }],
    ["Me pregunto por qué me lo dice", { escepticismo: 3, pensamiento_logico: 2 }],
    ["Me siento incómodo", { prudencia: 2, individualismo: 2 }],
    ["Comparto uno propio", { impulsividad: 2, picardia: 1 }],
  ]),
  q("q25", "¿Cuánto toleras la ambigüedad en una situación?", [
    ["Mucho", { tolerancia_ambiguedad: 3, pensamiento_intuitivo: 2 }],
    ["Poco", { necesidad_control: 3, perfeccionismo: 2 }],
    ["Moderadamente", { paciencia: 2, prudencia: 2 }],
    ["La evito activamente", { escepticismo: 2, pensamiento_logico: 2 }],
  ]),
  q("q26", "¿Qué harías con un mapa incompleto?", [
    ["Completarlo por intuición", { pensamiento_intuitivo: 3, apertura_simbolica: 2 }],
    ["Buscar las piezas faltantes", { perfeccionismo: 3, curiosidad: 2 }],
    ["Usarlo tal cual", { tolerancia_ambiguedad: 2, impulsividad: 1 }],
    ["Descartarlo", { escepticismo: 2, prudencia: 2 }],
  ]),
  q("q27", "Alguien te interrumpe mientras hablas. ¿Qué sientes?", [
    ["Irritación", { dominancia: 2, necesidad_control: 2 }],
    ["Indiferencia", { paciencia: 2, tolerancia_ambiguedad: 2 }],
    ["Curiosidad por lo que dice", { empatia: 2, curiosidad: 1 }],
    ["Me callo", { sumision: 3 }],
  ]),
  q("q28", "¿Crees en las sincronicidades?", [
    ["Sí", { apertura_simbolica: 3, pensamiento_intuitivo: 2 }],
    ["No", { escepticismo: 3, pensamiento_logico: 2 }],
    ["A veces", { tolerancia_ambiguedad: 2 }],
    ["Me intrigan pero no confío", { curiosidad: 2, escepticismo: 2 }],
  ]),
  q("q29", "¿Qué prefieres: certeza o posibilidad?", [
    ["Certeza", { necesidad_control: 3, prudencia: 2 }],
    ["Posibilidad", { curiosidad: 3, tolerancia_ambiguedad: 2 }],
    ["Un poco de ambas", { pensamiento_logico: 2 }],
    ["Certeza parcial", { perfeccionismo: 2, escepticismo: 1 }],
  ]),
  q("q30", "Te piden guardar un secreto peligroso. ¿Lo haces?", [
    ["Sí", { bondad: 2, sumision: 2, empatia: 2 }],
    ["No", { escepticismo: 2, individualismo: 2 }],
    ["Depende de quién lo pide", { pensamiento_logico: 2, prudencia: 2 }],
    ["Busco ayuda sin revelarlo", { picardia: 2, empatia: 2 }],
  ]),
  q("q31", "¿Actúas más por impulso o por reflexión?", [
    ["Impulso", { impulsividad: 3 }],
    ["Reflexión", { paciencia: 3, pensamiento_logico: 2 }],
    ["Varía mucho", { tolerancia_ambiguedad: 2 }],
    ["Reflexiono pero actúo rápido", { impulsividad: 1, pensamiento_logico: 2 }],
  ]),
  q("q32", "Un objeto tuyo desaparece y reaparece en otro lugar. ¿Qué piensas?", [
    ["Alguien lo movió", { escepticismo: 2, pensamiento_logico: 2 }],
    ["Algo más ocurrió", { apertura_simbolica: 2, curiosidad: 2 }],
    ["No le doy importancia", { paciencia: 2, tolerancia_ambiguedad: 2 }],
    ["Lo vigilo la próxima vez", { necesidad_control: 3, prudencia: 2 }],
  ]),
  q("q33", "¿Qué valoras más: la verdad o la armonía?", [
    ["Verdad", { escepticismo: 2, pensamiento_logico: 3 }],
    ["Armonía", { bondad: 2, empatia: 3 }],
    ["Ambas cuando es posible", { tolerancia_ambiguedad: 2 }],
    ["Lo que funcione", { picardia: 2, pensamiento_logico: 1 }],
  ]),
  q("q34", "Te invitan a un ritual del que no sabes nada. ¿Aceptas?", [
    ["Sí", { curiosidad: 3, apertura_simbolica: 2 }],
    ["No", { escepticismo: 3, prudencia: 2 }],
    ["Observo sin participar", { paciencia: 2, escepticismo: 2 }],
    ["Pregunto antes de decidir", { pensamiento_logico: 2, prudencia: 2 }],
  ]),
  q("q35", "¿Te consideras perfeccionista?", [
    ["Muy", { perfeccionismo: 3 }],
    ["Algo", { perfeccionismo: 1, tolerancia_ambiguedad: 1 }],
    ["No", { tolerancia_ambiguedad: 2, impulsividad: 1 }],
    ["Solo en lo que importa", { pensamiento_logico: 2, individualismo: 2 }],
  ]),
  q("q36", "Un desconocido te ofrece ayuda sin pedir nada. ¿Qué sospechas?", [
    ["Nada; acepto", { bondad: 2, empatia: 2 }],
    ["Que quiere algo", { escepticismo: 3, prudencia: 2 }],
    ["Depende de la situación", { pensamiento_logico: 2 }],
    ["Rechazo por precaución", { prudencia: 3, individualismo: 2 }],
  ]),
  q("q37", "¿Prefieres seguir reglas o crear las tuyas?", [
    ["Seguir reglas", { sumision: 2, prudencia: 2 }],
    ["Crear las mías", { dominancia: 3, individualismo: 2 }],
    ["Doblar las reglas", { picardia: 3 }],
    ["Reglas flexibles", { tolerancia_ambiguedad: 2 }],
  ]),
  q("q38", "¿Qué haces cuando algo no sale perfecto?", [
    ["Lo rehago", { perfeccionismo: 3 }],
    ["Lo acepto", { capacidad_renuncia: 2, tolerancia_ambiguedad: 2 }],
    ["Lo oculto", { picardia: 2, prudencia: 1 }],
    ["Aprendo y sigo", { pensamiento_logico: 2, paciencia: 2 }],
  ]),
  q("q39", "¿Te identificas con figuras rebeldes o con figuras de autoridad?", [
    ["Rebeldes", { individualismo: 3, picardia: 2 }],
    ["Autoridad", { sumision: 2, prudencia: 2 }],
    ["Ninguna", { escepticismo: 2, tolerancia_ambiguedad: 2 }],
    ["Depende del contexto", { pensamiento_logico: 2 }],
  ]),
  q("q40", "Un reloj se detiene a las 3:33. ¿Qué piensas?", [
    ["Coincidencia", { escepticismo: 3 }],
    ["Señal", { apertura_simbolica: 3, pensamiento_intuitivo: 2 }],
    ["Debe repararse", { pensamiento_logico: 2, necesidad_control: 2 }],
    ["Lo anoto", { curiosidad: 2, prudencia: 2 }],
  ]),
  q("q41", "¿Qué te resulta más difícil: esperar o actuar?", [
    ["Esperar", { impulsividad: 3 }],
    ["Actuar", { paciencia: 3, prudencia: 2 }],
    ["Ambas por igual", { tolerancia_ambiguedad: 2 }],
    ["Decidir cuándo hacer cada una", { pensamiento_logico: 2 }],
  ]),
  q("q42", "Te piden opinión sobre algo que no entiendes. ¿Qué haces?", [
    ["Admito que no sé", { bondad: 1, escepticismo: 2, capacidad_renuncia: 2 }],
    ["Opino de todos modos", { impulsividad: 2, dominancia: 2 }],
    ["Pregunto para entender", { curiosidad: 2, pensamiento_logico: 2 }],
    ["Evito responder", { prudencia: 2, sumision: 2 }],
  ]),
  q("q43", "¿Confías en los signos del entorno?", [
    ["Sí", { apertura_simbolica: 3, pensamiento_intuitivo: 2 }],
    ["No", { escepticismo: 3, pensamiento_logico: 2 }],
    ["A veces", { tolerancia_ambiguedad: 2 }],
    ["Los registro pero no decido por ellos", { prudencia: 2, curiosidad: 2 }],
  ]),
  q("q44", "Alguien te traiciona levemente. ¿Cómo respondes?", [
    ["Perdono", { bondad: 3, empatia: 2 }],
    ["Confronto", { dominancia: 3 }],
    ["Me distancio", { individualismo: 2, prudencia: 2 }],
    ["Espero a ver si se repite", { paciencia: 2, escepticismo: 2 }],
  ]),
  q("q45", "¿Prefieres respuestas claras o preguntas abiertas?", [
    ["Respuestas claras", { necesidad_control: 2, pensamiento_logico: 2 }],
    ["Preguntas abiertas", { curiosidad: 3, tolerancia_ambiguedad: 2 }],
    ["Ambas", { tolerancia_ambiguedad: 2 }],
    ["Depende de mi estado", { pensamiento_intuitivo: 2 }],
  ]),
  q("q46", "¿Qué harías si supieras que nadie te juzgaría?", [
    ["Lo que ya haría", { individualismo: 2, bondad: 1 }],
    ["Algo que normalmente evito", { curiosidad: 2, picardia: 2 }],
    ["Ayudaría más a otros", { bondad: 3, empatia: 2 }],
    ["No cambiaría nada significativo", { prudencia: 2, escepticismo: 1 }],
  ]),
  q("q47", "¿Te resulta fácil pedir ayuda?", [
    ["Sí", { sumision: 2, empatia: 1 }],
    ["No", { individualismo: 3, dominancia: 2 }],
    ["Solo a personas de confianza", { prudencia: 2, empatia: 2 }],
    ["Prefiero resolver solo", { necesidad_control: 2, perfeccionismo: 1 }],
  ]),
  q("q48", "Un libro se abre solo en una página. ¿Qué haces?", [
    ["Leo esa página", { curiosidad: 3, apertura_simbolica: 2 }],
    ["Cierro el libro", { escepticismo: 2, prudencia: 2 }],
    ["Busco explicación racional", { pensamiento_logico: 3 }],
    ["Espero a ver si ocurre de nuevo", { paciencia: 3 }],
  ]),
  q("q49", "¿Qué te define más: lo que haces o lo que sientes?", [
    ["Lo que hago", { pensamiento_logico: 2, dominancia: 2 }],
    ["Lo que siento", { empatia: 2, pensamiento_intuitivo: 2 }],
    ["Ambos", { tolerancia_ambiguedad: 2 }],
    ["Lo que otros ven", { escepticismo: 2, individualismo: 1 }],
  ]),
  q("q50", "Te ofrecen poder a cambio de un secreto tuyo. ¿Aceptas?", [
    ["Sí", { dominancia: 2, picardia: 2 }],
    ["No", { bondad: 2, prudencia: 2 }],
    ["Negocio los términos", { pensamiento_logico: 2, picardia: 2 }],
    ["Fingo aceptar", { picardia: 3, escepticismo: 1 }],
  ]),
  q("q51", "¿Cuánto influyen los sueños en tus decisiones?", [
    ["Mucho", { apertura_simbolica: 3, pensamiento_intuitivo: 2 }],
    ["Nada", { escepticismo: 3, pensamiento_logico: 2 }],
    ["A veces", { tolerancia_ambiguedad: 2 }],
    ["Los registro pero no decido", { curiosidad: 2, prudencia: 2 }],
  ]),
  q("q52", "¿Prefieres ser admirado o ser comprendido?", [
    ["Admirado", { dominancia: 2, individualismo: 2 }],
    ["Comprendido", { empatia: 3, bondad: 2 }],
    ["Ambas cosas", { perfeccionismo: 1 }],
    ["Ninguna me importa", { escepticismo: 2, individualismo: 2 }],
  ]),
  q("q53", "Un niño te pide que le mientas para protegerlo. ¿Lo haces?", [
    ["Sí", { bondad: 2, empatia: 2, picardia: 1 }],
    ["No", { escepticismo: 2, pensamiento_logico: 2 }],
    ["Le digo una verdad parcial", { prudencia: 2, empatia: 2 }],
    ["Cambio de tema", { picardia: 2, sumision: 1 }],
  ]),
  q("q54", "¿Qué te atrae de un lugar abandonado?", [
    ["Su historia", { curiosidad: 3, apertura_simbolica: 2 }],
    ["Nada; me incomoda", { prudencia: 3, escepticismo: 1 }],
    ["Lo que quedó olvidado", { empatia: 2, pensamiento_intuitivo: 2 }],
    ["La posibilidad de encontrar algo", { picardia: 2, curiosidad: 2 }],
  ]),
  q("q55", "¿Eres más cauto o más audaz?", [
    ["Cauto", { prudencia: 3, paciencia: 2 }],
    ["Audaz", { impulsividad: 2, curiosidad: 2 }],
    ["Equilibrado", { tolerancia_ambiguedad: 2 }],
    ["Audaz cuando confío", { dominancia: 2, pensamiento_intuitivo: 1 }],
  ]),
  q("q56", "Te encuentras un espejo roto. ¿Qué haces?", [
    ["Lo evito", { escepticismo: 1, apertura_simbolica: 2, prudencia: 2 }],
    ["Me miro igual", { curiosidad: 2, tolerancia_ambiguedad: 2 }],
    ["Lo limpio o reparo", { necesidad_control: 2, perfeccionismo: 2 }],
    ["Lo dejo donde está", { paciencia: 2, individualismo: 2 }],
  ]),
  q("q57", "¿Qué prefieres: orden o caos creativo?", [
    ["Orden", { necesidad_control: 3, perfeccionismo: 2 }],
    ["Caos creativo", { pensamiento_intuitivo: 2, tolerancia_ambiguedad: 2 }],
    ["Orden con excepciones", { pensamiento_logico: 2 }],
    ["Caos controlado", { picardia: 2, dominancia: 1 }],
  ]),
  q("q58", "Alguien te dice «no deberías estar aquí». ¿Qué sientes?", [
    ["Curiosidad", { curiosidad: 3, picardia: 1 }],
    ["Miedo", { prudencia: 2, sumision: 1 }],
    ["Desafío", { dominancia: 3, individualismo: 2 }],
    ["Indiferencia", { escepticismo: 2, paciencia: 2 }],
  ]),
  q("q59", "¿Crees que el universo es justo?", [
    ["Sí", { bondad: 2, apertura_simbolica: 2 }],
    ["No", { escepticismo: 3 }],
    ["No lo sé", { tolerancia_ambiguedad: 3 }],
    ["Justo con excepciones", { pensamiento_logico: 2 }],
  ]),
  q("q60", "¿Qué harías si pudieras borrar un recuerdo?", [
    ["Borraría uno doloroso", { empatia: 1, capacidad_renuncia: 2 }],
    ["No borraría nada", { bondad: 1, perfeccionismo: 2 }],
    ["Borraría uno vergonzoso", { prudencia: 2, individualismo: 2 }],
    ["Guardaría la opción sin usarla", { prudencia: 3, paciencia: 2 }],
  ]),
  q("q61", "¿Te resulta fácil mentir?", [
    ["Sí", { picardia: 3 }],
    ["No", { bondad: 2, escepticismo: 1 }],
    ["Solo mentiras piadosas", { empatia: 2, picardia: 1 }],
    ["Evito las mentiras", { prudencia: 2, perfeccionismo: 1 }],
  ]),
  q("q62", "Una vela se apaga sola. ¿Qué piensas?", [
    ["Corriente de aire", { escepticismo: 2, pensamiento_logico: 2 }],
    ["Algo más", { apertura_simbolica: 3 }],
    ["No pienso nada", { tolerancia_ambiguedad: 2 }],
    ["La vuelvo a encender", { necesidad_control: 2, impulsividad: 1 }],
  ]),
  q("q63", "¿Prefieres escuchar o hablar?", [
    ["Escuchar", { paciencia: 3, empatia: 2 }],
    ["Hablar", { dominancia: 2, individualismo: 2 }],
    ["Depende", { tolerancia_ambiguedad: 2 }],
    ["Observar sin participar", { escepticismo: 2, individualismo: 2 }],
  ]),
  q("q64", "Te ofrecen ver el futuro. ¿Aceptas?", [
    ["Sí", { curiosidad: 3, apertura_simbolica: 2 }],
    ["No", { escepticismo: 3, prudencia: 2 }],
    ["Solo un fragmento", { prudencia: 2, curiosidad: 2 }],
    ["Prefiero construirlo", { dominancia: 2, individualismo: 2 }],
  ]),
  q("q65", "¿Qué te incomoda más: el silencio o el ruido?", [
    ["Silencio", { impulsividad: 1, curiosidad: 1 }],
    ["Ruido", { paciencia: 1, prudencia: 1 }],
    ["Ambos en exceso", { tolerancia_ambiguedad: 2 }],
    ["Ninguno", { tolerancia_ambiguedad: 3 }],
  ]),
  q("q66", "¿Seguirías instrucciones de una fuente anónima?", [
    ["Sí", { sumision: 2, curiosidad: 2 }],
    ["No", { escepticismo: 3, individualismo: 2 }],
    ["Verificaría primero", { pensamiento_logico: 3, prudencia: 2 }],
    ["Seguiría algunas", { picardia: 2, tolerancia_ambiguedad: 1 }],
  ]),
  q("q67", "¿Qué valoras en una promesa?", [
    ["Que se cumpla", { bondad: 2, perfeccionismo: 2 }],
    ["La intención", { empatia: 2, pensamiento_intuitivo: 2 }],
    ["Las circunstancias", { pensamiento_logico: 2, tolerancia_ambiguedad: 2 }],
    ["No prometo fácilmente", { prudencia: 3 }],
  ]),
  q("q68", "Encuentras una llave sin cerradura conocida. ¿Qué haces?", [
    ["La guardo", { curiosidad: 2, prudencia: 2 }],
    ["Busco la cerradura", { curiosidad: 3, impulsividad: 1 }],
    ["La dejo", { escepticismo: 1, capacidad_renuncia: 2 }],
    ["Pregunto si alguien la perdió", { bondad: 2, empatia: 2 }],
  ]),
  q("q69", "¿Te consideras más lógico o más emocional?", [
    ["Lógico", { pensamiento_logico: 3 }],
    ["Emocional", { empatia: 2, pensamiento_intuitivo: 2 }],
    ["Equilibrado", { tolerancia_ambiguedad: 2 }],
    ["Depende del contexto", { prudencia: 2 }],
  ]),
  q("q70", "Un mensaje aparece en tu pantalla que nadie más ve. ¿Qué haces?", [
    ["Respondo", { curiosidad: 3, impulsividad: 2 }],
    ["Ignoro", { prudencia: 3, escepticismo: 2 }],
    ["Documento y analizo", { pensamiento_logico: 3, paciencia: 2 }],
    ["Busco la fuente", { necesidad_control: 2, curiosidad: 2 }],
  ]),
  q("q71", "¿Qué te resulta más valioso: tiempo o certeza?", [
    ["Tiempo", { impulsividad: 1, tolerancia_ambiguedad: 2 }],
    ["Certeza", { perfeccionismo: 2, necesidad_control: 2 }],
    ["Equilibrio", { pensamiento_logico: 2 }],
    ["Depende", { prudencia: 2 }],
  ]),
  q("q72", "¿Aceptarías un pacto simbólico sin entender sus términos?", [
    ["Sí", { apertura_simbolica: 2, impulsividad: 2 }],
    ["No", { escepticismo: 3, prudencia: 2 }],
    ["Leería antes de firmar", { pensamiento_logico: 3, perfeccionismo: 1 }],
    ["Negociaría los términos", { dominancia: 2, picardia: 1 }],
  ]),
  q("q73", "¿Qué haces cuando alguien llora por culpa tuya?", [
    ["Pido perdón", { bondad: 3, empatia: 2 }],
    ["Explico mi perspectiva", { pensamiento_logico: 2, dominancia: 1 }],
    ["Me retiro", { individualismo: 2, prudencia: 1 }],
    ["Espero a que se calme", { paciencia: 2, empatia: 1 }],
  ]),
  q("q74", "¿Prefieres la soledad o la compañía?", [
    ["Soledad", { individualismo: 3 }],
    ["Compañía", { empatia: 2, bondad: 2 }],
    ["Alternar", { tolerancia_ambiguedad: 2 }],
    ["Compañía selecta", { prudencia: 2, individualismo: 1 }],
  ]),
  q("q75", "Un número aparece repetidamente en tu vida. ¿Qué haces?", [
    ["Investigo su significado", { curiosidad: 3, apertura_simbolica: 2 }],
    ["Lo ignoro", { escepticismo: 3 }],
    ["Lo anoto", { prudencia: 2, pensamiento_logico: 1 }],
    ["Lo uso como guía", { pensamiento_intuitivo: 2, apertura_simbolica: 2 }],
  ]),
  q("q76", "¿Te resulta fácil ceder en una discusión?", [
    ["Sí", { sumision: 3, capacidad_renuncia: 2 }],
    ["No", { dominancia: 3 }],
    ["A veces", { empatia: 2, tolerancia_ambiguedad: 1 }],
    ["Cedo si no importa", { pensamiento_logico: 2, prudencia: 2 }],
  ]),
  q("q77", "¿Qué harías si descubrieras que te observan?", [
    ["Actuaría normal", { prudencia: 2, picardia: 2 }],
    ["Confrontaría al observador", { dominancia: 3 }],
    ["Cambiaría mi comportamiento", { necesidad_control: 2, escepticismo: 1 }],
    ["Me iría", { individualismo: 2, prudencia: 2 }],
  ]),
  q("q78", "¿Confías en tu primera impresión?", [
    ["Sí", { pensamiento_intuitivo: 3 }],
    ["No", { escepticismo: 2, pensamiento_logico: 2 }],
    ["A veces", { tolerancia_ambiguedad: 2 }],
    ["La verifico siempre", { prudencia: 3, perfeccionismo: 1 }],
  ]),
  q("q79", "Te piden elegir entre dos malas opciones. ¿Qué haces?", [
    ["Elijo la menos dañina", { pensamiento_logico: 2, bondad: 2 }],
    ["Rechazo elegir", { sumision: 2, capacidad_renuncia: 2 }],
    ["Busco una tercera vía", { picardia: 2, curiosidad: 2 }],
    ["Elijo al azar", { impulsividad: 2, tolerancia_ambiguedad: 2 }],
  ]),
  q("q80", "¿Qué sientes al cruzar un umbral desconocido?", [
    ["Expectación", { curiosidad: 3, apertura_simbolica: 2 }],
    ["Precaución", { prudencia: 3, escepticismo: 1 }],
    ["Resignación", { sumision: 2, capacidad_renuncia: 2 }],
    ["Determinación", { dominancia: 2, individualismo: 2 }],
  ]),
];
