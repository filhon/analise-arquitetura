// src/auth/updateUserRole.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UpdateUserRoleData } from "../types/user";

export const updateUserRole = functions.https.onCall(
  async (data: UpdateUserRoleData, context) => {
    // Verificar se caller é admin (verificar tanto admin quanto role)
    const isAdmin =
      context.auth?.token.admin === true ||
      context.auth?.token.role === "admin";

    if (!context.auth || !isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem atualizar funções de usuários"
      );
    }

    const { uid, role } = data;

    // Validações
    if (!uid || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "UID e função são obrigatórios"
      );
    }

    if (!["admin", "user"].includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Função inválida. Deve ser admin ou user"
      );
    }

    try {
      // Verificar se usuário existe
      const userRecord = await admin.auth().getUser(uid);

      // Atualizar Custom Claims
      await admin.auth().setCustomUserClaims(uid, {
        role,
        admin: role === "admin",
      });

      // Atualizar perfil no Firestore
      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          role,
          permissions: getPermissionsForRole(role),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `✅ Função do usuário ${userRecord.email} atualizada para ${role}`
      );
      return {
        success: true,
        message: `Função do usuário ${userRecord.email} atualizada para ${role}`,
      };
    } catch (error: any) {
      console.error("❌ Erro ao atualizar função do usuário:", error);

      let errorMessage = "Erro interno ao atualizar função do usuário";

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

function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case "admin":
      return [
        "create_users",
        "delete_users",
        "update_users",
        "manage_election",
        "view_reports",
        "manage_settings",
      ];
    case "user":
      return ["manage_election", "view_reports"];
    default:
      return [];
  }
}
