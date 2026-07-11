import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const searchSchema = z.object({
  redirect: z.string().optional(),
  returnTo: z.string().optional(),
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
  const { redirect, returnTo, mode: initialMode } = Route.useSearch();
  const redirectTo = redirect ?? returnTo;
  const [mode, setMode] = useState<"signin" | "signup">(
    initialMode ?? (redirectTo === "/checkout" ? "signup" : "signin")
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirectTo ?? "/minha-conta" });
    });
  }, [navigate, redirectTo]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo ?? "/minha-conta"}`,
            data: { full_name: fullName },
          },
        });

        const signUpErrorMessage = error?.message?.toLowerCase() || "";
        const signUpRateLimitError = signUpErrorMessage.includes("rate limit") || signUpErrorMessage.includes("email rate limit");

        if (error && !signUpRateLimitError) throw error;

        if (!error || signUpRateLimitError) {
          if (signUpRateLimitError) {
            console.warn("[Auth] signUp skipped due to email rate limit, falling back to server-side creation", error?.message);
          }

          // Try to sign in immediately in case email confirmation is not required
          try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) {
              // If sign in fails (e.g., still requires confirmation), try server-side confirmed creation as fallback
              try {
                const resp = await fetch("/.netlify/functions/create-user-confirmed", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email, password, athlete: { fullName } }),
                });
                const text = await resp.text();
                let json: { error?: string } | null = null;
                try {
                  json = JSON.parse(text);
                } catch {
                  json = null;
                }
                if (!resp.ok) {
                  const message = json?.error || text || `Falha do servidor (${resp.status})`;
                  console.warn("create-user-confirmed failed", { status: resp.status, body: message });
                  setError(message);
                } else {
                  const { error: signInAfter } = await supabase.auth.signInWithPassword({ email, password });
                  if (signInAfter) {
                    console.warn("signIn after create-user-confirmed failed", signInAfter);
                    setError("Conta criada, mas login automático falhou. Tente fazer login manualmente.");
                  } else {
                    navigate({ to: redirectTo ?? "/minha-conta" });
                  }
                }
              } catch (e) {
                console.warn("create-user-confirmed request failed", e);
                setError("Falha ao criar usuário automaticamente. Verifique seu e-mail ou tente novamente.");
              }
            } else {
              navigate({ to: redirectTo ?? "/minha-conta" });
            }
          } catch (e) {
            setInfo("Conta criada. Verifique seu e-mail se for necessário para ativar a conta.");
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirectTo ?? "/minha-conta" });
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
        <Link to="/" className="inline-flex items-center relative z-10">
          <img src={logo} alt="Extreme Race" className="h-14 md:h-16 object-contain" />
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
        <Link to="/" className="lg:hidden inline-flex items-center mb-8">
          <img src={logo} alt="Extreme Race" className="h-14 md:h-16 object-contain" />
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


