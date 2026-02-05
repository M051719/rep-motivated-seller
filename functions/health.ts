import type { PagesFunction } from "@cloudflare/workers-types";
import { jsonHeaders } from "../_utils/headers.api";

export const onRequest: PagesFunction = async () => {
  try {
    const data = {
      message: "RepMotivatedSeller API",
      timestamp: new Date().toISOString(),
      status: "healthy",
    };

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: jsonHeaders,
      },
    );
  }
};
