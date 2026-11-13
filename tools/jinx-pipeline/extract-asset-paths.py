import json
import re
from pathlib import Path

data = (Path(__file__).parent / "work" / "jinx-skin0-data.json").read_text(
    encoding="utf-8"
)
paths = sorted(set(re.findall(r"assets/[^\"\\]+", data)))
pat = re.compile(r"rocket|fish|minigun|pow|weapon|missile|projectile|gun|launcher|basicattack|wpn", re.I)
matched = [p for p in paths if pat.search(p)]
print(f"Total asset paths: {len(paths)}")
print(f"Weapon/VFX-related: {len(matched)}")
for p in matched:
    print(p)
