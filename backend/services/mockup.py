"""Tee-mockup compositor.

Pastes a transparent-PNG design onto a blank-tee photo inside a fixed
anchor rectangle, producing a 1200x1500 (4:5) PNG that slots directly
into <img class="aspect-[4/5]"> on the frontend. One implementation,
two entry points: HTTP endpoints (admin UI) and an optional CLI.
"""
from io import BytesIO
from typing import Optional

from PIL import Image

# 4:5 aspect matches BrandPage/ProductDetail's aspect-[4/5] Tailwind class.
CANVAS = (1200, 1500)

# Default anchor rect (x, y, w, h) — centered horizontally on the shirt chest.
# Admin can override per-template via anchor_json on TeeTemplate.
DEFAULT_ANCHOR = {"x": 375, "y": 450, "w": 450, "h": 550}

WHITE_THRESHOLD = 245  # 0–255 per channel; pixels ≥ threshold on R,G,B count as "near-white"
BORDER_RATIO = 0.95    # outer border must be ≥95% near-white to trigger auto-key


def _maybe_whitekey(img: Image.Image) -> Image.Image:
    """Turn near-white pixels transparent only when the border is almost all white.

    Protects designs with legitimate internal white (logos, text) from being
    destroyed while still handling JPEGs exported with baked white backgrounds.
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    w, h = img.size
    if w < 4 or h < 4:
        return img
    px = img.load()
    samples = []
    step_x = max(1, w // 40)
    step_y = max(1, h // 40)
    for x in range(0, w, step_x):
        samples.append(px[x, 0])
        samples.append(px[x, h - 1])
    for y in range(0, h, step_y):
        samples.append(px[0, y])
        samples.append(px[w - 1, y])
    near = sum(1 for p in samples if p[0] >= WHITE_THRESHOLD and p[1] >= WHITE_THRESHOLD and p[2] >= WHITE_THRESHOLD)
    if near / len(samples) < BORDER_RATIO:
        return img
    data = img.getdata()
    keyed = [
        (r, g, b, 0) if r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD else (r, g, b, a)
        for r, g, b, a in data
    ]
    img.putdata(keyed)
    return img


def composite(
    design_bytes: bytes,
    tee_bytes: bytes,
    anchor: Optional[dict] = None,
    canvas: tuple = CANVAS,
) -> bytes:
    """Return PNG bytes of `design` pasted onto `tee` inside `anchor`.

    `design` may be a transparent PNG or a JPEG with a baked white background —
    the compositor auto-keys the white only when the outer border is ≥95%
    near-white, protecting designs with intentional internal white.
    `tee` is any raster image resized (not cropped) to `canvas`.
    """
    a = anchor or DEFAULT_ANCHOR
    tee = Image.open(BytesIO(tee_bytes)).convert("RGBA").resize(canvas, Image.LANCZOS)
    design = Image.open(BytesIO(design_bytes))
    design = _maybe_whitekey(design)
    design.thumbnail((a["w"], a["h"]), Image.LANCZOS)
    x = a["x"] + (a["w"] - design.width) // 2
    y = a["y"] + (a["h"] - design.height) // 2
    tee.paste(design, (x, y), mask=design)
    buf = BytesIO()
    tee.convert("RGB").save(buf, "PNG", optimize=True)
    return buf.getvalue()
