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
  "background.webp",
  "pattern.webp",
  "pattern2.webp",
  "envelope.webp",
  "whattoexpect.webp",
  "qris-code.webp",
  "lily.mp4",
  "JOHN_MICHEL_CELLO-SAINT_SAENS_CARNIVAL_OF_ANIMALS_THE_SWAN.mp3",
  "JOHN_MICHEL_CELLO-SAINT_SAENS_CARNIVAL_OF_ANIMALS_THE_SWAN.ogg",
  "marvell florist logo.svg",
  "marvell-florist-logo-outline.svg",
];

await mkdir(dist, { recursive: true });
await mkdir(join(dist, "icons"), { recursive: true });

await Promise.all(files.map((file) => copyFile(join(projectRoot, file), join(dist, file))));
await cp(join(projectRoot, "icons"), join(dist, "icons"), { recursive: true });
