import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { registerSchema, loginSchema } from "@pomodoro/shared";
import { UserModel } from "../models/user";
import { PreferencesModel } from "../models/preferences";
import { signToken } from "../utils/jwt";

const router: Router = Router();

function setTokenCookie(res: Response, token: string): void {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await UserModel.create({
      email: data.email,
      name: data.name,
      password: passwordHash,
    });

    await PreferencesModel.create({ userId: user._id });

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    setTokenCookie(res, token);
    res.status(201).json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await UserModel.findOne({ email: data.email }).select("+password");
    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    setTokenCookie(res, token);
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

export default router;
