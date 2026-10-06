# Seguridad ARG — Coordenadas finales

## Reglas

1. Solo lugares **públicos**, turísticos, negocios autorizados o **ficticios**
2. Nunca direcciones residenciales
3. Validación automática contra términos prohibidos
4. Confirmación explícita en nivel 99 antes de revelar

## Desarrollo

Usar coordenadas ficticias:
```
FINAL_SAFE_COORDINATES="0.0,0.0"
FINAL_DESTINATION_LABEL="Lugar ficticio — configurar antes del despliegue"
```

## Producción

Configurar con un punto público verificado y autorizado para la experiencia ARG.
