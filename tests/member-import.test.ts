import { describe, it, expect, beforeEach } from "vitest";
import { MemberManager } from "@/modules/members";

// Mock localStorage for the tests
class LocalStorageMock {
  store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = value;
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

(global as any).localStorage = new LocalStorageMock();

describe("MemberManager.importFromCSV", () => {
  beforeEach(() => {
    (global as any).localStorage.clear();
  });

  it("should import members from a valid CSV", async () => {
    const csv = `nome,tipo,cpf,rg,candidato,email,telefone\nJoão Silva,Membro Comungante,11144477735,12.345.678-9,Presbítero,joao@email.com,(11) 99999-9999`;
    const manager = MemberManager.getInstance();
    const result = await manager.importFromCSV(csv);

    expect(result.success).toBe(true);
    expect(result.membersAdded).toBe(1);
    const members = await manager.getMembers();
    expect(members.length).toBe(1);
    expect(members[0].nome).toBe("João Silva");
    expect(members[0].candidato).toBe("Presbítero");
  });
});
