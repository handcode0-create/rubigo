#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""RUBIGO — restauration sûre de src/data.ts.

Place ce fichier ET rubigo_data_restored.ts à la racine du projet, puis lance:
    python restore_data_safe.py
"""
from datetime import datetime
from pathlib import Path
import os, re, shutil, sys

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "src" / "data.ts"
SOURCE = ROOT / "rubigo_data_restored.ts"
REQUIRED_EXPORTS = ["user", "services", "categories", "merchants", "products", "initialOrders"]

def fail(message):
    print(f"ERREUR — {message}")
    sys.exit(1)

def validate(content):
    if not content.strip(): fail("le fichier restauré est vide.")
    for name in REQUIRED_EXPORTS:
        if not re.search(rf"export\s+const\s+{re.escape(name)}\b", content):
            fail(f"export manquant : {name}")
    if "from './types'" not in content:
        fail("import des types RUBIGO introuvable.")
    merchants = len(re.findall(r"id:\s*'merchant-\d+'", content))
    products = len(re.findall(r"id:\s*'p-\d+'", content))
    orders = len(re.findall(r"orderNumber:\s*'RB-", content))
    if merchants < 20: fail(f"trop peu de commerçants détectés ({merchants}).")
    if products < 100: fail(f"trop peu de produits détectés ({products}).")
    if orders < 5: fail(f"trop peu de commandes détectées ({orders}).")
    print("Vérification OK :")
    print(f"  Commerçants : {merchants}")
    print(f"  Produits    : {products}")
    print(f"  Commandes   : {orders}")

def main():
    if not SOURCE.exists():
        fail("rubigo_data_restored.ts est introuvable. Place les deux fichiers à la racine du projet.")
    content = SOURCE.read_text(encoding="utf-8")
    validate(content)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    if OUTPUT.exists():
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup = OUTPUT.with_name(f"data.ts.backup_{stamp}")
        shutil.copy2(OUTPUT, backup)
        print(f"Sauvegarde créée : {backup}")
    temp = OUTPUT.with_name(".data.ts.restore.tmp")
    try:
        temp.write_text(content, encoding="utf-8")
        validate(temp.read_text(encoding="utf-8"))
        os.replace(temp, OUTPUT)
    except Exception:
        if temp.exists(): temp.unlink()
        raise
    print(f"\nOK — restauration terminée : {OUTPUT}")
    print("Aucun autre fichier du projet n'a été modifié.")

if __name__ == "__main__": main()
