export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { "content-type": "application/json" } }
      );
    }

    return env.ASSETS.fetch(request);
  }
};
