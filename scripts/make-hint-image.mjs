import sharp from "sharp";

const [, , inputArg, outputArg] = process.argv;

const input = inputArg ?? "public/img/UcQuiz/성인봉.webp";
const output = outputArg ?? "public/img/UcQuiz/hint-seonginbong.webp";

const meta = await sharp(input).metadata();
const w = meta.width ?? 1024;
const h = meta.height ?? 768;

// Crop top portion where the "성인봉(해발 986.5m)" text sits.
const cropH = Math.min(h, Math.max(180, Math.round(h * 0.42)));

await sharp(input)
  .extract({ left: 0, top: 0, width: w, height: cropH })
  .webp({ quality: 85 })
  .toFile(output);

console.log(`Wrote ${output} (${w}x${cropH})`);

