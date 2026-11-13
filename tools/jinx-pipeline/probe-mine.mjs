import fs from "fs";
const raw = fs.readFileSync("work/jinx-skin0-data.json", "utf8");
const set = new Set();
for (const m of raw.matchAll(/Jinx_Base_E_[A-Za-z0-9_]+/g)) set.add(m[0]);
[...set].sort().forEach((x) => console.log(x));
