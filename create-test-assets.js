const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const dir = path.join(__dirname, "test-assets");

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 1. Write test-logo.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F8C7F"/>
      <stop offset="100%" stop-color="#0E5850"/>
    </linearGradient>
  </defs>
  <rect x="50" y="50" width="400" height="400" rx="80" fill="none" stroke="url(#grad)" stroke-width="24"/>
  <polygon points="250,140 350,320 150,320" fill="url(#grad)" />
  <circle cx="250" cy="250" r="40" fill="#FFFFFF" />
  <text x="250" y="410" font-family="sans-serif" font-size="28" font-weight="900" fill="#0B0B0D" text-anchor="middle" letter-spacing="4">VERIFIED</text>
</svg>`;
fs.writeFileSync(path.join(dir, "test-logo.svg"), svgContent);
console.log("Created test-logo.svg");

async function generateRasterAssets() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  // 2. test-transparent.png (with real alpha channel)
  await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .emblem {
            width: 450px;
            height: 450px;
            background: linear-gradient(135deg, #1F8C7F, #0B0B0D);
            border-radius: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            font-family: sans-serif;
            font-weight: 800;
            font-size: 36px;
            box-shadow: 0 25px 50px rgba(0,0,0,0.25);
          }
          .sub { font-size: 14px; opacity: 0.8; letter-spacing: 2px; margin-top: 8px; }
        </style>
      </head>
      <body>
        <div class="emblem">
          <div>TEST LOGO</div>
          <div class="sub">TRANSPARENT PNG</div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({
    path: path.join(dir, "test-transparent.png"),
    omitBackground: true,
    type: "png",
  });
  console.log("Created test-transparent.png (verified alpha transparency)");

  // 3. test-logo.jpg (opaque image with white background)
  await page.setViewport({ width: 800, height: 800, deviceScaleFactor: 1 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            background: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .logo-box {
            width: 500px;
            height: 500px;
            background: #F4F2EC;
            border: 4px solid #1F8C7F;
            border-radius: 32px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #0B0B0D;
            font-family: sans-serif;
            font-weight: 900;
            font-size: 40px;
          }
        </style>
      </head>
      <body>
        <div class="logo-box">
          <div style="color: #1F8C7F;">JPG LOGO</div>
          <div style="font-size: 16px; color: #4F4E55; margin-top: 12px;">SOLID WHITE BACKGROUND</div>
        </div>
      </body>
    </html>
  `);

  await page.screenshot({
    path: path.join(dir, "test-logo.jpg"),
    type: "jpeg",
    quality: 95,
  });
  console.log("Created test-logo.jpg (opaque JPEG)");

  await browser.close();
}

generateRasterAssets().catch((err) => {
  console.error("Failed to generate raster test assets:", err);
  process.exit(1);
});
