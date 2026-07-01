import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

type CreatePreferencePayload = {
  category: {
    id: string;
    name: string;
    price: number;
    priceLabel: string;
  };
  athlete: Record<string, unknown>;
  createdAt: string;
  registrationId?: string;
  userId?: string | null;
};

function buildCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getRegistrationPrice(referenceDate = new Date()) {
  const PRICING_RULES = [
    { limit: new Date(new Date().getFullYear(), 5, 30, 23, 59, 59, 999), price: 119.9 },
    { limit: new Date(new Date().getFullYear(), 6, 30, 23, 59, 59, 999), price: 129.9 },
    { limit: new Date(new Date().getFullYear(), 7, 30, 23, 59, 59, 999), price: 139.9 },
    { limit: new Date(new Date().getFullYear(), 8, 7, 23, 59, 59, 999), price: 149.9 },
  ];

  const now = new Date(referenceDate);
  for (const rule of PRICING_RULES) {
    if (now <= rule.limit) {
      return Number(rule.price.toFixed(2));
    }
  }
  throw new Error("Inscrições encerradas");
}

function ensureProfile(supabaseAdmin: ReturnType<typeof createClient>, userId: string | null | undefined, athlete: Record<string, unknown>) {
  if (!userId) return null;
  return supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: athlete?.fullName ?? null,
    email: athlete?.email ?? null,
    cpf: athlete?.cpf ?? null,
    phone: athlete?.phone ?? null,
    birth_date: athlete?.birthDate ?? null,
    gender: athlete?.gender ?? null,
    shirt_size: athlete?.shirtSize ?? null,
    emergency_name: athlete?.emergencyName ?? null,
    emergency_phone: athlete?.emergencyPhone ?? null,
  });
}

function resolveBaseUrl(request: Request) {
  const url = new URL(request.url);
  const host = url.host || "localhost:4173";
  const protocol = url.protocol || "http:";
  return `${protocol}//${host}`;
}

function createSupabaseAdminClient() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

export const Route = createFileRoute("/api/public/create-preference")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const payload = (await request.json()) as CreatePreferencePayload;
          const athlete = payload.athlete || {};
          const category = payload.category || {};
          const registrationId = payload.registrationId || payload.registration_id || null;
          const userId = payload.userId || payload.user_id || null;
          const createdAt = payload.createdAt || new Date().toISOString();

          if (!registrationId && (!athlete.fullName || !athlete.email || !category.id)) {
            return new Response(JSON.stringify({ error: "Dados da inscrição incompletos" }), {
              status: 400,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            });
          }

          if (!registrationId && !userId) {
            return new Response(
              JSON.stringify({ error: "Usuário não autenticado. Faça login para continuar." }),
              {
                status: 400,
                headers: { ...buildCorsHeaders(), "content-type": "application/json" },
              },
            );
          }

          const baseUrl = resolveBaseUrl(request);
          const callbackUrl = new URL("/.netlify/functions/mercadopago-webhook", baseUrl).toString();
          const successUrl = new URL("/checkout?status=success", baseUrl).toString();
          const failureUrl = new URL("/checkout?status=failure", baseUrl).toString();
          const pendingUrl = new URL("/checkout?status=pending", baseUrl).toString();

          if (!successUrl) {
            throw new Error("Invalid Mercado Pago success URL");
          }

          const supabaseAdmin = createSupabaseAdminClient();

          let price = 0;
          let registration: any = null;
          let preferenceAthlete = athlete;

          if (registrationId) {
            const { data: existingRegistration, error: fetchError } = await supabaseAdmin
              .from("registrations")
              .select("*")
              .eq("id", registrationId)
              .single();

            if (fetchError || !existingRegistration) {
              return new Response(JSON.stringify({ error: "Registro não encontrado" }), {
                status: 404,
                headers: { ...buildCorsHeaders(), "content-type": "application/json" },
              });
            }

            if (existingRegistration.payment_status === "paid") {
              return new Response(JSON.stringify({ error: "Pagamento já concluído" }), {
                status: 400,
                headers: { ...buildCorsHeaders(), "content-type": "application/json" },
              });
            }

            registration = existingRegistration;
            preferenceAthlete = existingRegistration.athlete_snapshot || {};
            price = (existingRegistration.price_cents || 0) / 100;
            category.id = existingRegistration.category_id || category.id;
            category.name = existingRegistration.category_name || category.name;
          } else {
            price = getRegistrationPrice(new Date());
            const { data: newRegistration, error: registrationError } = await supabaseAdmin
              .from("registrations")
              .insert({
                user_id: userId,
                category_id: category.id,
                category_name: category.name,
                price_cents: Math.round(price * 100),
                team_name: athlete.teamName || null,
                athlete_snapshot: athlete,
                payment_status: "pending",
                payment_method: "mercadopago",
                created_at: createdAt,
                updated_at: new Date().toISOString(),
              })
              .select("id");

            if (registrationError || !newRegistration) {
              console.error("[Mercado Pago] registration insert failed", registrationError);
              throw registrationError || new Error("Falha ao criar inscrição");
            }

            registration = newRegistration;
            await ensureProfile(supabaseAdmin, userId, athlete);

            try {
              await supabaseAdmin.from("inscricoes").insert({
                user_id: userId,
                registration_id: registration.id,
                full_name: athlete.fullName,
                email: athlete.email,
                category_id: category.id,
                category_name: category.name,
                price_cents: Math.round(price * 100),
                athlete_snapshot: athlete,
                payment_status: "pending",
                payment_reference: registration.id,
                created_at: createdAt,
                updated_at: new Date().toISOString(),
              });
            } catch (inscriptionError) {
              console.warn("[Mercado Pago] inscricoes insert skipped", inscriptionError);
            }
          }

          const { MercadoPagoConfig, Preference } = await import("mercadopago");
          const client = new MercadoPagoConfig({ accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN });
          const preference = new Preference(client);
          const payerEmail = preferenceAthlete.email ? String(preferenceAthlete.email) : undefined;
          const payerName = String(preferenceAthlete.fullName ?? "Atleta");
          const payer = payerEmail
            ? {
                name: payerName.split(" ")[0] || "Atleta",
                surname: payerName.split(" ").slice(1).join(" ") || "Extreme Race",
                email: payerEmail,
              }
            : undefined;

          const response = await preference.create({
            body: {
              items: [
                {
                  title: `Inscrição Extreme Race - ${category.name}`,
                  quantity: 1,
                  unit_price: price,
                  currency_id: "BRL",
                },
              ],
              ...(payer ? { payer } : {}),
              external_reference: registration.id,
              auto_return: "approved",
              back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
              },
              notification_url: callbackUrl,
              metadata: {
                registration_id: registration.id,
                category_id: category.id,
                event: "extreme-race",
              },
              statement_descriptor: "EXTREME RACE",
            },
          });

          return new Response(
            JSON.stringify({
              init_point: response.init_point,
              preferenceId: response.id,
              registrationId: registration.id,
              price,
              priceLabel: formatPrice(price),
            }),
            {
              status: 200,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            },
          );
        } catch (error) {
          console.error("[Mercado Pago] create preference failed", error);
          const message =
            error instanceof Error
              ? error.message
              : typeof error === "string"
              ? error
              : JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

          const responsePayload: any = {
            error: import.meta.env.DEV
              ? `Erro ao criar checkout do Mercado Pago: ${message}`
              : "Erro ao criar checkout do Mercado Pago",
          };

          if (import.meta.env.DEV) {
            responsePayload.details = {
              message,
              mercadoPagoToken: process.env.MERCADO_PAGO_ACCESS_TOKEN ? "SET" : "MISSING",
              supabaseUrl: process.env.SUPABASE_URL ? "SET" : "MISSING",
              supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
            };
          }

          return new Response(JSON.stringify(responsePayload), {
            status: 500,
            headers: { ...buildCorsHeaders(), "content-type": "application/json" },
          });
        }
      },
    },
  },
});
