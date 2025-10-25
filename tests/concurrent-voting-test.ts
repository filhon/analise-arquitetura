/**
 * Teste de Concorrência - Votações Simultâneas
 *
 * Este script testa se múltiplos usuários podem votar simultaneamente
 * sem perder dados, usando transações atômicas do Firebase.
 */

import { RealtimeSync } from "../src/utils/realtime-sync";
import type { Member } from "../src/types";

// Mock de membros para teste
const mockMembers: Member[] = [
  {
    id: "candidate-1",
    nome: "João Silva",
    candidato: "Presbítero",
    votes: 0,
    presente: true,
    tipo: "Membro Comungante",
  },
  {
    id: "candidate-2",
    nome: "Maria Santos",
    candidato: "Presbítero",
    votes: 0,
    presente: true,
    tipo: "Membro Comungante",
  },
];

async function testConcurrentVoting() {
  console.log("🧪 Iniciando teste de votação concorrente...");

  const realtimeSync = RealtimeSync.getInstance();

  // Simular setup inicial
  console.log("📝 Configurando dados iniciais...");
  await realtimeSync.syncMembers(mockMembers);

  // Simular 5 usuários votando simultaneamente no mesmo candidato
  const votes = Array(5).fill("candidate-1");
  const votePromises = votes.map(async (candidateId: string, index: number) => {
    console.log(`👤 Usuário ${index + 1} votando em ${candidateId}...`);
    return realtimeSync.incrementVoteAtomically(candidateId);
  });

  // Executar todos os votos simultaneamente
  console.log("🚀 Executando 5 votos simultâneos...");
  const startTime = Date.now();

  const results = await Promise.all(votePromises);

  const endTime = Date.now();
  console.log(`⏱️ Tempo total: ${endTime - startTime}ms`);

  // Verificar resultados
  const successCount = results.filter(
    (r: { success: boolean }) => r.success
  ).length;
  const failureCount = results.filter(
    (r: { success: boolean }) => !r.success
  ).length;

  console.log(`✅ Votos bem-sucedidos: ${successCount}`);
  console.log(`❌ Votos falhados: ${failureCount}`);

  if (failureCount > 0) {
    console.log("🔍 Detalhes dos erros:");
    results.forEach(
      (result: { success: boolean; error?: string }, index: number) => {
        if (!result.success) {
          console.log(`  Usuário ${index + 1}: ${result.error}`);
        }
      }
    );
  }

  // Verificar estado final
  console.log("🔍 Verificando estado final...");
  const finalState = await realtimeSync.loadInitialState();
  const finalCandidate1 = finalState.members?.find(
    (m: Member) => m.id === "candidate-1"
  );

  console.log(
    `🎯 Votos finais para candidate-1: ${finalCandidate1?.votes || 0}`
  );

  if (finalCandidate1?.votes === 5) {
    console.log("🎉 TESTE APROVADO: Todos os 5 votos foram registrados!");
  } else {
    console.log(
      `💥 TESTE FALHADO: Esperado 5 votos, mas encontrou ${finalCandidate1?.votes || 0}`
    );
  }

  return {
    success: finalCandidate1?.votes === 5,
    finalVotes: finalCandidate1?.votes || 0,
    successCount,
    failureCount,
  };
}

// Executar teste se este arquivo for executado diretamente
if (typeof window !== "undefined" && window.location) {
  // Browser environment - expose for manual testing
  (window as any).testConcurrentVoting = testConcurrentVoting;
  console.log(
    "🧪 Teste de concorrência disponível em window.testConcurrentVoting()"
  );
} else {
  // Node.js environment
  testConcurrentVoting().then((result) => {
    console.log("📊 Resultado final:", result);
    process.exit(result.success ? 0 : 1);
  });
}

export { testConcurrentVoting };
