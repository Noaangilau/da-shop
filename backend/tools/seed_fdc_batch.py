"""One-shot seeder for the FDC tee batch.

Usage (run once locally):

    1. Place blank-tee templates in ~/Desktop/TS/ and design files in ~/Desktop/DS/.
    2. Seed the 3 tee templates via the admin Mockup Studio UI. Note their ids.
    3. Run this script — it dedupes designs, zips them, POSTs to
       /admin/mockup/bulk for every (design x template) pair, then creates one
       product per unique design with the 3 returned image URLs stored as
       variants.

Environment:
    ADMIN_EMAIL, ADMIN_PASSWORD     — admin login
    API_URL                         — defaults to http://localhost:8000
    BRAND_ID                        — brand id to attach products to (FDC)
    WHITE_TEMPLATE_ID, BLACK_TEMPLATE_ID, GREY_TEMPLATE_ID
    DESIGNS_DIR                     — defaults to ~/Desktop/DS
    PRICE                           — defaults to 45.00
"""
from __future__ import annotations

import io
import json
import os
import re
import sys
import zipfile
from pathlib import Path
from typing import Dict, List

import requests


API_URL = os.getenv("API_URL", "http://localhost:8000")
PRICE = float(os.getenv("PRICE", "45.00"))
DESIGNS_DIR = Path(os.getenv("DESIGNS_DIR", str(Path.home() / "Desktop" / "DS")))

COLOR_BY_ENV = {
    "White": int(os.getenv("WHITE_TEMPLATE_ID", "0")),
    "Black": int(os.getenv("BLACK_TEMPLATE_ID", "0")),
    "Grey":  int(os.getenv("GREY_TEMPLATE_ID",  "0")),
}


def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(1)


def login() -> str:
    email = os.getenv("ADMIN_EMAIL")
    password = os.getenv("ADMIN_PASSWORD")
    if not email or not password:
        die("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars")
    r = requests.post(
        f"{API_URL}/auth/login",
        json={"email": email, "password": password},
        timeout=15,
    )
    r.raise_for_status()
    return r.json()["access_token"]


# Strip timestamp & numeric duplicate suffixes so each design is considered once.
_TIMESTAMP_RE = re.compile(r"_\d{10,}$")
_DUPE_RE = re.compile(r"_([234])$")


def _normalize(stem: str) -> str:
    stem = _TIMESTAMP_RE.sub("", stem)
    stem = _DUPE_RE.sub("", stem)
    return stem


def collect_designs() -> Dict[str, Path]:
    """Return {normalized_stem: path} — keeps the first occurrence."""
    if not DESIGNS_DIR.is_dir():
        die(f"Designs directory not found: {DESIGNS_DIR}")
    out: Dict[str, Path] = {}
    for p in sorted(DESIGNS_DIR.iterdir()):
        if not p.is_file():
            continue
        if p.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
            continue
        key = _normalize(p.stem)
        if key not in out:
            out[key] = p
    return out


def _title_from_stem(stem: str) -> str:
    stem = stem.replace("FDC-", "").replace("FDC_", "")
    stem = stem.replace("_", " ").replace("-", " ")
    return " ".join(w.capitalize() for w in stem.split() if w)


def zip_designs(design_paths: List[Path]) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in design_paths:
            zf.write(p, arcname=p.name)
    return buf.getvalue()


def run_bulk(token: str, designs: Dict[str, Path]) -> Dict[str, Dict[str, str]]:
    """POST the batch to /admin/mockup/bulk and return
    {design_stem: {color: image_url, ...}}.

    The bulk endpoint signature (see routers/admin.py) takes designs_zip +
    tees_zip + combos_json with {design_name, tee_name} pairs. For this tool
    we resolve template_id -> image and pack a tees zip accordingly.
    """
    # Fetch template metadata to build the tees zip
    r = requests.get(f"{API_URL}/admin/tee-templates", headers={"Authorization": f"Bearer {token}"}, timeout=15)
    r.raise_for_status()
    templates = {t["id"]: t for t in r.json()}
    for color, tid in COLOR_BY_ENV.items():
        if not tid or tid not in templates:
            die(f"{color.upper()}_TEMPLATE_ID={tid} not found in /admin/tee-templates")

    # Build tees zip from the template image URLs (must be /media/* on the server)
    tees_buf = io.BytesIO()
    with zipfile.ZipFile(tees_buf, "w", zipfile.ZIP_DEFLATED) as tzf:
        for color, tid in COLOR_BY_ENV.items():
            url = templates[tid]["image_url"]
            tee_resp = requests.get(f"{API_URL}{url}" if url.startswith("/") else url, timeout=30)
            tee_resp.raise_for_status()
            tzf.writestr(f"{color}.png", tee_resp.content)

    design_paths = list(designs.values())
    designs_bytes = zip_designs(design_paths)

    combos = []
    for stem, p in designs.items():
        for color in COLOR_BY_ENV:
            combos.append({"design_name": p.name, "tee_name": f"{color}.png"})

    files = {
        "designs_zip": ("designs.zip", designs_bytes, "application/zip"),
        "tees_zip":    ("tees.zip",    tees_buf.getvalue(), "application/zip"),
    }
    data = {"combos_json": json.dumps(combos)}
    r = requests.post(
        f"{API_URL}/admin/mockup/bulk",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data,
        timeout=600,
    )
    r.raise_for_status()
    results = r.json()["results"]

    # Fold into {stem: {color: url}}
    out: Dict[str, Dict[str, str]] = {}
    color_by_tee = {f"{c}.png": c for c in COLOR_BY_ENV}
    name_to_stem = {p.name: stem for stem, p in designs.items()}
    for row in results:
        if "error" in row:
            print(f"  [skip] {row.get('design_name')} x {row.get('tee_name')}: {row['error']}")
            continue
        stem = name_to_stem.get(row["design_name"])
        color = color_by_tee.get(row["tee_name"])
        if not stem or not color:
            continue
        out.setdefault(stem, {})[color] = row["image_url"]
    return out


def create_products(token: str, per_design: Dict[str, Dict[str, str]]) -> None:
    brand_id = int(os.getenv("BRAND_ID", "0"))
    if not brand_id:
        die("Set BRAND_ID to the FDC brand id")

    created = 0
    for stem, color_to_url in per_design.items():
        if len(color_to_url) == 0:
            continue
        variants = [{"color": c, "image_url": u} for c, u in color_to_url.items()]
        primary = color_to_url.get("White") or next(iter(color_to_url.values()))
        payload = {
            "brand_id":    brand_id,
            "name":        _title_from_stem(stem),
            "collection":  "FDC",
            "price":       PRICE,
            "category":    "Clothing",
            "subcategory": "Tee",
            "description": None,
            "sizes":       ["S", "M", "L", "XL", "XXL"],
            "variants":    variants,
            "image_url":   primary,
            "type":        "product",
            "is_active":   True,
            "is_featured": False,
            "stock_count": None,
        }
        r = requests.post(
            f"{API_URL}/admin/products",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
            timeout=30,
        )
        if r.status_code >= 400:
            print(f"  [fail] {stem}: {r.status_code} {r.text[:200]}")
            continue
        created += 1
        print(f"  [ok]   {stem} -> {len(variants)} variants")

    print(f"\nDone. Created {created} products.")


def main() -> None:
    token = login()
    designs = collect_designs()
    print(f"Found {len(designs)} unique designs in {DESIGNS_DIR}")
    if not designs:
        die("No designs to process")
    per_design = run_bulk(token, designs)
    print(f"Composited {sum(len(v) for v in per_design.values())} mockups across {len(per_design)} designs")
    create_products(token, per_design)


if __name__ == "__main__":
    main()
