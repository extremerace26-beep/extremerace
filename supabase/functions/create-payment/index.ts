import { serve } from "https://deno.land/std@0.201.0/http/server.ts";
import { MercadoPagoConfig, Preference } from "npm:mercadopago";

interface CreatePaymentRequest {
  title?: string;
  quantity?: number;
  currency_id?: string;
  unit_price: number;
  external_reference?: string;
  registration_id?: string;
  category_id?: string;
  athlete_email?: string;
  athlete_name?: string;
  notification_url?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const headers = {
  "Content-Type": "application/json",
  ...corsHeaders,
};

serve(async (request) => {
  // Handle CORS preflight request
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await request.json().catch(() => ({})) as CreatePaymentRequest;

    if (!body || typeof body.unit_price !== "number" || Number.isNaN(body.unit_price)) {
      return new Response(JSON.stringify({ error: "unit_price é obrigatório e deve ser um número" }), {
        status: 400,
        headers,
      });
    }

    const accessToken = Deno.env.get("MP_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "MP_ACCESS_TOKEN não configurado" }), {
        status: 500,
        headers,
      });
    }

    const requestUrl = new URL(request.url);
    const originHeader = request.headers.get("origin") || request.headers.get("referer");
    const frontendUrl = Deno.env.get("FRONTEND_URL")?.replace(/\/$/, "");

    let baseUrl = frontendUrl || originHeader || requestUrl.origin;
    try {
      const parsedBase = new URL(baseUrl);
      baseUrl = parsedBase.origin;
    } catch {
      baseUrl = requestUrl.origin;
    }

    // Force HTTPS for non-localhost domains (essential because Supabase forwards requests over HTTP internally)
    if (baseUrl.startsWith("http://") && !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1")) {
      baseUrl = baseUrl.replace("http://", "https://");
    }

    const successUrl = `${baseUrl}/checkout?status=success`;
    const failureUrl = `${baseUrl}/checkout?status=failure`;
    const pendingUrl = `${baseUrl}/checkout?status=pending`;
    const webhookUrl = body.notification_url || `${baseUrl}/.netlify/functions/mercadopago-webhook`;

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const payer = body.athlete_email && body.athlete_name 
      ? {
          name: body.athlete_name.split(" ")[0] || "Atleta",
          surname: body.athlete_name.split(" ").slice(1).join(" ") || "Extreme Race",
          email: body.athlete_email,
        }
      : undefined;

    const response = await preference.create({
      body: {
        items: [
          {
            title: body.title || "Consultoria Online",
            quantity: body.quantity ?? 1,
            currency_id: body.currency_id || "BRL",
            unit_price: body.unit_price,
          },
        ],
        ...(payer ? { payer } : {}),
        external_reference: body.external_reference || body.registration_id || undefined,
        back_urls: {
          success: successUrl,
          failure: failureUrl,
          pending: pendingUrl,
        },
        notification_url: webhookUrl,
        auto_return: "approved",
        metadata: {
          registration_id: body.registration_id,
          category_id: body.category_id,
          event: "extreme-race",
        },
      },
    });

    return new Response(
      JSON.stringify({
        preferenceId: response.id,
        init_point: response.init_point,
      }),
      {
        status: 200,
        headers,
      },
    );
  } catch (error: any) {
    console.error("[create-payment] failed", error);
    let message = "Erro inesperado";
    let details = null;
    if (error) {
      if (typeof error === "object") {
        message = error.message || error.message_en || JSON.stringify(error);
        details = error;
      } else {
        message = String(error);
      }
    }

    return new Response(JSON.stringify({ 
      error: `Erro ao criar preferência do Mercado Pago: ${message}`,
      details 
    }), {
      status: 500,
      headers,
    });
  }
});
