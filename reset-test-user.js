import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Variáveis de ambiente não configuradas");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword() {
  try {
    console.log("🔄 Buscando usuário...");

    // Primeiro, obter o usuário
    const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
    
    if (searchError) {
      console.error("❌ Erro ao listar usuários:", searchError.message);
      process.exit(1);
    }

    const user = users.users.find(u => u.email === "rafael.mendes@example.com");
    
    if (!user) {
      console.error("❌ Usuário não encontrado");
      process.exit(1);
    }

    console.log("✅ Usuário encontrado:", user.id);
    console.log("🔄 Deletando usuário...");

    // Deletar o usuário
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    
    if (deleteError) {
      console.error("❌ Erro ao deletar:", deleteError.message);
      process.exit(1);
    }

    console.log("✅ Usuário deletado");
    console.log("🔄 Criando novo usuário com senha 1234...");

    // Recriar o usuário
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: "rafael.mendes@example.com",
      password: "1234",
      email_confirm: true,
    });

    if (createError) {
      console.error("❌ Erro ao criar usuário:", createError.message);
      process.exit(1);
    }

    console.log("✅ Usuário criado com sucesso!");
    console.log("📧 Email: rafael.mendes@example.com");
    console.log("🔑 Senha: 1234");
    console.log("👤 ID: " + newUser.user.id);
  } catch (err) {
    console.error("❌ Erro:", err);
    process.exit(1);
  }
}

resetPassword();
