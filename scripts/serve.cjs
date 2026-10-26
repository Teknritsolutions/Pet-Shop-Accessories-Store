const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".png": "image/png",
  ".xml": "application/xml",
  ".txt": "text/plain",
};
const server = http.createServer((req, res) => {
  let requested;
  try {
    requested = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400);
    res.end();
    return;
  }
  const file = path.resolve(root, "." + requested + (requested.endsWith("/") ? "index.html" : ""));
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end(fs.readFileSync(path.join(root, "pages/404.html")));
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
    });
    res.end(data);
  });
});
server.listen(Number(process.env.PORT) || 4173, "127.0.0.1", () =>
  console.log("Morrow & Paw: http://127.0.0.1:4173"),
);
