"""Configuración central del proyecto PixelWall Ads."""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

# Grilla publicitaria
GRID_WIDTH = 100
GRID_HEIGHT = 100
CELL_SIZE = 8  # px en pantalla
PRICE_PER_CELL = 100  # CLP (precio base 1ª compra por celda)
MONTHLY_PRICE_PER_CELL = 50  # CLP cuota mensual por celda para mantener vivo
SUBSCRIPTION_DAYS = 30
GRACE_PERIOD_DAYS = 7  # días en "moribundo" antes de morir

# Ruta oculta del panel admin (cambiar en producción)
ADMIN_PATH = os.environ.get("ADMIN_PATH", "***REMOVED***")

# Base de datos
DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'pixelwall.db'}")

# Subida de archivos
UPLOAD_FOLDER = BASE_DIR / "static" / "uploads"
MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2 MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

# Seguridad
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-production")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "***REMOVED***")

# Flask
DEBUG = os.environ.get("FLASK_DEBUG", "1") == "1"
