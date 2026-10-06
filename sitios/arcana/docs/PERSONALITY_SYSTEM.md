# Sistema de personalidad

## Dimensiones (18)

picardia, bondad, dominancia, sumision, impulsividad, paciencia, pensamiento_logico, pensamiento_intuitivo, escepticismo, apertura_simbolica, curiosidad, prudencia, empatia, individualismo, perfeccionismo, tolerancia_ambiguedad, necesidad_control, capacidad_renuncia

## Flujo

1. Se seleccionan 20-30 preguntas aleatorias (determinista por semilla) de un banco de 80+
2. Cada respuesta suma puntos a múltiples dimensiones
3. Se calcula dimensión dominante y evitada
4. Se asigna arquetipo principal y secundario
5. Se asigna carta de tarot
6. Se genera semilla de juego y nombre prestado

## Arquetipos

El Observador, El Tramposo, El Guardián, El Dominante, El Errante, El Analista, El Místico, El Solitario, El Compasivo, El Equilibrista, El Sumiso, El Impulsivo

## Modificadores contrarios

| Dimensión dominante | Modificador aplicado |
|---------------------|---------------------|
| impulsividad | require_patience |
| paciencia | require_quick_action |
| picardia | reward_honesty |
| bondad | require_boundaries |
| pensamiento_logico | favor_intuition |
| pensamiento_intuitivo | favor_logic |
| curiosidad | resist_curiosity |
| perfeccionismo | accept_incompleteness |

## Tests

Ver `tests/personality.test.ts`
