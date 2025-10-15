/**
 * Script de Teste e Validação do Firebase
 *
 * Este script testa a conexão e funcionalidade básica do Firebase Realtime Database
 */

import { ref, set, get, remove } from "firebase/database";
import { database } from "./firebase";

const TEST_PATH = "/__test__";

export async function testFirebaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    if (!database) {
      return {
        success: false,
        message:
          "❌ Firebase não inicializado. Verifique as credenciais em src/config/firebase.ts",
      };
    }

    console.log("🧪 Iniciando testes do Firebase...");

    // Teste 1: Escrever dados
    console.log("1️⃣ Testando escrita...");
    const testRef = ref(database, TEST_PATH);
    const testData = {
      timestamp: new Date().toISOString(),
      test: "Firebase Connection Test",
    };

    await set(testRef, testData);
    console.log("✅ Escrita bem-sucedida");

    // Teste 2: Ler dados
    console.log("2️⃣ Testando leitura...");
    const snapshot = await get(testRef);

    if (!snapshot.exists()) {
      throw new Error("Dados não encontrados após escrita");
    }

    const readData = snapshot.val();
    console.log("✅ Leitura bem-sucedida:", readData);

    // Teste 3: Remover dados
    console.log("3️⃣ Testando remoção...");
    await remove(testRef);
    console.log("✅ Remoção bem-sucedida");

    // Verificar se realmente removeu
    const verifySnapshot = await get(testRef);
    if (verifySnapshot.exists()) {
      throw new Error("Dados ainda existem após remoção");
    }
    console.log("✅ Verificação de remoção bem-sucedida");

    return {
      success: true,
      message: "✅ Todos os testes do Firebase passaram!",
      details: {
        writeTest: "✅ OK",
        readTest: "✅ OK",
        deleteTest: "✅ OK",
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    console.error("❌ Erro nos testes do Firebase:", error);

    return {
      success: false,
      message: `❌ Falha nos testes: ${error.message}`,
      details: {
        error: error.message,
        code: error.code,
        stack: error.stack,
      },
    };
  }
}

/**
 * Verificar se o Firebase está configurado corretamente
 */
export function checkFirebaseConfig(): {
  isConfigured: boolean;
  message: string;
  details: any;
} {
  const hasDatabase = !!database;

  if (!hasDatabase) {
    return {
      isConfigured: false,
      message: "⚠️ Firebase não configurado",
      details: {
        instruction: "Configure suas credenciais em src/config/firebase.ts",
        documentation: "Veja docs/CONFIGURACAO-FIREBASE-PASSO-A-PASSO.md",
      },
    };
  }

  return {
    isConfigured: true,
    message: "✅ Firebase configurado",
    details: {
      databaseURL: database?.app.options.databaseURL || "N/A",
      projectId: database?.app.options.projectId || "N/A",
    },
  };
}

// Exportar função para uso em console do navegador
if (typeof window !== "undefined") {
  (window as any).testFirebase = testFirebaseConnection;
  (window as any).checkFirebaseConfig = checkFirebaseConfig;
}
