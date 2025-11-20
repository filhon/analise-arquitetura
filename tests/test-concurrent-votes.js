/**
 * Teste de Votos Simultâneos
 * Simula 3 dispositivos votando ao mesmo tempo para verificar race conditions
 */

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push, remove } from "firebase/database";

// Configuração do Firebase (usar as mesmas credenciais do projeto)
const firebaseConfig = {
  apiKey: "AIzaSyBl8dQJ5nsVwOuFlsybz8afsvDfP8BCcRs",
  authDomain: "church-election-system.firebaseapp.com",
  databaseURL: "https://church-election-system-default-rtdb.firebaseio.com",
  projectId: "church-election-system",
  storageBucket: "church-election-system.firebasestorage.app",
  messagingSenderId: "730607396974",
  appId: "1:730607396974:web:edf6d31dfc6af2b9cfacc5",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Função para gerar hash SHA-256 (simulação simplificada)
function generateSimpleHash(data) {
  return `hash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

// Função para simular um voto de um dispositivo
async function simulateVote(deviceId, voteData, delayMs = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const startTime = Date.now();
      console.log(`\n[DEVICE ${deviceId}] 🚀 Iniciando voto...`);

      try {
        // 1. Ler o próximo ID disponível
        const metadataRef = ref(db, "audit/metadata");
        const metadataSnapshot = await get(metadataRef);
        const currentTotal = metadataSnapshot.exists()
          ? metadataSnapshot.val().totalVotes || 0
          : 0;

        const nextId = currentTotal;
        console.log(
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
        const voteRef = ref(db, `audit/${nextId}`);
        await set(voteRef, vote);
        console.log(`[DEVICE ${deviceId}] ✅ Voto ${nextId} gravado`);

        // 4. Atualizar metadata
        await set(metadataRef, {
          totalVotes: nextId + 1,
          lastUpdated: Date.now(),
          version: 2,
        });
        console.log(
          `[DEVICE ${deviceId}] 📈 Metadata atualizada: totalVotes = ${nextId + 1}`
        );

        // 5. Atualizar votos dos candidatos
        for (const selection of voteData.selections) {
          const membersSnapshot = await get(ref(db, "members"));
          if (membersSnapshot.exists()) {
            const members = membersSnapshot.val();
            const memberEntry = Object.entries(members).find(
              ([_, member]) => member.id === selection.candidateId
            );

            if (memberEntry) {
              const [memberKey, member] = memberEntry;
              const currentVotes = member.votes || 0;
              const memberRef = ref(db, `members/${memberKey}/votes`);
              await set(memberRef, currentVotes + 1);
              console.log(
                `[DEVICE ${deviceId}] 🗳️  Candidato ${selection.candidateName}: ${currentVotes} → ${currentVotes + 1}`
              );
            }
          }
        }

        const elapsed = Date.now() - startTime;
        console.log(`[DEVICE ${deviceId}] ⏱️  Tempo total: ${elapsed}ms`);

        resolve({
          deviceId,
          voteId: nextId,
          success: true,
          elapsed,
        });
      } catch (error) {
        console.error(`[DEVICE ${deviceId}] ❌ ERRO:`, error.message);
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
  console.log("\n🧹 Limpando dados de teste anteriores...");

  try {
    // Limpar audit
    const auditRef = ref(db, "audit");
    await remove(auditRef);

    // Resetar votos dos membros
    const membersSnapshot = await get(ref(db, "members"));
    if (membersSnapshot.exists()) {
      const members = membersSnapshot.val();
      for (const [memberKey, member] of Object.entries(members)) {
        if (member.candidato) {
          const memberRef = ref(db, `members/${memberKey}/votes`);
          await set(memberRef, 0);
        }
      }
    }

    console.log("✅ Dados de teste limpos\n");
  } catch (error) {
    console.error("❌ Erro ao limpar dados:", error.message);
  }
}

// Função para verificar resultados
async function verifyResults(expectedVotes, results) {
  console.log("\n" + "=".repeat(70));
  console.log("📊 VERIFICAÇÃO DE RESULTADOS");
  console.log("=".repeat(70));

  // 1. Verificar metadata
  const metadataSnapshot = await get(ref(db, "audit/metadata"));
  const actualTotal = metadataSnapshot.exists()
    ? metadataSnapshot.val().totalVotes
    : 0;

  console.log(`\n1️⃣  TOTAL DE VOTOS:`);
  console.log(`   Esperado: ${expectedVotes} votos`);
  console.log(`   Alcançado: ${actualTotal} votos`);
  console.log(
    `   Status: ${actualTotal === expectedVotes ? "✅ CORRETO" : "❌ INCORRETO"}`
  );

  // 2. Verificar votos individuais
  console.log(`\n2️⃣  VOTOS REGISTRADOS NO AUDIT:`);
  const auditSnapshot = await get(ref(db, "audit"));
  if (auditSnapshot.exists()) {
    const auditData = auditSnapshot.val();
    const voteIds = Object.keys(auditData)
      .filter((key) => key !== "metadata")
      .sort((a, b) => Number(a) - Number(b));

    console.log(`   Total de entradas: ${voteIds.length}`);
    voteIds.forEach((id) => {
      const vote = auditData[id];
      console.log(
        `   - Voto ${id}: ${vote.selections?.length || 0} seleções (Device: ${vote.createdBy})`
      );
    });

    // Verificar IDs sequenciais
    const hasGaps = voteIds.some((id, index) => Number(id) !== index);
    console.log(
      `   IDs sequenciais: ${!hasGaps ? "✅ SIM" : "❌ NÃO (race condition detectada!)"}`
    );
  } else {
    console.log(`   ❌ Nenhum voto encontrado no audit`);
  }

  // 3. Verificar votos dos candidatos
  console.log(`\n3️⃣  VOTOS DOS CANDIDATOS:`);
  const membersSnapshot = await get(ref(db, "members"));
  if (membersSnapshot.exists()) {
    const members = membersSnapshot.val();
    const candidates = Object.values(members).filter((m) => m.candidato);

    let totalCandidateVotes = 0;
    candidates.forEach((candidate) => {
      const votes = candidate.votes || 0;
      totalCandidateVotes += votes;
      console.log(`   - ${candidate.nome}: ${votes} votos`);
    });

    const expectedCandidateVotes = expectedVotes * 2; // 2 seleções por voto
    console.log(`\n   Total de votos em candidatos: ${totalCandidateVotes}`);
    console.log(
      `   Esperado: ${expectedCandidateVotes} (${expectedVotes} votos × 2 seleções)`
    );
    console.log(
      `   Status: ${totalCandidateVotes === expectedCandidateVotes ? "✅ CORRETO" : "❌ INCORRETO"}`
    );
  }

  // 4. Verificar sucesso das operações
  console.log(`\n4️⃣  OPERAÇÕES DOS DISPOSITIVOS:`);
  results.forEach((result) => {
    const status = result.success ? "✅" : "❌";
    const time = result.elapsed ? `${result.elapsed}ms` : "N/A";
    console.log(
      `   ${status} Device ${result.deviceId}: Vote ID ${result.voteId} (${time})`
    );
  });

  // 5. Resumo final
  console.log("\n" + "=".repeat(70));
  const allSuccess = results.every((r) => r.success);
  const correctTotal = actualTotal === expectedVotes;

  if (allSuccess && correctTotal) {
    console.log(
      "✅ TESTE PASSOU: Sistema manteve integridade em votos simultâneos"
    );
  } else {
    console.log("❌ TESTE FALHOU: Race condition detectada ou perda de dados");
  }
  console.log("=".repeat(70) + "\n");
}

// Função principal
async function runTest() {
  console.log("🔬 TESTE DE VOTOS SIMULTÂNEOS - 3 DISPOSITIVOS");
  console.log("=".repeat(70));

  // Limpar dados anteriores
  await cleanupTestData();

  // Buscar candidatos disponíveis
  console.log("📋 Buscando candidatos disponíveis...");
  const membersSnapshot = await get(ref(db, "members"));

  if (!membersSnapshot.exists()) {
    console.error("❌ Nenhum membro encontrado no banco de dados");
    process.exit(1);
  }

  const members = membersSnapshot.val();
  const candidates = Object.values(members).filter((m) => m.candidato);

  if (candidates.length < 2) {
    console.error("❌ É necessário pelo menos 2 candidatos para o teste");
    process.exit(1);
  }

  console.log(`✅ Encontrados ${candidates.length} candidatos\n`);

  // Preparar dados dos votos (cada dispositivo vota em 2 candidatos diferentes)
  const vote1 = {
    selections: [
      { candidateId: candidates[0].id, candidateName: candidates[0].nome },
      { candidateId: candidates[1].id, candidateName: candidates[1].nome },
    ],
  };

  const vote2 = {
    selections: [
      { candidateId: candidates[0].id, candidateName: candidates[0].nome },
      { candidateId: candidates[1].id, candidateName: candidates[1].nome },
    ],
  };

  const vote3 = {
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
  console.log("\n⏰ Executando votos SIMULTÂNEOS...");

  // Executar votos simultaneamente
  const results = await Promise.allSettled([
    simulateVote(1, vote1, 0),
    simulateVote(2, vote2, 50), // delay de 50ms
    simulateVote(3, vote3, 100), // delay de 100ms
  ]);

  // Processar resultados
  const processedResults = results.map((result) => {
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
  console.error("❌ Erro fatal:", error);
  process.exit(1);
});
