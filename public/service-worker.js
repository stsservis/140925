const CACHE_NAME = 'sts-servis-v1.0.14';
const STATIC_CACHE_NAME = 'sts-static-v1.0.14';
const DYNAMIC_CACHE_NAME = 'sts-dynamic-v1.0.14';

// Önbelleğe alınacak temel dosyalar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css',
  '/manifest.json',
  '/48.png',
  '/72.png',
  '/96.png',
  '/144.png',
  '/192.png',
  '/512.png'
];

// Önbelleğe alınmayacak URL'ler
const EXCLUDED_URLS = [
  '/service-worker.js',
  '/sw.js'
];

// Service Worker kurulumu
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Service Worker aktivasyonu
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Activation failed', error);
      })
  );
});

// Fetch olaylarını dinleme (çevrimdışı destek)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Hariç tutulan URL'leri atla
  if (EXCLUDED_URLS.some(excludedUrl => url.pathname.includes(excludedUrl))) {
    return;
  }
  
  // Sadece GET isteklerini önbelleğe al
  if (request.method !== 'GET') {
    return;
  }
  
  // Aynı origin kontrolü
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Önbellekte varsa, önbellekten döndür
        if (cachedResponse) {
          console.log('📋 Service Worker: Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Önbellekte yoksa, ağdan getir ve önbelleğe ekle
        return fetch(request)
          .then((networkResponse) => {
            // Geçerli yanıt kontrolü
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Yanıtı klonla (stream sadece bir kez okunabilir)
            const responseToCache = networkResponse.clone();
            
            // Dinamik önbelleğe ekle
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                console.log('💾 Service Worker: Caching new resource:', request.url);
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.log('🔌 Service Worker: Network failed, serving offline page');
            
            // HTML sayfaları için offline fallback
            if (request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Diğer kaynaklar için hata döndür
            throw error;
          });
      })
  );
});

// Background Sync desteği
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Burada çevrimdışıyken yapılan işlemleri senkronize edebilirsiniz
      console.log('📡 Service Worker: Syncing offline data...')
    );
  }
});

// Push notification desteği
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni bildirim',
    icon: '/192.png',
    badge: '/72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Uygulamayı Aç',
        icon: '/192.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('STS Servis Takip', options)
  );
});

// Notification click olayları
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Mesaj dinleme (ana uygulama ile iletişim)
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Hata yakalama
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker: Error occurred:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker: Unhandled promise rejection:', event.reason);
  event.preventDefault();
});