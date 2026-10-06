"""
PixelWall Ads - Aplicación principal Flask.
MVP para venta de espacios publicitarios en grilla de píxeles.
"""
import os
from functools import wraps

from dotenv import load_dotenv
from flask import (
    Flask,
    flash,
    jsonify,
    redirect,
    render_template,
    request,
    session,
    url_for,
)
from sqlalchemy import inspect, text
from werkzeug.middleware.proxy_fix import ProxyFix

from config import (
    ADMIN_PASSWORD,
    ADMIN_PATH,
    CELL_SIZE,
    DATABASE_URL,
    GRACE_PERIOD_DAYS,
    GRID_HEIGHT,
    GRID_WIDTH,
    MONTHLY_PRICE_PER_CELL,
    PRICE_PER_CELL,
    SECRET_KEY,
    SUBSCRIPTION_DAYS,
    UPLOAD_FOLDER,
)
from models import Ad, db
from pricing import (
    calculate_selection_price,
    increment_cell_purchases,
    mark_replaced_ads,
    sync_cell_purchases_from_ads,
)
from subscriptions import (
    activate_subscription,
    kill_ad,
    monthly_fee,
    process_subscriptions,
    revive_ad,
)
from validators import (
    is_valid_email,
    is_valid_hex_color,
    is_valid_url,
    sanitize_text,
    save_upload,
    validate_selection,
)

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = SECRET_KEY
app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["MAX_CONTENT_LENGTH"] = 2 * 1024 * 1024
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

db.init_app(app)


def admin_required(view):
    """Protege rutas admin con contraseña simple en sesión."""

    @wraps(view)
    def wrapped(*args, **kwargs):
        if not session.get("admin_authenticated"):
            return redirect(url_for("admin"))
        return view(*args, **kwargs)

    return wrapped


def grid_config():
    """Configuración de grilla para templates y JS."""
    return {
        "grid_width": GRID_WIDTH,
        "grid_height": GRID_HEIGHT,
        "cell_size": CELL_SIZE,
        "price_per_cell": PRICE_PER_CELL,
        "monthly_price_per_cell": MONTHLY_PRICE_PER_CELL,
        "subscription_days": SUBSCRIPTION_DAYS,
        "grace_period_days": GRACE_PERIOD_DAYS,
    }


def grid_stats():
    """Estadísticas de celdas activas y con historial de compra."""
    from pricing import get_purchase_count

    process_subscriptions()
    total_cells = GRID_WIDTH * GRID_HEIGHT
    alive_ads = Ad.query.filter(Ad.status == "pagado", Ad.life_status == "vivo").all()
    dying_ads = Ad.query.filter(Ad.status == "pagado", Ad.life_status == "moribundo").all()
    dead_ads = Ad.query.filter(
        (Ad.status == "muerto") | (Ad.life_status == "muerto")
    ).all()
    active_cells = sum(ad.cell_count for ad in alive_ads + dying_ads)
    reserved_cells = sum(
        ad.cell_count for ad in Ad.query.filter_by(status="pendiente").all()
    )
    ever_sold = sum(
        1
        for x in range(GRID_WIDTH)
        for y in range(GRID_HEIGHT)
        if get_purchase_count(x, y) > 0
    )
    return {
        "total_cells": total_cells,
        "sold_cells": ever_sold,
        "active_cells": active_cells,
        "alive_brands": len(alive_ads),
        "dying_brands": len(dying_ads),
        "dead_brands": len(dead_ads),
        "reserved_cells": reserved_cells,
        "available_cells": total_cells - active_cells,
    }


@app.before_request
def before_request():
    process_subscriptions()


@app.context_processor
def inject_globals():
    return {"grid_config": grid_config(), "grid_stats": grid_stats()}


# ── Páginas públicas ──────────────────────────────────────────────


@app.route("/")
def index():
    alive = (
        Ad.query.filter(Ad.status == "pagado", Ad.life_status == "vivo")
        .order_by(Ad.created_at)
        .all()
    )
    dying = (
        Ad.query.filter(Ad.status == "pagado", Ad.life_status == "moribundo")
        .order_by(Ad.created_at)
        .all()
    )
    dead = (
        Ad.query.filter((Ad.status == "muerto") | (Ad.life_status == "muerto"))
        .order_by(Ad.updated_at.desc())
        .limit(30)
        .all()
    )
    recent = (
        Ad.query.filter(Ad.status.in_(["pagado", "muerto"]))
        .order_by(Ad.updated_at.desc())
        .limit(8)
        .all()
    )
    grid_ads = alive + dying + dead
    ads_json = [ad.to_dict(include_advertiser=True) for ad in grid_ads]
    return render_template(
        "index.html",
        ads_json=ads_json,
        alive_count=len(alive),
        dying_count=len(dying),
        dead_count=len(dead),
        recent_brands=recent,
    )


@app.route("/buy")
def buy():
    occupied_ads = (
        Ad.query.filter(
            Ad.status == "pagado",
            Ad.life_status.in_(["vivo", "moribundo"]),
        )
        .all()
    )
    pending_ads = Ad.query.filter_by(status="pendiente").all()
    return render_template(
        "buy.html",
        occupied_json=[ad.to_dict() for ad in occupied_ads],
        pending_json=[ad.to_dict() for ad in pending_ads],
    )


# ── API ───────────────────────────────────────────────────────────


@app.route("/api/ads")
def api_ads():
    status = request.args.get("status", "pagado")
    if status == "all":
        ads = Ad.query.order_by(Ad.created_at.desc()).all()
        return jsonify([ad.to_dict(include_private=True) for ad in ads])
    ads = Ad.query.filter_by(status=status).order_by(Ad.created_at).all()
    return jsonify([ad.to_dict() for ad in ads])


@app.route("/api/validate-selection", methods=["POST"])
def api_validate_selection():
    data = request.get_json(silent=True) or {}
    try:
        x = int(data.get("x", -1))
        y = int(data.get("y", -1))
        width = int(data.get("width", 0))
        height = int(data.get("height", 0))
    except (TypeError, ValueError):
        return jsonify({"valid": False, "message": "Coordenadas inválidas."}), 400

    ok, message = validate_selection(x, y, width, height)
    pricing = calculate_selection_price(x, y, width, height)

    response = {
        "valid": ok,
        "message": message,
        "cell_count": pricing["cell_count"],
        "total_price": pricing["total_price"],
        "base_price": pricing["base_price"],
        "premium_cells": pricing["premium_cells"],
        "max_tier": pricing["max_tier"],
        "is_takeover": pricing["is_takeover"],
    }

    if ok and pricing["is_takeover"]:
        response["message"] = (
            f"Reemplazo: {pricing['premium_cells']} celda(s) con precio escalonado "
            f"(hasta {pricing['max_tier']}x el valor base)."
        )

    return jsonify(response)


@app.route("/ads", methods=["POST"])
def create_ad():
    """Crea un anuncio en estado pendiente."""
    try:
        x = int(request.form.get("x", -1))
        y = int(request.form.get("y", -1))
        width = int(request.form.get("width", 0))
        height = int(request.form.get("height", 0))
    except (TypeError, ValueError):
        flash("Selección de grilla inválida.", "error")
        return redirect(url_for("buy"))

    advertiser_name = sanitize_text(request.form.get("advertiser_name"), 120)
    email = sanitize_text(request.form.get("email"), 200)
    title = sanitize_text(request.form.get("title"), 200)
    target_url = sanitize_text(request.form.get("target_url"), 500)
    background_color = sanitize_text(request.form.get("background_color"), 7) or "#00ffcc"

    if not advertiser_name:
        flash("El nombre del anunciante es obligatorio.", "error")
        return redirect(url_for("buy"))
    if not is_valid_email(email):
        flash("Ingresa un email válido.", "error")
        return redirect(url_for("buy"))
    if not title:
        flash("El título del anuncio es obligatorio.", "error")
        return redirect(url_for("buy"))
    if not is_valid_url(target_url):
        flash("La URL debe comenzar con http:// o https://", "error")
        return redirect(url_for("buy"))
    if not is_valid_hex_color(background_color):
        flash("El color de fondo debe ser un hex válido (#RRGGBB).", "error")
        return redirect(url_for("buy"))

    ok, message = validate_selection(x, y, width, height)
    if not ok:
        flash(message, "error")
        return redirect(url_for("buy"))

    pricing = calculate_selection_price(x, y, width, height)

    image_path = None
    uploaded = request.files.get("image")
    if uploaded and uploaded.filename:
        image_path, upload_error = save_upload(uploaded)
        if upload_error:
            flash(upload_error, "error")
            return redirect(url_for("buy"))

    ad = Ad(
        advertiser_name=advertiser_name,
        email=email,
        title=title,
        target_url=target_url,
        image_path=image_path,
        background_color=background_color,
        x=x,
        y=y,
        width=width,
        height=height,
        total_price=pricing["total_price"],
        status="pendiente",
    )
    db.session.add(ad)
    db.session.commit()

    takeover_note = ""
    if pricing["is_takeover"]:
        takeover_note = " Incluye reemplazo de píxeles con precio escalonado."

    flash(
        f"Espacio reservado: {pricing['cell_count']} celdas por "
        f"${pricing['total_price']:,} CLP.{takeover_note} "
        "Tu anuncio quedará visible cuando sea aprobado.",
        "success",
    )
    return redirect(url_for("buy"))


# ── Admin (ruta oculta) ───────────────────────────────────────────


@app.route(f"/{ADMIN_PATH}", methods=["GET", "POST"])
def admin():
    if request.method == "POST" and not session.get("admin_authenticated"):
        password = request.form.get("password", "")
        if password == ADMIN_PASSWORD:
            session["admin_authenticated"] = True
            return redirect(url_for("admin"))
        flash("Contraseña incorrecta.", "error")
        return render_template("admin_login.html")

    if not session.get("admin_authenticated"):
        return render_template("admin_login.html")

    pending = Ad.query.filter_by(status="pendiente").order_by(Ad.created_at.desc()).all()
    paid = (
        Ad.query.filter(Ad.status == "pagado", Ad.life_status == "vivo")
        .order_by(Ad.created_at.desc())
        .all()
    )
    dying = (
        Ad.query.filter(Ad.status == "pagado", Ad.life_status == "moribundo")
        .order_by(Ad.paid_until)
        .all()
    )
    dead = (
        Ad.query.filter((Ad.status == "muerto") | (Ad.life_status == "muerto"))
        .order_by(Ad.updated_at.desc())
        .all()
    )
    replaced = Ad.query.filter_by(status="reemplazado").order_by(Ad.created_at.desc()).all()
    rejected = Ad.query.filter_by(status="rechazado").order_by(Ad.created_at.desc()).all()
    return render_template(
        "admin.html",
        pending_ads=pending,
        paid_ads=paid,
        dying_ads=dying,
        dead_ads=dead,
        replaced_ads=replaced,
        rejected_ads=rejected,
        monthly_price_per_cell=MONTHLY_PRICE_PER_CELL,
        subscription_days=SUBSCRIPTION_DAYS,
    )


@app.route(f"/{ADMIN_PATH}/logout")
def admin_logout():
    session.pop("admin_authenticated", None)
    return redirect(url_for("admin"))


@app.route(f"/{ADMIN_PATH}/ads/<int:ad_id>/approve", methods=["POST"])
@admin_required
def admin_approve(ad_id):
    ad = db.session.get(Ad, ad_id)
    if not ad:
        flash("Anuncio no encontrado.", "error")
        return redirect(url_for("admin"))

    ok, message = validate_selection(ad.x, ad.y, ad.width, ad.height, exclude_id=ad.id)
    if not ok:
        flash(f"No se puede aprobar: {message}", "error")
        return redirect(url_for("admin"))

    replaced = mark_replaced_ads(ad.x, ad.y, ad.width, ad.height, exclude_id=ad.id)
    increment_cell_purchases(ad.x, ad.y, ad.width, ad.height)
    ad.status = "pagado"
    activate_subscription(ad)
    db.session.commit()

    msg = f"Anuncio «{ad.title}» aprobado y publicado."
    if replaced:
        msg += f" Reemplazó {len(replaced)} anuncio(s) anterior(es)."
    flash(msg, "success")
    return redirect(url_for("admin"))


@app.route(f"/{ADMIN_PATH}/ads/<int:ad_id>/reject", methods=["POST"])
@admin_required
def admin_reject(ad_id):
    ad = db.session.get(Ad, ad_id)
    if not ad:
        flash("Anuncio no encontrado.", "error")
        return redirect(url_for("admin"))
    ad.status = "rechazado"
    db.session.commit()
    flash(f"Anuncio «{ad.title}» rechazado.", "success")
    return redirect(url_for("admin"))


@app.route(f"/{ADMIN_PATH}/ads/<int:ad_id>/delete", methods=["POST"])
@admin_required
def admin_delete(ad_id):
    ad = db.session.get(Ad, ad_id)
    if not ad:
        flash("Anuncio no encontrado.", "error")
        return redirect(url_for("admin"))

    if ad.image_path:
        image_file = UPLOAD_FOLDER / os.path.basename(ad.image_path)
        if image_file.exists():
            image_file.unlink()

    db.session.delete(ad)
    db.session.commit()
    flash("Anuncio eliminado.", "success")
    return redirect(url_for("admin"))


@app.route(f"/{ADMIN_PATH}/ads/<int:ad_id>/renew", methods=["POST"])
@admin_required
def admin_renew(ad_id):
    ad = db.session.get(Ad, ad_id)
    if not ad:
        flash("Anuncio no encontrado.", "error")
        return redirect(url_for("admin"))
    revive_ad(ad)
    db.session.commit()
    flash(
        f"«{ad.advertiser_name}» renovado +{SUBSCRIPTION_DAYS} días. "
        f"Cuota mensual: ${monthly_fee(ad):,} CLP.",
        "success",
    )
    return redirect(url_for("admin"))


@app.route(f"/{ADMIN_PATH}/ads/<int:ad_id>/kill", methods=["POST"])
@admin_required
def admin_kill(ad_id):
    ad = db.session.get(Ad, ad_id)
    if not ad:
        flash("Anuncio no encontrado.", "error")
        return redirect(url_for("admin"))
    kill_ad(ad)
    db.session.commit()
    flash(f"Los píxeles de «{ad.advertiser_name}» murieron.", "success")
    return redirect(url_for("admin"))


@app.route(f"/{ADMIN_PATH}/ads/<int:ad_id>/revive", methods=["POST"])
@admin_required
def admin_revive(ad_id):
    ad = db.session.get(Ad, ad_id)
    if not ad:
        flash("Anuncio no encontrado.", "error")
        return redirect(url_for("admin"))
    revive_ad(ad)
    db.session.commit()
    flash(f"«{ad.advertiser_name}» revivido en el muro.", "success")
    return redirect(url_for("admin"))


# ── Seed y migraciones ligeras ────────────────────────────────────


def migrate_schema():
    """Agrega columnas nuevas en BD existentes sin Alembic."""
    inspector = inspect(db.engine)
    if "ads" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("ads")}
    if "total_price" not in columns:
        db.session.execute(
            text("ALTER TABLE ads ADD COLUMN total_price INTEGER NOT NULL DEFAULT 0")
        )
        db.session.commit()
        columns.add("total_price")

    if "life_status" not in columns:
        db.session.execute(
            text("ALTER TABLE ads ADD COLUMN life_status VARCHAR(20) NOT NULL DEFAULT 'vivo'")
        )
        db.session.commit()
        columns.add("life_status")

    if "paid_until" not in columns:
        db.session.execute(text("ALTER TABLE ads ADD COLUMN paid_until DATETIME"))
        db.session.commit()


def seed_sample_data():
    """Carga anuncios de ejemplo si la BD está vacía."""
    if Ad.query.count() > 0:
        return

    from datetime import timedelta

    from models import utcnow

    now = utcnow()

    samples = [
        {
            "advertiser_name": "Coca-Cola",
            "email": "ads@cocacola.com",
            "title": "Destapa la felicidad",
            "target_url": "https://example.com/coca-cola",
            "background_color": "#ff0000",
            "x": 5, "y": 5, "width": 10, "height": 5,
            "total_price": 5000,
            "status": "pagado",
            "life_status": "vivo",
            "paid_until": now + timedelta(days=22),
        },
        {
            "advertiser_name": "Neon Labs",
            "email": "hola@neonlabs.cl",
            "title": "Diseño que brilla",
            "target_url": "https://example.com/neon",
            "background_color": "#ff00aa",
            "x": 25, "y": 10, "width": 12, "height": 8,
            "total_price": 9600,
            "status": "pagado",
            "life_status": "vivo",
            "paid_until": now + timedelta(days=18),
        },
        {
            "advertiser_name": "Cyber Startup",
            "email": "team@cyberstartup.io",
            "title": "Lanza tu MVP hoy",
            "target_url": "https://example.com/startup",
            "background_color": "#7b2fff",
            "x": 50, "y": 20, "width": 20, "height": 12,
            "total_price": 24000,
            "status": "pagado",
            "life_status": "moribundo",
            "paid_until": now - timedelta(days=2),
        },
        {
            "advertiser_name": "Marca Olvidada",
            "email": "rip@olvido.cl",
            "title": "No pagó la cuota",
            "target_url": "https://example.com/rip",
            "background_color": "#333333",
            "x": 80, "y": 30, "width": 8, "height": 6,
            "total_price": 4800,
            "status": "muerto",
            "life_status": "muerto",
            "paid_until": now - timedelta(days=40),
        },
        {
            "advertiser_name": "Arcade Store",
            "email": "ventas@arcade.cl",
            "title": "Consolas vintage",
            "target_url": "https://example.com/arcade",
            "background_color": "#ffcc00",
            "x": 70, "y": 5, "width": 10, "height": 10,
            "total_price": 10000,
            "status": "pendiente",
        },
    ]

    for data in samples:
        db.session.add(Ad(**data))
    db.session.commit()
    sync_cell_purchases_from_ads()
    print("Datos de ejemplo cargados.")


def init_app():
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
    with app.app_context():
        db.create_all()
        migrate_schema()
        if os.environ.get("SEED_DATA", "1") == "1":
            seed_sample_data()
        sync_cell_purchases_from_ads()


if __name__ == "__main__":
    init_app()
    app.run(debug=True, host="0.0.0.0", port=8080)
