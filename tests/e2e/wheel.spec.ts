import { test, expect, type Page } from "@playwright/test";

// Speed up the spin animation in tests; the outcome is independent of it.
const fastSpin = async (page: Page) => {
  await page.addStyleTag({ content: ".wheel-rotor{transition-duration:150ms !important}" });
};

const choreList = (page: Page) => page.getByRole("list", { name: "Chores on the wheel" }).getByRole("listitem");

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test("loads with the tool visible and server-rendered content", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1, name: "Chore Wheel" })).toBeVisible();
  await expect(page.getByTestId("spin-button")).toBeVisible();
  await expect(page.getByRole("heading", { name: "How to use the chore wheel" })).toBeVisible();
  await expect(choreList(page)).toHaveCount(12);
});

test("add a chore, spin, get a result, persist across reload", async ({ page }) => {
  await fastSpin(page);
  await page.getByLabel("Add a chore").fill("Clean the litter box");
  await page.getByLabel("Add a chore").press("Enter");
  await expect(choreList(page)).toHaveCount(13);

  await page.getByTestId("spin-button").click();
  await expect(page.getByText("Your chore", { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: "Spin again" }).first()).toBeVisible();
  await expect(page.getByText(/Previous results/)).toBeVisible();

  await page.reload();
  await expect(choreList(page)).toHaveCount(13);
  await expect(choreList(page).getByText("Clean the litter box")).toBeVisible();
});

test("empty wheel cannot spin and shows an empty state", async ({ page }) => {
  await page.getByRole("button", { name: "Clear wheel" }).click();
  await expect(page.getByText("Your wheel is empty")).toBeVisible();
  await expect(page.getByTestId("spin-button")).toBeDisabled();
});

test("load a template", async ({ page }) => {
  await page.getByRole("button", { name: "Use a template" }).click();
  await page.getByRole("button", { name: "Use Kitchen template" }).click();
  await expect(choreList(page).getByText("Clean the stovetop")).toBeVisible();
  await expect(page.getByText(/Loaded “Kitchen”/)).toBeVisible();
});

test("generate person/chore assignments, reroll, copy", async ({ page, context, browserName }) => {
  await page.getByRole("tab", { name: "Assign to people" }).click();
  await page.getByLabel("Add a person").fill("Robin");
  await page.getByLabel("Add a person").press("Enter");
  await expect(page.getByRole("list", { name: "People" }).getByRole("listitem")).toHaveCount(5);

  await page.getByRole("button", { name: "Assign chores" }).click();
  const table = page.getByRole("table", { name: "Chore assignments" });
  await expect(table).toBeVisible();
  // 12 chores across 5 people = 12 rows
  await expect(table.locator("tbody tr")).toHaveCount(12);
  await page
    .getByRole("button", { name: /^Reroll / })
    .first()
    .click();
  await expect(table.locator("tbody tr")).toHaveCount(12);

  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.getByRole("button", { name: "Copy assignments" }).click();
    await expect(page.getByText(/copied|Couldn/)).toBeVisible();
  }
});

test("share URL round-trip", async ({ page }) => {
  await page.getByLabel("Add a chore").fill("Unique shared chore ✨");
  await page.getByLabel("Add a chore").press("Enter");
  await page.getByRole("tab", { name: "Save & share" }).click();
  await page.getByRole("button", { name: "Copy link" }).click();
  const url = await page.getByLabel("Share link").inputValue();
  expect(url).toContain("#w=");

  await page.evaluate(() => localStorage.clear());
  await page.goto(url);
  await expect(page.getByText("Loaded a shared wheel.")).toBeVisible();
  await page.getByRole("tab", { name: "Chores" }).click();
  await expect(choreList(page).getByText("Unique shared chore ✨")).toBeVisible();
  await expect.poll(() => page.evaluate(() => location.hash)).toBe("");
});

test("malformed share URL does not crash", async ({ page }) => {
  await page.goto("/#w=!!!not-valid!!!");
  await expect(page.getByTestId("spin-button")).toBeVisible();
  await expect(page.getByText(/couldn't be read/)).toBeVisible();
});

test("save a named wheel and reload it", async ({ page }) => {
  await page.getByRole("tab", { name: "Save & share" }).click();
  await page.getByLabel("Name for the saved wheel").fill("Test wheel");
  await page.getByRole("button", { name: "Save wheel" }).click();
  await expect(page.getByRole("list", { name: "Saved wheels" }).getByText("Test wheel")).toBeVisible();
  await page.reload();
  await page.getByRole("tab", { name: "Save & share" }).click();
  await expect(page.getByRole("list", { name: "Saved wheels" }).getByText("Test wheel")).toBeVisible();
});

test("chore list → add selected chores to wheel", async ({ page }) => {
  await page.goto("/chore-list");
  await page
    .getByRole("button", { name: /Select all/ })
    .first()
    .click();
  await page.getByRole("button", { name: /Add \d+ chores to my wheel/ }).click();
  await page.waitForURL(/\/$/);
  await expect(page.getByText(/Added \d+ chores to your wheel/)).toBeVisible();
});

test("kids page preloads kids template", async ({ page }) => {
  await page.goto("/chore-wheel-for-kids");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chore Wheel for Kids");
  await expect(choreList(page).getByText("Load the dishwasher", { exact: true })).toBeVisible();
});

test("SEO basics: title, canonical, sitemap, robots, redirect, 404, ads.txt", async ({ page, request }) => {
  await expect(page).toHaveTitle(/Chore Wheel/);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toMatch(/^https?:\/\/[^/]+\/?$/);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const body = await sitemap.text();
  expect(body).toContain("/chore-list");
  expect(body).not.toContain("#w=");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("sitemap.xml");
  const redirect = await request.get("/chore-wheel", { maxRedirects: 0 });
  expect([301, 308]).toContain(redirect.status());
  const nf = await request.get("/does-not-exist");
  expect(nf.status()).toBe(404);
  const ads = await request.get("/ads.txt");
  expect(await ads.text()).toContain("placeholder");
});

test("no horizontal overflow at small widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
});
