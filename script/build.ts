import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildAll() {
  // чистим dist
  await rm("dist", { recursive: true, force: true });

  // ---------- CLIENT ----------
  console.log("building client...");
  await viteBuild();

  // ---------- WORKER ----------
  console.log("building worker...");

  await esbuild({
    entryPoints: ["src/worker.ts"],
    bundle: true,
    format: "esm",
    outfile: "dist/worker.js",

    // КРИТИЧНО для Cloudflare Workers
    platform: "neutral",
    target: "es2022",

    // Workers-совместимые defines
    define: {
      "process.env.NODE_ENV": '"production"',
    },

    minify: true,
    sourcemap: false,
    logLevel: "info",
  });

  console.log("build completed");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
