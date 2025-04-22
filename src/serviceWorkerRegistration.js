// serviceWorkerRegistration.js

export function register() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('Gestura Service Worker registered:', registration);
          })
          .catch((error) => {
            console.error('Gestura Service Worker registration failed:', error);
          });
      });
    }
  }
  