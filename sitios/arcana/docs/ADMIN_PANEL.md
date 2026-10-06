# Panel de administración

Ruta: `/admin`

## Acceso

- **Desarrollo:** contraseña `arcana-dev` (requiere `DEV_MODE=true`)
- **Producción:** configurar `ADMIN_PASSWORD_HASH` con hash bcrypt

Generar hash:
```bash
node -e "console.log(require('bcryptjs').hashSync('tu-password', 10))"
```

## Funciones

- Estadísticas agregadas (sesiones, intentos, completados)
- Niveles con más abandono
- Verificación de coordenadas finales seguras
- Salto a nivel en modo desarrollo
- Contador de niveles implementados

## Pendiente

- Edición de textos/pistas en vivo
- Exportar configuración
- Activar/desactivar niveles individualmente
