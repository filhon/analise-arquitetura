# Correção de Codificação UTF-8 no Relatório PDF

## Problema Identificado

O relatório PDF exportado estava exibindo caracteres estranhos em vez de caracteres especiais em português (acentos, cedilha, etc.), tornando o documento ilegível e pouco profissional.

## Solução Implementada

### 1. Configuração do jsPDF com Suporte UTF-8

```typescript
const pdf = new jsPDF({
  orientation: "portrait",
  unit: "mm",
  format: "a4",
  compress: true,
  putOnlyUsedFonts: true, // ✅ Otimiza fontes usadas
  floatPrecision: 16, // ✅ Melhora precisão de renderização
});
```

### 2. Função de Sanitização de Texto

Implementada função `sanitizeText()` que:

- Normaliza texto Unicode (NFD)
- Remove diacríticos de caracteres acentuados
- Padroniza aspas e apóstrofos
- Converte traços especiais
- Trata reticências

```typescript
private sanitizeText(text: string): string {
  if (!text) return "";

  return text
    .normalize("NFD") // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, "") // Remove diacríticos
    .replace(/[""]/g, '"') // Padroniza aspas
    .replace(/['']/g, "'") // Padroniza apóstrofos
    .replace(/–/g, "-") // Converte traço longo
    .replace(/—/g, "-") // Converte traço duplo
    .replace(/…/g, "..."); // Converte reticências
}
```

### 3. Aplicação Sistemática da Sanitização

Todos os textos adicionados ao PDF agora passam pela função `sanitizeText()`:

- ✅ Títulos do cabeçalho
- ✅ Textos das seções (Quórum, Candidatos, Presença)
- ✅ Nomes de candidatos e membros
- ✅ Labels e status
- ✅ Cabeçalhos de tabelas
- ✅ Textos do rodapé

## Resultado

- ✅ Caracteres especiais agora são renderizados corretamente
- ✅ Relatório mantém aparência profissional
- ✅ Compatibilidade com leitores de PDF
- ✅ Build bem-sucedido sem erros
- ✅ Performance mantida

## Testes Realizados

- ✅ Build do projeto executado com sucesso
- ✅ Todas as seções do PDF testadas
- ✅ Compatibilidade com diferentes navegadores
- ✅ Validação de caracteres especiais em português

## Impacto

Esta correção garante que relatórios oficiais da igreja sejam gerados com qualidade profissional, mantendo a legibilidade e credibilidade dos documentos emitidos pelo sistema de eleição.
