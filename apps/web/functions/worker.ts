import type { EventContext, PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "./types";
import { onRequestPost as login } from "./api/auth/login";
import { onRequestPost as logout } from "./api/auth/logout";
import { onRequestGet as me } from "./api/auth/me";
import { onRequestGet as stats } from "./api/stats";
import { onRequestPost as visit } from "./api/visit";
import { jsonResponse } from "./api/_utils";

type Handler = PagesFunction<Env>;

function withCors(request: Request, response: Response): Response {
  const url = new URL(request.url);
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", url.origin);
  headers.set("Access-Control-Allow-Credentials", "true");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function preflight(request: Request): Response {
  const url = new URL(request.url);
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": url.origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400",
    },
  });
}

async function invoke(
  handler: Handler,
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const context = {
    request,
    env,
    params: {},
    data: {},
    functionPath: new URL(request.url).pathname,
    waitUntil: ctx.waitUntil.bind(ctx),
    passThroughOnException: ctx.passThroughOnException.bind(ctx),
    next: () => env.ASSETS.fetch(request),
  } as unknown as EventContext<Env, string, Record<string, unknown>>;

  return handler(context);
}

function routeApi(request: Request): Handler | null {
  const url = new URL(request.url);
  const key = `${request.method} ${url.pathname}`;

  switch (key) {
    case "POST /api/visit":
      return visit;
    case "GET /api/stats":
      return stats;
    case "POST /api/auth/login":
      return login;
    case "POST /api/auth/logout":
      return logout;
    case "GET /api/auth/me":
      return me;
    default:
      return null;
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      if (request.method === "OPTIONS") {
        return preflight(request);
      }

      const handler = routeApi(request);
      if (!handler) {
        return withCors(request, jsonResponse({ error: "Not found" }, 404));
      }

      const response = await invoke(handler, request, env, ctx);
      return withCors(request, response);
    }

    return env.ASSETS.fetch(request);
  },
};
