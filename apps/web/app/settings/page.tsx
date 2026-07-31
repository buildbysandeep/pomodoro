"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { fetchPreferences, updatePreferences, fetchTemplates } from "@/lib/api";
import { useTheme } from "next-themes";
import type { UserPreferences, PomodoroTemplate } from "@pomodoro/shared";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [templates, setTemplates] = useState<PomodoroTemplate[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([fetchPreferences(), fetchTemplates()])
      .then(([prefs, tpls]) => {
        setPreferences(prefs.preferences);
        setTemplates(tpls.templates);
      })
      .catch(console.error);
  }, []);

  async function handleUpdate(updates: Partial<UserPreferences>) {
    if (!preferences) return;
    const next = { ...preferences, ...updates };
    setPreferences(next);
    setSaving(true);
    try {
      await updatePreferences(updates);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (!preferences) {
    return (
      <AuthGuard>
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-8">
          <div className="h-96 animate-pulse rounded-xl bg-muted" />
        </main>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Settings</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={(v) => setTheme(v)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timer Behavior</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-start-breaks">Auto-start breaks</Label>
                  <p className="text-sm text-muted-foreground">Start breaks automatically after a focus session.</p>
                </div>
                <Switch
                  id="auto-start-breaks"
                  checked={preferences.autoStartBreaks}
                  onCheckedChange={(v) => handleUpdate({ autoStartBreaks: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-start-pomodoros">Auto-start pomodoros</Label>
                  <p className="text-sm text-muted-foreground">Start focus sessions automatically after a break.</p>
                </div>
                <Switch
                  id="auto-start-pomodoros"
                  checked={preferences.autoStartPomodoros}
                  onCheckedChange={(v) => handleUpdate({ autoStartPomodoros: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="default-template">Default template</Label>
                <Select
                  value={preferences.defaultTemplateId}
                  onValueChange={(v) => handleUpdate({ defaultTemplateId: v })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sound & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Browser notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when sessions complete.</p>
                </div>
                <Switch
                  id="notifications"
                  checked={preferences.notifications}
                  onCheckedChange={(v) => handleUpdate({ notifications: v })}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(preferences.volume * 100)}%</span>
                </div>
                <Slider
                  value={[preferences.volume]}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => handleUpdate({ volume: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound">Sound</Label>
                <Select value={preferences.sound} onValueChange={(v) => handleUpdate({ sound: v })}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bell">Bell</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                    <SelectItem value="chime">Chime</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button disabled={saving}>{saved ? "Saved" : saving ? "Saving..." : "Save Settings"}</Button>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}
