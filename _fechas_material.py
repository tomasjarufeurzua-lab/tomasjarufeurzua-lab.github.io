#!/usr/bin/env python3
"""Escribe material-fechas.json: para cada archivo de material/, la fecha (AAAA-MM-DD) en que
se subio o se cambio su contenido por ultima vez. Mover o renombrar un archivo no cuenta como cambio.

La pagina usa estas fechas para poner la etiqueta "Nuevo" a lo subido en los ultimos dias.
Correr despues de agregar o reemplazar PDFs en material/ (antes del commit):

    python3 _fechas_material.py

Jekyll ignora este archivo porque empieza con "_".
"""
import datetime
import json
import os
import subprocess

RAIZ = os.path.dirname(os.path.abspath(__file__))


def git(*args):
    return subprocess.run(["git", *args], cwd=RAIZ, capture_output=True, text=True, check=True).stdout


def main():
    hoy = datetime.date.today().isoformat()
    archivos = sorted(
        os.path.relpath(os.path.join(c, n), RAIZ).replace(os.sep, "/")
        for c, _, ns in os.walk(os.path.join(RAIZ, "material"))
        for n in ns
        if not n.startswith(".")
    )
    # Cambios aun sin commit: lo agregado o con contenido distinto lleva la fecha de hoy
    pendientes = set()
    for linea in git("diff", "HEAD", "--name-status", "-M").splitlines():
        partes = linea.split("\t")
        if partes[0] != "R100":
            pendientes.add(partes[-1])
    sin_seguir = set(git("ls-files", "--others", "--exclude-standard", "material").splitlines())
    fechas = {}
    for ruta in archivos:
        if ruta in pendientes or ruta in sin_seguir:
            fechas[ruta] = hoy
            continue
        fecha = None
        actual = None
        for linea in git("log", "--follow", "--name-status", "--format=@%cs", "--", ruta).splitlines():
            if linea.startswith("@"):
                actual = linea[1:]
            elif linea.strip() and not linea.startswith("R100"):
                fecha = actual
                break
        fechas[ruta] = fecha or hoy
    with open(os.path.join(RAIZ, "material-fechas.json"), "w", encoding="utf-8") as f:
        json.dump(fechas, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"Listo: {len(fechas)} fechas en material-fechas.json")


if __name__ == "__main__":
    main()
