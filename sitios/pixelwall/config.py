"""Configuración central del proyecto PixelWall Ads."""
import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _from_env_or_random(name, nbytes=16):
    """Lee una variable de entorno; si falta, genera un valor aleatorio y lo avisa una vez.

    El valor generado se guarda en os.environ para que el proceso hijo del
    recargador de Flask herede el mismo y no imprima otro distinto.
    """
    value = os.environ.get(name)
    if value:
        return value
    value = secrets.token_urlsafe(nbytes)
    os.environ[name] = value
    return value

# Grilla publicitaria
GRID_WIDTH = 100
GRID_HEIGHT = 100
CELL_SIZE = 8  # px en pantalla
PRICE_PER_CELL = 100  # CLP (precio base 1ª compra por celda)
MONTHLY_PRICE_PER_CELL = 50  # CLP cuota mensual por celda para mantener vivo
SUBSCRIPTION_DAYS = 30
GRACE_PERIOD_DAYS = 7  # días en "moribundo" antes de morir

# Ruta del panel admin: se define con ADMIN_PATH (ver .env.example)
_ADMIN_PATH_GENERATED = not os.environ.get("ADMIN_PATH")
ADMIN_PATH = _from_env_or_random("ADMIN_PATH", 12)

# Base de datos
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'pixelwall.db'}")

# Subida de archivos
UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2 MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

# Seguridad
SECRET_KEY = _from_env_or_random("SECRET_KEY", 32)
_ADMIN_PASSWORD_GENERATED = not os.environ.get("ADMIN_PASSWORD")
ADMIN_PASSWORD = _from_env_or_random("ADMIN_PASSWORD")

if _ADMIN_PATH_GENERATED or _ADMIN_PASSWORD_GENERATED:
    print("Aviso: falta ADMIN_PATH o ADMIN_PASSWORD en el entorno (ver .env.example).")
    print("Se generaron valores aleatorios solo para esta ejecución:")
    if _ADMIN_PATH_GENERATED:
        print(f"  Panel admin: /{ADMIN_PATH}")
    if _ADMIN_PASSWORD_GENERATED:
        print(f"  Contraseña admin: {ADMIN_PASSWORD}")

# Flask
DEBUG = os.environ.get("FLASK_DEBUG", "1") == "1"
