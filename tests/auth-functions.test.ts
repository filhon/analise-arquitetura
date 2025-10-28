// tests/auth-functions.test.ts
import { expect, test, describe, vi } from "vitest";
import { UserRole } from "@/types/auth";

// Mock do Firebase Functions
const mockHttpsCallable = vi.fn();
vi.mock("firebase/functions", () => ({
  httpsCallable: mockHttpsCallable,
}));

// Mock do Firebase config
vi.mock("@/config/firebase", () => ({
  functions: {},
  isConfigured: true,
}));

describe("AuthManager Cloud Functions Integration", () => {
  test("createUser should call Cloud Function", async () => {
    const { AuthManager } = await import("@/modules/auth/manager");

    const manager = AuthManager.getInstance();

    mockHttpsCallable.mockResolvedValue({
      data: {
        success: true,
        uid: "test-uid",
        message: "Usuário criado com sucesso",
      },
    });

    const result = await manager.createUser(
      "test@example.com",
      "password123",
      UserRole.USER,
      "Test User"
    );

    expect(result.success).toBe(true);
    expect(mockHttpsCallable).toHaveBeenCalledWith({}, "createUser");
  });

  test("getUsers should call Cloud Function", async () => {
    const { AuthManager } = await import("@/modules/auth/manager");

    const manager = AuthManager.getInstance();

    mockHttpsCallable.mockResolvedValue({
      data: {
        success: true,
        users: [
          {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
            role: "user",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          },
        ],
      },
    });

    const users = await manager.getUsers();

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe("test@example.com");
    expect(mockHttpsCallable).toHaveBeenCalledWith({}, "getUsers");
  });

  test("deleteUser should call Cloud Function", async () => {
    const { AuthManager } = await import("@/modules/auth/manager");

    const manager = AuthManager.getInstance();

    mockHttpsCallable.mockResolvedValue({
      data: {
        success: true,
        message: "Usuário excluído com sucesso",
      },
    });

    const result = await manager.deleteUser("test-uid");

    expect(result.success).toBe(true);
    expect(mockHttpsCallable).toHaveBeenCalledWith({}, "deleteUser");
  });
});
