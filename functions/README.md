# Deploy das Cloud Functions

## Pré-requisitos

1. **Firebase CLI instalado:**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login no Firebase:**

   ```bash
   firebase login
   ```

3. **Selecionar projeto:**
   ```bash
   firebase use church-election-system
   ```

## Configuração do Firebase Admin SDK

1. **Criar Service Account:**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Vá em Configurações do Projeto > Contas de Serviço
   - Gere uma nova chave privada (JSON)
   - Salve o arquivo como `functions/serviceAccountKey.json`

2. **Configurar variáveis de ambiente:**
   ```bash
   cd functions
   firebase functions:config:set admin.project_id="your-project-id"
   firebase functions:config:set admin.client_email="firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com"
   firebase functions:config:set admin.private_key="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
   ```

## Deploy

1. **Deploy das Functions:**

   ```bash
   firebase deploy --only functions
   ```

2. **Deploy completo (Functions + Firestore + Storage):**
   ```bash
   firebase deploy
   ```

## Testes

1. **Testar localmente:**

   ```bash
   cd functions
   npm run serve
   ```

2. **Logs das Functions:**
   ```bash
   firebase functions:log
   ```

## Estrutura das Cloud Functions

- `createUser`: Cria novo usuário com role específica
- `updateUserRole`: Atualiza função de usuário existente
- `getUsers`: Lista todos os usuários (admin only)
- `deleteUser`: Exclui usuário (admin only)

## Segurança

- **Custom Claims**: Roles são armazenados como JWT claims
- **Firestore Rules**: Controle de acesso baseado em roles
- **Storage Rules**: Controle de upload/download de arquivos
- **Functions**: Validação de permissões em cada chamada
