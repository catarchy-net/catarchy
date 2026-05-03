interface Env {
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      const targetPath = url.pathname.replace("/api", "");
      const targetUrl = `https://api.catarchy.net${targetPath}${url.search}`;
      return fetch(new Request(targetUrl, request));
    }

    const response = await env.ASSETS.fetch(request);

    if (
      url.pathname === "/sw.js" ||
      url.pathname === "/registerSW.js" ||
      url.pathname === "/firebase-messaging-sw.js"
    ) {
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
      return new Response(response.body, { ...response, headers });
    }

    return response;
  },
};
