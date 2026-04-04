import { readdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const dir = resolve("static/data");
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".md"))
  .sort()
  .map((f) => ({
    name: f.replace(".md", ""),
    url: `data/${f}`,
  }));

writeFileSync("static/wordpacks.json", JSON.stringify(files, null, 2));
console.log(`Generated wordpacks.json with ${files.length} wordpacks`);
