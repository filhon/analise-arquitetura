/**
 * Configuração do Firebase Realtime Database
 *
 * INSTRUÇÕES:
 * 1. Acesse: https://console.firebase.google.com/
 * 2. Crie um projeto (se ainda não tiver)
 * 3. Ative "Realtime Database"
 * 4. Vá em "Configurações do Projeto" > "Seus Aplicativos" > Web
 * 5. Copie as credenciais e substitua os valores abaixo
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// ⚠️ SUBSTITUA COM SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAfyPxvTvE7uLcpg84RU9FHjNtMFY60-WE",
  authDomain: "sistema-eleicao-igreja.firebaseapp.com",
  databaseURL: "https://sistema-eleicao-igreja-default-rtdb.firebaseio.com",
  projectId: "sistema-eleicao-igreja",
  storageBucket: "sistema-eleicao-igreja.firebasestorage.app",
  messagingSenderId: "98688924231",
  appId: "1:98688924231:web:01ddbbbf400393c2838f62",
};

// Verificar se as credenciais foram configuradas
const isConfigured = !firebaseConfig.apiKey.includes("COLE_AQUI");

// Inicializar Firebase
let app: FirebaseApp | null = null;
let database: Database | null = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    console.log("✅ Firebase inicializado com sucesso!");
    console.log(`📡 Database URL: ${firebaseConfig.databaseURL}`);
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
  }
} else {
  console.warn("⚠️ Firebase não configurado!");
  console.warn("📝 Abra src/config/firebase.ts e adicione suas credenciais");
  console.warn("📚 Veja docs/CONFIGURACAO-FIREBASE-PASSO-A-PASSO.md");
}

export { app, database, isConfigured };
export default database;
