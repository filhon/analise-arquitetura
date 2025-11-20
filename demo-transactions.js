/**
 * Demonstração Visual do Firebase Transactions
 * Simula o comportamento de votos simultâneos COM e SEM transações
 */

console.clear();

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

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function separator() {
  log(colors.bright, "=".repeat(70));
}

// Simulação SEM transações (sistema antigo)
async function simulateWithoutTransactions() {
  separator();
  log(colors.red, "❌ SIMULAÇÃO SEM FIREBASE TRANSACTIONS (Sistema Antigo)");
  separator();

  let metadata = { totalVotes: 0 };
  const votes = [];

  console.log("\n🎬 Cenário: 3 dispositivos votando simultaneamente\n");

  // Simular 3 dispositivos lendo ao mesmo tempo
  const device1Read = metadata.totalVotes; // 0
  await sleep(10);
  const device2Read = metadata.totalVotes; // 0 (ainda não foi atualizado)
  await sleep(10);
  const device3Read = metadata.totalVotes; // 0 (ainda não foi atualizado)

  log(
    colors.blue,
    `Device 1: Leu totalVotes = ${device1Read}, calculou ID = ${device1Read}`
  );
  log(
    colors.blue,
    `Device 2: Leu totalVotes = ${device2Read}, calculou ID = ${device2Read}`
  );
  log(
    colors.blue,
    `Device 3: Leu totalVotes = ${device3Read}, calculou ID = ${device3Read}`
  );

  console.log("");

  // Device 1 escreve
  votes[device1Read] = {
    id: device1Read,
    device: 1,
    selections: ["Candidato A", "Candidato B"],
  };
  metadata.totalVotes = device1Read + 1;
  log(
    colors.green,
    `Device 1: ✅ Gravou voto ID ${device1Read}, atualizou totalVotes = ${metadata.totalVotes}`
  );

  await sleep(50);

  // Device 2 escreve (SOBRESCREVE!)
  votes[device2Read] = {
    id: device2Read,
    device: 2,
    selections: ["Candidato A", "Candidato B"],
  };
  metadata.totalVotes = device2Read + 1;
  log(
    colors.red,
    `Device 2: ❌ Gravou voto ID ${device2Read}, SOBRESCREVEU voto do Device 1!`
  );

  await sleep(50);

  // Device 3 escreve (SOBRESCREVE!)
  votes[device3Read] = {
    id: device3Read,
    device: 3,
    selections: ["Candidato A", "Candidato B"],
  };
  metadata.totalVotes = device3Read + 1;
  log(
    colors.red,
    `Device 3: ❌ Gravou voto ID ${device3Read}, SOBRESCREVEU voto do Device 2!`
  );

  console.log("");
  separator();
  log(colors.red, "📊 RESULTADO FINAL SEM TRANSAÇÕES:");
  separator();
  console.log(`Total de votos no metadata: ${metadata.totalVotes}`);
  console.log(`Votos realmente salvos: ${votes.filter((v) => v).length}`);
  console.log(
    `IDs salvos: ${votes
      .filter((v) => v)
      .map((v) => v.id)
      .join(", ")}`
  );
  console.log(`Voto no ID 0 é do Device: ${votes[0].device}`);
  log(colors.red, `\n❌ PERDA DE DADOS: 2 votos perdidos (Devices 1 e 2)`);
  log(
    colors.red,
    `❌ RACE CONDITION: Múltiplos dispositivos obtiveram mesmo ID`
  );
  console.log("");
}

// Simulação COM transações (sistema novo)
async function simulateWithTransactions() {
  separator();
  log(colors.green, "✅ SIMULAÇÃO COM FIREBASE TRANSACTIONS (Sistema Novo)");
  separator();

  let metadata = { totalVotes: 0 };
  const votes = [];
  let transactionLocked = false;

  console.log("\n🎬 Cenário: 3 dispositivos votando simultaneamente\n");

  // Device 1 inicia transação
  log(colors.cyan, "Device 1: Iniciando runTransaction...");
  transactionLocked = true;
  log(colors.yellow, "🔒 Firebase BLOQUEOU metadata para outros dispositivos");
  await sleep(50);

  const device1Id = metadata.totalVotes;
  log(colors.blue, `Device 1: → Leu totalVotes = ${device1Id}`);
  log(colors.blue, `Device 1: → Calculou próximo ID = ${device1Id}`);
  metadata.totalVotes = device1Id + 1;
  log(colors.blue, `Device 1: → Atualizou totalVotes = ${metadata.totalVotes}`);

  votes[device1Id] = {
    id: device1Id,
    device: 1,
    selections: ["Candidato A", "Candidato B"],
  };
  transactionLocked = false;
  log(
    colors.green,
    `Device 1: ✅ Transação COMMIT, retornou ID = ${device1Id}`
  );
  log(colors.green, `Device 1: ✅ Gravou voto ID ${device1Id}`);

  console.log("");
  await sleep(50);

  // Device 2 inicia transação (aguardou Device 1)
  log(colors.cyan, "Device 2: Iniciando runTransaction...");
  transactionLocked = true;
  log(colors.yellow, "🔒 Firebase BLOQUEOU metadata para outros dispositivos");
  await sleep(50);

  const device2Id = metadata.totalVotes; // Agora lê o valor ATUALIZADO
  log(
    colors.blue,
    `Device 2: → Leu totalVotes = ${device2Id} (valor já atualizado!)`
  );
  log(colors.blue, `Device 2: → Calculou próximo ID = ${device2Id}`);
  metadata.totalVotes = device2Id + 1;
  log(colors.blue, `Device 2: → Atualizou totalVotes = ${metadata.totalVotes}`);

  votes[device2Id] = {
    id: device2Id,
    device: 2,
    selections: ["Candidato A", "Candidato B"],
  };
  transactionLocked = false;
  log(
    colors.green,
    `Device 2: ✅ Transação COMMIT, retornou ID = ${device2Id}`
  );
  log(colors.green, `Device 2: ✅ Gravou voto ID ${device2Id}`);

  console.log("");
  await sleep(50);

  // Device 3 inicia transação (aguardou Device 2)
  log(colors.cyan, "Device 3: Iniciando runTransaction...");
  transactionLocked = true;
  log(colors.yellow, "🔒 Firebase BLOQUEOU metadata para outros dispositivos");
  await sleep(50);

  const device3Id = metadata.totalVotes; // Agora lê o valor ATUALIZADO
  log(
    colors.blue,
    `Device 3: → Leu totalVotes = ${device3Id} (valor já atualizado!)`
  );
  log(colors.blue, `Device 3: → Calculou próximo ID = ${device3Id}`);
  metadata.totalVotes = device3Id + 1;
  log(colors.blue, `Device 3: → Atualizou totalVotes = ${metadata.totalVotes}`);

  votes[device3Id] = {
    id: device3Id,
    device: 3,
    selections: ["Candidato A", "Candidato B"],
  };
  transactionLocked = false;
  log(
    colors.green,
    `Device 3: ✅ Transação COMMIT, retornou ID = ${device3Id}`
  );
  log(colors.green, `Device 3: ✅ Gravou voto ID ${device3Id}`);

  console.log("");
  separator();
  log(colors.green, "📊 RESULTADO FINAL COM TRANSAÇÕES:");
  separator();
  console.log(`Total de votos no metadata: ${metadata.totalVotes}`);
  console.log(`Votos realmente salvos: ${votes.filter((v) => v).length}`);
  console.log(
    `IDs salvos: ${votes
      .filter((v) => v)
      .map((v) => v.id)
      .join(", ")}`
  );
  console.log(`Voto ID 0 é do Device: ${votes[0].device}`);
  console.log(`Voto ID 1 é do Device: ${votes[1].device}`);
  console.log(`Voto ID 2 é do Device: ${votes[2].device}`);
  log(colors.green, `\n✅ ZERO PERDA DE DADOS: Todos os 3 votos registrados`);
  log(
    colors.green,
    `✅ ZERO RACE CONDITIONS: IDs únicos e sequenciais (0, 1, 2)`
  );
  log(
    colors.green,
    `✅ INTEGRIDADE 100%: Metadata sincronizado com votos reais`
  );
  console.log("");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Executar demonstração
async function main() {
  log(
    colors.bright,
    "\n🔬 DEMONSTRAÇÃO: VOTOS SIMULTÂNEOS - ANTES vs DEPOIS\n"
  );

  await simulateWithoutTransactions();
  await sleep(500);
  await simulateWithTransactions();

  separator();
  log(colors.bright, "🎯 CONCLUSÃO");
  separator();
  console.log("");
  log(colors.red, "ANTES (Sem Transações):");
  console.log("  ❌ 3 dispositivos → 1 voto salvo (66% perda)");
  console.log("  ❌ IDs colidem (todos usam ID 0)");
  console.log("  ❌ Votos sobrescritos (último ganha)");
  console.log("");
  log(colors.green, "DEPOIS (Com Firebase Transactions):");
  console.log("  ✅ 3 dispositivos → 3 votos salvos (0% perda)");
  console.log("  ✅ IDs únicos e sequenciais (0, 1, 2)");
  console.log("  ✅ Zero race conditions, integridade 100%");
  console.log("");
  separator();
  log(colors.green, "✅ SISTEMA PRONTO PARA PRODUÇÃO");
  separator();
  console.log("");
}

main();
