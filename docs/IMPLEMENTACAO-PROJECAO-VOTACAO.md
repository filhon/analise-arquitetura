# Implementação de Projeção de Votação

## Data: 2025-01-XX

## Objetivo

Implementar funcionalidade de projeção em tela cheia para acompanhamento em tempo real da votação de candidatos (Presbíteros e Diáconos) pela congregação.

## Funcionalidades Implementadas

### 1. Cards de Candidatos Aprimorados

- **Foto circular**: Exibição de foto do candidato (80px) ou ícone padrão
- **Design moderno**: Cards com hover effect e sombra
- **Informações claras**: Nome, quantidade de votos e ações
- **Botões de ação**: Editar e remover candidato

### 2. Upload de Foto

- **Seleção de arquivo**: Input HTML5 com filtro de imagens
- **Validação**: Máximo 2MB, apenas arquivos de imagem
- **Conversão**: Arquivo convertido para base64
- **Preview**: Visualização da foto antes de salvar
- **Remoção**: Botão para remover foto
- **Armazenamento**: Foto salva como base64 no localStorage

### 3. Modo Fullscreen (Projeção)

- **Botões separados**: Um para Presbíteros, outro para Diáconos
- **Tela cheia**: Fullscreen API nativo do navegador
- **Design de projeção**:
  - Fundo com gradiente (#667eea → #764ba2)
  - Cards grandes e legíveis (300px mínimo)
  - Fotos maiores (150px)
  - Contraste alto para projeção
  - Texto com sombra para legibilidade

### 4. Controles de Votação

- **Clicar na foto**: Adiciona 1 voto ao candidato
- **Botão +**: Adiciona 1 voto (alternativa ao clique na foto)
- **Botão -**: Remove 1 voto do candidato
- **Botão Resetar**: Zera os votos do candidato (com confirmação)
- **Atualização em tempo real**: Display de votos atualiza instantaneamente
- **Sincronização**: Aba de candidatos atualiza em background

### 5. Edição de Candidatos

- **Botão Editar**: Abre modal com dados do candidato
- **Atualização de foto**: Mantém foto existente ou permite trocar
- **Atualização de dados**: Nome e cargo podem ser alterados
- **Validação**: Campos obrigatórios e verificação de duplicatas

## Estrutura de Arquivos Modificados

### HTML (`index.html`)

- Adicionados botões de projeção fullscreen na aba Candidatos
- Criada seção `#fullscreen-view` para exibição em tela cheia
- Adicionados controles de upload de foto no modal de candidato
- Estrutura de grid para candidatos em fullscreen

### CSS (`assets/css/main.css`)

- **Cards normais** (~100 linhas):
  - `.candidate-card`: Layout flex com foto e informações
  - `.candidate-photo`: Círculo de 80px com border
  - `.photo-upload-container`: Controles de upload no modal
  - `.photo-preview`: Preview de 100px no modal

- **Modo Fullscreen** (~200 linhas):
  - `.fullscreen-voting-view`: Container fixo de tela cheia
  - `.fullscreen-header`: Cabeçalho com título grande
  - `.fullscreen-candidates-grid`: Grid responsivo
  - `.fullscreen-candidate-card`: Cards grandes com hover
  - `.fullscreen-candidate-photo`: Foto de 150px
  - `.fullscreen-candidate-votes`: Display grande de votos
  - `.vote-btn-add/remove/reset`: Botões de controle
  - `.exit-fullscreen-btn`: Botão circular de saída
  - Responsive: Mobile adapta para coluna única

### TypeScript (`src/ui/manager.ts`)

- **Novos métodos**:
  1. `renderCandidateCard(candidate)`: Renderiza card com foto
  2. `attachCandidateEventListeners()`: Anexa eventos aos botões
  3. `handleEditCandidate(id)`: Abre modal em modo edição
  4. `handlePhotoUpload(event)`: Processa upload de foto
  5. `handleRemovePhoto()`: Remove foto do formulário
  6. `openFullscreen(role)`: Abre tela cheia para um cargo
  7. `closeFullscreen()`: Fecha tela cheia
  8. `renderFullscreenCandidates(role, container)`: Renderiza candidatos
  9. `attachFullscreenEventListeners()`: Anexa eventos de votação
  10. `handleAddVote(id)`: Adiciona voto ao candidato
  11. `handleRemoveVote(id)`: Remove voto do candidato
  12. `handleResetVotes(id)`: Reseta votos do candidato
  13. `handleCandidateSubmit(event)`: Salva candidato com foto

- **Métodos atualizados**:
  - `loadCandidatesData()`: Agora usa `renderCandidateCard()`
  - `setupEventListeners()`: Adicionados listeners de fullscreen e foto

## Fluxo de Uso

### Adicionar Foto ao Candidato

1. Clicar em "Editar" no card do candidato
2. Clicar em "Selecionar Foto"
3. Escolher arquivo de imagem (máx 2MB)
4. Visualizar preview
5. Salvar formulário
6. Foto aparece no card e em fullscreen

### Iniciar Projeção

1. Na aba "Candidatos", clicar em um dos botões:
   - "Projetar Presbíteros" ou
   - "Projetar Diáconos"
2. Sistema entra em fullscreen
3. Cards dos candidatos aparecem em tamanho grande
4. Votos podem ser contabilizados em tempo real

### Contabilizar Votos em Projeção

1. **Adicionar voto**:
   - Clicar na foto do candidato OU
   - Clicar no botão verde "+"
2. **Remover voto**:
   - Clicar no botão laranja "-"
3. **Resetar votos**:
   - Clicar em "Resetar"
   - Confirmar ação
4. **Sair**:
   - Clicar no "X" no canto superior direito OU
   - Pressionar ESC no teclado

## Armazenamento de Dados

### Estrutura no localStorage

```json
{
  "CANDIDATES": {
    "presbyteros": [
      {
        "id": "abc123",
        "name": "João Silva",
        "role": "Presbítero",
        "photoUrl": "data:image/jpeg;base64,/9j/4AAQ...",
        "votes": 15,
        "isElected": false
      }
    ],
    "diaconos": [
      {
        "id": "def456",
        "name": "Maria Santos",
        "role": "Diácono",
        "photoUrl": "data:image/png;base64,iVBORw0KG...",
        "votes": 8,
        "isElected": false
      }
    ]
  }
}
```

## Considerações Técnicas

### Performance

- Fotos em base64 limitadas a 2MB
- Atualização de votos otimizada (apenas display, não re-renderiza tudo)
- Aba de candidatos atualiza em background sem lag na projeção

### Compatibilidade

- Fullscreen API: Funciona em navegadores modernos
- Fallback: Se fullscreen falhar, ainda exibe a view
- Foto: Suporta JPEG, PNG, GIF, WebP

### UX

- Clique na foto é intuitivo para votar
- Botões coloridos (+/- verde/laranja) facilitam identificação
- Confirmação de reset evita erros acidentais
- Preview de foto antes de salvar
- Feedback visual com hover effects

## Próximos Passos (Sugestões)

- [ ] Adicionar animação ao incrementar votos
- [ ] Som opcional ao votar (toggle)
- [ ] Exportar relatório de votação em PDF
- [ ] Gráfico de barras dos votos em tempo real
- [ ] Histórico de votações anteriores
- [ ] Múltiplas sessões de votação no mesmo dia

## Testes Recomendados

1. ✅ Upload de foto (diferentes formatos e tamanhos)
2. ✅ Edição de candidato com foto
3. ✅ Remoção de foto
4. ✅ Projeção fullscreen de Presbíteros
5. ✅ Projeção fullscreen de Diáconos
6. ✅ Adicionar voto clicando na foto
7. ✅ Adicionar voto com botão +
8. ✅ Remover voto com botão -
9. ✅ Resetar votos com confirmação
10. ✅ Sincronização entre fullscreen e aba normal
11. ✅ Responsividade em mobile
12. ✅ Sair do fullscreen (botão e ESC)

## Notas

- Fotos são armazenadas em base64 para evitar dependência de servidor
- Sistema funciona 100% offline (localStorage)
- Interface otimizada para projeção em auditórios
- Contraste alto para melhor visibilidade
