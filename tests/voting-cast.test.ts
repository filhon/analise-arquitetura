import { describe, it, expect, beforeEach } from "vitest";
import { MemberManager } from "@/modules/members";
import { VotingManager } from "@/modules/voting";

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

describe("VotingManager.castVote", () => {
  beforeEach(async () => {
    (global as any).localStorage.clear();
    // Reset singletons by clearing any internal state (hacky but ok for unit tests)
    // Create two members: candidate and voter (comungante present)
    const memberManager = MemberManager.getInstance();
    await memberManager.clearAll();
    // Ensure a quarantine config exists so quorum checks pass in tests
    (global as any).localStorage.setItem(
      "CONFIG",
      JSON.stringify({
        quorum: {
          minimumPercentage: 0,
          votesCriteria: "simple-majority",
          votesRequiredPercentage: -1,
          presbyteroPositions: 3,
          diaconoPositions: 6,
        },
        system: { version: "test" },
      })
    );
    await memberManager.addMember({
      nome: "Candidate One",
      tipo: "Membro Comungante",
      candidato: "Presbítero",
    } as any);
    await memberManager.addMember({
      nome: "Voter One",
      tipo: "Membro Comungante",
      presente: true,
    } as any);
  });

  it("should allow a present comungante to cast a vote", async () => {
    const memberManager = MemberManager.getInstance();
    const votingManager = VotingManager.getInstance();

    const candidates = await votingManager.getCandidates();
    expect(candidates.length).toBeGreaterThan(0);
    const candidateId = candidates[0].id;

    const members = await memberManager.getMembers();
    const voter = members.find((m) => m.nome === "Voter One")!;

    const result = await votingManager.castVote(candidateId, voter.id);
    expect(result.success).toBe(true);

    const updatedCandidates = await votingManager.getCandidates();
    const updated = updatedCandidates.find((c) => c.id === candidateId)!;
    expect(updated.votes).toBeGreaterThanOrEqual(1);
  });
});
