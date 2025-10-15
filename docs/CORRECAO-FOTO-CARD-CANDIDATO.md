# Correção: Foto não Aparecia no Card Após Edição

**Data:** 11/10/2025  
**Categoria:** Bug Fix  
**Módulo:** `src/ui/manager.ts`  
**Prioridade:** Alta

## Problema Identificado

Na aba **Candidatos**, ao clicar no botão **Editar Candidato**:

1. ✅ É possível selecionar uma foto
2. ✅ A foto aparece na miniatura (preview)
3. ❌ Ao clicar em **Salvar**, a foto **não fica visível** no card do candidato

## Causa Raiz

No método `handleCandidateSubmit()`, tanto em modo **edição** quanto em modo **criação**, o código estava buscando os dados do membro e usando `selectedMember.nome` para o campo `name` do candidato.

```typescript
// ❌ CÓDIGO PROBLEMÁTICO
const members = await electionApp.getMembers();
const selectedMember = members.find((m) => m.id === memberId);
const name = selectedMember.nome;

if (editingId) {
  // Atualizar candidato
  const updatedCandidates = allCandidates.map((c) =>
    c.id === editingId
      ? { ...c, name, role, photoUrl: photoUrl || c.photoUrl }
      : c
  );
}
```

### Por que isso causava o problema?

Quando o usuário edita **apenas a foto** de um candidato:

- O código busca o membro pelo ID
- Usa o nome **atual do membro** (que pode ter sido alterado na aba Membros)
- Atualiza o candidato com `name`, `role` E `photoUrl`
- **Problema**: Se o nome do membro mudou desde a criação do candidato, o sistema cria um **candidato duplicado** ou sobrescreve o errado
- Resultado: A foto parece "não salvar" porque está sendo salva no candidato errado

## Solução Implementada

### Separação de Lógica: Edição vs Criação

#### 1. Modo Edição (Atualizar Foto)

Em modo edição, **apenas a foto** deve ser alterada. Nome e cargo já existem no candidato:

```typescript
if (editingId) {
  // MODO EDIÇÃO: Atualizar apenas a foto do candidato existente
  const allCandidates = await electionApp.getCandidates();
  const candidate = allCandidates.find((c) => c.id === editingId);

  if (!candidate) {
    NotificationService.show("Candidato não encontrado", "error");
    return;
  }

  // Manter nome e cargo originais, atualizar apenas foto
  const updatedCandidates = allCandidates.map((c) =>
    c.id === editingId
      ? {
          ...c,
          photoUrl: photoUrl !== undefined ? photoUrl : c.photoUrl,
        }
      : c
  );

  localStorage.setItem("CANDIDATES", JSON.stringify(updatedCandidates));
  NotificationService.show("Foto atualizada com sucesso", "success");
}
```

#### 2. Modo Criação (Novo Candidato)

Em modo criação, buscar dados do membro é necessário:

```typescript
else {
  // MODO CRIAÇÃO: Buscar dados do membro para criar novo candidato
  const members = await electionApp.getMembers();
  const selectedMember = members.find((m) => m.id === memberId);

  if (!selectedMember) {
    NotificationService.show("Membro não encontrado", "error");
    return;
  }

  const name = selectedMember.nome;

  const candidateData = { name, role, photoUrl };
  const result = await electionApp.addCandidate(candidateData);

  if (result.success) {
    await this.updateMemberCandidateRole(memberId, role);
    NotificationService.show("Candidato adicionado com sucesso", "success");
  }
}
```

## Alterações no Código

### Arquivo: `src/ui/manager.ts` - Método `handleCandidateSubmit()` (linha ~1430)

**Antes:**

```typescript
// Busca membro para TODOS os casos
const members = await electionApp.getMembers();
const selectedMember = members.find((m) => m.id === memberId);
const name = selectedMember.nome;

if (editingId) {
  // Atualiza name, role E photoUrl
  const updatedCandidates = allCandidates.map((c) =>
    c.id === editingId
      ? { ...c, name, role, photoUrl: photoUrl || c.photoUrl }
      : c
  );
}
```

**Depois:**

```typescript
if (editingId) {
  // MODO EDIÇÃO: Atualiza APENAS photoUrl
  const candidate = allCandidates.find((c) => c.id === editingId);
  const updatedCandidates = allCandidates.map((c) =>
    c.id === editingId
      ? { ...c, photoUrl: photoUrl !== undefined ? photoUrl : c.photoUrl }
      : c
  );
  NotificationService.show("Foto atualizada com sucesso", "success");
} else {
  // MODO CRIAÇÃO: Busca membro e cria novo candidato
  const members = await electionApp.getMembers();
  const selectedMember = members.find((m) => m.id === memberId);
  const name = selectedMember.nome;
  // ... adicionar candidato
}
```

## Diferenças Importantes

### Modo Edição

- ✅ **NÃO busca** dados do membro
- ✅ **NÃO atualiza** nome ou cargo
- ✅ **APENAS atualiza** photoUrl
- ✅ Usa spread operator `...c` para manter todos os campos existentes
- ✅ Mensagem específica: "Foto atualizada com sucesso"

### Modo Criação

- ✅ **Busca** dados do membro (necessário para nome)
- ✅ **Usa** nome do membro e cargo selecionado
- ✅ **Cria** novo candidato com todos os dados
- ✅ Mensagem específica: "Candidato adicionado com sucesso"

## Fluxo Corrigido

### Editar Foto de Candidato Existente

```
1. Usuário clica "Editar" no card do candidato
2. Modal abre com:
   - Nome (readonly)
   - Cargo (readonly)
   - Foto (editável)
3. Usuário clica "Escolher Foto"
4. Seleciona imagem (max 2MB)
5. Preview atualiza (handlePhotoUpload)
6. form.dataset.photoUrl armazenado
7. Usuário clica "Salvar"
8. handleCandidateSubmit executa:
   - Identifica editingId (modo edição)
   - Busca candidato por ID
   - Atualiza APENAS photoUrl
   - Mantém name e role originais
   - Salva no localStorage
   - Recarrega lista de candidatos
9. ✅ Foto aparece no card corretamente!
```

### Criar Novo Candidato

```
1. Usuário clica "Novo Candidato"
2. Modal abre com todos os campos editáveis
3. Seleciona membro, cargo e foto
4. Clica "Salvar"
5. handleCandidateSubmit executa:
   - Identifica ausência de editingId (modo criação)
   - Busca membro por ID
   - Pega nome do membro
   - Cria novo candidato com name, role, photoUrl
   - Atualiza membro na aba Membros
   - Salva no localStorage
9. ✅ Candidato criado com sucesso!
```

## Validações

### Modo Edição

- [x] Foto pode ser adicionada (se não existia)
- [x] Foto pode ser alterada (se já existia)
- [x] Foto pode ser removida (botão "Remover")
- [x] Nome permanece inalterado
- [x] Cargo permanece inalterado
- [x] Foto aparece no card após salvar

### Modo Criação

- [x] Todos os campos funcionam normalmente
- [x] Nome vem do membro selecionado
- [x] Cargo vem do select
- [x] Foto opcional (pode criar sem foto)

## Testes Realizados

### Teste 1: Adicionar Foto em Candidato Sem Foto

1. Candidato sem foto (ícone de pessoa)
2. Editar → Escolher Foto → Selecionar imagem
3. Salvar
4. **Resultado**: ✅ Foto aparece no card

### Teste 2: Alterar Foto Existente

1. Candidato com foto A
2. Editar → Escolher Foto → Selecionar imagem B
3. Salvar
4. **Resultado**: ✅ Foto B aparece no card

### Teste 3: Remover Foto

1. Candidato com foto
2. Editar → Remover → Salvar
3. **Resultado**: ✅ Ícone de pessoa volta (sem foto)

### Teste 4: Criar Novo Candidato Com Foto

1. Novo Candidato → Selecionar membro, cargo e foto
2. Salvar
3. **Resultado**: ✅ Candidato criado com foto visível

### Teste 5: Nome do Membro Alterado

1. Criar candidato "João Silva"
2. Na aba Membros, alterar nome para "João Pedro Silva"
3. Na aba Candidatos, editar foto do candidato
4. **Resultado**: ✅ Nome permanece "João Silva" (não sobrescreve)

## Benefícios da Correção

1. ✅ **Foto salva corretamente**: Aparece no card após edição
2. ✅ **Integridade de dados**: Nome e cargo não são alterados inadvertidamente
3. ✅ **Lógica clara**: Separação entre edição (foto) e criação (todos os dados)
4. ✅ **Mensagens específicas**: Usuário entende o que foi atualizado
5. ✅ **Performance**: Não busca dados desnecessários em modo edição

## Lições Aprendidas

1. **Separar lógicas diferentes**: Edição e criação têm requisitos distintos
2. **Spread operator cuidadoso**: `{ ...c }` mantém campos não mencionados
3. **Validação de dados**: Verificar qual modo antes de buscar informações
4. **Mensagens contextuais**: Feedback específico para cada operação
5. **Test-driven**: Testar cenários edge (nome alterado, foto removida, etc.)

## Impacto

- ✅ **Zero breaking changes**: Modo criação continua funcionando normalmente
- ✅ **Bug crítico corrigido**: Foto agora salva e aparece corretamente
- ✅ **Código mais limpo**: Lógica mais clara e fácil de manter
- ✅ **UX melhorada**: Sistema se comporta conforme esperado pelo usuário
