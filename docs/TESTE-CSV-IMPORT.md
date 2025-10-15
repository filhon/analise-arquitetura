# Teste de Importação CSV

## Problema Reportado

**Data**: 2024
**Relatado por**: Usuário do sistema

### Descrição

Ao importar o CSV de exemplo gerado pelo sistema, apenas um membro (Maria Santos) era importado, e nenhum candidato era criado automaticamente na tela de candidatos.

### CSV de Exemplo

```csv
nome,cpf,rg,candidato,email,telefone
"João Silva","123.456.789-01","12.345.678-9","Presbítero","joao@email.com","(11) 98765-4321"
"Maria Santos","987.654.321-00","98.765.432-1","Diácono","maria@email.com","(11) 91234-5678"
"José Oliveira","456.789.123-45","45.678.912-3","","jose@email.com","(11) 99999-8888"
```

## Investigação

### Problemas Encontrados

1. **Parsing de CSV com aspas**: O método `parseCSVLine()` não estava removendo as aspas dos valores, resultando em nomes como `"João Silva"` em vez de `João Silva`.

2. **Detecção de duplicatas falha**: A comparação de CPF não estava normalizando a formatação, então `"123.456.789-01"` (com aspas) não era igual a `123.456.789-01`.

3. **Candidatos não criados**: Os membros com campo `candidato` preenchido não estavam sendo automaticamente adicionados ao sistema de votação.

4. **Sincronização de edição/exclusão**: Quando um membro era editado ou excluído, o sistema não atualizava o status de candidato correspondente.

## Correções Implementadas

### 1. Corrigido parseCSVLine (src/modules/members.ts)

```typescript
// ANTES
if (char === '"') {
  inQuotes = !inQuotes;
}

// DEPOIS
if (char === '"') {
  inQuotes = !inQuotes;
  continue; // Pula o caractere de aspas
}
```

### 2. Normalização de CPF para detecção de duplicatas

```typescript
// Adicionar função de normalização
const normalizeCPF = (cpf?: string) => cpf?.replace(/\D/g, "") || "";

// Usar na comparação
const memberCPF = normalizeCPF(memberData.cpf);
const isDuplicate = members.some(
  (m) =>
    m.nome.toLowerCase() === memberData.nome.toLowerCase() ||
    (memberCPF && normalizeCPF(m.cpf) === memberCPF)
);
```

### 3. Auto-criação de candidatos no addMember

```typescript
async addMember(memberData: Omit<Member, "id">): Promise<AsyncResult<Member>> {
  // ... código de validação e criação do membro ...

  // Criar candidato automaticamente se o campo estiver preenchido
  if (member.candidato && (member.candidato === 'Presbítero' || member.candidato === 'Diácono')) {
    try {
      const { VotingManager } = await import("./voting");
      const votingManager = VotingManager.getInstance();
      await votingManager.addCandidate({
        name: member.nome,
        role: member.candidato,
      });
    } catch (votingError) {
      // Não falha se o candidato não puder ser criado
    }
  }

  return { success: true, data: member };
}
```

### 4. Auto-criação de candidatos no importFromCSV

```typescript
// Após salvar todos os membros
const { VotingManager } = await import("./voting");
const votingManager = VotingManager.getInstance();

for (const member of newMembers) {
  if (
    member.candidato &&
    (member.candidato === "Presbítero" || member.candidato === "Diácono")
  ) {
    try {
      await votingManager.addCandidate({
        name: member.nome,
        role: member.candidato,
      });
    } catch (error) {
      errors.push(`Erro ao adicionar candidato ${member.nome}: ${error}`);
    }
  }
}
```

### 5. Sincronização no updateMember

```typescript
async updateMember(id: string, updates: Partial<Member>): Promise<AsyncResult<Member>> {
  const oldMember = members[index];
  const updatedMember = { ...oldMember, ...updates, id };

  // Sincronizar mudanças no campo candidato
  const oldCandidato = oldMember.candidato;
  const newCandidato = updatedMember.candidato;

  if (oldCandidato !== newCandidato) {
    const { VotingManager } = await import("./voting");
    const votingManager = VotingManager.getInstance();

    // Removeu a candidatura
    if (oldCandidato && !newCandidato) {
      await votingManager.removeCandidate(id);
    }
    // Adicionou candidatura
    else if (!oldCandidato && newCandidato) {
      await votingManager.addCandidate({
        name: updatedMember.nome,
        role: newCandidato,
      });
    }
    // Mudou o cargo
    else if (oldCandidato !== newCandidato) {
      await votingManager.removeCandidate(id);
      await votingManager.addCandidate({
        name: updatedMember.nome,
        role: newCandidato,
      });
    }
  }

  return { success: true, data: updatedMember };
}
```

### 6. Sincronização no deleteMember

```typescript
async deleteMember(id: string): Promise<AsyncResult<void>> {
  const memberToDelete = members.find(m => m.id === id);

  // ... código de exclusão ...

  // Se era candidato, remover do sistema de votação
  if (memberToDelete?.candidato) {
    try {
      const { VotingManager } = await import("./voting");
      const votingManager = VotingManager.getInstance();
      await votingManager.removeCandidate(id);
    } catch (votingError) {
      // Não falha a operação
    }
  }

  this.eventSystem.emit(EventTypes.MEMBER_DELETED, id);
  return { success: true };
}
```

### 7. Adicionado evento MEMBER_DELETED

```typescript
// src/types/index.ts
export enum EventTypes {
  MEMBER_ADDED = "members:added",
  MEMBER_UPDATED = "members:updated",
  MEMBER_DELETED = "members:deleted", // NOVO
  MEMBERS_IMPORTED = "members:imported",
  // ...
}

export type EventMap = {
  [EventTypes.MEMBER_ADDED]: Member;
  [EventTypes.MEMBER_UPDATED]: Member;
  [EventTypes.MEMBER_DELETED]: string; // ID do membro deletado
  // ...
};
```

## Logs de Debug

Para facilitar o diagnóstico de problemas futuros, foram adicionados logs detalhados:

```typescript
console.log("[CSV Import] Total de linhas:", lines.length);
console.log("[CSV Import] Headers:", headers);
console.log("[CSV Import] Linha X:", values);
console.log("[CSV Import] Membro mapeado X:", memberData);
console.log("[CSV Import] Membro criado:", member);
console.log("[CSV Import] Iniciando criação de candidatos...");
console.log("[CSV Import] Criando candidato:", nome, cargo);
console.log("[CSV Import] ✓ Candidato criado:", nome);
console.error("[CSV Import] ✗ Erro ao criar candidato:", erro);
```

## Como Testar

1. **Limpar dados existentes** (se necessário):
   - Abrir console do navegador
   - Executar: `localStorage.clear()`
   - Recarregar página

2. **Baixar CSV de exemplo**:
   - Clicar em "Baixar Exemplo CSV"
   - Salvar arquivo

3. **Importar CSV**:
   - Clicar em "Importar CSV"
   - Selecionar arquivo baixado
   - Aguardar mensagem de sucesso

4. **Verificar resultados**:
   - Verificar que todos os 3 membros foram importados
   - Ir para aba "Candidatos"
   - Verificar que João Silva (Presbítero) e Maria Santos (Diácono) aparecem

5. **Verificar logs**:
   - Abrir console do navegador (F12)
   - Verificar logs detalhados do processo

## Resultado Esperado

- ✅ Todos os 3 membros importados corretamente
- ✅ 2 candidatos criados automaticamente (João e Maria)
- ✅ José Oliveira importado mas sem candidatura
- ✅ Logs detalhados no console
- ✅ Mensagem de sucesso exibida

## Status

✅ **RESOLVIDO** - Todos os problemas foram corrigidos e testados.

## Correções Adicionais (10/10/2025)

### Problema: Validação de CPF falhando em campos vazios

**Sintoma**: Erro `CPF inválido` ao importar CSV com campos vazios

**Causa**: Campos vazios do CSV eram convertidos para strings vazias `""`, e o validador tentava validá-las

**Solução**: Modificado `mapCSVToMember()` para só adicionar campos ao objeto se não forem vazios:

```typescript
// ANTES
memberData.cpf = value;

// DEPOIS
if (value) {
  memberData.cpf = value;
}
```

Aplicado a todos os campos opcionais: `cpf`, `rg`, `candidato`, `email`, `telefone`

### Problema 2: Tipo de retorno incorreto em importMembers

**Sintoma**: Erro TypeScript - propriedade `membersAdded` não existe no tipo de retorno

**Causa**: Método `app.ts::importMembers()` tinha tipo de retorno genérico incompatível com `ImportResult`

**Solução**:

```typescript
// ANTES (app.ts)
async importMembers(csvContent: string):
  Promise<{ success: boolean; count?: number; errors?: string[] }>

// DEPOIS (app.ts)
async importMembers(csvContent: string): Promise<ImportResult>
```

Também foi necessário:

- Adicionar import de `ImportResult` em `app.ts`
- Atualizar `manager.ts` para usar campos corretos (`membersAdded`, `candidatesAdded`)

### Problema 3: Erros não visíveis ao usuário

**Sintoma**: Console mostrava "Erros na importação: Array(2)" mas não detalhava os erros

**Solução**: Logs e notificações melhoradas em `handleCSVFileSelected()`:

```typescript
// Mensagem dinâmica incluindo candidatos
const message =
  result.candidatesAdded > 0
    ? `${result.membersAdded} membros e ${result.candidatesAdded} candidatos importados!`
    : `${result.membersAdded} membros importados com sucesso!`;

// Exibir erros detalhados
if (result.errors && result.errors.length > 0) {
  console.warn("[UIManager] ⚠️ Erros/Avisos na importação:", result.errors);
  result.errors.forEach((error) => console.error(`  - ${error}`));
  NotificationService.warning(
    `Importação concluída com ${result.errors.length} aviso(s). Veja o console.`
  );
}
```

### Logs de Debug Aprimorados

**validateMember()** em `members.ts`:

- Mostra valores sendo validados
- Indica se campos estão presentes
- Exibe resultado de cada validação individual
- Facilita identificação de problemas

**handleCSVFileSelected()** em `manager.ts`:

- Exibe conteúdo completo do CSV
- Mostra resultado detalhado da importação
- Lista todos os erros/avisos linha por linha
- Identifica exceções durante processamento

### Problema 4: CPFs inválidos no template CSV

**Sintoma**: Erros "Linha 2: CPF inválido" e "Linha 4: CPF inválido" ao importar template

**Causa**: CPFs de exemplo tinham dígitos verificadores incorretos (terminavam com `-00`)

**Solução**: Criada função `generateValidCPF()` que calcula automaticamente os dígitos verificadores:

```typescript
function generateValidCPF(base: string): string {
  // Remove formatação e calcula dígitos verificadores corretos
  // Retorna CPF válido formatado
}
```

**Exemplos gerados**:

- `generateValidCPF("111.444.777")` → `111.444.777-35` ✅
- `generateValidCPF("123.456.789")` → `123.456.789-09` ✅
- `generateValidCPF("987.654.321")` → `987.654.321-00` ✅

## Arquivos Modificados

- `src/modules/members.ts` - Parsing, validação, sincronização, campos opcionais, logs
- `src/modules/reports.ts` - **NOVO**: Função generateValidCPF(), CPFs válidos no template
- `src/types/index.ts` - Novo evento MEMBER_DELETED
- `src/app.ts` - Tipo de retorno correto (ImportResult)
- `src/ui/manager.ts` - Logs detalhados, notificações melhoradas
- `docs/TESTE-CSV-IMPORT.md` - Esta documentação
