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
    
    // КРИТИЧНО: исключаем ВСЕ ненужные модули
    external: [
      // Все зависимости кроме тех, что нужны серверу
      "vite",
      "@vitejs/plugin-react",
      "@replit/vite-plugin-cartographer",
      "@replit/vite-plugin-dev-banner",
      "@replit/vite-plugin-runtime-error-modal",
      "@tailwindcss/typography",
      "@tailwindcss/vite",
      "autoprefixer",
      "postcss",
      "tailwindcss",
      "tailwindcss-animate",
      "tw-animate-css",
      "esbuild",
      
      // React и клиентские зависимости
      "react",
      "react-dom",
      "@hookform/resolvers",
      "@radix-ui/*",
      "@tanstack/react-query",
      "class-variance-authority",
      "cmdk",
      "embla-carousel-react",
      "framer-motion",
      "input-otp",
      "lucide-react",
      "next-themes",
      "react-day-picker",
      "react-hook-form",
      "react-icons",
      "react-resizable-panels",
      "recharts",
      "tailwind-merge",
      "vaul",
      "wouter",
      
      // Node.js built-ins (автоматически внешние, но лучше явно)
      "fs", "path", "http", "https", "url", "stream", "crypto", "util",
      "zlib", "events", "buffer", "os", "net", "tls", "child_process",
      "cluster", "dgram", "dns", "module", "querystring", "readline",
      "repl", "string_decoder", "timers", "tty", "vm", "worker_threads",
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
