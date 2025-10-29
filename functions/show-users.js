// Script simples para mostrar usuários exportados do Firebase Auth
// Execute com: node show-users.js

const fs = require("fs");
const path = require("path");

function showAuthDataFromExport() {
  try {
    // Ler o arquivo de export do Firebase Auth
    const exportFile = path.join(__dirname, "..", "users.json");

    if (!fs.existsSync(exportFile)) {
      console.error("❌ Arquivo users.json não encontrado!");
      console.log(
        "💡 Execute primeiro: firebase auth:export users.json --project sistema-eleicao-igreja"
      );
      return;
    }

    const data = JSON.parse(fs.readFileSync(exportFile, "utf8"));
    const users = data.users || [];

    console.log("\n📧 Usuários no Firebase Auth (via export):");
    console.log("------------------------------------------");
    console.log(`Total de usuários: ${users.length}`);

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.email} (${user.localId})`);
      console.log(`   - Display Name: ${user.displayName || "N/A"}`);
      console.log(`   - Email Verificado: ${user.emailVerified ? "✅" : "❌"}`);
      console.log(`   - Desabilitado: ${user.disabled ? "✅" : "❌"}`);

      // Converter timestamps
      const createdAt = new Date(parseInt(user.createdAt)).toLocaleString(
        "pt-BR"
      );
      const lastSignedInAt = user.lastSignedInAt
        ? new Date(parseInt(user.lastSignedInAt)).toLocaleString("pt-BR")
        : "Nunca";

      console.log(`   - Criado em: ${createdAt}`);
      console.log(`   - Último login: ${lastSignedInAt}`);

      // Mostrar custom claims se existirem
      if (user.customAttributes) {
        try {
          const claims = JSON.parse(user.customAttributes);
          console.log(`   - Custom Claims: ${JSON.stringify(claims)}`);
          console.log(`   - Role: ${claims.role || "N/A"}`);
          console.log(`   - Admin: ${claims.admin ? "✅" : "❌"}`);
        } catch (e) {
          console.log(`   - Custom Claims: ${user.customAttributes}`);
        }
      } else {
        console.log(`   - Custom Claims: Nenhum`);
      }
    });

    console.log("\n🔍 Análise dos usuários:");
    console.log("------------------------");
    const admins = users.filter((u) => {
      try {
        const claims = JSON.parse(u.customAttributes || "{}");
        return claims.admin === true;
      } catch {
        return false;
      }
    });

    console.log(`- Total de administradores: ${admins.length}`);
    console.log(
      `- Usuários ativos: ${users.filter((u) => !u.disabled).length}`
    );
    console.log(
      `- Emails verificados: ${users.filter((u) => u.emailVerified).length}`
    );
  } catch (error) {
    console.error("❌ Erro ao ler dados dos usuários:", error);
  }
}

function showFirestoreInfo() {
  console.log("\n📊 Sobre os dados do Firestore:");
  console.log("-------------------------------");
  console.log("Para acessar dados do Firestore, você pode:");
  console.log(
    "1. Usar o Firebase Console: https://console.firebase.google.com/"
  );
  console.log(
    "2. Baixar uma chave de serviço no Firebase Console > Configurações > Contas de serviço"
  );
  console.log("3. Configurar a variável FIREBASE_SERVICE_ACCOUNT_KEY no .env");
  console.log("");
  console.log("📋 Estrutura esperada dos perfis no Firestore:");
  console.log("- Coleção: 'users'");
  console.log(
    "- Campos: email, displayName, role, permissions[], isActive, createdAt, updatedAt"
  );
}

console.log("🔍 Relatório de Usuários do Sistema");
console.log("===================================");

showAuthDataFromExport();
showFirestoreInfo();

console.log("\n===================================");
console.log("✅ Relatório concluído!");
