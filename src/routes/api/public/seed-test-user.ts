import { createFileRoute } from "@tanstack/react-router";

type Seed = {
  email: string;
  password: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  gender: string;
  phone: string;
  shirt_size: string;
  emergency_name: string;
  emergency_phone: string;
  category_id: string;
  category_name: string;
  price_cents: number;
  team_name: string | null;
  payment_status: "paid" | "pending" | "cancelled";
  payment_method: string | null;
  payment_reference: string | null;
};

const SEEDS: Seed[] = [
  {
    email: "atleta.teste@extremerace.com",
    password: "Teste@2026",
    full_name: "Atleta Teste",
    cpf: "123.456.789-00",
    birth_date: "1995-05-20",
    gender: "M",
    phone: "(11) 99999-0000",
    shirt_size: "M",
    emergency_name: "Contato Emergência",
    emergency_phone: "(11) 98888-0000",
    category_id: "individual-5k",
    category_name: "Individual 5K",
    price_cents: 12000,
    team_name: null,
    payment_status: "paid",
    payment_method: "pix",
    payment_reference: "TEST-PIX-0001",
  },
  {
    email: "mariana.silva@example.com",
    password: "Teste@2026",
    full_name: "Mariana Silva",
    cpf: "987.654.321-00",
    birth_date: "1992-03-12",
    gender: "F",
    phone: "(21) 98888-1212",
    shirt_size: "P",
    emergency_name: "Pedro Silva",
    emergency_phone: "(21) 97777-1212",
    category_id: "individual-10k",
    category_name: "Individual 10K",
    price_cents: 18000,
    team_name: null,
    payment_status: "paid",
    payment_method: "credit_card",
    payment_reference: "TEST-CC-0002",
  },
  {
    email: "lucas.oliveira@example.com",
    password: "Teste@2026",
    full_name: "Lucas Oliveira",
    cpf: "111.222.333-44",
    birth_date: "1988-11-02",
    gender: "M",
    phone: "(31) 96666-3344",
    shirt_size: "G",
    emergency_name: "Ana Oliveira",
    emergency_phone: "(31) 95555-3344",
    category_id: "team-relay",
    category_name: "Revezamento em Equipe",
    price_cents: 24000,
    team_name: "Os Indomáveis",
    payment_status: "pending",
    payment_method: "pix",
    payment_reference: "TEST-PIX-0003",
  },
  {
    email: "juliana.costa@example.com",
    password: "Teste@2026",
    full_name: "Juliana Costa",
    cpf: "555.666.777-88",
    birth_date: "1999-07-22",
    gender: "F",
    phone: "(41) 94444-7788",
    shirt_size: "M",
    emergency_name: "Marcos Costa",
    emergency_phone: "(41) 93333-7788",
    category_id: "individual-5k",
    category_name: "Individual 5K",
    price_cents: 12000,
    team_name: null,
    payment_status: "pending",
    payment_method: null,
    payment_reference: null,
  },
  {
    email: "rafael.mendes@example.com",
    password: "Teste@2026",
    full_name: "Rafael Mendes",
    cpf: "222.333.444-55",
    birth_date: "1985-01-30",
    gender: "M",
    phone: "(51) 92222-4455",
    shirt_size: "GG",
    emergency_name: "Carla Mendes",
    emergency_phone: "(51) 91111-4455",
    category_id: "individual-10k",
    category_name: "Individual 10K",
    price_cents: 18000,
    team_name: null,
    payment_status: "cancelled",
    payment_method: "pix",
    payment_reference: "TEST-PIX-0005",
  },
];

export const Route = createFileRoute("/api/public/seed-test-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (token !== "extreme-seed-2026") {
          return new Response("Forbidden", { status: 403 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const list = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
        if (list.error) return new Response(list.error.message, { status: 500 });

        const results: Array<{ email: string; userId: string }> = [];
        for (const s of SEEDS) {
          let userId: string;
          const existing = list.data.users.find((u) => u.email === s.email);
          if (existing) {
            userId = existing.id;
            await supabaseAdmin.auth.admin.updateUserById(userId, {
              password: s.password,
              email_confirm: true,
            });
          } else {
            const created = await supabaseAdmin.auth.admin.createUser({
              email: s.email,
              password: s.password,
              email_confirm: true,
              user_metadata: { full_name: s.full_name },
            });
            if (created.error || !created.data.user) {
              return new Response(`create ${s.email}: ${created.error?.message}`, { status: 500 });
            }
            userId = created.data.user.id;
          }

          const profile = {
            id: userId,
            full_name: s.full_name,
            email: s.email,
            cpf: s.cpf,
            birth_date: s.birth_date,
            gender: s.gender,
            phone: s.phone,
            shirt_size: s.shirt_size,
            emergency_name: s.emergency_name,
            emergency_phone: s.emergency_phone,
          };
          const { error: profErr } = await supabaseAdmin.from("profiles").upsert(profile);
          if (profErr) return new Response(`profile ${s.email}: ${profErr.message}`, { status: 500 });

          const { data: regs } = await supabaseAdmin
            .from("registrations")
            .select("id")
            .eq("user_id", userId)
            .limit(1);
          if (!regs || regs.length === 0) {
            const { error: regErr } = await supabaseAdmin.from("registrations").insert({
              user_id: userId,
              category_id: s.category_id,
              category_name: s.category_name,
              price_cents: s.price_cents,
              team_name: s.team_name,
              payment_status: s.payment_status,
              payment_method: s.payment_method,
              payment_reference: s.payment_reference,
              paid_at: s.payment_status === "paid" ? new Date().toISOString() : null,
              athlete_snapshot: profile,
            });
            if (regErr) return new Response(`reg ${s.email}: ${regErr.message}`, { status: 500 });
          }
          results.push({ email: s.email, userId });
        }

        return new Response(JSON.stringify({ ok: true, seeded: results }), {
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
