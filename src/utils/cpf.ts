// Utilitário para geração de CPF válido (dígitos verificadores corretos)
export function generateValidCPF(base: string): string {
  // Limpar e garantir 9 dígitos (preencher com zeros à direita se necessário)
  let clean = base.replace(/\D/g, "");
  if (clean.length < 9) {
    clean = clean.padEnd(9, "0");
  }
  clean = clean.substring(0, 9);

  // Evitar sequência com todos os dígitos iguais (111111111 etc.)
  if (/^(\d)\1{8}$/.test(clean)) {
    const last = (parseInt(clean.charAt(8)) + 1) % 10;
    clean = clean.substring(0, 8) + String(last);
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;

  // Calcula o segundo dígito verificador
  sum = 0;
  const temp = clean + digit1;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(temp.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  const fullCpf = clean + digit1 + digit2;
  return fullCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export default generateValidCPF;
