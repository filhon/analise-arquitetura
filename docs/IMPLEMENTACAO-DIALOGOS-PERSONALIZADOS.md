# Sistema de Diálogos Personalizados

**Data:** 05/novembro/2025  
**Versão:** 2.0.0  
**Status:** ✅ Implementado

## 📋 Resumo

Implementado sistema completo de diálogos personalizados (modais) que substitui os diálogos nativos do navegador (`alert()`, `confirm()`, `prompt()`). Os novos diálogos seguem o design do sistema, são totalmente customizáveis e oferecem melhor experiência do usuário.

## 🎯 Motivação

**Problemas com Diálogos Nativos:**

- ❌ Design inconsistente entre navegadores
- ❌ Não seguem o tema do sistema (dark mode)
- ❌ Bloqueiam completamente a thread
- ❌ Sem personalização de ícones, cores ou layout
- ❌ Acessibilidade limitada
- ❌ UX antiga e pouco profissional

**Vantagens dos Diálogos Personalizados:**

- ✅ Design consistente em todos os navegadores
- ✅ Seguem o tema do sistema (light/dark mode)
- ✅ Animações suaves e modernas
- ✅ Totalmente personalizáveis
- ✅ Melhor acessibilidade (ARIA, foco, ESC)
- ✅ UX moderna e profissional

## 🏗️ Arquitetura

### Arquivo Principal: `src/ui/dialog.ts`

**Classe:** `DialogService` (Singleton)

**Métodos Públicos:**

```typescript
// Diálogo de confirmação (Sim/Não)
async confirm(options: DialogOptions): Promise<boolean>

// Diálogo com campo de input
async prompt(options: DialogOptions): Promise<string | null>

// Diálogo de alerta (apenas OK)
async alert(options: DialogOptions): Promise<void>

// Diálogo genérico customizável
show(options: DialogOptions): void

// Fechar diálogo atual
close(): void
```

### Interface `DialogOptions`

```typescript
interface DialogOptions {
  title: string; // Título do diálogo
  message: string; // Mensagem principal
  type?: "info" | "warning" | "error" | "success" | "confirm" | "prompt";
  confirmText?: string; // Texto do botão de confirmar (default: "Confirmar")
  cancelText?: string; // Texto do botão de cancelar (default: "Cancelar")
  placeholder?: string; // Placeholder para tipo 'prompt'
  icon?: string; // Ícone Material Icons (opcional)
  onConfirm?: (value?: string) => void | Promise<void>;
  onCancel?: () => void;
}
```

## 🎨 Design e Estilo

### Arquivo CSS: `assets/css/dialog.css`

**Componentes:**

1. **Overlay** (`.custom-dialog-overlay`)
   - Fundo semitransparente com blur
   - Centralização com flexbox
   - Animação de fade-in

2. **Container** (`.custom-dialog`)
   - Background adaptável (light/dark)
   - Sombra elevada (8dp)
   - Border-radius de 12px
   - Animação de scale + translateY

3. **Header** (`.custom-dialog-header`)
   - Ícone colorido (48px)
   - Título em destaque
   - Borda inferior sutil

4. **Body** (`.custom-dialog-body`)
   - Mensagem centralizada
   - Input opcional (para tipo prompt)
   - Espaçamento generoso

5. **Actions** (`.custom-dialog-actions`)
   - Botões alinhados à direita
   - Responsivo (empilhados em mobile)
   - Área de toque otimizada (44px)

### Cores por Tipo

| Tipo      | Ícone Padrão   | Cor                        |
| --------- | -------------- | -------------------------- |
| `success` | `check_circle` | `var(--success)` (verde)   |
| `warning` | `warning`      | `var(--warning)` (amarelo) |
| `error`   | `error`        | `var(--danger)` (vermelho) |
| `confirm` | `help`         | `var(--primary)` (azul)    |
| `prompt`  | `edit`         | `var(--primary)` (azul)    |
| `info`    | `info`         | `var(--info)` (azul claro) |

### Dark Mode

Suporte completo ao modo escuro com:

- Fundo adaptável
- Overlay mais escuro (80%)
- Inputs com background ajustado
- Sombras mais intensas

## 📝 Exemplos de Uso

### 1. Diálogo de Confirmação

```typescript
const confirmed = await dialogService.confirm({
  title: "Confirmar Ação",
  message: "Tem certeza que deseja continuar?",
  confirmText: "Sim, Continuar",
  cancelText: "Cancelar",
  icon: "help",
});

if (confirmed) {
  // Usuário confirmou
} else {
  // Usuário cancelou
}
```

### 2. Diálogo com Input (Prompt)

```typescript
const senha = await dialogService.prompt({
  title: "Confirmar Saída",
  message: "Para sair da votação, digite a senha:",
  placeholder: "Digite 'sair'",
  confirmText: "Sair",
  cancelText: "Cancelar",
  icon: "lock",
});

if (senha === "sair") {
  // Senha correta
} else if (senha === null) {
  // Usuário cancelou
} else {
  // Senha incorreta
}
```

### 3. Diálogo de Alerta

```typescript
await dialogService.alert({
  title: "Operação Concluída",
  message: "Os dados foram salvos com sucesso!",
  confirmText: "OK",
  icon: "check_circle",
});
```

### 4. Diálogo Genérico Customizado

```typescript
dialogService.show({
  title: "Aviso Importante",
  message: "Esta é uma mensagem personalizada.",
  type: "warning",
  confirmText: "Entendi",
  icon: "warning",
  onConfirm: () => {
    console.log("Usuário confirmou");
  },
  onCancel: () => {
    console.log("Usuário cancelou");
  },
});
```

## 🔄 Substituições Realizadas

### 1. Validação de Senha do Fullscreen

**Antes (nativo):**

```typescript
const password = prompt("Para sair da votação, digite a senha:");
if (password?.toLowerCase() !== "sair") {
  alert("Senha incorreta");
  return;
}
```

**Depois (personalizado):**

```typescript
const password = await dialogService.prompt({
  title: "Confirmar Saída",
  message: "Para sair da votação, digite a senha de segurança:",
  placeholder: "Digite 'sair'",
  confirmText: "Sair da Votação",
  cancelText: "Cancelar",
  icon: "lock",
});

if (password?.toLowerCase() !== "sair") {
  if (password !== null) {
    NotificationService.warning("Senha incorreta");
  }
  return;
}
```

### 2. Confirmação da Zerésima

**Antes (nativo):**

```typescript
const confirmReset = confirm(
  "⚠️ ATENÇÃO: Esta ação irá:\n\n" +
    "1. Resetar TODOS os votos\n" +
    "2. Limpar auditoria\n" +
    "3. Gerar PDF\n\n" +
    "Irreversível. Continuar?"
);
```

**Depois (personalizado):**

```typescript
const confirmReset = await dialogService.confirm({
  title: "Confirmar Zerésima",
  message:
    "Esta ação irá:\n\n" +
    "• Resetar TODOS os votos registrados\n" +
    "• Limpar dados de auditoria\n" +
    "• Gerar relatório PDF\n\n" +
    "Irreversível. Continuar?",
  confirmText: "Sim, Resetar Votos",
  cancelText: "Cancelar",
  icon: "warning",
});
```

### 3. Confirmação de Exclusão de Candidato

**Antes:**

```typescript
if (!confirm(`Tem certeza que deseja remover este candidato a ${role}?`)) {
  return;
}
```

**Depois:**

```typescript
const confirmed = await dialogService.confirm({
  title: "Remover Candidato",
  message: `Tem certeza que deseja remover este candidato a ${role}?`,
  confirmText: "Sim, Remover",
  cancelText: "Cancelar",
  icon: "person_remove",
});

if (!confirmed) return;
```

### 4. Confirmação de Reset de Votos

**Antes:**

```typescript
if (!confirm("Tem certeza que deseja resetar os votos deste candidato?")) {
  return;
}
```

**Depois:**

```typescript
const confirmed = await dialogService.confirm({
  title: "Resetar Votos",
  message: "Tem certeza que deseja resetar os votos deste candidato?",
  confirmText: "Sim, Resetar",
  cancelText: "Cancelar",
  icon: "restart_alt",
});

if (!confirmed) return;
```

### 5. Confirmação de Exclusão de Usuário

**Antes:**

```typescript
const confirmed = confirm(
  `Tem certeza que deseja excluir "${user.displayName}"?\n\nIrreversível.`
);
```

**Depois:**

```typescript
const confirmed = await dialogService.confirm({
  title: "Excluir Usuário",
  message: `Tem certeza que deseja excluir "${user.displayName}"?\n\nIrreversível.`,
  confirmText: "Sim, Excluir",
  cancelText: "Cancelar",
  icon: "delete_forever",
});
```

### 6. Confirmação de Exclusão de Membro

**Antes:**

```typescript
const confirmed = confirm(
  `Tem certeza que deseja excluir "${member.nome}"?\n\nIrreversível.`
);
```

**Depois:**

```typescript
const { dialogService } = await import("./dialog");
const confirmed = await dialogService.confirm({
  title: "Excluir Membro",
  message: `Tem certeza que deseja excluir "${member.nome}"?\n\nIrreversível.`,
  confirmText: "Sim, Excluir",
  cancelText: "Cancelar",
  icon: "delete_forever",
});
```

## 🎯 Recursos Avançados

### 1. Animações

**Entrada:**

- Fade-in do overlay (0.3s)
- Scale + TranslateY do diálogo (0.3s)

**Saída:**

- Fade-out do overlay (0.3s)
- Remoção automática do DOM

**Shake (erro):**

```typescript
dialog.classList.add("shake");
```

### 2. Acessibilidade

- **ARIA:** `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Foco automático:** Input (prompt) ou botão confirmar
- **ESC:** Fecha o diálogo (exceto tipos críticos)
- **Enter:** Submete prompt
- **Tab:** Navegação entre botões

### 3. Comportamentos

**Clicar fora (overlay):**

- Fecha diálogo para tipos `info` e `success`
- Não fecha para tipos críticos (`confirm`, `error`, `warning`)

**Tecla ESC:**

- Sempre fecha o diálogo
- Chama `onCancel()` se definido

**Loading state:**

```typescript
confirmBtn.classList.add("loading");
// Botão mostra spinner
```

### 4. Multi-instância

- Apenas 1 diálogo ativo por vez
- Novo diálogo fecha o anterior automaticamente
- Singleton pattern garante consistência

## 📊 Estatísticas

| Métrica                      | Valor                     |
| ---------------------------- | ------------------------- |
| **Arquivos criados**         | 2 (dialog.ts, dialog.css) |
| **Linhas de código**         | ~400                      |
| **Substituições realizadas** | 6                         |
| **Métodos públicos**         | 4                         |
| **Tipos de diálogo**         | 6                         |
| **Animações**                | 3                         |
| **Bundle size**              | +4.4 kB (main)            |
| **CSS size**                 | +2.9 kB                   |

## ✅ Checklist de Implementação

- [x] Criar DialogService com singleton pattern
- [x] Implementar métodos confirm(), prompt(), alert()
- [x] Criar interface DialogOptions
- [x] Desenvolver CSS completo (light/dark mode)
- [x] Adicionar animações (fade, scale, shake)
- [x] Implementar acessibilidade (ARIA, foco, ESC)
- [x] Substituir prompts de senha (closeFullscreen)
- [x] Substituir confirm da Zerésima
- [x] Substituir confirms de exclusão
- [x] Substituir confirms de reset
- [x] Adicionar import do CSS no index.html
- [x] Importar DialogService no UIManager
- [x] Compilar e validar (build success)
- [x] Criar documentação completa

## 🔮 Melhorias Futuras

- [ ] Adicionar tipo `loading` com spinner permanente
- [ ] Suporte a múltiplos botões customizados
- [ ] Diálogos com conteúdo HTML personalizado
- [ ] Callback `onOpen` e `onClose`
- [ ] Timeout automático para tipos `info`/`success`
- [ ] Histórico de diálogos (debugging)
- [ ] Testes unitários automatizados
- [ ] Storybook para showcase de todos os tipos

## 📚 Referências

- **DialogService:** `src/ui/dialog.ts`
- **CSS:** `assets/css/dialog.css`
- **UIManager:** `src/ui/manager.ts` (integração)
- **Material Icons:** https://fonts.google.com/icons

## 🎓 Notas para Desenvolvedores

### Como Adicionar Novo Diálogo

1. **Import:**

```typescript
import { dialogService } from "./dialog";
```

2. **Uso:**

```typescript
const result = await dialogService.confirm({
  title: "Título",
  message: "Mensagem",
  confirmText: "OK",
  icon: "icon_name",
});
```

### Ícones Disponíveis

Qualquer ícone do Material Icons:

- `warning`, `error`, `info`, `help`
- `check_circle`, `delete_forever`, `lock`
- `person_remove`, `restart_alt`, etc.

### Cores Customizadas

Use variáveis CSS:

```css
--primary, --success, --warning, --danger, --info
```

### Async/Await

Sempre use `await` com diálogos:

```typescript
const result = await dialogService.confirm(...);
// Código após confirmação
```

---

**Implementado por:** GitHub Copilot  
**Testado em:** Chrome, Firefox, Edge, Safari  
**Compatibilidade:** Todos os navegadores modernos
