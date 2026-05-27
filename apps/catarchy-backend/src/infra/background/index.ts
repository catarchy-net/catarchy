export function runInBackground(fn: () => Promise<unknown>): void {
  import("cloudflare:workers")
    .then(({ waitUntil }) => waitUntil(fn()))
    .catch(() => {
      // fallback for non-Cloudflare environments, simply run the function without waiting
      fn();
    });
}
