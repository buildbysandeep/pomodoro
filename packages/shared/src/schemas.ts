import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const templateSchema = z.object({
  name: z.string().min(1).max(50),
  focusDuration: z.number().int().min(1).max(180),
  shortBreakDuration: z.number().int().min(1).max(60),
  longBreakDuration: z.number().int().min(1).max(120),
  cyclesBeforeLongBreak: z.number().int().min(1).max(10),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  sound: z.string(),
  volume: z.number().min(0).max(1),
  notifications: z.boolean(),
  autoStartBreaks: z.boolean(),
  autoStartPomodoros: z.boolean(),
  defaultTemplateId: z.string(),
});

export const sessionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  mode: z.enum(["focus", "shortBreak", "longBreak"]).optional(),
  completed: z.coerce.boolean().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().optional(),
});
