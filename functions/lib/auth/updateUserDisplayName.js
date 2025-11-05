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
exports.updateUserDisplayName = void 0;
// src/auth/updateUserDisplayName.ts
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
exports.updateUserDisplayName = functions.https.onCall(async (data, context) => {
    var _a, _b;
    // Verificar se caller é admin (verificar tanto admin quanto role)
    const isAdmin = ((_a = context.auth) === null || _a === void 0 ? void 0 : _a.token.admin) === true || ((_b = context.auth) === null || _b === void 0 ? void 0 : _b.token.role) === "admin";
    if (!context.auth || !isAdmin) {
        throw new functions.https.HttpsError("permission-denied", "Apenas administradores podem atualizar nomes de usuários");
    }
    const { uid, displayName } = data;
    // Validações
    if (!uid || !displayName) {
        throw new functions.https.HttpsError("invalid-argument", "UID e nome de exibição são obrigatórios");
    }
    if (displayName.trim().length === 0) {
        throw new functions.https.HttpsError("invalid-argument", "Nome de exibição não pode estar vazio");
    }
    if (displayName.length > 100) {
        throw new functions.https.HttpsError("invalid-argument", "Nome de exibição deve ter no máximo 100 caracteres");
    }
    try {
        // Verificar se usuário existe
        const userRecord = await admin.auth().getUser(uid);
        // Atualizar displayName no Firebase Auth
        await admin.auth().updateUser(uid, {
            displayName: displayName.trim(),
        });
        // Atualizar perfil no Firestore
        await admin.firestore().collection("users").doc(uid).update({
            displayName: displayName.trim(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✅ Nome do usuário ${userRecord.email} atualizado para "${displayName.trim()}"`);
        return {
            success: true,
            message: `Nome do usuário ${userRecord.email} atualizado para "${displayName.trim()}"`,
        };
    }
    catch (error) {
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
});
//# sourceMappingURL=updateUserDisplayName.js.map