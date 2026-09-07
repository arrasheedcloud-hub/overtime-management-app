"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  Plus,
  Minus,
  X,
  Calendar as CalendarIcon,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn, formatTime12Hour, timeToMinutes, minutesToTime } from "@/lib/utils";
import type { AppSettings, OvertimeRecord } from "@/lib/types";
import { getWeekDayKey, getWeekDayName } from "@/lib/utils";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  selectedDate?: Date;
  existingRecord?: OvertimeRecord | null;
  initialStartTime?: string;
  initialEndTime?: string;
  initialNotes?: string;
  onSave: (record: {
    recordDate: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    notes?: string;
  }) => void;
}

type Tab = "quick" | "end" | "range" | "duration";

export function QuickAddModal({
  isOpen,
  onClose,
  settings,
  selectedDate,
  existingRecord,
  initialStartTime,
  initialEndTime,
  initialNotes,
  onSave,
}: QuickAddModalProps) {
  const today = selectedDate || new Date();
  const dateStr = today.toISOString().split("T")[0];
  const dayKey = getWeekDayKey(today) as keyof AppSettings["workSchedule"];
  const daySchedule = settings.workSchedule[dayKey];
  const officialEnd = daySchedule.officialEnd;
  const overtimeEnd = daySchedule.overtimeEnd;
  const officialEndMinutes = timeToMinutes(officialEnd);

  const [activeTab, setActiveTab] = useState<Tab>("quick");
  const [startTime, setStartTime] = useState(
    initialStartTime?.slice(0, 5) || officialEnd
  );
  const [endTime, setEndTime] = useState(
    initialEndTime?.slice(0, 5) || overtimeEnd
  );
  const [durationHours, setDurationHours] = useState(3);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [notes, setNotes] = useState(initialNotes || "");
  const [hourlyRate, setHourlyRate] = useState(
    existingRecord?.hourlyRate ?? settings.hourlyRate
  );

  useEffect(() => {
    setStartTime(initialStartTime?.slice(0, 5) || officialEnd);
    setEndTime(initialEndTime?.slice(0, 5) || overtimeEnd);
    setNotes(initialNotes || "");
    setHourlyRate(existingRecord?.hourlyRate ?? settings.hourlyRate);
    setActiveTab("quick");
  }, [
    isOpen,
    initialStartTime,
    initialEndTime,
    initialNotes,
    existingRecord?.hourlyRate,
    settings.hourlyRate,
    officialEnd,
    overtimeEnd,
  ]);

  const currentMinutes = useMemo(() => {
    if (activeTab === "quick" || activeTab === "end") {
      return Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
    }
    if (activeTab === "range") {
      return Math.max(0, timeToMinutes(endTime) - timeToMinutes(startTime));
    }
    return durationHours * 60 + durationMinutes;
  }, [activeTab, startTime, endTime, durationHours, durationMinutes]);

  const amount = useMemo(() => {
    return Math.round((currentMinutes / 60) * settings.hourlyRate);
  }, [currentMinutes, settings.hourlyRate]);

  const handleQuickHour = (hours: number) => {
    const endMinutes = officialEndMinutes + hours * 60;
    setStartTime(officialEnd);
    setEndTime(minutesToTime(endMinutes));
    setActiveTab("quick");
    onSave({
      recordDate: dateStr,
      startTime: officialEnd,
      endTime: minutesToTime(endMinutes),
      hourlyRate,
      notes,
    });
  };

  const handleEndTime = (time: string) => {
    setEndTime(time);
    setStartTime(officialEnd);
    setActiveTab("end");
  };

  const handleSave = () => {
    let finalStart = startTime;
    let finalEnd = endTime;

    if (activeTab === "duration") {
      finalStart = officialEnd;
      finalEnd = minutesToTime(
        officialEndMinutes + durationHours * 60 + durationMinutes
      );
    }

    onSave({
      recordDate: dateStr,
      startTime: finalStart,
      endTime: finalEnd,
      hourlyRate,
      notes,
    });
  };

  if (!isOpen) return null;

  const endOptions = [
    minutesToTime(officialEndMinutes + 60),
    minutesToTime(officialEndMinutes + 120),
    overtimeEnd,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 animate-fade-in">
      <div className="w-full max-w-md rounded-t-3xl bg-[rgb(var(--card))] p-5 animate-slide-up">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">إضافة إضافي</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-[rgb(var(--muted))]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            {getWeekDayName(today)} {today.toLocaleDateString("ar-SA")}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))]">
            انتهاء الدوام الرسمي: {formatTime12Hour(officialEnd)}
          </p>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-[rgb(var(--muted))] p-1">
          {[
            { key: "quick", label: "سريع" },
            { key: "end", label: "وقت النهاية" },
            { key: "range", label: "فترة" },
            { key: "duration", label: "مدة" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as Tab)}
              className={cn(
                "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-[rgb(var(--primary))] text-white"
                  : "text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "quick" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">اختر عدد الساعات</p>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((hours) => (
                <Button
                  key={hours}
                  onClick={() => handleQuickHour(hours)}
                  variant="outline"
                  className="h-16 flex-col text-lg"
                >
                  <Plus className="h-5 w-5" />
                  {hours} ساعة
                </Button>
              ))}
            </div>
          </div>
        )}

        {activeTab === "end" && (
          <div className="space-y-3">
            <p className="text-sm font-medium">اختر وقت نهاية الإضافي</p>
            <div className="grid grid-cols-2 gap-3">
              {endOptions.map((time) => (
                <Button
                  key={time}
                  onClick={() => handleEndTime(time)}
                  variant={endTime === time ? "primary" : "outline"}
                  className="h-14"
                >
                  {formatTime12Hour(time)}
                </Button>
              ))}
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-[rgb(var(--muted-foreground))]">
                  وقت مخصص
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => handleEndTime(e.target.value)}
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 py-3 text-center"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "range" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs">من</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-3 text-center"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">إلى</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-3 text-center"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "duration" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setDurationHours((h) => Math.max(0, h - 1))
                }
                className="rounded-xl bg-[rgb(var(--muted))] p-3"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-bold">{durationHours}</span>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  ساعة
                </p>
              </div>
              <button
                onClick={() => setDurationHours((h) => h + 1)}
                className="rounded-xl bg-[rgb(var(--muted))] p-3"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  setDurationMinutes((m) => (m - 15 + 60) % 60)
                }
                className="rounded-xl bg-[rgb(var(--muted))] p-3"
              >
                <Minus className="h-5 w-5" />
              </button>
              <div className="text-center">
                <span className="text-2xl font-bold">{durationMinutes}</span>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  دقيقة
                </p>
              </div>
              <button
                onClick={() => setDurationMinutes((m) => (m + 15) % 60)}
                className="rounded-xl bg-[rgb(var(--muted))] p-3"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl bg-[rgb(var(--muted))] p-4 text-center">
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            إجمالي الإضافي
          </p>
          <p className="text-2xl font-bold text-[rgb(var(--primary))]">
            {Math.floor(currentMinutes / 60)}:{String(currentMinutes % 60).padStart(2, "0")} ساعة
          </p>
          <p className="text-lg font-semibold">
            {amount.toLocaleString("en-US")} {settings.currencyName}
          </p>
        </div>

        <div className="mt-3">
          <label className="mb-1 flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            ملاحظة (اختياري)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: جرد المخزن"
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 py-3"
          />
        </div>

        <div className="mt-3">
          <label className="mb-1 block text-sm">سعر الساعة</label>
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-4 py-3"
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            <Clock className="h-5 w-5" />
            حفظ
          </Button>
        </div>
      </div>
    </div>
  );
}
