/**
 * Script de Migração: Unificar Candidatos em Membros
 *
 * Este script migra dados do formato antigo (CANDIDATES separado)
 * para o novo formato (candidatos como propriedades de MEMBERS)
 */

export function migrateToUnifiedFormat(): {
  success: boolean;
  migrated: number;
  errors: string[];
} {
  console.log("[Migration] Iniciando migração para formato unificado...");

  const errors: string[] = [];
  let migrated = 0;

  try {
    // 1. Carregar dados antigos
    const membersRaw = localStorage.getItem("MEMBERS");
    const candidatesRaw = localStorage.getItem("CANDIDATES");

    if (!membersRaw) {
      console.log("[Migration] Nenhum membro encontrado. Nada a migrar.");
      return { success: true, migrated: 0, errors: [] };
    }

    const members = JSON.parse(membersRaw);

    if (!candidatesRaw) {
      console.log(
        "[Migration] Nenhum candidato antigo encontrado. Membros já no formato correto."
      );
      return { success: true, migrated: 0, errors: [] };
    }

    const candidates = JSON.parse(candidatesRaw);
    console.log("[Migration] Formato antigo detectado. Iniciando migração...");

    // 2. Extrair candidatos do formato antigo (OBJECT ou ARRAY)
    let allCandidates: any[] = [];

    if (Array.isArray(candidates)) {
      allCandidates = candidates;
    } else if (candidates.presbyteros || candidates.diaconos) {
      allCandidates = [
        ...(candidates.presbyteros || []),
        ...(candidates.diaconos || []),
      ];
    }

    console.log(
      `[Migration] ${allCandidates.length} candidatos encontrados no formato antigo`
    );

    // 3. Unificar candidatos nos membros correspondentes
    allCandidates.forEach((candidate) => {
      // Tentar encontrar membro correspondente por nome
      const member = members.find(
        (m: any) => m.nome === candidate.name || m.id === candidate.id
      );

      if (member) {
        // Unificar dados do candidato no membro
        member.candidato = candidate.role;
        member.photoUrl = candidate.photoUrl;
        member.votes = candidate.votes || 0;
        member.isElected = candidate.isElected || false;

        migrated++;
        console.log(
          `[Migration] ✓ Migrado: ${member.nome} (${candidate.role})`
        );
      } else {
        const error = `Candidato "${candidate.name}" não encontrado como membro`;
        errors.push(error);
        console.warn(`[Migration] ⚠ ${error}`);
      }
    });

    // 4. Salvar membros atualizados
    localStorage.setItem("MEMBERS", JSON.stringify(members));
    console.log(
      `[Migration] Membros atualizados salvos (${members.length} total)`
    );

    // 5. Remover storage antigo de candidatos
    localStorage.removeItem("CANDIDATES");
    console.log("[Migration] Storage antigo 'CANDIDATES' removido");

    // 6. Limpar caches obsoletos
    const keysToRemove = ["election-members", "election-candidates"];
    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`[Migration] Cache obsoleto '${key}' removido`);
      }
    });

    console.log(
      `[Migration] ✅ Migração concluída: ${migrated} candidatos unificados`
    );

    return {
      success: true,
      migrated,
      errors,
    };
  } catch (error) {
    console.error("[Migration] ❌ Erro durante migração:", error);
    return {
      success: false,
      migrated,
      errors: [...errors, (error as Error).message],
    };
  }
}

/**
 * Verifica se os dados precisam ser migrados
 */
export function needsMigration(): boolean {
  const hasOldCandidatesFormat = localStorage.getItem("CANDIDATES") !== null;
  const hasOldMembersKey = localStorage.getItem("election-members") !== null;

  return hasOldCandidatesFormat || hasOldMembersKey;
}

/**
 * Executa migração automática se necessário
 */
export function autoMigrate(): void {
  if (needsMigration()) {
    console.log(
      "[Migration] Formato antigo detectado. Executando migração automática..."
    );
    const result = migrateToUnifiedFormat();

    if (result.success) {
      console.log(
        `[Migration] ✅ Migração automática concluída: ${result.migrated} candidatos`
      );
      if (result.errors.length > 0) {
        console.warn(
          `[Migration] ⚠ ${result.errors.length} avisos:`,
          result.errors
        );
      }
    } else {
      console.error("[Migration] ❌ Falha na migração automática");
    }
  } else {
    console.log("[Migration] Dados já no formato correto");
  }
}
