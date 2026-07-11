import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { getCheckoutLinkByCategoryId, CHECKOUT_LINKS } from "@/lib/checkout-links";

type ShirtSize = "P" | "M" | "G" | "GG" | "XGG" | "Sem camiseta";

type CategoryId =
  | "elitePro"
  | "intermediario"
  | "master"
  | "senior"
  | "senior2"
  | "iniciante"
  | "open"
  | "teens"
  | "superKids"
  | "kids"
  | "pcd"
  | "grupo"
  | "economica"
  | "duplaMasc"
  | "duplaFemi"
  | "mista";

type Modalidade = "individual" | "grupo" | "dupla" | "economica";

const MODALIDADES: Array<{ id: Modalidade; title: string; description: string; price: string; subtitle: string }> = [
  {
    id: "individual",
    title: "Inscrição Individual",
    description: "Camiseta oficial, medalha e chip.",
    price: "R$ 129,90",
    subtitle: "Lote até 30/07/2026",
  },
  {
    id: "grupo",
    title: "Inscrição com Desconto",
    description: "Preço por atleta em grupo grande.",
    price: "R$ 119,90",
    subtitle: "Por atleta",
  },
  {
    id: "dupla",
    title: "Inscrição em Dupla",
    description: "Dupla masculina, feminina ou mista.",
    price: "R$ 239,98",
    subtitle: "Valor referente à dupla",
  },
  {
    id: "economica",
    title: "Inscrição Econômica",
    description: "Sem camiseta oficial para preço reduzido.",
    price: "R$ 90,00",
    subtitle: "Lote até 11/07/2026",
  },
];

const DUO_CATEGORIES = ["duplaMasc", "duplaFemi", "mista"] as const;

type DuoCategoryId = (typeof DUO_CATEGORIES)[number];

const CATEGORIES: Record<CategoryId, {
  id: CategoryId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
}> = {
  elitePro: {
    id: "elitePro",
    name: "ELITE PRO 5KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Com premiação em dinheiro.",
  },
  intermediario: {
    id: "intermediario",
    name: "INTERMEDIÁRIO 5KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Categoria para atletas intermediários.",
  },
  master: {
    id: "master",
    name: "MÁSTER 5KM 40+",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Atletas de 40 a 49 anos.",
  },
  senior: {
    id: "senior",
    name: "SÊNIOR 5KM 50+",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Atletas de 50 a 59 anos.",
  },
  senior2: {
    id: "senior2",
    name: "SÊNIOR 2 5KM 60+",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Atletas de 60 anos ou mais.",
  },
  iniciante: {
    id: "iniciante",
    name: "INICIANTE 3KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Destinado a participantes de todas as idades que estão estreando ou novatos.",
  },
  open: {
    id: "open",
    name: "OPEN 5KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Participação sem competitividade; sem chip, com medalha e sem pódio.",
  },
  teens: {
    id: "teens",
    name: "TEENS 3KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Destinado a participantes de 13 a 17 anos.",
  },
  superKids: {
    id: "superKids",
    name: "SUPER KIDS 1KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Para crianças de 9 a 12 anos.",
  },
  kids: {
    id: "kids",
    name: "KIDS 400M",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Para crianças de 5 a 8 anos.",
  },
  pcd: {
    id: "pcd",
    name: "PCD",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Categoria destinada a pessoas com deficiência.",
  },
  grupo: {
    id: "grupo",
    name: "DESCONTO PARA GRUPOS",
    price: 119.9,
    priceLabel: "R$ 119,90",
    description: "Inscrição com desconto para grupos grandes.",
  },
  economica: {
    id: "economica",
    name: "ECONÔMICA 5KM",
    price: 90.0,
    priceLabel: "R$ 90,00",
    description: "Inscrição econômica sem camiseta oficial.",
  },
  duplaMasc: {
    id: "duplaMasc",
    name: "DUPLA MASCULINA (OPEN) 5KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Dupla masculina em categoria open.",
  },
  duplaFemi: {
    id: "duplaFemi",
    name: "DUPLA FEMININA (OPEN) 5KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Dupla feminina em categoria open.",
  },
  mista: {
    id: "mista",
    name: "MISTA (OPEN) 5KM",
    price: 0,
    priceLabel: "R$ a definir",
    description: "Dupla mista em categoria open.",
  },
};

const searchSchema = z.object({
  categoria: z.enum([
    "elitePro",
    "intermediario",
    "master",
    "senior",
    "senior2",
    "iniciante",
    "open",
    "teens",
    "superKids",
    "kids",
    "pcd",
    "grupo",
    "duplaMasc",
    "duplaFemi",
    "mista",
  ]).optional(),
  modalidade: z.enum(["individual", "grupo", "dupla", "economica"]).optional(),
});

export const Route = createFileRoute("/inscricao")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "InscriÃ§Ã£o â€” Extreme Race" },
      { name: "description", content: "Garanta sua vaga na Extreme Race. Escolha sua categoria e finalize sua inscriÃ§Ã£o." },
    ],
  }),
  component: InscricaoPage,
});

const athleteBaseSchema = z.object({
  fullName: z.string().trim().min(3, "Informe seu nome completo").max(120),
  email: z.string().trim().email("E-mail inválido").max(255),
  cpf: z.string().trim().regex(/^\d{3}\.??\d{3}\.??\d{3}-?\d{2}$/, "CPF inválido"),
  birthDate: z.string().refine((v) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 5 && age <= 90;
  }, "Idade mínima 5 anos"),
  teamName: z.string().trim().min(2, "Informe o nome da sua equipe").max(120),
  street: z.string().trim().min(3, "Informe a rua").max(120),
  streetNumber: z.string().trim().min(1, "Informe o número").max(20),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().min(2, "Informe o bairro").max(120),
  city: z.string().trim().min(2, "Informe a cidade").max(120),
  state: z.string().trim().min(2, "Informe o estado").max(120),
  zipCode: z.string().trim().min(8, "Informe o CEP").max(10, "CEP inválido"),
  emergencyName: z.string().trim().min(3, "Informe o nome do contato de emergência").max(120),
  emergencyPhone: z.string().trim().min(10, "Telefone de emergência inválido").max(20),
  observation: z.string().trim().max(500).optional(),
  phone: z.string().trim().min(10, "Telefone inválido").max(20),
  acceptTerms: z.literal(true, { message: "Você precisa aceitar o regulamento e os termos" }),
});

const duoParticipantSchema = z.object({
  participant2FullName: z.string().trim().min(3, "Informe o nome completo do segundo atleta").max(120),
  participant2Cpf: z.string().trim().regex(/^\d{3}\.??\d{3}\.??\d{3}-?\d{2}$/, "CPF inválido"),
  participant2BirthDate: z.string().refine((v) => {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 5 && age <= 90;
  }, "Idade mínima 5 anos"),
});

const passwordAndShirtSchema = z.object({
  password: z.string().min(6, "Senha com no mínimo 6 caracteres"),
  shirtSize: z.enum(["P", "M", "G", "GG", "XGG", "Sem camiseta"] as const),
});

const duoPasswordAndShirtSchema = passwordAndShirtSchema.extend({
  participant2ShirtSize: z.enum(["P", "M", "G", "GG"] as const),
});

const athleteSchema = athleteBaseSchema.merge(duoParticipantSchema.partial());

type AthleteData = z.infer<typeof athleteSchema>;const STORAGE_KEY = "extreme-race:inscricao";

function InscricaoPage() {
  const navigate = useNavigate();
  const { categoria, modalidade } = Route.useSearch();
  const initialCategory = categoria ?? (modalidade === "grupo" ? "grupo" : null);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initialCategory ? 2 : 1);
  const [selected, setSelected] = useState<CategoryId | null>(initialCategory);
  const [form, setForm] = useState<Partial<AthleteData> & { categoria?: CategoryId; modalidade?: Modalidade }>({ categoria: initialCategory ?? undefined, modalidade: modalidade ?? undefined });
  const [startModalidade] = useState<Modalidade | undefined>(modalidade ?? undefined);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const cat = form.categoria ? CATEGORIES[form.categoria] : null;
  const isDuo = cat ? (DUO_CATEGORIES as readonly CategoryId[]).includes(cat.id) : false;

  const set = <K extends keyof AthleteData>(k: K, v: AthleteData[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  function handleSelectCategory(id: CategoryId) {
    setSelected(id);
    setForm((f) => ({ ...f, categoria: id }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.categoria;
      return next;
    });
    setStep(2);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmitData(e: React.FormEvent) {
    e.preventDefault();
    const validationSchema = isDuo
      ? athleteBaseSchema.merge(duoParticipantSchema)
      : athleteBaseSchema;

    const parsed = validationSchema.safeParse(form);
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

  function handleSubmitShirt(e: React.FormEvent) {
    e.preventDefault();
    const validationSchema = isDuo ? duoPasswordAndShirtSchema : passwordAndShirtSchema;
    const parsed = validationSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path.join(".")] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStep(4);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleGoToCheckout() {
    if (!cat || !form) return;
    setIsSubmitting(true);
    setPaymentError(null);

    try {
      const payload = {
        category: cat,
        athlete: form,
        modalidade: startModalidade,
        createdAt: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        let checkoutLink: string | null = null;
        if (startModalidade) {
          checkoutLink = CHECKOUT_LINKS[startModalidade] ?? null;
        } else {
          checkoutLink = getCheckoutLinkByCategoryId(cat.id);
        }

        if (checkoutLink) {
          window.open(checkoutLink, "_blank", "noopener,noreferrer");
          return;
        }

        navigate({ to: "/checkout", search: { status: "success" } });
      }
    } catch (error) {
      console.error("[Checkout] preference creation failed", error);
      setPaymentError(error instanceof Error ? error.message : "Erro ao iniciar o pagamento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <header className="border-b border-border bg-background/95 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center">
            <img src={logo} alt="Extreme Race" className="h-14 md:h-16 object-contain" />
          </Link>
          <Link to="/" className="font-mono text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
        {[
          { n: 1, label: "Categoria" },
          { n: 2, label: "Dados do atleta" },
          { n: 3, label: "Camiseta" },
          { n: 4, label: "Confirmação" },
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
            {i < 3 && <div className={`flex-1 h-px ${step > s.n ? "bg-brand" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {step === 1 && (
          <section>
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Passo 01 ]</span>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-12">
              Escolha sua <span className="text-brand italic">categoria</span>
            </h1>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!selected) {
                  setErrors((prev) => ({ ...prev, categoria: "Selecione a categoria" }));
                  return;
                }
                setForm((f) => ({ ...f, categoria: selected }));
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.categoria;
                  return next;
                });
                setStep(2);
                if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="space-y-8"
            >
              <Field label="Categorias" error={errors.categoria}>
                <select
                  value={selected ?? ""}
                  onChange={(e) => setSelected(e.target.value as CategoryId)}
                  className={inputCls}
                >
                  <option value="">Selecione</option>
                  {Object.values(CATEGORIES).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="rounded border border-border p-6 bg-background/50">
                <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  Categorias disponíveis
                </p>
                <ul className="grid gap-4 text-sm text-foreground">
                  {Object.values(CATEGORIES).map((c) => (
                    <li key={c.id} className="border border-border rounded px-4 py-3">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-muted-foreground text-xs">{c.description}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all"
                >
                  Continuar →
                </button>
              </div>
            </form>
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
                <Field label="E-mail" error={errors.email}>
                  <input
                    type="email"
                    value={form.email ?? ""}
                    onChange={(e) => set("email", e.target.value)}
                    className={inputCls}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Equipe / Assessoria" error={errors.teamName}>
                  <input
                    type="text"
                    placeholder="Nome da sua equipe"
                    value={form.teamName ?? ""}
                    onChange={(e) => set("teamName", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="WhatsApp" error={errors.phone}>
                  <input
                    type="tel"
                    placeholder="(11) 90000-0000"
                    value={form.phone ?? ""}
                    onChange={(e) => set("phone", e.target.value)}
                    className={inputCls}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="CEP" error={errors.zipCode}>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={form.zipCode ?? ""}
                    onChange={(e) => set("zipCode", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Rua" error={errors.street}>
                  <input
                    type="text"
                    value={form.street ?? ""}
                    onChange={(e) => set("street", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Número" error={errors.streetNumber}>
                  <input
                    type="text"
                    value={form.streetNumber ?? ""}
                    onChange={(e) => set("streetNumber", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Complemento" error={errors.complement}>
                  <input
                    type="text"
                    value={form.complement ?? ""}
                    onChange={(e) => set("complement", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Bairro" error={errors.neighborhood}>
                  <input
                    type="text"
                    value={form.neighborhood ?? ""}
                    onChange={(e) => set("neighborhood", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Cidade" error={errors.city}>
                  <input
                    type="text"
                    value={form.city ?? ""}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Estado" error={errors.state}>
                  <input
                    type="text"
                    value={form.state ?? ""}
                    onChange={(e) => set("state", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Contato de emergência" error={errors.emergencyName}>
                  <input
                    type="text"
                    placeholder="Nome do responsável"
                    value={form.emergencyName ?? ""}
                    onChange={(e) => set("emergencyName", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Telefone de emergência" error={errors.emergencyPhone}>
                  <input
                    type="tel"
                    placeholder="(11) 90000-0000"
                    value={form.emergencyPhone ?? ""}
                    onChange={(e) => set("emergencyPhone", e.target.value)}
                    className={inputCls}
                  />
                </Field>
                <Field label="Observação" error={errors.observation} className="md:col-span-2">
                  <textarea
                    value={form.observation ?? ""}
                    onChange={(e) => set("observation", e.target.value)}
                    className="w-full min-h-[120px] bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                    placeholder="Alguma informação complementar sobre sua inscrição"
                  />
                </Field>
              </FieldGrid>

              {isDuo && (
                <div className="mt-12 border-t border-border pt-10">
                  <h2 className="font-display text-3xl font-black uppercase tracking-tight mb-8">
                    Dados do segundo participante
                  </h2>

                  <FieldGrid>
                    <Field label="Nome completo" error={errors.participant2FullName} className="md:col-span-2">
                      <input
                        type="text"
                        value={form.participant2FullName ?? ""}
                        onChange={(e) => set("participant2FullName", e.target.value)}
                        className={inputCls}
                        autoComplete="name"
                      />
                    </Field>
                    <Field label="CPF" error={errors.participant2Cpf}>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="000.000.000-00"
                        value={form.participant2Cpf ?? ""}
                        onChange={(e) => set("participant2Cpf", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Data de nascimento" error={errors.participant2BirthDate}>
                      <input
                        type="date"
                        value={form.participant2BirthDate ?? ""}
                        onChange={(e) => set("participant2BirthDate", e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </FieldGrid>
                </div>
              )}

              <label className="flex flex-col gap-3 cursor-pointer">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms === true}
                    onChange={(e) => set("acceptTerms", e.target.checked as true)}
                    className="mt-1 size-4 accent-brand cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    Li e aceito o <a href="/regulamento.pdf" download target="_blank" rel="noopener noreferrer" className="text-brand underline">regulamento</a> e o <a href="/termo-responsabilidade.pdf" download target="_blank" rel="noopener noreferrer" className="text-brand underline">termo de responsabilidade</a>, e autorizo o uso da minha imagem para divulgação do evento.
                  </span>
                </div>
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
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-4">
              Defina sua <span className="text-brand italic">senha</span> e escolha a camiseta
            </h1>
            <p className="text-muted-foreground mb-10">
              Para concluir sua inscriÃ§Ã£o, cadastre uma senha para a Ã¡rea do atleta e selecione o tamanho da camiseta.
            </p>

            <form onSubmit={handleSubmitShirt} className="space-y-8" noValidate>
              <FieldGrid>
                <Field label="Senha" error={errors.password} className="md:col-span-2">
                  <input
                    type="password"
                    value={form.password ?? ""}
                    onChange={(e) => set("password", e.target.value)}
                    className={inputCls}
                    minLength={6}
                  />
                </Field>
                {cat && cat.id !== "economica" && (
                  <Field label="Tamanho da camiseta" error={errors.shirtSize} className="md:col-span-2">
                    <select
                      value={form.shirtSize ?? ""}
                      onChange={(e) => set("shirtSize", e.target.value as AthleteData["shirtSize"])}
                      className={inputCls}
                    >
                      <option value="">Selecione</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XGG">XGG</option>
                      <option value="Sem camiseta">Sem camiseta</option>
                    </select>
                  </Field>
                )}
                {isDuo && cat && cat.id !== "economica" && (
                  <Field label="Tamanho da camiseta do segundo atleta" error={errors.participant2ShirtSize} className="md:col-span-2">
                    <select
                      value={form.participant2ShirtSize ?? ""}
                      onChange={(e) => set("participant2ShirtSize", e.target.value as AthleteData["participant2ShirtSize"])}
                      className={inputCls}
                    >
                      <option value="">Selecione</option>
                      <option value="P">P</option>
                      <option value="M">M</option>
                      <option value="G">G</option>
                      <option value="GG">GG</option>
                      <option value="XGG">XGG</option>
                      <option value="Sem camiseta">Sem camiseta</option>
                    </select>
                  </Field>
                )}
              </FieldGrid>

              <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-8 py-4 text-xs font-black uppercase tracking-widest border border-border hover:bg-foreground hover:text-background transition-all cursor-pointer"
                >
                  ← Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all cursor-pointer"
                >
                  Continuar →
                </button>
              </div>
            </form>
          </section>
        )}

        {step === 4 && cat && (
          <section>
            <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">[ Passo 04 ]</span>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tighter mt-3 mb-10">
              Confirme sua <span className="text-brand italic">inscriÃ§Ã£o</span>
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
                <SummaryItem label="Atleta 1" value={form.fullName} />
                <SummaryItem label="E-mail" value={form.email} />
                <SummaryItem label="CPF 1" value={form.cpf} />
                <SummaryItem label="Data nasc 1" value={form.birthDate} />
                <SummaryItem label="Grupo" value={form.group} />
                <SummaryItem label="WhatsApp" value={form.phone} />
                {cat && cat.id !== "economica" && <SummaryItem label="Camiseta 1" value={form.shirtSize} />}
                {isDuo && <SummaryItem label="Atleta 2" value={form.participant2FullName} />}
                {isDuo && <SummaryItem label="CPF 2" value={form.participant2Cpf} />}
                {isDuo && <SummaryItem label="Data nasc 2" value={form.participant2BirthDate} />}
                {isDuo && cat && cat.id !== "economica" && <SummaryItem label="Camiseta 2" value={form.participant2ShirtSize} />}
              </dl>
            </div>

            {paymentError && <p className="text-destructive text-xs font-mono mt-4">{paymentError}</p>}

            <div className="flex flex-col-reverse sm:flex-row gap-4 mt-6">
              <button
                onClick={() => setStep(2)}
                className="px-8 py-4 text-xs font-black uppercase tracking-widest border border-border hover:bg-foreground hover:text-background transition-all cursor-pointer"
              >
                ← Editar dados
              </button>
              <button
                onClick={handleGoToCheckout}
                disabled={isSubmitting}
                className="flex-1 py-4 text-xs font-black uppercase tracking-widest bg-brand text-brand-foreground hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Processando..." : "Ir para pagamento →"}
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
      <dd className="text-foreground font-medium">{value || "â€”"}</dd>
    </div>
  );
}


