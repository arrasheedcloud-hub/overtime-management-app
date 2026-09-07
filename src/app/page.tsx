"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Clock,
  Banknote,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/quick-add-modal";
import {
  formatDate,
  formatDisplayDate,
  formatTime12Hour,
  formatHoursMinutes,
  getWeekDayKey,
  getWeekDayName,
  getStartOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  formatCurrency,
} from "@/lib/utils";
import { fetchRecords, createRecord, fetchSettings } from "@/lib/client-api";
import { saveRecordsLocal, loadRecordsLocal, saveSettingsLocal } from "@/lib/offline-store";
import type { AppSettings, OvertimeRecord } from "@/lib/types";
import { toast } from "sonner";

export default function HomePage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [settingsData, recordsData] = await Promise.all([
          fetchSettings(),
          fetchRecords({ order: "desc" }),
        ]);
        setSettings(settingsData);
        setRecords(recordsData);
        saveSettingsLocal(settingsData);
        saveRecordsLocal(recordsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        const localRecords = loadRecordsLocal();
        setRecords(localRecords);
        toast.error("فشل تحميل البيانات من الخادم، تم استخدام البيانات المحلية");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const today = new Date();
  const todayStr = formatDate(today);
  const dayKey = getWeekDayKey(today) as keyof AppSettings["workSchedule"];
  const daySchedule = settings?.workSchedule[dayKey];

  const todayRecords = useMemo(
    () => records.filter((r) => r.recordDate === todayStr),
    [records, todayStr]
  );

  const todayStats = useMemo(() => {
    const minutes = todayRecords.reduce((sum, r) => sum + r.minutes, 0);
    const amount = todayRecords.reduce((sum, r) => sum + r.amount, 0);
    return { minutes, amount };
  }, [todayRecords]);

  const weekStats = useMemo(() => {
    const startOfWeek = getStartOfWeek(today);
    const weekRecords = records.filter((r) => {
      const d = new Date(r.recordDate);
      return d >= startOfWeek && d <= today;
    });
    const minutes = weekRecords.reduce((sum, r) => sum + r.minutes, 0);
    const amount = weekRecords.reduce((sum, r) => sum + r.amount, 0);
    return { minutes, amount, days: weekRecords.length };
  }, [records, today]);

  const monthStats = useMemo(() => {
    const startOfMonth = getStartOfMonth(today);
    const endOfMonth = getEndOfMonth(today);
    const monthRecords = records.filter((r) => {
      const d = new Date(r.recordDate);
      return d >= startOfMonth && d <= endOfMonth;
    });
    const minutes = monthRecords.reduce((sum, r) => sum + r.minutes, 0);
    const amount = monthRecords.reduce((sum, r) => sum + r.amount, 0);
    return { minutes, amount, days: monthRecords.length };
  }, [records, today]);

  const handleSave = async (record: {
    recordDate: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    notes?: string;
  }) => {
    try {
      const created = await createRecord(record);
      const updated = [created, ...records];
      setRecords(updated);
      saveRecordsLocal(updated);
      setModalOpen(false);
      toast.success("تم حفظ ساعات الإضافي بنجاح");
    } catch (error) {
      console.error("Failed to create record:", error);
      toast.error(error instanceof Error ? error.message : "فشل حفظ السجل");
    }
  };

  if (loading || !settings) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[rgb(var(--primary))] border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">الرئيسية</h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            {getWeekDayName(today)}، {formatDisplayDate(today)}
          </p>
        </div>
        <div className="rounded-full bg-[rgb(var(--primary))]/10 p-2 text-[rgb(var(--primary))]">
          <Clock className="h-6 w-6" />
        </div>
      </header>

      <section className="mb-6 rounded-3xl bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary))]/80 p-6 text-white shadow-xl">
        <p className="text-sm opacity-90">إضافي اليوم</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold">
            {formatHoursMinutes(todayStats.minutes)}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2 text-lg">
          <Banknote className="h-5 w-5" />
          <span className="font-semibold">
            {formatCurrency(todayStats.amount)} {settings.currencyName}
          </span>
        </div>

        {daySchedule && (
          <div className="mt-4 rounded-2xl bg-white/10 p-3 text-sm">
            <div className="flex justify-between">
              <span>الدوام الرسمي ينتهي</span>
              <span>{formatTime12Hour(daySchedule.officialEnd)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>نهاية الإضافي الافتراضية</span>
              <span>{formatTime12Hour(daySchedule.overtimeEnd)}</span>
            </div>
          </div>
        )}

        <Button
          onClick={() => setModalOpen(true)}
          className="mt-5 w-full bg-white text-[rgb(var(--primary))] hover:bg-white/90"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          إضافة إضافي
        </Button>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs">هذا الأسبوع</span>
          </div>
          <p className="text-lg font-bold">
            {formatHoursMinutes(weekStats.minutes)}
          </p>
          <p className="text-sm font-medium text-[rgb(var(--primary))]">
            {formatCurrency(weekStats.amount)} {settings.currencyName}
          </p>
        </div>

        <div className="rounded-2xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-[rgb(var(--muted-foreground))]">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">هذا الشهر</span>
          </div>
          <p className="text-lg font-bold">
            {formatHoursMinutes(monthStats.minutes)}
          </p>
          <p className="text-sm font-medium text-[rgb(var(--primary))]">
            {formatCurrency(monthStats.amount)} {settings.currencyName}
          </p>
        </div>
      </section>

      {todayRecords.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">سجلات اليوم</h2>
          <div className="space-y-2">
            {todayRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-2xl bg-[rgb(var(--card))] p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium">
                    {formatTime12Hour(record.startTime)} →{" "}
                    {formatTime12Hour(record.endTime)}
                  </p>
                  {record.notes && (
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      {record.notes}
                    </p>
                  )}
                </div>
                <div className="text-left">
                  <p className="font-bold text-[rgb(var(--primary))]">
                    {formatHoursMinutes(record.minutes)}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    {formatCurrency(record.amount)} {settings.currencyName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <QuickAddModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        settings={settings}
        onSave={handleSave}
      />
    </main>
  );
}
