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
    format: "cjs",
    platform: "node",
    target: "node22",
    outfile: "dist/index.cjs",
    
    // КРИТИЧНО: исключаем нодовские и внешние модули
    external: [
      // Node.js built-ins
      "fs", "path", "http", "https", "url", "stream", "crypto", "util",
      "zlib", "events", "buffer", "os", "net", "tls", "child_process",
      "cluster", "dgram", "dns", "module", "querystring", "readline",
      "repl", "string_decoder", "timers", "tty", "vm", "worker_threads",
      
      // Внешние зависимости
      "express", 
      "@neondatabase/serverless",
      "connect-pg-simple",
      "express-session",
      "memorystore",
      "passport",
      "passport-local",
      "ws",
      "drizzle-orm",
      "drizzle-zod",
      "zod",
      "zod-validation-error"
    ],
    
    minify: true,
    sourcemap: false,
    logLevel: "info",
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
