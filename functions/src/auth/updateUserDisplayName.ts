// src/auth/updateUserDisplayName.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

interface UpdateUserDisplayNameData {
  uid: string;
  displayName: string;
}

export const updateUserDisplayName = functions.https.onCall(
  async (data: UpdateUserDisplayNameData, context) => {
    // Verificar se caller é admin
    if (!context.auth?.token.admin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem atualizar nomes de usuários"
      );
    }

    const { uid, displayName } = data;

    // Validações
    if (!uid || !displayName) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "UID e nome de exibição são obrigatórios"
      );
    }

    if (displayName.trim().length === 0) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Nome de exibição não pode estar vazio"
      );
    }

    if (displayName.length > 100) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Nome de exibição deve ter no máximo 100 caracteres"
      );
    }

    try {
      // Verificar se usuário existe
      const userRecord = await admin.auth().getUser(uid);

      // Atualizar displayName no Firebase Auth
      await admin.auth().updateUser(uid, {
        displayName: displayName.trim(),
      });

      // Atualizar perfil no Firestore
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          displayName: displayName.trim(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `✅ Nome do usuário ${userRecord.email} atualizado para "${displayName.trim()}"`
      );
      return {
        success: true,
        message: `Nome do usuário ${userRecord.email} atualizado para "${displayName.trim()}"`,
      };
    } catch (error: any) {
      console.error("❌ Erro ao atualizar nome do usuário:", error);

      let errorMessage = "Erro interno ao atualizar nome do usuário";

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