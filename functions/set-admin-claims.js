// Script para definir claims ADMIN em usuário existente
// Execute com: node set-admin-claims.js

const admin = require("firebase-admin");

// ⚠️ IMPORTANTE: Você precisa ter uma service account key
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
  process.exit(1);
}

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "sistema-eleicao-igreja",
  });
}

async function setAdminClaims() {
  const email = "admin@igreja.com"; // ⚠️ ALTERE se necessário

  try {
    console.log("🔧 Procurando usuário:", email);

    // Buscar usuário por email
    const userRecord = await admin.auth().getUserByEmail(email);

    console.log("✅ Usuário encontrado:", userRecord.uid);

    // Definir Custom Claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "admin",
      admin: true,
    });

    console.log("✅ Custom Claims definidos com sucesso!");

    // Verificar se perfil existe no Firestore, se não, criar
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userRecord.uid)
      .get();

    if (!userDoc.exists) {
      console.log("📝 Criando perfil no Firestore...");

      await admin
        .firestore()
        .collection("users")
        .doc(userRecord.uid)
        .set({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || "Administrador",
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

      console.log("✅ Perfil criado no Firestore!");
    } else {
      console.log("✅ Perfil já existe no Firestore");
    }

    console.log("");
    console.log("🎉 Usuário ADMIN configurado com sucesso!");
    console.log("📧 Email:", email);
    console.log("🚀 Agora você pode fazer login no sistema.");
  } catch (error) {
    console.error("❌ Erro:", error.message);

    if (error.code === "auth/user-not-found") {
      console.log("");
      console.log("ℹ️  Usuário não encontrado. Primeiro crie o usuário:");
      console.log("node create-admin.js");
    }
  }
}

setAdminClaims();
