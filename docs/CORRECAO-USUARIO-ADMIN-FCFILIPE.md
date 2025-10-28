# 🔧 Correção: Usuário Aparecendo como Comum em Vez de Admin

## Problema Identificado

O usuário `fcbfilipesantos@gmail.com` foi criado mas está aparecendo como usuário comum em vez de administrador. Isso ocorre porque:

1. **Mapeamento de roles insuficiente**: O sistema só verificava se o email continha "admin"
2. **Falta de Custom Claims**: Não há claims personalizados no Firebase Auth
3. **Service Account necessária**: Para definir claims, precisamos de uma chave de serviço

## ✅ Soluções Implementadas

### 1. **Melhorado Mapeamento de Roles**

Atualizei o `AuthManager` para:

- Buscar Custom Claims do Firebase Auth
- Usar lista de emails admin como fallback
- Adicionar logs detalhados para debug

**Lista de emails admin incluída:**

- `admin@igreja.com`
- `fcbfilipesantos@gmail.com` ✅

### 2. **Script para Definir Claims**

Criei `functions/set-filipe-admin.js` para definir Custom Claims no usuário.

## 🔑 Como Resolver (2 Opções)

### **Opção 1: Usar Service Account Key (Recomendado)**

1. **Baixe a chave de serviço:**
   - Acesse: https://console.firebase.google.com/
   - Projeto: `sistema-eleicao-igreja`
   - Configurações do Projeto → Contas de Serviço
   - "Gerar nova chave privada"
   - Salve como: `functions/serviceAccountKey.json`

2. **Execute o script:**

   ```bash
   cd functions
   node set-filipe-admin.js
   ```

3. **Faça logout e login novamente** no sistema

### **Opção 2: Usar Firebase Console (Manual)**

1. **Acesse o Firebase Console:**
   - https://console.firebase.google.com/
   - Projeto: `sistema-eleicao-igreja`
   - Authentication → Users

2. **Encontre o usuário:** `fcbfilipesantos@gmail.com`

3. **Defina Custom Claims:**
   - Clique no usuário
   - Vá para "Custom claims"
   - Adicione:

   ```json
   {
     "role": "admin",
     "admin": true
   }
   ```

4. **Salve e faça logout/login novamente**

## 🧪 Verificação

Após aplicar uma das soluções acima:

1. **Faça logout** no sistema
2. **Faça login novamente** com `fcbfilipesantos@gmail.com`
3. **Verifique os logs do console:**
   ```
   🔑 Custom Claims obtidos: {role: "admin", admin: true}
   👑 Role definida por Custom Claims: admin
   ```

## 📝 Status Atual

- ✅ **Mapeamento de roles melhorado**
- ✅ **Lista de emails admin atualizada**
- ✅ **Script de claims criado**
- ⏳ **Aguardando execução do script ou configuração manual**

## 🔍 Debug Adicional

Se ainda aparecer como usuário comum, verifique:

1. **Console do navegador:** Procure por "Custom Claims obtidos"
2. **Firebase Console:** Verifique se os claims foram definidos
3. **Logout/Login:** As claims só são atualizadas após novo login

---

**🎯 Execute uma das opções acima e teste o login novamente!**</content>
<parameter name="filePath">c:\Users\Filipe Honório\Documents\church-seo\docs\CORRECAO-USUARIO-ADMIN-FCFILIPE.md
