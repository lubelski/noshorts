"""Package only shipped files, never tests, dependencies, or development assets."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
extension = root / "extension"
version = json.loads((extension / "manifest.json").read_text())["version"]
output = root / "dist" / f"NoShorts-{version}.zip"
output.parent.mkdir(exist_ok=True)
with ZipFile(output, "w", ZIP_DEFLATED) as archive:
    for file in sorted(extension.rglob("*")):
        if file.is_file() and file.name != ".DS_Store":
            archive.write(file, file.relative_to(extension))
print(output)
