"""Modelos de base de datos para StarWall Ads."""
from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import event

from config import SPACE_TYPES

db = SQLAlchemy()


def _utcnow():
    return datetime.now(timezone.utc)


class SpaceAd(db.Model):
    """Anuncio publicitario representado como cuerpo celeste en el universo."""

    __tablename__ = "space_ads"

    id = db.Column(db.Integer, primary_key=True)
    advertiser_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(200), nullable=False)
    brand_name = db.Column(db.String(120), nullable=False)
    slug = db.Column(db.String(160), unique=True, nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    target_url = db.Column(db.String(500), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    space_type = db.Column(db.String(40), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    logo_path = db.Column(db.String(300), nullable=True)
    main_color = db.Column(db.String(20), nullable=False, default="#7c5cff")
    x_position = db.Column(db.Float, nullable=True)
    y_position = db.Column(db.Float, nullable=True)
    size = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="pendiente", index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=_utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=_utcnow, onupdate=_utcnow)

    # Mercado Pago (futuro)
    # payment_id = db.Column(db.String(100), nullable=True)
    # payment_status = db.Column(db.String(40), nullable=True)

    def to_public_dict(self):
        """Serializa el anuncio para la API pública y el universo interactivo."""
        info = SPACE_TYPES.get(self.space_type, {})
        return {
            "id": self.id,
            "brand_name": self.brand_name,
            "slug": self.slug,
            "title": self.title,
            "description": self.description,
            "target_url": self.target_url,
            "category": self.category,
            "space_type": self.space_type,
            "space_label": info.get("label", self.space_type),
            "price": self.price,
            "logo_path": self.logo_path,
            "main_color": self.main_color,
            "x_position": self.x_position,
            "y_position": self.y_position,
            "size": self.size,
            "category_group": info.get("category_group", "star"),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_admin_dict(self):
        """Serializa el anuncio para el panel de administración."""
        data = self.to_public_dict()
        data.update({
            "advertiser_name": self.advertiser_name,
            "email": self.email,
            "status": self.status,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        })
        return data
