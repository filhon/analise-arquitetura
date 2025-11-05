"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
// src/auth/getUsers.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.getUsers = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f;
    // Verificar se caller é admin (verificar tanto admin quanto role)
    const isAdmin = ((_a = context.auth) === null || _a === void 0 ? void 0 : _a.token.admin) === true || ((_b = context.auth) === null || _b === void 0 ? void 0 : _b.token.role) === "admin";
    if (!context.auth || !isAdmin) {
        throw new functions.https.HttpsError("permission-denied", "Apenas administradores podem listar usuários");
    }
    try {
        // Buscar usuários do Firestore com paginação
        const limit = (data === null || data === void 0 ? void 0 : data.limit) || 50;
        const offset = (data === null || data === void 0 ? void 0 : data.offset) || 0;
        const usersSnapshot = await admin
            .firestore()
            .collection("users")
            .orderBy("createdAt", "desc")
            .limit(limit)
            .offset(offset)
            .get();
        const users = [];
        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const userProfile = {
                uid: doc.id,
                email: userData.email || "",
                displayName: userData.displayName || "",
                role: userData.role || "user",
                createdAt: ((_c = userData.createdAt) === null || _c === void 0 ? void 0 : _c.toDate)
                    ? userData.createdAt.toDate()
                    : new Date(),
                updatedAt: ((_d = userData.updatedAt) === null || _d === void 0 ? void 0 : _d.toDate)
                    ? userData.updatedAt.toDate()
                    : new Date(),
                lastLoginAt: ((_e = userData.lastLoginAt) === null || _e === void 0 ? void 0 : _e.toDate)
                    ? userData.lastLoginAt.toDate()
                    : null,
                isActive: (_f = userData.isActive) !== null && _f !== void 0 ? _f : true,
                permissions: userData.permissions || [],
            };
            users.push(userProfile);
        }
        // Buscar informações adicionais do Firebase Auth
        const authUsers = await admin.auth().listUsers();
        // Combinar dados do Firestore com dados do Auth
        const enrichedUsers = users.map((user) => {
            const authUser = authUsers.users.find((au) => au.uid === user.uid);
            return Object.assign(Object.assign({}, user), { emailVerified: (authUser === null || authUser === void 0 ? void 0 : authUser.emailVerified) || false, disabled: (authUser === null || authUser === void 0 ? void 0 : authUser.disabled) || false, metadata: (authUser === null || authUser === void 0 ? void 0 : authUser.metadata)
                    ? {
                        creationTime: authUser.metadata.creationTime,
                        lastSignInTime: authUser.metadata.lastSignInTime,
                    }
                    : null });
        });
        console.log(`✅ ${enrichedUsers.length} usuários retornados`);
        return {
            success: true,
            users: enrichedUsers,
            total: usersSnapshot.size,
            hasMore: usersSnapshot.size === limit,
        };
    }
    catch (error) {
        console.error("❌ Erro ao buscar usuários:", error);
        throw new functions.https.HttpsError("internal", error.message || "Erro interno ao buscar usuários");
    }
});
//# sourceMappingURL=getUsers.js.map