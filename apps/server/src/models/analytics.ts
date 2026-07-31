import mongoose, { Schema, type Document } from "mongoose";

export interface AnalyticsDocument extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  focusMinutes: number;
  sessionsCompleted: number;
  sessionsStarted: number;
  completionRate: number;
  streakDay: boolean;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<AnalyticsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    date: { type: String, required: true },
    focusMinutes: { type: Number, default: 0 },
    sessionsCompleted: { type: Number, default: 0 },
    sessionsStarted: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0, min: 0, max: 1 },
    streakDay: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ userId: 1, date: -1 }, { unique: true });

export const AnalyticsModel = mongoose.model<AnalyticsDocument>("Analytics", AnalyticsSchema);
