#!/usr/bin/env sh
cd "$(dirname "$0")" || exit 1
if command -v python3 >/dev/null 2>&1; then
  exec python3 abrir.py
fi
if command -v python >/dev/null 2>&1; then
  exec python abrir.py
fi
echo "No hay Python 3. Abre index.html en el navegador."
exit 1
