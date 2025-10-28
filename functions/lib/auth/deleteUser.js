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
exports.deleteUser = void 0;
// src/auth/deleteUser.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.deleteUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Verificar se caller é admin
    if (!((_a = context.auth) === null || _a === void 0 ? void 0 : _a.token.admin)) {
        throw new functions.https.HttpsError("permission-denied", "Apenas administradores podem excluir usuários");
    }
    const { uid } = data;
    // Validações
    if (!uid) {
        throw new functions.https.HttpsError("invalid-argument", "UID é obrigatório");
    }
    try {
        // Verificar se usuário existe
        const userRecord = await admin.auth().getUser(uid);
        // Não permitir exclusão do próprio usuário
        if (context.auth.uid === uid) {
            throw new functions.https.HttpsError("permission-denied", "Você não pode excluir sua própria conta");
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
    }
    catch (error) {
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
});
//# sourceMappingURL=deleteUser.js.map