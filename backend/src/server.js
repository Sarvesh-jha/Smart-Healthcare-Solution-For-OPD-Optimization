import http from "http";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { initSocket } from "./config/socket.js";
import { seedDemoData } from "./utils/seedDemoData.js";

async function start() {
  try {
    await connectDatabase();
    await seedDemoData();

    const app = createApp();
    const httpServer = http.createServer(app);
    initSocket(httpServer);

    httpServer.listen(env.port, () => {
      console.log(`MEDIrxCARE backend listening on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start the backend.", error);
    process.exit(1);
  }
}

start();
