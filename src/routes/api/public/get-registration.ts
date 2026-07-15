import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type RegistrationResponse = {
  id: string;
  category: {
    id: string;
    name: string;
  };
  athlete: Record<string, unknown>;
  createdAt: string;
};

function buildCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const Route = createFileRoute("/api/public/get-registration")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const inscricaoId = url.searchParams.get("inscricaoId");

          if (!inscricaoId) {
            return new Response(JSON.stringify({ error: "inscricaoId é obrigatório" }), {
              status: 400,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            });
          }

          const supabaseAdmin = createSupabaseAdminClient();
          const { data, error } = await supabaseAdmin
            .from("inscricoes")
            .select("id, category_id, category_name, athlete_snapshot, created_at")
            .eq("id", inscricaoId)
            .single();

          if (error || !data) {
            return new Response(JSON.stringify({ error: "Inscrição não encontrada" }), {
              status: 404,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            });
          }

          const payload: RegistrationResponse = {
            id: data.id,
            category: {
              id: data.category_id,
              name: data.category_name,
            },
            athlete: (data.athlete_snapshot ?? {}) as Record<string, unknown>,
            createdAt: data.created_at,
          };

          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { ...buildCorsHeaders(), "content-type": "application/json" },
          });
        } catch (error) {
          console.error("[Get Registration] request failed", error);
          return new Response(JSON.stringify({ error: "Erro interno ao buscar a inscrição." }), {
            status: 500,
            headers: { ...buildCorsHeaders(), "content-type": "application/json" },
          });
        }
      },
      OPTIONS: async () => {
        return new Response(null, {
          status: 204,
          headers: buildCorsHeaders(),
        });
      },
    },
  },
});
