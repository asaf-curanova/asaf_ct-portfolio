"""Generates og-image.png and favicon assets for the portfolio, matching the site's
dark, single-accent-violet, cinematic identity. Run once locally; not needed at deploy time."""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "assets")
os.makedirs(OUT_DIR, exist_ok=True)

BG = (8, 8, 10, 255)
ACCENT = (124, 92, 255)      # violet
ACCENT_DIM = (90, 70, 190)   # darker violet for secondary glow
TEXT = (242, 242, 244, 255)
MUTED = (154, 154, 164)

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

    add_glow(img, (150, 80), 340, ACCENT, alpha=55)
    add_glow(img, (1060, 540), 320, ACCENT_DIM, alpha=55)

    bar = Image.new("RGBA", (W, 4), (*ACCENT, 255))
    img.alpha_composite(bar, (0, 0))

    d = ImageDraw.Draw(img)

    eyebrow_font = font("consola.ttf", 20)
    mark_font = font("seguibl.ttf", 150)
    role_font = font("segoeuisb.ttf" if os.path.exists(os.path.join(FONT_DIR, "segoeuisb.ttf")) else "segoeuib.ttf", 30)
    tag_font = font("consola.ttf", 20)

    left = 90
    y = 130
    d.text((left, y), "CREATIVE TECHNOLOGIST", font=eyebrow_font, fill=(92, 97, 105, 255))
    y += 48

    mark = "ASAF"
    for i, ch in enumerate(mark):
        x = left
        cw = d.textlength(mark[:i], font=mark_font)
        color = TEXT if i % 2 == 0 else (*ACCENT, 255)
        d.text((left + cw, y), ch, font=mark_font, fill=color)
    y += 190

    d.text((left, y), "AI/ML \u2022 Generative AI \u2022 Visual Design", font=role_font, fill=MUTED)
    y += 50
    d.text((left, y), "Computer Science graduate \u2014 Kerala, India", font=tag_font, fill=(*ACCENT, 255))

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
    add_glow(bg, (W * 0.3, W * 0.3), W * 0.45, ACCENT, alpha=120)
    add_glow(bg, (W * 0.75, W * 0.8), W * 0.35, ACCENT_DIM, alpha=100)

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
    d.ellipse([dot_cx - dot_r, dot_cy - dot_r, dot_cx + dot_r, dot_cy + dot_r], fill=(*ACCENT, 255))

    img = img.resize((S, S), Image.LANCZOS)
    img.save(os.path.join(OUT_DIR, out_name), "PNG")
    print(out_name, "done")


if __name__ == "__main__":
    make_og()
    make_favicon(512, "favicon.png")
    make_favicon(180, "apple-touch-icon.png")
    make_favicon(32, "favicon-32.png")
    make_favicon(16, "favicon-16.png")
