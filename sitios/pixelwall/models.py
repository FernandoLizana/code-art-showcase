"""Modelos de base de datos."""
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def utcnow():
    return datetime.now(timezone.utc)


class CellPurchase(db.Model):
    """Historial de compras por celda (para precio escalonado)."""

    __tablename__ = "cell_purchases"

    x = db.Column(db.Integer, primary_key=True)
    y = db.Column(db.Integer, primary_key=True)
    purchase_count = db.Column(db.Integer, nullable=False, default=0)


class Ad(db.Model):
    """Bloque publicitario en la grilla."""

    __tablename__ = "ads"

    id = db.Column(db.Integer, primary_key=True)
    advertiser_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    target_url = db.Column(db.String(500), nullable=False)
    image_path = db.Column(db.String(300), nullable=True)
    background_color = db.Column(db.String(7), nullable=False, default="#00ffcc")
    x = db.Column(db.Integer, nullable=False)
    y = db.Column(db.Integer, nullable=False)
    width = db.Column(db.Integer, nullable=False)
    height = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Integer, nullable=False, default=0)
    status = db.Column(db.String(20), nullable=False, default="pendiente")
    life_status = db.Column(db.String(20), nullable=False, default="vivo")
    paid_until = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utcnow)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=utcnow, onupdate=utcnow
    )

    STATUSES = ("pendiente", "pagado", "rechazado", "reemplazado", "muerto")
    LIFE_STATUSES = ("vivo", "moribundo", "muerto")

    @property
    def cell_count(self):
        return self.width * self.height

    def to_dict(self, include_private=False, include_advertiser=False):
        data = {
            "id": self.id,
            "title": self.title,
            "target_url": self.target_url,
            "image_path": self.image_path,
            "background_color": self.background_color,
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
            "status": self.status,
            "life_status": self.life_status,
            "total_price": self.total_price,
            "paid_until": self.paid_until.isoformat() if self.paid_until else None,
        }
        if include_advertiser or include_private:
            data["advertiser_name"] = self.advertiser_name
        if include_private:
            data.update(
                {
                    "email": self.email,
                    "cell_count": self.cell_count,
                    "created_at": self.created_at.isoformat(),
                    "updated_at": self.updated_at.isoformat(),
                }
            )
        return data

    def __repr__(self):
        return f"<Ad {self.id} {self.title!r} ({self.status}/{self.life_status})>"
