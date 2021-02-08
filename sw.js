importScripts("./lib/Dexie/dexie.js");
importScripts("./lib/fontawesome/all.js")


const staticTodoApp = "todoPWA-v1";
const assets = [
  ".",
  "/",
  "/index.html",
  "/lib/Dexie/dexie.js",
  "/style.css",
  "/lib/fontawesome/all.js",
  "/Db.js",
  "/main.js",
  "https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;1,200;1,300;1,400;1,600&display=swap",
  "https://fonts.googleapis.com/css2?family=Rouge+Script&display=swap",
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticTodoApp).then(cache => {
      cache.addAll(assets)
    })
  )
})


self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      console.log('[Service Worker] Fetching resource: ' + e.request.url);
      return r || fetch(e.request).then((response) => {
        return caches.open(staticTodoApp).then((cache) => {
          console.log('[Service Worker] Caching new resource: ' + e.request.url);
          cache.put(e.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('activate', event => {
  // delete any caches that aren't in staticTodoApp
  // which will get rid of static-v1
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (!staticTodoApp.includes(key)) {
          return caches.delete(key);
        }
      })
    )).then(() => {
      console.log('V2 now ready to handle fetches!');
    })
  );
});
