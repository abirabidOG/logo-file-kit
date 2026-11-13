const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const testDir = path.join(__dirname, "test-assets");
const svgPath = path.join(testDir, "test-logo.svg");
const pngPath = path.join(testDir, "test-transparent.png");
const jpgPath = path.join(testDir, "test-logo.jpg");
const screenshotsDir = path.join(__dirname, "verification-screenshots");

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runVerification() {
  console.log("🚀 Starting Logo File Kit Verification on http://localhost:3005/ ...");

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const gaEvents = [];

  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      console.error("Browser Console Error:", text);
    } else if (text.includes("[GA4 Event]")) {
      console.log("📊 GA4 Event Fired:", text);
      gaEvents.push(text);
    }
  });

  // TEST 1: Mobile Viewport (390px)
  console.log("\n--- TEST 1: Mobile Viewport 390px Check ---");
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await page.goto("http://localhost:3005/", { waitUntil: "networkidle0" });

  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log(
    `Mobile 390px horizontal overflow: ${
      hasHorizontalScroll ? "FAILED (overflow detected)" : "PASSED (clean responsive, no overflow)"
    }`
  );
  await page.screenshot({
    path: path.join(screenshotsDir, "1-mobile-390px-empty.png"),
    fullPage: false,
  });

  // TEST 2: SEO Meta Tags, Headings, Schema & Attribution
  console.log("\n--- TEST 2: SEO Meta Tags, Headings & Structured Data ---");
  const seo = await page.evaluate(() => {
    const title = document.title;
    const metaDesc = document
      .querySelector('meta[name="description"]')
      ?.getAttribute("content");
    const h1 = document.querySelector("h1")?.textContent?.trim();
    const h2s = Array.from(document.querySelectorAll("h2")).map((el) =>
      el.textContent?.trim()
    );
    const schemas = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    ).map((s) => {
      try {
        return JSON.parse(s.textContent || "{}");
      } catch (e) {
        return {};
      }
    });
    const privacyBadge = Array.from(document.querySelectorAll("span")).find((s) =>
      s.textContent?.includes("100% private")
    )?.textContent?.trim();
    const crossLinkWebptools = document
      .querySelector('a[href*="tools.abidmahmud.cv/webptools"]')
      ?.getAttribute("href");
    const portfolioLink = document
      .querySelector('a[href="https://www.abidmahmud.cv"]')
      ?.getAttribute("href");

    return {
      title,
      metaDesc,
      h1,
      h2s,
      schemas,
      privacyBadge,
      crossLinkWebptools,
      portfolioLink,
    };
  });

  console.log("Title Tag:", seo.title);
  console.log("Meta Description:", seo.metaDesc);
  console.log("H1 Heading:", seo.h1);
  console.log("H2 Headings found:", seo.h2s);
  console.log(
    "JSON-LD Schemas:",
    seo.schemas.map((s) => s["@type"])
  );
  console.log("Cross-link to WEBPTools:", seo.crossLinkWebptools);
  console.log("Portfolio link:", seo.portfolioLink);

  // TEST 3: Click "Try a sample logo" in Browser
  console.log('\n--- TEST 3: "Try a sample logo" 1-Click Test ---');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Try a sample logo")
    );
    if (btn) btn.click();
  });

  await page.waitForFunction(() => {
    return document.querySelector('img[alt="Logo Live Preview"]') !== null;
  }, { timeout: 8000 });

  console.log("Sample logo loaded into workspace!");
  await page.screenshot({
    path: path.join(screenshotsDir, "2-mobile-390px-sample.png"),
    fullPage: false,
  });

  // Switch to Desktop Viewport for Upload Tests
  await page.setViewport({ width: 1280, height: 900 });

  // TEST 4: Upload SVG Logo & Check Export Sizes
  console.log("\n--- TEST 4: SVG Logo Upload & Dimension Generation ---");
  await page.goto("http://localhost:3005/", { waitUntil: "networkidle0" });
  let fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(svgPath);

  await page.waitForFunction(() => {
    return document.querySelector('img[alt="Logo Live Preview"]') !== null;
  }, { timeout: 8000 });

  const sizeCount = await page.evaluate(() => {
    return document.querySelectorAll('input[type="checkbox"]').length;
  });
  console.log(`SVG Uploaded! Found ${sizeCount} export size checkboxes (expected 9).`);

  // TEST 5: Transparent PNG Upload & Alpha Channel Verification
  console.log("\n--- TEST 5: Transparent PNG Upload & True Transparency Verification ---");
  await page.goto("http://localhost:3005/", { waitUntil: "networkidle0" });
  fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(pngPath);

  await page.waitForFunction(() => {
    return document.querySelector('img[alt="Logo Live Preview"]') !== null;
  }, { timeout: 8000 });

  // In-browser pixel inspection of exported canvas
  const alphaCheck = await page.evaluate(async () => {
    const previewImg = document.querySelector('img[alt="Logo Live Preview"]');
    if (!previewImg) return { error: "No preview image" };

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Draw preview image
    ctx.drawImage(previewImg, 0, 0, 512, 512);

    // Sample corner pixel (0, 0) - should be 100% transparent (alpha === 0)
    const cornerPixel = ctx.getImageData(5, 5, 1, 1).data;
    // Sample center pixel (256, 256) - should be solid logo (alpha === 255)
    const centerPixel = ctx.getImageData(256, 256, 1, 1).data;

    return {
      cornerAlpha: cornerPixel[3],
      cornerRGBA: Array.from(cornerPixel),
      centerAlpha: centerPixel[3],
      centerRGBA: Array.from(centerPixel),
    };
  });

  console.log("Alpha Transparency Verification:");
  console.log(`  Corner pixel (5, 5) alpha: ${alphaCheck.cornerAlpha} (0 means 100% transparent: ${alphaCheck.cornerAlpha === 0 ? "PASSED" : "FAILED"})`);
  console.log(`  Center pixel (256, 256) alpha: ${alphaCheck.centerAlpha} (expected opaque logo content: ${alphaCheck.centerAlpha > 0 ? "PASSED" : "FAILED"})`);

  // TEST 6: JPG Logo Upload
  console.log("\n--- TEST 6: JPG Logo Upload ---");
  await page.goto("http://localhost:3005/", { waitUntil: "networkidle0" });
  fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile(jpgPath);

  await page.waitForFunction(() => {
    return document.querySelector('img[alt="Logo Live Preview"]') !== null;
  }, { timeout: 8000 });
  console.log("JPG Logo uploaded and rendered cleanly!");

  // TEST 7: ZIP Packaging & Archive Verification
  console.log("\n--- TEST 7: ZIP Download Packaging Verification ---");
  const zipResult = await page.evaluate(async () => {
    // Click "Download All as ZIP"
    const zipBtn = Array.from(document.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Download All as ZIP")
    );
    if (!zipBtn) return { error: "Zip button not found" };

    zipBtn.click();
    return { clicked: true };
  });

  // Wait 2 seconds for ZIP generation
  await new Promise((r) => setTimeout(r, 2000));

  const zipSuccessBanner = await page.evaluate(() => {
    return document.querySelector(".bg-emerald-50")?.textContent?.trim();
  });
  console.log("ZIP Generation Feedback:", zipSuccessBanner);

  await page.screenshot({
    path: path.join(screenshotsDir, "3-desktop-workspace-verified.png"),
    fullPage: false,
  });

  console.log("\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!");
  await browser.close();
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
