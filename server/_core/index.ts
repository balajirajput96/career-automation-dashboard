import express, { type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { registerStorageProxy } from "./storageProxy";
import { registerOAuthRoutes } from "./oauth";
import { scheduledDiscoveryHandler } from "./scheduledDiscovery";
import http from "http";

export async function createServer() {
  const app = express();
  const server = http.createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  app.post("/api/scheduled/discovery", scheduledDiscoveryHandler);

  app.use("/api/trpc", createExpressMiddleware({
    router: appRouter,
    createContext,
  }));

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return { app, server };
}

async function startServer() {
  const { server } = await createServer();
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

void startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
