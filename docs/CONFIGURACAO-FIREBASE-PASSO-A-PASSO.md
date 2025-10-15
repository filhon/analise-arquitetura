# Configuração Firebase - Passo a Passo

## 📋 O que você precisa fazer (15 minutos)

### Passo 1: Criar Projeto Firebase (5 min)

1. **Acesse:** https://console.firebase.google.com/
2. **Clique em:** "Adicionar projeto" ou "Create a project"
3. **Nome do projeto:** `sistema-eleicao-igreja` (ou o nome que preferir)
4. **Google Analytics:** Pode desabilitar (não é necessário)
5. **Clique em:** "Criar projeto"

---

### Passo 2: Ativar Realtime Database (3 min)

1. No menu lateral, clique em **"Realtime Database"**
2. Clique em **"Criar banco de dados"**
3. **Localização:** Escolha `united-states` (melhor performance para BR)
4. **Regras de segurança:** Escolha **"Modo de teste"** (começar aberto)
   - ⚠️ Importante: Vamos configurar segurança depois
5. Clique em **"Ativar"**

Você verá uma tela com a URL do banco:

```
https://sistema-eleicao-igreja-default-rtdb.firebaseio.com/
```

---

### Passo 3: Obter Credenciais (5 min)

1. Clique no **ícone de engrenagem** ⚙️ (ao lado de "Visão geral do projeto")
2. Clique em **"Configurações do projeto"**
3. Role até a seção **"Seus aplicativos"**
4. Clique no ícone **</> (Web)**
5. **Nome do app:** `Sistema Eleição Web`
6. **Não marque** "Firebase Hosting"
7. Clique em **"Registrar app"**

Você verá um código JavaScript como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1234567890abcdefghijklmnop",
  authDomain: "sistema-eleicao-igreja.firebaseapp.com",
  databaseURL: "https://sistema-eleicao-igreja-default-rtdb.firebaseio.com",
  projectId: "sistema-eleicao-igreja",
  storageBucket: "sistema-eleicao-igreja.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456",
};
```

---

### Passo 4: Me Informar as Credenciais

**Copie e cole aqui os seguintes valores:**

```
apiKey:
authDomain:
databaseURL:
projectId:
storageBucket:
messagingSenderId:
appId:
```

**Exemplo:**

```
apiKey: AIzaSyD1234567890abcdefghijklmnop
authDomain: sistema-eleicao-igreja.firebaseapp.com
databaseURL: https://sistema-eleicao-igreja-default-rtdb.firebaseio.com
projectId: sistema-eleicao-igreja
storageBucket: sistema-eleicao-igreja.appspot.com
messagingSenderId: 123456789012
appId: 1:123456789012:web:abc123def456
```

---

## 🔒 Passo 5: Configurar Regras de Segurança (Opcional - Recomendado)

Por enquanto, vamos usar **modo aberto** para facilitar os testes.

**Regras Atuais (Modo Teste):**

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**⚠️ Isso é seguro?**

- ✅ Para testes: SIM (dados não sensíveis)
- ✅ Rede interna da igreja: SIM
- ❌ Internet pública: NÃO (qualquer um pode editar)

**Depois dos testes, podemos configurar:**

1. Autenticação (login)
2. Regras por função (admin/visualizador)
3. Validação de dados

---

## ✅ Checklist de Verificação

Antes de me passar as credenciais, verifique:

- [ ] Projeto Firebase criado
- [ ] Realtime Database ativado
- [ ] URL do banco visível (https://....firebaseio.com)
- [ ] App Web registrado
- [ ] Credenciais copiadas (7 valores)

---

## 📊 O que acontece depois

1. ✅ Você me passa as credenciais
2. ✅ Eu crio o arquivo `src/config/firebase.ts` com suas credenciais
3. ✅ Eu implemento toda a sincronização
4. ✅ Você testa em 2 navegadores/dispositivos
5. ✅ Funciona! 🎉

---

## 🔐 Segurança das Credenciais

**As credenciais são seguras para compartilhar?**

✅ **SIM**, as credenciais do Firebase são **públicas por design**:

- `apiKey` não é uma chave secreta (vai no código do navegador)
- Segurança é controlada pelas **regras do Realtime Database**
- Todo mundo usa assim (veja qualquer app Firebase público)

**Exemplo:** GitHub tem milhões de repos com `firebaseConfig` público.

**O que protege seus dados:**

- Regras de segurança no Firebase Console
- Autenticação de usuários (opcional)
- Domínios autorizados (pode configurar)

---

## ❓ FAQ

### Preciso de cartão de crédito?

**NÃO!** O plano gratuito (Spark) é suficiente.

### Quanto custa?

**Grátis** até 10GB transferidos/mês (suficiente para 1000+ eleições).

### E se passar do limite?

O Firebase **bloqueia** (não cobra surpresa). Você pode:

1. Atualizar para plano pago (~R$ 0,50/GB)
2. Esperar próximo mês (reset automático)

### Preciso manter servidor?

**NÃO!** Google cuida de tudo (infraestrutura, backup, escalabilidade).

### Funciona offline?

**SIM!** Firebase tem queue automático. Sincroniza quando voltar online.

### Posso usar outro banco?

**SIM!** Alternativas: Supabase, Appwrite, PocketBase (mais complexas).

---

## 🚀 Próximos Passos

**Você:**

1. Criar projeto Firebase (5 min)
2. Ativar Realtime Database (3 min)
3. Copiar credenciais (2 min)
4. Me passar os 7 valores

**Eu:**

1. Criar arquivo de configuração
2. Implementar sincronização completa
3. Atualizar todos os módulos
4. Adicionar indicadores visuais (online/offline)
5. Testar compilação

**Depois:**

1. Você abre em 2 dispositivos
2. Marca presença em um
3. Vê atualização automática no outro
4. 🎉 Sucesso!

---

## 📞 Pronto para começar?

Me envie as credenciais neste formato:

```
apiKey: [COLE AQUI]
authDomain: [COLE AQUI]
databaseURL: [COLE AQUI]
projectId: [COLE AQUI]
storageBucket: [COLE AQUI]
messagingSenderId: [COLE AQUI]
appId: [COLE AQUI]
```

Assim que eu receber, implemento tudo em 20 minutos! 🚀
