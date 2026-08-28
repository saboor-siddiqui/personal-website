import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(projectDir, "dist");
const clientDir = resolve(distDir, "client");

await rm(distDir, { recursive: true, force: true });

await build({
  root: projectDir,
  base: "/",
  build: {
    outDir: clientDir,
    emptyOutDir: false,
    target: "es2020",
    chunkSizeWarningLimit: 560,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(moduleId) {
          if (moduleId.includes("/node_modules/three/")) return "three";
          if (moduleId.includes("/node_modules/gsap/")) return "motion";
          return undefined;
        }
      }
    }
  }
});

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2"
};

async function collectFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute, nextRelative));
    else files.push({ absolute, relative: nextRelative });
  }

  return files;
}

const clientFiles = await collectFiles(clientDir);
const assets = {};

for (const file of clientFiles) {
  const extension = file.relative.slice(file.relative.lastIndexOf(".")).toLowerCase();
  const contentType = mimeTypes[extension] || "application/octet-stream";
  const isText = /^(text\/|application\/(javascript|json))/.test(contentType) || extension === ".svg";
  const buffer = await readFile(file.absolute);
  assets[`/${file.relative}`] = {
    body: isText ? buffer.toString("utf8") : buffer.toString("base64"),
    encoding: isText ? "text" : "base64",
    contentType
  };
}

const worker = `
const ASSETS = ${JSON.stringify(assets)};
const BYTE_CACHE = new Map();

function responseHeaders(pathname, contentType) {
  const immutable = pathname.startsWith("/assets/");
  return {
    "content-type": contentType,
    "cache-control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "permissions-policy": "camera=(), microphone=(), geolocation=()"
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = ASSETS[pathname];

    if (!asset) return new Response("Not found", {
      status: 404,
      headers: responseHeaders(pathname, "text/plain; charset=utf-8")
    });

    let body = asset.body;
    if (asset.encoding === "base64") {
      if (!BYTE_CACHE.has(pathname)) BYTE_CACHE.set(pathname, Uint8Array.from(atob(asset.body), character => character.charCodeAt(0)));
      body = BYTE_CACHE.get(pathname);
    }

    return new Response(request.method === "HEAD" ? null : body, {
      headers: responseHeaders(pathname, asset.contentType)
    });
  }
};
`;

await mkdir(resolve(distDir, "server"), { recursive: true });
await writeFile(resolve(distDir, "server/index.js"), worker.trimStart());

console.log(`Built modular portfolio: ${clientFiles.length} static assets and Sites worker.`);
