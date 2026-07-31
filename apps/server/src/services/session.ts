import { SessionModel } from "../models/session";
import { AnalyticsModel } from "../models/analytics";
import type { PomodoroSession, TimerMode } from "@pomodoro/shared";

function mapSession(doc: InstanceType<typeof SessionModel>): PomodoroSession {
  return {
    id: doc._id.toString(),
    userId: doc.userId.toString(),
    templateId: doc.templateId,
    mode: doc.mode,
    duration: doc.duration,
    elapsed: doc.elapsed,
    completed: doc.completed,
    completedAt: doc.completedAt?.toISOString(),
    interruptedAt: doc.interruptedAt?.toISOString(),
    deviceInfo: doc.deviceInfo,
    notes: doc.notes,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function recordSession(
  userId: string,
  data: {
    templateId: string;
    mode: TimerMode;
    duration: number;
    elapsed: number;
    completed: boolean;
    deviceInfo?: string;
  }
): Promise<PomodoroSession> {
  const doc = await SessionModel.create({
    userId,
    ...data,
    completedAt: data.completed ? new Date() : undefined,
    interruptedAt: data.completed ? undefined : new Date(),
  });

  await updateAnalytics(userId, doc.mode, data.elapsed, data.completed, doc.createdAt);

  return mapSession(doc);
}

export async function listSessions(
  userId: string,
  filters: {
    page?: number;
    limit?: number;
    mode?: TimerMode;
    completed?: boolean;
    from?: Date;
    to?: Date;
    search?: string;
  }
) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const query: Record<string, unknown> = { userId };

  if (filters.mode) query.mode = filters.mode;
  if (typeof filters.completed === "boolean") query.completed = filters.completed;
  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) (query.createdAt as Record<string, Date>).$gte = filters.from;
    if (filters.to) (query.createdAt as Record<string, Date>).$lte = filters.to;
  }
  if (filters.search) {
    query.$or = [
      { notes: { $regex: filters.search, $options: "i" } },
      { deviceInfo: { $regex: filters.search, $options: "i" } },
    ];
  }

  const [docs, total] = await Promise.all([
    SessionModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    SessionModel.countDocuments(query),
  ]);

  return {
    data: docs.map((d) => mapSession(d as InstanceType<typeof SessionModel>)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getAnalytics(
  userId: string,
  range: "daily" | "weekly" | "monthly"
): Promise<{ focusMinutes: number; sessionsCompleted: number; completionRate: number; streak: number }> {
  const now = new Date();
  let from = new Date();
  if (range === "daily") from = new Date(now.setHours(0, 0, 0, 0));
  if (range === "weekly") from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (range === "monthly") from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sessions = await SessionModel.find({
    userId,
    createdAt: { $gte: from },
  }).lean();

  const completed = sessions.filter((s) => s.completed);
  const focusMinutes = completed
    .filter((s) => s.mode === "focus")
    .reduce((sum, s) => sum + Math.floor(s.elapsed / 60000), 0);

  const completionRate = sessions.length > 0 ? completed.length / sessions.length : 0;

  const analytics = await AnalyticsModel.find({
    userId,
    date: { $gte: from.toISOString().split("T")[0] },
  }).sort({ date: -1 });

  let streak = 0;
  for (const day of analytics) {
    if (day.streakDay) streak++;
    else break;
  }

  return { focusMinutes, sessionsCompleted: completed.length, completionRate, streak };
}

async function updateAnalytics(
  userId: string,
  mode: TimerMode,
  elapsedMs: number,
  completed: boolean,
  createdAt: Date
): Promise<void> {
  const date = createdAt.toISOString().split("T")[0];
  const focusMinutes = mode === "focus" ? Math.floor(elapsedMs / 60000) : 0;

  await AnalyticsModel.findOneAndUpdate(
    { userId, date },
    {
      $inc: {
        focusMinutes,
        sessionsCompleted: completed ? 1 : 0,
        sessionsStarted: 1,
      },
      $set: { streakDay: focusMinutes >= 25 },
    },
    { upsert: true, new: true }
  );

  const doc = await AnalyticsModel.findOne({ userId, date });
  if (doc) {
    const total = doc.sessionsStarted;
    doc.completionRate = total > 0 ? doc.sessionsCompleted / total : 0;
    await doc.save();
  }
}
