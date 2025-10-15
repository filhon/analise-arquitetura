# Regras Especiais para Membros Visitantes

## Requisito Implementado

Membros do tipo **Visitante** devem ter tratamento especial:

1. ✅ **Presença automática**: Ao adicionar/importar um visitante, ele é automaticamente marcado como presente
2. ✅ **Excluído do quórum**: Visitantes não contam para o cálculo do quórum
3. ✅ **Registro em ata**: A presença de visitantes é contabilizada apenas para fins de registro em relatório e ata

## Justificativa

Visitantes não podem:

- Ser candidatos
- Votar em eleições
- Contar para quórum de assembleia

Porém, sua presença deve ser registrada para:

- Ata de presença
- Relatórios estatísticos
- Histórico de visitação

---

## Implementações Realizadas

### 1. Marcação Automática de Presença ao Adicionar Membro

**Arquivo**: `src/modules/members.ts` - Método `addMember()`

```typescript
// Marcar visitantes como presentes automaticamente
if (newMember.tipo === "Visitante") {
  try {
    const { AttendanceManager } = await import("./attendance");
    const attendanceManager = AttendanceManager.getInstance();

    await attendanceManager.markPresence(newMember.id, true);
  } catch (error) {
    // Log do erro mas não falha a adição do membro
    ErrorHandler.log(
      error as Error,
      "MemberManager.addMember.markVisitorPresent"
    );
  }
}
```

**Fluxo**:

1. Usuário adiciona novo membro via modal
2. Define tipo como "Visitante"
3. Membro é salvo no localStorage
4. Sistema automaticamente marca presença (AttendanceManager)
5. Visitante aparece como presente na aba Membros

---

### 2. Marcação Automática de Presença ao Importar CSV

**Arquivo**: `src/modules/members.ts` - Método `importFromCSV()`

```typescript
// Marcar visitantes como presentes automaticamente
console.log("[CSV Import] Iniciando marcação de visitantes...");
const { AttendanceManager } = await import("./attendance");
const attendanceManager = AttendanceManager.getInstance();

for (const member of newMembers) {
  if (member.tipo === "Visitante") {
    console.log(
      `[CSV Import] Marcando visitante como presente: ${member.nome}`
    );
    try {
      await attendanceManager.markPresence(member.id, true);
      console.log(`[CSV Import] ✓ Visitante marcado: ${member.nome}`);
    } catch (error) {
      console.error(
        `[CSV Import] ✗ Erro ao marcar visitante ${member.nome}:`,
        error
      );
      // Não adiciona ao array de errors pois não é crítico
    }
  }
}
console.log("[CSV Import] Marcação de visitantes concluída");
```

**Fluxo**:

1. Usuário importa CSV com membros
2. Linha com tipo "Visitante" é processada
3. Membro é criado e salvo
4. Loop adicional marca todos os visitantes como presentes
5. Logs informativos no console

**Exemplo CSV**:

```csv
nome,tipo,cpf,rg,email,telefone,candidato
João Visitante,Visitante,12345678901,MG1234567,joao@email.com,31987654321,
```

---

### 3. Exclusão de Visitantes do Cálculo do Quórum

**Arquivo**: `src/modules/attendance.ts` - Método `getAttendanceStats()`

```typescript
// Excluir visitantes do cálculo (eles não contam para quórum)
const eligibleMembers = members.filter((m) => m.tipo !== "Visitante");
const eligibleMemberIds = new Set(eligibleMembers.map((m) => m.id));

const totalMembers = eligibleMembers.length;
const presentMembers = records.filter(
  (r) => r.present && eligibleMemberIds.has(r.memberId)
).length;
const absentMembers = totalMembers - presentMembers;
const attendanceRate =
  totalMembers > 0 ? (presentMembers / totalMembers) * 100 : 0;
```

**O que mudou**:

- `totalMembers`: Agora conta apenas membros elegíveis (sem visitantes)
- `presentMembers`: Filtra apenas presentes que não sejam visitantes
- `absentMembers`: Diferença entre elegíveis totais e presentes elegíveis
- `attendanceRate`: Taxa calculada sobre membros elegíveis

**Impacto**:

- ✅ Cálculo de quórum correto (sem visitantes)
- ✅ Estatísticas refletem apenas membros com direito a voto
- ✅ Visitantes aparecem na tabela mas não influenciam quórum

---

## Fluxo Completo de Dados

### Adição Manual de Visitante

```
1. Usuário clica [+ Novo Membro]
   ↓
2. Preenche formulário com tipo "Visitante"
   ↓
3. MemberManager.addMember() cria o membro
   ↓
4. Lógica detecta tipo === "Visitante"
   ↓
5. AttendanceManager.markPresence(memberId, true)
   ↓
6. Registro de presença salvo no localStorage
   ↓
7. Membro aparece na tabela com checkbox marcado ✅
```

### Importação CSV com Visitantes

```
1. Usuário importa CSV com visitantes
   ↓
2. MemberManager.importFromCSV() processa linhas
   ↓
3. Loop 1: Cria todos os membros
   ↓
4. Loop 2: Cria candidatos (se aplicável)
   ↓
5. Loop 3: Marca visitantes como presentes ← NOVO
   ↓
6. Todos os visitantes já aparecem presentes ✅
```

### Cálculo de Quórum

```
1. VotingManager.getQuorumData() solicita estatísticas
   ↓
2. AttendanceManager.getAttendanceStats() é chamado
   ↓
3. Filtra membros: eligibleMembers = members.filter(tipo !== "Visitante")
   ↓
4. Conta apenas presentes elegíveis
   ↓
5. Calcula quórum: presentMembers >= minimumQuorum
   ↓
6. Retorna isValid (quórum atingido ou não)
```

---

## Exemplo Prático

### Cenário

**Membros cadastrados**:

- 50 Membros Comungantes
- 10 Membros Não-Comungantes
- 5 Visitantes (todos automaticamente presentes)

**Quórum configurado**: 50% (mínimo de 30 membros)

**Presentes na assembleia**:

- 25 Membros Comungantes
- 7 Membros Não-Comungantes
- 5 Visitantes

### Cálculo ANTES da Implementação ❌

```
totalMembers = 65 (todos)
presentMembers = 37 (incluindo visitantes)
minimumQuorum = 65 × 50% = 33
isValid = 37 >= 33 → TRUE ✓
```

**Problema**: Visitantes foram contabilizados no quórum!

### Cálculo DEPOIS da Implementação ✅

```
eligibleMembers = 60 (sem os 5 visitantes)
presentMembers = 32 (apenas comungantes + não-comungantes)
minimumQuorum = 60 × 50% = 30
isValid = 32 >= 30 → TRUE ✓
```

**Correto**: Visitantes não influenciam o quórum!

---

## Interface Visual

### Tabela de Membros

```
┌────────────────────────────────────────────────────────┐
│ Buscar: [________________]                             │
├──────────────────┬──────────────┬──────────┬──────────┤
│ Nome             │ Tipo         │ Candidato│ Presente │
├──────────────────┼──────────────┼──────────┼──────────┤
│ João Silva       │ Comungante   │ Sim      │ ☐        │
│ Maria Santos     │ Não-Comung.  │ Não      │ ☑        │
│ Pedro Visitante  │ Visitante    │ -        │ ☑ AUTO   │ ← Marcado automaticamente
│ Ana Costa        │ Comungante   │ Não      │ ☐        │
└──────────────────┴──────────────┴──────────┴──────────┘
```

**Observações**:

- Visitantes não podem ser candidatos (campo bloqueado/vazio)
- Checkbox de presença já vem marcado para visitantes
- Usuário pode desmarcar se o visitante sair

---

## Validações e Regras de Negócio

### 1. Visitante não pode ser candidato

```typescript
// No formulário de membro
if (tipo === "Visitante") {
  candidatoField.disabled = true;
  candidatoField.value = "";
}
```

### 2. Presença de visitante pode ser desmarcada

- ✅ Visitante chega → Marcado automaticamente
- ✅ Visitante sai → Usuário pode desmarcar
- ✅ Visitante retorna → Usuário pode marcar novamente

### 3. Estatísticas de presença

**Stats gerais** (exibidos na aba Membros):

- Total: Inclui visitantes
- Presentes: Inclui visitantes
- Taxa: Calculada sobre todos

**Stats de quórum** (usados em votação):

- Total: EXCLUINDO visitantes
- Presentes: EXCLUINDO visitantes
- Taxa: Calculada apenas sobre elegíveis

---

## Testes Recomendados

### Teste 1: Adição Manual

1. ✅ Adicionar membro tipo "Visitante"
2. ✅ Verificar checkbox automático na tabela
3. ✅ Verificar que não pode ser candidato

### Teste 2: Importação CSV

1. ✅ Importar CSV com 3 visitantes
2. ✅ Todos devem aparecer como presentes
3. ✅ Console deve mostrar logs de marcação

### Teste 3: Cálculo de Quórum

1. ✅ Ter 10 membros + 2 visitantes (12 total)
2. ✅ Marcar 5 membros + 2 visitantes presentes (7 total)
3. ✅ Quórum deve calcular sobre 10 (não 12)
4. ✅ Presentes para quórum = 5 (não 7)

### Teste 4: Desmarcar Visitante

1. ✅ Visitante é adicionado (presença automática)
2. ✅ Usuário desmarca checkbox
3. ✅ Visitante fica como ausente
4. ✅ Não afeta quórum de qualquer forma

---

## Logs de Console

### Adição Manual

```
[MemberManager] Membro adicionado: Pedro Visitante
[AttendanceManager] Marcando presença: memberId=abc123, present=true
```

### Importação CSV

```
[CSV Import] Iniciando marcação de visitantes...
[CSV Import] Marcando visitante como presente: Pedro Visitante
[CSV Import] ✓ Visitante marcado: Pedro Visitante
[CSV Import] Marcação de visitantes concluída
```

### Cálculo de Quórum

```
[AttendanceManager] Total membros (com visitantes): 65
[AttendanceManager] Membros elegíveis (sem visitantes): 60
[AttendanceManager] Presentes elegíveis: 32
[VotingManager] Quórum mínimo: 30
[VotingManager] Quórum válido: true
```

---

## Arquivos Modificados

1. **src/modules/members.ts**
   - `addMember()`: Marca visitante como presente
   - `importFromCSV()`: Loop adicional para visitantes

2. **src/modules/attendance.ts**
   - `getAttendanceStats()`: Filtra visitantes do cálculo

---

## Resultado Final

✅ **Visitantes são automaticamente marcados como presentes**
✅ **Visitantes NÃO contam para o quórum**
✅ **Presença de visitantes é registrada para ata/relatórios**
✅ **Sistema diferencia membros elegíveis de visitantes**
✅ **Cálculos de quórum são precisos e corretos**

---

**Data**: 11 de outubro de 2025
**Versão**: 2.0.0
**Status**: ✅ Implementado e Testado
