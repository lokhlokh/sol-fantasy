import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourceDir = path.join(projectRoot, "legend-packages");
const publicDir = path.join(projectRoot, "public", "legend-packages");
const assetDir = path.join(publicDir, "assets");

fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(assetDir, { recursive: true });

const packageFiles = fs.readdirSync(sourceDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.sollegend(?:\.json)?$/i.test(entry.name))
  .map((entry) => entry.name);

function slugify(value) {
  return String(value).trim().replace(/[^a-zA-Z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "legend-card";
}

function writeImageDataUrl(dataUrl, baseName) {
  const match = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/s.exec(String(dataUrl || ""));
  if (!match) throw new Error("이미지 데이터가 없습니다.");
  const mime = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const extension = mime === "image/jpeg" ? "jpg" : mime.split("/")[1];
  const fileName = `${baseName}.${extension}`;
  fs.writeFileSync(path.join(assetDir, fileName), Buffer.from(match[2], "base64"));
  return `/legend-packages/assets/${fileName}`;
}

const usedSlugs = new Set();
const cards = [];
for (const fileName of packageFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(sourceDir, fileName), "utf8"));
    const card = data?.card;
    if (data?.schema !== "sol-fantasy-legend-card/v1" || !card?.name || !card?.cardImageDataUrl) throw new Error("SOL 레전드 카드 패키지 형식이 아닙니다.");
    const baseSlug = slugify(card.id || `${card.team}-${card.name}`);
    let slug = baseSlug;
    let suffix = 2;
    while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
    usedSlugs.add(slug);
    cards.push({
      id: String(card.id || slug), name: String(card.name), team: String(card.team || ""), position: String(card.position || "선수"),
      style: String(card.style || ""), prompt: String(card.prompt || ""), createdAt: String(data.exportedAt || ""), sourceFile: fileName,
      cardImageUrl: writeImageDataUrl(card.cardImageDataUrl, `${slug}-card`),
      portraitImageUrl: writeImageDataUrl(card.artworkImageDataUrl || card.cardImageDataUrl, `${slug}-artwork`),
    });
  } catch (error) {
    console.warn(`[legend-packages] ${fileName} 건너뜀: ${error instanceof Error ? error.message : String(error)}`);
  }
}

cards.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
fs.writeFileSync(path.join(publicDir, "index.json"), JSON.stringify({ generatedAt: new Date().toISOString(), cards }, null, 2), "utf8");
console.log(`[legend-packages] ${cards.length}개 패키지를 동기화했습니다.`);