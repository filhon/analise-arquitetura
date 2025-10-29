# Estrutura de Usuários do Sistema

## Resumo da Análise

Foram encontrados **2 usuários** no sistema de eleições da igreja, ambos com privilégios de administrador.

## Estrutura de Dados - Firebase Auth

### Campos Principais

- `localId`: ID único do usuário (string)
- `email`: Email do usuário
- `emailVerified`: Status de verificação do email (boolean)
- `displayName`: Nome de exibição
- `disabled`: Status de desabilitação da conta (boolean)
- `createdAt`: Timestamp de criação (string numérico)
- `lastSignedInAt`: Timestamp do último login (string numérico)
- `customAttributes`: Claims customizados em JSON string

### Custom Claims (atual)

```json
{
  "role": "admin",
  "admin": true
}
```

## Usuários Existentes

### 1. fcbfilipesantos@gmail.com

- **ID**: T4BfpCQN7rdDhlxpmCkWG4pVgh43
- **Display Name**: fcbfilipesantos
- **Role**: admin
- **Admin**: ✅
- **Criado em**: 28/10/2025, 16:52:10
- **Último login**: 28/10/2025, 17:09:54
- **Email verificado**: ❌

### 2. admin@igreja.com

- **ID**: qinw1UMhbNd6xleAZicDNkeI3JW2
- **Display Name**: Administrador
- **Role**: admin
- **Admin**: ✅
- **Criado em**: 28/10/2025, 16:41:35
- **Último login**: 29/10/2025, 13:40:05
- **Email verificado**: ❌

## Estrutura Esperada - Firestore

### Coleção: `users`

Campos esperados para perfis detalhados:

- `email`: Email do usuário
- `displayName`: Nome de exibição
- `role`: Papel do usuário (admin, user, etc.)
- `permissions[]`: Array de permissões específicas
- `isActive`: Status ativo/inativo
- `createdAt`: Data de criação
- `updatedAt`: Data de atualização
- `lastLoginAt`: Último login

## Estatísticas

- **Total de usuários**: 2
- **Administradores**: 2
- **Usuários ativos**: 2
- **Emails verificados**: 0

## Recomendações

1. Verificar emails dos usuários para segurança
2. Considerar implementar perfis detalhados no Firestore
3. Avaliar necessidade de diferentes níveis de permissão além de admin
4. Implementar verificação obrigatória de email

## Scripts Disponíveis

- `functions/show-users.js`: Mostra relatório completo dos usuários
- `functions/list-users.js`: Tenta acesso direto ao Firebase Admin (requer credenciais de serviço)

## Acesso aos Dados

Para desenvolvimento local, use o Firebase CLI ou configure uma chave de serviço no Firebase Console > Configurações do Projeto > Contas de Serviço.</content>
<parameter name="filePath">c:\Users\Filipe Honório\Documents\church-seo\docs\ESTRUTURA-USUARIOS.md
