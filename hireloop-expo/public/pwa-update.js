(function () {
  if (!('serviceWorker' in navigator)) return;

  var reloadKey = 'hireloop-sw-reloaded';
  var hadControllerAtStart = Boolean(navigator.serviceWorker.controller);
  var isReloading = false;
  var alreadyReloaded = false;

  try {
    alreadyReloaded = sessionStorage.getItem(reloadKey) === '1';
    if (alreadyReloaded) sessionStorage.removeItem(reloadKey);
  } catch (_) {
    // The in-memory guard still prevents duplicate reloads if storage is blocked.
  }

  function activateWaitingWorker(worker) {
    if (!worker || !navigator.serviceWorker.controller) return;
    worker.postMessage({type: 'SKIP_WAITING'});
  }

  function watchInstallingWorker(worker) {
    if (!worker) return;
    worker.addEventListener('statechange', function () {
      if (worker.state === 'installed') activateWaitingWorker(worker);
    });
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadControllerAtStart || alreadyReloaded || isReloading) return;
    isReloading = true;

    try {
      sessionStorage.setItem(reloadKey, '1');
    } catch (_) {
      // isReloading still guards this document instance.
    }

    window.location.reload();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js', {updateViaCache: 'none'})
      .then(function (registration) {
        activateWaitingWorker(registration.waiting);
        watchInstallingWorker(registration.installing);

        registration.addEventListener('updatefound', function () {
          watchInstallingWorker(registration.installing);
        });

        registration.update().catch(function () {
          // A failed update check must not stop the cached application.
        });
      })
      .catch(function () {
        // The application remains usable if service-worker registration fails.
      });
  });
})();
