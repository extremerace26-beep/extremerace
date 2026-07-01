import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type AdminRegistration = {
  id: string;
  user_id: string;
  category_id: string;
  category_name: string;
  price_cents: number;
  payment_status: "pending" | "paid" | "cancelled";
  payment_method: string | null;
  payment_reference: string | null;
  team_name: string | null;
  created_at: string;
  paid_at: string | null;
  athlete_snapshot: Record<string, unknown>;
};

type AdminProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  cpf: string | null;
  phone: string | null;
  shirt_size: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  birth_date: string | null;
  gender: string | null;
};

type StatusFilter = "all" | "paid" | "pending" | "cancelled";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Extreme Race" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [profiles, setProfiles] = useState<Record<string, AdminProfile>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({ to: "/auth", search: { redirect: "/admin" } });
        return;
      }
      const { data: isAdmin, error: roleErr } = await supabase.rpc("has_role", {
        _user_id: userData.user.id,
        _role: "admin",
      });
      if (roleErr || !isAdmin) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);
      await loadData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    const { data: regs, error: regErr } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (regErr) {
      setError(regErr.message);
      setLoading(false);
      return;
    }
    const list = (regs ?? []) as AdminRegistration[];
    setRegistrations(list);
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .in("id", ids);
      const map: Record<string, AdminProfile> = {};
      (profs ?? []).forEach((p) => (map[p.id] = p as AdminProfile));
      setProfiles(map);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, next: AdminRegistration["payment_status"]) {
    const patch: { payment_status: AdminRegistration["payment_status"]; paid_at?: string | null } = {
      payment_status: next,
      paid_at: next === "paid" ? new Date().toISOString() : null,
    };
    const { error } = await supabase.from("registrations").update(patch).eq("id", id);
    if (error) {
      alert("Erro ao atualizar: " + error.message);
      return;
    }
    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  }

  async function deleteRegistration(id: string, name: string) {
    const confirmDelete = confirm(
      `Tem certeza que deseja excluir a inscrição de ${name}? Esta ação não pode ser desfeita.`
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("registrations").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
  }

  const categories = useMemo(
    () => Array.from(new Set(registrations.map((r) => r.category_name))),
    [registrations],
  );

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      if (status !== "all" && r.payment_status !== status) return false;
      if (category !== "all" && r.category_name !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const p = profiles[r.user_id];
        const blob = [
          p?.full_name,
          p?.email,
          p?.cpf,
          p?.phone,
          r.team_name,
          r.category_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    });
  }, [registrations, profiles, search, status, category]);

  const stats = useMemo(() => {
    const paid = registrations.filter((r) => r.payment_status === "paid");
    const pending = registrations.filter((r) => r.payment_status === "pending");
    const revenue = paid.reduce((s, r) => s + r.price_cents, 0);
    return {
      total: registrations.length,
      paid: paid.length,
      pending: pending.length,
      revenue,
    };
  }, [registrations]);

  function exportCsv() {
    const rows = [
      [
        "Status",
        "Categoria",
        "Nome",
        "Email",
        "CPF",
        "Telefone",
        "Tamanho camiseta",
        "Contato emergência",
        "Telefone emergência",
        "Equipe",
        "Valor (R$)",
        "Método",
        "Inscrito em",
        "Pago em",
      ],
      ...filtered.map((r) => {
        const p = profiles[r.user_id];
        return [
          r.payment_status,
          r.category_name,
          p?.full_name ?? "",
          p?.email ?? "",
          p?.cpf ?? "",
          p?.phone ?? "",
          p?.shirt_size ?? "",
          p?.emergency_name ?? "",
          p?.emergency_phone ?? "",
          r.team_name ?? "",
          (r.price_cents / 100).toFixed(2).replace(".", ","),
          r.payment_method ?? "",
          new Date(r.created_at).toLocaleString("pt-BR"),
          r.paid_at ? new Date(r.paid_at).toLocaleString("pt-BR") : "",
        ];
      }),
    ];
    const csv = rows
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inscricoes-extreme-race-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (authorized === null || (authorized && loading && registrations.length === 0)) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <span className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
          [ Carregando ]
        </span>
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">
            [ 403 ]
          </span>
          <h1 className="font-display text-4xl font-black uppercase tracking-tighter mt-3">
            Acesso restrito
          </h1>
          <p className="text-muted-foreground mt-4">
            Sua conta não tem permissão para o painel administrativo.
          </p>
          <Link
            to="/minha-conta"
            className="inline-block mt-6 border border-border px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
          >
            ← Minha conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-xl font-black tracking-tighter uppercase">
              EXTREME<span className="text-brand">/</span>RACE
            </Link>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-brand">
              [ Admin ]
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/minha-conta"
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Minha conta
            </Link>
            <button
              onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/" }))}
              className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-brand cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter">
              Inscrições
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Painel completo das inscrições da Extreme Race.
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="bg-brand text-brand-foreground px-5 py-3 text-xs font-black uppercase tracking-widest hover:brightness-110 cursor-pointer"
          >
            Exportar CSV ↓
          </button>
        </div>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <Stat label="Total" value={stats.total.toString()} />
          <Stat label="Pagas" value={stats.paid.toString()} accent />
          <Stat label="Pendentes" value={stats.pending.toString()} />
          <Stat
            label="Receita confirmada"
            value={`R$ ${(stats.revenue / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          />
        </section>

        <section className="flex flex-wrap gap-3 mb-6">
          <input
            type="search"
            placeholder="Buscar por nome, e-mail, CPF, equipe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[240px] bg-transparent border border-border px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            className="bg-background border border-border px-4 py-2.5 text-sm focus:border-brand focus:outline-none cursor-pointer"
          >
            <option value="all">Todos status</option>
            <option value="paid">Pagas</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-background border border-border px-4 py-2.5 text-sm focus:border-brand focus:outline-none cursor-pointer"
          >
            <option value="all">Todas categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </section>

        {error && (
          <p className="text-destructive text-sm font-mono mb-4">{error}</p>
        )}

        <div className="border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                <th className="p-3">Atleta</th>
                <th className="p-3">Contato</th>
                <th className="p-3">Categoria</th>
                <th className="p-3">Valor</th>
                <th className="p-3">Inscrito</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhuma inscrição encontrada.
                  </td>
                </tr>
              )}
              {filtered.map((r) => {
                const p = profiles[r.user_id];
                return (
                  <>
                  <tr key={r.id} className="border-t border-border align-top hover:bg-muted/20">
                    <td className="p-3">
                      <div className="font-bold">{p?.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">
                        CPF: {p?.cpf ?? "—"}
                      </div>
                      {p?.shirt_size && (
                        <div className="text-xs text-muted-foreground">
                          Camiseta: {p.shirt_size}
                        </div>
                      )}
                      {r.team_name && (
                        <div className="text-xs text-brand mt-1">Equipe: {r.team_name}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div>{p?.email ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{p?.phone ?? "—"}</div>
                      {p?.emergency_name && (
                        <div className="text-xs text-muted-foreground mt-1">
                          SOS: {p.emergency_name} · {p.emergency_phone ?? "—"}
                        </div>
                      )}
                    </td>
                    <td className="p-3">{r.category_name}</td>
                    <td className="p-3 font-mono">
                      R$ {(r.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      {r.payment_method && (
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {r.payment_method}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      <div>{new Date(r.created_at).toLocaleTimeString("pt-BR")}</div>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={r.payment_status} />
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1 items-end">
                        <button
                          onClick={() =>
                            setExpanded((e) => ({ ...e, [r.id]: !e[r.id] }))
                          }
                          className="text-[10px] font-bold uppercase tracking-widest text-foreground hover:text-brand cursor-pointer"
                        >
                          {expanded[r.id] ? "− Detalhes" : "+ Detalhes"}
                        </button>
                        {r.payment_status !== "paid" && (
                          <button
                            onClick={() => updateStatus(r.id, "paid")}
                            className="text-[10px] font-bold uppercase tracking-widest text-brand hover:underline cursor-pointer"
                          >
                            Marcar pago
                          </button>
                        )}
                        {r.payment_status !== "pending" && (
                          <button
                            onClick={() => updateStatus(r.id, "pending")}
                            className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            Pendente
                          </button>
                        )}
                        {r.payment_status !== "cancelled" && (
                          <button
                            onClick={() => {
                              if (confirm("Cancelar esta inscrição?")) updateStatus(r.id, "cancelled");
                            }}
                            className="text-[10px] font-mono uppercase tracking-widest text-destructive hover:underline cursor-pointer"
                          >
                            Cancelar
                          </button>
                        )}
                        <button
                          onClick={() => deleteRegistration(r.id, p?.full_name ?? "Cliente")}
                          className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:underline cursor-pointer mt-1"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expanded[r.id] && (
                    <tr key={r.id + "-details"} className="border-t border-border bg-muted/10">
                      <td colSpan={7} className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                          <DetailGroup title="Atleta">
                            <DetailItem label="Nome completo" value={p?.full_name} />
                            <DetailItem label="E-mail" value={p?.email} />
                            <DetailItem label="CPF" value={p?.cpf} />
                            <DetailItem label="Telefone" value={p?.phone} />
                            <DetailItem
                              label="Nascimento"
                              value={
                                p?.birth_date
                                  ? new Date(p.birth_date).toLocaleDateString("pt-BR")
                                  : null
                              }
                            />
                            <DetailItem label="Gênero" value={p?.gender} />
                            <DetailItem label="Camiseta" value={p?.shirt_size} />
                          </DetailGroup>
                          <DetailGroup title="Emergência & Equipe">
                            <DetailItem label="Contato SOS" value={p?.emergency_name} />
                            <DetailItem label="Telefone SOS" value={p?.emergency_phone} />
                            <DetailItem label="Equipe" value={r.team_name} />
                            <DetailItem label="Categoria" value={r.category_name} />
                            <DetailItem label="ID da inscrição" value={r.id} mono />
                            <DetailItem label="ID do usuário" value={r.user_id} mono />
                          </DetailGroup>
                          <DetailGroup title="Pagamento">
                            <DetailItem
                              label="Valor"
                              value={`R$ ${(r.price_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                            />
                            <DetailItem label="Status" value={r.payment_status} />
                            <DetailItem label="Método" value={r.payment_method} />
                            <DetailItem label="Referência" value={r.payment_reference} mono />
                            <DetailItem
                              label="Inscrito em"
                              value={new Date(r.created_at).toLocaleString("pt-BR")}
                            />
                            <DetailItem
                              label="Pago em"
                              value={r.paid_at ? new Date(r.paid_at).toLocaleString("pt-BR") : null}
                            />
                          </DetailGroup>
                          {r.athlete_snapshot && Object.keys(r.athlete_snapshot).length > 0 && (
                            <div className="md:col-span-3">
                              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                                Snapshot da inscrição
                              </div>
                              <pre className="bg-background border border-border p-3 text-[11px] font-mono overflow-x-auto whitespace-pre-wrap break-words">
{JSON.stringify(r.athlete_snapshot, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>);
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4 font-mono">
          {filtered.length} de {registrations.length} inscrições
        </p>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border ${accent ? "border-brand" : "border-border"} p-4`}>
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
        {label}
      </div>
      <div className={`font-display text-3xl font-black tracking-tighter mt-1 ${accent ? "text-brand" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "paid" | "pending" | "cancelled" }) {
  const map = {
    paid: { label: "Pago", cls: "bg-brand text-brand-foreground" },
    pending: { label: "Pendente", cls: "border border-border text-foreground" },
    cancelled: { label: "Cancelado", cls: "border border-destructive text-destructive" },
  } as const;
  const s = map[status];
  return (
    <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${s.cls}`}>
      {s.label}
    </span>
  );
}

function DetailGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
        {title}
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground min-w-[120px]">{label}:</dt>
      <dd className={mono ? "font-mono break-all" : "break-words"}>{value || "—"}</dd>
    </div>
  );
}
