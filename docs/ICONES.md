# Ícones Google Material Icons Utilizados

Este documento lista todos os ícones do Google Material Icons implementados no sistema.

## 📚 Biblioteca

- **Fonte**: Google Material Icons
- **CDN**: `https://fonts.googleapis.com/icon?family=Material+Icons`
- **Documentação**: https://fonts.google.com/icons

## 🎨 Ícones Implementados

### Header (Cabeçalho)

- `how_to_vote` - Logo principal do sistema
- `file_download` - Botão Exportar
- `file_upload` - Botão Importar
- `description` - Botão Relatório PDF

### Navegação

- `group` - Tab Membros
- `person_pin` - Tab Candidatos
- `how_to_vote` - Tab Votação
- `checklist` - Tab Presença
- `bar_chart` - Tab Resultados

### Membros

- `download` - Download Template CSV
- `upload_file` - Importar CSV
- `person_add` - Novo Membro
- `edit` - Editar Membro (tabela)
- `delete` - Excluir Membro (tabela)

### Candidatos

- `person_add` - Novo Candidato

### Votação

- `settings` - Configurar Quórum

### Presença

- `done_all` - Marcar Todos Presentes
- `clear_all` - Marcar Todos Ausentes

### Resultados

- `refresh` - Atualizar Resultados

### Modais

- `close` - Fechar Modal (×)

### Notificações

- `check_circle` - Sucesso
- `error` - Erro
- `warning` - Aviso
- `info` - Informação
- `close` - Fechar Notificação

## 📏 Tamanhos Disponíveis

O sistema utiliza diferentes tamanhos de ícones:

```css
.material-icons.md-18 {
  font-size: 18px;
} /* Ícones pequenos (botões sm, notificações) */
.material-icons.md-20 {
  font-size: 20px;
} /* Ícones padrão (botões, tabs) */
.material-icons.md-24 {
  font-size: 24px;
} /* Ícones médios (default) */
.material-icons.md-36 {
  font-size: 36px;
} /* Ícones grandes */
.material-icons.md-48 {
  font-size: 48px;
} /* Ícones extra grandes */
```

## 💡 Como Usar

### HTML

```html
<span class="material-icons">icon_name</span>
<span class="material-icons md-20">icon_name</span>
```

### Em Botões

```html
<button class="btn btn-primary">
  <span class="material-icons md-20">add</span>
  Adicionar
</button>
```

### Em Links

```html
<a href="#" class="nav-link">
  <span class="material-icons md-20">home</span>
  Início
</a>
```

## 🔍 Referência Completa

Para encontrar mais ícones, visite:

- https://fonts.google.com/icons
- https://material.io/resources/icons/

## 🎯 Categorias de Ícones

### Ações

- `add`, `edit`, `delete`, `save`, `cancel`
- `refresh`, `sync`, `update`
- `download`, `upload`, `file_upload`, `file_download`

### Navegação

- `home`, `menu`, `arrow_back`, `arrow_forward`
- `expand_more`, `expand_less`
- `first_page`, `last_page`

### Social/Pessoas

- `group`, `person`, `person_add`, `person_pin`
- `account_circle`, `face`

### Comunicação

- `email`, `phone`, `message`, `chat`
- `notifications`, `announcement`

### Conteúdo

- `description`, `note`, `content_copy`, `content_paste`
- `archive`, `bookmark`, `flag`

### Estado

- `check`, `check_circle`, `done`, `done_all`
- `error`, `warning`, `info`
- `clear`, `clear_all`, `close`

### Dados/Visualização

- `bar_chart`, `pie_chart`, `show_chart`
- `table_chart`, `insert_chart`
- `assessment`, `trending_up`

### Sistema

- `settings`, `build`, `tune`
- `power_settings_new`, `logout`
- `lock`, `lock_open`, `security`

### Votação Específicos

- `how_to_vote` - Urna de votação
- `checklist` - Lista de verificação
- `ballot` - Cédula de votação
- `verified` - Verificado/Eleito
