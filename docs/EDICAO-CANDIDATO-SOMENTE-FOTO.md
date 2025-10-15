# Restrição: Edição de Candidato Apenas para Foto

**Data:** 11/10/2025  
**Categoria:** Business Rule / UX Improvement  
**Módulo:** `src/ui/manager.ts`

## Requisito

Na aba **Candidatos**, ao clicar no botão **Editar Candidato**, permitir **apenas** a adição, alteração e remoção da foto. **Não permitir** edição de nome ou cargo, pois essas alterações devem ser feitas exclusivamente na aba **Membros**.

## Justificativa

### Separação de Responsabilidades

1. **Aba Membros**: Fonte da verdade para dados pessoais e status de candidatura
   - Editar nome, tipo de membro, CPF, RG, email, telefone
   - Definir se é candidato e qual cargo (Presbítero/Diácono)
   - Alterações aqui propagam automaticamente para Candidatos

2. **Aba Candidatos**: Gestão visual e votação
   - Adicionar/remover foto do candidato
   - Visualizar lista de candidatos
   - Gerenciar votação (futura funcionalidade)

### Benefícios

- ✅ **Consistência de dados**: Uma única fonte para nome e cargo
- ✅ **UX simplificada**: Interface de edição focada apenas na foto
- ✅ **Menor risco de erro**: Impossível criar inconsistências entre abas
- ✅ **Clareza de fluxo**: Usuário sabe onde fazer cada tipo de alteração

## Implementação

### 1. Modo Edição - Campos Informativos (Readonly)

Quando o usuário clica em **Editar Candidato**, o formulário exibe:

```
┌─────────────────────────────────────┐
│ Editar Candidato                    │
├─────────────────────────────────────┤
│ Foto do Candidato                   │
│ [Preview da foto]                   │
│ [Escolher Foto] [Remover]           │
├─────────────────────────────────────┤
│ Nome do Candidato                   │
│ [João da Silva] (readonly)          │
├─────────────────────────────────────┤
│ Cargo                               │
│ [Presbítero] (readonly)             │
├─────────────────────────────────────┤
│ [Cancelar] [Salvar]                 │
└─────────────────────────────────────┘
```

### 2. Modo Adicionar - Todos os Campos Editáveis

Quando o usuário clica em **Novo Candidato**, o formulário exibe:

```
┌─────────────────────────────────────┐
│ Novo Candidato                      │
├─────────────────────────────────────┤
│ Foto do Candidato                   │
│ [Preview da foto]                   │
│ [Escolher Foto]                     │
├─────────────────────────────────────┤
│ Selecione o Membro Comungante *     │
│ [Buscar membro...]                  │
│ [Lista de membros - size=5]         │
├─────────────────────────────────────┤
│ Cargo *                             │
│ [Selecione o cargo ▼]               │
├─────────────────────────────────────┤
│ [Cancelar] [Salvar]                 │
└─────────────────────────────────────┘
```

## Alterações no Código

### Arquivo: `src/ui/manager.ts`

#### 1. Método `handleEditCandidate()` (linha ~910)

**Alterações:**

- Oculta `memberSelectGroup` (select de membro)
- Oculta `roleInputGroup` (select de cargo)
- Remove `required` de ambos os selects
- Cria dinamicamente `candidate-info-group` com dois campos readonly:
  - `candidate-info-name`: Nome do candidato
  - `candidate-info-role`: Cargo do candidato
- Armazena cargo no dataset: `form.dataset.candidateRole = candidate.role`

```typescript
// MODO EDIÇÃO: Ocultar selects (não editáveis)
if (memberSelectGroup) {
  memberSelectGroup.style.display = "none";
}
if (roleInputGroup) {
  roleInputGroup.style.display = "none";
}
// Remover required dos campos ocultos
if (memberSelect) {
  memberSelect.required = false;
}
if (roleInput) {
  roleInput.required = false;
}

// Criar campos informativos (readonly)
let candidateInfoGroup = document.getElementById("candidate-info-group");
if (!candidateInfoGroup) {
  candidateInfoGroup = document.createElement("div");
  candidateInfoGroup.id = "candidate-info-group";
  candidateInfoGroup.innerHTML = `
    <div class="form-group">
      <label>Nome do Candidato</label>
      <input type="text" id="candidate-info-name" class="form-input" readonly
             style="background-color: var(--gray-100); cursor: not-allowed;" />
    </div>
    <div class="form-group">
      <label>Cargo</label>
      <input type="text" id="candidate-info-role" class="form-input" readonly
             style="background-color: var(--gray-100); cursor: not-allowed;" />
    </div>
  `;
  roleInputGroup?.insertAdjacentElement("beforebegin", candidateInfoGroup);
}

// Preencher valores
candidateInfoName.value = candidate.name;
candidateInfoRole.value = candidate.role;
candidateInfoGroup.style.display = "block";

// Armazenar cargo no dataset
form.dataset.candidateRole = candidate.role;
```

#### 2. Método `handleAddCandidate()` (linha ~350)

**Alterações:**

- Mostra `memberSelectGroup` e `roleInputGroup`
- Oculta `candidateInfoGroup` (campos readonly)
- Reativa `required` em ambos os selects

```typescript
// MODO ADICIONAR: Mostrar selects, ocultar campos informativos
if (memberSelectGroup) {
  memberSelectGroup.style.display = "block";
}
if (roleInputGroup) {
  roleInputGroup.style.display = "block";
}
if (candidateInfoGroup) {
  candidateInfoGroup.style.display = "none";
}
// Reativar required nos selects
if (memberSelect) {
  memberSelect.required = true;
}
if (roleInput) {
  roleInput.required = true;
}
```

#### 3. Método `handleCandidateSubmit()` (linha ~1430)

**Alterações:**

- Lógica condicional para obter `role` e `memberId`:
  - **Modo Edição**: Pega do `form.dataset`
  - **Modo Criação**: Pega dos selects

```typescript
let role: CandidateRole;
let memberId: string;

if (editingId) {
  // MODO EDIÇÃO: usar dados armazenados no dataset
  memberId = form.dataset.memberId || "";
  role = (form.dataset.candidateRole as CandidateRole) || "";

  if (!memberId || !role) {
    NotificationService.show("Erro: dados não identificados", "error");
    return;
  }
} else {
  // MODO CRIAÇÃO: pegar dos selects
  memberId = memberSelect.value;
  role = roleInput.value as CandidateRole;

  if (!memberId || !role) {
    NotificationService.show("Por favor, preencha todos os campos", "error");
    return;
  }
}
```

**Limpeza do dataset:**

```typescript
delete form.dataset.editingId;
delete form.dataset.photoUrl;
delete form.dataset.memberId;
delete form.dataset.candidateRole; // Adicionado
```

## Fluxo de Dados

### Editar Nome ou Cargo de um Candidato

```
1. Usuário vai para aba MEMBROS
2. Localiza o membro na tabela
3. Clica em "Editar"
4. Altera nome ou campo "Candidato" (Presbítero/Diácono)
5. Salva
6. Sistema atualiza automaticamente a aba CANDIDATOS
   (sincronização via updateMemberCandidateRole)
```

### Adicionar/Alterar Foto de um Candidato

```
1. Usuário vai para aba CANDIDATOS
2. Clica em "Editar" no card do candidato
3. Clica em "Escolher Foto" ou "Remover"
4. Salva
5. Sistema atualiza apenas a foto (nome e cargo preservados)
```

## Validações

### Modo Edição

- ✅ Nome e cargo são readonly (visual + cursor: not-allowed)
- ✅ Selects originais ocultos e sem `required`
- ✅ Dados vêm do `form.dataset` (não dos selects)
- ✅ Apenas photoUrl pode ser alterado

### Modo Adicionar

- ✅ Todos os campos editáveis
- ✅ Selects com validação `required`
- ✅ Dados vêm dos selects
- ✅ Nome, cargo e foto podem ser definidos

## Estilo Visual

### Campos Readonly

- **Background**: `var(--gray-100)` (#f3f4f6)
- **Cursor**: `not-allowed`
- **Aparência**: Cinza claro, indicando não-editável
- **Label**: Normal (não desabilitada)

### Campos Editáveis

- **Background**: Branco
- **Cursor**: `text` ou `pointer`
- **Aparência**: Padrão do sistema

## Testes Recomendados

### Modo Editar Candidato

- [ ] Abrir edição de candidato → nome e cargo aparecem readonly
- [ ] Tentar clicar nos campos nome/cargo → cursor "not-allowed"
- [ ] Alterar foto → salvar → foto atualizada, nome/cargo inalterados
- [ ] Remover foto → salvar → foto removida, nome/cargo inalterados

### Modo Adicionar Candidato

- [ ] Abrir novo candidato → todos os campos editáveis
- [ ] Selects aparecem normalmente (não aparecem campos readonly)
- [ ] Salvar sem preencher → validação HTML5 funciona
- [ ] Criar candidato completo → sucesso

### Sincronização entre Abas

- [ ] Editar nome na aba Membros → atualiza na aba Candidatos
- [ ] Editar cargo na aba Membros → atualiza na aba Candidatos
- [ ] Editar foto na aba Candidatos → não afeta dados na aba Membros

## Benefícios da Implementação

1. **Fonte Única da Verdade**: Aba Membros centraliza dados pessoais
2. **Interface Simplificada**: Modal de edição focado apenas na foto
3. **Menor Risco de Erro**: Impossível editar nome/cargo pela aba errada
4. **UX Clara**: Usuário entende onde fazer cada alteração
5. **Manutenibilidade**: Lógica de negócio mais explícita e fácil de manter

## Observações Importantes

- ⚠️ **Não é possível** alterar nome ou cargo pela aba Candidatos
- ✅ **É possível** alterar nome ou cargo pela aba Membros (atualiza automaticamente Candidatos)
- ✅ **É possível** adicionar/alterar/remover foto pela aba Candidatos
- ✅ **É possível** criar novo candidato pela aba Candidatos (todos os campos editáveis)
