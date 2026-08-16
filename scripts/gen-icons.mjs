// Renders src/app/icon.svg into the PNG/ICO favicons Next.js serves automatically.
import { chromium } from "@playwright/test";
import fs from "node:fs";
const svg = fs.readFileSync("src/app/icon.svg", "utf8");
const b = await chromium.launch();
const render = async (size, bg = "transparent") => {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  await p.setContent(`<html><body style="margin:0;background:${bg}">${svg.replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`)}</body></html>`);
  const buf = await p.screenshot({ omitBackground: bg === "transparent", clip: { x: 0, y: 0, width: size, height: size } });
  await p.close();
  return buf;
};
const png512 = await render(512);
const png192 = await render(192);
const png180 = await render(180, "#fbfaf7"); // iOS needs an opaque touch icon
const png48 = await render(48);
const png32 = await render(32);
fs.writeFileSync("src/app/icon.png", png512);        // /icon.png (Next adds <link rel=icon>)
fs.writeFileSync("src/app/apple-icon.png", png180);  // /apple-icon.png (apple-touch-icon)
fs.writeFileSync("public/icon-192.png", png192);
fs.writeFileSync("public/icon-512.png", png512);
// favicon.ico containing 48px + 32px PNG entries (PNG-in-ICO is supported by all modern browsers and Google).
const entries = [png48, png32];
const sizes = [48, 32];
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(entries.length, 4);
let offset = 6 + 16 * entries.length; const dirs = [];
entries.forEach((buf, i) => { const d = Buffer.alloc(16); d.writeUInt8(sizes[i], 0); d.writeUInt8(sizes[i], 1); d.writeUInt8(0, 2); d.writeUInt8(0, 3); d.writeUInt16LE(1, 4); d.writeUInt16LE(32, 6); d.writeUInt32LE(buf.length, 8); d.writeUInt32LE(offset, 12); offset += buf.length; dirs.push(d); });
fs.writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...dirs, ...entries]));
await b.close();
console.log("icons written");
