export async function registerOfflineSupport(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  const hostname = window.location.hostname.toLowerCase();
  const previewDomain = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(hostname);
  const previewLabel = /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+/.test(hostname.split(".")[0] ?? "");
  const hostedPreview = previewDomain && previewLabel;
  const devProjectDomain = /^project--.+-dev\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(hostname);
  const lovableProjectDomain = hostname === "lovableproject.com" || hostname.endsWith(".lovableproject.com");
  const lovableDevDomain = hostname === "lovableproject-dev.com" || hostname.endsWith(".lovableproject-dev.com");
  const betaDomain = hostname === "beta.lovable.dev" || hostname.endsWith(".beta.lovable.dev");

  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.href);
  const registrations = await navigator.serviceWorker.getRegistrations();
  const appRegistrations = registrations.filter((registration) => {
    const workerScript = registration.active?.scriptURL ?? registration.waiting?.scriptURL ?? registration.installing?.scriptURL ?? "";
    return workerScript.endsWith("/sw.js") && new URL(registration.scope).pathname.startsWith(baseUrl.pathname);
  });

  const shouldRefuse =
    !import.meta.env.PROD ||
    window.top !== window.self ||
    hostedPreview ||
    devProjectDomain ||
    lovableProjectDomain ||
    lovableDevDomain ||
    betaDomain ||
    new URLSearchParams(window.location.search).get("sw") === "off";

  if (shouldRefuse) {
    await Promise.all(appRegistrations.map((registration) => registration.unregister()));
    return false;
  }

  const registration = await navigator.serviceWorker.register(new URL("sw.js", baseUrl), {
    scope: baseUrl.pathname,
  });
  await registration.update().catch(() => undefined);
  await navigator.serviceWorker.ready;
  return true;
}