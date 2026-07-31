import mongoose, { Schema, type Document } from "mongoose";
import { BUILT_IN_TEMPLATES } from "@pomodoro/shared";

export interface PreferencesDocument extends Document {
  userId: mongoose.Types.ObjectId;
  theme: "light" | "dark" | "system";
  sound: string;
  volume: number;
  notifications: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  defaultTemplateId: string;
  updatedAt: Date;
}

const PreferencesSchema = new Schema<PreferencesDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, index: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    sound: { type: String, default: "bell" },
    volume: { type: Number, default: 0.7, min: 0, max: 1 },
    notifications: { type: Boolean, default: true },
    autoStartBreaks: { type: Boolean, default: false },
    autoStartPomodoros: { type: Boolean, default: false },
    defaultTemplateId: { type: String, default: BUILT_IN_TEMPLATES[0].id },
  },
  { timestamps: true }
);

export const PreferencesModel = mongoose.model<PreferencesDocument>("Preferences", PreferencesSchema);
