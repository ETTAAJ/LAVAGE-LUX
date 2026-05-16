# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "public" / "index.html"
BLOCK = ROOT / "public" / "reservation-block.html"
MARKER = '    </section>\n\n    <section class="border-y border-or/25'

def main():
    html = INDEX.read_text(encoding="utf-8")
    if 'id="reservation"' in html and "bookingWizard" in html:
        print("Already inserted")
        return
    if MARKER not in html:
        print("Marker not found")
        return
    block = BLOCK.read_text(encoding="utf-8")
    html = html.replace(
        MARKER,
        "    </section>\n\n" + block + "\n\n    <section class=\"border-y border-or/25",
        1,
    )
    INDEX.write_text(html, encoding="utf-8")
    print("Inserted reservation block")

if __name__ == "__main__":
    main()
