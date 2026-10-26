const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve("assets/images");
const files = [
  "index.html",
  ...JSON.parse(fs.readFileSync("documentation/page-manifest.json", "utf8"))
    .filter((page) => page.file !== "index")
    .map((page) => `pages/${page.file}.html`),
];
const used = new Set();
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/(?:src|data-gallery-src)="([^"]*assets\/images\/[^"]+)"/g)) {
    used.add(path.resolve(path.dirname(file), match[1]));
  }
}
for (const dir of fs.readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const location = path.join(root, dir.name);
  for (const file of fs.readdirSync(location)) {
    const resolved = path.resolve(location, file);
    if (!resolved.startsWith(root + path.sep)) throw Error("Outside image workspace");
    if (file.endsWith(".webp") && !used.has(resolved)) fs.unlinkSync(resolved);
  }
}
const sources = fs.readFileSync("scripts/download-assets.ps1", "utf8");
const generated = new Set(
  JSON.parse(fs.readFileSync("documentation/generated-assets.json", "utf8")).map(
    (asset) => asset.name,
  ),
);
const entries = [...sources.matchAll(/@\('([^']+)', '([^']+)'\)/g)]
  .filter(([, name]) => fs.existsSync(path.join(root, name + ".webp")) && !generated.has(name))
  .map(
    ([, name, id]) => `${name}.webp | https://images.unsplash.com/photo-${id}?w=1100&q=78&fm=webp`,
  );
entries.unshift(
  "home/dog-companion.webp | https://images.unsplash.com/photo-1517849845537-4d257902454a?w=1000&q=80&fm=webp",
);
fs.writeFileSync("documentation/image-sources.txt", entries.join("\n") + "\n");
console.log(`Kept ${used.size} referenced images. Recorded ${entries.length} stock sources.`);
