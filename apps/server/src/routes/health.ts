import { Router } from "express";
import mongoose from "mongoose";

const router: Router = Router();

router.get("/", (_req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mongo: mongoStatus,
  });
});

export default router;
