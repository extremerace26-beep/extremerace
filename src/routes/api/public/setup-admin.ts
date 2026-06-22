import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/setup-admin")({
  server: {
    handlers: {
      GET: async () => {
        return setupAdmin();
      },
      POST: async () => {
        return setupAdmin();
      },
    },
  },
});

async function setupAdmin() {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = "gforcemethodmethod@gmail.com";
    const password = "Extreme@2026";
    const fullName = "GForce Method Admin";

    // 1. List users to see if they exist
    const { data: usersData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (listErr) {
      return new Response(JSON.stringify({ ok: false, error: "List users error: " + listErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const existingUser = usersData.users.find((u) => u.email === email);
    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      // Update password and confirm email
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: password,
        email_confirm: true,
      });
      if (updateErr) {
        return new Response(JSON.stringify({ ok: false, error: "Update user error: " + updateErr.message }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    } else {
      // Create user
      const { data: createData, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createErr || !createData.user) {
        return new Response(JSON.stringify({ ok: false, error: "Create user error: " + (createErr?.message ?? "unknown") }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
      userId = createData.user.id;
    }

    // 2. Ensure profile exists
    const profile = {
      id: userId,
      full_name: fullName,
      email: email,
    };
    const { error: profErr } = await supabaseAdmin.from("profiles").upsert(profile);
    if (profErr) {
      return new Response(JSON.stringify({ ok: false, error: "Profile upsert error: " + profErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    // 3. Ensure role 'admin' is assigned in user_roles table
    const { data: roles, error: rolesGetErr } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", "admin");
    if (rolesGetErr) {
      return new Response(JSON.stringify({ ok: false, error: "Get roles error: " + rolesGetErr.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    if (!roles || roles.length === 0) {
      const { error: roleInsertErr } = await supabaseAdmin.from("user_roles").insert({
        user_id: userId,
        role: "admin",
      });
      if (roleInsertErr) {
        return new Response(JSON.stringify({ ok: false, error: "Insert role error: " + roleInsertErr.message }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, userId, email, role: "admin" }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ ok: false, error: errorMsg }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
