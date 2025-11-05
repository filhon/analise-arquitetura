// src/auth/getUsers.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { UserProfile } from "../types/user";

export const getUsers = functions.https.onCall(async (data, context) => {
  // Verificar se caller é admin (verificar tanto admin quanto role)
  const isAdmin =
    context.auth?.token.admin === true || context.auth?.token.role === "admin";

  if (!context.auth || !isAdmin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Apenas administradores podem listar usuários"
    );
  }

  try {
    // Buscar usuários do Firestore com paginação
    const limit = data?.limit || 50;
    const offset = data?.offset || 0;

    const usersSnapshot = await admin
      .firestore()
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset(offset)
      .get();

    const users: UserProfile[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as any;
      const userProfile: UserProfile = {
        uid: doc.id,
        email: userData.email || "",
        displayName: userData.displayName || "",
        role: userData.role || "user",
        createdAt: userData.createdAt?.toDate
          ? userData.createdAt.toDate()
          : new Date(),
        updatedAt: userData.updatedAt?.toDate
          ? userData.updatedAt.toDate()
          : new Date(),
        lastLoginAt: userData.lastLoginAt?.toDate
          ? userData.lastLoginAt.toDate()
          : null,
        isActive: userData.isActive ?? true,
        permissions: userData.permissions || [],
      };
      users.push(userProfile);
    }

    // Buscar informações adicionais do Firebase Auth
    const authUsers = await admin.auth().listUsers();

    // Combinar dados do Firestore com dados do Auth
    const enrichedUsers = users.map((user) => {
      const authUser = authUsers.users.find((au) => au.uid === user.uid);
      return {
        ...user,
        emailVerified: authUser?.emailVerified || false,
        disabled: authUser?.disabled || false,
        metadata: authUser?.metadata
          ? {
              creationTime: authUser.metadata.creationTime,
              lastSignInTime: authUser.metadata.lastSignInTime,
            }
          : null,
      };
    });

    console.log(`✅ ${enrichedUsers.length} usuários retornados`);
    return {
      success: true,
      users: enrichedUsers,
      total: usersSnapshot.size,
      hasMore: usersSnapshot.size === limit,
    };
  } catch (error: any) {
    console.error("❌ Erro ao buscar usuários:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Erro interno ao buscar usuários"
    );
  }
});
