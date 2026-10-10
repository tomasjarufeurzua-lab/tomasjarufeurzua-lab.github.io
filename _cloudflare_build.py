#!/usr/bin/env python3
"""Arma la copia del sitio para Cloudflare Pages (tomasjarufe.pages.dev).

GitHub Pages usa Jekyll para generar material.json; Cloudflare no, así que este
programa hace lo mismo: copia los archivos a _cf/ y escribe material.json con la
lista de todo lo que hay en material/. Jekyll ignora este archivo porque empieza
con "_", así que no se publica en tomasjarufe.site.

Cada subida a la rama claude/youthful-mayer-nwoi6w publica a la vez en GitHub Pages
(tomasjarufe.site) y en esta copia.

En Cloudflare: comando de compilación `python3 _cloudflare_build.py`,
carpeta de salida `_cf`.
"""
import json
import os
import shutil
import time

RAIZ = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(RAIZ, "_cf")


def publicable(nombre):
    # Mismas reglas que Jekyll: se omite lo que empieza con "." o "_"
    return not nombre.startswith((".", "_"))


def main():
    shutil.rmtree(SALIDA, ignore_errors=True)
    os.makedirs(SALIDA)
    material = []
    for carpeta, subcarpetas, archivos in os.walk(RAIZ):
        if os.path.abspath(carpeta).startswith(SALIDA):
            continue
        subcarpetas[:] = [s for s in subcarpetas if publicable(s)]
        rel = os.path.relpath(carpeta, RAIZ)
        for nombre in archivos:
            if not publicable(nombre) or (rel == "." and nombre in ("material.json", "CNAME", "wrangler.jsonc")):
                continue
            ruta_rel = os.path.normpath(os.path.join(rel, nombre))
            destino = os.path.join(SALIDA, ruta_rel)
            os.makedirs(os.path.dirname(destino), exist_ok=True)
            shutil.copy2(os.path.join(carpeta, nombre), destino)
            if ruta_rel.split(os.sep)[0] == "material":
                material.append("/" + ruta_rel.replace(os.sep, "/"))
    material.sort()
    with open(os.path.join(SALIDA, "material.json"), "w", encoding="utf-8") as f:
        json.dump({"version": str(int(time.time())), "files": material}, f, ensure_ascii=False, indent=2)
    print(f"Listo: {len(material)} archivos de material en {SALIDA}")


if __name__ == "__main__":
    main()
