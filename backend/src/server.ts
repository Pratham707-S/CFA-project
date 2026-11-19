import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env") });

async function startServer() {
  const [{ createApp }, { env }, { logger }] = await Promise.all([
    import("./app.js"),
    import("./config/env.js"),
    import("./shared/logger/logger.js"),
  ]);

  const app = createApp();

  await app.listen({ port: env.PORT, host: "127.0.0.1" });
  logger.info(`Backend listening on port ${env.PORT}`);
}

startServer().catch((error) => {
  console.error("Backend failed to start", error);
  process.exitCode = 1;
});
