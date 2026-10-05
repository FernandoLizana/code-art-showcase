#!/usr/bin/env python3
"""Abre la vitrina en el navegador.

Solo usa la biblioteca estándar de Python 3. Copia esta carpeta a cualquier
máquina y ejecuta: python abrir.py
"""

from __future__ import annotations

import functools
import http.server
import socket
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def puerto_libre() -> int:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def main() -> None:
    port = puerto_libre()
    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler,
        directory=str(ROOT),
    )
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), handler)
    url = f"http://127.0.0.1:{port}/"
    threading.Timer(0.4, lambda: webbrowser.open(url)).start()
    print(f"Vitrina en {url}")
    print("Ctrl+C para cerrar.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nCerrada.")
        server.shutdown()


if __name__ == "__main__":
    main()
