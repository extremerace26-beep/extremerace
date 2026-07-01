declare global {
  interface Window {
    MercadoPago?: any;
  }
}

type StartCheckoutPayload = {
  title?: string;
  quantity?: number;
  currency_id?: string;
  unit_price: number;
};

type CheckoutResponse = {
  preferenceId?: string;
  init_point?: string;
  error?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;
const PUBLIC_KEY = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
const EDGE_FUNCTION_URL = SUPABASE_FUNCTION_URL
  ? SUPABASE_FUNCTION_URL.replace(/\/$/, "")
  : SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/create-payment`
  : "";

export async function startCheckout(payload: StartCheckoutPayload): Promise<CheckoutResponse> {
  if (!EDGE_FUNCTION_URL) {
    throw new Error("VITE_SUPABASE_URL ou VITE_SUPABASE_FUNCTION_URL não configurado");
  }

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || "Não foi possível iniciar o checkout.");
  }

  return data as CheckoutResponse;
}

export async function loadMercadoPagoSdk() {
  if (typeof window === "undefined") return null;
  if (window.MercadoPago) return window.MercadoPago;

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector("script[data-mercadopago-sdk]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar o SDK do Mercado Pago")));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.mercadopago.com/js/v2";
    script.setAttribute("data-mercadopago-sdk", "true");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar o SDK do Mercado Pago"));
    document.head.appendChild(script);
  });

  return window.MercadoPago;
}

export async function createWalletBrick(preferenceId: string, containerId = "wallet_container") {
  if (!PUBLIC_KEY) {
    throw new Error("VITE_MERCADO_PAGO_PUBLIC_KEY não configurado");
  }

  const MercadoPago = await loadMercadoPagoSdk();
  if (!MercadoPago) {
    throw new Error("SDK do Mercado Pago não está disponível");
  }

  const mp = new MercadoPago(PUBLIC_KEY, {
    locale: "pt-BR",
  });

  return mp.bricks().create("wallet", containerId, {
    initialization: {
      preferenceId,
    },
  });
}
