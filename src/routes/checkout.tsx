import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";
import { getCheckoutLinkByCategoryId, CHECKOUT_LINKS } from "@/lib/checkout-links";

type Payload = {
  category: { id: string; name: string; price: number; priceLabel: string };
  modalidade?: string | null;
  checkoutLink?: string | null;
  athlete: {
    fullName?: string;
    email?: string;
    password?: string;
    cpf?: string;
    phone?: string;
    teamName?: string;
    birthDate?: string;
    gender?: string;
    shirtSize?: string;
    emergencyName?: string;
    emergencyPhone?: string;
  };
  createdAt: string;
  registrationId?: string;
};

const STORAGE_KEY = "extreme-race:inscricao";

export const Route = createFileRoute("/checkout")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pagamento — Extreme Race" },
      { name: "description", content: "Finalize o pagamento da sua inscrição na Extreme Race." },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<Payload | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [walletCreated, setWalletCreated] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const params = new URLSearchParams(window.location.search);
    const currentStatus = params.get("status");
    const registrationId = params.get("registrationId");

    if (currentStatus) {
      setPaymentStatus(currentStatus);
      setDone(currentStatus === "success");
    }

    if (raw) {
      try {
        setData(JSON.parse(raw) as Payload);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }

    if (!raw && !registrationId) {
      navigate({ to: "/inscricao" });
      return;
    }

    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        setIsAuthenticated(!!user);

        if (!user && !registrationId && !raw) {
          navigate({ to: "/auth", search: { redirect: "/checkout" } });
          return;
        }

        if (registrationId) {
          const query = supabase.from("registrations").select("*").eq("id", registrationId);
          if (user) {
            query.eq("user_id", user.id);
          }

          const { data: registration, error: registrationError } = await query.maybeSingle();

          if (registrationError || !registration) {
            navigate({ to: "/inscricao" });
            return;
          }

          setData({
            category: {
              id: registration.category_id,
              name: registration.category_name,
              price: (registration.price_cents || 0) / 100,
              priceLabel: `R$ ${((registration.price_cents || 0) / 100).toFixed(2)}`,
            },
            athlete: (registration.athlete_snapshot as Payload["athlete"]) || {},
            createdAt: registration.created_at || new Date().toISOString(),
            registrationId: registration.id,
          });
        }
      } catch (error) {
        console.error("[Checkout] auth session failed", error);
        setError("Não foi possível verificar sua sessão no momento. Tente novamente em alguns segundos.");
      } finally {
        setAuthChecked(true);
      }
    })();
  }, [navigate]);

  async function handlePay() {
    if (!data) return;
    setProcessing(true);
    setError(null);

    const initialCheckoutLink = data.checkoutLink;
    const redirectKey = `extreme-race:checkout-redirect-${Date.now()}`;
    const redirectUrl = new URL("checkout-redirect.html", window.location.href).toString() + `?key=${encodeURIComponent(redirectKey)}`;
    let paymentWindow: Window | null = null;

    if (initialCheckoutLink) {
      paymentWindow = window.open(initialCheckoutLink, "_blank");
    } else {
      paymentWindow = window.open(redirectUrl, "_blank");
    }

    const { data: userRes } = await supabase.auth.getUser();
    let user = userRes.user;

    try {
      if (!user) {
        if (!data.athlete.password) {
          setError("Informe uma senha para criar sua conta e continuar.");
          setProcessing(false);
          if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.athlete.email || "",
          password: data.athlete.password,
        });

        if (!signInError) {
          const { data: newSessionData } = await supabase.auth.getSession();
          user = newSessionData.session?.user ?? null;
        }
      }

      if (!user && !data.athlete.password) {
        setError("Usuário não autenticado. Faça login ou informe uma senha para criar a conta automaticamente.");
        setProcessing(false);
        if (paymentWindow && !paymentWindow.closed) paymentWindow.close();
        return;
      }

      const requestBody: any = {
        category: data.category,
        modalidade: data.modalidade,
        checkoutLink: data.checkoutLink,
        athlete: {
          ...data.athlete,
          password: undefined,
        },
        createdAt: data.createdAt,
        userId: user?.id,
        registrationId: data.registrationId,
      };

      if (!user && data.athlete.password) {
        requestBody.password = data.athlete.password;
      }

      const response = await fetch("/api/public/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Erro ao criar registro e checkout no servidor.");
      }

      const checkoutLink =
        result.checkoutLink || result.checkout_link || result.checkoutUrl || result.checkoutURL || data.checkoutLink || null;
      if (!checkoutLink) {
        throw new Error("Link de checkout não retornado pelo servidor.");
      }

      if (result.registrationId) {
        setData((current) => (current ? { ...current, registrationId: result.registrationId } : current));
      }

      if (paymentWindow && !paymentWindow.closed) {
        try {
          localStorage.setItem(redirectKey, checkoutLink);
          paymentWindow.focus();
        } catch {
          window.open(checkoutLink, "_blank") || (window.location.href = checkoutLink);
        }
      } else {
        window.open(checkoutLink, "_blank") || (window.location.href = checkoutLink);
      }
    } catch (error) {
      console.error("[Checkout] preference creation failed", error);
      setError(error instanceof Error ? error.message : "Erro ao iniciar o pagamento.");
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }
    } finally {
      setProcessing(false);
    }
  }

  if (!data || !authChecked) {
    return (
      <div className="min-h-screen bg-background grid place-items-center text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
        Carregando...
      </div>
    );
  }

  if (done) {
    setTimeout(() => {
      navigate({ to: "/auth", search: { mode: "signin" } });
    }, 2000);
    
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-6">
        <div className="max-w-xl text-center">
          <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Pagamento Confirmado ]</span>
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mt-4">
            Tudo certo <span className="text-brand italic">!</span>
          </h1>
          <p className="text-muted-foreground mt-6">
            Seu pagamento foi confirmado. Você será redirecionado para fazer login em alguns segundos...
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all"
            >
              Ir para login →
            </Link>
            <Link
              to="/"
              className="px-8 py-4 text-xs font-black uppercase tracking-widest border border-border hover:bg-foreground hover:text-background transition-all"
            >
              Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <img src={logo} alt="Extreme Race" className="h-14 md:h-16 object-contain" />
          </Link>
          <Link
            to="/inscricao"
            className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground"
          >
            ← Editar inscrição
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-20 grid lg:grid-cols-[1fr,380px] gap-12">
        <section>
          <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Pagamento ]</span>
          <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-10">
            Finalize sua <span className="text-brand italic">vaga</span>
          </h1>

          <div className="border border-border p-6 bg-background/50">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Processamento seguro
            </p>
            <p className="text-sm text-muted-foreground">
              O pagamento será realizado diretamente no ambiente do Infinity Pay para garantir mais segurança e variedade de meios de pagamento.
            </p>
          </div>

          {paymentStatus && (
            <div className="mt-4 rounded border border-border p-4 text-sm text-muted-foreground">
              Status do pagamento: <span className="font-semibold text-foreground">{paymentStatus}</span>
            </div>
          )}

          {error && <p className="text-destructive text-xs font-mono mt-4">{error}</p>}

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full mt-8 py-5 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all disabled:opacity-60 cursor-pointer"
          >
            {processing ? "Processando..." : `Continuar para o pagamento`}
          </button>
          {walletCreated && (
            <div id="wallet_container" className="mt-8" />
          )}
          <p className="text-center text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mt-4">
            Integração Infinity Pay
          </p>
        </section>

        <aside className="border border-border p-8 h-fit lg:sticky lg:top-12">
          <h2 className="font-display text-xl font-black uppercase tracking-widest mb-6">
            Resumo
          </h2>
          <div className="space-y-4 text-sm border-b border-border pb-6">
            <Row label="Categoria" value={data.category.name} />
            <Row label="Atleta" value={data.athlete.fullName ?? "—"} />
            <Row label="E-mail" value={data.athlete.email ?? "—"} />
            {data.athlete.teamName && <Row label="Equipe" value={data.athlete.teamName} />}
          </div>
          <div className="flex items-baseline justify-between pt-6">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Total
            </span>
            <span className="font-display text-3xl font-black text-brand">
              {data.category.priceLabel}
            </span>
          </div>
        </aside>
      </main>
    </div>
  );
}

function MethodOption({
  active,
  onClick,
  title,
  desc,
}: {
  id: string;
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-6 border transition-all cursor-pointer flex items-center gap-4 ${
        active ? "border-brand bg-brand/5" : "border-border hover:border-foreground/40"
      }`}
    >
      <span
        className={`size-4 rounded-full border-2 shrink-0 ${
          active ? "border-brand bg-brand" : "border-border"
        }`}
      />
      <span className="flex-1">
        <span className="font-display text-lg font-black uppercase tracking-wide block">
          {title}
        </span>
        <span className="text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground shrink-0">
        {label}
      </span>
      <span className="text-foreground text-right">{value}</span>
    </div>
  );
}
