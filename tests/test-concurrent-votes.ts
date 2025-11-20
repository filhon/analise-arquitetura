/**
 * Teste de Votos Simultâneos
 * Simula 3 dispositivos votando ao mesmo tempo para verificar race conditions
 *
 * COMO EXECUTAR:
 * 1. npm install (se ainda não instalou)
 * 2. Certifique-se de ter um arquivo .env com as credenciais do Firebase
 * 3. Execute: npx tsx test-concurrent-votes.ts
 */

import { initializeApp, FirebaseApp } from "firebase/app";
import {
  getDatabase,
  Database,
  ref,
  set,
  get,
  remove,
} from "firebase/database";
import * as dotenv from "dotenv";

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Verificar se as credenciais foram configuradas
const isConfigured =
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "your_api_key_here" &&
  firebaseConfig.databaseURL &&
  firebaseConfig.databaseURL !==
    "https://your_project_id-default-rtdb.firebaseio.com";

if (!isConfigured) {
  console.error("❌ Firebase não configurado!");
  console.error("📝 Configure o arquivo .env com as credenciais do Firebase");
  console.error("📚 Use o arquivo .env.example como referência");
  process.exit(1);
}

// Inicializar Firebase
let app: FirebaseApp;
let database: Database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  console.log("✅ Firebase inicializado com sucesso!");
} catch (error: any) {
  console.error("❌ Erro ao inicializar Firebase:", error.message);
  process.exit(1);
}

// Cores para console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

// Função para gerar hash SHA-256 (simulação simplificada)
function generateSimpleHash(data: any): string {
  return `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Interface para resultado de voto
interface VoteResult {
  deviceId: number;
  voteId?: number;
  success: boolean;
  elapsed?: number;
  error?: string;
}

// Interface para dados de voto
interface VoteData {
  selections: Array<{
    candidateId: string;
    candidateName: string;
  }>;
}

// Função para simular um voto de um dispositivo
async function simulateVote(
  deviceId: number,
  voteData: VoteData,
  delayMs: number = 0
): Promise<VoteResult> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const startTime = Date.now();
      log(colors.cyan, `\n[DEVICE ${deviceId}] 🚀 Iniciando voto...`);

      try {
        if (!database) {
          throw new Error("Firebase não configurado");
        }

        // 1. Ler o próximo ID disponível
        const metadataRef = ref(database, "audit/metadata");
        const metadataSnapshot = await get(metadataRef);
        const currentTotal = metadataSnapshot.exists()
          ? metadataSnapshot.val().totalVotes || 0
          : 0;

        const nextId = currentTotal;
        log(
          colors.blue,
          `[DEVICE ${deviceId}] 📊 Total atual: ${currentTotal}, Próximo ID: ${nextId}`
        );

        // 2. Preparar dados do voto
        const vote = {
          id: nextId,
          timestamp: Date.now(),
          selections: voteData.selections,
          hash: generateSimpleHash(voteData),
          createdBy: `device_${deviceId}`,
          createdAt: new Date().toISOString(),
        };

        // 3. Escrever voto (atomic write)
        const voteRef = ref(database, `audit/${nextId}`);
        await set(voteRef, vote);
        log(colors.green, `[DEVICE ${deviceId}] ✅ Voto ${nextId} gravado`);

        // 4. Atualizar metadata
        await set(metadataRef, {
          totalVotes: nextId + 1,
          lastUpdated: Date.now(),
          version: 2,
        });
        log(
          colors.green,
          `[DEVICE ${deviceId}] 📈 Metadata atualizada: totalVotes = ${nextId + 1}`
        );

        // 5. Atualizar votos dos candidatos
        for (const selection of voteData.selections) {
          const membersSnapshot = await get(ref(database, "members"));
          if (membersSnapshot.exists()) {
            const members = membersSnapshot.val();
            const memberEntry = Object.entries(
              members as Record<string, any>
            ).find(([_, member]) => member.id === selection.candidateId);

            if (memberEntry) {
              const [memberKey, member] = memberEntry;
              const currentVotes = member.votes || 0;
              const memberRef = ref(database, `members/${memberKey}/votes`);
              await set(memberRef, currentVotes + 1);
              log(
                colors.magenta,
                `[DEVICE ${deviceId}] 🗳️  Candidato ${selection.candidateName}: ${currentVotes} → ${currentVotes + 1}`
              );
            }
          }
        }

        const elapsed = Date.now() - startTime;
        log(
          colors.yellow,
          `[DEVICE ${deviceId}] ⏱️  Tempo total: ${elapsed}ms`
        );

        resolve({
          deviceId,
          voteId: nextId,
          success: true,
          elapsed,
        });
      } catch (error: any) {
        log(colors.red, `[DEVICE ${deviceId}] ❌ ERRO: ${error.message}`);
        reject({
          deviceId,
          success: false,
          error: error.message,
        });
      }
    }, delayMs);
  });
}

// Função para limpar dados de teste
async function cleanupTestData() {
  log(colors.yellow, "\n🧹 Limpando dados de teste anteriores...");

  try {
    // Limpar audit
    const auditRef = ref(database, "audit");
    await remove(auditRef);

    // Resetar votos dos membros
    const membersSnapshot = await get(ref(database, "members"));
    if (membersSnapshot.exists()) {
      const members = membersSnapshot.val() as Record<string, any>;
      for (const [memberKey, member] of Object.entries(members)) {
        if (member.candidato) {
          const memberRef = ref(database, `members/${memberKey}/votes`);
          await set(memberRef, 0);
        }
      }
    }

    log(colors.green, "✅ Dados de teste limpos\n");
  } catch (error: any) {
    log(colors.red, `❌ Erro ao limpar dados: ${error.message}`);
  }
}

// Função para verificar resultados
async function verifyResults(expectedVotes: number, results: VoteResult[]) {
  log(colors.bright, "\n" + "=".repeat(70));
  log(colors.bright, "📊 VERIFICAÇÃO DE RESULTADOS");
  log(colors.bright, "=".repeat(70));

  // 1. Verificar metadata
  const metadataSnapshot = await get(ref(database, "audit/metadata"));
  const actualTotal = metadataSnapshot.exists()
    ? metadataSnapshot.val().totalVotes
    : 0;

  console.log(`\n1️⃣  TOTAL DE VOTOS:`);
  console.log(`   Esperado: ${expectedVotes} votos`);
  console.log(`   Alcançado: ${actualTotal} votos`);
  const totalCorrect = actualTotal === expectedVotes;
  log(
    totalCorrect ? colors.green : colors.red,
    `   Status: ${totalCorrect ? "✅ CORRETO" : "❌ INCORRETO"}`
  );

  // 2. Verificar votos individuais
  console.log(`\n2️⃣  VOTOS REGISTRADOS NO AUDIT:`);
  const auditSnapshot = await get(ref(database, "audit"));
  let hasGaps = false;
  let voteCount = 0;

  if (auditSnapshot.exists()) {
    const auditData = auditSnapshot.val() as Record<string, any>;
    const voteIds = Object.keys(auditData)
      .filter((key) => key !== "metadata")
      .sort((a, b) => Number(a) - Number(b));

    voteCount = voteIds.length;
    console.log(`   Total de entradas: ${voteCount}`);

    voteIds.forEach((id) => {
      const vote = auditData[id];
      console.log(
        `   - Voto ${id}: ${vote.selections?.length || 0} seleções (Device: ${vote.createdBy})`
      );
    });

    // Verificar IDs sequenciais
    hasGaps = voteIds.some((id, index) => Number(id) !== index);
    log(
      !hasGaps ? colors.green : colors.red,
      `   IDs sequenciais: ${!hasGaps ? "✅ SIM" : "❌ NÃO (race condition detectada!)"}`
    );
  } else {
    log(colors.red, `   ❌ Nenhum voto encontrado no audit`);
  }

  // 3. Verificar votos dos candidatos
  console.log(`\n3️⃣  VOTOS DOS CANDIDATOS:`);
  const membersSnapshot = await get(ref(database, "members"));
  let totalCandidateVotes = 0;

  if (membersSnapshot.exists()) {
    const members = membersSnapshot.val() as Record<string, any>;
    const candidates = Object.values(members).filter((m: any) => m.candidato);

    candidates.forEach((candidate: any) => {
      const votes = candidate.votes || 0;
      totalCandidateVotes += votes;
      console.log(`   - ${candidate.nome}: ${votes} votos`);
    });

    const expectedCandidateVotes = expectedVotes * 2; // 2 seleções por voto
    console.log(`\n   Total de votos em candidatos: ${totalCandidateVotes}`);
    console.log(
      `   Esperado: ${expectedCandidateVotes} (${expectedVotes} votos × 2 seleções)`
    );
    const candidateVotesCorrect =
      totalCandidateVotes === expectedCandidateVotes;
    log(
      candidateVotesCorrect ? colors.green : colors.red,
      `   Status: ${candidateVotesCorrect ? "✅ CORRETO" : "❌ INCORRETO"}`
    );
  }

  // 4. Verificar sucesso das operações
  console.log(`\n4️⃣  OPERAÇÕES DOS DISPOSITIVOS:`);
  results.forEach((result) => {
    const status = result.success ? "✅" : "❌";
    const time = result.elapsed ? `${result.elapsed}ms` : "N/A";
    const voteId = result.voteId !== undefined ? result.voteId : "N/A";
    console.log(
      `   ${status} Device ${result.deviceId}: Vote ID ${voteId} (${time})`
    );
  });

  // 5. Resumo final
  log(colors.bright, "\n" + "=".repeat(70));
  const allSuccess = results.every((r) => r.success);
  const correctTotal = actualTotal === expectedVotes;
  const noGaps = !hasGaps && voteCount > 0;

  if (allSuccess && correctTotal && noGaps) {
    log(
      colors.green,
      "✅ TESTE PASSOU: Sistema manteve integridade em votos simultâneos"
    );
  } else {
    log(
      colors.red,
      "❌ TESTE FALHOU: Race condition detectada ou perda de dados"
    );
    if (!allSuccess) console.log("   - Algumas operações falharam");
    if (!correctTotal)
      console.log("   - Total de votos não corresponde ao esperado");
    if (!noGaps) console.log("   - IDs não são sequenciais (race condition)");
  }
  log(colors.bright, "=".repeat(70) + "\n");
}

// Função principal
async function runTest() {
  log(colors.bright, "🔬 TESTE DE VOTOS SIMULTÂNEOS - 3 DISPOSITIVOS");
  log(colors.bright, "=".repeat(70));

  // Limpar dados anteriores
  await cleanupTestData();

  // Buscar candidatos disponíveis
  log(colors.blue, "📋 Buscando candidatos disponíveis...");
  const membersSnapshot = await get(ref(database, "members"));

  if (!membersSnapshot.exists()) {
    log(colors.red, "❌ Nenhum membro encontrado no banco de dados");
    process.exit(1);
  }

  const members = membersSnapshot.val() as Record<string, any>;
  const candidates = Object.values(members).filter((m: any) => m.candidato);

  if (candidates.length < 2) {
    log(colors.red, "❌ É necessário pelo menos 2 candidatos para o teste");
    process.exit(1);
  }

  log(colors.green, `✅ Encontrados ${candidates.length} candidatos\n`);

  // Preparar dados dos votos (cada dispositivo vota em 2 candidatos diferentes)
  const vote1: VoteData = {
    selections: [
      { candidateId: candidates[0].id, candidateName: candidates[0].nome },
      { candidateId: candidates[1].id, candidateName: candidates[1].nome },
    ],
  };

  const vote2: VoteData = {
    selections: [
      { candidateId: candidates[0].id, candidateName: candidates[0].nome },
      { candidateId: candidates[1].id, candidateName: candidates[1].nome },
    ],
  };

  const vote3: VoteData = {
    selections: [
      { candidateId: candidates[0].id, candidateName: candidates[0].nome },
      { candidateId: candidates[1].id, candidateName: candidates[1].nome },
    ],
  };

  console.log("🎯 Cenário de teste:");
  console.log(
    `   - Device 1: vota em ${vote1.selections[0].candidateName} e ${vote1.selections[1].candidateName}`
  );
  console.log(
    `   - Device 2: vota em ${vote2.selections[0].candidateName} e ${vote2.selections[1].candidateName}`
  );
  console.log(
    `   - Device 3: vota em ${vote3.selections[0].candidateName} e ${vote3.selections[1].candidateName}`
  );
  log(colors.yellow, "\n⏰ Executando votos SIMULTÂNEOS...");

  // Executar votos simultaneamente
  const results = await Promise.allSettled([
    simulateVote(1, vote1, 0),
    simulateVote(2, vote2, 50), // delay de 50ms
    simulateVote(3, vote3, 100), // delay de 100ms
  ]);

  // Processar resultados
  const processedResults: VoteResult[] = results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      return result.reason;
    }
  });

  // Aguardar um pouco para garantir que todas as escritas foram concluídas
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verificar resultados
  await verifyResults(3, processedResults);

  process.exit(0);
}

// Executar teste
runTest().catch((error) => {
  log(colors.red, `❌ Erro fatal: ${error.message}`);
  process.exit(1);
});
