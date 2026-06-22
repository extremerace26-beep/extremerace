import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/seed-admin-password")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = new URL(request.url).searchParams.get("token");
        if (token !== "extreme-seed-2026") {
          return new Response("Forbidden", { status: 403 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const userId = "bb667913-3c4e-4d9f-bfd5-a5596282ba7f";
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: "Extreme@2026",
          email_confirm: true,
        });
        if (error) return new Response(error.message, { status: 500 });
        return new Response("ok");
      },
    },
  },
});
