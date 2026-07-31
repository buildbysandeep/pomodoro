import { Router } from "express";
import { expressAuth, type AuthenticatedRequest } from "../middleware/auth";
import { getAnalytics } from "../services/session";

const router = Router();
router.use(expressAuth);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const range = (req.query.range as "daily" | "weekly" | "monthly") || "daily";
    const analytics = await getAnalytics(req.user!.userId, range);
    res.json({ analytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

export default router;
