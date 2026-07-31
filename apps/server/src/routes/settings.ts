import { Router } from "express";
import { ZodError } from "zod";
import { preferencesSchema } from "@pomodoro/shared";
import { expressAuth, type AuthenticatedRequest } from "../middleware/auth";
import { PreferencesModel } from "../models/preferences";
import type { UserPreferences } from "@pomodoro/shared";

const router = Router();
router.use(expressAuth);

function mapPreferences(doc: InstanceType<typeof PreferencesModel>): UserPreferences {
  return {
    userId: doc.userId.toString(),
    theme: doc.theme,
    sound: doc.sound,
    volume: doc.volume,
    notifications: doc.notifications,
    autoStartBreaks: doc.autoStartBreaks,
    autoStartPomodoros: doc.autoStartPomodoros,
    defaultTemplateId: doc.defaultTemplateId,
  };
}

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    let doc = await PreferencesModel.findOne({ userId: req.user!.userId });
    if (!doc) {
      doc = await PreferencesModel.create({ userId: req.user!.userId });
    }
    res.json({ preferences: mapPreferences(doc) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load preferences" });
  }
});

router.patch("/", async (req: AuthenticatedRequest, res) => {
  try {
    const data = preferencesSchema.partial().parse(req.body);
    const doc = await PreferencesModel.findOneAndUpdate(
      { userId: req.user!.userId },
      { $set: data },
      { new: true, upsert: true }
    );
    res.json({ preferences: mapPreferences(doc) });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
