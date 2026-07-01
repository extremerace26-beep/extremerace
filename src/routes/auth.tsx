import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
  const [mode, setMode] = useState<"signin" | "signup">(
    initialMode ?? (redirect === "/checkout" ? "signup" : "signin")
  );
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


