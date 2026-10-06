"""Validaciones de negocio y sanitización."""
import re
import uuid
from urllib.parse import urlparse

from config import (
    ALLOWED_EXTENSIONS,
    GRID_HEIGHT,
    GRID_WIDTH,
    MAX_IMAGE_SIZE,
    UPLOAD_FOLDER,
)
from models import Ad

HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def sanitize_text(value, max_length=200):
    """Limpia texto de entrada eliminando espacios extra."""
    if value is None:
        return ""
    return str(value).strip()[:max_length]


def is_valid_url(url):
    """Valida que la URL tenga esquema http/https y host."""
    if not url:
        return False
    parsed = urlparse(url.strip())
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def is_valid_email(email):
    return bool(EMAIL_RE.match(email.strip()))


def is_valid_hex_color(color):
    return bool(HEX_COLOR_RE.match(color.strip()))


def rectangles_overlap(x1, y1, w1, h1, x2, y2, w2, h2):
    """Detecta si dos rectángulos se solapan en la grilla."""
    return not (
        x1 + w1 <= x2 or x2 + w2 <= x1 or y1 + h1 <= y2 or y2 + h2 <= y1
    )


def is_within_bounds(x, y, width, height):
    """Verifica que el rectángulo esté dentro de la grilla."""
    if width < 1 or height < 1:
        return False
    if x < 0 or y < 0:
        return False
    return x + width <= GRID_WIDTH and y + height <= GRID_HEIGHT


def get_pending_ads(exclude_id=None):
    """Anuncios pendientes que bloquean nuevas reservas."""
    query = Ad.query.filter_by(status="pendiente")
    if exclude_id:
        query = query.filter(Ad.id != exclude_id)
    return query.all()


def get_active_ads(exclude_id=None):
    """Anuncios vivos/moribundos que bloquean reemplazo (solo vivos bloquean takeover visual)."""
    query = Ad.query.filter(
        Ad.status == "pagado",
        Ad.life_status.in_(["vivo", "moribundo"]),
    )
    if exclude_id:
        query = query.filter(Ad.id != exclude_id)
    return query.all()


def validate_selection(x, y, width, height, exclude_id=None):
    """
    Valida una selección rectangular.
    Permite solapar anuncios pagados (reemplazo con precio mayor).
    Solo bloquea si hay reservas pendientes en la zona.
    Retorna (ok: bool, message: str).
    """
    if not is_within_bounds(x, y, width, height):
        return False, "La selección se sale de los límites de la grilla."

    for ad in get_pending_ads(exclude_id=exclude_id):
        if rectangles_overlap(x, y, width, height, ad.x, ad.y, ad.width, ad.height):
            return False, "Hay una reserva pendiente en esa zona. Elige otro bloque."

    return True, "Selección válida."


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def save_upload(file):
    """
    Guarda imagen subida con nombre único.
    Retorna (path_relativo, error).
    """
    if not file or not file.filename:
        return None, None

    if not allowed_file(file.filename):
        return None, "Formato no permitido. Usa png, jpg, jpeg, webp o gif."

    file.seek(0, 2)
    size = file.tell()
    file.seek(0)
    if size > MAX_IMAGE_SIZE:
        return None, "La imagen supera el tamaño máximo de 2 MB."

    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    dest = UPLOAD_FOLDER / unique_name
    file.save(dest)
    return f"uploads/{unique_name}", None
