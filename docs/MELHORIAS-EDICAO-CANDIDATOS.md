# Melhoria: Edição Simplificada de Candidatos - Campos Limitados

**Data:** 11 de outubro de 2025
**Tipo:** Melhoria de UX
**Status:** ✅ Concluído

## 📋 Requisito

Ao editar um candidato, **ocultar o select de membro** e permitir apenas a alteração de:

- ✅ Foto do candidato (adicionar/remover)
- ✅ Cargo (Presbítero/Diácono)

O membro não pode ser alterado após a criação do candidato.

---

## 🎯 Justificativa

### Por Que Não Permitir Trocar Membro?

1. **Integridade de Dados** 🔒
   - Candidato vinculado a membro específico
   - Histórico de votos associado
   - Evita inconsistências

2. **Lógica de Negócio** 📋
   - Para trocar membro: remover e criar novo
   - Mantém rastreabilidade
   - Previne confusão na votação

3. **Simplicidade** ✨
   - Interface mais limpa
   - Menos opções = menos erros
   - Foco no que pode mudar

---

## ✅ Implementação

### 1. Modo Edição: Ocultar Select, Mostrar Nome

```typescript
// Ocultar select de membro
const memberSelectGroup = document
  .querySelector("#candidate-member")
  ?.closest(".form-group") as HTMLElement;

if (memberSelectGroup) {
  memberSelectGroup.style.display = "none";
}

// Criar campo informativo (somente leitura)
let memberInfoGroup = document.getElementById("member-info-group");
if (!memberInfoGroup) {
  memberInfoGroup = document.createElement("div");
  memberInfoGroup.id = "member-info-group";
  memberInfoGroup.className = "form-group";
  memberInfoGroup.innerHTML = `
    <label>Membro</label>
    <input type="text" id="member-info-name" class="form-input" readonly
           style="background-color: var(--gray-100); cursor: not-allowed;" />
  `;
  roleInput
    .closest(".form-group")
    ?.insertAdjacentElement("beforebegin", memberInfoGroup);
}

memberInfoName.value = candidate.name;
form.dataset.memberId = member.id; // Salvar para uso posterior
```

### 2. Modo Adicionar: Restaurar Select

```typescript
// Mostrar select, ocultar campo info
const memberSelectGroup = document
  .querySelector("#candidate-member")
  ?.closest(".form-group") as HTMLElement;
const memberInfoGroup = document.getElementById("member-info-group");

if (memberSelectGroup) memberSelectGroup.style.display = "block";
if (memberInfoGroup) memberInfoGroup.style.display = "none";
```

### 3. Submit: Usar Dataset ao Editar

```typescript
let memberId: string;

if (editingId) {
  // Edição: pegar do dataset
  memberId = form.dataset.memberId || "";
} else {
  // Criação: pegar do select
  memberId = memberSelect.value;
}
```

---

## 📊 Comparação Visual

**Adicionar:**

```
┌────────────────────────────┐
│ Novo Candidato             │
├────────────────────────────┤
│ [Foto]                     │
│ Selecione Membro *         │
│ [Buscar...]  ←Editável     │
│ ┌────────────────────────┐ │
│ │ Ana, Carlos, João...   │ │
│ └────────────────────────┘ │
│ Cargo * [Selecione ▼]     │
└────────────────────────────┘
```

**Editar:**

```
┌────────────────────────────┐
│ Editar Candidato           │
├────────────────────────────┤
│ [Foto João]                │
│ Membro                     │
│ [João Santos] ←Somente     │
│  (cinza, não editável)     │  leitura
│ Cargo * [Presbítero ▼]    │ ←Editável
└────────────────────────────┘
```

---

## 🎉 Resultado

✅ **Ao Editar:**

- Campo "Membro" somente leitura (cinza)
- Apenas cargo e foto editáveis
- Impossível trocar membro

✅ **Ao Adicionar:**

- Select de membro visível e funcional
- Todos os campos editáveis

O sistema agora reflete corretamente a lógica: **candidatos são permanentemente vinculados a membros**! 🎊

---

**Documentação criada:** 11 de outubro de 2025
**Versão:** 1.0.0
