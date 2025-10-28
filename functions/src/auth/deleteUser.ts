// src/auth/deleteUser.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const deleteUser = functions.https.onCall(
  async (data: { uid: string }, context) => {
    // Verificar se caller é admin
    if (!context.auth?.token.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem excluir usuários"
      );
    }

    const { uid } = data;

    // Validações
    if (!uid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "UID é obrigatório"
      );
    }

    try {
      // Verificar se usuário existe
      const userRecord = await admin.auth().getUser(uid);

      // Não permitir exclusão do próprio usuário
      if (context.auth.uid === uid) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Você não pode excluir sua própria conta"
        );
      }

      // Excluir do Firestore primeiro (para manter consistência)
      await admin.firestore().collection("users").doc(uid).delete();

      // Excluir do Firebase Auth
      await admin.auth().deleteUser(uid);

      console.log(`✅ Usuário excluído: ${userRecord.email}`);
      return {
        success: true,
        message: `Usuário ${userRecord.email} excluído com sucesso`,
      };
    } catch (error: any) {
      console.error("❌ Erro ao excluir usuário:", error);

      let errorMessage = "Erro interno ao excluir usuário";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Usuário não encontrado";
          break;
        case "not-found":
          errorMessage = "Perfil do usuário não encontrado no banco de dados";
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      throw new functions.https.HttpsError("internal", errorMessage);
    }
  }
);
