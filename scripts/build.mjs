import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = resolve(projectDir, "dist");
const html = await readFile(resolve(projectDir, "index.html"), "utf8");
const ogBase64 = (await readFile(resolve(projectDir, "public/og.png"))).toString("base64");

const worker = `
const HTML = ${JSON.stringify(html)};
const OG_BASE64 = ${JSON.stringify(ogBase64)};
let ogBytes;

function responseHeaders(contentType, cacheControl) {
  return {
    "content-type": contentType,
    "cache-control": cacheControl,
    "referrer-policy": "strict-origin-when-cross-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "SAMEORIGIN",
    "permissions-policy": "camera=(), microphone=(), geolocation=()"
  };
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML, {
        headers: responseHeaders("text/html; charset=utf-8", "public, max-age=0, must-revalidate")
      });
    }

    if (url.pathname === "/public/og.png" || url.pathname === "/og.png") {
      if (!ogBytes) ogBytes = Uint8Array.from(atob(OG_BASE64), character => character.charCodeAt(0));
      return new Response(ogBytes, {
        headers: responseHeaders("image/png", "public, max-age=31536000, immutable")
      });
    }

    return new Response("Not found", {
      status: 404,
      headers: responseHeaders("text/plain; charset=utf-8", "public, max-age=60")
    });
  }
};
`;

await rm(distDir, { recursive: true, force: true });
await mkdir(resolve(distDir, "server"), { recursive: true });
await writeFile(resolve(distDir, "server/index.js"), worker.trimStart());

console.log("Built static portfolio worker.");
