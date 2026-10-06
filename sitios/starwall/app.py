"""
StarWall Ads — Aplicación principal.

Ejecutar: python app.py

Integración Mercado Pago (futuro):
  Ver config.py para variables MERCADOPAGO_*.
  El flujo de pago se activará en POST /api/spaces reemplazando
  el guardado directo como 'pendiente' por la creación de una
  preferencia de pago y actualización vía webhook.
"""
import math
import os
import random
import re
import uuid
from functools import wraps
from urllib.parse import urlparse

import bleach
from email_validator import EmailNotValidError, validate_email
from flask import (
    Flask,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from werkzeug.utils import secure_filename

import config
from models import SpaceAd, db

app = Flask(__name__)
app.config["SECRET_KEY"] = config.SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = config.DATABASE_URI
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH
app.config["UPLOAD_FOLDER"] = config.UPLOAD_FOLDER

db.init_app(app)

os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)


# ── Utilidades ───────────────────────────────────────────────────────────────

def slugify(text: str) -> str:
    """Genera un slug URL-safe a partir de texto."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_-]+", "-", text)
    return text[:80] or "marca"


def unique_slug(base: str) -> str:
    """Asegura que el slug sea único en la base de datos."""
    slug = slugify(base)
    candidate = slug
    n = 1
    while SpaceAd.query.filter_by(slug=candidate).first():
        candidate = f"{slug}-{n}"
        n += 1
    return candidate


def sanitize_text(value: str, max_len: int = 500) -> str:
    """Limpia HTML y limita longitud."""
    if not value:
        return ""
    clean = bleach.clean(value.strip(), tags=[], strip=True)
    return clean[:max_len]


def is_valid_url(url: str) -> bool:
    """Valida formato de URL (http/https)."""
    try:
        parsed = urlparse(url.strip())
        return parsed.scheme in ("http", "https") and bool(parsed.netloc)
    except Exception:
        return False


def is_valid_email(email: str) -> bool:
    """Valida formato de email."""
    try:
        validate_email(email.strip(), check_deliverability=False)
        return True
    except EmailNotValidError:
        return False


def allowed_file(filename: str) -> bool:
    """Verifica extensión permitida para logos."""
    return "." in filename and filename.rsplit(".", 1)[1].lower() in config.ALLOWED_EXTENSIONS


def save_logo(file) -> str | None:
    """Guarda logo con nombre único y devuelve ruta relativa."""
    if not file or not file.filename:
        return None
    if not allowed_file(file.filename):
        return None
    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(config.UPLOAD_FOLDER, unique_name)
    file.save(filepath)
    return f"uploads/{unique_name}"


def distance(x1, y1, x2, y2) -> float:
    """Distancia euclidiana entre dos puntos."""
    return math.hypot(x2 - x1, y2 - y1)


def get_occupied_spaces(exclude_id=None):
    """Devuelve espacios con posición asignada (pendientes y pagados)."""
    query = SpaceAd.query.filter(
        SpaceAd.status.in_([config.STATUS_PENDING, config.STATUS_PAID]),
        SpaceAd.x_position.isnot(None),
        SpaceAd.y_position.isnot(None),
    )
    if exclude_id:
        query = query.filter(SpaceAd.id != exclude_id)
    return query.all()


def find_free_position(space_type: str, exclude_id=None) -> tuple[float, float] | None:
    """
    Busca una posición libre en el universo sin superposición.
    Los planetas requieren mayor distancia mínima que las estrellas.
    """
    type_info = config.SPACE_TYPES.get(space_type)
    if not type_info:
        return None

    min_dist = type_info["min_distance"]
    half_size = type_info["size"] / 2
    occupied = get_occupied_spaces(exclude_id)

    margin = half_size + 20
    max_x = config.UNIVERSE_WIDTH - margin
    max_y = config.UNIVERSE_HEIGHT - margin

    for _ in range(config.MAX_POSITION_ATTEMPTS):
        x = random.uniform(margin, max_x)
        y = random.uniform(margin, max_y)
        collision = False
        for other in occupied:
            other_info = config.SPACE_TYPES.get(other.space_type, {})
            other_half = other_info.get("size", other.size) / 2
            required = min_dist + half_size + other_half
            if distance(x, y, other.x_position, other.y_position) < required:
                collision = True
                break
        if not collision:
            return round(x, 1), round(y, 1)

    return None


def assign_position(space_ad: SpaceAd) -> bool:
    """Asigna posición al espacio; devuelve False si no hay lugar."""
    pos = find_free_position(space_ad.space_type, exclude_id=space_ad.id)
    if pos is None:
        return False
    space_ad.x_position, space_ad.y_position = pos
    return True


def admin_required(f):
    """Decorador: requiere sesión de admin activa."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get("admin_logged_in"):
            return jsonify({"error": "No autorizado"}), 401
        return f(*args, **kwargs)
    return decorated


def get_stats():
    """Estadísticas para la página principal."""
    paid = SpaceAd.query.filter_by(status=config.STATUS_PAID).all()
    stars = sum(1 for s in paid if config.SPACE_TYPES.get(s.space_type, {}).get("category_group") == "star")
    planets = sum(1 for s in paid if config.SPACE_TYPES.get(s.space_type, {}).get("category_group") == "planet")
    constellations = sum(1 for s in paid if config.SPACE_TYPES.get(s.space_type, {}).get("category_group") == "constellation")
    total_slots = 200  # capacidad estimada del universo
    occupied = len(paid)
    return {
        "stars_sold": stars + constellations,
        "planets_sold": planets,
        "available": max(0, total_slots - occupied),
        "founding_brands": min(occupied, 50),
    }


# ── Seed data ────────────────────────────────────────────────────────────────

SEED_DATA = [
    {
        "advertiser_name": "Leo Vargas",
        "email": "hola@farolab.example",
        "brand_name": "Faro Lab",
        "title": "Desarrollo web y marketing digital",
        "description": "Estudio ficticio de sitios web y campañas para negocios pequeños.",
        "target_url": "https://example.com/faro",
        "category": "Tecnología",
        "space_type": "planet_small",
        "main_color": "#00d4ff",
    },
    {
        "advertiser_name": "Ana Torres",
        "email": "hola@tuportaldelalma.com",
        "brand_name": "TuPortalDelAlma",
        "title": "Tarot y guía espiritual online",
        "description": "Lecturas de tarot, carta astral y acompañamiento espiritual con amor y claridad.",
        "target_url": "https://tuportaldelalma.com",
        "category": "Tarot y espiritualidad",
        "space_type": "star_large",
        "main_color": "#c084fc",
    },
    {
        "advertiser_name": "Roberto Silva",
        "email": "info@mantenimente.cl",
        "brand_name": "ManteniMente",
        "title": "Mantenimiento y reparaciones del hogar",
        "description": "Gasfitería, electricidad y arreglos generales. Servicio rápido en Santiago.",
        "target_url": "https://mantenimente.cl",
        "category": "Servicios locales",
        "space_type": "star_medium",
        "main_color": "#fbbf24",
    },
    {
        "advertiser_name": "María González",
        "email": "hola@lunacafe.cl",
        "brand_name": "Café de la Luna",
        "title": "Cafetería artesanal en Providencia",
        "description": "Café de especialidad, pasteles caseros y ambiente acogedor. ¡Visítanos!",
        "target_url": "https://instagram.com/cafedelaluna",
        "category": "Restaurantes",
        "space_type": "star_small",
        "main_color": "#f472b6",
    },
    {
        "advertiser_name": "Grupo NovaTech",
        "email": "contacto@novatech.cl",
        "brand_name": "NovaTech Industries",
        "title": "Soluciones tecnológicas empresariales",
        "description": "Cloud, IA y transformación digital para grandes empresas en Latinoamérica.",
        "target_url": "https://novatech.cl",
        "category": "Tecnología",
        "space_type": "planet_large",
        "main_color": "#6366f1",
    },
]


def seed_database():
    """Crea anuncios de ejemplo si la base está vacía."""
    if SpaceAd.query.count() > 0:
        return
    for item in SEED_DATA:
        type_info = config.SPACE_TYPES[item["space_type"]]
        ad = SpaceAd(
            advertiser_name=item["advertiser_name"],
            email=item["email"],
            brand_name=item["brand_name"],
            slug=unique_slug(item["brand_name"]),
            title=item["title"],
            description=item["description"],
            target_url=item["target_url"],
            category=item["category"],
            space_type=item["space_type"],
            price=type_info["price"],
            main_color=item["main_color"],
            size=type_info["size"],
            status=config.STATUS_PAID,
        )
        db.session.add(ad)
        db.session.flush()
        assign_position(ad)
    db.session.commit()


# ── Rutas públicas ───────────────────────────────────────────────────────────

@app.route("/")
def index():
    stats = get_stats()
    recent = (
        SpaceAd.query.filter_by(status=config.STATUS_PAID)
        .order_by(SpaceAd.created_at.desc())
        .limit(6)
        .all()
    )
    return render_template(
        "index.html",
        stats=stats,
        recent=recent,
        categories=config.CATEGORIES,
        space_types=config.SPACE_TYPES,
    )


@app.route("/buy")
def buy():
    preselect = request.args.get("type", "star_small")
    if preselect not in config.SPACE_TYPES:
        preselect = "star_small"
    return render_template(
        "buy.html",
        space_types=config.SPACE_TYPES,
        categories=config.CATEGORIES,
        preselect=preselect,
    )


@app.route("/space/<slug>")
def space_detail(slug):
    ad = SpaceAd.query.filter_by(slug=slug, status=config.STATUS_PAID).first_or_404()
    type_info = config.SPACE_TYPES.get(ad.space_type, {})
    return render_template("space_detail.html", ad=ad, type_info=type_info)


# ── API pública ──────────────────────────────────────────────────────────────

@app.route("/api/spaces", methods=["GET"])
def api_spaces():
    """Devuelve todos los espacios pagados para renderizar el universo."""
    ads = SpaceAd.query.filter_by(status=config.STATUS_PAID).all()
    return jsonify([ad.to_public_dict() for ad in ads])


@app.route("/api/spaces", methods=["POST"])
def api_create_space():
    """
    Crea una solicitud de espacio publicitario (estado: pendiente).

    Integración Mercado Pago (futuro):
      1. Crear preferencia de pago con el precio del space_type.
      2. Guardar payment_id en el registro.
      3. Redirigir al checkout de Mercado Pago.
      4. El webhook confirmará el pago y cambiará status a 'pagado'.
    """
    data = request.form if request.form else request.get_json(silent=True) or {}

    space_type = sanitize_text(data.get("space_type", ""), 40)
    if space_type not in config.SPACE_TYPES:
        return jsonify({"error": "Tipo de espacio inválido."}), 400

    advertiser_name = sanitize_text(data.get("advertiser_name", ""), 120)
    email = sanitize_text(data.get("email", ""), 200)
    brand_name = sanitize_text(data.get("brand_name", ""), 120)
    title = sanitize_text(data.get("title", ""), 200)
    description = sanitize_text(data.get("description", ""), 500)
    target_url = sanitize_text(data.get("target_url", ""), 500)
    category = sanitize_text(data.get("category", ""), 80)
    main_color = sanitize_text(data.get("main_color", "#7c5cff"), 20)

    if not all([advertiser_name, email, brand_name, title, description, target_url, category]):
        return jsonify({"error": "Todos los campos obligatorios deben completarse."}), 400

    if not is_valid_email(email):
        return jsonify({"error": "Email inválido."}), 400

    if not is_valid_url(target_url):
        return jsonify({"error": "URL de destino inválida. Debe comenzar con http:// o https://"}), 400

    if category not in config.CATEGORIES:
        return jsonify({"error": "Categoría inválida."}), 400

    if not re.match(r"^#[0-9a-fA-F]{3,8}$", main_color):
        main_color = "#7c5cff"

    type_info = config.SPACE_TYPES[space_type]
    logo_path = None
    if "logo" in request.files:
        logo_path = save_logo(request.files["logo"])

    ad = SpaceAd(
        advertiser_name=advertiser_name,
        email=email,
        brand_name=brand_name,
        slug=unique_slug(brand_name),
        title=title,
        description=description,
        target_url=target_url,
        category=category,
        space_type=space_type,
        price=type_info["price"],
        logo_path=logo_path,
        main_color=main_color,
        size=type_info["size"],
        status=config.STATUS_PENDING,
    )

    if not assign_position(ad):
        return jsonify({"error": "No hay espacio disponible en el universo. Intenta más tarde."}), 409

    db.session.add(ad)
    db.session.commit()

    # TODO: Mercado Pago — crear preferencia y devolver init_point
    return jsonify({
        "success": True,
        "message": "Solicitud registrada. Tu espacio quedará visible una vez aprobado.",
        "id": ad.id,
        "slug": ad.slug,
    }), 201


@app.route("/api/validate-url", methods=["POST"])
def api_validate_url():
    """Valida una URL de destino."""
    data = request.get_json(silent=True) or {}
    url = data.get("url", "").strip()
    valid = is_valid_url(url)
    return jsonify({"valid": valid, "url": url if valid else None})


# ── Admin ────────────────────────────────────────────────────────────────────

@app.route("/admin", methods=["GET", "POST"])
def admin():
    if request.method == "POST":
        password = request.form.get("password", "")
        if password == config.ADMIN_PASSWORD:
            session["admin_logged_in"] = True
            return redirect(url_for("admin"))
        return render_template("admin.html", error="Contraseña incorrecta.", logged_in=False)

    if not session.get("admin_logged_in"):
        return render_template("admin.html", logged_in=False)

    pending = SpaceAd.query.filter_by(status=config.STATUS_PENDING).order_by(SpaceAd.created_at.desc()).all()
    paid = SpaceAd.query.filter_by(status=config.STATUS_PAID).order_by(SpaceAd.created_at.desc()).all()
    rejected = SpaceAd.query.filter_by(status=config.STATUS_REJECTED).order_by(SpaceAd.created_at.desc()).all()

    return render_template(
        "admin.html",
        logged_in=True,
        pending=pending,
        paid=paid,
        rejected=rejected,
        space_types=config.SPACE_TYPES,
    )


@app.route("/admin/logout")
def admin_logout():
    session.pop("admin_logged_in", None)
    return redirect(url_for("admin"))


@app.route("/admin/spaces/<int:space_id>/approve", methods=["POST"])
@admin_required
def admin_approve(space_id):
    ad = SpaceAd.query.get_or_404(space_id)
    if ad.x_position is None:
        if not assign_position(ad):
            return jsonify({"error": "No hay espacio disponible."}), 409
    ad.status = config.STATUS_PAID
    db.session.commit()
    return jsonify({"success": True, "status": ad.status})


@app.route("/admin/spaces/<int:space_id>/reject", methods=["POST"])
@admin_required
def admin_reject(space_id):
    ad = SpaceAd.query.get_or_404(space_id)
    ad.status = config.STATUS_REJECTED
    db.session.commit()
    return jsonify({"success": True, "status": ad.status})


@app.route("/admin/spaces/<int:space_id>/delete", methods=["POST"])
@admin_required
def admin_delete(space_id):
    ad = SpaceAd.query.get_or_404(space_id)
    if ad.logo_path:
        logo_file = os.path.join(app.static_folder, ad.logo_path.replace("uploads/", "uploads/"))
        if os.path.exists(logo_file):
            os.remove(logo_file)
    db.session.delete(ad)
    db.session.commit()
    return jsonify({"success": True})


# ── Inicialización ───────────────────────────────────────────────────────────

with app.app_context():
    db.create_all()
    seed_database()


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
