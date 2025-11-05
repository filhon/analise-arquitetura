# Remoção da Tela de Prévia da Votação

## Objetivo

Remover a tela de prévia que era exibida ao iniciar a votação, fazendo com que o sistema vá diretamente para a etapa de seleção de Presbíteros.

## Problema Anterior

Ao clicar em "Iniciar Votação", o sistema exibia uma tela de prévia com todos os candidatos (Presbíteros e Diáconos) e um botão "Iniciar Votação" que precisava ser clicado novamente para começar a seleção.

Fluxo anterior:

1. Usuário clica em "Iniciar Votação"
2. Sistema mostra tela de prévia com todos os candidatos
3. Usuário clica novamente em "Iniciar Votação" na prévia
4. Sistema inicia seleção de Presbíteros

## Solução Implementada

Modificado o método `handleStartVoting()` para:

1. Validar o quórum
2. Ativar a view fullscreen
3. Chamar diretamente `startSelectionFlow()` sem passar pela tela de prévia

Fluxo atual:

1. Usuário clica em "Iniciar Votação"
2. Sistema valida quórum e ativa fullscreen
3. Sistema inicia diretamente a seleção de Presbíteros

## Código Modificado

### Arquivo: `src/ui/manager.ts`

**Antes:**

```typescript
private async handleStartVoting(): Promise<void> {
  console.log("[DEBUG] handleStartVoting chamado!");
  try {
    const results = await electionApp.getElectionResults();
    if (!results.quorum?.isValid) {
      NotificationService.warning(
        "Quórum insuficiente para iniciar a votação. Aguarde mais membros presentes."
      );
      return;
    }
    this.showVotingFullscreenPreview(results);
  } catch (error) {
    console.error("Erro ao iniciar fluxo de votação:", error);
    NotificationService.error("Erro ao iniciar a votação");
  }
}
```

**Depois:**

```typescript
private async handleStartVoting(): Promise<void> {
  console.log("[DEBUG] handleStartVoting chamado!");
  try {
    const results = await electionApp.getElectionResults();
    if (!results.quorum?.isValid) {
      NotificationService.warning(
        "Quórum insuficiente para iniciar a votação. Aguarde mais membros presentes."
      );
      return;
    }

    // Ativar fullscreen view
    const fullscreenView = document.getElementById("fullscreen-view");
    if (fullscreenView) {
      fullscreenView.style.display = "flex";
      void fullscreenView.offsetWidth;
      fullscreenView.classList.add("active");
      if (fullscreenView.requestFullscreen) {
        fullscreenView.requestFullscreen().catch(() => {
          /* ignore fullscreen errors */
        });
      }
    }

    // Iniciar fluxo de seleção diretamente (sem tela de prévia)
    await this.startSelectionFlow();
  } catch (error) {
    console.error("Erro ao iniciar fluxo de votação:", error);
    NotificationService.error("Erro ao iniciar a votação");
  }
}
```

## Método Preservado

O método `showVotingFullscreenPreview()` foi mantido no código caso seja necessário restaurar a funcionalidade no futuro, mas não é mais chamado no fluxo principal.

## Benefícios

1. **Experiência mais direta**: Elimina um passo desnecessário no processo de votação
2. **Menos cliques**: Reduz de 2 cliques para 1 clique para iniciar a votação
3. **Interface mais limpa**: Remove uma tela intermediária que não agregava valor
4. **Melhor UX em dispositivos móveis**: Menos navegação em telas pequenas

## Impacto

- ✅ Processo de votação mais rápido e direto
- ✅ Mantém todas as validações de quórum
- ✅ Mantém o modo fullscreen
- ✅ Mantém o fluxo de seleção (Presbíteros → Diáconos → Resumo)

## Testes Recomendados

1. Clicar em "Iniciar Votação" com quórum válido
2. Verificar se a tela de seleção de Presbíteros aparece diretamente
3. Confirmar que não há tela de prévia intermediária
4. Validar que o modo fullscreen é ativado corretamente
5. Testar em dispositivos móveis e desktop

## Status

✅ **IMPLEMENTADO** - Tela de prévia removida do fluxo de votação (05/nov/2025)
