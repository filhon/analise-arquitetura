// src/auth/createUser.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { CreateUserData, UserProfile } from "../types/user";

export const createUser = functions.https.onCall(
  async (data: CreateUserData, context) => {
    // Verificar se caller é admin (verificar tanto admin quanto role)
    const isAdmin =
      context.auth?.token.admin === true ||
      context.auth?.token.role === "admin";

    if (!context.auth || !isAdmin) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Apenas administradores podem criar usuários"
      );
    }

    const { email, password, role, displayName } = data;

    // Validações
    if (!email || !password || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Email, senha e função são obrigatórios"
      );
    }

    if (!["admin", "user"].includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Função inválida. Deve ser admin ou user"
      );
    }

    if (password.length < 6) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A senha deve ter pelo menos 6 caracteres"
      );
    }

    try {
      // Criar usuário no Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: displayName || email.split("@")[0],
      });

      // Definir Custom Claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role,
        admin: role === "admin",
      });

      // Salvar perfil no Firestore
      const userProfile: Omit<UserProfile, "createdAt" | "updatedAt"> = {
        uid: userRecord.uid,
        email,
        displayName: displayName || email.split("@")[0],
        role,
        lastLoginAt: null,
        isActive: true,
        permissions: getPermissionsForRole(role),
      };

      await admin
        .firestore()
        .collection("users")
        .doc(userRecord.uid)
        .set({
          ...userProfile,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`✅ Usuário criado: ${email} com role ${role}`);
      return {
        success: true,
        uid: userRecord.uid,
        message: `Usuário ${email} criado com sucesso`,
      };
    } catch (error: any) {
      console.error("❌ Erro ao criar usuário:", error);

      let errorMessage = "Erro interno ao criar usuário";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este email já está em uso";
          break;
        case "auth/invalid-email":
          errorMessage = "Email inválido";
          break;
        case "auth/weak-password":
          errorMessage = "Senha muito fraca";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Criação de usuários não está habilitada";
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
