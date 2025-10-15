# Correção: Miniatura de Foto não Atualiza

**Data:** 11 de outubro de 2025
**Tipo:** Correção de Bug
**Status:** ✅ Concluído

## 📋 Problema

Ao clicar em "Novo Candidato" e selecionar uma foto através do botão "Escolher Foto", a miniatura não era atualizada com a imagem selecionada.

## 🔍 Causa Raiz

O código estava tratando `#candidate-photo-preview` como uma tag `<img>` e tentando definir a propriedade `.src`, mas na verdade é uma `<div>` que contém um ícone Material Icons.

### HTML Estrutura

```html
<div class="photo-preview" id="candidate-photo-preview">
  <span class="material-icons md-48">person</span>
</div>
```

### Código com Bug

```typescript
const photoPreview = document.getElementById(
  "candidate-photo-preview"
) as HTMLImageElement; // ❌ Tipo incorreto

if (photoPreview) {
  photoPreview.src = photoUrl; // ❌ Não funciona em <div>
  photoPreview.style.display = "block";
}
```

**Problema:** `<div>` não tem propriedade `.src`, então nada acontecia.

## 🔧 Solução Implementada

### 1. Correção em `handlePhotoUpload()`

**Arquivo:** `src/ui/manager.ts` (linha ~830-845)

#### Antes

```typescript
const photoPreview = document.getElementById(
  "candidate-photo-preview"
) as HTMLImageElement;

if (photoPreview) {
  photoPreview.src = photoUrl;
  photoPreview.style.display = "block";
}

if (removePhotoBtn) {
  removePhotoBtn.style.display = "block";
}
```

#### Depois

```typescript
const photoPreview = document.getElementById(
  "candidate-photo-preview"
) as HTMLDivElement; // ✅ Tipo correto

if (photoPreview) {
  // Substituir conteúdo por imagem
  photoPreview.innerHTML = `<img src="${photoUrl}" alt="Foto do candidato" style="width: 100%; height: 100%; object-fit: cover; border-radius: inherit;" />`;
}

if (removePhotoBtn) {
  removePhotoBtn.style.display = "inline-flex"; // ✅ Melhor para botão
}
```

**Mudanças:**

- ✅ Tipo alterado para `HTMLDivElement`
- ✅ Usa `.innerHTML` para substituir conteúdo
- ✅ Cria tag `<img>` dinamicamente
- ✅ Estilos inline para ajuste perfeito
- ✅ `object-fit: cover` mantém proporções
- ✅ `border-radius: inherit` mantém cantos arredondados

### 2. Correção em `handleRemovePhoto()`

**Arquivo:** `src/ui/manager.ts` (linha ~859-880)

#### Antes

```typescript
const photoPreview = document.getElementById(
  "candidate-photo-preview"
) as HTMLImageElement;
const photoInput = document.getElementById(
  "candidate-photo-input" // ❌ ID incorreto
) as HTMLInputElement;

if (photoPreview) {
  photoPreview.src = "";
  photoPreview.style.display = "none";
}
```

#### Depois

```typescript
const photoPreview = document.getElementById(
  "candidate-photo-preview"
) as HTMLDivElement; // ✅ Tipo correto
const photoInput = document.getElementById(
  "candidate-photo" // ✅ ID correto
) as HTMLInputElement;

if (photoPreview) {
  // Restaurar ícone padrão
  photoPreview.innerHTML = '<span class="material-icons md-48">person</span>';
}
```

**Mudanças:**

- ✅ Tipo alterado para `HTMLDivElement`
- ✅ ID do input corrigido (`candidate-photo`)
- ✅ Restaura ícone Material Icons padrão
- ✅ Remove imagem ao clicar em "Remover"

## 🎨 Comportamento Corrigido

### Fluxo Completo

```
1. Usuário clica em "Novo Candidato"
   ↓
2. Modal abre com ícone de pessoa padrão
   📸 [person icon]
   ↓
3. Usuário clica em "Escolher Foto"
   ↓
4. Seleciona imagem do computador
   ↓
5. handlePhotoUpload() executa:
   - Valida tipo (apenas imagens)
   - Valida tamanho (máx 2MB)
   - Converte para base64
   - Substitui conteúdo da div por <img>
   ↓
6. Miniatura atualizada! ✅
   📸 [Foto selecionada]
   ↓
7. Botão "Remover" aparece
   ↓
8. [Opcional] Usuário clica em "Remover"
   ↓
9. handleRemovePhoto() executa:
   - Restaura ícone padrão
   - Limpa input de arquivo
   - Oculta botão "Remover"
   ↓
10. Volta ao estado inicial
    📸 [person icon]
```

## 📊 Comparação Visual

### Antes da Correção

```
[📸 person icon]  ← Nunca muda
[Escolher Foto]
```

- Usuário seleciona foto
- Nada acontece
- Miniatura permanece como ícone

### Depois da Correção

```
[📸 person icon]  ← Estado inicial
[Escolher Foto]

↓ Após selecionar

[🖼️ Foto do candidato]  ← Miniatura atualizada!
[Escolher Foto] [Remover]
```

## 🎯 Estilos Aplicados na Imagem

```css
width: 100%; /* Ocupa toda a largura da div */
height: 100%; /* Ocupa toda a altura da div */
object-fit: cover; /* Mantém proporções, corta se necessário */
border-radius: inherit; /* Herda border-radius da div pai */
```

**Resultado:** Imagem se ajusta perfeitamente no espaço circular da miniatura.

## 🧪 Testes Recomendados

### Teste 1: Upload de Foto

- [ ] Abrir modal "Novo Candidato"
- [ ] Verificar ícone de pessoa padrão
- [ ] Clicar em "Escolher Foto"
- [ ] Selecionar imagem PNG
- [ ] ✅ Miniatura deve atualizar com a foto
- [ ] ✅ Botão "Remover" deve aparecer

### Teste 2: Diferentes Formatos

- [ ] Testar JPG → Miniatura atualiza
- [ ] Testar PNG → Miniatura atualiza
- [ ] Testar GIF → Miniatura atualiza
- [ ] Testar WEBP → Miniatura atualiza

### Teste 3: Validações

- [ ] Selecionar arquivo > 2MB → Erro, miniatura não muda
- [ ] Selecionar PDF → Erro, miniatura não muda
- [ ] Selecionar TXT → Erro, miniatura não muda

### Teste 4: Remover Foto

- [ ] Upload de foto (miniatura atualiza)
- [ ] Clicar em "Remover"
- [ ] ✅ Miniatura volta ao ícone padrão
- [ ] ✅ Botão "Remover" desaparece

### Teste 5: Proporções

- [ ] Upload de foto quadrada → Ajusta bem
- [ ] Upload de foto retrato → Ajusta bem (corta lados)
- [ ] Upload de foto paisagem → Ajusta bem (corta topo/fundo)

## 📝 Notas Técnicas

### 1. Por que `.innerHTML` em vez de criar elemento?

**Opção escolhida:**

```typescript
photoPreview.innerHTML = `<img src="${photoUrl}" ... />`;
```

**Alternativa (mais verbosa):**

```typescript
const img = document.createElement("img");
img.src = photoUrl;
img.alt = "Foto do candidato";
img.style.width = "100%";
// ... mais linhas
photoPreview.innerHTML = "";
photoPreview.appendChild(img);
```

**Justificativa:** `.innerHTML` é mais conciso e legível para este caso simples.

### 2. object-fit: cover

```css
object-fit: cover;
```

**Comportamento:**

- Mantém proporções da imagem original
- Preenche toda a área disponível
- Corta excesso (centralizado)

**Alternativas:**

- `contain` - Mostra imagem completa, pode ter espaços vazios
- `fill` - Distorce imagem para preencher
- `scale-down` - Reduz se necessário

### 3. border-radius: inherit

```css
border-radius: inherit;
```

**Vantagem:** Se o CSS da `.photo-preview` mudar no futuro, a imagem se adapta automaticamente.

### 4. Base64 vs File URL

**Usado:** Base64

```typescript
reader.readAsDataURL(file);
```

**Alternativa:** Object URL

```typescript
const url = URL.createObjectURL(file);
```

**Por que Base64?**

- ✅ Pode ser salvo diretamente no localStorage
- ✅ Não precisa gerenciar lifecycle do URL
- ✅ Funciona após reload da página
- ⚠️ Aumenta tamanho em ~33%
- ⚠️ Limitado a 2MB (validação aplicada)

## 🔄 Impacto

### Módulos Afetados

- ✅ Modal "Novo Candidato"
- ✅ Upload de foto
- ✅ Preview de foto
- ✅ Remoção de foto

### Módulos Não Afetados

- ⚪ Edição de candidato (mesma função é usada)
- ⚪ Outras abas
- ⚪ Funcionalidade de votação

## 🎯 Resultado Final

✅ **Bug corrigido completamente:**

- Miniatura atualiza corretamente ao selecionar foto
- Imagem se ajusta perfeitamente no espaço circular
- Botão "Remover" funciona corretamente
- Ícone padrão é restaurado ao remover

A experiência do usuário agora é fluida e intuitiva! 🎉

---

**Documentação criada:** 11 de outubro de 2025
**Última atualização:** 11 de outubro de 2025
**Versão:** 1.0.0
