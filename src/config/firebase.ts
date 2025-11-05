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
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions } from "firebase/functions";
import { getFirestore, Firestore } from "firebase/firestore";

// ⚠️ SUBSTITUA COM SUAS CREDENCIAIS DO FIREBASE
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verificar se as credenciais foram configuradas
const isConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "COLE_AQUI" &&
  firebaseConfig.apiKey !== "" &&
  firebaseConfig.apiKey !== undefined;

// Inicializar Firebase
let app: FirebaseApp | null = null;
let database: Database | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let functions: Functions | null = null;
let firestore: Firestore | null = null;

if (isConfigured) {
  try {
    console.log("🔧 Inicializando Firebase com config:", {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
      hasApiKey: !!firebaseConfig.apiKey,
    });

    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
    auth = getAuth(app);
    firestore = getFirestore(app);

    console.log("✅ Firebase App inicializado");
    console.log("✅ Firebase Database inicializado");
    console.log("✅ Firebase Auth inicializado");
    console.log("✅ Firebase Firestore inicializado");

    // Inicializar Functions
    try {
      functions = getFunctions(app);
      console.log("✅ Firebase Functions inicializado");
    } catch (err) {
      console.warn("⚠️ Não foi possível inicializar Firebase Functions:", err);
    }

    // Inicializar Storage se houver bucket configurado
    try {
      storage = getStorage(app);
      console.log("✅ Firebase Storage inicializado");
      console.log(`📦 Storage bucket: ${firebaseConfig.storageBucket}`);
    } catch (err) {
      console.warn("⚠️ Não foi possível inicializar Firebase Storage:", err);
    }
    console.log("✅ Firebase inicializado com sucesso!");
    console.log(`📡 Database URL: ${firebaseConfig.databaseURL}`);
    console.log(`🔐 Authentication habilitado`);
  } catch (error) {
    console.error("❌ Erro ao inicializar Firebase:", error);
  }
} else {
  console.warn("⚠️ Firebase não configurado!");
  console.warn("📝 Abra src/config/firebase.ts e adicione suas credenciais");
  console.warn("📚 Veja docs/CONFIGURACAO-FIREBASE-PASSO-A-PASSO.md");
}

export { app, database, storage, auth, functions, firestore, isConfigured };
export default database;
