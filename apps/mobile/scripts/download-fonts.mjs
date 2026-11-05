import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const fontDirectory = path.resolve(scriptDirectory, "../assets/fonts");
const upstreamRevision = "fbe81817505e8aeadc53cc7a38a2b76fb57c333e";

const fonts = [
  {
    fileName: "PlusJakartaSans.ttf",
    url: `https://raw.githubusercontent.com/google/fonts/${upstreamRevision}/ofl/plusjakartasans/PlusJakartaSans%5Bwght%5D.ttf`,
    expectedBytes: 176288,
    expectedGitBlobSha: "0cb13a998ed525ba226d911b10d6c4c4f923a961",
  },
  {
    fileName: "JetBrainsMono.ttf",
    url: `https://raw.githubusercontent.com/google/fonts/${upstreamRevision}/ofl/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf`,
    expectedBytes: 187208,
    expectedGitBlobSha: "aa310be8b717fe3774f9444dd89d5f4101cc6d10",
  },
];

function gitBlobSha(buffer) {
  return createHash("sha1")
    .update(`blob ${buffer.length}\0`)
    .update(buffer)
    .digest("hex");
}

function verifyFont(font, buffer) {
  const actualSha = gitBlobSha(buffer);
  if (buffer.length !== font.expectedBytes || actualSha !== font.expectedGitBlobSha) {
    throw new Error(
      `Font integrity check failed for ${font.fileName}: ${buffer.length} bytes / ${actualSha}`
    );
  }
}

async function main() {
  mkdirSync(fontDirectory, { recursive: true });

  for (const font of fonts) {
    const destination = path.join(fontDirectory, font.fileName);
    if (existsSync(destination)) {
      const existing = readFileSync(destination);
      try {
        verifyFont(font, existing);
        console.log(`Verified existing ${font.fileName}`);
        continue;
      } catch {
        // Replace stale or corrupted generated asset with the pinned source.
      }
    }

    const response = await fetch(font.url, {
      headers: { "User-Agent": "MoreAI-reproducible-font-build" },
    });
    if (!response.ok) {
      throw new Error(`Unable to download ${font.fileName}: HTTP ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    verifyFont(font, buffer);
    writeFileSync(destination, buffer);
    console.log(`Downloaded and verified ${font.fileName}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
