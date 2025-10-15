# Busca de Membros e Mensagem de Indisponibilidade

**Data:** 11 de outubro de 2025
**Tipo:** Melhoria de UX
**Status:** ✅ Concluído

## 📋 Requisitos

1. ✅ Adicionar campo de busca no select de membros comungantes
2. ✅ Exibir mensagem "Não há membros disponíveis" quando não houver opções

## 🔧 Implementações Realizadas

### 1. Campo de Busca no Select

**Arquivo:** `index.html` (linha ~491-503)

#### Antes

```html
<div class="form-group">
  <label for="candidate-member">Membro *</label>
  <select id="candidate-member" name="memberId" required>
    <option value="">Selecione um membro comungante</option>
  </select>
</div>
```

#### Depois

```html
<div class="form-group">
  <label for="candidate-member">Membro *</label>
  <input
    type="text"
    id="member-search-input"
    placeholder="Buscar membro..."
    class="form-input"
  />
  <select id="candidate-member" name="memberId" required size="8">
    <option value="">Selecione um membro comungante</option>
  </select>
  <p
    id="no-members-message"
    style="display: none; color: var(--danger); margin-top: 0.5rem;"
  >
    Não há membros disponíveis.
  </p>
</div>
```

**Mudanças:**

- ✅ Input de busca acima do select
- ✅ Select com `size="8"` (mostra 8 opções, scroll automático)
- ✅ Mensagem de erro oculta por padrão

---

### 2. Lógica de Busca e Validação

**Arquivo:** `src/ui/manager.ts`

#### Nova Função: `populateMemberSelect()` Atualizada

```typescript
private async populateMemberSelect(): Promise<void> {
  const members = await electionApp.getMembers();
  const select = document.getElementById("candidate-member") as HTMLSelectElement;
  const searchInput = document.getElementById("member-search-input") as HTMLInputElement;
  const noMembersMessage = document.getElementById("no-members-message");

  if (!select) return;

  // Adicionar apenas membros comungantes que ainda não são candidatos
  const candidates = await electionApp.getCandidates();
  const candidateNames = new Set(candidates.map((c) => c.name));

  const availableMembers = members.filter(
    (m) => m.tipo === "Membro Comungante" && !candidateNames.has(m.nome)
  );

  // Armazenar membros disponíveis para busca
  (select as any).availableMembers = availableMembers;

  // Renderizar lista inicial
  this.renderMemberOptions(availableMembers, select);

  // Verificar se há membros disponíveis
  if (availableMembers.length === 0) {
    if (noMembersMessage) {
      noMembersMessage.style.display = "block";
    }
    select.disabled = true;
    if (searchInput) {
      searchInput.disabled = true;
    }
  } else {
    if (noMembersMessage) {
      noMembersMessage.style.display = "none";
    }
    select.disabled = false;
    if (searchInput) {
      searchInput.disabled = false;
      // Limpar busca anterior
      searchInput.value = "";
      // Configurar busca
      searchInput.removeEventListener("input", this.handleMemberSearchInput);
      searchInput.addEventListener("input", this.handleMemberSearchInput.bind(this));
    }
  }
}
```

**Funcionalidades:**

- ✅ Carrega membros comungantes disponíveis
- ✅ Armazena lista no select para busca rápida
- ✅ Renderiza opções
- ✅ Detecta se lista está vazia
- ✅ Mostra mensagem de erro se vazio
- ✅ Desabilita select e busca se vazio
- ✅ Configura event listener de busca

#### Nova Função: `renderMemberOptions()`

```typescript
private renderMemberOptions(members: Member[], select: HTMLSelectElement): void {
  select.innerHTML = '<option value="">Selecione um membro comungante</option>';

  members.forEach((member) => {
    const option = document.createElement("option");
    option.value = member.id;
    option.textContent = member.nome;
    option.dataset.memberData = JSON.stringify(member);
    select.appendChild(option);
  });
}
```

**Funcionalidades:**

- ✅ Limpa select
- ✅ Adiciona opção padrão
- ✅ Renderiza lista de membros
- ✅ Reutilizável para busca

#### Nova Função: `handleMemberSearchInput()`

```typescript
private handleMemberSearchInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const query = input.value.toLowerCase().trim();
  const select = document.getElementById("candidate-member") as HTMLSelectElement;

  if (!select) return;

  const availableMembers = (select as any).availableMembers || [];

  if (query === "") {
    // Mostrar todos
    this.renderMemberOptions(availableMembers, select);
  } else {
    // Filtrar por nome
    const filtered = availableMembers.filter((m: Member) =>
      m.nome.toLowerCase().includes(query)
    );
    this.renderMemberOptions(filtered, select);
  }
}
```

**Funcionalidades:**

- ✅ Busca em tempo real
- ✅ Case-insensitive
- ✅ Busca por substring no nome
- ✅ Restaura lista completa ao limpar busca

---

### 3. Estilos CSS

**Arquivo:** `assets/css/main.css` (linha ~686-705)

```css
/* Select com busca (múltiplas linhas) */
.form-group select[size] {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  cursor: pointer;
}

.form-group select[size] option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.form-group select[size] option:hover {
  background-color: var(--gray-100);
}

#member-search-input {
  margin-bottom: 0.5rem;
}
```

**Características:**

- ✅ Select com altura definida (200-300px)
- ✅ Scroll automático se houver muitos itens
- ✅ Padding nas opções para melhor clique
- ✅ Hover nas opções
- ✅ Espaçamento do input de busca

---

## 🎬 Comportamento do Sistema

### Cenário 1: Membros Disponíveis

```
1. Usuário clica em "Novo Candidato"
   ↓
2. populateMemberSelect() executa
   ↓
3. Encontra membros comungantes disponíveis
   ↓
4. Interface exibida:
   ┌─────────────────────────────┐
   │ Membro *                    │
   │ [Buscar membro...        ]  │ ← Input de busca
   │ ┌─────────────────────────┐ │
   │ │ Selecione um membro...  │ │
   │ │ João Silva              │ │ ← Select com 8 linhas
   │ │ Maria Santos            │ │   visíveis, scroll se
   │ │ Pedro Oliveira          │ │   necessário
   │ │ ...                     │ │
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
   ↓
5. Usuário pode:
   - Digitar no campo de busca
   - Rolar lista com scroll
   - Clicar em um membro
```

### Cenário 2: Busca em Tempo Real

```
1. Usuário digita "ma" no campo de busca
   ↓
2. handleMemberSearchInput() executa
   ↓
3. Filtra membros cujo nome contém "ma"
   ↓
4. Lista atualizada instantaneamente:
   ┌─────────────────────────────┐
   │ [ma                      ]  │ ← Texto digitado
   │ ┌─────────────────────────┐ │
   │ │ Selecione um membro...  │ │
   │ │ Maria Santos            │ │ ← Apenas resultados
   │ │ Mariana Costa           │ │   correspondentes
   │ └─────────────────────────┘ │
   └─────────────────────────────┘
   ↓
5. Usuário limpa busca → lista completa volta
```

### Cenário 3: Nenhum Membro Disponível

```
1. Usuário clica em "Novo Candidato"
   ↓
2. populateMemberSelect() executa
   ↓
3. Não encontra membros comungantes disponíveis
   (todos já são candidatos ou não há comungantes)
   ↓
4. Interface exibida:
   ┌─────────────────────────────┐
   │ Membro *                    │
   │ [Buscar membro...        ]  │ ← Desabilitado
   │ ┌─────────────────────────┐ │
   │ │ Selecione um membro...  │ │ ← Select desabilitado
   │ └─────────────────────────┘ │
   │ ⚠️ Não há membros disponíveis. │ ← Mensagem em vermelho
   └─────────────────────────────┘
   ↓
5. Usuário não pode adicionar candidato
   (botão "Salvar" validará e bloqueará)
```

---

## 📊 Comparação Visual

### Antes

```
┌─────────────────────────────┐
│ Membro *                    │
│ [▼ Selecione um membro...] │ ← Dropdown clássico
└─────────────────────────────┘
```

- Sem busca
- Dropdown oculta opções
- Sem feedback se vazio

### Depois

```
┌─────────────────────────────┐
│ Membro *                    │
│ [🔍 Buscar membro...      ] │ ← Campo de busca
│ ┌─────────────────────────┐ │
│ │ Selecione um membro...  │ │
│ │ Ana Costa               │ │
│ │ Carlos Silva            │ │ ← Lista visível
│ │ João Santos             │ │   (8 linhas)
│ │ ...                     │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘

OU (se vazio):

┌─────────────────────────────┐
│ Membro *                    │
│ [🔍 Buscar membro...      ] │ ← Desabilitado
│ ┌─────────────────────────┐ │
│ │ (desabilitado)          │ │ ← Select desabilitado
│ └─────────────────────────┘ │
│ ⚠️ Não há membros disponíveis. │ ← Mensagem clara
└─────────────────────────────┘
```

---

## 🎯 Benefícios

### 1. Busca Intuitiva

- ✅ Encontra membros rapidamente
- ✅ Não precisa rolar lista extensa
- ✅ Busca case-insensitive
- ✅ Atualização instantânea

### 2. Feedback Visual

- ✅ Lista sempre visível (não oculta)
- ✅ 8 opções visíveis simultaneamente
- ✅ Scroll automático se necessário
- ✅ Hover nas opções

### 3. Tratamento de Erros

- ✅ Mensagem clara quando vazio
- ✅ Campos desabilitados adequadamente
- ✅ Impossível enviar sem membro
- ✅ Cor vermelha para destacar problema

### 4. Performance

- ✅ Armazena lista uma vez
- ✅ Busca em memória (não recarrega)
- ✅ Filtro JavaScript rápido
- ✅ Sem requisições extras

---

## 🧪 Cenários de Teste

### Teste 1: Busca Básica

- [ ] Abrir modal "Novo Candidato"
- [ ] Verificar campo de busca presente
- [ ] Digitar "joão"
- [ ] ✅ Apenas "João..." deve aparecer
- [ ] Limpar busca
- [ ] ✅ Lista completa volta

### Teste 2: Busca Case-Insensitive

- [ ] Digitar "MARIA" (maiúsculo)
- [ ] ✅ "Maria..." deve aparecer
- [ ] Digitar "maria" (minúsculo)
- [ ] ✅ "Maria..." deve aparecer

### Teste 3: Busca sem Resultados

- [ ] Digitar "xyz123"
- [ ] ✅ Apenas opção padrão deve aparecer
- [ ] Select permanece habilitado

### Teste 4: Nenhum Membro Disponível

- [ ] Adicionar todos comungantes como candidatos
- [ ] Abrir modal "Novo Candidato"
- [ ] ✅ Mensagem "Não há membros disponíveis" exibida
- [ ] ✅ Campo de busca desabilitado
- [ ] ✅ Select desabilitado

### Teste 5: Select Visível

- [ ] Abrir modal
- [ ] ✅ 8 membros visíveis (se houver)
- [ ] ✅ Scroll aparece se > 8
- [ ] Clicar em membro
- [ ] ✅ Membro selecionado

### Teste 6: Hover nas Opções

- [ ] Passar mouse sobre opções
- [ ] ✅ Background muda ao hover
- [ ] ✅ Cursor: pointer

---

## 📐 Especificações Técnicas

### Select com Size

**HTML:**

```html
<select id="candidate-member" size="8"></select>
```

**Comportamento:**

- `size="8"` → Mostra 8 opções
- Scroll automático se > 8
- Opções sempre visíveis (não é dropdown)

### Armazenamento de Dados

```typescript
(select as any).availableMembers = availableMembers;
```

**Por quê?**

- Evita recarregar membros a cada busca
- Dados permanecem em memória
- Busca mais rápida (filtra array local)

### Algoritmo de Busca

```typescript
const filtered = availableMembers.filter((m: Member) =>
  m.nome.toLowerCase().includes(query)
);
```

**Características:**

- `.toLowerCase()` → Case-insensitive
- `.includes()` → Substring match
- Filtra array original
- Não modifica dados

### Validação de Lista Vazia

```typescript
if (availableMembers.length === 0) {
  noMembersMessage.style.display = "block";
  select.disabled = true;
  searchInput.disabled = true;
}
```

**Efeito:**

- Mensagem vermelha aparece
- Select não clicável
- Busca não clicável
- Formulário não pode ser enviado (required)

---

## 🎨 CSS Aplicado

### Select com Scroll

```css
.form-group select[size] {
  min-height: 200px;
  max-height: 300px;
  overflow-y: auto;
  cursor: pointer;
}
```

### Opções com Padding

```css
.form-group select[size] option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}
```

### Hover nas Opções

```css
.form-group select[size] option:hover {
  background-color: var(--gray-100);
}
```

### Espaçamento do Input

```css
#member-search-input {
  margin-bottom: 0.5rem;
}
```

---

## 🔄 Impacto

### Módulos Afetados

- ✅ Modal "Novo Candidato"
- ✅ Select de membros
- ✅ Validação de formulário

### Módulos Não Afetados

- ⚪ Outras abas
- ⚪ Tabela de membros
- ⚪ Tabela de candidatos

---

## 🎯 Resultado Final

✅ **Melhorias implementadas com sucesso:**

1. ✅ Campo de busca funcional
   - Busca em tempo real
   - Case-insensitive
   - Substring match

2. ✅ Select melhorado
   - 8 opções visíveis
   - Scroll automático
   - Hover nas opções

3. ✅ Mensagem de erro
   - "Não há membros disponíveis"
   - Cor vermelha
   - Campos desabilitados

4. ✅ Experiência do usuário
   - Busca rápida e fácil
   - Feedback visual claro
   - Previne erros

A seleção de membros agora é muito mais intuitiva e informativa! 🎉

---

**Documentação criada:** 11 de outubro de 2025
**Última atualização:** 11 de outubro de 2025
**Versão:** 1.0.0
