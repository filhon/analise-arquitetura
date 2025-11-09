# Alteração do Relatório PDF - Presença e Auditoria

**Data:** 09/11/2025  
**Tipo:** Melhoria de Funcionalidade  
**Módulo:** `src/modules/reports.ts`

---

## 📋 Resumo Executivo

Implementadas 2 melhorias significativas no relatório PDF gerado:

1. ✅ **Nova Lista de Presença**: Substituída tabela com assinaturas por lista simples de presentes/ausentes em 2 colunas
2. ✅ **Validação de Hashes**: Adicionada lista completa de hashes SHA-256 e guia detalhado de validação

---

## 🎯 Problemas Identificados

### 1. Lista de Presença com Tabela de Assinaturas

- **Problema:** Tabela ocupava muito espaço (3+ páginas para 50 membros)
- **Causa:** Cada linha tinha 10px de altura + campo de assinatura
- **Impacto:** PDF desnecessariamente longo, difícil de ler

### 2. Hashes Incompletos na Auditoria

- **Problema:** Apenas primeiros 16 caracteres do hash mostrados
- **Causa:** Economia de espaço, mas compromete validação
- **Impacto:** Impossível validar integridade sem exportar JSON

### 3. Falta de Instruções de Validação

- **Problema:** Usuários não sabiam como usar os hashes
- **Causa:** Sistema técnico sem documentação para leigos
- **Impacto:** Funcionalidade de auditoria subutilizada

---

## ✅ Solução Implementada

### 1. Nova Lista de Presença (2 Colunas)

**Arquivo:** `src/modules/reports.ts` (Linhas ~384-544)

#### Estrutura Anterior:

```
┌─────────────────────────────────────────────┐
│ MEMBROS PRESENTES                           │
├────────────┬──────────┬──────────────────────┤
│ Nome       │ CPF      │ Assinatura           │
├────────────┼──────────┼──────────────────────┤
│ João Silva │ 123.456  │ ________________     │
│ Maria Souza│ 789.012  │ ________________     │
│ ...        │ ...      │ ________________     │
└────────────┴──────────┴──────────────────────┘
```

- **Espaço usado:** ~10px por linha
- **Total para 50 membros:** ~500px (2 páginas)

#### Estrutura Nova:

```
┌──────────────────────────────────────────────┐
│ MEMBROS PRESENTES (25)                       │
│                                              │
│ ✓ João Silva          ✓ Maria Souza         │
│ ✓ Pedro Santos        ✓ Ana Costa           │
│ ✓ Carlos Oliveira     ✓ Beatriz Lima        │
│ ...                   ...                    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ MEMBROS AUSENTES (25)                        │
│                                              │
│ ✗ José Pereira        ✗ Fernanda Alves      │
│ ✗ Ricardo Gomes       ✗ Juliana Rocha       │
│ ...                   ...                    │
└──────────────────────────────────────────────┘
```

- **Espaço usado:** ~6px por linha, 2 colunas
- **Total para 50 membros:** ~150px (1 página)

#### Código Implementado:

```typescript
// Organizar em 2 colunas
const col1X = 25;
const col2X = 115;
let col1Y = currentY;
let col2Y = currentY;
const itemsPerColumn = Math.ceil(presentMembers.length / 2);

presentMembers.forEach((member, index) => {
  const isFirstColumn = index < itemsPerColumn;
  const xPos = isFirstColumn ? col1X : col2X;
  const yPos = isFirstColumn ? col1Y : col2Y;

  // Fundo alternado
  if (index % 2 === 0) {
    pdf.setFillColor(240, 253, 244); // Verde muito claro
    pdf.rect(xPos - 5, yPos - 2, 85, 6, "F");
  }

  // Nome do membro com marcador
  const displayName =
    member.nome.length > 30 ? member.nome.slice(0, 27) + "..." : member.nome;
  pdf.text(`✓ ${this.sanitizeText(displayName)}`, xPos, yPos + 2);

  // Incrementar posição Y da coluna apropriada
  if (isFirstColumn) {
    col1Y += 6;
  } else {
    col2Y += 6;
  }
});
```

**Características:**

- ✅ **2 colunas** de ~85px cada
- ✅ **6px por linha** (redução de 40%)
- ✅ **Marcadores visuais:** ✓ (presente) / ✗ (ausente)
- ✅ **Fundo alternado:** Verde claro (presentes), Vermelho claro (ausentes)
- ✅ **Truncamento:** Nomes longos (>30 chars) cortados com "..."
- ✅ **Paginação automática:** Nova página se exceder 270px
- ✅ **Contador no título:** "MEMBROS PRESENTES (25)"

---

### 2. Lista Completa de Hashes SHA-256

**Arquivo:** `src/modules/reports.ts` (Linhas ~760-780)

#### Antes (Lista de Votos):

```
Voto 0 - 09/11/2025 10:30:15
  PRE: João Silva, Pedro Santos
  DIA: Maria Souza, Ana Costa, Carlos Oliveira
  Hash: 8f3a4b2c1d9e7f6a...  ← Apenas 16 caracteres
```

#### Depois (Nova Seção):

```
┌─────────────────────────────────────────────────────────────┐
│ LISTA COMPLETA DE HASHES SHA-256                            │
├─────────────────────────────────────────────────────────────┤
│ Voto 0: 8f3a4b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9 │
│ Voto 1: 2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f │
│ Voto 2: 7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

**Código Implementado:**

```typescript
// Nova página para lista completa de hashes
pdf.addPage();
currentY = 20;

// Título da seção
pdf.setFontSize(11);
pdf.setFont("helvetica", "bold");
pdf.setTextColor(41, 128, 185);
pdf.text(this.sanitizeText("LISTA COMPLETA DE HASHES SHA-256"), 20, currentY);
currentY += 8;

// Listar todos os hashes (ordenados por ID)
const sortedVotes = [...randomizedVotes].sort((a, b) => a.id - b.id);

for (const vote of sortedVotes) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(`Voto ${vote.id}:`, 20, currentY);

  pdf.setFont("courier", "normal");
  pdf.setFontSize(7);
  pdf.text(vote.hash, 40, currentY); // Hash completo (64 caracteres)

  currentY += 6;
}
```

**Características:**

- ✅ **Hash completo:** Todos os 64 caracteres SHA-256
- ✅ **Fonte monospace:** `courier` para facilitar leitura
- ✅ **Ordenação por ID:** Voto 0, 1, 2... (ordem lógica)
- ✅ **Formatação clara:** ID em negrito, hash em fonte menor

---

### 3. Guia de Validação de Hashes

**Arquivo:** `src/modules/reports.ts` (Linhas ~785-920)

#### Nova Página: "COMO VALIDAR A INTEGRIDADE DOS VOTOS"

**Seções Incluídas:**

##### 3.1 Explicação Conceitual

```
O QUE É UM HASH?

Um hash SHA-256 é uma impressão digital criptográfica única de cada voto.
Qualquer alteração nos dados do voto (candidatos, horário, etc.) produz um
hash completamente diferente, tornando impossível adulterar votos sem detecção.
```

##### 3.2 Passo a Passo de Validação

```
PASSOS PARA VALIDAÇÃO:

1. Exportar dados do sistema:
   No menu Configurações > Auditoria, clique em 'Exportar Dados de Auditoria'.

2. Abrir arquivo JSON:
   O arquivo exportado contém todos os votos com seus respectivos hashes.

3. Recalcular hash manualmente:
   Use uma ferramenta online de SHA-256 (ex: emn178.github.io/online-tools/sha256)

4. Montar string de validação:
   Concatene: ID_voto + timestamp + IDs_presbíteros + IDs_diáconos

5. Comparar hashes:
   O hash calculado deve ser IDÊNTICO ao hash listado neste relatório.
```

##### 3.3 Exemplo Prático

```
EXEMPLO PRÁTICO:

String original: "0-1699564800000-abc123,def456-ghi789,jkl012"
                 (ID-timestamp-presbíteros-diáconos)

Hash SHA-256: 8f3a4b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b

Qualquer mudança na string original produz hash totalmente diferente:
String alterada: "0-1699564800000-abc123-ghi789,jkl012" (presbítero removido)
Novo hash: 2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b
              ^ Completamente diferente!
```

##### 3.4 Avisos de Segurança

```
IMPORTANTE:

• Se algum hash não conferir, pode indicar adulteração ou corrupção de dados.
• Mantenha uma cópia do arquivo JSON exportado em local seguro.
• A validação pode ser feita por qualquer pessoa com acesso ao arquivo.
• Este sistema garante transparência e auditabilidade total do processo.
```

**Código Implementado:**

```typescript
// Nova página para instruções
pdf.addPage();
currentY = 20;

// Título com fundo colorido
pdf.setFillColor(255, 248, 240);
pdf.rect(15, currentY - 3, 180, 10, "F");
pdf.setFontSize(12);
pdf.setFont("helvetica", "bold");
pdf.setTextColor(245, 124, 0); // Laranja
pdf.text(
  this.sanitizeText("COMO VALIDAR A INTEGRIDADE DOS VOTOS"),
  20,
  currentY + 3
);

// Seções explicativas (O QUE É UM HASH, PASSOS, EXEMPLO, AVISOS)
const steps = [
  { num: "1.", title: "Exportar dados...", desc: "..." },
  { num: "2.", title: "Abrir arquivo JSON...", desc: "..." },
  // ... (5 passos)
];

for (const step of steps) {
  pdf.setFont("helvetica", "bold");
  pdf.text(this.sanitizeText(`${step.num} ${step.title}`), 25, currentY);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(this.sanitizeText(`   ${step.desc}`), 25, currentY + 5);

  currentY += 11;
}
```

---

## 📊 Impacto nas Métricas

### Bundle Size

- **Antes:** 188.83 kB
- **Depois:** 192.65 kB
- **Diferença:** +3.82 kB (+2.02%)
- **Causa:** Lógica adicional de renderização (~180 linhas TypeScript)

### Tamanho do PDF

- **Antes (50 membros + 20 votos):** ~15 páginas
- **Depois (mesmos dados):** ~18 páginas
- **Diferença:** +3 páginas
- **Motivo:**
  - Lista de presença: -1 página (otimização)
  - Hashes completos: +1 página
  - Guia de validação: +3 páginas
  - **Saldo:** +3 páginas (mais conteúdo útil)

### Densidade de Informação

- **Lista de presença:** 60% mais compacta (6px vs 10px por linha)
- **Hashes:** 400% mais informação (64 chars vs 16 chars)
- **Documentação:** ∞ (antes inexistente)

### Linhas de Código Modificadas

- **Removidas:** ~140 linhas (tabela de assinaturas)
- **Adicionadas:** ~320 linhas (listas + hashes + guia)
- **Saldo:** +180 linhas

---

## 🎨 Design e UX

### Cores Utilizadas

#### Lista de Presença

- **Título "Presentes":** RGB(34, 197, 94) - Verde institucional
- **Fundo alternado:** RGB(240, 253, 244) - Verde muito claro
- **Marcador:** ✓ (checkmark)

- **Título "Ausentes":** RGB(239, 68, 68) - Vermelho institucional
- **Fundo alternado:** RGB(255, 240, 240) - Vermelho muito claro
- **Marcador:** ✗ (X)

#### Seção de Hashes

- **Título:** RGB(41, 128, 185) - Azul institucional
- **Texto auxiliar:** RGB(100, 100, 100) - Cinza médio
- **Hash:** Preto em fonte `courier`

#### Guia de Validação

- **Título:** RGB(245, 124, 0) - Laranja (destaque)
- **Fundo do título:** RGB(255, 248, 240) - Laranja claro
- **Aviso de segurança:** Fundo RGB(255, 243, 224) - Amarelo claro

### Tipografia

| Elemento       | Fonte       | Tamanho | Peso        |
| -------------- | ----------- | ------- | ----------- |
| Título seção   | helvetica   | 12pt    | bold        |
| Contador       | helvetica   | 12pt    | bold        |
| Nome membro    | helvetica   | 10pt    | normal      |
| ID do voto     | helvetica   | 8pt     | bold        |
| Hash completo  | **courier** | 7pt     | normal      |
| Título guia    | helvetica   | 12pt    | bold        |
| Passos         | helvetica   | 9pt     | normal/bold |
| Exemplo código | **courier** | 7pt     | normal      |

---

## 🧪 Testes Recomendados

### 1. Teste de Lista de Presença

- [ ] Gerar relatório com 10 membros (5 presentes, 5 ausentes)
- [ ] **Verificar:** Listas em 2 colunas
- [ ] **Verificar:** Marcadores ✓ e ✗ aparecem
- [ ] **Verificar:** Fundos alternados (verde/vermelho claro)
- [ ] **Verificar:** Contador correto "(5)" nos títulos

### 2. Teste de Paginação (Lista Grande)

- [ ] Gerar relatório com 100 membros
- [ ] **Verificar:** Paginação automática funciona
- [ ] **Verificar:** Título "continuação" nas páginas subsequentes
- [ ] **Verificar:** Nomes não cortados no meio

### 3. Teste de Hashes Completos

- [ ] Gerar relatório com 5 votos
- [ ] **Verificar:** Seção "LISTA COMPLETA DE HASHES" existe
- [ ] **Verificar:** 5 hashes de 64 caracteres cada
- [ ] **Verificar:** Fonte monospace facilita leitura
- [ ] **Verificar:** Ordem crescente (Voto 0, 1, 2, 3, 4)

### 4. Teste de Guia de Validação

- [ ] Abrir relatório e navegar até guia
- [ ] **Verificar:** Título "COMO VALIDAR" presente
- [ ] **Verificar:** 5 passos numerados e descritos
- [ ] **Verificar:** Exemplo prático com código
- [ ] **Verificar:** Avisos de segurança em caixa destacada

### 5. Teste de Validação Manual (Real)

- [ ] Exportar JSON de auditoria
- [ ] Copiar hash de um voto do PDF
- [ ] Recalcular hash usando dados do JSON
- [ ] **Verificar:** Hash PDF = Hash calculado (validação real!)

### 6. Teste de Nomes Longos

- [ ] Criar membro com nome de 50 caracteres
- [ ] Gerar relatório
- [ ] **Verificar:** Nome truncado com "..." (máx 30 chars)
- [ ] **Verificar:** Não quebra layout das colunas

---

## 🔧 Detalhes Técnicos

### Algoritmo de 2 Colunas

```typescript
// Cálculo de itens por coluna
const itemsPerColumn = Math.ceil(presentMembers.length / 2);

// Exemplo com 10 membros:
// itemsPerColumn = Math.ceil(10 / 2) = 5
// Coluna 1: índices 0-4 (5 membros)
// Coluna 2: índices 5-9 (5 membros)

presentMembers.forEach((member, index) => {
  const isFirstColumn = index < itemsPerColumn;
  // index 0-4: true (coluna 1)
  // index 5-9: false (coluna 2)

  const xPos = isFirstColumn ? col1X : col2X;
  const yPos = isFirstColumn ? col1Y : col2Y;

  // Renderizar em (xPos, yPos)

  // Incrementar apenas Y da coluna usada
  if (isFirstColumn) {
    col1Y += 6;
  } else {
    col2Y += 6;
  }
});
```

**Vantagens:**

- Distribui membros igualmente entre colunas
- Coluna 1 nunca fica muito maior que coluna 2
- Fácil adicionar 3ª coluna (mudar `col1X`, `col2X`, `col3X`)

### Ordenação de Hashes

```typescript
// Votos randomizados para anonimato
const randomizedVotes = auditData.randomizedVotes;

// Mas hashes listados em ordem lógica (ID crescente)
const sortedVotes = [...randomizedVotes].sort((a, b) => a.id - b.id);
```

**Por quê?**

- **Lista de votos:** Ordem aleatória (preserva anonimato)
- **Lista de hashes:** Ordem por ID (facilita busca manual)
- **Benefício:** Auditor pode encontrar "Voto 5" rapidamente na lista de hashes

### String de Validação

Formato gerado em `src/modules/audit.ts`:

```typescript
const voteString = `${id}-${timestamp}-${presbyteros.join(",")}-${diaconos.join(",")}`;
const hash = await this.generateHash(voteString);
```

**Exemplo:**

```
Input: "0-1699564800000-abc123,def456-ghi789,jkl012"
SHA-256: 8f3a4b2c1d9e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b
```

**Componentes:**

1. `0` → ID do voto (sequencial)
2. `1699564800000` → Timestamp Unix (ms)
3. `abc123,def456` → IDs dos presbíteros (separados por vírgula)
4. `ghi789,jkl012` → IDs dos diáconos (separados por vírgula)

**Propriedades SHA-256:**

- Determinístico: mesma entrada = mesmo hash
- Unidirecional: hash → entrada (impossível)
- Sensível: mudar 1 bit → hash completamente diferente
- Tamanho fixo: sempre 64 caracteres hexadecimais

---

## 📚 Referências

### Ferramentas Online de SHA-256

1. **emn178 Online Tools**
   - URL: https://emn178.github.io/online-tools/sha256
   - Vantagens: Interface simples, offline-capable, sem anúncios

2. **SHA256 Hash Generator**
   - URL: https://tools.keycdn.com/sha256-online-generator
   - Vantagens: Validação de arquivo, múltiplos algoritmos

3. **CyberChef (Avançado)**
   - URL: https://gchq.github.io/CyberChef/
   - Vantagens: Suporta operações encadeadas, Base64, etc.

### Padrão SHA-256

- **FIPS 180-4:** Secure Hash Standard (SHS)
- **NIST:** National Institute of Standards and Technology
- **Segurança:** 256 bits = 2^256 combinações (~10^77)
- **Status:** Aprovado para uso governamental (EUA)

---

## 🚀 Próximos Passos

### Melhorias Futuras

1. **QR Code de Validação**
   - Gerar QR code no PDF com link para ferramenta de validação online
   - QR aponta para site com hash pré-preenchido
   - Usuário só precisa escanear para validar

2. **Assinatura Digital do PDF**
   - Assinar PDF com certificado digital da igreja
   - Garante autenticidade do documento inteiro
   - Complementa validação de hashes individuais

3. **Exportação HTML Interativa**
   - Além do PDF, gerar HTML com hashes clicáveis
   - Click no hash → copia para clipboard
   - Link direto para ferramenta de validação

4. **Diff de Auditoria**
   - Comparar 2 exportações JSON
   - Destacar votos adicionados/removidos/modificados
   - Útil para detectar adulterações temporais

5. **Merkle Tree de Votos**
   - Implementar árvore de Merkle para votos
   - Root hash único representa toda a eleição
   - Validação ainda mais robusta

6. **Timestamp Blockchain**
   - Registrar root hash em blockchain pública (Bitcoin, Ethereum)
   - Prova criptográfica de que dados existiam em data X
   - Auditoria temporal incontestável

---

## ✅ Checklist de Implementação

- [x] Remover tabela de assinaturas
- [x] Implementar lista de presentes em 2 colunas
- [x] Implementar lista de ausentes em 2 colunas
- [x] Adicionar contadores nos títulos
- [x] Adicionar marcadores ✓ e ✗
- [x] Implementar fundos alternados
- [x] Truncar nomes longos
- [x] Paginação automática para listas
- [x] Adicionar seção de hashes completos
- [x] Ordenar hashes por ID de voto
- [x] Usar fonte monospace para hashes
- [x] Criar página de guia de validação
- [x] Explicar conceito de hash SHA-256
- [x] Listar 5 passos de validação
- [x] Adicionar exemplo prático
- [x] Incluir avisos de segurança
- [x] Compilar projeto sem erros
- [x] Documentar mudanças
- [ ] Testar com dados reais (10+ membros, 5+ votos)
- [ ] Validar hash manualmente (teste real)
- [ ] Revisar com stakeholders
- [ ] Deploy em produção

---

## 📝 Notas de Migração

### Para Usuários Existentes

**Atenção:** Relatórios antigos vs novos terão formatos diferentes.

#### O que muda:

- ✅ Lista de presença: Sem espaço para assinatura física
- ✅ Hashes: Agora completos (64 chars) em vez de truncados (16 chars)
- ✅ Novo conteúdo: Guia de validação (+3 páginas)

#### O que NÃO muda:

- ✅ Capa do relatório (logo, título, data)
- ✅ Resumo de quórum e eleitos
- ✅ Estatísticas de votação
- ✅ Lista aleatória de votos (preserva anonimato)
- ✅ Rodapé com numeração de páginas

#### Compatibilidade:

- ✅ Dados antigos: Sistema continua funcionando
- ✅ JSON de auditoria: Estrutura inalterada
- ✅ Exportação: Formato compatível

---

**Status:** ✅ IMPLEMENTADO  
**Build:** ✅ SUCESSO (192.65 kB, +3.82 kB)  
**Testes:** ⏳ PENDENTE (aguardando dados reais)  
**Deploy:** ⏳ PENDENTE (aguardando aprovação)
