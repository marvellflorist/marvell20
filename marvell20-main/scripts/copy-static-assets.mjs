import { existsSync } from "node:fs";
import { copyFile, cp, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const dist = join(projectRoot, "dist");

const files = [
  "app.js",
  "styles.css",
  "manifest.json",
  "service-worker.js",
  "Inter-VariableFont_opsz,wght.ttf",
  "Inter-Italic-VariableFont_opsz,wght.ttf",
  "Relationship of mélodrame.ttf",
  "background.PNG",
  "burgundy.png",
  "singleblack.png",
  "singlegarden.webp",
  "stripburgundy.jpeg",
  "stripblack.png",
  "stripgarden.png",
  "envelope.webp",
  "whattoexpect.webp",
  "lily.mp4",
  "JOHN_MICHEL_CELLO-SAINT_SAENS_CARNIVAL_OF_ANIMALS_THE_SWAN.mp3",
  "JOHN_MICHEL_CELLO-SAINT_SAENS_CARNIVAL_OF_ANIMALS_THE_SWAN.ogg",
  "marvell florist logo.svg",
  "marvell-florist-logo-outline.svg",
];

await mkdir(dist, { recursive: true });
await mkdir(join(dist, "icons"), { recursive: true });
await mkdir(join(dist, "vendor"), { recursive: true });

async function copyIfExists(source, destination, label = source) {
  if (!existsSync(source)) {
    console.warn(`[copy-static-assets] Skipping missing optional asset: ${label}`);
    return;
  }

  await copyFile(source, destination);
}

async function copyDirIfExists(source, destination, label = source) {
  if (!existsSync(source)) {
    console.warn(`[copy-static-assets] Skipping missing optional directory: ${label}`);
    return;
  }

  await cp(source, destination, { recursive: true });
}

await Promise.all(files.map((file) => {
  return copyIfExists(join(projectRoot, file), join(dist, file), file);
}));
await copyDirIfExists(join(projectRoot, "icons"), join(dist, "icons"), "icons");
await copyDirIfExists(join(projectRoot, "vendor"), join(dist, "vendor"), "vendor");
