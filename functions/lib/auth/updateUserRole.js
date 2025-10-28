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
exports.updateUserRole = void 0;
// src/auth/updateUserRole.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.updateUserRole = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar se caller é admin
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.token.admin)) {
        throw new functions.https.HttpsError("permission-denied", "Apenas administradores podem atualizar funções de usuários");
    }
    const { uid, role } = data;
    // Validações
    if (!uid || !role) {
        throw new functions.https.HttpsError("invalid-argument", "UID e função são obrigatórios");
    }
    if (!["admin", "user"].includes(role)) {
        throw new functions.https.HttpsError("invalid-argument", "Função inválida. Deve ser admin ou user");
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
        console.log(`✅ Função do usuário ${userRecord.email} atualizada para ${role}`);
        return {
            success: true,
            message: `Função do usuário ${userRecord.email} atualizada para ${role}`,
        };
    }
    catch (error) {
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
//# sourceMappingURL=updateUserRole.js.map