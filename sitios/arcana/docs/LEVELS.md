# Niveles — Estado de implementación

| Acto | Niveles | Estado |
|------|---------|--------|
| I — El llamado | 1–10 | ✅ Implementados |
| II — El espejo | 11–20 | ✅ Implementados |
| III — Los arcanos | 21–30 | ✅ Implementados |
| IV — El árbol | 31–40 | ✅ Implementados |
| V — La inversión | 41–50 | ✅ Implementados |
| VI — El archivo | 51–60 | ✅ Implementados |
| VII — La entidad | 61–70 | ✅ Implementados |
| VIII — La ausencia | 71–80 | ✅ Implementados |
| IX — El juicio | 81–90 | ✅ Implementados |
| X — El lugar | 91–100 | ✅ Implementados |

**Total: 100/100 niveles con lógica de validación en servidor.**

Cada nivel incluye:
- `generateVariant()` personalizado por semilla y personalidad
- `validate()` en servidor (respuestas no expuestas al cliente)
- 3 pistas progresivas
- `uiType` para renderizado en cliente via `LevelRenderer` / `LevelGeneric`

## Dependencias entre niveles

| Nivel | Depende de |
|-------|------------|
| 7 | Nombre prestado (persistido en perfil) |
| 12 → 61 | Orden de cartas en `narrative.card_order_12` |
| 38 | Palabra del nivel 7 (`borrowedName`) |
| 43, 44 | Acceso via `/archivo` |
| 99 → 100 | Confirmación antes de coordenadas finales |

## Archivos

- `src/lib/levels/act1-extra.ts` — Niveles 6–10
- `src/lib/levels/act2.ts` — Niveles 11–20
- `src/lib/levels/act3.ts` — Niveles 21–30
- ... hasta `act10.ts`
- `src/lib/levels/registry.ts` — Registro unificado

Las soluciones completas permanecen solo en el servidor.
