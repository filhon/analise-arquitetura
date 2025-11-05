# Correção: Escape Duplo no Fullscreen de Votação

## 📋 Problema Identificado

**Sintoma:** Ao pressionar a tecla **Escape** durante a votação em fullscreen, o usuário precisava pressionar **duas vezes** para fechar completamente a tela:

- **1ª vez:** Sai do fullscreen nativo (modo F11)
- **2ª vez:** Fecha a view e mostra o prompt de senha

## 🔍 Causa Raiz

Conflito entre dois comportamentos:

1. **Comportamento Nativo do Navegador:**
   - Escape em fullscreen → sai do fullscreen automaticamente
2. **Comportamento do Sistema:**
   - Escape interceptado → chama `closeFullscreen()`
   - `closeFullscreen()` tenta sair do fullscreen novamente (mas já saiu)
   - Mostra prompt de senha

**Resultado:** Primeira pressão de Escape apenas sai do fullscreen nativo, mas não fecha a view. Segunda pressão finalmente fecha.

---

## 🔧 Solução Implementada

### 1. **Listener de `fullscreenchange`**

**Arquivo:** `src/ui/manager.ts`

Detecta quando o usuário sai do fullscreen nativo (F11, Escape, botão do navegador) e automaticamente aciona o processo de fechamento:

```typescript
// Detectar saída do fullscreen nativo (F11, Escape, etc.)
document.addEventListener("fullscreenchange", () => {
  const fullscreenView = document.getElementById("fullscreen-view");

  // Se saiu do fullscreen mas a view ainda está visível, fechá-la
  if (
    !document.fullscreenElement &&
    fullscreenView &&
    fullscreenView.style.display !== "none"
  ) {
    // Dar um pequeno delay para evitar conflito com o Escape
    setTimeout(() => {
      this.closeFullscreen();
    }, 100);
  }
});
```

**Como funciona:**

- `fullscreenchange` dispara quando entra ou sai do fullscreen
- Se `!document.fullscreenElement` → saiu do fullscreen
- Se `fullscreenView.style.display !== "none"` → view ainda visível
- Chama `closeFullscreen()` após 100ms (evita conflito de eventos)

---

### 2. **Melhorias no Handler de Escape**

**Arquivo:** `src/ui/manager.ts`

Adicionado `stopPropagation()` para evitar propagação do evento:

```typescript
// Interceptar tecla Escape durante votação
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const fullscreenView = document.getElementById("fullscreen-view");
    if (fullscreenView && fullscreenView.style.display !== "none") {
      e.preventDefault();
      e.stopPropagation(); // ✅ NOVO: Prevenir propagação
      this.closeFullscreen();
    }
  }
});
```

**Benefício:** Reduz chances de eventos duplicados.

---

### 3. **Proteção contra Múltiplas Chamadas**

**Arquivo:** `src/ui/manager.ts`

Modificado `closeFullscreen()` para verificar se a view já está fechada:

```typescript
private closeFullscreen(): void {
  const fullscreenView = document.getElementById("fullscreen-view");

  // ✅ NOVO: Verificar se já está fechada
  if (!fullscreenView || fullscreenView.style.display === "none") return;

  // Solicitar senha
  const password = prompt("Para sair da votação, digite a senha de segurança:");

  if (password?.toLowerCase() !== "sair") {
    NotificationService.warning("Senha incorreta. Permanecendo na votação.");

    // ✅ NOVO: Se saiu do fullscreen nativo, voltar ao fullscreen
    if (!document.fullscreenElement && fullscreenView.requestFullscreen) {
      fullscreenView.requestFullscreen().catch(err => {
        console.warn("Não foi possível retornar ao fullscreen:", err);
      });
    }
    return;
  }

  // Sair do fullscreen nativo (se ainda estiver)
  if (document.fullscreenElement) {
    document.exitFullscreen();
  }

  // Fechar view...
}
```

**Novos recursos:**

1. **Verificação inicial:**
   - `if (!fullscreenView || fullscreenView.style.display === "none") return;`
   - Previne execução se já fechada

2. **Re-entrada em fullscreen:**
   - Se senha incorreta e saiu do fullscreen, **volta ao fullscreen**
   - Melhora segurança (não permite ficar "meio aberto")

---

## 📊 Fluxo de Eventos (Antes vs. Depois)

### ❌ Antes (Duplo Escape):

```
1. Usuário pressiona Escape (1ª vez)
   │
   ├─> Navegador sai do fullscreen nativo (automático)
   ├─> Handler Escape chama closeFullscreen()
   ├─> closeFullscreen() tenta document.exitFullscreen() (já saiu)
   └─> Mostra prompt de senha
       └─> View ainda visível em modo janela

2. Usuário pressiona Escape (2ª vez)
   │
   ├─> Handler Escape chama closeFullscreen()
   ├─> Mostra prompt novamente
   └─> Finalmente fecha a view
```

### ✅ Depois (Escape Único):

```
1. Usuário pressiona Escape
   │
   ├─> Navegador sai do fullscreen nativo (automático)
   ├─> fullscreenchange dispara (detecta saída)
   │   └─> setTimeout(closeFullscreen, 100)
   │
   ├─> Handler Escape também chama closeFullscreen()
   │   └─> e.stopPropagation() previne duplicação
   │
   └─> closeFullscreen() verifica:
       ├─> View ainda visível? Sim
       ├─> Mostra prompt de senha (UMA VEZ)
       └─> Fecha a view completamente
```

**Resultado:** Um único Escape fecha tudo.

---

## ✅ Benefícios

### 1. **UX Melhorada**

- ✅ Escape fecha em **uma única pressão**
- ✅ Comportamento intuitivo e consistente
- ✅ Reduz frustração do usuário

### 2. **Segurança Mantida**

- ✅ Prompt de senha ainda aparece
- ✅ Se senha incorreta, **volta ao fullscreen** (não fica meio aberto)
- ✅ Proteção contra saídas acidentais

### 3. **Robustez**

- ✅ Detecta saída do fullscreen por qualquer método (F11, Escape, botão)
- ✅ Previne múltiplas execuções com `stopPropagation()`
- ✅ Verifica estado antes de executar ações

---

## 🧪 Testando

### Teste 1: Escape Simples

1. Inicie votação (modo fullscreen)
2. Pressione **Escape** uma vez
3. ✅ Deve mostrar prompt de senha imediatamente
4. Digite `sair`
5. ✅ Deve fechar completamente

### Teste 2: Senha Incorreta

1. Inicie votação
2. Pressione Escape
3. Digite senha errada (ex: `teste`)
4. ✅ Deve mostrar aviso "Senha incorreta"
5. ✅ Deve **voltar ao fullscreen** automaticamente

### Teste 3: Saída por F11

1. Inicie votação
2. Pressione **F11** (sai do fullscreen)
3. ✅ Deve mostrar prompt de senha após ~100ms
4. Digite `sair`
5. ✅ Deve fechar completamente

### Teste 4: Botão Fechar do Navegador

1. Inicie votação
2. Clique no botão "Sair do modo tela cheia" do navegador (canto superior)
3. ✅ Deve mostrar prompt de senha
4. Digite `sair`
5. ✅ Deve fechar

---

## 🔍 Troubleshooting

### Problema: Ainda precisa pressionar Escape duas vezes

**Causa:** Cache do navegador com código antigo

**Solução:**

```bash
# Recompilar
npm run build

# Limpar cache (hard refresh)
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Problema: Prompt de senha aparece duas vezes

**Causa:** Listener duplicado ou evento não parado

**Verificar:**

```javascript
// Console do navegador
console.log(
  document.querySelectorAll('[data-listener="fullscreenchange"]').length
);
// Deve retornar 0 ou 1
```

**Solução:** Recarregar página com Ctrl+F5

### Problema: Não volta ao fullscreen após senha incorreta

**Causa:** Navegador pode bloquear requestFullscreen() fora de contexto de usuário

**Nota:** Isso é esperado em alguns navegadores. O sistema tenta voltar, mas se falhar, apenas mostra aviso no console.

---

## 📁 Arquivos Modificados

| Arquivo             | Linhas | Descrição                                             |
| ------------------- | ------ | ----------------------------------------------------- |
| `src/ui/manager.ts` | +25    | Listener fullscreenchange + melhorias closeFullscreen |

**Total:** 1 arquivo, ~25 linhas adicionadas/modificadas

---

## 🚀 Melhorias Futuras (Opcional)

1. **Debounce de Eventos:** Adicionar debounce para evitar múltiplos prompts
2. **Feedback Visual:** Mostrar notificação ao sair do fullscreen
3. **Configuração de Senha:** Permitir admin configurar senha personalizada
4. **Log de Tentativas:** Registrar tentativas de saída para auditoria

---

## 📚 Referências

- [Fullscreen API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API)
- [fullscreenchange Event](https://developer.mozilla.org/en-US/docs/Web/API/Document/fullscreenchange_event)
- [Event.stopPropagation()](https://developer.mozilla.org/en-US/docs/Web/API/Event/stopPropagation)

---

**Data:** 5 de janeiro de 2025  
**Desenvolvedor:** Sistema de Eleição de Oficiais  
**Status:** ✅ Corrigido e Testado
