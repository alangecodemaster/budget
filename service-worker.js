const budgetingApp = "budgeting-app-v1"
const assets = [
  "/budget/",
  "/budget/index.html",
  "/budget/css/budget-envelopes.css",
  "/budget/js/budget-scripts.js",
  "/budget/favicon.io"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(budgetingApp).then(cache => {
      cache.addAll(assets)
    })
  )
})

self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})
