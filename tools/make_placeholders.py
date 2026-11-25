#!/usr/bin/env python3
"""Generate the neutral placeholder artwork the film loads by default.

Covers   film/assets/01..06-diy-vector.svg   (square vector covers, 4096 viewBox)
Albums   film/assets/classical-01..07.jpg    (2400x2400 bitmaps)
Logo     film/assets/fan-normal.svg / .png   (1024x1024 app-icon style mark)

Overwrite any of these files with your own artwork (same file name, same aspect ratio).
Needs Pillow:  pip install pillow
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

A = Path(__file__).resolve().parent.parent / "film" / "assets"
PALETTES = [("#2b1f4a", "#8f6bd8", "#f2c6ff"), ("#0f2f3a", "#3fa3b8", "#c8f3ff"), ("#08261f", "#2ec4a0", "#d4ffe9"),
            ("#3a1606", "#e8743b", "#ffd9b0"), ("#3a0a1f", "#d6336c", "#ffc9de"), ("#2e2408", "#c9a227", "#fff1c0"),
            ("#0d1a2e", "#4a7bd0", "#dbe7ff")]

def svg_cover(i, c):
    bg, mid, hi = c
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4096 4096" width="4096" height="4096">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{bg}"/><stop offset="1" stop-color="{mid}"/></linearGradient>
    <radialGradient id="r" cx=".68" cy=".3" r=".6"><stop offset="0" stop-color="{hi}" stop-opacity=".75"/><stop offset="1" stop-color="{hi}" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="4096" height="4096" fill="url(#g)"/>
  <rect width="4096" height="4096" fill="url(#r)"/>
  <circle cx="{1400 + i * 180}" cy="{2500 - i * 90}" r="{900 + i * 60}" fill="none" stroke="{hi}" stroke-opacity=".35" stroke-width="18"/>
  <circle cx="{1400 + i * 180}" cy="{2500 - i * 90}" r="{560 + i * 40}" fill="none" stroke="{hi}" stroke-opacity=".2" stroke-width="10"/>
  <text x="300" y="3780" font-family="sans-serif" font-size="220" font-weight="600" fill="{hi}" fill-opacity=".7" letter-spacing="24">COVER {i:02d}</text>
</svg>
'''

def jpg_album(i, c, path):
    bg, mid, hi = c
    s = 2400
    im = Image.new("RGB", (s, s), bg)
    d = ImageDraw.Draw(im)
    for y in range(s):
        t = y / s
        a, b = Image.new("RGB", (1, 1), bg).getpixel((0, 0)), Image.new("RGB", (1, 1), mid).getpixel((0, 0))
        d.line([(0, y), (s, y)], fill=tuple(int(a[k] + (b[k] - a[k]) * t) for k in range(3)))
    glow = Image.new("L", (s, s), 0)
    ImageDraw.Draw(glow).ellipse([s * .35, s * .1, s * .95, s * .7], fill=170)
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    im = Image.composite(Image.new("RGB", (s, s), hi), im, glow)
    d = ImageDraw.Draw(im)
    for k in range(5):
        r = 300 + k * 140
        d.ellipse([s / 2 - r, s * .55 - r, s / 2 + r, s * .55 + r], outline=hi, width=6)
    im.save(path, quality=90)

def logo_svg():
    return '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  <title>Placeholder logo</title>
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b6cff"/><stop offset="1" stop-color="#22c3a6"/></linearGradient></defs>
  <rect width="1024" height="1024" rx="204.8" fill="url(#g)"/>
  <circle cx="512" cy="512" r="250" fill="none" stroke="#ffffff" stroke-width="56"/>
  <circle cx="512" cy="512" r="86" fill="#ffffff"/>
</svg>
'''

def logo_png(path):
    s = 1024
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    grad = Image.new("RGBA", (s, s))
    gd = ImageDraw.Draw(grad)
    for y in range(s):
        t = y / s
        gd.line([(0, y), (s, y)], fill=(int(91 + (34 - 91) * t), int(108 + (195 - 108) * t), int(255 + (166 - 255) * t), 255))
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, s - 1, s - 1], radius=205, fill=255)
    im.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(im)
    d.ellipse([262, 262, 762, 762], outline="white", width=56)
    d.ellipse([426, 426, 598, 598], fill="white")
    im.save(path)

if __name__ == "__main__":
    A.mkdir(parents=True, exist_ok=True)
    for i in range(1, 7):
        (A / f"{i:02d}-diy-vector.svg").write_text(svg_cover(i, PALETTES[i - 1]))
    for i in range(1, 8):
        jpg_album(i, PALETTES[i - 1], A / f"classical-{i:02d}.jpg")
    (A / "fan-normal.svg").write_text(logo_svg())
    logo_png(A / "fan-normal.png")
    print("placeholders written to", A)
