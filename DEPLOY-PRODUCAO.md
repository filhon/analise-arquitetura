# 🚀 Deploy em Produção - Sistema de Eleição de Oficiais

## 📋 Pré-requisitos

- Conta no [Vercel](https://vercel.com)
- Projeto Firebase configurado
- Node.js 18+ instalado

## 🔧 Configuração do Firebase

### 1. Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar um projeto"
3. Configure o nome do projeto
4. Ative o **Realtime Database**
5. Configure as regras de segurança (opcional para desenvolvimento)

### 2. Obter Credenciais

1. Vá em **Configurações do Projeto** > **Seus Aplicativos**
2. Clique em **Adicionar App** > **Web App** (ícone `</>`)
3. Copie as credenciais geradas

### 3. Configurar Variáveis de Ambiente no Vercel

No painel do Vercel, vá em **Project Settings** > **Environment Variables** e adicione:

```bash
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 Deploy no Vercel

### Método 1: Deploy Automático (Recomendado)

1. **Conectar repositório:**
   - Faça push do código para GitHub/GitLab
   - Conecte o repositório no Vercel

2. **Configurar build:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./` (raiz do projeto)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

3. **Deploy:**
   - O Vercel fará o build automaticamente
   - Configure as variáveis de ambiente
   - Deploy será feito automaticamente

### Método 2: Deploy Manual via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel --prod

# Ou para preview
vercel
```

## 🔒 Configurações de Segurança

### Regras do Firebase Realtime Database

Para produção, configure regras de segurança no Firebase Console:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null",
    "members": {
      ".read": true,
      ".write": true
    },
    "config": {
      ".read": true,
      ".write": true
    }
  }
}
```

> ⚠️ **Atenção:** As regras acima são permissivas para demonstração. Em produção real, implemente autenticação adequada.

## 📱 PWA (Progressive Web App)

O sistema inclui suporte completo a PWA:

- **Service Worker** para cache offline
- **Manifest** para instalação como app
- **Ícones** responsivos
- **Modo standalone** no mobile

## 🔍 Verificação do Deploy

Após o deploy, verifique:

1. ✅ **Aplicação carrega** sem erros
2. ✅ **Firebase conecta** corretamente
3. ✅ **PWA instala** no mobile/desktop
4. ✅ **Cache funciona** offline
5. ✅ **Votação simultânea** funciona
6. ✅ **Relatórios PDF** geram corretamente

## 🐛 Troubleshooting

### Erro: "Firebase not configured"

- Verifique se todas as variáveis de ambiente estão configuradas no Vercel
- Certifique-se de que não há espaços extras nas variáveis

### Erro: "Build failed"

- Execute `npm run build` localmente para debug
- Verifique se todas as dependências estão instaladas
- Confirme que o Node.js é versão 18+

### PWA não instala

- Verifique se o site usa HTTPS (Vercel fornece automaticamente)
- Confirme que o `manifest.json` está acessível
- Teste em Chrome/Edge para melhor suporte PWA

## 📊 Monitoramento

### Vercel Analytics

- Configure Analytics no painel do Vercel
- Monitore performance e erros

### Firebase Monitoring

- Use Firebase Console para monitorar uso do database
- Configure alertas para uso excessivo

## 🔄 Atualizações

Para atualizar a aplicação:

1. Faça push das mudanças para a branch principal
2. Vercel fará deploy automático
3. Teste a nova versão
4. Se necessário, faça rollback via painel do Vercel

## 📞 Suporte

Para problemas específicos:

- Verifique os logs no painel do Vercel
- Use Firebase Console para debug do database
- Consulte a documentação em `/docs/`

---

**🎉 Deploy concluído! Sua aplicação está pronta para produção.**
