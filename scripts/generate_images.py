"""Generates og-image.png and favicon assets for the portfolio, matching the site's
dark/indigo/teal visual identity. Run once locally; not needed at deploy time."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT_DIR, exist_ok=True)

BG = (8, 9, 12, 255)
ACCENT_1 = (124, 140, 255)   # indigo
ACCENT_2 = (79, 209, 197)    # teal
ACCENT_3 = (178, 141, 255)   # violet
TEXT = (237, 238, 241)
MUTED = (154, 160, 170)

FONT_DIR = r"C:\Windows\Fonts"


def font(name, size):
    return ImageFont.truetype(os.path.join(FONT_DIR, name), size)


def add_glow(base, center, radius, color, alpha=90):
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(glow)
    x, y = center
    d.ellipse([x - radius, y - radius, x + radius, y + radius], fill=(*color, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius * 0.55))
    base.alpha_composite(glow)


# ---------------- OG image (1200x630) ----------------
def make_og():
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), BG)

    add_glow(img, (120, 60), 320, ACCENT_1, alpha=70)
    add_glow(img, (1080, 560), 300, ACCENT_2, alpha=65)
    add_glow(img, (760, 160), 200, ACCENT_3, alpha=35)

    # top accent bar
    bar = Image.new("RGBA", (W, 5), (0, 0, 0, 0))
    for x in range(W):
        t = x / W
        r = int(ACCENT_1[0] + (ACCENT_2[0] - ACCENT_1[0]) * t)
        g = int(ACCENT_1[1] + (ACCENT_2[1] - ACCENT_1[1]) * t)
        b = int(ACCENT_1[2] + (ACCENT_2[2] - ACCENT_1[2]) * t)
        for y in range(5):
            bar.putpixel((x, y), (r, g, b, 255))
    img.alpha_composite(bar, (0, 0))

    d = ImageDraw.Draw(img)

    eyebrow_font = font("consola.ttf", 22)
    name_font = font("seguibl.ttf", 74)
    role_font = font("segoeuisb.ttf" if os.path.exists(os.path.join(FONT_DIR, "segoeuisb.ttf")) else "segoeuib.ttf", 34)
    tag_font = font("consola.ttf", 22)

    left = 90
    y = 150
    d.text((left, y), "PORTFOLIO", font=eyebrow_font, fill=(92, 97, 105, 255))
    y += 46

    d.text((left, y), "MOHAMMED ASAF ", font=name_font, fill=TEXT)
    name_w = d.textlength("MOHAMMED ASAF ", font=name_font)
    d.text((left + name_w, y), "CT", font=name_font, fill=ACCENT_2)
    y += 100

    d.text((left, y), "AI Data Engineer", font=role_font, fill=MUTED)
    y += 66

    tagline = "AI/ML  \u2022  Generative AI  \u2022  Data  \u2022  Computer Vision"
    d.text((left, y), tagline, font=tag_font, fill=ACCENT_2)

    # bottom-right small wordmark
    mark_font = font("seguibl.ttf", 26)
    mark = "ASAF."
    mw = d.textlength(mark, font=mark_font)
    d.text((W - 90 - mw, H - 80), mark, font=mark_font, fill=TEXT)

    img.convert("RGB").save(os.path.join(OUT_DIR, "og-image.png"), "PNG", optimize=True)
    print("og-image.png done")


# ---------------- Favicon (rounded square, letter mark) ----------------
def make_favicon(size, out_name):
    S = size
    scale = 4
    W = S * scale
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))

    radius = int(W * 0.24)
    mask = Image.new("L", (W, W), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W, W], radius=radius, fill=255)

    bg = Image.new("RGBA", (W, W), BG)
    add_glow(bg, (W * 0.28, H_ := W * 0.32), W * 0.42, ACCENT_1, alpha=110)
    add_glow(bg, (W * 0.78, W * 0.78), W * 0.38, ACCENT_2, alpha=110)

    img.paste(bg, (0, 0), mask)

    d = ImageDraw.Draw(img)
    letter_font = font("seguibl.ttf", int(W * 0.56))
    letter = "A"
    bbox = d.textbbox((0, 0), letter, font=letter_font)
    lw, lh = bbox[2] - bbox[0], bbox[3] - bbox[1]
    lx = (W - lw) / 2 - bbox[0]
    ly = (W - lh) / 2 - bbox[1] - W * 0.02
    d.text((lx, ly), letter, font=letter_font, fill=TEXT)

    dot_r = W * 0.045
    dot_cx = W * 0.735
    dot_cy = W * 0.72
    d.ellipse([dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r], fill=ACCENT_2)

    img = img.resize((S, S), Image.LANCZOS)
    img.save(os.path.join(OUT_DIR, out_name), "PNG")
    print(out_name, "done")


if __name__ == "__main__":
    make_og()
    make_favicon(512, "favicon.png")
    make_favicon(180, "apple-touch-icon.png")
    make_favicon(32, "favicon-32.png")
    make_favicon(16, "favicon-16.png")
