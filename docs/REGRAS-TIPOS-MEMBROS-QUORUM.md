# Regras de Tipos de Membros e Quórum

## Requisito Atualizado (11/10/2025)

O sistema diferencia **três tipos de membros** com regras distintas para quórum e votação:

---

## 📋 Tipos de Membros

### 1. **Membro Comungante** ✅ (Com direito a voto)

**Características**:

- ✅ **Conta para quórum**: Incluído em TODOS os cálculos de quórum
- ✅ **Pode votar**: Tem direito a voto em eleições
- ✅ **Pode ser candidato**: Pode concorrer a Presbítero ou Diácono
- ✅ **Presença manual**: Marcada manualmente pelo operador

**Justificativa**: Membros em plena comunhão com a igreja, com direitos eclesiásticos completos.

---

### 2. **Membro Não-Comungante** ⚠️ (Sem direito a voto)

**Características**:

- ❌ **NÃO conta para quórum**: Excluído dos cálculos de quórum
- ❌ **NÃO pode votar**: Sem direito a voto
- ❌ **NÃO pode ser candidato**: Não pode concorrer a oficiais
- ✅ **Presença automática**: Marcado automaticamente como presente ao ser adicionado
- ✅ **Registro em ata**: Presença registrada apenas para documentação

**Justificativa**: Membros em processo de discipulado, ainda não admitidos à Santa Ceia.

---

### 3. **Visitante** 👤 (Sem direito a voto)

**Características**:

- ❌ **NÃO conta para quórum**: Excluído dos cálculos de quórum
- ❌ **NÃO pode votar**: Sem direito a voto
- ❌ **NÃO pode ser candidato**: Não pode concorrer a oficiais
- ✅ **Presença automática**: Marcado automaticamente como presente ao ser adicionado
- ✅ **Registro em ata**: Presença registrada apenas para documentação

**Justificativa**: Visitantes não possuem vínculo formal com a igreja.

---

## 🎯 Regras de Quórum

### Cálculo Correto

**Base de cálculo**: Apenas **Membros Comungantes**

```
Total Elegível = Contagem de Membros Comungantes
Presentes Elegíveis = Membros Comungantes marcados como presentes
Quórum Mínimo = Total Elegível × Percentual Configurado
Quórum Válido = Presentes Elegíveis >= Quórum Mínimo
```

**Exemplo Prático**:

```
Cadastrados no sistema:
- 50 Membros Comungantes
- 10 Membros Não-Comungantes
- 5 Visitantes
────────────────────────
Total: 65 pessoas

Presentes na Assembleia:
- 30 Membros Comungantes ✅
- 10 Membros Não-Comungantes (auto-presentes)
- 5 Visitantes (auto-presentes)
────────────────────────
Total Presentes: 45 pessoas

Cálculo de Quórum (50% configurado):
────────────────────────
Base: 50 (apenas comungantes)
Mínimo: 50 × 50% = 25
Presentes Elegíveis: 30
Resultado: QUÓRUM VÁLIDO ✅ (30 >= 25)
```

---

## 💻 Implementações Técnicas

### 1. Marcação Automática de Presença (Adição Manual)

**Arquivo**: `src/modules/members.ts` - Método `addMember()`

```typescript
// Marcar não-comungantes e visitantes como presentes automaticamente
// (Eles não contam para quórum, apenas para registro em ata)
if (
  newMember.tipo === "Visitante" ||
  newMember.tipo === "Membro Não-Comungante"
) {
  try {
    const { AttendanceManager } = await import("./attendance");
    const attendanceManager = AttendanceManager.getInstance();

    await attendanceManager.markPresence(newMember.id, true);
  } catch (error) {
    ErrorHandler.log(
      error as Error,
      "MemberManager.addMember.markNonVotingMemberPresent"
    );
  }
}
```

**Comportamento**:

- Ao adicionar "Membro Não-Comungante" → Marca presença automaticamente
- Ao adicionar "Visitante" → Marca presença automaticamente
- Ao adicionar "Membro Comungante" → Presença fica desmarcada (marcação manual)

---

### 2. Marcação Automática de Presença (Importação CSV)

**Arquivo**: `src/modules/members.ts` - Método `importFromCSV()`

```typescript
// Marcar não-comungantes e visitantes como presentes automaticamente
// (Eles não contam para quórum, apenas para registro em ata)
console.log("[CSV Import] Iniciando marcação de membros não-votantes...");
const { AttendanceManager } = await import("./attendance");
const attendanceManager = AttendanceManager.getInstance();

for (const member of newMembers) {
  if (member.tipo === "Visitante" || member.tipo === "Membro Não-Comungante") {
    console.log(
      `[CSV Import] Marcando como presente (${member.tipo}): ${member.nome}`
    );
    try {
      await attendanceManager.markPresence(member.id, true);
      console.log(`[CSV Import] ✓ Membro marcado: ${member.nome}`);
    } catch (error) {
      console.error(
        `[CSV Import] ✗ Erro ao marcar membro ${member.nome}:`,
        error
      );
    }
  }
}
console.log("[CSV Import] Marcação de membros não-votantes concluída");
```

**Logs Esperados**:

```
[CSV Import] Iniciando marcação de membros não-votantes...
[CSV Import] Marcando como presente (Visitante): Pedro Silva
[CSV Import] ✓ Membro marcado: Pedro Silva
[CSV Import] Marcando como presente (Membro Não-Comungante): Ana Costa
[CSV Import] ✓ Membro marcado: Ana Costa
[CSV Import] Marcação de membros não-votantes concluída
```

---

### 3. Exclusão do Cálculo de Quórum

**Arquivo**: `src/modules/attendance.ts` - Método `getAttendanceStats()`

```typescript
// Apenas Membros Comungantes contam para quórum e estatísticas
// Não-Comungantes e Visitantes são apenas para registro em ata
const eligibleMembers = members.filter((m) => m.tipo === "Membro Comungante");
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

- **ANTES**: Filtrava `tipo !== "Visitante"` (Não-Comungantes eram contabilizados ❌)
- **AGORA**: Filtra `tipo === "Membro Comungante"` (Apenas comungantes são contabilizados ✅)

**Resultado**:

```typescript
{
  totalMembers: 50,        // Apenas comungantes
  presentMembers: 30,      // Apenas comungantes presentes
  absentMembers: 20,       // Apenas comungantes ausentes
  attendanceRate: 60.0     // 30/50 = 60%
}
```

---

### 4. Validação de Candidatura

**Arquivo**: `src/modules/members.ts` - Método `validateMember()`

```typescript
// Validar que apenas Membros Comungantes podem ser candidatos
if (member.candidato && member.tipo !== "Membro Comungante") {
  return {
    isValid: false,
    errors: ["Apenas Membros Comungantes podem ser candidatos"],
  };
}
```

**Comportamento**:

- Tenta adicionar "Visitante" como candidato → **ERRO: Bloqueado**
- Tenta adicionar "Não-Comungante" como candidato → **ERRO: Bloqueado**
- Adiciona "Membro Comungante" como candidato → **OK: Permitido**

**Mensagem de Erro**:

```
"Apenas Membros Comungantes podem ser candidatos"
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Adicionar Membro Comungante

```
1. Usuário clica [+ Novo Membro]
   ↓
2. Preenche nome, tipo = "Membro Comungante"
   ↓
3. Marca campo "Candidato" (opcional)
   ↓
4. Sistema valida: OK (comungante pode ser candidato)
   ↓
5. Membro é criado
   ↓
6. Checkbox de presença fica DESMARCADO ⬜
   ↓
7. Operador marca presença manualmente quando chegar
```

---

### Fluxo 2: Adicionar Membro Não-Comungante

```
1. Usuário clica [+ Novo Membro]
   ↓
2. Preenche nome, tipo = "Membro Não-Comungante"
   ↓
3. Campo "Candidato" deve ficar vazio/desabilitado
   ↓
4. Se tentar marcar candidato → ERRO na validação
   ↓
5. Membro é criado
   ↓
6. Sistema detecta tipo !== "Membro Comungante"
   ↓
7. AttendanceManager.markPresence(id, true)
   ↓
8. Checkbox de presença fica MARCADO ✅
   ↓
9. Membro NÃO conta para quórum
```

---

### Fluxo 3: Adicionar Visitante

```
1. Usuário clica [+ Novo Membro]
   ↓
2. Preenche nome, tipo = "Visitante"
   ↓
3. Campo "Candidato" deve ficar vazio/desabilitado
   ↓
4. Se tentar marcar candidato → ERRO na validação
   ↓
5. Membro é criado
   ↓
6. Sistema detecta tipo === "Visitante"
   ↓
7. AttendanceManager.markPresence(id, true)
   ↓
8. Checkbox de presença fica MARCADO ✅
   ↓
9. Membro NÃO conta para quórum
```

---

### Fluxo 4: Importação CSV

```
CSV com 3 tipos de membros:
────────────────────────────────────────────────────────
nome,tipo,cpf,rg,email,telefone,candidato
João Silva,Membro Comungante,12345678901,MG1,joao@email.com,31987654321,Presbítero
Maria Costa,Membro Não-Comungante,98765432100,MG2,maria@email.com,31987654322,
Pedro Visitante,Visitante,11122233344,MG3,pedro@email.com,31987654323,
────────────────────────────────────────────────────────

Processamento:
────────────────────────────────────────────────────────
1. Loop 1: Criar todos os membros
   - João → criado, presença DESMARCADA
   - Maria → criada, presença DESMARCADA (ainda)
   - Pedro → criado, presença DESMARCADA (ainda)

2. Loop 2: Criar candidatos
   - João → Candidato a Presbítero criado ✅
   - Maria → Sem candidatura (não-comungante)
   - Pedro → Sem candidatura (visitante)

3. Loop 3: Marcar presença de não-votantes
   - João → Pula (comungante)
   - Maria → markPresence(true) ✅
   - Pedro → markPresence(true) ✅

Resultado Final:
────────────────────────────────────────────────────────
João Silva: Comungante, Candidato, Presença ⬜ (manual)
Maria Costa: Não-Comungante, Presença ✅ (auto)
Pedro Visitante: Visitante, Presença ✅ (auto)
```

---

## 📊 Interface Visual

### Tabela de Membros

```
┌─────────────────────┬──────────────────┬──────────┬──────────┐
│ Nome                │ Tipo             │ Candidato│ Presente │
├─────────────────────┼──────────────────┼──────────┼──────────┤
│ João Silva          │ Comungante       │ Sim      │ ⬜       │ ← Manual
│ Maria Costa         │ Não-Comungante   │ -        │ ✅ AUTO  │ ← Automático
│ Pedro Visitante     │ Visitante        │ -        │ ✅ AUTO  │ ← Automático
│ Ana Lima            │ Comungante       │ Não      │ ⬜       │ ← Manual
└─────────────────────┴──────────────────┴──────────┴──────────┘

Estatísticas de Quórum (exibidas no sistema):
────────────────────────────────────────────────
Total Elegível: 2 (apenas João e Ana)
Presentes Elegíveis: 0 (nenhum marcado ainda)
Quórum Mínimo: 1 (50% de 2)
Status: QUÓRUM INVÁLIDO ❌
```

---

## 🧪 Testes Recomendados

### Teste 1: Adicionar Comungante

- ✅ Adicionar "João" tipo "Membro Comungante"
- ✅ Verificar presença DESMARCADA
- ✅ Marcar como candidato → Deve permitir
- ✅ Verificar que conta para quórum

### Teste 2: Adicionar Não-Comungante

- ✅ Adicionar "Maria" tipo "Membro Não-Comungante"
- ✅ Verificar presença MARCADA automaticamente
- ✅ Tentar marcar como candidato → Deve bloquear
- ✅ Verificar que NÃO conta para quórum

### Teste 3: Adicionar Visitante

- ✅ Adicionar "Pedro" tipo "Visitante"
- ✅ Verificar presença MARCADA automaticamente
- ✅ Tentar marcar como candidato → Deve bloquear
- ✅ Verificar que NÃO conta para quórum

### Teste 4: Importação CSV

- ✅ Importar CSV com os 3 tipos
- ✅ Verificar logs no console
- ✅ Comungantes: presença desmarcada
- ✅ Não-Comungantes e Visitantes: presença marcada

### Teste 5: Cálculo de Quórum

- ✅ Ter 10 comungantes + 5 não-comungantes + 2 visitantes
- ✅ Marcar 5 comungantes presentes
- ✅ Verificar: Base = 10, Presentes = 5, Quórum = 50%
- ✅ Não-comungantes/visitantes não influenciam

### Teste 6: Validação de Candidatura

- ✅ Tentar criar não-comungante como candidato → ERRO
- ✅ Tentar criar visitante como candidato → ERRO
- ✅ Criar comungante como candidato → SUCESSO

---

## 📝 Logs de Console

### Adição Manual

```
[MemberManager] Membro adicionado: Maria Costa (Membro Não-Comungante)
[AttendanceManager] Marcando presença: memberId=abc123, present=true
```

### Importação CSV

```
[CSV Import] Iniciando marcação de membros não-votantes...
[CSV Import] Marcando como presente (Membro Não-Comungante): Maria Costa
[CSV Import] ✓ Membro marcado: Maria Costa
[CSV Import] Marcando como presente (Visitante): Pedro Visitante
[CSV Import] ✓ Membro marcado: Pedro Visitante
[CSV Import] Marcação de membros não-votantes concluída
```

### Validação de Candidatura Bloqueada

```
[MemberManager] Validação falhou: Apenas Membros Comungantes podem ser candidatos
```

### Cálculo de Quórum

```
[AttendanceManager] Total de membros: 17
[AttendanceManager] Filtrando apenas Membros Comungantes...
[AttendanceManager] Membros elegíveis: 10
[AttendanceManager] Presentes elegíveis: 5
[VotingManager] Quórum mínimo: 5 (50% de 10)
[VotingManager] Quórum válido: true ✅
```

---

## 📁 Arquivos Modificados

### 1. `src/modules/members.ts`

- **addMember()**: Marca não-comungantes e visitantes como presentes
- **importFromCSV()**: Loop adicional para marcar não-votantes
- **validateMember()**: Valida que apenas comungantes podem ser candidatos

### 2. `src/modules/attendance.ts`

- **getAttendanceStats()**: Filtra apenas `tipo === "Membro Comungante"`

---

## ✅ Resultado Final

### Regras Implementadas

| Tipo                      | Quórum | Voto   | Candidato | Presença   |
| ------------------------- | ------ | ------ | --------- | ---------- |
| **Membro Comungante**     | ✅ Sim | ✅ Sim | ✅ Sim    | Manual     |
| **Membro Não-Comungante** | ❌ Não | ❌ Não | ❌ Não    | Automática |
| **Visitante**             | ❌ Não | ❌ Não | ❌ Não    | Automática |

### Cálculos de Quórum

```
Base de Cálculo = APENAS Membros Comungantes
Presentes Elegíveis = APENAS Membros Comungantes marcados
Quórum = Calculado sobre base de comungantes
```

### Validações

✅ **Apenas comungantes** podem ser candidatos  
✅ **Não-comungantes e visitantes** têm presença automática  
✅ **Quórum** calculado corretamente (só comungantes)  
✅ **Registro em ata** inclui todos os tipos

---

**Data**: 11 de outubro de 2025  
**Versão**: 2.1.0  
**Status**: ✅ Implementado e Testado
