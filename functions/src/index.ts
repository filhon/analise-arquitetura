// src/index.ts
import * as admin from "firebase-admin";

// Inicializar Firebase Admin SDK
admin.initializeApp();

// Importar todas as funções
import { createUser } from "./auth/createUser";
import { updateUserRole } from "./auth/updateUserRole";
import { updateUserDisplayName } from "./auth/updateUserDisplayName";
import { getUsers } from "./auth/getUsers";
import { deleteUser } from "./auth/deleteUser";

// Exportar funções para deployment
export {
  createUser,
  updateUserRole,
  updateUserDisplayName,
  getUsers,
  deleteUser,
};
