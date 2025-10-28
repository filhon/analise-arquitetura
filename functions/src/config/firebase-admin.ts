// src/config/firebase-admin.ts
import * as admin from "firebase-admin";

// Verificar se já foi inicializado
if (!admin.apps.length) {
  // Configuração para produção (Cloud Functions)
  if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  } else {
    // Configuração para desenvolvimento local
    // Use uma service account key local ou variáveis de ambiente
    try {
      const serviceAccount = require("../serviceAccountKey.json");
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.warn(
        "⚠️ Service account key não encontrada. Algumas funcionalidades podem não funcionar."
      );
      console.warn(
        "📝 Para desenvolvimento local, adicione serviceAccountKey.json na pasta functions/src/config/"
      );
      // Fallback para inicialização sem credenciais (apenas para desenvolvimento)
      admin.initializeApp();
    }
  }
}

// Configurar Firestore settings
admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

export default admin;
