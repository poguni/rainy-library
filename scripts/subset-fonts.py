"""두 테마의 글꼴을 필요한 글자만 남긴 woff2로 만듭니다(DESIGN.md 4.1, PRD 10장).

남기는 글자: 한글 완성형 2,350자(KS X 1001) + 영문·숫자·문장 부호 + 앱 코드(src/)에 쓰인 모든 글자.
영문 장식 글꼴(Cormorant)은 영문·숫자·문장 부호만 남깁니다.
가변 글꼴(이름에 [wght])은 정한 굵기 하나로 고정(instancer)한 뒤 줄입니다.
사용: python scripts/subset-fonts.py  (원본 TTF는 font-sources/ 에, 결과는 src/assets/fonts/)
"""
import re
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "font-sources"
OUT = ROOT / "src" / "assets" / "fonts"

# (원본, 결과, 굵기 고정값 또는 None, 영문만?)
FONTS = [
    # 종이 서재
    ("GowunBatang-Regular.ttf", "gowun-batang-400.woff2", None, False),
    ("GowunBatang-Bold.ttf", "gowun-batang-700.woff2", None, False),
    ("GowunDodum-Regular.ttf", "gowun-dodum-400.woff2", None, False),
    # 에메랄드 서재
    # 용량 때문에 본명조는 600 하나(700 자리에도 600을 씀), IBM Plex는 400 하나만 넣습니다(+약 470KB 절약).
    ("NotoSerifKR[wght].ttf", "noto-serif-kr-600.woff2", 600, False),
    ("IBMPlexSansKR-Regular.ttf", "ibm-plex-sans-kr-400.woff2", None, False),
    ("CormorantGaramond[wght].ttf", "cormorant-garamond-500.woff2", 500, True),
    ("CormorantGaramond[wght].ttf", "cormorant-garamond-600.woff2", 600, True),
    ("CormorantGaramond-Italic[wght].ttf", "cormorant-garamond-italic-500.woff2", 500, True),
]

EXTRA = "·…—–−→←↑↓“”‘’「」『』《》〈〉※○●◆◇■□★☆♪①②③④⑤⑥⑦⑧⑨⑩％～"


def ksx1001_hangul() -> str:
    chars = []
    for b1 in range(0xB0, 0xC9):
        for b2 in range(0xA1, 0xFF):
            chars.append(bytes([b1, b2]).decode("euc-kr"))
    return "".join(chars)


def chars_in_code() -> str:
    found = set()
    for path in (ROOT / "src").rglob("*"):
        if path.suffix in {".ts", ".tsx", ".css", ".html"}:
            found.update(ch for ch in path.read_text(encoding="utf-8") if ord(ch) > 0x7E)
    for path in [ROOT / "index.html"]:
        found.update(ch for ch in path.read_text(encoding="utf-8") if ord(ch) > 0x7E)
    return "".join(sorted(found))


def main() -> None:
    hangul = ksx1001_hangul()
    assert len(hangul) == 2350
    text = "".join(chr(c) for c in range(0x20, 0x7F)) + hangul + EXTRA + chars_in_code()
    unicodes = sorted({ord(c) for c in text if not re.match(r"\s", c) or c == " "})
    latin = [u for u in unicodes if u < 0x1100 or 0x2000 <= u < 0x2100]
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for src_name, out_name, wght, latin_only in FONTS:
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.hinting = False  # 힌팅 정보 제거(화면 크기에서는 차이가 거의 없음)
        opts.desubroutinize = True
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]  # 저작권·라이선스 정보는 그대로 둠(OFL)
        if wght is None:
            font = subset.load_font(str(SRC / src_name), opts)
        else:
            font = instancer.instantiateVariableFont(TTFont(str(SRC / src_name)), {"wght": wght})
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=latin if latin_only else unicodes)
        sub.subset(font)
        out = OUT / out_name
        subset.save_font(font, str(out), opts)
        size = out.stat().st_size
        total += size
        print(f"{out_name}: {size // 1024}KB")
    print(f"합계 {total // 1024}KB, 글자 {len(unicodes)}개")


if __name__ == "__main__":
    main()
