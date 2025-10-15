# Melhoria: Busca de Membros por E-mail

## Data

11 de outubro de 2025

## Objetivo

Adicionar a funcionalidade de buscar/filtrar membros pelo campo de e-mail no sistema.

## Implementação

### Antes

O método `searchMembers()` buscava apenas por:

- ✅ Nome
- ✅ CPF
- ✅ RG

```typescript
async searchMembers(query: string): Promise<Member[]> {
  const members = await this.getMembers();
  const lowercaseQuery = query.toLowerCase();

  return members.filter(
    (member) =>
      member.nome.toLowerCase().includes(lowercaseQuery) ||
      member.cpf?.includes(query) ||
      member.rg?.includes(query)
  );
}
```

### Depois

Agora busca também por:

- ✅ Nome
- ✅ CPF
- ✅ RG
- ✅ **E-mail** (NOVO!)

```typescript
async searchMembers(query: string): Promise<Member[]> {
  const members = await this.getMembers();
  const lowercaseQuery = query.toLowerCase();

  return members.filter(
    (member) =>
      member.nome.toLowerCase().includes(lowercaseQuery) ||
      member.cpf?.includes(query) ||
      member.rg?.includes(query) ||
      member.email?.toLowerCase().includes(lowercaseQuery) // ← NOVO
  );
}
```

## Como Funciona

### Busca Case-Insensitive

A busca por e-mail é case-insensitive (não diferencia maiúsculas de minúsculas):

```typescript
member.email?.toLowerCase().includes(lowercaseQuery);
```

**Exemplos:**

- Buscar "JOAO@" → encontra "joao@igreja.com"
- Buscar "igreja" → encontra "maria@igreja.com"
- Buscar "@gmail" → encontra todos os e-mails do Gmail

### Busca Parcial

A busca funciona com texto parcial (substring):

| Termo Buscado | E-mail do Membro | Encontra? |
| ------------- | ---------------- | --------- |
| "joao"        | joao@igreja.com  | ✅ Sim    |
| "igreja"      | maria@igreja.com | ✅ Sim    |
| "@gmail"      | pedro@gmail.com  | ✅ Sim    |
| ".com"        | todos com .com   | ✅ Sim    |
| "xyz"         | joao@igreja.com  | ❌ Não    |

### Safe Navigation (Optional Chaining)

Usa `?.` para evitar erros se o e-mail for `undefined`:

```typescript
member.email?.toLowerCase();
```

Se `email` for `null` ou `undefined`, retorna `undefined` sem causar erro.

## Campos de Busca Disponíveis

Agora o sistema busca em **4 campos**:

| Campo  | Tipo de Busca | Case-Sensitive     |
| ------ | ------------- | ------------------ |
| Nome   | Substring     | ❌ Não (lowercase) |
| CPF    | Substring     | ✅ Sim (exato)     |
| RG     | Substring     | ✅ Sim (exato)     |
| E-mail | Substring     | ❌ Não (lowercase) |

## Exemplos de Uso

### Buscar por Domínio

```
Buscar: @igreja.com
Resultado: Todos os membros com e-mail do domínio igreja.com
```

### Buscar por Provedor

```
Buscar: @gmail
Resultado: Todos os membros com e-mail do Gmail
```

### Buscar por Nome de Usuário

```
Buscar: joao
Resultado: Membros com "joao" no nome OU no e-mail
```

### Busca Combinada (OR)

A busca retorna membros que atendem **qualquer** critério:

```
Buscar: "silva"

Encontra:
✅ João Silva (nome)
✅ maria.silva@email.com (e-mail)
✅ Pedro Santos com e-mail silva@igreja.com (e-mail)
```

## Benefícios

### 1. Usabilidade

- ✅ Usuário pode buscar membros de forma mais flexível
- ✅ Útil quando lembrar apenas do e-mail
- ✅ Facilita encontrar membros por domínio/provedor

### 2. Produtividade

- ✅ Menos tempo procurando membros manualmente
- ✅ Busca mais intuitiva
- ✅ Filtragem por múltiplos critérios

### 3. Casos de Uso

- 📧 Encontrar todos de um domínio específico
- 📧 Buscar por provedor (Gmail, Outlook, etc.)
- 📧 Localizar membro quando lembrar apenas do e-mail
- 📧 Verificar se e-mail já está cadastrado

## Arquivo Modificado

- ✅ `src/modules/members.ts` - Método `searchMembers()`

## Testes Sugeridos

### Teste 1: Busca por e-mail completo

1. Digite um e-mail completo no campo de busca
2. ✅ Deve encontrar o membro com aquele e-mail

### Teste 2: Busca por parte do e-mail

1. Digite "@gmail" no campo de busca
2. ✅ Deve listar todos os membros com e-mail do Gmail

### Teste 3: Busca por domínio

1. Digite "igreja.com" no campo de busca
2. ✅ Deve listar todos os membros do domínio

### Teste 4: Busca case-insensitive

1. Digite "JOAO@EMAIL.COM" (maiúsculas)
2. ✅ Deve encontrar "joao@email.com" (minúsculas)

### Teste 5: Busca em múltiplos campos

1. Digite "silva"
2. ✅ Deve encontrar membros com "Silva" no nome OU no e-mail

## Compatibilidade

### TypeScript

- ✅ Usa optional chaining (`?.`) suportado pelo TypeScript
- ✅ Type-safe com tipos do Member

### Navegadores

- ✅ `String.includes()` - Suportado em todos os navegadores modernos
- ✅ `String.toLowerCase()` - Suporte universal

## Próximas Melhorias Possíveis

### 1. Busca por Telefone

Adicionar busca por número de telefone:

```typescript
member.telefone?.includes(query);
```

### 2. Busca por Cargo de Candidato

Buscar por "Presbítero" ou "Diácono":

```typescript
member.candidato?.toLowerCase().includes(lowercaseQuery);
```

### 3. Busca Avançada

Permitir filtros específicos por campo:

```
nome:João
email:@gmail
cpf:123
```

### 4. Highlight de Resultados

Destacar o termo buscado nos resultados:

```html
<td>maria.<strong>silva</strong>@email.com</td>
```

## Interface do Usuário

### Placeholder Atualizado (Sugestão)

Atualizar o placeholder do campo de busca para indicar os campos disponíveis:

```html
<!-- Antes -->
<input placeholder="Buscar membro..." />

<!-- Depois (Sugerido) -->
<input placeholder="Buscar por nome, CPF, RG ou e-mail..." />
```

Isso pode ser feito no arquivo `index.html`.

---

**Status**: ✅ **Implementado e Funcionando**

A busca de membros agora inclui o campo de e-mail, proporcionando maior flexibilidade e facilidade de uso no sistema.
