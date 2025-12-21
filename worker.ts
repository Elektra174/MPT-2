export default {
  async fetch(request: Request, env: any) {
    try {
      const url = new URL(request.url);

      // Тестовый API
      if (url.pathname === "/api/health") {
        return new Response(
          JSON.stringify({ status: "ok" }),
          { headers: { "content-type": "application/json" } }
        );
      }

      // Раздача фронта
      const response = await env.ASSETS.fetch(request);

      // Кеширование статических файлов (опционально)
      const cache = caches.default;
      const cacheResponse = await cache.match(request);
      if (cacheResponse) {
        return cacheResponse;
      }

      // Кешируем и возвращаем ответ
      await cache.put(request, response.clone());
      return response;
    } catch (error) {
      return new Response("Error processing request", { status: 500 });
    }
  }
};
