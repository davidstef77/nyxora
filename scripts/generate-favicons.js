const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const pngToIco = require('png-to-ico');

async function ensureDir(dir) {
  try { await fs.promises.mkdir(dir, { recursive: true }); } catch (e) { }
}

async function generate() {
  const projectRoot = path.resolve(__dirname, '..');
  const srcImage = path.resolve(projectRoot, 'src', 'components', 'images', 'N.png');
  const outDir = path.resolve(projectRoot, 'public');
  const tmpDir = path.resolve(projectRoot, '.tmp_favicons');

  if (!fs.existsSync(srcImage)) {
    console.error('Source image not found:', srcImage);
    process.exit(1);
  }

  await ensureDir(outDir);
  await ensureDir(tmpDir);

  const appleOut = path.join(outDir, 'apple-touch-icon.png');
  console.log('Generating', appleOut);
  await sharp(srcImage).resize(180, 180, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } }).png().toFile(appleOut);

  const sizes = [16, 32, 48, 64];
  const pngFiles = [];
  for (const s of sizes) {
    const tmpPath = path.join(tmpDir, `favicon-${s}.png`);
    await sharp(srcImage).resize(s, s, { fit: 'contain', background: { r:0, g:0, b:0, alpha:0 } }).png().toFile(tmpPath);
    pngFiles.push(tmpPath);
  }

  const icoOut = path.join(outDir, 'favicon.ico');
  console.log('Generating', icoOut);
  
  // Read PNG files as buffers
  const pngBuffers = [];
  for (const pngFile of pngFiles) {
    const buffer = await fs.promises.readFile(pngFile);
    pngBuffers.push(buffer);
  }
  
  const buf = await pngToIco(pngBuffers);
  await fs.promises.writeFile(icoOut, buf);

  // cleanup tmp
  try {
    for (const f of pngFiles) await fs.promises.unlink(f);
    await fs.promises.rmdir(tmpDir);
  } catch (e) {
    // ignore
  }

  console.log('Favicon generation complete. Files written to public/:', ['favicon.ico', 'apple-touch-icon.png']);
}

generate().catch((err) => {
  console.error('Favicon generation failed:', err);
  process.exit(1);
});
