/**
 * Capture pitch screenshots for competition submission.
 * Run: node scripts/capture-pitch-screenshots.mjs
 * Requires: site running on http://localhost:3000
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium, devices } from "playwright";

const BASE = "http://localhost:3000";
const OUT = path.resolve(import.meta.dirname, "..", "pitch-screenshots");

async function waitForFrames(page) {
  await page.waitForFunction(
    () => !document.querySelector('[role="status"][aria-label*="Loading"]')?.offsetParent,
    { timeout: 120000 },
  ).catch(() => {});
  await page.waitForTimeout(1500);
}

async function scrollTo(page, y) {
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  await page.waitForTimeout(900);
}

async function captureDesktop(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  await waitForFrames(page);

  await page.screenshot({
    path: path.join(OUT, "01-hero-intro-desktop.png"),
    fullPage: false,
  });

  await scrollTo(page, 1200);
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, "02-sand-transformation-desktop.png"),
    fullPage: false,
  });

  await scrollTo(page, 2800);
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, "03-brick-forging-desktop.png"),
    fullPage: false,
  });

  await scrollTo(page, 4800);
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, "04-brick-reveal-desktop.png"),
    fullPage: false,
  });

  await scrollTo(page, 6200);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUT, "05-landing-hero-desktop.png"),
    fullPage: false,
  });

  const gameSection = page.locator("#durability-lab");
  await gameSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, "06-brik-strike-desktop.png"),
    fullPage: false,
  });

  const showcase = page.locator("#showcase");
  await showcase.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUT, "07-product-showcase-desktop.png"),
    fullPage: false,
  });

  await scrollTo(page, 0);
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(OUT, "08-full-page-desktop.png"),
    fullPage: true,
  });

  await context.close();
}

async function captureMobile(browser) {
  const iphone = devices["iPhone 14 Pro Max"];
  const context = await browser.newContext({
    ...iphone,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 120000 });
  await waitForFrames(page);

  await page.screenshot({
    path: path.join(OUT, "09-hero-intro-mobile.png"),
    fullPage: false,
  });

  await scrollTo(page, 1400);
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, "10-transformation-mobile.png"),
    fullPage: false,
  });

  const gameSection = page.locator("#durability-lab");
  await gameSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.screenshot({
    path: path.join(OUT, "11-brik-strike-mobile.png"),
    fullPage: false,
  });

  await context.close();
}

await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  await captureDesktop(browser);
  await captureMobile(browser);
  console.log(`\nScreenshots saved to:\n${OUT}\n`);
} finally {
  await browser.close();
}
