import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../types";
import { getSessionCookie, clearSessionCookie, jsonResponse } from "../_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const token = getSessionCookie(request);
  if (token) {
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(token).run();
  }

  return jsonResponse({ success: true }, 200, {
    "Set-Cookie": clearSessionCookie(env.COOKIE_DOMAIN),
  });
};
