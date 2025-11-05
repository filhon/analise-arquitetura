# 🧪 Guia de Testes Multi-Dispositivo - Fase 4

**Data:** 05 de novembro de 2025  
**Versão:** 2.0 - Estrutura Incremental  
**Status:** 🔄 EM EXECUÇÃO

---

## 🎯 Objetivo dos Testes

Validar que a **estrutura incremental de auditoria** elimina race conditions em cenários de votação simultânea com múltiplos dispositivos.

---

## 🖥️ Servidor de Desenvolvimento

✅ **Servidor Ativo:** `http://localhost:3000/`

```bash
VITE v5.4.20  ready in 1844 ms
➜  Local:   http://localhost:3000/
```

---

## 📋 Checklist de Preparação

### ✅ Pré-requisitos

- [x] Build bem-sucedido (0 erros TypeScript)
- [x] Servidor de desenvolvimento rodando
- [x] Firebase Realtime Database configurado
- [x] Estrutura incremental implementada
- [ ] 2 navegadores/dispositivos disponíveis
- [ ] Conta de admin configurada
- [ ] Dados de teste preparados

---

## 🧪 Plano de Testes

### **Teste 1: Votação Simultânea (Cenário Crítico)**

**Objetivo:** Validar que 2 dispositivos podem votar ao mesmo tempo sem perda de dados.

#### Setup

1. **Device A:** Abrir Chrome → `http://localhost:3000/`
2. **Device B:** Abrir Firefox → `http://localhost:3000/`
3. **Ambos:** Fazer login com credenciais admin
4. **Ambos:** Ir para aba "Membros"

#### Preparação de Dados

**Device A (apenas):**

1. Adicionar 6 membros de teste:
   - João Silva (CPF: 111.111.111-11) - Candidato a Presbítero
   - Maria Santos (CPF: 222.222.222-22) - Candidata a Presbítero
   - Pedro Oliveira (CPF: 333.333.333-33) - Candidato a Diácono
   - Ana Costa (CPF: 444.444.444-44) - Candidata a Diácono
   - Carlos Souza (CPF: 555.555.555-55) - Membro votante
   - Lucia Alves (CPF: 666.666.666-66) - Membro votante

2. Marcar João e Maria como candidatos a Presbítero
3. Marcar Pedro e Ana como candidatos a Diácono

**Device B:**

- Aguardar sincronização (deve ver os 6 membros automaticamente)

#### Marcar Presença

**Ambos os devices:**

1. Ir para aba "Presença"
2. Marcar presença de todos os 6 membros
3. Validar que contador sincroniza: "6 membros presentes"

#### Executar Votação Simultânea

**Timing crítico (executar ao mesmo tempo):**

| Device A                 | Device B                 | Timestamp |
| ------------------------ | ------------------------ | --------- |
| Ir para aba "Votação"    | Ir para aba "Votação"    | T+0s      |
| Clicar "Iniciar Votação" | Clicar "Iniciar Votação" | T+1s      |
| Selecionar: João         | Selecionar: Maria        | T+5s      |
| Clicar "Confirmar Voto"  | Clicar "Confirmar Voto"  | T+7s      |

**⚠️ CRUCIAL:** Clicar em "Confirmar Voto" o mais simultaneamente possível (diferença < 1 segundo).

#### Validações Esperadas

**Durante a Votação:**

✅ **Device A:**

- Voto registrado com sucesso
- Redirecionado para tela de presença
- Console: `[AuditManager] ✅ Voto 0 salvo com sucesso`
- Console: `[RealtimeSync] 🔄 Novo voto recebido: ID 1`

✅ **Device B:**

- Voto registrado com sucesso
- Redirecionado para tela de presença
- Console: `[AuditManager] ✅ Voto 1 salvo com sucesso`
- Console: `[RealtimeSync] 🔄 Novo voto recebido: ID 0`

**Após Sincronização (5-10 segundos):**

✅ **Ambos os Devices:**

- Contador "Votos Registrados": **2**
- Card de quórum mostra: "2 votos" em tempo real
- Sem erros no console
- Sem warnings de race condition

**Firebase Console:**

Acessar: `https://console.firebase.google.com/`

Navegar até: **Realtime Database → audit/**

Estrutura esperada:

```
/audit
  ├─ 0/
  │   ├─ id: 0
  │   ├─ timestamp: "2025-11-05T..."
  │   ├─ presbyteros: ["id-joao"]
  │   ├─ diaconos: []
  │   ├─ hash: "abc123..."
  │   ├─ createdBy: "session-deviceA"
  │   └─ createdAt: 1730851234567
  ├─ 1/
  │   ├─ id: 1
  │   ├─ timestamp: "2025-11-05T..."
  │   ├─ presbyteros: ["id-maria"]
  │   ├─ diaconos: []
  │   ├─ hash: "def456..."
  │   ├─ createdBy: "session-deviceB"
  │   └─ createdAt: 1730851235890
  └─ metadata/
      ├─ totalVotes: 2
      ├─ lastUpdated: 1730851236000
      └─ version: "2.0"
```

✅ **Validações Críticas:**

- [ ] 2 nós numéricos criados (0 e 1)
- [ ] IDs únicos e sequenciais
- [ ] Timestamps diferentes (< 2s de diferença)
- [ ] Sessions IDs diferentes
- [ ] Metadata totalVotes = 2
- [ ] Sem sobrescrita de dados

---

### **Teste 2: Votação Sequencial (Controle)**

**Objetivo:** Validar comportamento normal (não-simultâneo).

#### Execução

**Device A:**

1. Votar em João (Presbítero)
2. Aguardar 5 segundos
3. Validar contador: "3 votos"

**Device B:** 4. Aguardar sincronização (deve ver "3 votos") 5. Votar em Pedro (Diácono) 6. Validar contador: "4 votos"

**Device A:** 7. Validar sincronização automática: "4 votos"

#### Validações Esperadas

✅ **Firebase:**

```
/audit
  ├─ 0/ ... (teste anterior)
  ├─ 1/ ... (teste anterior)
  ├─ 2/ (Device A - voto 3)
  ├─ 3/ (Device B - voto 4)
  └─ metadata/
      └─ totalVotes: 4
```

✅ **Ambos os Devices:**

- Contador sincronizado: **4 votos**
- Sem erros ou warnings

---

### **Teste 3: Device Offline → Online**

**Objetivo:** Validar recuperação após offline.

#### Execução

**Device A:**

1. Desconectar da internet (WiFi off ou modo avião)
2. Votar em Ana (Diácono)
3. Observar: "Voto salvo localmente (offline)"
4. Reconectar internet
5. Aguardar 10 segundos

**Device B:** 6. Observar sincronização automática

#### Validações Esperadas

✅ **Device A (após reconectar):**

- Console: `[RealtimeSync] 🔄 Reconnected to Firebase`
- Console: `[AuditManager] ✅ Voto 4 sincronizado`
- Contador: **5 votos**

✅ **Device B:**

- Console: `[RealtimeSync] 🔄 Novo voto recebido: ID 4`
- Contador atualiza automaticamente: **5 votos**

✅ **Firebase:**

```
/audit
  ├─ 4/ (voto offline sincronizado)
  └─ metadata/
      └─ totalVotes: 5
```

---

### **Teste 4: Carga Inicial (Novo Device)**

**Objetivo:** Validar que novo device carrega dados existentes.

#### Execução

**Device C (novo navegador Edge):**

1. Abrir `http://localhost:3000/`
2. Fazer login
3. Ir para aba "Votação"
4. Observar contador de votos

#### Validações Esperadas

✅ **Device C:**

- Console: `[AuditManager] 🔄 Carregando votos do Firebase...`
- Console: `[AuditManager] ✅ 5 votos carregados do Firebase`
- Contador: **5 votos** (sem votar)
- Lista de membros sincronizada
- Presença sincronizada

---

### **Teste 5: Prevenção de Loops**

**Objetivo:** Validar que device não processa seu próprio voto.

#### Execução

**Device A:**

1. Abrir Console do navegador (F12)
2. Filtrar logs por: `[RealtimeSync]`
3. Votar em João
4. Observar logs

#### Validações Esperadas

✅ **Console Device A:**

```
[AuditManager] ✅ Voto 5 registrado
[RealtimeSync] 💾 Voto 5 enviado ao Firebase
```

❌ **NÃO deve aparecer:**

```
[RealtimeSync] 🔄 Novo voto recebido: ID 5  // Loop detectado!
```

✅ **Device B:**

```
[RealtimeSync] 🔄 Novo voto recebido: ID 5  // Correto!
[AuditManager] ✅ Voto 5 adicionado (total: 6)
```

---

## 📊 Métricas de Sucesso

### Critérios de Aprovação

| Teste       | Critério                        | Status      |
| ----------- | ------------------------------- | ----------- |
| **Teste 1** | 2 votos criados com IDs únicos  | ⏳ Pendente |
| **Teste 1** | Sem race conditions no Firebase | ⏳ Pendente |
| **Teste 1** | Contador sincronizado em ambos  | ⏳ Pendente |
| **Teste 2** | 4 votos totais sequenciais      | ⏳ Pendente |
| **Teste 3** | Voto offline sincronizado       | ⏳ Pendente |
| **Teste 4** | Novo device carrega 5 votos     | ⏳ Pendente |
| **Teste 5** | Sem loops de sincronização      | ⏳ Pendente |

### Performance Esperada

- **Latência de Sincronização:** < 2 segundos
- **Bandwidth por Voto:** ~200 bytes
- **Tempo de Recuperação (Offline):** < 5 segundos

---

## 🐛 Troubleshooting

### Problema: "Votos não sincronizam"

**Diagnóstico:**

```javascript
// Abrir console do navegador
const realtimeSync = RealtimeSync.getInstance();
console.log(realtimeSync.getStatus());
```

**Saída esperada:**

```json
{
  "enabled": true,
  "configured": true,
  "sessionId": "session-abc123",
  "listeners": 3
}
```

**Soluções:**

- Verificar credenciais Firebase em `src/config/firebase.ts`
- Verificar regras do Realtime Database (permitir leitura/escrita)
- Limpar localStorage: `localStorage.clear()`

### Problema: "Race condition detectada"

**Sintomas:**

- Apenas 1 voto aparece no Firebase (esperado: 2)
- Contador mostra número incorreto

**Diagnóstico:**

```javascript
// Firebase Console → audit/
// Verificar se há apenas 1 nó (0/ OU 1/)
```

**⚠️ CRÍTICO:** Se isso acontecer, a implementação falhou!

**Ação:**

1. Capturar logs do console de ambos os devices
2. Verificar timestamps dos votos
3. Reportar issue com logs completos

### Problema: "Loop infinito de sincronização"

**Sintomas:**

- Console mostra repetidas mensagens `[RealtimeSync] 🔄 Novo voto recebido`
- Contador aumenta descontroladamente

**Diagnóstico:**

```javascript
// Verificar se createdBy está sendo enviado
const auditManager = AuditManager.getInstance();
console.log(auditManager.votes[0]); // Deve ter 'createdBy'
```

**Solução:**

- Limpar Firebase: deletar `/audit` no Console
- Limpar localStorage: `localStorage.clear()`
- Recarregar página

---

## 📝 Registro de Testes

### Template de Registro

**Data/Hora:** **********\_**********  
**Testador:** **********\_**********  
**Browsers:** Device A: **\_\_\_** | Device B: **\_\_\_**

**Teste 1: Votação Simultânea**

- [ ] Device A registrou voto com ID 0
- [ ] Device B registrou voto com ID 1
- [ ] Firebase tem 2 nós (0/ e 1/)
- [ ] Contador sincronizado: 2 votos
- [ ] Sem erros no console
- **Resultado:** ✅ PASSOU | ❌ FALHOU

**Teste 2: Votação Sequencial**

- [ ] 4 votos totais criados
- [ ] IDs sequenciais (0, 1, 2, 3)
- [ ] Sincronização automática
- **Resultado:** ✅ PASSOU | ❌ FALHOU

**Teste 3: Offline → Online**

- [ ] Voto salvo offline
- [ ] Sincronização após reconectar
- [ ] Device B recebeu voto
- **Resultado:** ✅ PASSOU | ❌ FALHOU

**Teste 4: Carga Inicial**

- [ ] Novo device carregou dados
- [ ] Contador correto
- **Resultado:** ✅ PASSOU | ❌ FALHOU

**Teste 5: Prevenção de Loops**

- [ ] Device A não processou próprio voto
- [ ] Device B processou voto do A
- **Resultado:** ✅ PASSOU | ❌ FALHOU

**Observações:**

---

---

---

---

## 🎯 Próximos Passos (Após Testes)

### Se Todos os Testes Passarem ✅

1. **Documentar Resultados**
   - Atualizar `MIGRACAO-AUDIT-ESTRUTURA-INCREMENTAL.md`
   - Marcar Fase 4 como completa em `copilot-instructions.md`
   - Criar resumo executivo dos testes

2. **Deploy para Produção**
   - Criar backup do Firebase atual
   - Implementar migração automática V1 → V2
   - Deploy gradual (canary release)

3. **Monitoramento**
   - Configurar alertas para race conditions
   - Implementar métricas de performance
   - Dashboard de auditoria

### Se Algum Teste Falhar ❌

1. **Análise de Falha**
   - Capturar logs completos
   - Reproduzir cenário isolado
   - Identificar causa raiz

2. **Correção**
   - Implementar fix específico
   - Adicionar testes unitários
   - Re-executar bateria completa

3. **Regression Testing**
   - Validar que fix não quebrou outros fluxos
   - Testar edge cases adicionais

---

## 📚 Referências

- **Documentação Técnica:** `docs/MIGRACAO-AUDIT-ESTRUTURA-INCREMENTAL.md`
- **Firebase onChildAdded:** https://firebase.google.com/docs/database/web/lists-of-data#listen_for_child_events
- **Atomic Writes:** https://firebase.google.com/docs/database/web/read-and-write#save_data_as_transactions

---

## ✅ Checklist Final

Antes de marcar Fase 4 como completa:

- [ ] Todos os 5 testes executados
- [ ] 100% dos testes passaram
- [ ] Logs capturados e analisados
- [ ] Firebase Console validado
- [ ] Performance dentro do esperado (< 2s latência)
- [ ] Sem race conditions detectadas
- [ ] Documentação atualizada
- [ ] Resultados registrados

---

**🚀 Sistema pronto para testes manuais!**

**Servidor:** http://localhost:3000/  
**Firebase Console:** https://console.firebase.google.com/

**Instruções:** Execute os testes na ordem apresentada, marcando cada validação. Documente quaisquer comportamentos inesperados no campo "Observações".

---

**Documento criado em 05/11/2025**  
**Sistema de Eleição de Oficiais v2.0**
