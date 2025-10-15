import { MemberManager } from "@/modules/members";
import { uploadImage } from "@/utils/storage";

type Options = {
  dryRun?: boolean; // se true, apenas loga o que seria feito
  max?: number; // limite de uploads por execução
};

/**
 * Migrator: encontra membros com photoUrl em base64 (data URL), faz upload para Storage
 * e atualiza o member.photoUrl com a URL retornada.
 *
 * Observações:
 * - Este script foi feito para ser executado no contexto do navegador (console) onde
 *   a aplicação está inicializada (todos os managers carregados e Firebase configurado).
 * - Será realizada uma operação de escrita por membro (updateMember) que aciona saveMembers
 *   e sincronização com Firebase. Faça backup antes de rodar.
 */
export default async function migrateBase64Photos(options: Options = {}) {
  const { dryRun = true, max = 100 } = options;

  if (typeof window === "undefined") {
    console.error(
      "Este migrator deve ser executado no contexto do navegador (console). Não no Node."
    );
    return;
  }

  const mgr = MemberManager.getInstance();
  const members = await mgr.getMembers();

  const candidates = members.filter(
    (m) => typeof m.photoUrl === "string" && m.photoUrl.startsWith("data:")
  );

  console.log(
    "[migrateBase64Photos] Encontrados",
    candidates.length,
    "membros com photoUrl em base64. max:",
    max,
    "dryRun:",
    dryRun
  );

  if (candidates.length === 0) return { migrated: 0, total: 0 };

  const toProcess = candidates.slice(0, max);
  let migrated = 0;

  if (dryRun) {
    console.log(
      "[migrateBase64Photos] Dry run - sem alterações. Membros que seriam migrados:"
    );
    toProcess.forEach((m) =>
      console.log(
        ` - ${m.id} ${m.nome} (photoUrl length: ${(m.photoUrl as string).length})`
      )
    );
    return { migrated: 0, total: toProcess.length };
  }

  // Confirm explicitamente
  if (
    !confirm(
      `Migrar ${toProcess.length} fotos base64 para Firebase Storage? Esta ação fará uploads na sua conta Firebase.`
    )
  ) {
    console.log("[migrateBase64Photos] Operação cancelada pelo usuário.");
    return { migrated: 0, total: toProcess.length };
  }

  for (const member of toProcess) {
    try {
      const dataUrl = member.photoUrl as string;
      // Converter dataURL para Blob
      const arr = dataUrl.split(",");
      const mime = arr[0].match(/data:(.*);base64/)?.[1] || "image/png";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const file = new File([blob], `member_${member.id}.png`, { type: mime });

      console.log(
        `[migrateBase64Photos] Uploading member ${member.id} (${member.nome})...`
      );
      const url = await uploadImage(file);

      console.log(`[migrateBase64Photos] Upload successful: ${url}`);
      // Atualizar membro via manager (isto persiste e sincroniza)
      await mgr.updateMember(member.id, { photoUrl: url });
      migrated++;
    } catch (err) {
      console.error(
        `[migrateBase64Photos] Falha ao migrar membro ${member.id}:`,
        err
      );
    }
  }

  console.log(`[migrateBase64Photos] Migrated ${migrated}/${toProcess.length}`);
  return { migrated, total: toProcess.length };
}

// Registrar no window para execução fácil no console da aplicação
if (typeof window !== "undefined") {
  (window as any).migrateBase64Photos = migrateBase64Photos;
}
