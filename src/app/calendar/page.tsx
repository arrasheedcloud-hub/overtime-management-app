"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Banknote,
  CalendarX,
} from "lucide-react";
import { fetchRecords, fetchSettings } from "@/lib/client-api";
import { saveRecordsLocal, saveSettingsLocal } from "@/lib/offline-store";
import {
  formatDate,
  formatDisplayDate,
  formatHoursMinutes,
  formatCurrency,
  getWeekDayName,
  getWeekDayKey,
} from "@/lib/utils";
import type { AppSettings, OvertimeRecord } from "@/lib/types";
import { toast } from "sonner";

export default function CalendarPage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [settingsData, recordsData] = await Promise.all([
          fetchSettings(),
          fetchRecords({ order: "asc" }),
        ]);
        setSettings(settingsData);
        setRecords(recordsData);
        saveSettingsLocal(settingsData);
        saveRecordsLocal(recordsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        toast.error("فشل تحميل البيانات");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = (firstDay.getDay() + 1) % 7; // Saturday start
    const days: { date: Date; padding: boolean }[] = [];

    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), padding: true });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), padding: false });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), padding: true });
    }

    return days;
  }, [year, month]);

  const recordsByDate = useMemo(() => {
    const map = new Map<string, OvertimeRecord[]>();
    records.forEach((r) => {
      const list = map.get(r.recordDate) || [];
      list.push(r);
      map.set(r.recordDate, list);
    });
    return map;
  }, [records]);

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(year, month + (direction === "next" ? 1 : -1), 1));
    setSelectedDate(null);
  };

  const getDayStatus = (date: Date) => {
    const dateStr = formatDate(date);
    const dayRecords = recordsByDate.get(dateStr) || [];
    const dayKey = getWeekDayKey(date) as keyof AppSettings["workSchedule"];
    const isWorkDay = settings?.workSchedule[dayKey]?.isWorkDay ?? true;

    if (dayRecords.length > 0) return "overtime";
    if (!isWorkDay) return "off";
    return "normal";
  };

  const selectedRecords = selectedDate
    ? recordsByDate.get(formatDate(selectedDate)) || []
    : [];

  if (loading || !settings) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <header className="mb-4">
        <h1 className="text-xl font-bold">التقويم</h1>
      </header>

      <div className="mb-4 flex items-center justify-between rounded-2xl bg-[rgb(var(--card))] p-3">
        <button
          onClick={() => navigateMonth("prev")}
          className="rounded-lg bg-[rgb(var(--muted))] p-2"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <span className="font-semibold">
          {currentDate.toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
          })}
        </span>
        <button
          onClick={() => navigateMonth("next")}
          className="rounded-lg bg-[rgb(var(--muted))] p-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-[rgb(var(--muted-foreground))]">
          {["سب", "أح", "اث", "ثل", "أر", "خم", "جم"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, padding }, index) => {
            const status = getDayStatus(date);
            const isSelected = selectedDate
              ? formatDate(date) === formatDate(selectedDate)
              : false;

            return (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                disabled={padding}
                className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                  padding
                    ? "text-transparent"
                    : status === "overtime"
                    ? "bg-[rgb(var(--success))]/10 text-[rgb(var(--success))]"
                    : status === "off"
                    ? "bg-[rgb(var(--primary))]/10 text-[rgb(var(--primary))]"
                    : "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]"
                } ${
                  isSelected
                    ? "ring-2 ring-[rgb(var(--primary))]"
                    : ""
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-[rgb(var(--success))]" />
            <span>إضافي</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-[rgb(var(--primary))]" />
            <span>إجازة</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-[rgb(var(--muted))]" />
            <span>عادي</span>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="mt-4 rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <h3 className="mb-3 font-bold">
            {getWeekDayName(selectedDate)} {formatDisplayDate(selectedDate)}
          </h3>

          {selectedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-[rgb(var(--muted-foreground))]">
              <CalendarX className="mb-2 h-8 w-8" />
              <p>لا يوجد إضافي مسجل لهذا اليوم</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl bg-[rgb(var(--muted))] p-3"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[rgb(var(--primary))]" />
                    <span>
                      {formatHoursMinutes(record.minutes)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-[rgb(var(--primary))]">
                    <Banknote className="h-4 w-4" />
                    {formatCurrency(record.amount)} {settings.currencyName}
                  </div>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-[rgb(var(--border))] pt-2 font-bold">
                <span>الإجمالي</span>
                <span className="text-[rgb(var(--primary))]">
                  {formatCurrency(
                    selectedRecords.reduce((sum, r) => sum + r.amount, 0)
                  )}{" "}
                  {settings.currencyName}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
