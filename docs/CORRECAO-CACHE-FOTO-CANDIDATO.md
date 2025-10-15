# Correção Final: Foto não Aparecia no Card Devido ao Cache

**Data:** 11/10/2025  
**Categoria:** Bug Fix - Cache  
**Módulos:** `src/ui/manager.ts`, `src/app.ts`, `src/modules/voting.ts`  
**Prioridade:** Crítica ✅

## Problema Identificado

Após extensa investigação com logs de debug, identificamos que:

1. ✅ A foto estava sendo **carregada corretamente** no upload
2. ✅ A foto estava sendo **salva corretamente** no localStorage
3. ❌ A foto **NÃO estava sendo exibida** no card após reload

### Causa Raiz: Cache do VotingManager

O log mostrava:

```
[DEBUG VotingManager.getCandidates] Retornando do cache
[DEBUG renderCandidateCard] hasPhotoUrl: false
```

O `VotingManager` possui um sistema de cache (`SmartCache`) que armazena os candidatos em memória para melhorar performance. Quando salvávamos a foto:

1. Atualizávamos o localStorage ✅
2. **NÃO limpávamos o cache** ❌
3. Ao recarregar a lista, `getCandidates()` retornava dados antigos do cache (sem foto)

## Solução Implementada

### 1. Método `clearCache()` no VotingManager

**Arquivo:** `src/modules/voting.ts` (linha ~485)

```typescript
clearCache(): void {
  console.log("[VotingManager] Limpando cache de candidatos");
  this.candidatesCache.clear();
}
```

### 2. Método `clearCandidatesCache()` no ElectionApp

**Arquivo:** `src/app.ts` (linha ~414)

```typescript
async clearCandidatesCache(): Promise<void> {
  this.votingManager.clearCache();
}
```

### 3. Chamada Após Salvar Foto

**Arquivo:** `src/ui/manager.ts` (linha ~1575)

```typescript
localStorage.setItem("CANDIDATES", JSON.stringify(updatedCandidates));

// IMPORTANTE: Limpar cache do VotingManager para forçar reload
await electionApp.clearCandidatesCache();
console.log("[DEBUG] Cache do VotingManager limpo");

// ... resto do código
NotificationService.show("Foto atualizada com sucesso", "success");
```

## Fluxo Corrigido

### Antes (Com Bug)

```
1. Usuário adiciona foto
2. handlePhotoUpload() → form.dataset.photoUrl = base64
3. Usuário clica Salvar
4. handleCandidateSubmit() → salva no localStorage
5. loadCandidatesData() → electionApp.getCandidates()
6. VotingManager.getCandidates() → RETORNA DO CACHE (dados antigos)
7. renderCandidateCard() → hasPhotoUrl: false ❌
```

### Depois (Corrigido)

```
1. Usuário adiciona foto
2. handlePhotoUpload() → form.dataset.photoUrl = base64
3. Usuário clica Salvar
4. handleCandidateSubmit() → salva no localStorage
5. electionApp.clearCandidatesCache() → LIMPA O CACHE ✅
6. loadCandidatesData() → electionApp.getCandidates()
7. VotingManager.getCandidates() → busca do localStorage (dados atualizados)
8. renderCandidateCard() → hasPhotoUrl: true ✅
9. Foto aparece no card! 🎉
```

## Logs de Debug Implementados

### 1. VotingManager.getCandidates()

```typescript
console.log("[DEBUG VotingManager.getCandidates] Retornando do cache");
console.log(
  "[DEBUG VotingManager.getCandidates] localStorage raw:",
  stored?.substring(0, 200)
);
console.log(
  "[DEBUG VotingManager.getCandidates] Formato dos dados:",
  Array.isArray(parsed) ? "ARRAY" : "OBJECT"
);
console.log(
  "[DEBUG VotingManager.getCandidates] Candidatos retornados:",
  candidates
);
```

### 2. handleCandidateSubmit()

```typescript
console.log("[DEBUG handleCandidateSubmit] Iniciando submit:", { editingId, photoUrl, ... });
console.log("[DEBUG] Cache do VotingManager limpo");
```

### 3. renderCandidateCard()

```typescript
console.log("[DEBUG renderCandidateCard] Renderizando card:", { hasPhotoUrl, photoUrlLength, ... });
console.log("[DEBUG renderCandidateCard] photoHtml gerado:", photoHtml.substring(0, 100));
```

## Testes de Validação

### Teste 1: Adicionar Foto em Candidato Sem Foto

**Esperado:**

```
[DEBUG handlePhotoUpload] Foto carregada: { fileSize, fileType, ... }
[DEBUG handleCandidateSubmit] Iniciando submit: { hasPhotoUrl: true, ... }
[DEBUG] Candidato atualizado: { photoUrl: "data:image/...", ... }
[DEBUG] Cache do VotingManager limpo
[DEBUG VotingManager.getCandidates] localStorage raw: [{"id":"...","photoUrl":"data:image/...
[DEBUG renderCandidateCard] hasPhotoUrl: true ✅
```

### Teste 2: Alterar Foto Existente

**Esperado:**

- Cache limpo
- Nova foto carregada do localStorage
- Card atualizado com nova foto

### Teste 3: Remover Foto

**Esperado:**

- Cache limpo
- photoUrl undefined no localStorage
- Ícone person aparece no card

## Problema Secundário Resolvido: Formato de Dados

Durante a investigação, também identificamos e corrigimos um problema de formato de dados:

**Antes:** localStorage salvava como `[{id, name, role, photoUrl}, ...]` (array)
**Leitura esperava:** `{ presbyteros: [...], diaconos: [...] }` (objeto)

**Solução:** Método `getCandidates()` agora aceita **ambos os formatos**:

```typescript
const parsed = JSON.parse(stored);

if (Array.isArray(parsed)) {
  // Formato novo: array direto
  candidates = parsed;
  if (role) {
    candidates = candidates.filter((c) => c.role === role);
  }
} else {
  // Formato antigo: objeto com categorias
  candidates = [...(parsed.presbyteros || []), ...(parsed.diaconos || [])];
}
```

## Alterações Realizadas

### Arquivo: `src/modules/voting.ts`

1. **Linha ~32-70**: Método `getCandidates()` atualizado
   - Aceita ambos os formatos (array e objeto)
   - Logs de debug adicionados
   - Retorna do cache ou busca do localStorage

2. **Linha ~485-488**: Novo método `clearCache()`
   - Limpa cache de candidatos
   - Log de confirmação

### Arquivo: `src/app.ts`

**Linha ~414-416**: Novo método `clearCandidatesCache()`

- Delega para `votingManager.clearCache()`

### Arquivo: `src/ui/manager.ts`

**Linha ~1575**: Chamada de limpeza de cache após salvar

- Garante que próxima leitura busca dados atualizados

## Benefícios da Correção

1. ✅ **Foto aparece imediatamente** após salvar
2. ✅ **Cache invalidado corretamente** quando dados mudam
3. ✅ **Performance mantida** (cache ainda usado quando dados não mudam)
4. ✅ **Logs de debug** facilitam futuras investigações
5. ✅ **Compatibilidade** com diferentes formatos de dados

## Lições Aprendidas

1. **Cache é ótimo, mas precisa ser invalidado corretamente**
   - Sempre limpar cache após mutações de dados
   - Logs ajudam a identificar problemas de cache

2. **Debug sistemático funciona**
   - Logs em cada etapa do fluxo revelaram o problema exato
   - Não assumir, verificar cada passo

3. **Formato de dados deve ser consistente**
   - Salvar e ler no mesmo formato
   - Ou suportar múltiplos formatos (retrocompatibilidade)

4. **TypeScript ajuda, mas não é suficiente**
   - Problema era em runtime (cache retornando dados antigos)
   - Testes e logs são essenciais

## Remoção de Logs de Debug (Futuro)

Após confirmar que tudo funciona, podemos remover ou comentar os logs:

```typescript
// Manter apenas em ambiente de desenvolvimento
if (process.env.NODE_ENV === "development") {
  console.log("[DEBUG] ...");
}
```

## Status

✅ **RESOLVIDO** - Foto agora aparece no card após salvar!

## Próximos Passos

1. ✅ Testar adição de foto
2. ✅ Testar alteração de foto
3. ✅ Testar remoção de foto
4. ✅ Confirmar sincronização com aba Membros
5. 📝 Limpar logs de debug (opcional)
