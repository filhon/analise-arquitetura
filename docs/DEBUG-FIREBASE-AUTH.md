# 🔍 Debug Firebase Authentication

## Problema Identificado

Você mencionou que criou um usuário no Firebase, mas o link do console aponta para um projeto diferente do configurado na aplicação:

- **Projeto configurado na aplicação**: `sistema-eleicao-igreja`
- **Projeto no link do console**: `analog-codex-427014-t2`

## ✅ Solução

### Passo 1: Verificar Projeto Correto
1. Acesse: https://console.firebase.google.com/
2. **Certifique-se de estar no projeto correto**: `sistema-eleicao-igreja`
3. Se não existir, crie um projeto com esse nome exato

### Passo 2: Verificar Configuração do Authentication
1. No projeto `sistema-eleicao-igreja`
2. Vá para **Authentication** > **Sign-in method**
3. **Ative** o provedor **Email/Password**

### Passo 3: Criar Usuário no Projeto Correto
1. Vá para **Authentication** > **Users**
2. Clique em **Add user**
3. Crie o usuário com email e senha

### Passo 4: Testar Login
1. Acesse a aplicação: `http://localhost:3001`
2. Tente fazer login com as credenciais criadas
3. Verifique os logs no console do navegador

## 🔧 Debug Adicional

### Verificar Configuração
Abra o console do navegador (F12) e execute:

```javascript
// Verificar se Firebase está configurado
console.log('Firebase config:', {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Presente' : 'Ausente'
});
```

### Logs de Debug
Os logs de debug foram adicionados para mostrar:
- ✅ Inicialização do Firebase
- 🔐 Tentativa de login
- 📡 Chamada para Firebase Auth
- ❌ Erros específicos

## 🚨 Possíveis Problemas

### 1. Projeto Firebase Incorreto
- **Sintomas**: "auth/project-not-found"
- **Solução**: Use o projeto `sistema-eleicao-igreja`

### 2. Authentication Não Habilitado
- **Sintomas**: "auth/operation-not-allowed"
- **Solução**: Ative Email/Password em Authentication > Sign-in method

### 3. Usuário em Projeto Diferente
- **Sintomas**: "auth/user-not-found"
- **Solução**: Crie o usuário no projeto correto

### 4. Configuração Inválida
- **Sintomas**: "auth/invalid-api-key"
- **Solução**: Verifique as credenciais em `.env`

## 📞 Suporte

Se o problema persistir:

1. **Verifique os logs do console** do navegador
2. **Confirme o projeto Firebase** que está usando
3. **Certifique-se** de que criou o usuário no projeto correto
4. **Compartilhe** os logs de erro específicos

---

**🎯 O problema mais provável é estar usando um projeto Firebase diferente do configurado na aplicação.**