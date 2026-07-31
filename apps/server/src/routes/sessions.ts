import { Router } from "express";
import { ZodError } from "zod";
import { sessionQuerySchema } from "@pomodoro/shared";
import { expressAuth, type AuthenticatedRequest } from "../middleware/auth";
import { listSessions } from "../services/session";
import { SessionModel } from "../models/session";

const router: Router = Router();
router.use(expressAuth);

router.get("/history", async (req: AuthenticatedRequest, res) => {
  try {
    const query = sessionQuerySchema.parse(req.query);
    const result = await listSessions(req.user!.userId, {
      page: query.page,
      limit: query.limit,
      mode: query.mode,
      completed: query.completed,
      from: query.from,
      to: query.to,
      search: query.search,
    });
    res.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to load history" });
  }
});

router.get("/export", async (req: AuthenticatedRequest, res) => {
  try {
    const sessions = await SessionModel.find({ userId: req.user!.userId }).sort({ createdAt: -1 }).lean();

    const headers = ["ID", "Mode", "Duration", "Elapsed", "Completed", "CompletedAt", "CreatedAt"];
    const rows = sessions.map((s) => [
      s._id.toString(),
      s.mode,
      s.duration,
      s.elapsed,
      s.completed ? "yes" : "no",
      s.completedAt ? s.completedAt.toISOString() : "",
      s.createdAt.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=pomodoro-history.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export history" });
  }
});

export default router;
