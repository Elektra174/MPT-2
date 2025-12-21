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
    
    // КРИТИЧНО: исключаем vite и клиентские зависимости
    external: [
      // Vite и его плагины
      "vite",
      "@vitejs/plugin-react",
      "@replit/vite-plugin-cartographer",
      "@replit/vite-plugin-dev-banner",
      "@replit/vite-plugin-runtime-error-modal",
      "vite.config.ts",  // Явно исключаем конфиг
      
      // Все остальные внешние зависимости
      "express",
      "http",
      "path",
      "fs",
      "url",
      // ... добавьте другие по мере необходимости
    ],
    
    // Игнорируем импорты в условиях
    bundle: true,
    minify: true,
    sourcemap: false,
    logLevel: "info",
    
    // Устанавливаем NODE_ENV=production чтобы условие if (process.env.NODE_ENV === "production") было true
    define: {
      "process.env.NODE_ENV": '"production"',
    },
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
