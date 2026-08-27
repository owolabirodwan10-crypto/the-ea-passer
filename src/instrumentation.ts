export async function register() {
  // Next.js calls this once when the server process starts, before it
  // handles any request. Only run our Node-only provider registration in
  // the nodejs runtime, not the edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerConfiguredProviders } = await import("@/server/bootstrap");
    await registerConfiguredProviders();
  }
}
