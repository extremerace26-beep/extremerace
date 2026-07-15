import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type CreateRegistrationPayload = {
  category: {
    id: string;
    name: string;
  };
  athlete: Record<string, unknown>;
  createdAt?: string;
  userId?: string | null;
};

function buildCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

export const Route = createFileRoute("/api/public/create-registration")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as CreateRegistrationPayload;
          const category = payload.category;
          const athlete = payload.athlete || {};
          const createdAt = payload.createdAt || new Date().toISOString();

          if (!category?.id || !category?.name || !athlete.fullName || !athlete.email) {
            return new Response(
              JSON.stringify({ error: "Dados incompletos para criar a inscrição." }),
              {
                status: 400,
                headers: { ...buildCorsHeaders(), "content-type": "application/json" },
              },
            );
          }

          const supabaseAdmin = createSupabaseAdminClient();
          const { data, error } = await supabaseAdmin
            .from("inscricoes")
            .insert([
              {
                user_id: payload.userId || null,
                full_name: athlete.fullName ?? null,
                email: athlete.email ?? null,
                category_id: category.id,
                category_name: category.name,
                athlete_snapshot: athlete,
                payment_status: "pending",
                created_at: createdAt,
                updated_at: new Date().toISOString(),
              },
            ])
            .select("id")
            .single();

          if (error || !data) {
            console.error("[Create Registration] insert failed", error);
            return new Response(
              JSON.stringify({ error: "Erro ao criar a inscrição." }),
              {
                status: 500,
                headers: { ...buildCorsHeaders(), "content-type": "application/json" },
              },
            );
          }

          return new Response(
            JSON.stringify({ inscricaoId: data.id }),
            {
              status: 200,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            },
          );
        } catch (error) {
          console.error("[Create Registration] request failed", error);
          return new Response(
            JSON.stringify({ error: "Erro interno ao criar a inscrição." }),
            {
              status: 500,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            },
          );
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
