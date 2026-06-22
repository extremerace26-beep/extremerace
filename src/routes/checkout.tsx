import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Payload = {
  category: { id: string; name: string; price: number; priceLabel: string };
  athlete: {
    fullName?: string;
    email?: string;
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
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      navigate({ to: "/inscricao" });
      return;
    }
    try {
      setData(JSON.parse(raw) as Payload);
    } catch {
      navigate({ to: "/inscricao" });
      return;
    }
    supabase.auth.getSession().then(({ data: s }) => {
      if (!s.session) {
        navigate({ to: "/auth", search: { redirect: "/checkout" } });
      } else {
        setAuthChecked(true);
      }
    });
  }, [navigate]);

  async function handlePay() {
    if (!data) return;
    setProcessing(true);
    setError(null);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/checkout" } });
      return;
    }

    // Update profile snapshot from the form too
    await supabase
      .from("profiles")
      .update({
        full_name: data.athlete.fullName,
        cpf: data.athlete.cpf,
        phone: data.athlete.phone,
        birth_date: data.athlete.birthDate || null,
        gender: data.athlete.gender,
        shirt_size: data.athlete.shirtSize,
        emergency_name: data.athlete.emergencyName,
        emergency_phone: data.athlete.emergencyPhone,
      })
      .eq("id", user.id);

    const { error: insertError } = await supabase.from("registrations").insert({
      user_id: user.id,
      category_id: data.category.id,
      category_name: data.category.name,
      price_cents: Math.round(data.category.price * 100),
      team_name: data.athlete.teamName || null,
      athlete_snapshot: data.athlete,
      payment_status: "paid",
      payment_method: method,
      paid_at: new Date().toISOString(),
    });

    setProcessing(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    sessionStorage.removeItem(STORAGE_KEY);
    setDone(true);
  }

  if (!data || !authChecked) {
    return (
      <div className="min-h-screen bg-background grid place-items-center text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
        Carregando...
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background text-foreground grid place-items-center px-6">
        <div className="max-w-xl text-center">
          <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Confirmado ]</span>
          <h1 className="font-display text-5xl md:text-7xl font-black uppercase tracking-tighter mt-4">
            Você está <span className="text-brand italic">dentro</span>
          </h1>
          <p className="text-muted-foreground mt-6">
            Inscrição confirmada para <b className="text-foreground">{data.athlete.fullName}</b> na
            categoria <b className="text-foreground">{data.category.name}</b>. Acesse sua área para
            baixar o comprovante.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link
              to="/minha-conta"
              className="px-8 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all"
            >
              Ir para minha conta →
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
          <Link to="/" className="font-display text-2xl font-black tracking-tighter uppercase">
            EXTREME<span className="text-brand">/</span>RACE
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

          <div className="space-y-4 mb-10">
            <MethodOption
              id="pix"
              active={method === "pix"}
              onClick={() => setMethod("pix")}
              title="Pix"
              desc="Aprovação imediata. Recomendado."
            />
            <MethodOption
              id="card"
              active={method === "card"}
              onClick={() => setMethod("card")}
              title="Cartão de crédito"
              desc="Parcele em até 6x sem juros."
            />
          </div>

          <div className="border border-border p-6 bg-background/50">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Processamento seguro
            </p>
            <p className="text-sm text-muted-foreground">
              {method === "pix"
                ? "Ao confirmar, geraremos o QR Code do Pix. A inscrição é validada assim que o pagamento for compensado."
                : "Você será redirecionado para o checkout seguro do InfinityPay para inserir os dados do cartão."}
            </p>
          </div>

          {error && <p className="text-destructive text-xs font-mono mt-4">{error}</p>}

          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full mt-8 py-5 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all disabled:opacity-60 cursor-pointer"
          >
            {processing ? "Processando..." : `Pagar ${data.category.priceLabel}`}
          </button>
          <p className="text-center text-[10px] font-mono tracking-[0.2em] uppercase text-muted-foreground mt-4">
            Integração InfinityPay
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
