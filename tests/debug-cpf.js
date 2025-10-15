// Teste simples da função generateValidCPF

function generateValidCPF(base) {
  console.log("Input:", base);
  const clean = base.replace(/\D/g, "").substring(0, 9);
  console.log("Clean:", clean, "Length:", clean.length);

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    const digit = parseInt(clean.charAt(i));
    const multiplier = 10 - i;
    console.log(`Pos ${i}: ${digit} x ${multiplier} = ${digit * multiplier}`);
    sum += digit * multiplier;
  }
  console.log("Sum 1:", sum);

  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  console.log("Digit 1:", digit1);

  sum = 0;
  const temp = clean + digit1;
  console.log("Temp:", temp, "Length:", temp.length);

  for (let i = 0; i < 10; i++) {
    const digit = parseInt(temp.charAt(i));
    const multiplier = 11 - i;
    console.log(`Pos ${i}: ${digit} x ${multiplier} = ${digit * multiplier}`);
    sum += digit * multiplier;
  }
  console.log("Sum 2:", sum);

  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  console.log("Digit 2:", digit2);

  const fullCpf = clean + digit1 + digit2;
  console.log("Full CPF:", fullCpf, "Length:", fullCpf.length);

  const formatted = fullCpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    "$1.$2.$3-$4"
  );
  console.log("Formatted:", formatted);

  return formatted;
}

console.log("\n=== Teste 1: 111.444.777 ===");
const result1 = generateValidCPF("111.444.777");
console.log("RESULTADO:", result1);

console.log("\n=== Teste 2: 123.456.789 ===");
const result2 = generateValidCPF("123.456.789");
console.log("RESULTADO:", result2);

console.log("\n=== Teste 3: 987.654.321 ===");
const result3 = generateValidCPF("987.654.321");
console.log("RESULTADO:", result3);
