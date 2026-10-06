# Arquitectura — ARCANA OBSCURA

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** API Routes de Next.js
- **Base de datos:** SQLite (dev) / PostgreSQL (prod) via Prisma 7
- **Validación:** Zod
- **Sesión:** JWT firmado (jose) en cookie httpOnly
- **Tests:** Vitest

## Capas

```
┌─────────────────────────────────────────┐
│  Pages (React) — interacción visual     │
├─────────────────────────────────────────┤
│  API Routes — validación servidor       │
├─────────────────────────────────────────┤
│  Level Engine — registry + variants     │
├─────────────────────────────────────────┤
│  Personality Engine — scoring + seed    │
├─────────────────────────────────────────┤
│  Prisma — persistencia SQLite/PG         │
└─────────────────────────────────────────┘
```

## Seguridad

- Soluciones derivadas en servidor desde semilla + personalidad
- Respuestas hasheadas (SHA-256), nunca expuestas en HTML
- Rate limiting por sesión/nivel
- Tokens JWT firmados para progreso
- Validación de coordenadas finales contra términos prohibidos

## Personalización determinista

Cada puzzle usa:
1. Semilla de sesión
2. Semilla de juego (derivada del arquetipo)
3. Modificador contrario a la personalidad dominante
4. Historial narrativo acumulado

## Modelos principales

- `GameSession` — sesión, personalidad, progreso global
- `LevelProgress` — estado por nivel
- `LevelAttempt` — intentos hasheados
- `NotebookEntry` — cuaderno del jugador

## Extensibilidad

Nuevos niveles implementan `LevelDefinition` en `src/lib/levels/` y se registran en `registry.ts`.
