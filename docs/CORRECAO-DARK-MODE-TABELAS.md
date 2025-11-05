# Correção do Dark Mode nas Tabelas

## Problema Identificado

As tabelas em todas as telas mantinham o fundo branco mesmo quando o modo escuro estava ativado, quebrando a consistência visual do tema escuro.

## Causa do Problema

A classe `.table-container` tinha `background: white;` definido no CSS padrão, mas não havia uma regra específica `body.dark-mode .table-container` para sobrescrever essa propriedade no modo escuro.

## Solução Implementada

Adicionada a seguinte regra CSS no arquivo `assets/css/main.css`:

```css
/* Dark mode para containers de tabelas */
body.dark-mode .table-container {
  background: var(--bg-primary);
  border-color: var(--border-color);
}
```

Esta regra garante que:
- O fundo do container da tabela use `var(--bg-primary)` (cor de fundo primária do tema escuro: #121212)
- A borda do container também seja ajustada para usar `var(--border-color)` (cor de borda do tema escuro)

## Regras de Dark Mode Existentes

As seguintes regras já existiam e foram mantidas:

```css
body.dark-mode table {
  border-color: var(--border-color);
}

body.dark-mode th {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

body.dark-mode td {
  border-color: var(--border-color);
  color: var(--text-primary);
}

body.dark-mode tbody tr:hover {
  background: var(--bg-tertiary);
}
```

## Resultado

Agora as tabelas têm aparência consistente no modo escuro:
- Fundo escuro nos containers das tabelas
- Cabeçalhos com fundo secundário escuro
- Texto com cores adequadas para o tema escuro
- Hover states apropriados

## Teste

O servidor de desenvolvimento foi iniciado em `http://localhost:3000/` para validação das mudanças.

## Arquivos Modificados

- `assets/css/main.css`: Adicionada regra CSS para dark mode do container de tabelas

## Status

✅ **CORREÇÃO CONCLUÍDA** - Tabelas agora funcionam corretamente no modo escuro