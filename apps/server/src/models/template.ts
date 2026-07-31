import mongoose, { Schema, type Document } from "mongoose";

export interface TemplateDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  isBuiltIn: boolean;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  cyclesBeforeLongBreak: number;
  color: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TemplateSchema = new Schema<TemplateDocument>(
  {
    userId: { type: Schema.Types.ObjectId, index: true, sparse: true },
    name: { type: String, required: true },
    isBuiltIn: { type: Boolean, default: false, index: true },
    focusDuration: { type: Number, required: true, min: 1, max: 180 },
    shortBreakDuration: { type: Number, required: true, min: 1, max: 60 },
    longBreakDuration: { type: Number, required: true, min: 1, max: 120 },
    cyclesBeforeLongBreak: { type: Number, required: true, min: 1, max: 10 },
    color: { type: String, required: true },
  },
  { timestamps: true }
);

export const TemplateModel = mongoose.model<TemplateDocument>("Template", TemplateSchema);
