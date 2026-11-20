# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow==12.3.0"]
# ///
"""Run node scripts/render-logo.js first to rasterize the editable SVG."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
with Image.open(root / "assets/mascot.png") as source:
    out = root / "extension/icons"
    out.mkdir(exist_ok=True)
    for size in (16, 32, 48, 128):
        source.resize((size, size), Image.Resampling.LANCZOS).save(out / f"icon-{size}.png")
