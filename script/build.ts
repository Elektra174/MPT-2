import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm } from "fs/promises";

async function buildAll() {
  // чистим dist
  await rm("dist", { recursive: true, force: true });

  // ---------- SERVER ----------
  console.log("building server...");
  await esbuild({
    entryPoints: ["server/index.ts"],
    bundle: true,
    format: "cjs",  // CommonJS для Node.js
    platform: "node",
    target: "node22",
    outfile: "dist/index.cjs",
    external: ["express", "@neondatabase/serverless"], // внешние зависимости
    minify: true,
  });

  // ---------- CLIENT ----------
  console.log("building client...");
  await viteBuild();

  // ---------- WORKER ----------
  console.log("building worker...");
  await esbuild({
    entryPoints: ["worker.ts"],
    bundle: true,
    format: "esm",
    outfile: "dist/worker.js",
    platform: "neutral",
    target: "es2022",
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
