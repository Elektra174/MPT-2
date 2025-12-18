export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);

    // тестовый API
    if (url.pathname === "/api/health") {
      return new Response(
        JSON.stringify({ status: "ok" }),
        { headers: { "content-type": "application/json" } }
      );
    }

    // раздача фронта
    return env.ASSETS.fetch(request);
  }
};
