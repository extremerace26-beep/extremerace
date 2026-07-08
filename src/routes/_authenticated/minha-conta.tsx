import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

type Registration = {
  id: string;
  category_id: string;
  category_name: string;
  price_cents: number;
  payment_status: "pending" | "paid" | "cancelled";
  payment_method: string | null;
  team_name: string | null;
  created_at: string;
  paid_at: string | null;
  athlete_snapshot: Record<string, unknown>;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  shirt_size: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
};

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({
    meta: [{ title: "Minha conta — Extreme Race" }],
  }),
  component: MinhaContaPage,
});

function MinhaContaPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"inscricoes" | "perfil">("inscricoes");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return;
      setUserEmail(user.email ?? "");

      // Check if user is admin
      const { data: adminCheck } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!adminCheck);

      const [{ data: prof }, { data: regs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("registrations")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      setProfile(prof as Profile | null);
      setRegistrations((regs ?? []) as Registration[]);
      setLoading(false);
    })();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        cpf: profile.cpf,
        phone: profile.phone,
        birth_date: profile.birth_date,
        gender: profile.gender,
        shirt_size: profile.shirt_size,
        emergency_name: profile.emergency_name,
        emergency_phone: profile.emergency_phone,
      })
      .eq("id", profile.id);
    setSavingProfile(false);
    setProfileMsg(error ? error.message : "Perfil atualizado ✓");
  }

  function downloadReceipt(r: Registration) {
    const lines = [
      "EXTREME RACE — COMPROVANTE DE INSCRIÇÃO",
      "========================================",
      `Inscrição: ${r.id}`,
      `Categoria: ${r.category_name}`,
      `Atleta: ${(r.athlete_snapshot as Record<string, string>)?.fullName ?? profile?.full_name ?? ""}`,
      `E-mail: ${userEmail}`,
      `Status: ${r.payment_status.toUpperCase()}`,
      `Valor: R$ ${(r.price_cents / 100).toFixed(2)}`,
      `Método: ${r.payment_method ?? "—"}`,
      r.team_name ? `Equipe: ${r.team_name}` : "",
      `Emitido em: ${new Date().toLocaleString("pt-BR")}`,
    ].filter(Boolean);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extreme-race-${r.id.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-black tracking-tighter uppercase">
            EXTREME<span className="text-brand">/</span>RACE
          </Link>
          <div className="flex items-center gap-6">
            {isAdmin && (
              <Link
                to="/admin"
                className="font-mono text-xs tracking-[0.2em] uppercase text-brand hover:underline cursor-pointer"
              >
                Painel Admin
              </Link>
            )}
            <span className="hidden sm:block font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-brand cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Área do atleta ]</span>
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-10">
          Minha <span className="text-brand italic">conta</span>
        </h1>

        <div className="flex gap-2 border-b border-border mb-10">
          {[
            { id: "inscricoes", label: "Inscrições" },
            { id: "perfil", label: "Meus dados" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-5 py-3 font-mono text-xs tracking-[0.2em] uppercase cursor-pointer border-b-2 -mb-px transition-colors ${
                tab === t.id ? "border-brand text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground">Carregando...</p>
        ) : tab === "inscricoes" ? (
          <section className="space-y-6">
            {registrations.length === 0 ? (
              <div className="border border-border p-10 text-center">
                <p className="text-muted-foreground mb-6">Você ainda não tem inscrição na Extreme Race.</p>
                <Link
                  to="/inscricao"
                  className="inline-block bg-brand text-brand-foreground px-8 py-4 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Garantir minha vaga →
                </Link>
              </div>
            ) : (
              registrations.map((r) => (
                <article key={r.id} className="border border-border p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                        Categoria
                      </span>
                      <h3 className="font-display text-3xl font-black uppercase tracking-tight">
                        {r.category_name}
                      </h3>
                    </div>
                    <StatusBadge status={r.payment_status} />
                  </div>
                  <dl className="grid sm:grid-cols-3 gap-4 text-sm">
                    <Info label="Valor" value={`R$ ${(r.price_cents / 100).toFixed(2)}`} />
                    <Info label="Método" value={r.payment_method ?? "—"} />
                    <Info label="Inscrição" value={new Date(r.created_at).toLocaleDateString("pt-BR")} />
                    {r.team_name && <Info label="Equipe" value={r.team_name} />}
                    {r.paid_at && (
                      <Info label="Pago em" value={new Date(r.paid_at).toLocaleDateString("pt-BR")} />
                    )}
                  </dl>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => downloadReceipt(r)}
                      className="border border-border px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all cursor-pointer"
                    >
                      Baixar comprovante
                    </button>
                    {r.payment_status === "pending" && (
                      <Link
                        to={`/checkout?registrationId=${encodeURIComponent(r.id)}`}
                        className="bg-brand text-brand-foreground px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                      >
                        Concluir pagamento →
                      </Link>
                    )}
                  </div>
                </article>
              ))
            )}
          </section>
        ) : (
          <section className="max-w-2xl">
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <ProfileField label="Nome completo" className="sm:col-span-2">
                  <input
                    type="text"
                    value={profile?.full_name ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, full_name: e.target.value })}
                    className={inputCls}
                  />
                </ProfileField>
                <ProfileField label="CPF">
                  <input
                    type="text"
                    value={profile?.cpf ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, cpf: e.target.value })}
                    className={inputCls}
                  />
                </ProfileField>
                <ProfileField label="Data de nascimento">
                  <input
                    type="date"
                    value={profile?.birth_date ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, birth_date: e.target.value })}
                    className={inputCls}
                  />
                </ProfileField>
                <ProfileField label="Telefone">
                  <input
                    type="tel"
                    value={profile?.phone ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, phone: e.target.value })}
                    className={inputCls}
                  />
                </ProfileField>
                <ProfileField label="Camisa">
                  <select
                    value={profile?.shirt_size ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, shirt_size: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    {["PP", "P", "M", "G", "GG", "XGG"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </ProfileField>
                <ProfileField label="Gênero">
                  <select
                    value={profile?.gender ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, gender: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">—</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </ProfileField>
                <ProfileField label="Emergência — nome">
                  <input
                    type="text"
                    value={profile?.emergency_name ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, emergency_name: e.target.value })}
                    className={inputCls}
                  />
                </ProfileField>
                <ProfileField label="Emergência — telefone">
                  <input
                    type="tel"
                    value={profile?.emergency_phone ?? ""}
                    onChange={(e) => setProfile((p) => p && { ...p, emergency_phone: e.target.value })}
                    className={inputCls}
                  />
                </ProfileField>
              </div>
              {profileMsg && (
                <p className={`text-xs font-mono ${profileMsg.includes("✓") ? "text-brand" : "text-destructive"}`}>
                  {profileMsg}
                </p>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="bg-brand text-brand-foreground px-8 py-4 text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
              >
                {savingProfile ? "Salvando..." : "Salvar alterações"}
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}

const inputCls =
  "w-full bg-transparent border border-border px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors";

function ProfileField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground mt-1">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: Registration["payment_status"] }) {
  const styles = {
    paid: "bg-brand text-brand-foreground",
    pending: "border border-border text-muted-foreground",
    cancelled: "border border-destructive text-destructive",
  } as const;
  const labels = { paid: "Pago", pending: "Pendente", cancelled: "Cancelado" } as const;
  return (
    <span className={`${styles[status]} font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1.5`}>
      {labels[status]}
    </span>
  );
}
