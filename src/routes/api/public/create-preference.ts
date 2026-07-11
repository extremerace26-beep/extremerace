import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getCheckoutLinkByCategoryId, CHECKOUT_LINKS } from "@/lib/checkout-links";

type CreatePreferencePayload = {
  category: {
    id: string;
    name: string;
    price: number;
    priceLabel: string;
  };
  modalidade?: string | null;
  checkoutLink?: string | null;
  athlete: Record<string, unknown>;
  createdAt: string;
  registrationId?: string;
  userId?: string | null;
  password?: string | null;
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

function resolveCheckoutModalidade(modalidade?: string | null, categoryId?: string | null) {
  const normalized = String(modalidade || categoryId || "").trim().toLowerCase();

  if (normalized === "economica") {
    return "economica";
  }

  if (normalized === "grupo") {
    return "grupo";
  }

  if (normalized === "dupla" || normalized === "duplamasc" || normalized === "duplafemi" || normalized === "mista") {
    return "dupla";
  }

  return "individual";
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
          let userId = payload.userId || payload.user_id || null;
          const createdAt = payload.createdAt || new Date().toISOString();
          const supabaseAdmin = createSupabaseAdminClient();

          if (!registrationId && (!athlete.fullName || !athlete.email || !category.id)) {
            return new Response(JSON.stringify({ error: "Dados da inscrição incompletos" }), {
              status: 400,
              headers: { ...buildCorsHeaders(), "content-type": "application/json" },
            });
          }

          let effectiveUserId = userId;

          if (!registrationId && !effectiveUserId) {
            if (!athlete.email || !payload.password) {
              return new Response(
                JSON.stringify({ error: "Usuário não autenticado. Faça login ou informe uma senha para criar a conta automaticamente." }),
                {
                  status: 400,
                  headers: { ...buildCorsHeaders(), "content-type": "application/json" },
                },
              );
            }

            const email = String(athlete.email);
            const password = String(payload.password);
            let existingUserId: string | null = null;

            const { data: existingUser, error: existingUserError } = await supabaseAdmin
              .from("auth.users")
              .select("id")
              .eq("email", email)
              .maybeSingle();

            if (existingUser?.id) {
              existingUserId = existingUser.id;
            }

            if (existingUserError) {
              console.warn("[Infinity Pay] failed to look up existing user by email", existingUserError);
            }

            if (existingUserId) {
              effectiveUserId = existingUserId;
            } else {
              const { data: userCreateData, error: userCreateError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                  full_name: athlete.fullName ?? null,
                },
              });

              if (userCreateError) {
                console.error("[Infinity Pay] create user failed", userCreateError);
                return new Response(
                  JSON.stringify({ error: userCreateError.message || "Falha ao criar usuário." }),
                  {
                    status: 400,
                    headers: { ...buildCorsHeaders(), "content-type": "application/json" },
                  },
                );
              }

              effectiveUserId = userCreateData.user?.id ?? null;
              if (!effectiveUserId) {
                return new Response(
                  JSON.stringify({ error: "Falha ao criar usuário." }),
                  {
                    status: 500,
                    headers: { ...buildCorsHeaders(), "content-type": "application/json" },
                  },
                );
              }
            }

            userId = effectiveUserId;
          }

          const baseUrl = resolveBaseUrl(request);
          const successUrl = new URL("/checkout?status=success", baseUrl).toString();
          const failureUrl = new URL("/checkout?status=failure", baseUrl).toString();
          const pendingUrl = new URL("/checkout?status=pending", baseUrl).toString();

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
                payment_method: "infinitypay",
                created_at: createdAt,
                updated_at: new Date().toISOString(),
              })
              .select("id");

            if (registrationError || !newRegistration) {
              console.error("[Infinity Pay] registration insert failed", registrationError);
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
              console.warn("[Infinity Pay] inscricoes insert skipped", inscriptionError);
            }
          }

          const payloadCheckoutLink = payload.checkoutLink ? String(payload.checkoutLink).trim() : null;
          const isValidPayloadLink = payloadCheckoutLink
            ? Object.values(CHECKOUT_LINKS).includes(payloadCheckoutLink as any)
            : false;

          const checkoutModalidade = resolveCheckoutModalidade(payload.modalidade, category.id);
          let checkoutLink = isValidPayloadLink
            ? payloadCheckoutLink
            : CHECKOUT_LINKS[checkoutModalidade] ?? getCheckoutLinkByCategoryId(category.id);

          if (!checkoutLink) {
            throw new Error("Nenhum link de checkout disponível para esta categoria.");
          }

          return new Response(
            JSON.stringify({
              checkoutLink,
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
          console.error("[Infinity Pay] create preference failed", error);
          const message =
            error instanceof Error
              ? error.message
              : typeof error === "string"
              ? error
              : JSON.stringify(error, Object.getOwnPropertyNames(error), 2);

          const responsePayload: any = {
            error: import.meta.env.DEV
              ? `Erro ao criar link de checkout do Infinity Pay: ${message}`
              : "Erro ao criar link de checkout",
          };

          if (import.meta.env.DEV) {
            responsePayload.details = {
              message,
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
