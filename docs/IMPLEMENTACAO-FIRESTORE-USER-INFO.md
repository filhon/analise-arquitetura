# Implementação: User-Info com Firestore Database

## 📋 Resumo

Implementada sincronização em tempo real do `user-info` com o **Firestore Database**, garantindo que as informações do usuário (nome de exibição e role) sejam sempre atualizadas automaticamente quando modificadas no backend.

---

## 🎯 Objetivo

Atualizar o componente `user-info` (nome e role do usuário) com dados do Firestore Database em tempo real, sincronizando automaticamente quando houver mudanças.

---

## 🔧 Implementação

### 1. **Configuração do Firestore**

**Arquivo:** `src/config/firebase.ts`

#### Mudanças:

- ✅ Adicionado import `getFirestore` e `Firestore`
- ✅ Criada variável `firestore: Firestore | null`
- ✅ Inicializado Firestore junto com outros serviços Firebase
- ✅ Exportado `firestore` para uso em outros módulos

```typescript
import { getFirestore, Firestore } from "firebase/firestore";

let firestore: Firestore | null = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
  auth = getAuth(app);
  firestore = getFirestore(app); // ✅ NOVO
  // ...
}

export { app, database, storage, auth, functions, firestore, isConfigured };
```

---

### 2. **AuthManager - Busca Inicial do Firestore**

**Arquivo:** `src/modules/auth/manager.ts`

#### Mudanças no método `firebaseUserToUser`:

1. **Busca dados do Firestore ao fazer login:**
   - Busca documento `users/{uid}` do Firestore
   - Prioriza `displayName` do Firestore sobre Firebase Auth
   - Atualiza `role` se disponível no Firestore
   - Mantém fallback para Firebase Auth em caso de erro

```typescript
private async firebaseUserToUser(firebaseUser: FirebaseUser): Promise<User> {
  let role = UserRole.USER;
  let displayName = firebaseUser.displayName ||
                    firebaseUser.email?.split("@")[0] ||
                    "Usuário";

  // Custom claims (Firebase Auth)
  try {
    const idTokenResult = await firebaseUser.getIdTokenResult();
    if (idTokenResult.claims.role) {
      role = idTokenResult.claims.role as UserRole;
    } else if (idTokenResult.claims.admin === true) {
      role = UserRole.ADMIN;
    }
  } catch (error) {
    console.error("Erro ao obter custom claims:", error);
  }

  // ✅ NOVO: Buscar dados adicionais do Firestore
  if (firestore) {
    try {
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const firestoreData = userDocSnap.data();

        // Priorizar displayName do Firestore
        if (firestoreData.displayName) {
          displayName = firestoreData.displayName;
        }

        // Atualizar role do Firestore
        if (firestoreData.role) {
          role = firestoreData.role as UserRole;
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do Firestore:", error);
    }
  }

  return { uid, email, displayName, emailVerified, role, createdAt, lastLoginAt };
}
```

---

### 3. **AuthManager - Sincronização em Tempo Real**

**Arquivo:** `src/modules/auth/manager.ts`

#### Novo método `listenToFirestoreChanges`:

Escuta mudanças no documento Firestore do usuário logado e atualiza o estado automaticamente.

```typescript
private listenToFirestoreChanges(uid: string): void {
  if (this.firestoreUnsubscribe) {
    this.firestoreUnsubscribe();
  }

  if (!firestore) {
    console.warn("Firestore não está configurado");
    return;
  }

  try {
    const userDocRef = doc(firestore, "users", uid);

    this.firestoreUnsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists() && this.state.user) {
        const firestoreData = docSnap.data();

        let needsUpdate = false;
        const updatedUser = { ...this.state.user };

        // Atualizar displayName se mudou
        if (firestoreData.displayName &&
            firestoreData.displayName !== this.state.user.displayName) {
          updatedUser.displayName = firestoreData.displayName;
          needsUpdate = true;
        }

        // Atualizar role se mudou
        if (firestoreData.role &&
            firestoreData.role !== this.state.user.role) {
          updatedUser.role = firestoreData.role as UserRole;
          needsUpdate = true;
        }

        if (needsUpdate) {
          console.log("📡 Dados do usuário atualizados do Firestore");
          this.setState({ user: updatedUser });
        }
      }
    }, (error) => {
      console.error("Erro ao escutar mudanças do Firestore:", error);
    });
  } catch (error) {
    console.error("Erro ao configurar listener do Firestore:", error);
  }
}
```

#### Integração com `initializeAuth`:

```typescript
private initializeAuth(): void {
  this.authStateUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const user = await this.firebaseUserToUser(firebaseUser);
      this.setState({ isAuthenticated: true, user, isLoading: false, error: null });

      // ✅ NOVO: Escutar mudanças no Firestore
      this.listenToFirestoreChanges(firebaseUser.uid);
    } else {
      // ✅ NOVO: Parar de escutar quando fizer logout
      if (this.firestoreUnsubscribe) {
        this.firestoreUnsubscribe();
        this.firestoreUnsubscribe = null;
      }

      this.setState({ isAuthenticated: false, user: null, isLoading: false, error: null });
    }
  });
}
```

---

### 4. **Cleanup Adequado**

**Arquivo:** `src/modules/auth/manager.ts`

Atualizado método `destroy()` para limpar listener do Firestore:

```typescript
destroy(): void {
  if (this.authStateUnsubscribe) {
    this.authStateUnsubscribe();
    this.authStateUnsubscribe = null;
  }

  // ✅ NOVO: Limpar listener do Firestore
  if (this.firestoreUnsubscribe) {
    this.firestoreUnsubscribe();
    this.firestoreUnsubscribe = null;
  }

  this.listeners = [];
}
```

---

## 📊 Fluxo de Sincronização

```
1. LOGIN
   │
   ├─> Firebase Auth: signInWithEmailAndPassword()
   │   └─> onAuthStateChanged() dispara
   │
   ├─> firebaseUserToUser():
   │   ├─> Busca custom claims (Firebase Auth)
   │   └─> Busca dados do Firestore (1ª vez)
   │       ├─> displayName
   │       └─> role
   │
   ├─> setState({ user }) → Notifica listeners
   │   └─> UIManager.updateUserInfo() atualiza DOM
   │
   └─> listenToFirestoreChanges() → Listener ativado
       └─> onSnapshot() escuta mudanças em tempo real

2. EDIÇÃO (Cloud Function updateUserDisplayName)
   │
   ├─> Backend atualiza Firestore: users/{uid}
   │   └─> displayName: "Novo Nome"
   │
   ├─> onSnapshot() detecta mudança
   │   └─> Compara com estado atual
   │       └─> Se diferente: setState({ user: updatedUser })
   │
   └─> UIManager recebe notificação
       └─> updateUserInfo() atualiza DOM automaticamente

3. LOGOUT
   │
   ├─> signOut()
   │   └─> onAuthStateChanged() dispara
   │
   └─> firestoreUnsubscribe() → Listener desativado
       └─> setState({ user: null })
```

---

## ✅ Benefícios

### 1. **Sincronização em Tempo Real**

- Mudanças no Firestore são refletidas instantaneamente na UI
- Não precisa recarregar página após edições
- Múltiplos dispositivos sincronizados automaticamente

### 2. **Dados Atualizados**

- `displayName` sempre vem do Firestore (fonte de verdade)
- `role` sincronizado com backend
- Fallback para Firebase Auth em caso de erro

### 3. **Performance Otimizada**

- Listener ativado apenas quando usuário logado
- Atualiza apenas campos que mudaram (`needsUpdate` flag)
- Cleanup automático no logout

### 4. **Arquitetura Robusta**

- Separação de responsabilidades (AuthManager ↔ UIManager)
- Sistema de notificação reativo (listeners)
- Tratamento de erros em todas as operações

---

## 🧪 Testando

### Teste 1: Login

1. Faça login no sistema
2. Verifique se `user-info` mostra nome do Firestore
3. Console deve mostrar: `"📡 Dados do usuário atualizados do Firestore"` (se houver dados no Firestore)

### Teste 2: Edição de Nome

1. Na aba Usuários, edite o nome de exibição
2. **user-info deve atualizar automaticamente** sem recarregar página
3. Console: `"📡 Dados do usuário atualizados do Firestore"`

### Teste 3: Multi-Dispositivo

1. Abra sistema em 2 navegadores diferentes (mesmo login)
2. Edite nome em um navegador
3. O outro navegador deve atualizar automaticamente

### Teste 4: Logout

1. Faça logout
2. Verifique que listener foi desativado (sem erros no console)
3. `user-info` deve desaparecer

---

## 🔍 Troubleshooting

### Problema: user-info não atualiza

**Verificar:**

```javascript
// 1. Firestore configurado?
console.log(firestore); // Não deve ser null

// 2. Documento existe no Firestore?
// Firebase Console > Firestore Database > users/{uid}

// 3. Listener ativado?
// Console deve mostrar: "📡 Dados do usuário atualizados do Firestore"
```

### Problema: Erro "permission-denied"

**Solução:** Verificar regras do Firestore:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Permitir leitura do próprio documento
      allow read: if request.auth != null && request.auth.uid == userId;
      // Apenas admins podem escrever
      allow write: if request.auth.token.admin == true ||
                      request.auth.token.role == 'admin';
    }
  }
}
```

### Problema: Dados desatualizados

**Possível causa:** Cache do navegador

**Solução:**

```javascript
// Recarregar com cache limpo
Ctrl + F5(Windows);
Cmd + Shift + R(Mac);
```

---

## 📁 Arquivos Modificados

| Arquivo                       | Linhas | Descrição                              |
| ----------------------------- | ------ | -------------------------------------- |
| `src/config/firebase.ts`      | +6     | Adicionado Firestore ao config         |
| `src/modules/auth/manager.ts` | +86    | Busca inicial + listener em tempo real |

**Total:** 2 arquivos, ~92 linhas adicionadas

---

## 🚀 Próximos Passos (Opcional)

1. **Cache Offline**: Persistir dados do Firestore offline
2. **Avatar do Usuário**: Adicionar foto de perfil no Firestore
3. **Notificações**: Mostrar toast quando dados atualizarem
4. **Audit Log**: Registrar mudanças de displayName no Firestore

---

## 📚 Referências

- [Firebase Firestore - Realtime Updates](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firebase Auth - Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [onSnapshot Documentation](https://firebase.google.com/docs/firestore/query-data/listen#listen_to_multiple_documents_in_a_collection)

---

**Data:** 5 de janeiro de 2025  
**Desenvolvedor:** Sistema de Eleição de Oficiais  
**Status:** ✅ Implementado e Testado
