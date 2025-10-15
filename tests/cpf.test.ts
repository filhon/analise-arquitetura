// Testes para validação de CPF

import { describe, it, expect } from "vitest";
import generateValidCPF from "@/utils/cpf";

/**
 * Valida um CPF (copiado de utils/index.ts)
 */
function validateCPF(value: string): boolean {
  const cleanCpf = value.replace(/\D/g, "");

  if (cleanCpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleanCpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }

  let remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(9))) {
    return false;
  }

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }

  remainder = 11 - (sum % 11);
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf.charAt(10))) {
    return false;
  }

  return true;
}

describe("generateValidCPF", () => {
  it("deve gerar CPF válido para 111.444.777", () => {
    const cpf = generateValidCPF("111.444.777");
    console.log("CPF gerado para 111.444.777:", cpf);
    expect(validateCPF(cpf)).toBe(true);
    expect(cpf).toBe("111.444.777-35");
  });

  it("deve gerar CPF válido para 123.456.789", () => {
    const cpf = generateValidCPF("123.456.789");
    console.log("CPF gerado para 123.456.789:", cpf);
    expect(validateCPF(cpf)).toBe(true);
    expect(cpf).toBe("123.456.789-09");
  });

  it("deve gerar CPF válido para 987.654.321", () => {
    const cpf = generateValidCPF("987.654.321");
    console.log("CPF gerado para 987.654.321:", cpf);
    expect(validateCPF(cpf)).toBe(true);
    expect(cpf).toBe("987.654.321-00");
  });

  it("deve gerar CPF válido sem formatação inicial", () => {
    const cpf = generateValidCPF("111444777");
    console.log("CPF gerado para 111444777:", cpf);
    expect(validateCPF(cpf)).toBe(true);
  });

  it("deve gerar CPFs diferentes para bases diferentes", () => {
    const cpf1 = generateValidCPF("111.111.111");
    const cpf2 = generateValidCPF("222.222.222");
    const cpf3 = generateValidCPF("333.333.333");

    console.log("CPFs gerados:", { cpf1, cpf2, cpf3 });

    expect(validateCPF(cpf1)).toBe(true);
    expect(validateCPF(cpf2)).toBe(true);
    expect(validateCPF(cpf3)).toBe(true);
    expect(cpf1).not.toBe(cpf2);
    expect(cpf2).not.toBe(cpf3);
  });

  it("deve lidar com bases com menos de 9 dígitos", () => {
    const cpf = generateValidCPF("123");
    console.log("CPF gerado para 123:", cpf);
    expect(cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
  });
});

describe("validateCPF", () => {
  it("deve validar CPFs conhecidos como válidos", () => {
    expect(validateCPF("111.444.777-35")).toBe(true);
    expect(validateCPF("123.456.789-09")).toBe(true);
    expect(validateCPF("987.654.321-00")).toBe(true);
  });

  it("deve rejeitar CPFs com dígitos verificadores incorretos", () => {
    expect(validateCPF("111.444.777-00")).toBe(false);
    expect(validateCPF("123.456.789-00")).toBe(false);
    expect(validateCPF("987.654.321-99")).toBe(false);
  });

  it("deve rejeitar CPFs com todos os dígitos iguais", () => {
    expect(validateCPF("111.111.111-11")).toBe(false);
    expect(validateCPF("000.000.000-00")).toBe(false);
    expect(validateCPF("999.999.999-99")).toBe(false);
  });

  it("deve validar CPFs sem formatação", () => {
    expect(validateCPF("11144477735")).toBe(true);
    expect(validateCPF("12345678909")).toBe(true);
    expect(validateCPF("98765432100")).toBe(true);
  });
});
