"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TemplateDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function TemplateDialog({ open, onClose, onCreated }: TemplateDialogProps) {
  const [name, setName] = useState("");
  const [focusDuration, setFocusDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [cycles, setCycles] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          focusDuration,
          shortBreakDuration,
          longBreakDuration,
          cyclesBeforeLongBreak: cycles,
          color: "#3b82f6",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create template");
      onCreated();
      onClose();
      setName("");
      setFocusDuration(25);
      setShortBreakDuration(5);
      setLongBreakDuration(15);
      setCycles(4);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="template-name">Name</Label>
            <Input id="template-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="focus">Focus (min)</Label>
              <Input id="focus" type="number" min={1} max={180} value={focusDuration} onChange={(e) => setFocusDuration(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short-break">Short Break (min)</Label>
              <Input id="short-break" type="number" min={1} max={60} value={shortBreakDuration} onChange={(e) => setShortBreakDuration(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long-break">Long Break (min)</Label>
              <Input id="long-break" type="number" min={1} max={120} value={longBreakDuration} onChange={(e) => setLongBreakDuration(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycles">Cycles before long break</Label>
              <Input id="cycles" type="number" min={1} max={10} value={cycles} onChange={(e) => setCycles(Number(e.target.value))} required />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
