"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAnalytics } from "@/lib/api";
import { formatDuration } from "@/lib/utils";
import { motion } from "framer-motion";

type Range = "daily" | "weekly" | "monthly";

interface Analytics {
  focusMinutes: number;
  sessionsCompleted: number;
  completionRate: number;
  streak: number;
}

export default function DashboardPage() {
  const [range, setRange] = useState<Range>("daily");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(range)
      .then((data) => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  const stats = [
    { label: "Focus Time", value: analytics ? formatDuration(analytics.focusMinutes) : "—" },
    { label: "Sessions Done", value: analytics?.sessionsCompleted ?? "—" },
    { label: "Completion Rate", value: analytics ? `${Math.round(analytics.completionRate * 100)}%` : "—" },
    { label: "Streak", value: analytics ? `${analytics.streak} days` : "—" },
  ];

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </main>
    </AuthGuard>
  );
}
