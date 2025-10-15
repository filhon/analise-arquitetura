# Debug: Card Continua Sem Foto Após Edição

**Data:** 11/10/2025  
**Categoria:** Bug Fix / Debug  
**Módulo:** `src/ui/manager.ts`  
**Status:** Em Debug

## Problema Reportado

Após a primeira correção que separou a lógica de edição/criação, o problema persiste:

- ✅ É possível selecionar foto
- ✅ A foto aparece no preview
- ❌ Ao salvar, a foto **ainda não aparece** no card

## Hipóteses Investigadas

### Hipótese 1: Lógica de Renderização ❓

**Verificação:** `loadCandidatesData()` e `renderCandidateCard()`

```typescript
private renderCandidateCard(candidate: Candidate): string {
  const photoHtml = candidate.photoUrl
    ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" />`
    : `<span class="material-icons">person</span>`;
  // ...
}
```

**Resultado:** ✅ Lógica de renderização correta

### Hipótese 2: Problema no LocalStorage ❓

**Verificação:** Dados sendo salvos corretamente?

**Console logs adicionados:**

```typescript
console.log("[DEBUG] Editando candidato:", candidate);
console.log("[DEBUG] photoUrl do form.dataset:", photoUrl);
console.log("[DEBUG] photoUrl atual do candidato:", candidate.photoUrl);
console.log(
  "[DEBUG] Candidato atualizado:",
  updatedCandidates.find((c) => c.id === editingId)
);
```

**Aguardando teste do usuário** para verificar os logs no console.

### Hipótese 3: Problema com `undefined` vs String Vazia 🎯

**Identificado:** Quando a foto é removida, `delete form.dataset.photoUrl` faz com que `photoUrl` seja `undefined`.

**Cenários possíveis:**

1. **Foto não alterada**: `photoUrl === undefined` → mantém foto antiga ✅
2. **Foto adicionada**: `photoUrl === "data:image/..."` → adiciona foto ✅
3. **Foto removida**: `photoUrl === undefined` → mantém foto antiga ❌ **PROBLEMA!**

**Solução implementada:**

```typescript
// handleRemovePhoto() - Marca como string vazia ao invés de deletar
if (form) {
  form.dataset.photoUrl = ""; // ✅ Ao invés de: delete form.dataset.photoUrl;
}

// handleCandidateSubmit() - Trata string vazia como remoção
const updatedCandidates = allCandidates.map((c) =>
  c.id === editingId
    ? {
        ...c,
        photoUrl: photoUrl !== undefined ? photoUrl || undefined : c.photoUrl,
      }
    : c
);
```

**Lógica atualizada:**

- `photoUrl === undefined` → Não alterou, mantém valor atual
- `photoUrl === ""` → Removeu foto, converte para `undefined`
- `photoUrl === "data:..."` → Nova foto, salva valor

## Alterações Implementadas

### 1. Método `handleRemovePhoto()` (linha ~1090)

**Antes:**

```typescript
if (form) {
  delete form.dataset.photoUrl; // photoUrl fica undefined
}
```

**Depois:**

```typescript
if (form) {
  form.dataset.photoUrl = ""; // photoUrl fica string vazia (marca remoção)
}
```

### 2. Método `handleCandidateSubmit()` (linha ~1487)

**Antes:**

```typescript
photoUrl: photoUrl !== undefined ? photoUrl : c.photoUrl;
// Problema: não diferencia "não alterou" de "removeu"
```

**Depois:**

```typescript
photoUrl: photoUrl !== undefined ? photoUrl || undefined : c.photoUrl;
// photoUrl !== undefined → foi alterado (nova foto ou remoção)
// photoUrl || undefined → string vazia vira undefined, string com dados mantém
```

### 3. Console Logs para Debug (linha ~1485)

```typescript
console.log("[DEBUG] Editando candidato:", candidate);
console.log("[DEBUG] photoUrl do form.dataset:", photoUrl);
console.log("[DEBUG] photoUrl atual do candidato:", candidate.photoUrl);
console.log(
  "[DEBUG] Candidato atualizado:",
  updatedCandidates.find((c) => c.id === editingId)
);
```

## Testes de Validação

### Cenário 1: Adicionar Foto em Candidato Sem Foto

**Passos:**

1. Candidato sem foto (ícone person)
2. Editar → Escolher Foto → Selecionar imagem
3. Salvar

**Console esperado:**

```
[DEBUG] Editando candidato: { id: "123", name: "João", role: "Presbítero", photoUrl: undefined, votes: 0 }
[DEBUG] photoUrl do form.dataset: "data:image/jpeg;base64,/9j/4AAQ..."
[DEBUG] photoUrl atual do candidato: undefined
[DEBUG] Candidato atualizado: { id: "123", name: "João", role: "Presbítero", photoUrl: "data:image/jpeg;base64,/9j/4AAQ...", votes: 0 }
```

**Resultado esperado:** ✅ Foto aparece no card

### Cenário 2: Alterar Foto Existente

**Passos:**

1. Candidato com foto A
2. Editar → Escolher Foto → Selecionar imagem B
3. Salvar

**Console esperado:**

```
[DEBUG] Editando candidato: { id: "123", photoUrl: "data:image/jpeg;base64,FOTO_A..." }
[DEBUG] photoUrl do form.dataset: "data:image/jpeg;base64,FOTO_B..."
[DEBUG] photoUrl atual do candidato: "data:image/jpeg;base64,FOTO_A..."
[DEBUG] Candidato atualizado: { id: "123", photoUrl: "data:image/jpeg;base64,FOTO_B..." }
```

**Resultado esperado:** ✅ Foto B aparece no card

### Cenário 3: Remover Foto

**Passos:**

1. Candidato com foto
2. Editar → Remover → Salvar

**Console esperado:**

```
[DEBUG] Editando candidato: { id: "123", photoUrl: "data:image/jpeg;base64,..." }
[DEBUG] photoUrl do form.dataset: ""
[DEBUG] photoUrl atual do candidato: "data:image/jpeg;base64,..."
[DEBUG] Candidato atualizado: { id: "123", photoUrl: undefined }
```

**Resultado esperado:** ✅ Ícone person aparece (sem foto)

### Cenário 4: Abrir e Fechar Sem Alterar

**Passos:**

1. Candidato com foto
2. Editar → Cancelar (ou Salvar sem alterar)

**Console esperado:**

```
[DEBUG] Editando candidato: { id: "123", photoUrl: "data:image/jpeg;base64,..." }
[DEBUG] photoUrl do form.dataset: undefined (ou foto atual se já tinha)
[DEBUG] photoUrl atual do candidato: "data:image/jpeg;base64,..."
[DEBUG] Candidato atualizado: { id: "123", photoUrl: "data:image/jpeg;base64,..." }
```

**Resultado esperado:** ✅ Foto permanece inalterada

## Investigação Adicional Necessária

Se o problema persistir após essas correções, verificar:

### 1. LocalStorage Pode Estar Corrompido

```javascript
// No console do navegador (F12)
console.log(JSON.parse(localStorage.getItem("CANDIDATES")));
```

**Verificar:** O array de candidatos tem `photoUrl` correto?

### 2. Método `handleEditCandidate()` Não Está Carregando Foto

```typescript
// Linha ~975
if (candidate.photoUrl && photoPreview) {
  photoPreview.innerHTML = `<img src="${candidate.photoUrl}" ... />`;
  form.dataset.photoUrl = candidate.photoUrl; // ⚠️ Está setando?
}
```

### 3. Módulo `electionApp` Pode Estar Cacheando

```typescript
// Verificar se getCandidates() retorna dados atualizados
const allCandidates = await electionApp.getCandidates();
console.log("Candidatos do electionApp:", allCandidates);
```

### 4. Navegador Pode Estar Cacheando Imagem

- Testar em aba anônima
- Limpar cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+F5)

## Próximos Passos

1. **Usuário testa** no navegador (http://localhost:3001)
2. **Abre console** (F12 → Console)
3. **Edita candidato** e adiciona foto
4. **Observa logs** no console
5. **Relata** o que vê:
   - Os logs aparecem?
   - Qual é o valor de `photoUrl` em cada etapa?
   - A foto aparece no card após salvar?

## Comandos de Debug Manual

```javascript
// 1. Ver todos os candidatos
console.log(JSON.parse(localStorage.getItem("CANDIDATES")));

// 2. Ver candidato específico
const candidates = JSON.parse(localStorage.getItem("CANDIDATES"));
console.log(candidates.find((c) => c.name === "Nome do Candidato"));

// 3. Limpar localStorage (reset total)
localStorage.clear();
location.reload();

// 4. Ver dataset do formulário
const form = document.getElementById("candidate-form");
console.log(form.dataset);
```

## Status

- ✅ Hipótese 3 corrigida (undefined vs string vazia)
- ✅ Logs de debug adicionados
- ⏳ Aguardando teste do usuário para verificar logs
- ⏳ Se problema persistir, investigar Hipóteses 1, 2 ou investigações adicionais
