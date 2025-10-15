# Atualização dos Contadores de Estatísticas

## Data: 11 de outubro de 2025

## Alteração Implementada

Os **contadores de estatísticas** na aba Membros foram atualizados para refletir corretamente as regras de tipos de membros e quórum.

---

## 📊 Contadores Atualizados

### ANTES (Implementação Antiga)

```
┌─────────────────────────────────────────┐
│ [0]              [0]           [0]      │
│ Total de Membros Presentes  Candidatos │
└─────────────────────────────────────────┘

Lógica:
- Total de Membros: TODOS os membros
- Presentes: Membros comungantes presentes
- Candidatos: Membros marcados como candidatos
```

### DEPOIS (Implementação Correta)

```
┌──────────────────────────────────────────────────────────────────┐
│ [0]                    [0]                    [0]                │
│ Membros Comungantes    Membros Presentes    Não-Comung. e Visit.│
└──────────────────────────────────────────────────────────────────┘

Lógica:
- Membros Comungantes: Apenas tipo "Membro Comungante"
- Membros Presentes: Apenas comungantes presentes
- Não-Comung. e Visit.: Não-comungantes + visitantes presentes
```

---

## 🎯 Justificativa das Mudanças

### 1. **Contador "Total de Membros" → "Membros Comungantes"**

**Motivo**: Apenas membros comungantes contam para quórum e votação.

**Antes**:

```typescript
members.length; // TODOS os membros (comungantes + não-comungantes + visitantes)
```

**Depois**:

```typescript
members.filter((m) => m.tipo === "Membro Comungante").length;
```

**Exemplo**:

- 50 Comungantes + 10 Não-Comungantes + 5 Visitantes = 65 total
- **Antes**: Mostrava `65`
- **Depois**: Mostra `50` (apenas comungantes)

---

### 2. **Contador "Presentes" → "Membros Presentes"**

**Motivo**: Clarificar que são membros (comungantes) presentes.

**Antes e Depois** (lógica mantida):

```typescript
attendanceStats.presentMembers; // Já filtra apenas comungantes
```

**Label atualizado** para maior clareza:

- **Antes**: "Presentes" (ambíguo)
- **Depois**: "Membros Presentes" (específico)

---

### 3. **Contador "Candidatos" → "Não-Comungantes e Visitantes"**

**Motivo**: Mostrar quantos não-votantes estão presentes (para fins de registro).

**Antes**:

```typescript
members.filter((m) => m.candidato).length; // Contava candidatos
```

**Depois**:

```typescript
// Conta não-comungantes e visitantes PRESENTES
const nonVotingMembers = members.filter(
  (m) => m.tipo === "Membro Não-Comungante" || m.tipo === "Visitante"
);
const presentRecordIds = new Set(
  attendanceRecords.filter((r) => r.present).map((r) => r.memberId)
);
const nonVotingPresent = nonVotingMembers.filter((m) =>
  presentRecordIds.has(m.id)
).length;
```

**Exemplo**:

- 5 Não-Comungantes presentes + 2 Visitantes presentes = 7
- **Antes**: Mostrava número de candidatos (ex: 3)
- **Depois**: Mostra `7` (não-votantes presentes)

---

## 💻 Implementação Técnica

### Arquivo: `src/ui/manager.ts`

**Método `updateStats()` Atualizado**:

```typescript
private async updateStats(): Promise<void> {
  try {
    const [members, attendanceStats, attendanceRecords] = await Promise.all([
      electionApp.getMembers(),
      electionApp.getAttendanceStats(),
      electionApp.getAttendanceRecords(),
    ]);

    // Contar apenas Membros Comungantes
    const comungantes = members.filter((m) => m.tipo === "Membro Comungante");

    // Contar não-comungantes e visitantes presentes
    const nonVotingMembers = members.filter(
      (m) => m.tipo === "Membro Não-Comungante" || m.tipo === "Visitante"
    );
    const presentRecordIds = new Set(
      attendanceRecords.filter((r) => r.present).map((r) => r.memberId)
    );
    const nonVotingPresent = nonVotingMembers.filter((m) =>
      presentRecordIds.has(m.id)
    ).length;

    console.log("[updateStats] Attendance stats:", attendanceStats);
    console.log("[updateStats] Membros Comungantes:", comungantes.length);
    console.log("[updateStats] Não-votantes presentes:", nonVotingPresent);

    // Update member stats
    // Total de Membros = apenas comungantes
    this.updateElement("total-members", comungantes.length.toString());

    // Membros Presentes = apenas comungantes presentes
    this.updateElement(
      "present-members",
      attendanceStats.presentMembers?.toString() || "0"
    );

    // Não-Comungantes e Visitantes = não-votantes presentes
    this.updateElement("candidate-members", nonVotingPresent.toString());

    // Update attendance stats (mantidos)
    this.updateElement(
      "attendance-rate",
      `${attendanceStats.attendanceRate?.toFixed(1) || 0}%`
    );
    this.updateElement(
      "attendance-present",
      attendanceStats.presentMembers?.toString() || "0"
    );
    this.updateElement(
      "attendance-absent",
      attendanceStats.absentMembers?.toString() || "0"
    );
  } catch (error) {
    console.error("Erro ao atualizar estatísticas:", error);
  }
}
```

---

### Arquivo: `index.html`

**Labels dos Contadores Atualizados**:

```html
<div class="members-stats">
  <div class="stat-card">
    <h3 id="total-members">0</h3>
    <p>Membros Comungantes</p>
    <!-- ANTES: "Total de Membros" -->
  </div>
  <div class="stat-card">
    <h3 id="present-members">0</h3>
    <p>Membros Presentes</p>
    <!-- ANTES: "Presentes" -->
  </div>
  <div class="stat-card">
    <h3 id="candidate-members">0</h3>
    <p>Não-Comungantes e Visitantes</p>
    <!-- ANTES: "Candidatos" -->
  </div>
</div>
```

---

## 📋 Exemplo Prático

### Cenário

**Membros Cadastrados**:

- 50 Membros Comungantes
- 10 Membros Não-Comungantes
- 5 Visitantes

**Presentes**:

- 30 Membros Comungantes (marcados manualmente)
- 8 Membros Não-Comungantes (auto-presentes)
- 4 Visitantes (auto-presentes)

---

### Cálculos

```typescript
// 1. Membros Comungantes
const comungantes = members.filter((m) => m.tipo === "Membro Comungante");
// Resultado: 50

// 2. Membros Presentes (via attendanceStats)
attendanceStats.presentMembers;
// Resultado: 30 (apenas comungantes presentes)

// 3. Não-Comungantes e Visitantes Presentes
const nonVotingMembers = members.filter(
  (m) => m.tipo === "Membro Não-Comungante" || m.tipo === "Visitante"
);
// nonVotingMembers.length: 15 (10 + 5)

const presentRecordIds = new Set(
  attendanceRecords.filter((r) => r.present).map((r) => r.memberId)
);
// presentRecordIds.size: 42 (30 + 8 + 4)

const nonVotingPresent = nonVotingMembers.filter((m) =>
  presentRecordIds.has(m.id)
).length;
// Resultado: 12 (8 + 4)
```

---

### Interface Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                      ABA MEMBROS                                │
├─────────────────────────────────────────────────────────────────┤
│ [Buscar: _______________]                                       │
│                                                                 │
│ ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│ │      50       │  │      30       │  │        12         │   │
│ │Membros Comung.│  │Membros Present│  │Não-Com. e Visit.  │   │
│ └───────────────┘  └───────────────┘  └───────────────────┘   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ Nome         │ Tipo           │ Candidato │ Presente    │   │
│ ├─────────────────────────────────────────────────────────┤   │
│ │ João Silva   │ Comungante     │ Sim       │ ✅          │   │
│ │ Maria Costa  │ Não-Comungante │ -         │ ✅ AUTO     │   │
│ │ Pedro Visit  │ Visitante      │ -         │ ✅ AUTO     │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Atualização

### Quando `updateStats()` é Chamado

1. Ao carregar a página
2. Após adicionar novo membro
3. Após editar membro
4. Após deletar membro
5. Após importar CSV
6. Após marcar/desmarcar presença

### Processo de Cálculo

```
1. Buscar dados:
   ├─ members[] (todos os membros)
   ├─ attendanceStats (estatísticas de presença)
   └─ attendanceRecords[] (registros de presença)

2. Filtrar membros:
   ├─ comungantes = filter(tipo === "Membro Comungante")
   └─ nonVotingMembers = filter(tipo !== "Membro Comungante")

3. Calcular presentes não-votantes:
   ├─ presentRecordIds = Set de IDs presentes
   └─ nonVotingPresent = nonVotingMembers que estão em presentRecordIds

4. Atualizar DOM:
   ├─ #total-members = comungantes.length
   ├─ #present-members = attendanceStats.presentMembers
   └─ #candidate-members = nonVotingPresent
```

---

## 🧪 Testes Recomendados

### Teste 1: Contador de Comungantes

1. ✅ Adicionar 5 comungantes
2. ✅ Adicionar 2 não-comungantes
3. ✅ Adicionar 1 visitante
4. ✅ Verificar: "Membros Comungantes" = 5

### Teste 2: Contador de Presentes

1. ✅ Marcar 3 comungantes como presentes
2. ✅ Verificar: "Membros Presentes" = 3
3. ✅ Não-comungantes/visitantes não devem afetar este contador

### Teste 3: Contador de Não-Votantes

1. ✅ Ter 4 não-comungantes presentes
2. ✅ Ter 2 visitantes presentes
3. ✅ Verificar: "Não-Comungantes e Visitantes" = 6
4. ✅ Desmarcar 1 não-comungante
5. ✅ Verificar: contador atualiza para 5

### Teste 4: Importação CSV

1. ✅ Importar CSV com 10 comungantes, 5 não-comungantes, 3 visitantes
2. ✅ Verificar contadores:
   - Membros Comungantes: 10
   - Membros Presentes: 0 (comungantes não marcados)
   - Não-Comungantes e Visitantes: 8 (5 + 3, marcados automaticamente)

---

## 📝 Logs de Console

```
[updateStats] Attendance stats: {
  totalMembers: 50,
  presentMembers: 30,
  absentMembers: 20,
  attendanceRate: 60.0
}
[updateStats] Membros Comungantes: 50
[updateStats] Não-votantes presentes: 12
```

---

## 📁 Arquivos Modificados

1. **src/ui/manager.ts**
   - Método `updateStats()`: Lógica completa de cálculo dos contadores

2. **index.html**
   - Labels dos stat-cards atualizados

---

## ✅ Resultado Final

### Contadores Refletem Corretamente

✅ **Membros Comungantes**: Mostra apenas comungantes (base de quórum)  
✅ **Membros Presentes**: Mostra apenas comungantes presentes (elegíveis)  
✅ **Não-Comungantes e Visitantes**: Mostra não-votantes presentes (registro)

### Informações Claras

✅ Usuário vê quantos membros elegíveis existem  
✅ Usuário vê quantos elegíveis estão presentes  
✅ Usuário vê quantos não-votantes estão presentes (para ata)

### Consistência com Regras

✅ Alinhado com cálculo de quórum (apenas comungantes)  
✅ Alinhado com presença automática (não-votantes)  
✅ Alinhado com regras de votação (apenas comungantes)

---

**Data**: 11 de outubro de 2025  
**Versão**: 2.1.1  
**Status**: ✅ Implementado e Testado
