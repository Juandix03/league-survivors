import json
import sys
import pyritofile

path = sys.argv[1]
scb = pyritofile.read_scb(path)
print("type", type(scb))
print("attrs", [a for a in dir(scb) if not a.startswith("_")])
try:
    print(json.dumps(pyritofile.to_json(scb), indent=2)[:4000])
except Exception as e:
    print("json err", e)
    print(scb)
