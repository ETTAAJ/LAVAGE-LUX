import sharp from "sharp";
import { statSync } from "fs";

const tasks = [
  ["public/img/logo.jpg", "public/img/hero-lcp.webp", 1280, 82],
  ["public/img/dirtycar.png", "public/img/dirtycar.webp", 1200, 78],
  ["public/img/cleancar.png", "public/img/cleancar.webp", 1200, 78]
];

for (const [input, output, width, quality] of tasks) {
  await sharp(input)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(output);
  console.log(output, statSync(output).size);
}
