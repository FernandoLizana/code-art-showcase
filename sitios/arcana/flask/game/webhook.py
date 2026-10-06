"""Notificaciones webhook al completar."""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request


def notify_completion(session_id: str, profile: dict, ip: str) -> None:
    url = os.environ.get("WEBHOOK_URL", "").strip()
    if not url:
        return
    payload = {
        "content": None,
        "embeds": [{
            "title": "ARCANA OBSCURA — Umbral final",
            "description": "Alguien completó los 100 umbrales.",
            "color": 0x8B7340,
            "fields": [
                {"name": "Arquetipo", "value": profile.get("primaryArchetype", "?"), "inline": True},
                {"name": "Carta", "value": profile.get("tarotCard", "?"), "inline": True},
                {"name": "IP", "value": ip, "inline": False},
            ],
        }],
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except (urllib.error.URLError, TimeoutError):
        pass
