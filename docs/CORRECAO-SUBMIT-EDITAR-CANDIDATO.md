# Correção: Botão Salvar não funcionava ao Editar Candidato

**Data:** 11/10/2025  
**Categoria:** Bug Fix  
**Módulo:** `src/ui/manager.ts`

## Problema Identificado

Ao clicar no botão **Salvar** na janela **Editar Candidato**, nada acontecia. O formulário não era submetido e nenhuma notificação era exibida.

### Causa Raiz

O campo `<select id="candidate-member">` possui o atributo `required`, mas em modo de edição, o elemento pai (`.form-group`) fica oculto com `display: none`. Isso causa um conflito de validação HTML5:

- O navegador tenta validar um campo `required` que está oculto
- A validação falha silenciosamente
- O evento `submit` é bloqueado antes de chegar ao JavaScript

## Solução Implementada

### 1. Remover `required` em Modo Edição

No método `handleEditCandidate()`, após ocultar o `memberSelectGroup`, remove-se o atributo `required` do select:

```typescript
// MODO EDIÇÃO: Ocultar select de membro (não pode trocar o membro)
if (memberSelectGroup) {
  memberSelectGroup.style.display = "none";
}
// Remover required do select (modo edição)
if (memberSelect) {
  memberSelect.required = false;
}
```

### 2. Reativar `required` em Modo Adicionar

No método `handleAddCandidate()`, ao mostrar o `memberSelectGroup`, reativa-se o atributo `required`:

```typescript
// MODO ADICIONAR: Mostrar select de membro, ocultar campo informativo
if (memberSelectGroup) {
  memberSelectGroup.style.display = "block";
}
if (memberInfoGroup) {
  memberInfoGroup.style.display = "none";
}
// Reativar required no select (modo adicionar)
if (memberSelect) {
  memberSelect.required = true;
}
```

## Alterações Realizadas

### Arquivo: `src/ui/manager.ts`

1. **Linha ~352** - Método `handleAddCandidate()`:
   - Adicionada referência ao elemento `memberSelect`
   - Adicionada linha `memberSelect.required = true;`

2. **Linha ~910** - Método `handleEditCandidate()`:
   - Adicionada referência ao elemento `memberSelect`
   - Adicionada linha `memberSelect.required = false;`

## Comportamento Após Correção

### Modo Adicionar

- ✅ Select de membros visível
- ✅ Campo `required` ativo
- ✅ Validação HTML5 funcionando normalmente

### Modo Editar

- ✅ Select de membros oculto
- ✅ Campo informativo (readonly) visível
- ✅ Campo `required` desativado
- ✅ Formulário é submetido com sucesso
- ✅ Validação usa `form.dataset.memberId` conforme esperado

## Lições Aprendidas

1. **Validação HTML5 e Campos Ocultos**: Campos com `required` devem ter o atributo removido quando ocultos com `display: none`, caso contrário, o navegador bloqueia o submit silenciosamente.

2. **Estado Dinâmico de Formulários**: Ao alternar entre modos (adicionar/editar) que mostram/ocultam campos, é necessário gerenciar também os atributos de validação (`required`, `disabled`, etc.).

3. **Debug de Formulários**: Quando um formulário "não faz nada" ao clicar em Submit, verificar:
   - Console do navegador (erros JavaScript)
   - Validação HTML5 (campos `required` ocultos)
   - Event listeners (se estão anexados corretamente)

## Testes Recomendados

- [ ] Abrir modal "Novo Candidato" → campo select visível e `required`
- [ ] Tentar salvar sem selecionar membro → deve mostrar erro de validação
- [ ] Selecionar membro e salvar → deve criar candidato
- [ ] Editar candidato existente → campo select oculto, readonly visível
- [ ] Alterar cargo e salvar → deve atualizar candidato
- [ ] Adicionar/remover foto e salvar → deve atualizar foto

## Impacto

- ✅ Sem breaking changes
- ✅ Lógica de negócio mantida (membro não pode ser alterado ao editar)
- ✅ Validação HTML5 funciona corretamente em ambos os modos
- ✅ UX melhorada (formulário responde ao clique em Salvar)
