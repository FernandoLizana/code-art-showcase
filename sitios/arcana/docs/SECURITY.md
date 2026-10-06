# Seguridad

## Validación servidor

Todas las respuestas se validan en API Routes. El cliente nunca recibe soluciones.

## Rate limiting

10 intentos por minuto por sesión/nivel (configurable).

## Coordenadas finales

Variables `FINAL_SAFE_COORDINATES` y `FINAL_DESTINATION_LABEL` validadas contra términos prohibidos: HOME, CASA, DOMICILIO, PRIVATE, RESIDENTIAL, PERSONAL.

## Privacidad

- Sin GPS, cámara, micrófono
- Sin fingerprinting
- Intentos almacenados como hash SHA-256
- Analíticas agregadas anónimas (pendiente implementación completa)

## Sesión

JWT HS256 en cookie httpOnly, 30 días de expiración.
