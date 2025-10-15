// Service Worker para PWA - Sistema de Eleição de Oficiais
// Versão: 2.0.0
// Data: 13/out/2025

const CACHE_NAME = "eleicao-oficiais-v2.0.0";
const urlsToCache = ["/", "/index.html", "/assets/css/main.css"];

// Instalação: cachear recursos estáticos
self.addEventListener("install", (event) => {
  console.log("[SW] Instalando Service Worker...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cache aberto, armazenando recursos...");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log("[SW] ✅ Instalado com sucesso");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[SW] ❌ Erro na instalação:", error);
      })
  );
});

// Ativação: limpar caches antigos
self.addEventListener("activate", (event) => {
  console.log("[SW] Ativando Service Worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Removendo cache antigo:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[SW] ✅ Ativado com sucesso");
        return self.clients.claim();
      })
  );
});

// Fetch: estratégia Network First (Firebase precisa estar sempre atualizado)
self.addEventListener("fetch", (event) => {
  // Ignorar requisições do Firebase (sempre buscar da rede)
  if (
    event.request.url.includes("firebaseio.com") ||
    event.request.url.includes("googleapis.com")
  ) {
    return event.respondWith(fetch(event.request));
  }

  // Para outros recursos: Network First, fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar resposta (só pode ser lida uma vez)
        const responseToCache = response.clone();

        // Atualizar cache com nova versão
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Se rede falhar, tentar cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log("[SW] Servindo do cache:", event.request.url);
            return cachedResponse;
          }

          // Se não tem no cache, retornar página offline
          return new Response("Offline - conteúdo não disponível", {
            status: 503,
            statusText: "Service Unavailable",
            headers: new Headers({
              "Content-Type": "text/plain",
            }),
          });
        });
      })
  );
});

// Mensagens do cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] Pulando espera e ativando imediatamente");
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    console.log("[SW] Limpando cache...");
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log("[SW] ✅ Cache limpo");
      })
    );
  }
});
