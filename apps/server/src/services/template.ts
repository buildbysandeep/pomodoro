import { TemplateModel } from "../models/template";
import { BUILT_IN_TEMPLATES } from "@pomodoro/shared";
import type { PomodoroTemplate } from "@pomodoro/shared";

function mapDocument(doc: InstanceType<typeof TemplateModel>): PomodoroTemplate {
  return {
    id: doc._id.toString(),
    userId: doc.userId?.toString(),
    name: doc.name,
    isBuiltIn: doc.isBuiltIn,
    focusDuration: doc.focusDuration,
    shortBreakDuration: doc.shortBreakDuration,
    longBreakDuration: doc.longBreakDuration,
    cyclesBeforeLongBreak: doc.cyclesBeforeLongBreak,
    color: doc.color,
  };
}

export function getBuiltInTemplates(): PomodoroTemplate[] {
  return BUILT_IN_TEMPLATES.map((t) => ({ ...t }));
}

export async function listUserTemplates(userId: string): Promise<PomodoroTemplate[]> {
  const custom = await TemplateModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return [...getBuiltInTemplates(), ...custom.map((doc) => mapDocument(doc as InstanceType<typeof TemplateModel>))];
}

export async function createTemplate(
  userId: string,
  data: Omit<PomodoroTemplate, "id" | "userId" | "isBuiltIn">
): Promise<PomodoroTemplate> {
  const doc = await TemplateModel.create({ ...data, userId, isBuiltIn: false });
  return mapDocument(doc);
}

export async function updateTemplate(
  userId: string,
  id: string,
  data: Partial<Omit<PomodoroTemplate, "id" | "userId" | "isBuiltIn">>
): Promise<PomodoroTemplate | null> {
  const doc = await TemplateModel.findOneAndUpdate({ _id: id, userId }, data, { new: true });
  if (!doc) return null;
  return mapDocument(doc);
}

export async function deleteTemplate(userId: string, id: string): Promise<boolean> {
  const result = await TemplateModel.deleteOne({ _id: id, userId });
  return result.deletedCount > 0;
}

export async function findTemplateById(userId: string, id: string): Promise<PomodoroTemplate | null> {
  const builtIn = BUILT_IN_TEMPLATES.find((t) => t.id === id);
  if (builtIn) return { ...builtIn };
  const doc = await TemplateModel.findOne({ _id: id, userId });
  if (!doc) return null;
  return mapDocument(doc);
}
