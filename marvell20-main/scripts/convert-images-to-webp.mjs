import { stat } from "node:fs/promises";
import sharp from "sharp";

const images = [
  { input: "background.PNG", output: "background.webp", quality: 82 },
  { input: "pattern.PNG", output: "pattern.webp", quality: 82 },
  { input: "pattern2.PNG", output: "pattern2.webp", quality: 82 },
  { input: "envelope.jpeg", output: "envelope.webp", quality: 84 },
  { input: "footer.jpeg", output: "footer.webp", quality: 84 },
  { input: "whattoexpect.jpeg", output: "whattoexpect.webp", quality: 84 },
  { input: "qris.png", output: "qris.webp", lossless: true },
  { input: "qris-code.png", output: "qris-code.webp", lossless: true },
  { input: "icons/apple-touch-icon.png", output: "icons/apple-touch-icon.webp", lossless: true },
];

for (const image of images) {
  const pipeline = sharp(image.input);
  if (image.lossless) {
    await pipeline.webp({ lossless: true, effort: 6 }).toFile(image.output);
  } else {
    await pipeline.webp({ quality: image.quality, effort: 6 }).toFile(image.output);
  }

  const before = await stat(image.input);
  const after = await stat(image.output);
  const saved = Math.round((1 - after.size / before.size) * 100);
  console.log(`${image.input} -> ${image.output} (${before.size} -> ${after.size}, ${saved}% saved)`);
}
