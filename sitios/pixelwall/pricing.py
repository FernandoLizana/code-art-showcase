"""Cálculo de precios escalonados y gestión de reemplazos."""
from config import GRID_HEIGHT, GRID_WIDTH, PRICE_PER_CELL
from models import Ad, CellPurchase, db


def iter_cells(x, y, width, height):
    """Itera coordenadas (cx, cy) dentro de un rectángulo."""
    for cx in range(x, x + width):
        for cy in range(y, y + height):
            yield cx, cy


def get_purchase_count(x, y):
    """Veces que una celda ha sido comprada (pagada) históricamente."""
    cell = db.session.get(CellPurchase, (x, y))
    return cell.purchase_count if cell else 0


def cell_price(x, y):
    """
    Precio de la próxima compra en una celda.
    1ª compra = PRICE_PER_CELL, 2ª = 2x, 3ª = 3x, etc.
    """
    return PRICE_PER_CELL * (get_purchase_count(x, y) + 1)


def calculate_selection_price(x, y, width, height):
    """
    Calcula el precio total de una selección sumando celda a celda.
    Retorna dict con total, desglose y celdas premium (ya compradas antes).
    """
    total = 0
    premium_cells = 0
    max_tier = 1

    for cx, cy in iter_cells(x, y, width, height):
        count = get_purchase_count(cx, cy)
        tier = count + 1
        total += PRICE_PER_CELL * tier
        if count > 0:
            premium_cells += 1
        max_tier = max(max_tier, tier)

    cell_count = width * height
    base_price = cell_count * PRICE_PER_CELL

    return {
        "total_price": total,
        "cell_count": cell_count,
        "base_price": base_price,
        "premium_cells": premium_cells,
        "max_tier": max_tier,
        "is_takeover": premium_cells > 0,
    }


def increment_cell_purchases(x, y, width, height):
    """Incrementa el contador de compras al aprobar un anuncio."""
    for cx, cy in iter_cells(x, y, width, height):
        cell = db.session.get(CellPurchase, (cx, cy))
        if cell:
            cell.purchase_count += 1
        else:
            db.session.add(CellPurchase(x=cx, y=cy, purchase_count=1))


def mark_replaced_ads(x, y, width, height, exclude_id=None):
    """
    Marca como 'reemplazado' los anuncios pagados que quedan
    cubiertos por el nuevo bloque.
    """
    paid_ads = Ad.query.filter(
        Ad.status == "pagado",
        Ad.life_status.in_(["vivo", "moribundo"]),
    ).all()
    replaced = []
    for ad in paid_ads:
        if exclude_id and ad.id == exclude_id:
            continue
        if rectangles_overlap(x, y, width, height, ad.x, ad.y, ad.width, ad.height):
            ad.status = "reemplazado"
            replaced.append(ad)
    return replaced


def rectangles_overlap(x1, y1, w1, h1, x2, y2, w2, h2):
    return not (
        x1 + w1 <= x2 or x2 + w2 <= x1 or y1 + h1 <= y2 or y2 + h2 <= y1
    )


def sync_cell_purchases_from_ads():
    """
    Reconstruye contadores de celda desde anuncios pagados/reemplazados.
    Útil al migrar BD existentes.
    """
    if CellPurchase.query.count() > 0:
        return

    history = (
        Ad.query.filter(Ad.status.in_(["pagado", "reemplazado"]))
        .order_by(Ad.created_at)
        .all()
    )
    for ad in history:
        increment_cell_purchases(ad.x, ad.y, ad.width, ad.height)
    db.session.commit()
