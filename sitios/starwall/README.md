# StarWall

Una galaxia pública donde una marca puede ser una estrella, un planeta o una constelación.

## Stack

Flask, SQLAlchemy y SQLite. El front es HTML, CSS y JavaScript.

## Arranque

```sh
python -m venv venv
```

Windows: `venv\Scripts\activate`. macOS o Linux: `source venv/bin/activate`.

```sh
pip install -r requirements.txt
copy .env.example .env
python app.py
```

En macOS o Linux: `cp .env.example .env`.

Abre [http://127.0.0.1:5000](http://127.0.0.1:5000).

La base `starwall.db` se crea al iniciar y no forma parte del repositorio. Las marcas iniciales son ficticias.

## Rutas

| Método | Ruta | Qué hace |
| --- | --- | --- |
| GET | `/` | Galaxia pública |
| GET | `/buy` | Reservar un lugar |
| GET | `/space/<slug>` | Ficha de una marca |
| GET, POST | `/api/spaces` | Listar o crear |
| POST | `/api/validate-url` | Validar un enlace |
| GET, POST | `/admin` | Panel local |
| POST | `/admin/spaces/<id>/approve` | Aprobar |
| POST | `/admin/spaces/<id>/reject` | Rechazar |
| POST | `/admin/spaces/<id>/delete` | Eliminar |

Define `SECRET_KEY` y `ADMIN_PASSWORD` en `.env`. El código trae un valor de desarrollo solo para probar en local.
