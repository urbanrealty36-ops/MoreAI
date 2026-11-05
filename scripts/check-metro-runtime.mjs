import { readFileSync } from "node:fs";

const metroPackages = [
  "metro",
  "metro-babel-transformer",
  "metro-cache",
  "metro-cache-key",
  "metro-config",
  "metro-core",
  "metro-file-map",
  "metro-minify-terser",
  "metro-resolver",
  "metro-runtime",
  "metro-source-map",
  "metro-symbolicate",
  "metro-transform-plugins",
  "metro-transform-worker",
];

const lockPath = process.argv[2] ?? "pnpm-lock.yaml";
const lock = readFileSync(lockPath, "utf8");
const errors = [];

if (!lock.startsWith("lockfileVersion: '9.0'")) {
  errors.push("Expected a pnpm v9 lockfile");
}

const overridesStart = lock.indexOf("\noverrides:\n");
const importersStart = lock.indexOf("\nimporters:\n");
const overrides =
  overridesStart >= 0 && importersStart > overridesStart
    ? lock.slice(overridesStart, importersStart)
    : "";

if (!overrides) errors.push("Missing workspace-level pnpm overrides");

for (const name of metroPackages) {
  const matches = Array.from(
    lock.matchAll(new RegExp("^  " + name + "@([0-9.]+):", "gm")),
  );
  const versions = [...new Set(matches.map((match) => match[1]))];

  if (versions.length !== 1 || versions[0] !== "0.83.8") {
    errors.push(
      name +
        " must resolve only to 0.83.8; found " +
        (versions.join(", ") || "none"),
    );
  }

  if (!new RegExp("^  " + name + ": 0\\.83\\.8$", "m").test(overrides)) {
    errors.push("Missing exact 0.83.8 override for " + name);
  }
}

if (/^  image-size@/m.test(lock)) {
  errors.push("image-size re-entered the dependency graph");
}

const expoMetroStart = lock.indexOf("\n  '@expo/metro@54.2.0':");
const snapshotsStart = lock.indexOf("\nsnapshots:\n");
const expoMetroBlock =
  expoMetroStart >= 0 && snapshotsStart >= 0
    ? lock.slice(expoMetroStart, lock.indexOf("\n  ", expoMetroStart + 4))
    : "";

if (!expoMetroBlock) {
  errors.push("Missing @expo/metro@54.2.0 snapshot");
} else {
  for (const name of metroPackages) {
    if (!new RegExp("^      " + name + ": 0\\.83\\.8$", "m").test(expoMetroBlock)) {
      errors.push("@expo/metro@54.2.0 must use " + name + " 0.83.8");
    }
  }
}

if (!/^  '@react-native-masked-view\/masked-view@0\.3\.2':/m.test(lock)) {
  errors.push("Missing Expo SDK 54 compatible masked-view 0.3.2 package");
}
if (
  !/^  apps\/mobile:[\\s\\S]*?^      '@react-native-masked-view\/masked-view':\\n        specifier: 0\.3\.2/m.test(
    lock,
  )
) {
  errors.push("masked-view 0.3.2 must be a direct mobile workspace dependency");
}

if (errors.length) {
  for (const error of errors) console.error("Expo Metro runtime guard: " + error);
  process.exitCode = 1;
} else {
  console.log(
    "Expo Metro runtime guard PASS: 14 aligned 0.83.8 packages, no image-size, and Expo SDK 54 masked-view 0.3.2 is locked for mobile.",
  );
}
