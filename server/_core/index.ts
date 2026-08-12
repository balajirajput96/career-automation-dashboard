import express, { type Request, type Response } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { setupVite } from "./vite";
import { registerStorageProxy } from "./storageProxy";
import { registerOAuthRoutes } from "./oauth";
import { scheduledDiscoveryHandler } from "./scheduledDiscovery";
import http from "http";
import path from "path";
import fs from "fs";

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
    const publicPath = path.resolve(__dirname, "../../dist");
    app.use(express.static(publicPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(publicPath, "index.html"));
    });
  }

  return { app, server };
}
