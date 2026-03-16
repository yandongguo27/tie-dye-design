import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convert(name) {
  const svgPath = path.join(__dirname, '..', 'public', 'images', `${name}.svg`);
  const outPath = path.join(__dirname, '..', 'public', 'images', `${name}.png`);
  if (!fs.existsSync(svgPath)) {
    console.error('SVG not found:', svgPath);
    process.exit(1);
  }
  const svgBuffer = fs.readFileSync(svgPath);
  await sharp(svgBuffer).png({ quality: 90 }).toFile(outPath);
  console.log('Created', outPath);
}

async function main() {
  await convert('architecture');
  await convert('deploy_flow');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
