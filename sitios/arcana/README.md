# ARCANA OBSCURA

Experiencia web de terror esotérico: 100 niveles de puzzles personalizados contra tu personalidad, con tarot, Cábala y narrativa de creepypasta interactiva.

## Requisitos

- Node.js 20+
- npm 10+

## Instalación

```bash
npm install
cp .env.example .env
npm run db:migrate
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Comandos

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Tests E2E (Playwright) |
| `npm run db:migrate` | Migraciones Prisma |
| `npm run db:push` | Push schema sin migración |

## Estructura

```
src/
  app/           # Rutas Next.js (App Router)
  components/    # UI y niveles
  lib/           # Lógica: personalidad, niveles, sesión, seguridad
  types/         # Tipos TypeScript
prisma/          # Esquema SQLite (PostgreSQL en producción)
tests/           # Tests Vitest
docs/            # Documentación
```

## Rutas

- `/` — Entrada
- `/advertencia` — Advertencia inicial
- `/prueba` — Test de personalidad (20-30 preguntas)
- `/resultado` — Arquetipo y carta asignada
- `/umbral` — Inicio de niveles
- `/nivel/[numero]` — Niveles 1-100
- `/cuaderno` — Notas del jugador
- `/archivo` — Registros narrativos
- `/configuracion` — Recuperación y accesibilidad
- `/final` — Destino final (coordenadas seguras)

## Variables de entorno

Ver `.env.example`. **Crítico para producción:**

- `SESSION_SECRET` — Mínimo 32 caracteres
- `FINAL_SAFE_COORDINATES` — Solo lugares públicos o ficticios
- `FINAL_DESTINATION_LABEL` — Sin términos residenciales

## Estado actual

- ✅ 100 niveles con validación en servidor
- ✅ Prueba de personalidad (80 preguntas)
- ✅ Motor de niveles modular por actos
- ✅ Panel admin (`/admin`, dev: `arcana-dev`)
- ✅ Audio ambiental opcional (Web Audio API)
- ✅ Tests unitarios (28+) y E2E básicos (Playwright)
- ✅ Cuaderno, archivo, configuración, recuperación de partida

## Licencia

Privado — todos los derechos reservados.
