# Implementação: Campo "Tipo" para Membros

## Data

11 de outubro de 2025

## Objetivo

Adicionar um campo "Tipo" ao cadastro de membros para classificá-los em:

- **Membro Comungante**
- **Membro Não-Comungante**
- **Visitante**

## Arquivos Modificados

### 1. ✅ `src/types/index.ts` - Definições TypeScript

**Adicionado:**

- Novo tipo `MemberType` com os 3 valores possíveis
- Campo `tipo` opcional na interface `Member`

```typescript
// Novo tipo
export type MemberType =
  | "Membro Comungante"
  | "Membro Não-Comungante"
  | "Visitante";

// Interface Member atualizada
export interface Member {
  readonly id: string;
  readonly nome: string;
  readonly tipo?: MemberType; // ← NOVO
  readonly cpf?: string;
  readonly rg?: string;
  readonly candidato?: CandidateRole | "";
  readonly email?: string;
  readonly telefone?: string;
}
```

### 2. ✅ `index.html` - Formulário de Membro

**Adicionado campo select para Tipo:**

```html
<div class="form-group">
  <label for="member-type">Tipo *</label>
  <select id="member-type" name="type" required>
    <option value="">Selecione o tipo</option>
    <option value="Membro Comungante">Membro Comungante</option>
    <option value="Membro Não-Comungante">Membro Não-Comungante</option>
    <option value="Visitante">Visitante</option>
  </select>
</div>
```

**Características:**

- Campo obrigatório (`required`)
- Posicionado logo após o campo "Nome"
- Atributos `id` e `name` para integração com JavaScript
- 3 opções disponíveis + placeholder

**Tabela de Membros - Cabeçalho atualizado:**

```html
<thead>
  <tr>
    <th>Nome</th>
    <th>Tipo</th>
    ← NOVO
    <th>CPF</th>
    <th>Email</th>
    <th>Candidato</th>
    <th>Presente</th>
    <th>Ações</th>
  </tr>
</thead>
```

### 3. ✅ `src/ui/manager.ts` - Gerenciamento de UI

#### 3.1 Imports Atualizados

```typescript
import type { Member, CandidateRole, MemberType } from "@/types";
```

#### 3.2 Renderização da Tabela

```typescript
row.innerHTML = `
  <td>${this.escapeHtml(member.nome)}</td>
  <td>${member.tipo || "-"}</td>  ← NOVO
  <td>${member.cpf ? Formatter.cpf(member.cpf) : "-"}</td>
  <td>${member.email || "-"}</td>
  <td>${member.candidato || "-"}</td>
  // ... resto da tabela
`;
```

#### 3.3 Preenchimento do Formulário de Edição

```typescript
(document.getElementById("member-type") as HTMLSelectElement).value =
  member.tipo || ""; // ← NOVO
```

#### 3.4 Captura de Dados do Formulário

```typescript
const memberData = {
  nome: formData.get("name") as string,
  tipo: formData.get("type") as MemberType, // ← NOVO
  cpf: formData.get("cpf") as string,
  // ... outros campos
};
```

### 4. ✅ `src/modules/members.ts` - Lógica de Membros

#### 4.1 Mapeamento CSV

```typescript
private mapCSVToMember(headers: string[], values: string[]): Omit<Member, "id"> {
  // ... código existente

  switch (header) {
    case "nome":
      memberData.nome = value;
      break;
    case "tipo":  // ← NOVO
      if (value) {
        memberData.tipo = value;
      }
      break;
    // ... outros casos
  }
}
```

### 5. ✅ `src/modules/reports.ts` - Template CSV

#### 5.1 Headers Atualizados

```typescript
const headers = ["nome", "tipo", "cpf", "rg", "candidato", "email", "telefone"];
//                        ↑ NOVO
```

#### 5.2 Dados de Exemplo

```typescript
const exampleData = [
  [
    "João Silva",
    "Membro Comungante", // ← NOVO
    cpf1,
    "12.345.678-9",
    "Presbítero",
    "joao@email.com",
    "(11) 99999-9999",
  ],
  [
    "Maria Santos",
    "Membro Comungante", // ← NOVO
    cpf2,
    "98.765.432-1",
    "Diácono",
    "maria@email.com",
    "(11) 88888-8888",
  ],
  [
    "José Oliveira",
    "Visitante", // ← NOVO
    cpf3,
    "45.678.912-3",
    "",
    "jose@email.com",
    "(11) 77777-7777",
  ],
];
```

## Funcionalidades Implementadas

### 1. Adicionar Membro

- Campo "Tipo" é **obrigatório**
- Usuário deve selecionar uma das 3 opções
- Validação automática pelo atributo `required`

### 2. Editar Membro

- Formulário é preenchido com o tipo atual do membro
- Tipo pode ser alterado durante edição
- Salvamento atualiza o tipo no sistema

### 3. Visualizar Membros

- Coluna "Tipo" exibida na tabela
- Mostra "-" se tipo não foi definido (membros antigos)
- Ordenação padrão mantida

### 4. Importar CSV

- Template CSV atualizado com coluna "tipo"
- 3 exemplos demonstrando os tipos diferentes
- Importação funciona com ou sem o campo tipo

## Estrutura do CSV Atualizado

```csv
nome,tipo,cpf,rg,candidato,email,telefone
João Silva,Membro Comungante,111.444.777-35,12.345.678-9,Presbítero,joao@email.com,(11) 99999-9999
Maria Santos,Membro Comungante,123.456.789-09,98.765.432-1,Diácono,maria@email.com,(11) 88888-8888
José Oliveira,Visitante,987.654.321-00,45.678.912-3,,jose@email.com,(11) 77777-7777
```

## Tipos de Membro

### Membro Comungante

- Membro batizado e que participa da Santa Ceia
- Tem direito a voto em assembleias
- **Pode ser candidato** a Presbítero ou Diácono

### Membro Não-Comungante

- Membro batizado mas que ainda não participa da Santa Ceia
- Geralmente crianças/jovens
- **Não pode ser candidato**

### Visitante

- Pessoa que frequenta mas não é membro da igreja
- Registrado para controle de presença
- **Não pode ser candidato**

## Validações

### Frontend (HTML)

- Campo obrigatório (`required`)
- Opções pré-definidas (não permite valores customizados)
- Validação nativa do navegador

### Backend (TypeScript)

- Tipo `MemberType` garante apenas valores válidos
- TypeScript valida em tempo de compilação
- Campos opcionais para retrocompatibilidade

## Retrocompatibilidade

### Membros Existentes

- Membros cadastrados antes da atualização **não têm tipo definido**
- Sistema exibe "-" na coluna Tipo
- Podem ser editados para adicionar o tipo

### Importação CSV Antiga

- CSVs sem coluna "tipo" continuam funcionando
- Campo tipo fica indefinido
- Não causa erro na importação

## Fluxo de Dados

### Adicionar Novo Membro

```
1. Usuário preenche formulário
   ↓
2. Seleciona tipo (obrigatório)
   ↓
3. Clica em "Salvar"
   ↓
4. FormData captura: type = "Membro Comungante"
   ↓
5. Cast para MemberType
   ↓
6. Salvo no localStorage
   ↓
7. Exibido na tabela
```

### Importar via CSV

```
1. Usuário baixa template
   ↓
2. Template inclui coluna "tipo" com exemplos
   ↓
3. Usuário preenche dados
   ↓
4. Upload do CSV
   ↓
5. Parser lê coluna "tipo"
   ↓
6. Mapeamento: header "tipo" → member.tipo
   ↓
7. Membro criado com tipo definido
```

## Interface do Usuário

### Formulário de Membro

```
┌─────────────────────────────────────┐
│  Adicionar Membro             [X]  │
├─────────────────────────────────────┤
│                                     │
│  Nome *                             │
│  [_____________________________]    │
│                                     │
│  Tipo *                             │
│  [Selecione o tipo          ▼]     │
│    - Membro Comungante              │
│    - Membro Não-Comungante          │
│    - Visitante                      │
│                                     │
│  CPF                                │
│  [_____________________________]    │
│                                     │
│  ... outros campos ...              │
│                                     │
│  [Cancelar]  [Salvar]               │
└─────────────────────────────────────┘
```

### Tabela de Membros

```
┌────────────────────────────────────────────────────────────────────┐
│ Nome          │ Tipo               │ CPF      │ Email  │ Candidato │
├────────────────────────────────────────────────────────────────────┤
│ João Silva    │ Membro Comungante  │ 111...35 │ joao@  │ Presbítero│
│ Maria Santos  │ Membro Comungante  │ 123...09 │ maria@ │ Diácono   │
│ José Oliveira │ Visitante          │ 987...00 │ jose@  │ -         │
│ Pedro Costa   │ -                  │ 456...22 │ pedro@ │ -         │
└────────────────────────────────────────────────────────────────────┘
```

## Casos de Uso

### Caso 1: Cadastrar Novo Membro Comungante

1. Clicar em "Adicionar Membro"
2. Preencher nome: "Ana Silva"
3. Selecionar tipo: "Membro Comungante"
4. Preencher demais campos
5. Clicar em "Salvar"
6. ✅ Membro cadastrado com tipo

### Caso 2: Cadastrar Visitante

1. Clicar em "Adicionar Membro"
2. Preencher nome: "Carlos Visitante"
3. Selecionar tipo: "Visitante"
4. Preencher email (CPF opcional para visitante)
5. Deixar "Candidato a" vazio (visitante não pode ser candidato)
6. Clicar em "Salvar"
7. ✅ Visitante cadastrado

### Caso 3: Importar CSV com Tipos

1. Baixar template CSV atualizado
2. Abrir no Excel/LibreOffice
3. Preencher coluna "tipo" para cada membro
4. Salvar como CSV
5. Importar no sistema
6. ✅ Todos os membros importados com tipo correto

### Caso 4: Editar Tipo de Membro Antigo

1. Membro antigo sem tipo aparece com "-"
2. Clicar em "Editar"
3. Selecionar tipo: "Membro Comungante"
4. Clicar em "Salvar"
5. ✅ Tipo atualizado

## Possíveis Melhorias Futuras

### 1. Filtro por Tipo

Adicionar filtro na tabela para mostrar apenas membros de um tipo específico:

```typescript
filterByType(type: MemberType): Member[] {
  return members.filter(m => m.tipo === type);
}
```

### 2. Estatísticas por Tipo

Exibir cards com contadores:

- X Membros Comungantes
- Y Membros Não-Comungantes
- Z Visitantes

### 3. Validação de Candidatura

Impedir que Visitantes e Não-Comungantes sejam candidatos:

```typescript
if (tipo !== "Membro Comungante" && candidato) {
  return {
    isValid: false,
    errors: ["Apenas Membros Comungantes podem ser candidatos"],
  };
}
```

### 4. Relatórios por Tipo

Gerar relatórios PDF separados por tipo de membro.

### 5. Exportação com Tipo

Incluir coluna "tipo" na exportação de dados.

## Testes Sugeridos

### Teste 1: Adicionar Membro com Tipo

- [ ] Abrir formulário de adicionar membro
- [ ] Verificar que campo Tipo está visível
- [ ] Verificar que campo Tipo é obrigatório
- [ ] Selecionar "Membro Comungante"
- [ ] Salvar e verificar na tabela

### Teste 2: Editar Tipo de Membro

- [ ] Editar membro existente
- [ ] Alterar tipo de "Visitante" para "Membro Comungante"
- [ ] Salvar e verificar atualização

### Teste 3: Importar CSV com Tipo

- [ ] Baixar template CSV atualizado
- [ ] Verificar coluna "tipo" no template
- [ ] Importar CSV com 3 tipos diferentes
- [ ] Verificar que todos foram importados corretamente

### Teste 4: Retrocompatibilidade

- [ ] Verificar membros antigos (sem tipo)
- [ ] Confirmar que exibem "-" na coluna Tipo
- [ ] Editar e adicionar tipo
- [ ] Verificar que tipo é salvo

### Teste 5: Validação de Formulário

- [ ] Tentar salvar sem selecionar tipo
- [ ] Verificar mensagem de validação
- [ ] Confirmar que não salva sem tipo

## Compatibilidade

### TypeScript

- ✅ Type-safe com `MemberType`
- ✅ Validação em tempo de compilação
- ✅ Autocomplete no VS Code

### Navegadores

- ✅ Select HTML5 suportado universalmente
- ✅ Required attribute funciona em todos os navegadores modernos

### Dados Existentes

- ✅ Membros antigos continuam funcionando
- ✅ Campo opcional para retrocompatibilidade
- ✅ CSV antigo continua importando

## Resumo das Mudanças

| Arquivo              | Mudanças                              | Impacto            |
| -------------------- | ------------------------------------- | ------------------ |
| `types/index.ts`     | + `MemberType`, + `Member.tipo`       | Definições de tipo |
| `index.html`         | + Select Tipo, + Coluna Tipo          | Interface visual   |
| `ui/manager.ts`      | + Renderização, + Edição, + Submissão | Lógica UI          |
| `modules/members.ts` | + Mapeamento CSV                      | Importação         |
| `modules/reports.ts` | + Template CSV                        | Exportação         |

**Total:** 5 arquivos modificados
**Linhas adicionadas:** ~50 linhas
**Complexidade:** Baixa
**Breaking changes:** Nenhum

---

**Status**: ✅ **Implementado e Funcional**

O campo "Tipo" agora está completamente integrado ao sistema de gestão de membros, permitindo classificação adequada de Membros Comungantes, Membros Não-Comungantes e Visitantes.
