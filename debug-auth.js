// Script de debug para Firebase Authentication
// Execute no console do navegador para verificar a configuração

import { auth, isConfigured } from './config/firebase.js';

console.log('🔍 DEBUG FIREBASE AUTH');
console.log('======================');

console.log('1. Firebase configurado:', isConfigured);
console.log('2. Auth instance:', auth);

if (auth) {
  console.log('3. Current user:', auth.currentUser);
  console.log('4. Auth state:', {
    app: auth.app,
    config: auth.app?.options,
  });
}

// Teste de conexão
if (isConfigured && auth) {
  console.log('5. Testando conexão...');
  // Você pode adicionar mais testes aqui
} else {
  console.log('❌ Firebase não está configurado corretamente!');
}