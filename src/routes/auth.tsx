import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["signin", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Entrar — Extreme Race" },
      { name: "description", content: "Acesse sua área de atleta da Extreme Race." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect, mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/minha-conta" });
    });
  }, [navigate, redirect]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirect ?? "/minha-conta"}`,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        setInfo("Conta criada! Verifique seu e-mail para confirmar e entre em seguida.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect ?? "/minha-conta" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + (redirect ?? "/minha-conta"),
    });
    if (result.error) {
      setError(result.error.message || "Erro com Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: redirect ?? "/minha-conta" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background relative overflow-hidden">
        <Link to="/" className="font-display text-2xl font-black tracking-tighter uppercase relative z-10">
          EXTREME<span className="text-brand">/</span>RACE
        </Link>
        <div className="relative z-10">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-brand">[ Área do atleta ]</span>
          <h1 className="font-display text-6xl font-black uppercase tracking-tighter mt-4">
            Sua corrida começa <span className="text-brand italic">aqui</span>
          </h1>
          <p className="opacity-70 mt-6 max-w-md">
            Acompanhe sua inscrição, baixe seu comprovante e atualize seus dados antes da largada.
          </p>
        </div>
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase opacity-50 relative z-10">
          © Extreme Race
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,oklch(0.62_0.24_25/0.25),transparent_60%)]" />
      </aside>

      <main className="flex flex-col justify-center px-6 py-16 md:px-16 max-w-xl mx-auto w-full">
        <Link to="/" className="lg:hidden font-display text-2xl font-black tracking-tighter uppercase mb-8">
          EXTREME<span className="text-brand">/</span>RACE
        </Link>
        <span className="text-brand font-mono text-xs tracking-[0.3em] uppercase">
          [ {mode === "signin" ? "Entrar" : "Criar conta"} ]
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tighter mt-3 mb-8">
          {mode === "signin" ? "Acesse sua conta" : "Crie sua conta"}
        </h2>

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="w-full border border-border py-3.5 text-sm font-bold uppercase tracking-widest hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
        >
          <GoogleIcon /> Continuar com Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">ou</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-4" noValidate>
          {mode === "signup" && (
            <Field label="Nome completo">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputCls}
                autoComplete="name"
              />
            </Field>
          )}
          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              autoComplete="email"
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputCls}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </Field>

          {error && <p className="text-destructive text-xs font-mono">{error}</p>}
          {info && <p className="text-brand text-xs font-mono">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-brand-foreground py-3.5 text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? "..." : mode === "signin" ? "Entrar →" : "Criar conta →"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-8 text-center">
          {mode === "signin" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="text-foreground font-bold underline underline-offset-4 hover:text-brand cursor-pointer"
          >
            {mode === "signin" ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </main>
    </div>
  );
}

const inputCls =
  "w-full bg-transparent border border-border px-4 py-3 text-sm focus:border-brand focus:outline-none transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground block mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
