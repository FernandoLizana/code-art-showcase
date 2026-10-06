"""Lógica de suscripción mensual y ciclo de vida de píxeles."""
from datetime import timedelta, timezone

from config import GRACE_PERIOD_DAYS, SUBSCRIPTION_DAYS
from models import Ad, db, utcnow


def _aware(dt):
    """Normaliza datetime para comparaciones (SQLite guarda naive)."""
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def monthly_fee(ad):
    """Cuota mensual según celdas del bloque."""
    from config import MONTHLY_PRICE_PER_CELL

    return ad.cell_count * MONTHLY_PRICE_PER_CELL


def activate_subscription(ad, days=None):
    """Activa o renueva la suscripción de un anuncio."""
    period = days or SUBSCRIPTION_DAYS
    now = utcnow()
    base = _aware(ad.paid_until) if ad.paid_until and _aware(ad.paid_until) > now else now
    ad.paid_until = base + timedelta(days=period)
    ad.life_status = "vivo"
    if ad.status == "muerto":
        ad.status = "pagado"


def kill_ad(ad):
    """Mata los píxeles manualmente desde admin."""
    ad.life_status = "muerto"
    ad.status = "muerto"


def revive_ad(ad, days=None):
    """Revive píxeles muertos o moribundos."""
    activate_subscription(ad, days=days)


def process_subscriptions():
    """
    Actualiza estados según fecha de pago.
    vivo → moribundo (vencido) → muerto (gracia agotada).
    """
    now = utcnow()
    grace = timedelta(days=GRACE_PERIOD_DAYS)
    changed = False

    ads = Ad.query.filter(Ad.status.in_(["pagado", "muerto"])).all()
    for ad in ads:
        if not ad.paid_until:
            continue

        paid_until = _aware(ad.paid_until)

        if ad.life_status == "vivo" and now > paid_until:
            ad.life_status = "moribundo"
            changed = True
        elif ad.life_status == "moribundo" and now > paid_until + grace:
            ad.life_status = "muerto"
            ad.status = "muerto"
            changed = True

    if changed:
        db.session.commit()
