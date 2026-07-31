import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { UserModel } from "../models/user";
import { PreferencesModel } from "../models/preferences";
import { signToken } from "../utils/jwt";

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/callback/google";

const oauth2Client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

router.post("/", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: "Missing code" });
      return;
    }

    const { tokens } = await oauth2Client.getToken(code);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ error: "Invalid Google token" });
      return;
    }

    let user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      user = await UserModel.create({
        email: payload.email,
        name: payload.name || payload.email.split("@")[0],
        avatar: payload.picture,
        googleId: payload.sub,
        emailVerified: true,
      });
      await PreferencesModel.create({ userId: user._id });
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.avatar = user.avatar || payload.picture;
      await user.save();
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      token,
    });
  } catch (err) {
    console.error("Google OAuth error:", err);
    res.status(500).json({ error: "Google authentication failed" });
  }
});

export default router;
