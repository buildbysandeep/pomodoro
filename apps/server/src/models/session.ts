import mongoose, { Schema, type Document } from "mongoose";
import type { TimerMode } from "@pomodoro/shared";

export interface SessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  templateId: string;
  mode: TimerMode;
  duration: number;
  elapsed: number;
  completed: boolean;
  completedAt?: Date;
  interruptedAt?: Date;
  deviceInfo?: string;
  notes?: string;
  createdAt: Date;
}

const SessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    templateId: { type: String, required: true },
    mode: { type: String, enum: ["focus", "shortBreak", "longBreak"], required: true, index: true },
    duration: { type: Number, required: true },
    elapsed: { type: Number, required: true, default: 0 },
    completed: { type: Boolean, required: true, default: false },
    completedAt: { type: Date, index: true },
    interruptedAt: { type: Date },
    deviceInfo: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

SessionSchema.index({ userId: 1, createdAt: -1 });
SessionSchema.index({ userId: 1, mode: 1, completedAt: -1 });

export const SessionModel = mongoose.model<SessionDocument>("Session", SessionSchema);
