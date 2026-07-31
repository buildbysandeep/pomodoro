import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectMongo } from "./utils/mongo";
import { setupSocketIO } from "./socket";
import healthRouter from "./routes/health";
import authRouter from "./routes/auth";
import templateRouter from "./routes/templates";
import sessionRouter from "./routes/sessions";
import analyticsRouter from "./routes/analytics";
import settingsRouter from "./routes/settings";
import googleRouter from "./routes/google";

const PORT = parseInt(process.env.PORT || "3001", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const app = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/templates", templateRouter);
app.use("/api/sessions", sessionRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/auth/google", googleRouter);

async function bootstrap() {
  await connectMongo();
  setupSocketIO(io);

  httpServer.listen(PORT, () => {
    console.log(`Socket.IO server listening on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to bootstrap server:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
