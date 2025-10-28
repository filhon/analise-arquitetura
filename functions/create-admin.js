// Script para criar usuário ADMIN
// Execute com: node create-admin.js

const admin = require("firebase-admin");

// ⚠️ IMPORTANTE: Você precisa ter uma service account key
// Baixe do Firebase Console > Configurações do Projeto > Contas de Serviço
// Salve como 'serviceAccountKey.json' na mesma pasta

let serviceAccount;
try {
  serviceAccount = require("./serviceAccountKey.json");
} catch (error) {
  console.error("❌ Erro: serviceAccountKey.json não encontrado!");
  console.log("");
  console.log("📋 Para obter a chave:");
  console.log("1. Acesse: https://console.firebase.google.com/");
  console.log('2. Selecione o projeto "sistema-eleicao-igreja"');
  console.log("3. Vá em Configurações do Projeto > Contas de Serviço");
  console.log('4. Clique em "Gerar nova chave privada"');
  console.log('5. Salve o arquivo como "serviceAccountKey.json" nesta pasta');
  console.log("6. Execute novamente: node create-admin.js");
  process.exit(1);
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "sistema-eleicao-igreja",
  });
}

async function createAdminUser() {
  const email = "admin@igreja.com";
  const password = "Admin123!"; // ⚠️ ALTERE ESTA SENHA!
  const displayName = "Administrador";

  try {
    console.log("🔧 Criando usuário ADMIN...");

    // Criar usuário no Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    console.log("✅ Usuário criado no Firebase Auth:", userRecord.uid);

    // Definir Custom Claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "admin",
      admin: true,
    });

    console.log("✅ Custom Claims definidos com sucesso!");

    // Salvar perfil no Firestore
    await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .set({
        uid: userRecord.uid,
        email,
        displayName,
        role: "admin",
        isActive: true,
        permissions: [
          "create_users",
          "delete_users",
          "update_users",
          "manage_election",
          "view_reports",
          "manage_settings",
        ],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log("✅ Perfil salvo no Firestore!");

    console.log("");
    console.log("🎉 Usuário ADMIN criado com sucesso!");
    console.log("📧 Email:", email);
    console.log("🔑 Senha:", password);
    console.log("⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
    console.log("");
    console.log(
      "🚀 Agora você pode fazer login no sistema com estas credenciais."
    );
  } catch (error) {
    console.error("❌ Erro ao criar usuário ADMIN:", error.message);

    if (error.code === "auth/email-already-in-use") {
      console.log("");
      console.log(
        "ℹ️  O email já existe. Se você já criou o usuário, use este script para definir os claims:"
      );
      console.log("node set-admin-claims.js");
    }
  }
}

createAdminUser();
