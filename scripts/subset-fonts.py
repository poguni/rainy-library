"""종이 서재 글꼴을 필요한 글자만 남긴 woff2로 만듭니다(DESIGN.md 4.1, PRD 10장).

남기는 글자: 한글 완성형 2,350자(KS X 1001) + 영문·숫자·문장 부호 + 앱 코드(src/)에 쓰인 모든 글자.
사용: python scripts/subset-fonts.py  (원본 TTF는 font-sources/ 에, 결과는 src/assets/fonts/)
"""
import re
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "font-sources"
OUT = ROOT / "src" / "assets" / "fonts"

FONTS = {
    "GowunBatang-Regular.ttf": "gowun-batang-400.woff2",
    "GowunBatang-Bold.ttf": "gowun-batang-700.woff2",
    "GowunDodum-Regular.ttf": "gowun-dodum-400.woff2",
}

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
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for src_name, out_name in FONTS.items():
        opts = subset.Options()
        opts.flavor = "woff2"
        opts.hinting = False  # 힌팅 정보 제거(화면 크기에서는 차이가 거의 없음)
        opts.desubroutinize = True
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]  # 저작권·라이선스 정보는 그대로 둠(OFL)
        font = subset.load_font(str(SRC / src_name), opts)
        sub = subset.Subsetter(opts)
        sub.populate(unicodes=unicodes)
        sub.subset(font)
        out = OUT / out_name
        subset.save_font(font, str(out), opts)
        size = out.stat().st_size
        total += size
        print(f"{out_name}: {size // 1024}KB")
    print(f"합계 {total // 1024}KB, 글자 {len(unicodes)}개")


if __name__ == "__main__":
    main()
