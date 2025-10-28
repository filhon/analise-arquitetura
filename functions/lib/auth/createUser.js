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
exports.createUser = void 0;
// src/auth/createUser.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.createUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar se caller é admin
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.token.admin)) {
        throw new functions.https.HttpsError("permission-denied", "Apenas administradores podem criar usuários");
    }
    const { email, password, role, displayName } = data;
    // Validações
    if (!email || !password || !role) {
        throw new functions.https.HttpsError("invalid-argument", "Email, senha e função são obrigatórios");
    }
    if (!["admin", "user"].includes(role)) {
        throw new functions.https.HttpsError("invalid-argument", "Função inválida. Deve ser admin ou user");
    }
    if (password.length < 6) {
        throw new functions.https.HttpsError("invalid-argument", "A senha deve ter pelo menos 6 caracteres");
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
        const userProfile = {
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
            .set(Object.assign(Object.assign({}, userProfile), { createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        console.log(`✅ Usuário criado: ${email} com role ${role}`);
        return {
            success: true,
            uid: userRecord.uid,
            message: `Usuário ${email} criado com sucesso`,
        };
    }
    catch (error) {
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
});
function getPermissionsForRole(role) {
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
//# sourceMappingURL=createUser.js.map