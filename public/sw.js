// public/sw.js

// Escuta o evento de "push" (quando o servidor manda a notificação)
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    // Configura como a notificação vai aparecer na tela do celular
    const options = {
      body: data.body,
      icon: '/icon-192x192.png', // O ícone que vai aparecer na notificação
      badge: '/icon-192x192.png', // O ícone pequenininho da barra de status (Android)
      vibrate: [200, 100, 200], // Faz o celular vibrar
      data: {
        url: data.url || '/', // Para onde ir quando clicar
      }
    };

    // Pede para o sistema operacional do celular mostrar a notificação
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// O que acontece quando o cliente clica na notificação
self.addEventListener('notificationclick', function (event) {
  event.notification.close(); // Fecha a notificação da tela
  
  // Abre o aplicativo na URL que veio na notificação
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});