import {readFileSync} from 'node:fs';

const serviceWorkerRegistration = readFileSync('public/pwa-update.js', 'utf8');

type Listener = () => void;

function runRegistrationScript(options?: {hasController?: boolean; waitingWorker?: WorkerMock | null}) {
  const windowListeners: Record<string, Listener> = {};
  const serviceWorkerListeners: Record<string, Listener> = {};
  const registrationListeners: Record<string, Listener> = {};
  const reload = jest.fn();
  const update = jest.fn().mockResolvedValue(undefined);
  const register = jest.fn();
  const storage = new Map<string, string>();
  const waitingWorker = options?.waitingWorker ?? null;

  const registration = {
    waiting: waitingWorker,
    installing: null as WorkerMock | null,
    update,
    addEventListener: jest.fn((event: string, listener: Listener) => {
      registrationListeners[event] = listener;
    }),
  };

  register.mockResolvedValue(registration);

  const serviceWorker = {
    controller: options?.hasController === false ? null : {},
    register,
    addEventListener: jest.fn((event: string, listener: Listener) => {
      serviceWorkerListeners[event] = listener;
    }),
  };

  const windowMock = {
    location: {reload},
    addEventListener: jest.fn((event: string, listener: Listener) => {
      windowListeners[event] = listener;
    }),
  };

  const sessionStorageMock = {
    getItem: jest.fn((key: string) => storage.get(key) ?? null),
    setItem: jest.fn((key: string, value: string) => storage.set(key, value)),
    removeItem: jest.fn((key: string) => storage.delete(key)),
  };

  const execute = new Function('window', 'navigator', 'sessionStorage', serviceWorkerRegistration);
  execute(windowMock, {serviceWorker}, sessionStorageMock);

  return {
    registration,
    registrationListeners,
    reload,
    register,
    serviceWorkerListeners,
    sessionStorageMock,
    update,
    windowListeners,
  };
}

function createWorker(state = 'installing') {
  const listeners: Record<string, Listener> = {};
  return {
    state,
    postMessage: jest.fn(),
    addEventListener: jest.fn((event: string, listener: Listener) => {
      listeners[event] = listener;
    }),
    listeners,
  };
}

type WorkerMock = ReturnType<typeof createWorker>;

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('service worker registration script', () => {
  it('registers the worker without using the HTTP cache and checks for updates', async () => {
    const context = runRegistrationScript();

    context.windowListeners.load();
    await flushPromises();

    expect(context.register).toHaveBeenCalledWith('/sw.js', {updateViaCache: 'none'});
    expect(context.update).toHaveBeenCalledTimes(1);
  });

  it('activates a worker that is already waiting', async () => {
    const waitingWorker = createWorker('installed');
    const context = runRegistrationScript({waitingWorker});

    context.windowListeners.load();
    await flushPromises();

    expect(waitingWorker.postMessage).toHaveBeenCalledWith({type: 'SKIP_WAITING'});
  });

  it('activates a newly installed worker after updatefound', async () => {
    const context = runRegistrationScript();
    const installingWorker = createWorker();

    context.windowListeners.load();
    await flushPromises();
    context.registration.installing = installingWorker;
    context.registrationListeners.updatefound();
    installingWorker.state = 'installed';
    installingWorker.listeners.statechange();

    expect(installingWorker.postMessage).toHaveBeenCalledWith({type: 'SKIP_WAITING'});
  });

  it('reloads only once when an update takes control', () => {
    const context = runRegistrationScript();

    context.serviceWorkerListeners.controllerchange();
    context.serviceWorkerListeners.controllerchange();

    expect(context.reload).toHaveBeenCalledTimes(1);
    expect(context.sessionStorageMock.setItem).toHaveBeenCalledWith('hireloop-sw-reloaded', '1');
  });

  it('does not reload when the first installed worker takes control', () => {
    const context = runRegistrationScript({hasController: false});

    context.serviceWorkerListeners.controllerchange();

    expect(context.reload).not.toHaveBeenCalled();
  });
});
