import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios");
  console.error("URL:", supabaseUrl);
  console.error("Key:", supabaseServiceKey ? "✓ configurado" : "✗ não configurado");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  try {
    console.log("🔄 Criando usuário de teste...");

    const { data, error } = await supabase.auth.admin.createUser({
      email: "rafael.mendes@example.com",
      password: "1234",
      email_confirm: true,
    });

    if (error) {
      console.error("❌ Erro ao criar usuário:", error.message);
      process.exit(1);
    }

    console.log("✅ Usuário criado com sucesso!");
    console.log("📧 Email: rafael.mendes@example.com");
    console.log("🔑 Senha: 1234");
    console.log("👤 ID: " + data.user.id);
  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
}

createTestUser();
