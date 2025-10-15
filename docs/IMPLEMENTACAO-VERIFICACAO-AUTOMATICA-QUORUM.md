# Implementação: Verificação Automática de Configuração de Quórum

**Data:** 12/10/2025  
**Tipo:** ✨ Nova Funcionalidade  
**Status:** ✅ Implementado

## 🎯 Objetivo

Ao abrir o sistema (carregar a página), verificar **automaticamente** se há configuração de quórum armazenada no Firebase. Caso não haja, abrir o modal de "Configuração de Quórum" automaticamente para o usuário.

## 🚀 Comportamento

### Cenário 1: Sem Configuração de Quórum

```
1. Usuário abre o sistema
2. Sistema verifica Firebase
3. ❌ Nenhuma configuração encontrada
4. 📋 Modal de configuração abre AUTOMATICAMENTE
5. Usuário preenche e salva
6. ✅ Sistema funciona normalmente
```

### Cenário 2: Com Configuração de Quórum

```
1. Usuário abre o sistema
2. Sistema verifica Firebase
3. ✅ Configuração encontrada
4. Sistema carrega normalmente
5. Usuário pode usar o sistema
```

## 🔧 Implementação

### 1. Novo Evento (types/index.ts)

```typescript
export enum EventTypes {
  // System
  QUORUM_UPDATED = "quorum:updated",
  QUORUM_CONFIG_REQUIRED = "quorum:config:required", // ← NOVO
  ERROR_OCCURRED = "error:occurred",
  APP_INITIALIZED = "app:initialized",
  APP_RESET = "app:reset",
  ...
}
```

**Propósito:** Evento disparado quando nenhuma configuração é encontrada.

---

### 2. Método de Verificação (app.ts)

```typescript
/**
 * Verifica se há configuração de quórum.
 * Se não houver, emite evento para abrir modal automaticamente.
 */
private async checkQuorumConfiguration(): Promise<void> {
  try {
    console.log("[ElectionApp] 🔍 Verificando configuração de quórum...");

    // Verificar no Firebase primeiro (fonte da verdade)
    const firebaseData = await RealtimeSync.getInstance().loadInitialState();

    // Verificar também no localStorage
    const localConfig = await this.votingManager.getQuorumConfig();

    const hasQuorumConfig = !!(firebaseData.config || localConfig);

    if (!hasQuorumConfig) {
      console.log(
        "[ElectionApp] ⚠️ Nenhuma configuração de quórum encontrada!"
      );
      console.log(
        "[ElectionApp] 📋 Abrindo modal de configuração automaticamente..."
      );

      // Emitir evento para UI abrir o modal
      this.eventSystem.emit(EventTypes.QUORUM_CONFIG_REQUIRED, {
        message: "Configuração de quórum necessária",
        timestamp: Date.now(),
      });
    } else {
      console.log(
        "[ElectionApp] ✓ Configuração de quórum encontrada:",
        firebaseData.config || localConfig
      );
    }
  } catch (error) {
    console.error(
      "[ElectionApp] ✗ Erro ao verificar configuração de quórum:",
      error
    );
    ErrorHandler.log(error as Error, "ElectionApp.checkQuorumConfiguration");
  }
}
```

**Características:**

- Verifica **Firebase primeiro** (fonte da verdade)
- Fallback para **localStorage** se Firebase não tiver
- Emite evento se nenhuma configuração for encontrada
- Logs detalhados para debug

---

### 3. Chamada na Inicialização (app.ts)

```typescript
async initialize(): Promise<{ success: boolean; error?: string }> {
  try {
    // ... código de inicialização ...

    console.log("[ElectionApp] ✓ Inicialização completa!");
    console.log(
      `[ElectionApp] 📡 Sincronização: ${RealtimeSync.getInstance().isActive() ? "ATIVA" : "INATIVA"}`
    );

    // ✅ NOVO: Verificar se há configuração de quórum
    await this.checkQuorumConfiguration();

    return { success: true };
  } catch (error) {
    // ... tratamento de erro ...
  }
}
```

**Momento:** Executado **APÓS** toda a inicialização estar completa.

---

### 4. Listener na UI (ui/manager.ts)

```typescript
private setupEventListeners(): void {
  // ... outros listeners ...

  // ✅ NOVO: Ouvir quando configuração de quórum é necessária
  electionApp.events.on(EventTypes.QUORUM_CONFIG_REQUIRED, () => {
    console.log(
      "[UIManager] 📋 Nenhuma configuração de quórum encontrada!"
    );
    console.log(
      "[UIManager] 🔓 Abrindo modal de configuração automaticamente..."
    );

    // Abrir modal de configuração de quórum
    this.handleConfigQuorum();
  });
}
```

**Ação:** Chama `handleConfigQuorum()` que abre o modal existente.

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────┐
│  1. Usuário abre o sistema              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  2. ElectionApp.initialize()            │
│     - Carrega módulos                   │
│     - Configura Firebase sync           │
│     - Carrega dados iniciais            │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  3. checkQuorumConfiguration()          │
│     - Verifica Firebase                 │
│     - Verifica localStorage             │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼─────────┐
│ Tem config?  │  │ Não tem config?│
│              │  │                │
│ ✅ Log +     │  │ ⚠️ Log +       │
│    Continua  │  │    Emite       │
│              │  │    Evento      │
└──────────────┘  └────┬───────────┘
                       │
        ┌──────────────▼──────────────┐
        │ EventTypes.QUORUM_CONFIG_   │
        │      REQUIRED               │
        └──────────────┬──────────────┘
                       │
        ┌──────────────▼──────────────┐
        │ UIManager.handleConfigQuorum│
        │                             │
        │ 📋 Abre modal de config     │
        └─────────────────────────────┘
```

## 📊 Logs de Console

### Com Configuração

```
[ElectionApp] ✓ Inicialização completa!
[ElectionApp] 📡 Sincronização: ATIVA
[ElectionApp] 🔍 Verificando configuração de quórum...
[ElectionApp] ✓ Configuração de quórum encontrada: {
  minimumPercentage: 50,
  presbyteroPositions: 3,
  diaconoPositions: 6,
  votesCriteria: "simple-majority",
  votesRequiredPercentage: -1
}
```

### Sem Configuração

```
[ElectionApp] ✓ Inicialização completa!
[ElectionApp] 📡 Sincronização: ATIVA
[ElectionApp] 🔍 Verificando configuração de quórum...
[ElectionApp] ⚠️ Nenhuma configuração de quórum encontrada!
[ElectionApp] 📋 Abrindo modal de configuração automaticamente...
[UIManager] 📋 Nenhuma configuração de quórum encontrada!
[UIManager] 🔓 Abrindo modal de configuração automaticamente...
```

## 🧪 Como Testar

### Teste 1: Sistema Novo (Sem Config)

```bash
# 1. Limpar localStorage
localStorage.clear()

# 2. Limpar Firebase (console do Firebase)
# Delete o node: /config

# 3. Recarregar página (F5)
# ✅ Resultado: Modal abre automaticamente
```

### Teste 2: Sistema Com Config

```bash
# 1. Ter config no Firebase OU localStorage

# 2. Recarregar página (F5)
# ✅ Resultado: Sistema carrega normalmente
```

### Teste 3: Config Apenas Local

```bash
# 1. Limpar Firebase (console do Firebase)
# 2. Ter config no localStorage

# 3. Recarregar página (F5)
# ✅ Resultado: Sistema carrega normalmente (usa localStorage)
```

### Teste 4: Config Apenas Firebase

```bash
# 1. Limpar localStorage
localStorage.removeItem('election-config')

# 2. Ter config no Firebase

# 3. Recarregar página (F5)
# ✅ Resultado: Sistema carrega do Firebase
```

## 🎨 UX Melhorada

### Antes

```
1. Usuário abre sistema
2. Tudo parece normal
3. Tenta votar
4. ❌ Erro: "Configure o quórum primeiro"
5. 😕 Usuário não sabe onde configurar
```

### Depois

```
1. Usuário abre sistema
2. 📋 Modal já está aberto
3. Mensagem clara: "Configure as regras de quórum"
4. Usuário preenche
5. ✅ Sistema pronto para uso
```

## 📁 Arquivos Modificados

| Arquivo              | Mudança                                   |
| -------------------- | ----------------------------------------- |
| `src/types/index.ts` | Adicionado `QUORUM_CONFIG_REQUIRED`       |
| `src/app.ts`         | Adicionado `checkQuorumConfiguration()`   |
| `src/app.ts`         | Chamada ao método na inicialização        |
| `src/ui/manager.ts`  | Listener para abrir modal automaticamente |

## ✅ Benefícios

1. **Onboarding Melhorado:** Novo usuário é guiado automaticamente
2. **Menos Erros:** Previne tentativas de votação sem configuração
3. **UX Intuitiva:** Sistema detecta e resolve problemas proativamente
4. **Dupla Verificação:** Firebase + localStorage (fallback)
5. **Logs Claros:** Debug facilitado com console detalhado

## 🔒 Segurança

- **Não bloqueia UI:** Modal pode ser fechado (usuário controla)
- **Não interrompe:** Só abre se realmente não houver config
- **Fallback robusto:** Verifica Firebase E localStorage
- **Error Handling:** Try-catch com logs apropriados

## 🚀 Próximos Passos

- [ ] Adicionar toast notification informando o motivo
- [ ] Considerar adicionar badge "Primeira configuração"
- [ ] Analytics: contar quantas vezes modal abre automaticamente
- [ ] Tour guiado para primeiros usuários

## 📚 Referências

- Padrão Observer (EventSystem)
- Firebase Realtime Database (fonte da verdade)
- Modal reutilizado: `handleConfigQuorum()`

---

**Status:** ✅ Implementado e testável
**Impacto:** Melhora significativa na experiência do primeiro uso
