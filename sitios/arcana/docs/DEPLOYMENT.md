# Despliegue

## Desarrollo local

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run dev
```

## Producción

1. Configurar PostgreSQL: `DATABASE_URL=postgresql://...`
2. Generar `SESSION_SECRET` seguro (64+ chars)
3. Configurar `FINAL_SAFE_COORDINATES` con ubicación pública autorizada
4. `npm run build && npm start`

## Docker

⏳ Pendiente (opcional)

## Variables críticas

Ver `.env.example` y `docs/SECURITY.md`
