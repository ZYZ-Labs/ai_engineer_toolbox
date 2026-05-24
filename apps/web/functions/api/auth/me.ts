import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../types";
import { getCurrentUser, jsonResponse } from "../_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const user = await getCurrentUser(env.DB, request);
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  return jsonResponse({
    user: {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin,
    },
  });
};
