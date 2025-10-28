// Script para definir claims ADMIN no usuário fcbfilipesantos@gmail.com
// Execute com: node set-filipe-admin.js

const admin = require("firebase-admin");

// ⚠️ IMPORTANTE: Este script usa as mesmas credenciais do .env
// Certifique-se de que o arquivo .env está configurado corretamente

// Carregar variáveis de ambiente
require("dotenv").config({ path: "../.env" });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Verificar se as credenciais estão configuradas
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "COLE_AQUI") {
  console.error("❌ Erro: Credenciais do Firebase não configuradas!");
  console.log("");
  console.log("📋 Verifique o arquivo .env na raiz do projeto");
  console.log("📝 As variáveis devem estar definidas:");
  console.log("- VITE_FIREBASE_API_KEY");
  console.log("- VITE_FIREBASE_PROJECT_ID");
  console.log("- etc.");
  process.exit(1);
}

// Inicializar Firebase Admin com credenciais do projeto
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}

async function setFilipeAdminClaims() {
  const email = "fcbfilipesantos@gmail.com";

  try {
    console.log("🔧 Procurando usuário:", email);

    // Buscar usuário por email
    const userRecord = await admin.auth().getUserByEmail(email);

    console.log("✅ Usuário encontrado:", userRecord.uid);
    console.log("👤 Display Name:", userRecord.displayName);
    console.log("📧 Email:", userRecord.email);

    // Definir Custom Claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: "admin",
      admin: true,
    });

    console.log("✅ Custom Claims definidos com sucesso!");
    console.log("🔑 Claims definidos:", {
      role: "admin",
      admin: true,
    });

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
          displayName: userRecord.displayName || "Filipe Santos",
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
      console.log("🔄 Atualizando role para admin...");

      // Atualizar role se necessário
      await admin.firestore().collection("users").doc(userRecord.uid).update({
        role: "admin",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log("✅ Perfil atualizado no Firestore!");
    }

    console.log("");
    console.log("🎉 Usuário fcbfilipesantos@gmail.com configurado como ADMIN!");
    console.log("📧 Email:", email);
    console.log("👑 Role: ADMIN");
    console.log(
      "🚀 Agora você pode fazer login no sistema como administrador."
    );
    console.log("");
    console.log(
      "💡 Dica: Faça logout e login novamente para que as mudanças tenham efeito."
    );
  } catch (error) {
    console.error("❌ Erro:", error.message);

    if (error.code === "auth/user-not-found") {
      console.log("");
      console.log("ℹ️  Usuário não encontrado. Primeiro crie o usuário:");
      console.log("1. Acesse: https://console.firebase.google.com/");
      console.log('2. Selecione o projeto "sistema-eleicao-igreja"');
      console.log("3. Vá para Authentication > Users");
      console.log("4. Clique em 'Add user'");
      console.log("5. Crie o usuário: fcbfilipesantos@gmail.com");
      console.log("6. Execute novamente: node set-filipe-admin.js");
    }
  }
}

setFilipeAdminClaims();
