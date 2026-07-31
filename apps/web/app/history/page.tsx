"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchHistory } from "@/lib/api";
import { formatTime } from "@/lib/utils";
import type { PomodoroSession } from "@pomodoro/shared";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    mode: "",
    completed: "",
    search: "",
  });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    fetchHistory(params)
      .then((data) => setSessions(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters]);

  function exportCSV() {
    window.location.href = "/api/history/export";
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
          <Button variant="outline" onClick={exportCSV}>
            Export CSV
          </Button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Search notes or device..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))}
            className="sm:w-64"
          />
          <Select
            value={filters.mode}
            onValueChange={(v) => setFilters((f) => ({ ...f, mode: v === "all" ? "" : v, page: 1 }))}
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="focus">Focus</SelectItem>
              <SelectItem value="shortBreak">Short Break</SelectItem>
              <SelectItem value="longBreak">Long Break</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.completed}
            onValueChange={(v) =>
              setFilters((f) => ({ ...f, completed: v === "all" ? "" : v, page: 1 }))
            }
          >
            <SelectTrigger className="sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Completed</SelectItem>
              <SelectItem value="false">Interrupted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-muted-foreground">No sessions found.</p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold capitalize">{session.mode}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                    {session.notes && <p className="mt-1 text-sm text-muted-foreground">{session.notes}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold tabular-nums">{formatTime(session.elapsed)}</p>
                    <p className="text-xs text-muted-foreground">{session.completed ? "Completed" : "Interrupted"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
