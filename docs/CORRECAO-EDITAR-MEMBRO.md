# Correção: Botão de Editar Membro

## Data

11 de outubro de 2025

## Problema Identificado

Ao clicar no botão **Editar** de um membro e modificar algum campo (por exemplo, apenas o sobrenome), ao salvar:

- ❌ O nome ficava em branco
- ❌ Os demais campos ficavam com um "-"
- ❌ As alterações não eram salvas corretamente

## Causa Raiz

Os campos do formulário HTML (`index.html`) **não possuíam o atributo `name`**, apenas o atributo `id`.

O código JavaScript em `manager.ts` usa `FormData` para capturar os valores do formulário:

```typescript
const formData = new FormData(form);
const memberData = {
  nome: formData.get("name") as string, // ← Busca por name="name"
  cpf: formData.get("cpf") as string, // ← Busca por name="cpf"
  rg: formData.get("rg") as string, // ← Busca por name="rg"
  email: formData.get("email") as string, // ← Busca por name="email"
  telefone: formData.get("phone") as string, // ← Busca por name="phone"
  candidato: formData.get("candidate") as CandidateRole | "",
};
```

**Problema:** `FormData.get()` usa o atributo `name` do campo HTML, não o `id`. Como os campos não tinham `name`, todos os valores retornavam `null`, resultando em campos vazios.

## Solução Implementada

### Adicionado atributo `name` em todos os campos do formulário

**Arquivo:** `index.html`

#### Antes:

```html
<input type="text" id="member-name" required />
<input type="text" id="member-cpf" placeholder="000.000.000-00" />
<input type="text" id="member-rg" placeholder="00.000.000-0" />
<input type="email" id="member-email" />
<input type="tel" id="member-phone" placeholder="(00) 00000-0000" />
<select id="member-candidate"></select>
```

#### Depois:

```html
<input type="text" id="member-name" name="name" required />
<input type="text" id="member-cpf" name="cpf" placeholder="000.000.000-00" />
<input type="text" id="member-rg" name="rg" placeholder="00.000.000-0" />
<input type="email" id="member-email" name="email" />
<input
  type="tel"
  id="member-phone"
  name="phone"
  placeholder="(00) 00000-0000"
/>
<select id="member-candidate" name="candidate"></select>
```

## Mapeamento de Campos

| Campo HTML | ID                 | NAME        | Usado por FormData | Propriedade no Objeto  |
| ---------- | ------------------ | ----------- | ------------------ | ---------------------- |
| Nome       | `member-name`      | `name`      | ✅                 | `memberData.nome`      |
| CPF        | `member-cpf`       | `cpf`       | ✅                 | `memberData.cpf`       |
| RG         | `member-rg`        | `rg`        | ✅                 | `memberData.rg`        |
| Email      | `member-email`     | `email`     | ✅                 | `memberData.email`     |
| Telefone   | `member-phone`     | `phone`     | ✅                 | `memberData.telefone`  |
| Candidato  | `member-candidate` | `candidate` | ✅                 | `memberData.candidato` |

## Como Funciona Agora

### 1. Usuário Clica em "Editar"

```typescript
// manager.ts - editMember()
(document.getElementById("member-name") as HTMLInputElement).value =
  member.nome;
// Preenche o campo usando o ID
```

### 2. Usuário Modifica um Campo

O usuário digita no campo com `id="member-name"` e `name="name"`

### 3. Usuário Clica em "Salvar"

```typescript
// manager.ts - handleMemberSubmit()
const formData = new FormData(form);
const memberData = {
  nome: formData.get("name") as string, // ✅ Agora captura o valor corretamente
  // ...
};
```

### 4. Dados São Salvos

```typescript
const result = await electionApp.updateMember(editingId, memberData);
// ✅ Todos os campos são salvos corretamente
```

## Entendendo FormData

### O que é FormData?

`FormData` é uma API do navegador que coleta automaticamente os valores de um formulário HTML.

### Como usar:

```javascript
// Pega o formulário
const form = document.getElementById("my-form");

// Cria FormData
const formData = new FormData(form);

// Obtém valores usando o atributo "name" dos campos
formData.get("name"); // ← Busca <input name="name">
formData.get("email"); // ← Busca <input name="email">
```

### ⚠️ Importante:

- `FormData.get()` usa o atributo **`name`**, não o `id`
- Sem `name`, o campo é **ignorado** pelo FormData
- O `id` é usado apenas para JavaScript acessar o elemento diretamente

## Fluxo Correto

```
┌─────────────────────────────────────────────────────────┐
│ 1. HTML                                                 │
│    <input id="member-name" name="name">                 │
│           ↓                      ↓                       │
│         Para JS direto        Para FormData            │
└─────────────────────────────────────────────────────────┘
           ↓                           ↓
┌──────────────────────┐   ┌──────────────────────────┐
│ 2. Preencher (editar)│   │ 3. Capturar (salvar)     │
│                      │   │                          │
│ getElementById()     │   │ FormData.get("name")     │
│ .value = "João"      │   │ → Retorna "João Silva"   │
└──────────────────────┘   └──────────────────────────┘
```

## Resultado

✅ **Problema Resolvido:** Agora ao editar um membro:

1. O formulário é preenchido corretamente com os dados atuais
2. O usuário pode modificar qualquer campo
3. Ao clicar em "Salvar", todos os valores são capturados corretamente
4. Os dados são atualizados no sistema

## Testes Realizados

### Cenário 1: Editar apenas o sobrenome

- ✅ Nome completo mantido
- ✅ Outros campos preservados
- ✅ Alteração salva com sucesso

### Cenário 2: Editar múltiplos campos

- ✅ Todos os campos modificados salvos corretamente
- ✅ Campos não modificados preservados

### Cenário 3: Limpar campos opcionais

- ✅ Campos podem ser esvaziados
- ✅ Sistema aceita campos vazios (exceto nome)

## Arquivos Modificados

- ✅ `index.html` - Adicionado atributo `name` em todos os campos dos formulários:
  - ✅ Formulário de Membros (6 campos)
  - ✅ Formulário de Candidatos (2 campos)
  - ✅ Formulário de Quórum (4 campos)

## Correção Preventiva em Outros Formulários

Durante a correção, identificamos e corrigimos o mesmo problema em outros formulários:

### Formulário de Candidatos

```html
<!-- Antes -->
<input type="text" id="candidate-name" required />
<select id="candidate-role" required>
  <!-- Depois -->
  <input type="text" id="candidate-name" name="name" required />
  <select id="candidate-role" name="role" required></select>
</select>
```

### Formulário de Quórum

```html
<!-- Antes -->
<input type="number" id="minimum-percentage" min="1" max="100" value="50" />
<input type="number" id="votes-percentage" min="1" max="100" value="60" />
<input type="number" id="presbítero-positions" min="1" value="3" />
<input type="number" id="diacono-positions" min="1" value="6" />

<!-- Depois -->
<input type="number" id="minimum-percentage" name="minimumPercentage" ... />
<input type="number" id="votes-percentage" name="votesPercentage" ... />
<input type="number" id="presbítero-positions" name="presbiteroPositions" ... />
<input type="number" id="diacono-positions" name="diaconoPositions" ... />
```

## Lições Aprendidas

### Boas Práticas para Formulários HTML

1. **Sempre use `name` e `id` juntos:**

```html
<input id="user-email" name="email" type="email" /> ↑ ↑ Para JS Para FormData
```

2. **Convenções de nomenclatura:**

- `id`: Descritivo do contexto (`member-name`, `user-email`)
- `name`: Curto e objetivo (`name`, `email`)

3. **FormData é mais limpo que captura manual:**

```javascript
// ❌ Ruim: Captura manual
const name = document.getElementById("member-name").value;
const email = document.getElementById("member-email").value;
const cpf = document.getElementById("member-cpf").value;
// ... repetitivo e propenso a erros

// ✅ Bom: FormData automático
const formData = new FormData(form);
const data = {
  name: formData.get("name"),
  email: formData.get("email"),
  cpf: formData.get("cpf"),
};
```

## Próximas Verificações

- [x] Verificar se formulário de candidatos tem o mesmo problema - ✅ Corrigido
- [x] Verificar outros formulários no sistema - ✅ Quórum também corrigido
- [ ] Adicionar validação de campos obrigatórios no frontend
- [ ] Implementar máscara de CPF, telefone e RG

---

**Status**: ✅ **Corrigido e Testado**

O botão de editar membro agora funciona perfeitamente, salvando todas as alterações corretamente.
