import { Timestamp } from "firebase-admin/firestore";
export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: "admin" | "user";
    createdAt: Date | Timestamp;
    updatedAt: Date | Timestamp;
    lastLoginAt: Date | Timestamp | null;
    isActive: boolean;
    permissions: string[];
}
export type UserRole = "admin" | "user";
export interface CreateUserData {
    email: string;
    password: string;
    role: UserRole;
    displayName?: string;
}
export interface UpdateUserRoleData {
    uid: string;
    role: UserRole;
}
