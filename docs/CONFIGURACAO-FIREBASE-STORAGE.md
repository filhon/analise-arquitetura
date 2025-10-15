# Configuração do Firebase Storage

Este documento descreve o passo-a-passo para habilitar e configurar o Firebase Storage para armazenar fotos de candidatos no projeto.

Resumo rápido: em vez de salvar imagens em base64 no Realtime Database ou no localStorage (o que é ineficiente), vamos enviar as imagens para o Firebase Storage e salvar apenas a URL no campo `Member.photoUrl`.

## É grátis para minha necessidade?

O Firebase oferece um plano gratuito (Spark) que inclui quotas para Storage:

- Armazenamento: 5 GB de armazenamento gratuito
- Downloads: 1 GB de saída por dia (trafego de download)
- Operações: limites em número de operações (upload/download/list/delete)

Para uma igreja com algumas dezenas a algumas centenas de fotos (cada imagem < 2MB), o plano gratuito costuma ser suficiente. Atenção aos fatores que aumentam custo:

- Muitos downloads (por ex. projeção em várias telas que recarregam frequentemente)
- Alta retenção de imagens grandes (não comprimir/resizing)
- Uso intenso de operações de list/delete automatizadas

Recomendações para manter-se no gratuito:

- Reduza resoluções e comprima imagens antes do upload (ex: 800x800, JPEG 70-80%).
- Gere thumbnails menores para listagens (120px) e só carregue a imagem em alta resolução sob demanda.
- Habilite cache HTTP adequado (Cache-Control) ao servir as imagens (via Storage ou CDN) para reduzir downloads.
- Monitore o console do Firebase (Storage -> Usage) regularmente.

## Passo-a-passo de configuração

1. Abra o Console do Firebase: https://console.firebase.google.com/
2. Selecione seu projeto ou crie um novo projeto.
3. No menu lateral, clique em "Storage" e siga o wizard para ativar o Storage.
4. Após criado, defina as regras de acesso (modo de desenvolvimento):

```text
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null; // produção: restringir
    }
  }
}
```

Observação: Em produção, não use regras abertas. Para um sistema local sem autenticação, você pode usar regras que permitam escrita somente para usuários autenticados do projeto administradores ou usar tokens temporários. Para simplicidade inicial, o plano de desenvolvimento pode permitir leitura sem autenticação, mas revise antes de publicar.

5. Obtenha o `storageBucket` nas configurações do projeto (Configurações do app -> Web) e adicione ao arquivo `.env` ou variáveis de ambiente do Vite:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_DATABASE_URL=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

6. No frontend do projeto (já preparado), `src/config/firebase.ts` inicializa o Storage automaticamente quando as credenciais estiverem presentes.

7. Uso no código:

- `uploadImage(file)` — envia arquivo e retorna a URL pública (usado em `handlePhotoUpload`).
- `deleteFileByUrl(url)` — tenta excluir o arquivo pelo URL (usado em `handleRemovePhoto`).

## Boas práticas

- Valide tipo e tamanho no cliente (já implementado: 2MB max). Considere reduzir para 1MB.
- Redimensione/comprime imagens no cliente antes do upload se possível.
- Salve apenas a URL no modelo `Member.photoUrl`.
- Ao migrar dados existentes que têm base64, considere criar um script/migrator que leia members antigos, faça upload das imagens e substitua os campos por URLs.

## Como verificar uso/grátis

No Console do Firebase -> Storage -> Usage você verá uso de armazenamento e downloads. Há alertas e limites que ajudam a controlar custos.

---

Se quiser, eu faço a migração automática para membros existentes (upload das imagens base64 antigas para Storage e substituição por URLs). Informe se quer que eu implemente isso também.
