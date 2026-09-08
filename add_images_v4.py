#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RUBIGO — Ajout sûr des images V4.

CORRECTION PRINCIPALE :
Le précédent script V3 cherchait le premier "[" après
"export const merchants:", mais dans "Merchant[]" ce "[" est celui
du type TypeScript, pas celui du tableau de données.

V4 cherche donc explicitement le "=" puis le "[" du tableau.

Le script :
- ne reconstruit pas src/data.ts ;
- ne supprime aucune donnée ;
- ne modifie ni IDs, noms, prix, catégories, commandes ;
- ajoute uniquement image: "..." aux objets merchants/products ;
- crée un backup avant remplacement ;
- écrit de façon atomique ;
- vérifie les exports essentiels ;
- vérifie qu'une image est présente pour chaque objet détecté.
"""

from __future__ import annotations

import re
import shutil
import sys
import tempfile
from datetime import datetime
from pathlib import Path


ROOT = Path(__file__).resolve().parent
DATA = ROOT / "src" / "data.ts"


MERCHANT_IMAGES = {
    "restaurant": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=82",
    ],
    "grillade": [
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=1200&q=82",
    ],
    "fastfood": [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=82",
    ],
    "boulangerie": [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=82",
    ],
    "market": [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=82",
    ],
    "fruits": [
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=82",
    ],
    "boutique": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1200&q=82",
    ],
    "default": [
        "https://images.unsplash.com/photo-1601598851547-4302969d2d6f?auto=format&fit=crop&w=1200&q=82",
        "https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&w=1200&q=82",
    ],
}

PRODUCT_IMAGES = {
    "pizza": [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85",
    ],
    "burger": [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=85",
    ],
    "poulet": [
        "https://images.unsplash.com/photo-1598514982901-ae6278f4a7d1?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=900&q=85",
    ],
    "riz": [
        "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=85",
    ],
    "poisson": [
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=85",
    ],
    "viande": [
        "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
    ],
    "attiéké": [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85",
    ],
    "alloco": [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85",
    ],
    "boisson": [
        "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=900&q=85",
    ],
    "jus": [
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=900&q=85",
    ],
    "cafe": [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85",
    ],
    "pain": [
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=85",
    ],
    "croissant": [
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85",
    ],
    "fruit": [
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=900&q=85",
    ],
    "legume": [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85",
    ],
    "course": [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=900&q=85",
    ],
    "default": [
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=85",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=85",
    ],
}


def find_matching(text: str, opening_pos: int, opening: str, closing: str) -> int:
    depth = 0
    in_string = None
    escape = False
    line_comment = False
    block_comment = False
    i = opening_pos

    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""

        if line_comment:
            if ch == "\n":
                line_comment = False
            i += 1
            continue

        if block_comment:
            if ch == "*" and nxt == "/":
                block_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
            i += 1
            continue

        if ch == "/" and nxt == "/":
            line_comment = True
            i += 2
            continue

        if ch == "/" and nxt == "*":
            block_comment = True
            i += 2
            continue

        if ch in ("'", '"', "`"):
            in_string = ch
        elif ch == opening:
            depth += 1
        elif ch == closing:
            depth -= 1
            if depth == 0:
                return i

        i += 1

    raise RuntimeError(f"Structure non fermée : {opening}{closing}")


def locate_export_array(text: str, export_name: str):
    # IMPORTANT : ne pas prendre le [] de Merchant[] / Product[].
    pattern = rf"\bexport\s+const\s+{re.escape(export_name)}\b"
    match = re.search(pattern, text)

    if not match:
        raise RuntimeError(f"Export `{export_name}` introuvable.")

    eq = text.find("=", match.end())
    if eq == -1:
        raise RuntimeError(f"Affectation `=` introuvable pour `{export_name}`.")

    array_start = text.find("[", eq + 1)
    if array_start == -1:
        raise RuntimeError(f"Tableau `{export_name}` introuvable après `=`.")

    array_end = find_matching(text, array_start, "[", "]")
    return array_start, array_end


def find_top_level_objects(text: str, array_start: int, array_end: int):
    entries = []
    brace_depth = 0
    bracket_depth = 1
    paren_depth = 0
    object_start = None

    in_string = None
    escape = False
    line_comment = False
    block_comment = False

    i = array_start + 1

    while i < array_end:
        ch = text[i]
        nxt = text[i + 1] if i + 1 < array_end else ""

        if line_comment:
            if ch == "\n":
                line_comment = False
            i += 1
            continue

        if block_comment:
            if ch == "*" and nxt == "/":
                block_comment = False
                i += 2
            else:
                i += 1
            continue

        if in_string:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_string:
                in_string = None
            i += 1
            continue

        if ch == "/" and nxt == "/":
            line_comment = True
            i += 2
            continue

        if ch == "/" and nxt == "*":
            block_comment = True
            i += 2
            continue

        if ch in ("'", '"', "`"):
            in_string = ch
            i += 1
            continue

        if ch == "{":
            if brace_depth == 0 and bracket_depth == 1 and paren_depth == 0:
                object_start = i
            brace_depth += 1

        elif ch == "}":
            brace_depth -= 1
            if brace_depth == 0 and object_start is not None:
                entries.append((object_start, i + 1))
                object_start = None

        elif ch == "[":
            bracket_depth += 1

        elif ch == "]":
            bracket_depth -= 1

        elif ch == "(":
            paren_depth += 1

        elif ch == ")":
            paren_depth -= 1

        i += 1

    return entries


def has_image(obj: str) -> bool:
    return re.search(r"(?m)^\s*image\s*:", obj) is not None


def get_property(obj: str, name: str) -> str:
    m = re.search(
        rf"\b{re.escape(name)}\s*:\s*(['\"])(.*?)\1",
        obj,
        re.S,
    )
    return m.group(2) if m else ""


def choose_merchant_image(obj: str, index: int) -> str:
    s = obj.lower()

    if any(x in s for x in ("boulanger", "pâtisserie", "patisserie")):
        pool = MERCHANT_IMAGES["boulangerie"]
    elif any(x in s for x in ("fast-food", "fast food", "snack", "burger")):
        pool = MERCHANT_IMAGES["fastfood"]
    elif any(x in s for x in ("grillade", "braisé", "braise", "brochette", "maquis")):
        pool = MERCHANT_IMAGES["grillade"]
    elif any(x in s for x in ("supermarch", "épicerie", "epicerie", "market", "superette")):
        pool = MERCHANT_IMAGES["market"]
    elif any(x in s for x in ("fruit", "vivre", "légume", "legume")):
        pool = MERCHANT_IMAGES["fruits"]
    elif any(x in s for x in ("boutique", "mode", "shopping")):
        pool = MERCHANT_IMAGES["boutique"]
    else:
        pool = MERCHANT_IMAGES["restaurant"]

    return pool[index % len(pool)]


def choose_product_image(obj: str, index: int) -> str:
    s = obj.lower()

    groups = [
        (("pizza",), "pizza"),
        (("burger",), "burger"),
        (("poulet",), "poulet"),
        (("riz",), "riz"),
        (("poisson", "tilapia", "carpe", "maquereau", "crevette"), "poisson"),
        (("viande", "boeuf", "bœuf", "mouton", "agneau"), "viande"),
        (("attiéké", "attieke"), "attiéké"),
        (("alloco",), "alloco"),
        (("jus", "bissap", "gingembre"), "jus"),
        (("café", "cafe"), "cafe"),
        (("boisson", "soda", "eau"), "boisson"),
        (("croissant",), "croissant"),
        (("pain", "baguette", "brioche", "beignet", "gâteau", "gateau"), "pain"),
        (("mangue", "banane", "orange", "ananas", "avocat", "papaye", "coco", "fruit"), "fruit"),
        (("tomate", "oignon", "gombo", "piment", "carotte", "concombre", "chou", "aubergine", "igname", "plantain"), "legume"),
        (("lessive", "vaisselle", "papier toilette", "éponge", "javel", "savon"), "course"),
        (("shampooing", "crème", "creme", "déodorant", "dentifrice", "vaseline", "beauté"), "default"),
        (("huile", "farine", "sucre", "lait", "pâtes", "sardines", "cube", "sel"), "course"),
    ]

    for keywords, group in groups:
        if any(k in s for k in keywords):
            pool = PRODUCT_IMAGES[group]
            return pool[index % len(pool)]

    category = get_property(obj, "category").lower()

    if any(k in category for k in ("boisson", "drink")):
        pool = PRODUCT_IMAGES["boisson"]
    elif any(k in category for k in ("fruit", "vivre", "légume", "legume")):
        pool = PRODUCT_IMAGES["fruit"]
    elif any(k in category for k in ("course", "market", "épicer", "epicer")):
        pool = PRODUCT_IMAGES["course"]
    elif any(k in category for k in ("pain", "boulanger", "pâtis", "patis")):
        pool = PRODUCT_IMAGES["pain"]
    else:
        pool = PRODUCT_IMAGES["default"]

    return pool[index % len(pool)]


def insert_image(text: str, start: int, end: int, url: str) -> str:
    obj = text[start:end]

    if has_image(obj):
        return text

    p = end - 2
    while p > start and text[p].isspace():
        p -= 1

    if text[p] == ",":
        addition = "\n"
    else:
        addition = ",\n"

    body = obj[1:]
    m = re.search(r"(?m)^(\s+)\w+\s*:", body)
    indent = m.group(1) if m else "    "

    addition += f'{indent}image: "{url}",'
    return text[:p + 1] + addition + text[p + 1:]


def process_export(text: str, export_name: str, selector):
    array_start, array_end = locate_export_array(text, export_name)
    entries = find_top_level_objects(text, array_start, array_end)

    if not entries:
        raise RuntimeError(
            f"Aucun objet détecté dans `{export_name}`. "
            f"Vérifiez la structure du tableau."
        )

    changes = []
    existing = 0

    for index, (start, end) in enumerate(entries):
        obj = text[start:end]

        if has_image(obj):
            existing += 1
            continue

        changes.append((start, end, selector(obj, index)))

    for start, end, url in reversed(changes):
        text = insert_image(text, start, end, url)

    return text, len(entries), existing, len(changes)


def main():
    if not DATA.exists():
        print(f"ERREUR : fichier introuvable : {DATA}")
        sys.exit(1)

    original = DATA.read_text(encoding="utf-8")

    required_exports = [
        "user",
        "services",
        "categories",
        "merchants",
        "products",
        "initialOrders",
    ]

    missing = [
        name for name in required_exports
        if not re.search(rf"\bexport\s+const\s+{re.escape(name)}\b", original)
    ]

    if missing:
        print("ERREUR DE SÉCURITÉ")
        print("Exports essentiels absents :", ", ".join(missing))
        print("AUCUNE MODIFICATION EFFECTUÉE.")
        sys.exit(2)

    print()
    print("=" * 72)
    print("RUBIGO — AJOUT DES IMAGES V4")
    print("=" * 72)
    print(f"Fichier : {DATA}")
    print()

    updated = original

    try:
        updated, merchant_count, merchant_existing, merchant_added = process_export(
            updated, "merchants", choose_merchant_image
        )

        updated, product_count, product_existing, product_added = process_export(
            updated, "products", choose_product_image
        )

        for name in required_exports:
            if not re.search(
                rf"\bexport\s+const\s+{re.escape(name)}\b", updated
            ):
                raise RuntimeError(
                    f"Contrôle final échoué : export `{name}` perdu."
                )

        merchant_start, merchant_end = locate_export_array(updated, "merchants")
        product_start, product_end = locate_export_array(updated, "products")

        merchant_images = len(
            re.findall(r"\bimage\s*:", updated[merchant_start:merchant_end])
        )
        product_images = len(
            re.findall(r"\bimage\s*:", updated[product_start:product_end])
        )

        if merchant_images < merchant_count:
            raise RuntimeError(
                f"Validation merchants échouée : "
                f"{merchant_images} image(s) pour {merchant_count} objet(s)."
            )

        if product_images < product_count:
            raise RuntimeError(
                f"Validation products échouée : "
                f"{product_images} image(s) pour {product_count} objet(s)."
            )

        if updated == original:
            print("Aucune modification nécessaire.")
            print("Les images sont peut-être déjà présentes.")
            print("=" * 72)
            return

        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup = DATA.with_name(f"data.ts.backup_images_v4_{stamp}")

        shutil.copy2(DATA, backup)

        temp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w",
                encoding="utf-8",
                newline="\n",
                delete=False,
                dir=DATA.parent,
                suffix=".tmp",
            ) as tmp:
                tmp.write(updated)
                temp_path = Path(tmp.name)

            temp_path.replace(DATA)

        except Exception:
            if temp_path and temp_path.exists():
                temp_path.unlink()
            raise

    except Exception as exc:
        print()
        print("ERREUR :", exc)
        print()
        print("AUCUNE VERSION PARTIELLE N'A ÉTÉ CONSERVÉE.")
        print("src/data.ts n'a pas été remplacé.")
        sys.exit(3)

    print("COMMERÇANTS")
    print(f"  Détectés              : {merchant_count}")
    print(f"  Images déjà présentes : {merchant_existing}")
    print(f"  Images ajoutées       : {merchant_added}")
    print()
    print("PRODUITS")
    print(f"  Détectés              : {product_count}")
    print(f"  Images déjà présentes : {product_existing}")
    print(f"  Images ajoutées       : {product_added}")
    print()
    print(f"Backup créé : {backup}")
    print()
    print("OK — src/data.ts a été modifié.")
    print("OK — les données métier ont été conservées.")
    print("OK — IDs, prix et commandes conservés.")
    print()
    print("Recharge maintenant l'application avec Ctrl + R.")
    print("=" * 72)


if __name__ == "__main__":
    main()
