#!/usr/bin/env python3
"""Extract Dalia sprites from character sheets.

Crops defined regions, removes the cream paper background via border
flood-fill, keeps only the main connected blob (drops doodles/hearts),
auto-trims and saves transparent PNGs. Also builds a review contact sheet.
"""
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "Dalia-character-sheet"
OUT = ROOT / "app" / "assets" / "img" / "dalia"
TMP = Path("/var/folders/wr/vb_4shw10pv42_spbw804wkc0000gn/T/opencode/dalia-preview")

TOL = 52          # color distance treated as background
FEATHER = 1       # px gaussian blur on alpha edges
MIN_KEEP_FRAC = 0.07  # keep components >= this fraction of biggest one

# name: (source file, box as fractions l,t,r,b) — calibrated on 10% grids
SPECS = {
    # v1 — soft sketch sheet
    "sit-front":   ("dalia-v1.png", (0.015, 0.000, 0.410, 0.610)),
    "head-eyes":   ("dalia-v1.png", (0.435, 0.000, 0.790, 0.330)),
    "bow":         ("dalia-v1.png", (0.415, 0.345, 0.710, 0.630)),
    "head-tongue": ("dalia-v1.png", (0.715, 0.355, 0.985, 0.610)),
    "sleep-curl":  ("dalia-v1.png", (0.000, 0.630, 0.340, 0.930)),
    "paws-face":   ("dalia-v1.png", (0.355, 0.650, 0.690, 1.000)),
    "back-sit":    ("dalia-v1.png", (0.740, 0.600, 0.960, 0.940)),
    # v2 — character sheet
    "sit-happy":   ("dalia-v2.png", (0.160, 0.000, 0.430, 0.290)),
    "stand-side":  ("dalia-v2.png", (0.435, 0.000, 0.690, 0.290)),
    "stand-back":  ("dalia-v2.png", (0.675, 0.010, 0.930, 0.310)),
    "jump":        ("dalia-v2.png", (0.395, 0.335, 0.570, 0.540)),
    "bow-low":     ("dalia-v2.png", (0.555, 0.325, 0.790, 0.530)),
    "alert":       ("dalia-v2.png", (0.755, 0.325, 0.980, 0.560)),
    "lie-front":   ("dalia-v2.png", (0.410, 0.545, 0.660, 0.810)),
    "top-down":    ("dalia-v2.png", (0.650, 0.545, 0.780, 0.730)),
    "run":         ("dalia-v2.png", (0.040, 0.710, 0.330, 1.000)),
    "sleep-pile":  ("dalia-v2.png", (0.370, 0.775, 0.680, 0.960)),
    "sit-up":      ("dalia-v2.png", (0.710, 0.730, 0.960, 1.000)),
    # v3 — czeko-puch sheet (highest res); skip top rotation row (guide frames
    # trap background — equivalents exist from v1/v2)
    "run3":        ("dalia-v3.jpeg", (0.040, 0.615, 0.390, 0.880)),
    "sit-side3":   ("dalia-v3.jpeg", (0.635, 0.655, 0.845, 0.890)),
    "expr-happy":  ("dalia-v3.jpeg", (0.040, 0.350, 0.270, 0.505)),
    "expr-surprise": ("dalia-v3.jpeg", (0.275, 0.330, 0.485, 0.475)),
    "expr-drool":  ("dalia-v3.jpeg", (0.185, 0.435, 0.395, 0.575)),
    "expr-cry":    ("dalia-v3.jpeg", (0.430, 0.450, 0.615, 0.580)),
}

SRC_TOL = {"dalia-v3.jpeg": 64}


def remove_bg(im: Image.Image, tol: float = TOL) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()

    # sample background colour as MEDIAN of border ring (robust to lines/text)
    ring = []
    for x in range(0, w, max(1, w // 120)):
        ring.append(px[x, 0]); ring.append(px[x, h - 1])
    for y in range(0, h, max(1, h // 120)):
        ring.append(px[0, y]); ring.append(px[w - 1, y])
    rs = sorted(c[0] for c in ring); gs = sorted(c[1] for c in ring); bs = sorted(c[2] for c in ring)
    m = len(ring) // 2
    br, bg, bb = rs[m], gs[m], bs[m]

    # BFS flood fill from borders
    from collections import deque
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            q.append((x, y))

    def is_bg(x, y):
        r, g, b, _ = px[x, y]
        return (r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2 <= tol * tol * 3

    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        if not is_bg(x, y):
            continue
        px[x, y] = (0, 0, 0, 0)
        for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx]:
                q.append((nx, ny))

    # keep only significant connected components (main blob)
    comp = [-1] * (w * h)
    sizes = []
    cid = 0
    for start in range(w * h):
        if comp[start] != -1 or px[start % w, start // w][3] == 0:
            continue
        sizes.append(0)
        qq = deque([start])
        comp[start] = cid
        while qq:
            i = qq.popleft()
            sizes[cid] += 1
            x, y = i % w, i // w
            for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if comp[j] == -1 and px[nx, ny][3] > 0:
                        comp[j] = cid
                        qq.append(j)
        cid += 1

    if sizes:
        big = max(sizes)
        keep = {k for k, s in enumerate(sizes) if s >= big * MIN_KEEP_FRAC}
        for i in range(w * h):
            if comp[i] not in keep:
                x, y = i % w, i // w
                px[x, y] = (0, 0, 0, 0)

    # feather alpha
    alpha = im.getchannel("A").filter(ImageFilter.GaussianBlur(FEATHER))
    im.putalpha(alpha)
    return im


def trim(im: Image.Image, pad_frac=0.02) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    pw = int((r - l) * pad_frac)
    ph = int((b - t) * pad_frac)
    l, t = max(0, l - pw), max(0, t - ph)
    r, b = min(im.width, r + pw), min(im.height, b + ph)
    return im.crop((l, t, r, b))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    cache = {}
    results = []
    for name, (fname, box) in SPECS.items():
        path = SRC / fname
        if fname not in cache:
            cache[fname] = Image.open(path)
        src = cache[fname]
        W, H = src.size
        l, t, r, b = box
        region = src.crop((int(l * W), int(t * H), int(r * W), int(b * H)))
        cut = trim(remove_bg(region, SRC_TOL.get(fname, TOL)))
        cut.save(OUT / f"{name}.png")
        results.append((name, cut))
        print(f"{name}: {cut.size}")

    # app icon — happy face on cream rounded square
    face = (OUT / "expr-happy.png")
    if face.exists():
        icon_src = Image.open(face)
        size = 512
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        bg = Image.new("RGBA", (size, size), (246, 234, 219, 255))
        mask = Image.new("L", (size, size), 0)
        from PIL import ImageDraw
        d = ImageDraw.Draw(mask)
        d.rounded_rectangle([8, 8, size - 8, size - 8], radius=110, fill=255)
        canvas.paste(bg, (0, 0), mask)
        ic = icon_src.copy()
        ic.thumbnail((int(size * 0.86), int(size * 0.72)))
        canvas.paste(ic, ((size - ic.width) // 2, (size - ic.height) // 2 + 20), ic)
        canvas.save(ROOT / "app" / "assets" / "icons" / "icon-512.png")
        small = canvas.resize((192, 192), Image.LANCZOS)
        small.save(ROOT / "app" / "assets" / "icons" / "icon-192.png")
        print("icons written")

    # contact sheet for visual review
    cols = 6
    cell = 260
    rows = (len(results) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * cell), (246, 234, 219))
    for idx, (name, im) in enumerate(results):
        im.thumbnail((cell - 16, cell - 16))
        x = (idx % cols) * cell + (cell - im.width) // 2
        y = (idx // cols) * cell + (cell - im.height) // 2
        sheet.paste(im, (x, y), im)
    sheet.save(TMP / "contact_sheet.png")
    print("contact sheet:", TMP / "contact_sheet.png")


if __name__ == "__main__":
    sys.exit(main())
