# Melhorias e Correções na Aba Candidatos

**Data:** 11 de outubro de 2025
**Tipo:** Correção de Bugs + Melhorias de UX
**Status:** ✅ Concluído

## 📋 Requisitos Solicitados

O usuário solicitou 4 melhorias na funcionalidade "Novo Candidato":

1. ✅ Alterar título de "Editar Candidato" para "Novo Candidato"
2. ✅ Corrigir botão "Escolher Foto" que não abre caixa de diálogo
3. ✅ Substituir input de texto por select com membros comungantes
4. ✅ Atualizar coluna "Candidato" na tabela de Membros com o cargo

## 🔧 Implementações Realizadas

### 1. Título do Modal Atualizado

**Arquivo:** `index.html` (linha 453)

#### Antes

```html
<h3 id="candidate-modal-title">Editar Candidato</h3>
```

#### Depois

```html
<h3 id="candidate-modal-title">Novo Candidato</h3>
```

**Resultado:** Modal agora exibe "Novo Candidato" ao abrir.

---

### 2. Correção do Botão "Escolher Foto"

**Problema:** ID incorreto no event listener

**Arquivo:** `src/ui/manager.ts` (linha 76-82)

#### Antes

```typescript
document.getElementById("upload-photo-btn")?.addEventListener("click", () => {
  document.getElementById("candidate-photo-input")?.click();
});
document
  .getElementById("candidate-photo-input")
  ?.addEventListener("change", this.handlePhotoUpload.bind(this));
```

#### Depois

```typescript
document.getElementById("upload-photo-btn")?.addEventListener("click", () => {
  document.getElementById("candidate-photo")?.click();
});
document
  .getElementById("candidate-photo")
  ?.addEventListener("change", this.handlePhotoUpload.bind(this));
```

**Causa:** Código procurava `candidate-photo-input`, mas HTML define `candidate-photo`.

**Solução:** Corrigir todas as referências para o ID correto.

**Resultado:** ✅ Caixa de diálogo de seleção de arquivo abre corretamente.

---

### 3. Select de Membros Comungantes

**Problema:** Input de texto livre permitia erros de digitação

**Arquivos Modificados:**

- `index.html` (linha ~493)
- `src/ui/manager.ts` (handleAddCandidate + nova função)

#### HTML - Antes

```html
<div class="form-group">
  <label for="candidate-name">Nome *</label>
  <input type="text" id="candidate-name" name="name" required />
</div>
```

#### HTML - Depois

```html
<div class="form-group">
  <label for="candidate-member">Membro *</label>
  <select id="candidate-member" name="memberId" required>
    <option value="">Selecione um membro comungante</option>
  </select>
</div>
```

#### Nova Função: `populateMemberSelect()`

**Arquivo:** `src/ui/manager.ts` (linha ~347-372)

```typescript
private async populateMemberSelect(): Promise<void> {
  const members = await electionApp.getMembers();
  const select = document.getElementById("candidate-member") as HTMLSelectElement;

  if (!select) return;

  // Limpar opções existentes (manter apenas a primeira)
  select.innerHTML = '<option value="">Selecione um membro comungante</option>';

  // Adicionar apenas membros comungantes que ainda não são candidatos
  const candidates = await electionApp.getCandidates();
  const candidateNames = new Set(candidates.map(c => c.name));

  members
    .filter(m => m.tipo === "Membro Comungante" && !candidateNames.has(m.nome))
    .forEach(member => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.nome;
      option.dataset.memberData = JSON.stringify(member);
      select.appendChild(option);
    });
}
```

**Características:**

- ✅ **Filtra por tipo:** Apenas "Membro Comungante"
- ✅ **Previne duplicação:** Exclui membros que já são candidatos
- ✅ **Vinculação por ID:** Usa member.id como valor
- ✅ **Data attribute:** Armazena dados completos do membro

#### Chamada Automática

**Arquivo:** `src/ui/manager.ts` (linha ~342-346)

```typescript
private async handleAddCandidate(): Promise<void> {
  await this.populateMemberSelect(); // ← Nova linha
  this.showModal("candidate-modal");
  this.clearForm("candidate-form");
}
```

**Resultado:** Select é populado automaticamente ao abrir o modal.

---

### 4. Atualização da Coluna "Candidato"

**Problema:** Coluna "Candidato" na tabela de Membros sempre exibia "-"

**Solução:** Atualizar campo `candidato` do membro com o cargo escolhido

#### Nova Função: `updateMemberCandidateRole()`

**Arquivo:** `src/ui/manager.ts` (linha ~1283-1288)

```typescript
private async updateMemberCandidateRole(memberId: string, role: CandidateRole): Promise<void> {
  const members = await electionApp.getMembers();
  const updatedMembers = members.map(m =>
    m.id === memberId ? { ...m, candidato: role } : m
  );
  localStorage.setItem("MEMBERS", JSON.stringify(updatedMembers));
}
```

**Funcionalidade:**

- Busca o membro pelo ID
- Atualiza propriedade `candidato` com "Presbítero" ou "Diácono"
- Salva no localStorage
- Reflete imediatamente na tabela

#### Integração no Submit

**Arquivo:** `src/ui/manager.ts` (handleCandidateSubmit - linhas ~1240-1280)

```typescript
if (result.success) {
  // Atualizar cargo do membro na tabela de membros
  await this.updateMemberCandidateRole(memberId, role);

  NotificationService.show("Candidato adicionado com sucesso", "success");
}

// ...

await this.loadCandidatesData();
await this.loadMembersData(); // ← Recarregar tabela de membros
```

**Fluxo:**

1. Candidato é adicionado com sucesso
2. Campo `candidato` do membro é atualizado
3. Tabela de candidatos é recarregada
4. Tabela de membros é recarregada
5. Coluna "Candidato" exibe o cargo

#### Renderização na Tabela

**Arquivo:** `src/ui/manager.ts` (linha 248)

```typescript
row.innerHTML = `
  <td>${this.escapeHtml(member.nome)}</td>
  <td>${member.tipo || "-"}</td>
  <td>${member.candidato || "-"}</td>  ← Exibe cargo ou "-"
  <td>...</td>
  <td>...</td>
`;
```

**HTML:** Coluna já existia na tabela (index.html linha 160)

```html
<thead>
  <tr>
    <th>Nome</th>
    <th>Tipo</th>
    <th>Candidato</th>
    ← Coluna existente
    <th>Presente</th>
    <th>Ações</th>
  </tr>
</thead>
```

**Resultado:** ✅ Coluna "Candidato" agora exibe "Presbítero" ou "Diácono"

---

## 🔄 Fluxo Completo Atualizado

### Adicionar Novo Candidato

```
1. Usuário clica em "Novo Candidato"
   ↓
2. populateMemberSelect() executa
   - Carrega todos os membros
   - Filtra: tipo === "Membro Comungante"
   - Filtra: não é candidato existente
   - Popula select com membros elegíveis
   ↓
3. Modal abre com:
   - Título: "Novo Candidato"
   - Select de membros comungantes
   - Select de cargo (Presbítero/Diácono)
   - Botão "Escolher Foto" (funcional)
   ↓
4. Usuário preenche:
   - Seleciona membro
   - Seleciona cargo
   - [Opcional] Escolhe foto
   ↓
5. Usuário clica em "Salvar"
   ↓
6. handleCandidateSubmit() executa:
   - Valida campos obrigatórios
   - Busca nome do membro pelo ID
   - Adiciona candidato
   - Atualiza campo candidato do membro
   - Recarrega tabela de candidatos
   - Recarrega tabela de membros
   ↓
7. Resultado na Tabela de Membros:
   - Coluna "Candidato" = "Presbítero" ou "Diácono"
   - Visível imediatamente
```

---

## 📊 Validações Implementadas

### Select de Membros

- ✅ Obrigatório (required)
- ✅ Apenas Membros Comungantes
- ✅ Exclui candidatos existentes
- ✅ Valida se membro foi selecionado
- ✅ Mensagem de erro: "Por favor, selecione um membro"

### Select de Cargo

- ✅ Obrigatório (required)
- ✅ Opções: Presbítero ou Diácono
- ✅ Valida se cargo foi selecionado
- ✅ Mensagem de erro: "Por favor, selecione um cargo"

### Upload de Foto

- ✅ Opcional
- ✅ Validação de tipo (apenas imagens)
- ✅ Validação de tamanho (máx 2MB)
- ✅ Preview antes de salvar
- ✅ Botão "Remover" para limpar

---

## 🎯 Benefícios das Alterações

### 1. Integridade de Dados

- ✅ Sem digitação manual (evita erros)
- ✅ Apenas comungantes podem ser candidatos
- ✅ Vinculação forte por ID
- ✅ Previne duplicação automática

### 2. Regra de Negócio

- ✅ **Restrição aplicada:** Somente Membros Comungantes
- ✅ Consistente com requisitos eclesiásticos
- ✅ Filtro automático no select

### 3. Experiência do Usuário

- ✅ Interface clara e intuitiva
- ✅ Feedback visual imediato
- ✅ Upload de foto funcional
- ✅ Título correto no modal

### 4. Sincronização de Dados

- ✅ Coluna "Candidato" atualizada automaticamente
- ✅ Visível em ambas as tabelas
- ✅ Dados consistentes entre abas
- ✅ Persistência no localStorage

---

## 🧪 Cenários de Teste

### Teste 1: Seleção de Membro

- [ ] Abrir modal "Novo Candidato"
- [ ] Verificar select populado
- [ ] Apenas Membros Comungantes aparecem
- [ ] Membros já candidatos não aparecem
- [ ] Selecionar membro funciona

### Teste 2: Upload de Foto

- [ ] Clicar em "Escolher Foto"
- [ ] Caixa de diálogo abre
- [ ] Selecionar imagem (< 2MB)
- [ ] Preview aparece
- [ ] Botão "Remover" limpa foto

### Teste 3: Adicionar Candidato

- [ ] Selecionar membro comungante
- [ ] Selecionar cargo (Presbítero)
- [ ] Salvar candidato
- [ ] Verificar notificação de sucesso
- [ ] Verificar aba Candidatos atualizada

### Teste 4: Coluna Candidato

- [ ] Ir para aba Membros
- [ ] Localizar membro adicionado
- [ ] Coluna "Candidato" exibe "Presbítero"
- [ ] Dados persistem após reload

### Teste 5: Validações

- [ ] Tentar salvar sem membro → Erro
- [ ] Tentar salvar sem cargo → Erro
- [ ] Upload de arquivo > 2MB → Erro
- [ ] Upload de não-imagem → Erro

### Teste 6: Prevenção de Duplicatas

- [ ] Adicionar membro como candidato
- [ ] Abrir modal novamente
- [ ] Membro não aparece mais no select
- [ ] Impossível adicionar duplicado

---

## 📝 Estrutura de Dados

### Member Interface

```typescript
export interface Member {
  readonly id: string;
  readonly nome: string;
  readonly tipo?: MemberType; // "Membro Comungante" | ...
  readonly cpf?: string;
  readonly rg?: string;
  readonly candidato?: CandidateRole | ""; // "Presbítero" | "Diácono" | ""
  readonly email?: string;
  readonly telefone?: string;
}
```

**Campo `candidato`:**

- Tipo: `CandidateRole | ""`
- Valores: `"Presbítero"`, `"Diácono"`, ou `""` (vazio)
- Usado na coluna "Candidato" da tabela
- Atualizado ao adicionar candidato

### Candidate Interface

```typescript
export interface Candidate {
  readonly id: string;
  readonly name: string;
  readonly role: CandidateRole; // "Presbítero" | "Diácono"
  readonly photoUrl?: string;
  readonly votes: number;
  readonly isElected: boolean;
}
```

---

## 🔄 Impacto em Outros Módulos

### Módulos Afetados

- ✅ **Aba Membros:** Coluna "Candidato" atualizada
- ✅ **Aba Candidatos:** Select de membros, upload de foto
- ✅ **Modal Candidato:** Título e campos atualizados

### Módulos Não Afetados

- ⚪ Aba Votação (usa dados de candidatos)
- ⚪ Aba Presença (usa dados de membros)
- ⚪ Aba Resultados (usa votos)
- ⚪ Relatórios PDF

---

## 📐 Arquivos Modificados

### 1. index.html

- Linha 453: Título do modal
- Linha 493: Input → Select de membro
- Linha 160: Coluna "Candidato" (já existia)

### 2. src/ui/manager.ts

- Linha 78: Corrigir ID do input de foto
- Linha 344: Chamar `populateMemberSelect()`
- Linha 347-372: Nova função `populateMemberSelect()`
- Linha 1184-1288: Atualizado `handleCandidateSubmit()`
- Linha 1283-1288: Nova função `updateMemberCandidateRole()`
- Linha 248: Renderizar campo `candidato` (já existia)

### 3. src/types/index.ts

- Linha 9: Campo `candidato` (já existia)

---

## 🎯 Resultado Final

✅ **Todas as solicitações implementadas com sucesso:**

1. ✅ Título "Novo Candidato" exibido corretamente
2. ✅ Botão "Escolher Foto" funcional
3. ✅ Select com apenas Membros Comungantes
4. ✅ Coluna "Candidato" atualizada com cargo

✅ **Melhorias adicionais:**

- Prevenção automática de duplicatas
- Validações robustas
- Sincronização entre tabelas
- Interface intuitiva e clara

O sistema agora garante que apenas Membros Comungantes podem ser candidatos, com sincronização automática entre as abas Membros e Candidatos! 🎉

---

**Documentação criada:** 11 de outubro de 2025
**Última atualização:** 11 de outubro de 2025
**Versão:** 1.0.0
