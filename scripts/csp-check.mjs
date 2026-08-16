// Loads key pages with NEXT_PUBLIC_FATHOM_SITE_ID-style script present and reports any CSP violations in the console.
import { chromium } from "@playwright/test";
const base = process.argv[2] || "http://localhost:3111";
const b = await chromium.launch(); const p = await b.newPage();
const violations = [];
p.on("console", (m) => { if (/Content Security Policy|CSP/i.test(m.text())) violations.push(m.text()); });
for (const path of ["/", "/chore-list", "/weekly-chore-chart", "/chore-wheel-for-kids"]) {
  await p.goto(base + path, { waitUntil: "networkidle" });
  if (path === "/") { await p.addStyleTag({ content: ".wheel-rotor{transition-duration:100ms !important}" }); await p.getByTestId("spin-button").click(); await p.waitForTimeout(600); await p.getByRole("tab", { name: "Assign to people" }).click(); await p.getByRole("button", { name: "Assign chores" }).click(); await p.getByRole("button", { name: "Download CSV" }).click().catch(()=>{}); await p.getByRole("tab", { name: "Save & share" }).click(); await p.getByRole("button", { name: "Copy link" }).click(); }
}
await b.close();
console.log(violations.length ? violations : "no CSP violations");
