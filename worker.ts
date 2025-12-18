export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext) {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
