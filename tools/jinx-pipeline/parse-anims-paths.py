import json
import re
from pathlib import Path

p = Path(__file__).parent / "work" / "jinx-anims-skin0.json"
text = p.read_text(encoding="utf-8")
paths = sorted(set(re.findall(r"assets/characters/jinx[^\"\\]+", text)))
print("paths", len(paths))
for x in paths:
    print(x)
