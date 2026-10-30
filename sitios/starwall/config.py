"""Configuración central de StarWall Ads."""
import os
import secrets

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


def _from_env_or_random(name, nbytes=16):
    """Lee una variable de entorno; si falta, genera un valor aleatorio.

    El valor generado se guarda en os.environ para que el proceso hijo del
    recargador de Flask herede el mismo.
    """
    value = os.environ.get(name)
    if value:
        return value
    value = secrets.token_urlsafe(nbytes)
    os.environ[name] = value
    return value


# ── App ──────────────────────────────────────────────────────────────────────
SECRET_KEY = _from_env_or_random("SECRET_KEY", 32)
_ADMIN_PASSWORD_GENERATED = not os.environ.get("ADMIN_PASSWORD")
ADMIN_PASSWORD = _from_env_or_random("ADMIN_PASSWORD")
if _ADMIN_PASSWORD_GENERATED:
    print("Aviso: falta ADMIN_PASSWORD en el entorno (ver .env.example).")
    print(f"  Contraseña admin generada solo para esta ejecución: {ADMIN_PASSWORD}")
DATABASE_URI = os.environ.get("DATABASE_URI", f"sqlite:///{os.path.join(BASE_DIR, 'starwall.db')}")

# ── Uploads ──────────────────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
MAX_CONTENT_LENGTH = 2 * 1024 * 1024  # 2 MB
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "svg"}

# ── Universo ─────────────────────────────────────────────────────────────────
UNIVERSE_WIDTH = 1800
UNIVERSE_HEIGHT = 1000
MAX_POSITION_ATTEMPTS = 200

# ── Tipos de espacio: precio (CLP), tamaño visual (px), distancia mínima ─────
SPACE_TYPES = {
    "star_small": {
        "label": "Estrella pequeña",
        "price": 3000,
        "size": 8,
        "min_distance": 30,
        "description": "Ideal para emprendedores que quieren aparecer en el universo digital.",
        "benefit": "Visibilidad básica en la galaxia.",
        "category_group": "star",
    },
    "star_medium": {
        "label": "Estrella mediana",
        "price": 7000,
        "size": 14,
        "min_distance": 40,
        "description": "Perfecta para negocios locales que buscan destacar.",
        "benefit": "Mayor brillo y visibilidad en el mapa.",
        "category_group": "star",
    },
    "star_large": {
        "label": "Estrella grande",
        "price": 15000,
        "size": 22,
        "min_distance": 55,
        "description": "Para marcas destacadas que quieren brillar con fuerza.",
        "benefit": "Alta visibilidad y tooltip destacado.",
        "category_group": "star",
    },
    "planet_small": {
        "label": "Planeta pequeño",
        "price": 50000,
        "size": 50,
        "min_distance": 90,
        "description": "Ideal para PyMEs fuertes o sponsors regionales.",
        "benefit": "Presencia planetaria con animación de flotación.",
        "category_group": "planet",
    },
    "planet_large": {
        "label": "Planeta grande",
        "price": 150000,
        "size": 90,
        "min_distance": 140,
        "description": "Ideal para empresas o sponsors principales con máxima visibilidad.",
        "benefit": "Máxima presencia visual en el universo.",
        "category_group": "planet",
    },
    "constellation": {
        "label": "Constelación",
        "price": 250000,
        "size": 18,
        "min_distance": 120,
        "description": "Paquete premium: grupo de estrellas conectadas para dominar una categoría.",
        "benefit": "Grupo de 5-8 estrellas conectadas con máximo impacto.",
        "category_group": "constellation",
        "star_count": 6,
    },
}

# ── Categorías ───────────────────────────────────────────────────────────────
CATEGORIES = [
    "Emprendimientos",
    "Restaurantes",
    "Belleza",
    "Tecnología",
    "Educación",
    "Salud y bienestar",
    "Servicios locales",
    "Tiendas online",
    "Profesionales",
    "Otros",
]

# ── Estados ──────────────────────────────────────────────────────────────────
STATUS_PENDING = "pendiente"
STATUS_PAID = "pagado"
STATUS_REJECTED = "rechazado"

# ── Mercado Pago (placeholder para integración futura) ───────────────────────
# MERCADOPAGO_ACCESS_TOKEN = os.environ.get("MERCADOPAGO_ACCESS_TOKEN")
# MERCADOPAGO_PUBLIC_KEY = os.environ.get("MERCADOPAGO_PUBLIC_KEY")
# PAYMENT_WEBHOOK_URL = os.environ.get("PAYMENT_WEBHOOK_URL", "/api/payments/webhook")
