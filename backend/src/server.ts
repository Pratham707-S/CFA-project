import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./shared/logger/logger.js";

const app = createApp();

app.listen({ port: env.PORT, host: "127.0.0.1" })
  .then(() => logger.info(`Backend listening on port ${env.PORT}`))
  .catch((error) => {
    logger.error("Backend failed to start", { error: String(error) });
    process.exitCode = 1;
  });
