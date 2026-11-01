"""앱 아이콘 초안 만들기(docs/ASSETS.md 4장): 세로로 선 책 한 권 + 빗방울 하나, 종이 서재 색.

사용: python scripts/make-icons.py  →  public/icons/*.png, public/favicon.svg
마음에 드는 아이콘이 생기면 같은 파일 이름으로 바꿔 넣으면 됩니다.
"""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"

PAPER = "#F1EADD"  # 바탕(종이)
MOSS = "#52664B"  # 책(이끼)
MOSS_DARK = "#3C4C36"  # 책등 그늘
LINEN = "#E4EADF"  # 책등 띠
INK_BLUE = "#4A5D73"  # 빗방울(먹청)

# 512 기준 좌표. 모두 가운데 80% 원(마스커블 안전 영역) 안에 들어갑니다.
BOOK = (150, 126, 270, 396)
DROP_CENTER, DROP_R, DROP_TOP = (330, 214), 34, (330, 128)


def draw(size: int, rounded: bool) -> Image.Image:
    s = 4  # 4배로 그린 뒤 줄여 가장자리를 부드럽게
    k = size * s / 512
    img = Image.new("RGBA", (size * s, size * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    full = (0, 0, size * s - 1, size * s - 1)
    if rounded:
        d.rounded_rectangle(full, radius=int(96 * k), fill=PAPER)
    else:
        d.rectangle(full, fill=PAPER)

    x0, y0, x1, y1 = (v * k for v in BOOK)
    d.rounded_rectangle((x0, y0, x1, y1), radius=int(10 * k), fill=MOSS)
    d.rectangle((x0, y0 + 10 * k, x0 + 18 * k, y1 - 10 * k), fill=MOSS_DARK)  # 왼쪽 그늘
    for y in (y0 + 40 * k, y1 - 52 * k):  # 위·아래 띠
        d.rectangle((x0 + 30 * k, y, x1 - 14 * k, y + 8 * k), fill=LINEN)

    cx, cy = (v * k for v in DROP_CENTER)
    r = DROP_R * k
    tx, ty = (v * k for v in DROP_TOP)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=INK_BLUE)
    d.polygon([(tx, ty), (cx - r * 0.92, cy - r * 0.38), (cx + r * 0.92, cy - r * 0.38)], fill=INK_BLUE)

    return img.resize((size, size), Image.LANCZOS)


SVG = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="{PAPER}"/>
  <rect x="150" y="126" width="120" height="270" rx="10" fill="{MOSS}"/>
  <rect x="150" y="136" width="18" height="250" fill="{MOSS_DARK}"/>
  <rect x="180" y="166" width="76" height="8" fill="{LINEN}"/>
  <rect x="180" y="344" width="76" height="8" fill="{LINEN}"/>
  <path d="M330 128 L298.7 201.1 A34 34 0 1 0 361.3 201.1 Z" fill="{INK_BLUE}"/>
</svg>
"""


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    draw(192, rounded=True).save(OUT / "icon-192.png")
    draw(512, rounded=True).save(OUT / "icon-512.png")
    draw(512, rounded=False).save(OUT / "icon-maskable-512.png")  # 가장자리까지 바탕을 채움
    draw(180, rounded=False).convert("RGB").save(OUT / "apple-touch-icon.png")  # iOS가 모서리를 둥글게 깎음
    (ROOT / "public" / "favicon.svg").write_text(SVG, encoding="utf-8")
    print("아이콘을 만들었어요:", ", ".join(p.name for p in sorted(OUT.iterdir())), "+ favicon.svg")


if __name__ == "__main__":
    main()
