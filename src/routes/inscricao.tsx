import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

type CategoryId = "elite" | "open" | "equipes";

const CATEGORIES: Record<CategoryId, {
  id: CategoryId;
  badge: string;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  features: string[];
  highlight?: boolean;
}> = {
  elite: {
    id: "elite",
    badge: "Competitivo",
    name: "Elite",
    price: 249,
    priceLabel: "R$ 249",
    description: "Para atletas que disputam o pódio.",
    features: ["Largada 07:00", "Premiação Top 5", "Chip de cronometragem"],
    highlight: true,
  },
  open: {
    id: "open",
    badge: "Superação",
    name: "Open",
    price: 189,
    priceLabel: "R$ 189",
    description: "Para quem corre contra si mesmo.",
    features: ["Largadas em ondas", "Medalha finisher", "Foto profissional"],
  },
  equipes: {
    id: "equipes",
    badge: "Comunidade",
    name: "Equipes",
    price: 159,
    priceLabel: "R$ 159 /atleta",
    description: "Mínimo 5 pessoas. Box, empresa ou amigos.",
    features: ["Tenda exclusiva", "Desconto progressivo", "Ranking de equipe"],
  },
};

const searchSchema = z.object({
  categoria: z.enum(["elite", "open", "equipes"]).optional(),
});

export const Route = createFileRoute("/inscricao")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Inscrição — Extreme Race" },
      { name: "description", content: "Garanta sua vaga na Extreme Race. Escolha sua categoria e finalize sua inscrição." },
    ],
  }),
  component: InscricaoPage,
});

const athleteSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo").max(120),
  cpf: z.string().trim().regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF inválido"),
  birthDate: z.string().refine((v) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 16 && age <= 90;
  }, "Idade mínima 16 anos"),
  gender: z.enum(["M", "F", "O"], { message: "Selecione" }),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  emergencyName: z.string().trim().min(3, "Informe o contato de emergência").max(120),
  emergencyPhone: z.string().trim().min(10, "Telefone inválido").max(20),
  shirtSize: z.enum(["PP", "P", "M", "G", "GG", "XGG"], { message: "Selecione" }),
  teamName: z.string().trim().max(80).optional().or(z.literal("")),
  acceptTerms: z.literal(true, { message: "Você precisa aceitar o regulamento" }),
});

type AthleteData = z.infer<typeof athleteSchema>;

const STORAGE_KEY = "extreme-race:inscricao";

function InscricaoPage() {
  const navigate = useNavigate();
  const { categoria } = Route.useSearch();
  const [step, setStep] = useState<1 | 2 | 3>(categoria ? 2 : 1);
  const [selected, setSelected] = useState<CategoryId | null>(categoria ?? null);
  const [form, setForm] = useState<Partial<AthleteData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cat = selected ? CATEGORIES[selected] : null;

  const set = <K extends keyof AthleteData>(k: K, v: AthleteData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  function handleSelectCategory(id: CategoryId) {
    setSelected(id);
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmitData(e: React.FormEvent) {
    e.preventDefault();
    const parsed = athleteSchema.safeParse({
      ...form,
      teamName: form.teamName ?? "",
    });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep(3);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleGoToCheckout() {
    if (!cat || !form) return;
    const payload = { category: cat, athlete: form, createdAt: new Date().toISOString() };
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
    navigate({ to: "/checkout" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="border-b border-border bg-background/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-black tracking-tighter uppercase">
            EXTREME<span className="text-brand">/</span>RACE
          </Link>
          <Link to="/" className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
        </div>
      </header>

      {/* PROGRESS */}
      <div className="border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          {[
            { n: 1, label: "Categoria" },
            { n: 2, label: "Dados do atleta" },
            { n: 3, label: "Confirmação" },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`size-8 grid place-items-center font-display font-black text-sm border ${
                    step >= s.n
                      ? "bg-brand text-brand-foreground border-brand"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {s.n}
                </div>
                <span
                  className={`font-mono text-[10px] tracking-[0.2em] uppercase hidden sm:block ${
                    step >= s.n ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${step > s.n ? "bg-brand" : "bg-border"}`} />}
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {step === 1 && (
          <section>
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Passo 01 ]</span>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-12">
              Escolha sua <span className="text-brand italic">categoria</span>
            </h1>

            <div className="grid md:grid-cols-3 gap-6">
              {Object.values(CATEGORIES).map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleSelectCategory(c.id)}
                  className={`text-left p-8 border bg-background flex flex-col transition-all hover:border-brand cursor-pointer ${
                    c.highlight ? "border-brand" : "border-border"
                  }`}
                >
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    {c.badge}
                  </span>
                  <h3 className="font-display text-4xl font-black uppercase mt-2 tracking-tight">
                    {c.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
                  <div className="my-6 font-display text-4xl font-black">{c.priceLabel}</div>
                  <ul className="space-y-2 text-sm flex-grow">
                    {c.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="size-1.5 bg-brand mt-2 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 font-mono text-xs tracking-[0.2em] uppercase text-brand">
                    Selecionar →
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && cat && (
          <section>
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Passo 02 ]</span>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-2">
              Dados do <span className="text-brand italic">atleta</span>
            </h1>
            <p className="text-muted-foreground mb-10">
              Categoria selecionada:{" "}
              <button
                onClick={() => setStep(1)}
                className="text-foreground font-bold underline underline-offset-4 hover:text-brand cursor-pointer"
              >
                {cat.name} — {cat.priceLabel}
              </button>
            </p>

            <form onSubmit={handleSubmitData} className="space-y-8" noValidate>
              <FieldGrid>
                <Field label="Nome completo" error={errors.fullName} className="md:col-span-2">
                  <input
                    type="text"
                    value={form.fullName ?? ""}
                    onChange={(e) => set("fullName", e.target.value)}
                    className={inputCls}
                    autoComplete="name"
                  />
                </Field>
                <Field label="CPF" error={errors.cpf}>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000.000.000-00"
                    value={form.cpf ?? ""}
                    onChange={(e) => set("cpf", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Data de nascimento" error={errors.birthDate}>
                  <input
                    type="date"
                    value={form.birthDate ?? ""}
                    onChange={(e) => set("birthDate", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Gênero" error={errors.gender}>
                  <select
                    value={form.gender ?? ""}
                    onChange={(e) => set("gender", e.target.value as AthleteData["gender"])}
                    className={inputCls}
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </Field>
                <Field label="Tamanho da camisa" error={errors.shirtSize}>
                  <select
                    value={form.shirtSize ?? ""}
                    onChange={(e) => set("shirtSize", e.target.value as AthleteData["shirtSize"])}
                    className={inputCls}
                  >
                    <option value="">Selecione</option>
                    {["PP", "P", "M", "G", "GG", "XGG"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="E-mail" error={errors.email}>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Telefone (WhatsApp)" error={errors.phone}>
                  <input
                    type="tel"
                    placeholder="(11) 90000-0000"
                    value={form.phone ?? ""}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls}
                    autoComplete="tel"
                  />
                </Field>
              </FieldGrid>

              <div className="border-t border-border pt-8">
                <h3 className="font-display text-lg font-black uppercase tracking-widest mb-6">
                  Contato de emergência
                </h3>
                <FieldGrid>
                  <Field label="Nome" error={errors.emergencyName}>
                    <input
                      type="text"
                      value={form.emergencyName ?? ""}
                      onChange={(e) => set("emergencyName", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Telefone" error={errors.emergencyPhone}>
                    <input
                      type="tel"
                      value={form.emergencyPhone ?? ""}
                      onChange={(e) => set("emergencyPhone", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </FieldGrid>
              </div>

              {cat.id === "equipes" && (
                <div className="border-t border-border pt-8">
                  <Field label="Nome da equipe" error={errors.teamName}>
                    <input
                      type="text"
                      value={form.teamName ?? ""}
                      onChange={(e) => set("teamName", e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                </div>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptTerms === true}
                  onChange={(e) => set("acceptTerms", e.target.checked as true)}
                  className="mt-1 size-4 accent-brand cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  Li e aceito o regulamento, o termo de responsabilidade e autorizo o uso da minha
                  imagem para divulgação do evento.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-destructive text-xs font-mono">{errors.acceptTerms}</p>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-4 text-xs font-black uppercase tracking-widest border border-border hover:bg-foreground hover:text-background transition-all cursor-pointer"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all cursor-pointer"
                >
                  Revisar inscrição →
                </button>
              </div>
            </form>
          </section>
        )}

        {step === 3 && cat && (
          <section>
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Passo 03 ]</span>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-10">
              Confirme sua <span className="text-brand italic">inscrição</span>
            </h1>

            <div className="border border-border p-8 mb-6">
              <div className="flex items-baseline justify-between border-b border-border pb-6 mb-6">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Categoria
                  </span>
                  <h2 className="font-display text-4xl font-black uppercase tracking-tight">
                    {cat.name}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Total
                  </span>
                  <div className="font-display text-4xl font-black text-brand">{cat.priceLabel}</div>
                </div>
              </div>

              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <SummaryItem label="Atleta" value={form.fullName} />
                <SummaryItem label="CPF" value={form.cpf} />
                <SummaryItem label="Nascimento" value={form.birthDate} />
                <SummaryItem label="E-mail" value={form.email} />
                <SummaryItem label="Telefone" value={form.phone} />
                <SummaryItem label="Camisa" value={form.shirtSize} />
                <SummaryItem label="Emergência" value={`${form.emergencyName} — ${form.emergencyPhone}`} />
                {form.teamName ? <SummaryItem label="Equipe" value={form.teamName} /> : null}
              </dl>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 text-xs font-black uppercase tracking-widest border border-border hover:bg-foreground hover:text-background transition-all cursor-pointer"
              >
                ← Editar dados
              </button>
              <button
                onClick={handleGoToCheckout}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all cursor-pointer"
              >
                Ir para pagamento →
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-border px-4 h-12 text-sm focus:outline-none focus:border-brand transition-colors";

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2 gap-6">{children}</div>;
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground block mb-2">
        {label}
      </span>
      {children}
      {error && <span className="block text-destructive text-xs font-mono mt-1">{error}</span>}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="text-foreground font-medium">{value || "—"}</dd>
    </div>
  );
}
