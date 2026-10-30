# PixelWall Ads

MVP para vender espacios publicitarios en una grilla de píxeles. Los usuarios seleccionan un bloque rectangular, suben su banner y reservan el espacio. Un panel admin aprueba los anuncios para publicarlos en el muro.

## Stack

- **Backend:** Flask + SQLAlchemy + SQLite
- **Frontend:** HTML, CSS y JavaScript vanilla (Canvas)
- **Estilo:** Retro-cyber / pixel art moderno

## Requisitos

- Python 3.10 o superior
- pip

## Instalación

```bash
# Clonar o entrar al directorio del proyecto
cd hardcore_publish

# Crear entorno virtual (recomendado)
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# (Opcional) Configurar variables de entorno
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

## Ejecutar

```bash
python app.py
```

La app estará disponible en **http://localhost:5000**

## Rutas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Página principal con grilla pública |
| GET | `/buy` | Comprar / reservar píxeles (permite reemplazo con precio escalonado) |
| POST | `/ads` | Crear anuncio (estado pendiente) |
| GET | `/<ADMIN_PATH>` | Panel admin (ruta definida con `ADMIN_PATH`) |
| POST | `/<ADMIN_PATH>/ads/<id>/approve` | Aprobar anuncio |
| POST | `/<ADMIN_PATH>/ads/<id>/reject` | Rechazar anuncio |
| POST | `/<ADMIN_PATH>/ads/<id>/delete` | Eliminar anuncio |
| GET | `/api/ads` | API JSON de anuncios |
| POST | `/api/validate-selection` | Validar selección de grilla |

## Configuración

Edita `config.py` para ajustar:

```python
GRID_WIDTH = 100      # Celdas horizontales
GRID_HEIGHT = 100     # Celdas verticales
CELL_SIZE = 8         # Tamaño en px por celda en pantalla
PRICE_PER_CELL = 100  # Precio en CLP por celda
```

Variables de entorno (`.env`):

| Variable | Descripción | Si falta |
|----------|-------------|----------|
| `SECRET_KEY` | Clave de sesión Flask | Aleatoria en cada inicio |
| `ADMIN_PASSWORD` | Contraseña del panel admin | Aleatoria, se muestra una vez en la consola |
| `ADMIN_PATH` | Ruta del panel (sin link público) | Aleatoria, se muestra una vez en la consola |
| `SEED_DATA` | Cargar datos de ejemplo (`1`/`0`) | `1` |
| `FLASK_DEBUG` | Modo debug | `1` |

Configura la ruta y la contraseña de administración con variables de entorno (ver `.env.example`). El código no trae valores por defecto conocidos.

## Probar el flujo completo

1. Abre **http://localhost:5000** — verás el muro con anuncios de ejemplo (pagados).
2. Ve a **Comprar píxeles** (`/buy`).
3. Haz clic en una celda libre y arrastra para formar un rectángulo.
4. Completa el formulario y pulsa **Reservar espacio**.
5. Entra al panel admin en la ruta que definiste en `ADMIN_PATH`, con la contraseña de `ADMIN_PASSWORD` (si no las definiste, la consola muestra las generadas al iniciar).
6. Aprueba el anuncio — si reemplaza píxeles existentes, el anterior pasa a "reemplazado".
7. Volver a **/** — El nuevo anuncio aparece en el muro.

## Precio escalonado (reemplazo)

Puedes comprar encima de píxeles ya vendidos. El precio por celda sube según cuántas veces se ha comprado antes:

| Compra | Precio por celda (base $100) |
|--------|------------------------------|
| 1ª vez | $100 |
| 2ª vez | $200 |
| 3ª vez | $300 |
| n-ésima | $100 × n |

Si seleccionas un bloque mixto (celdas nuevas + ya vendidas), cada celda se cobra según su historial individual.

## Datos de ejemplo

Al iniciar por primera vez se cargan 4 anuncios de ejemplo (3 pagados, 1 pendiente) si `SEED_DATA=1` y la base de datos está vacía.

Para reiniciar datos:

```bash
# Eliminar la base de datos y reiniciar
del pixelwall.db        # Windows
# rm pixelwall.db       # macOS/Linux
python app.py
```

## Estructura del proyecto

```
hardcore_publish/
├── app.py              # Aplicación Flask y rutas
├── config.py           # Constantes configurables
├── models.py           # Modelo Ad (SQLAlchemy)
├── validators.py       # Validaciones y subida de archivos
├── pricing.py          # Precio escalonado y reemplazos
├── requirements.txt
├── templates/
│   ├── base.html
│   ├── index.html
│   ├── buy.html
│   ├── admin.html
│   └── admin_login.html
├── static/
│   ├── css/styles.css
│   ├── js/grid.js
│   └── uploads/        # Imágenes subidas
└── pixelwall.db        # SQLite (se crea al iniciar)
```

## Próximos pasos sugeridos

- Integrar **Mercado Pago** para pagos automáticos (cambiar estado a `pagado` vía webhook).
- Agregar autenticación completa para admin.
- Email de confirmación al reservar.
- Vista previa del banner antes de reservar.

## Licencia

MIT — úsalo libremente para tu proyecto.
