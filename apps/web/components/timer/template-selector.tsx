"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSocket } from "@/hooks/use-socket";
import { useTimerStore } from "@/stores/timer-store";
import { SOCKET_EVENTS } from "@pomodoro/shared";
import type { PomodoroTemplate } from "@pomodoro/shared";
import { fetchTemplates } from "@/lib/api";
import { TemplateDialog } from "./template-dialog";

export function TemplateSelector() {
  const { emit } = useSocket();
  const activeTemplate = useTimerStore((s) => s.activeTemplate);
  const [templates, setTemplates] = useState<PomodoroTemplate[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchTemplates()
      .then((data) => setTemplates(data.templates))
      .catch(console.error);
  }, []);

  function handleChange(value: string) {
    emit(SOCKET_EVENTS.TIMER_TEMPLATE, { templateId: value });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={activeTemplate.id} onValueChange={handleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select template" />
        </SelectTrigger>
        <SelectContent>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                {t.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={() => setDialogOpen(true)}>
        <Plus className="h-4 w-4" />
      </Button>
      <TemplateDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onCreated={() => {
          fetchTemplates().then((data) => setTemplates(data.templates));
        }}
      />
    </div>
  );
}
