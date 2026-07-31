import { Router } from "express";
import { ZodError } from "zod";
import { templateSchema } from "@pomodoro/shared";
import { expressAuth, type AuthenticatedRequest } from "../middleware/auth";
import {
  listUserTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../services/template";

const router: Router = Router();
router.use(expressAuth);

router.get("/", async (req: AuthenticatedRequest, res) => {
  try {
    const templates = await listUserTemplates(req.user!.userId);
    res.json({ templates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load templates" });
  }
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  try {
    const data = templateSchema.parse(req.body);
    const template = await createTemplate(req.user!.userId, data);
    res.status(201).json({ template });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to create template" });
  }
});

router.put("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const data = templateSchema.partial().parse(req.body);
    const template = await updateTemplate(req.user!.userId, req.params.id, data);
    if (!template) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json({ template });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update template" });
  }
});

router.delete("/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const deleted = await deleteTemplate(req.user!.userId, req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "Template not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

export default router;
