# Pending Checklists (consolidado)

Gerado automaticamente em 2025-10-15.

Este arquivo consolida todas as checklists pendentes encontradas na pasta `docs/`, com o arquivo e um trecho/contexto. As entradas foram ordenadas por prioridade heurística (segurança/sincronização → dados/migração → imagens/Storage → UI/testes → outros).

## Contrato operacional (fonte de verdade)

Este arquivo (`docs/PENDING-CHECKLISTS.md`) será a nossa fonte de verdade para checklists pendentes e desdobramentos.

Regras operacionais (obrigatórias):

- Sempre que uma tarefa for concluída pelo time (você ou eu), o arquivo deve ser atualizado para refletir a mudança (marcar como concluído, mover para histórico, ou remover).
- Sempre que uma tarefa for desdobrada (criação de subtarefa, divisão ou mudança de escopo), o novo desdobramento deve ser adicionado aqui com referência ao arquivo/origem e uma linha explicativa curta.
- Cada alteração deve incluir: data (ISO), autor (usuário ou assistente), tipo (concluído | adicionado | desdobramento), referência (arquivo + trecho), e comentário curto.

Formato mínimo para uma atualização (exemplo):

2025-10-15 | Filipe | concluído | `docs/CORRECAO-MINIATURA-FOTO-CANDIDATO.md` (Teste 1) | "Miniatura validada no ambiente de dev"

Processo automatizado que seguirei:

1. Ao concluir ou desdobrar uma tarefa, atualizo o `todoList` interno via ferramenta de gerenciamento de tarefas e, em seguida, atualizo este arquivo com o registro de alteração.
2. Sempre incluo um pequeno comentário que explica o impacto e o próximo passo recomendado (se houver).
3. Se quiser que eu crie issues ou sub-tarefas a partir de um desdobramento, eu proponho o conjunto e atualizo aqui antes de criar as tarefas.

Se estiver de acordo com este contrato, eu aplicarei automaticamente essa rotina para todas as próximas mudanças.

## Prioridade A — Segurança / Sincronização / Produção

1. `docs/TESTES-FIREBASE.md` (Seção: CHECKLIST DE VALIDAÇÃO — Inicialização / Sincronização)
   - Linhas aproximadas: 170–210
   - Itens pendentes:
   - [x] Sistema compilando sem erros (rode `npm run type-check`)
     - [ ] Console mostra "✅ Firebase inicializado"
     - [ ] Console mostra "📡 Sincronização: ATIVA"
     - [ ] Sem erros vermelhos no console
     - [ ] Abrir 2 abas do navegador e validar sincronização
     - [ ] Validar estrutura no Firebase Console (members, attendance, quorum)

1. `docs/REFATORACAO-ARQUITETURAL-SSOT.md` (FASE 8 / FASE 9)
   - Linhas aproximadas: 340–400
   - Itens pendentes:
   - [x] Remover interfaces `Candidate`, `AttendanceRecord`, `VotingData` (convertidas para type aliases em `src/types/index.ts`)
   - [x] Remover `StorageKeys` obsoletos (chequei código — apenas `StorageKeys.MEMBERS` e `StorageKeys.CONFIG` permanecem)
   - [x] Remover métodos deprecated
   - [x] Atualizar `ExportData` interface
   - [ ] Criar script de migração de dados antigos
   - [ ] Testar fluxo completo: membro → candidato → voto → resultado
   - [ ] Testar sincronização Firebase (múltiplas tabs)
   - [ ] Testar offline → online
   - [ ] Stress test: 1000+ membros, 50+ candidatos

## Prioridade B — Dados / Migração

3. `docs/CORRECAO-CRITICA-ID-UNICO.md` (Próximos Passos — Migração)
   - Linhas aproximadas: 720–760
   - Itens pendentes:
     - [ ] Remover storage `localStorage.CANDIDATES` completamente
     - [ ] Remover método `addCandidate()` de VotingManager
     - [ ] Remover método `removeCandidateByName()` de VotingManager
     - [ ] Atualizar interface `Candidate` para usar `Member` diretamente
     - [ ] Criar script de migração para dados existentes
     - [ ] Converter `CANDIDATES` storage → `MEMBERS.candidato`
     - [ ] Validar IDs únicos em todos os registros
     - [ ] Unit/Integration/E2E tests relacionados

4. `docs/REFATORACAO-COMPLETA-IMPLEMENTADA.md` (Próximos passos)
   - Linhas aproximadas: 450–480
   - Itens pendentes:
     - [ ] Testes manuais executados
     - [ ] Testes em múltiplas abas
     - [ ] Documentação atualizada
     - [ ] Deploy em produção

## Prioridade C — Imagens / Storage / Photo UX

5. `docs/CORRECAO-MINIATURA-FOTO-CANDIDATO.md` (Testes Recomendados)
   - Linhas aproximadas: 200–240
   - Itens pendentes:
     - [ ] Abrir modal "Novo Candidato" → verificar ícone e fluxo de upload
     - [ ] Testar JPG/PNG/GIF/WEBP
     - [ ] Validar rejeição para >2MB e arquivos inválidos (PDF/TXT)
     - [ ] Testar proporções (quadrada, retrato, paisagem)

6. `docs/CORRECAO-FOTO-CARD-CANDIDATO.md` — (verificação já com itens marcados OK, manter monitoramento)
   - A maioria está marcada como concluída; pendências mínimas não explícitas aqui.

7. `docs/PRONTO-FIREBASE.md` (Testes de inicialização e sincronização)
   - Linhas aproximadas: 140–144
   - Itens pendentes:
     - [ ] Teste 1: Inicialização (ver console)
     - [ ] Teste 2: Sincronização local (2 abas)
     - [ ] Teste 3: Firebase Console (ver dados)
     - [ ] Teste 4: Sincronização remota (2 computadores)

## Prioridade D — UI / Tests manuais / QA

8. `docs/BUSCA-MEMBROS-CANDIDATOS.md` (Cenários de Teste)
   - Linhas aproximadas: 360–420
   - Itens pendentes (exemplos):
     - [ ] Abrir modal "Novo Candidato"
     - [ ] Verificar campo de busca presente
     - [ ] Testar buscas (joão, MARIA, xyz123)
     - [ ] Verificar comportamento com nenhum membro disponível
     - [ ] Testar hover/seleção

9. `docs/CORRECAO-SUBMIT-EDITAR-CANDIDATO.md` (Testes de submissão / edição)
   - Linhas aproximadas: 90–100
   - Itens pendentes:
     - [ ] Abrir modal "Novo Candidato" → campo select visível e `required`
     - [ ] Tentar salvar sem selecionar membro → validar erro
     - [ ] Selecionar membro e salvar → criar candidato
     - [ ] Editar candidato existente → campo select oculto, readonly visível
     - [ ] Alterar cargo e salvar → atualizar candidato
     - [ ] Adicionar/remover foto e salvar → atualizar foto

10. `docs/CORRECAO-EDITAR-MEMBRO.md` (Validações/UX)
    - Linhas aproximadas: 255–260
    - Itens pendentes:
      - [ ] Adicionar validação de campos obrigatórios no frontend
      - [ ] Implementar máscara de CPF, telefone e RG

## Prioridade E — Documentação, custo e recomendações

11. `docs/REFATORACAO-CANDIDATOS-UNIFIED-ID.md` (Migração e remoções pendentes)
    - Vários itens de refatoração/migração (remover localStorage.CANDIDATES etc.)

12. Documentos gerais com testes manuais pendentes (vários `docs/*` listados acima)
    - Recomendo revisão manual dos arquivos listados para transformar cada checklist em issues/tarefas executáveis.

---

Observações e como eu priorizei:

- Priorizei itens que impactam produção e integridade de dados (sincronização Firebase, migração SSOT).
- Em seguida priorizei migração de dados e scripts de limpeza (evita inconsistências).
- Tarefas relacionadas a imagens/thumbnails vêm em seguida — importantes para custo e UX.
- Por fim, testes manuais/UX e documentação.

Próximo passo que proponho:

- Se aprovarem o ordenamento, eu vou criar issues (ou tasks no `todoList`) para os 10 itens top-priority (FASE 8/9, Testes-Firebase, Migration scripts, Testes automáticos de ID) e posso começar implementando os testes unitários para `src/utils/image.ts` e `src/utils/storage.ts` (mockando Firebase) — isso dará cobertura para as alterações de foto antes da migração.

---

Arquivo gerado automaticamente pelo assistente — posso atualizar este resumo se quiser que eu inclua mais arquivos ou detalhe linhas exatas para cada entrada.

## Histórico de alterações

- 2025-10-15 | Filipe | concluído | `docs/PENDING-CHECKLISTS.md` | "Aceite do contrato operacional; rotina automática autorizada pelo usuário."
- 2025-10-15 | Assistente | adicionado | `docs/PENDING-CHECKLISTS.md` | "Contrato operacional inserido e rotina de governança ativada (assistente atualizará este arquivo automaticamente em futuras mudanças)."
- 2025-10-15 | Assistente | adicionado | `docs/PENDING-CHECKLISTS.md` | "Contrato operacional inserido e rotina de governança ativada (assistente atualizará este arquivo automaticamente em futuras mudanças)."
- 2025-10-15 | Assistente | concluído | `docs/TESTES-FIREBASE.md` (CHECKLIST DE VALIDAÇÃO) | "Type-check executado com sucesso (npx tsc --noEmit)"
- 2025-10-15 | Assistente | concluído | `src/types/index.ts` (Remoção interfaces) | "Interfaces `Candidate`, `AttendanceRecord` e `VotingData` convertidas para type aliases para compatibilidade; código atualizado."
- 2025-10-15 | Assistente | concluído | `src/types/index.ts` (Remoção interfaces) | "Interfaces `Candidate`, `AttendanceRecord` e `VotingData` convertidas para type aliases para compatibilidade; código atualizado."
- 2025-10-15 | Assistente | concluído | `src/types/index.ts` (Remover StorageKeys obsoletos) | "StorageKeys obsoletos verificados/limpos: apenas MEMBERS e CONFIG permanecem; docs atualizados."
