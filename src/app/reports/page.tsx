"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import {
  FileText,
  Printer,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  formatDisplayDate,
  formatTime12Hour,
  formatHoursMinutes,
  formatCurrency,
  getStartOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  addDays,
  getWeekDayName,
} from "@/lib/utils";
import { fetchRecords, fetchSettings } from "@/lib/client-api";
import { saveRecordsLocal, saveSettingsLocal } from "@/lib/offline-store";
import type { AppSettings, OvertimeRecord } from "@/lib/types";
import { toast } from "sonner";

type ReportType = "daily" | "weekly" | "monthly" | "range";

export default function ReportsPage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<ReportType>("monthly");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fromDate, setFromDate] = useState(
    formatDate(getStartOfMonth(new Date()))
  );
  const [toDate, setToDate] = useState(formatDate(new Date()));
  const reportRef = useRef<HTMLDivElement>(null);

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

  const reportData = useMemo(() => {
    let start: Date;
    let end: Date;

    if (reportType === "daily") {
      start = new Date(selectedDate);
      end = new Date(selectedDate);
    } else if (reportType === "weekly") {
      start = getStartOfWeek(selectedDate);
      end = addDays(start, 6);
    } else if (reportType === "monthly") {
      start = getStartOfMonth(selectedDate);
      end = getEndOfMonth(selectedDate);
    } else {
      start = new Date(fromDate);
      end = new Date(toDate);
    }

    const filtered = records.filter((r) => {
      const d = new Date(r.recordDate);
      return d >= start && d <= end;
    });

    const totalMinutes = filtered.reduce((sum, r) => sum + r.minutes, 0);
    const totalAmount = filtered.reduce((sum, r) => sum + r.amount, 0);

    const dayMap = new Map<string, { minutes: number; amount: number }>();
    filtered.forEach((r) => {
      const existing = dayMap.get(r.recordDate) || { minutes: 0, amount: 0 };
      dayMap.set(r.recordDate, {
        minutes: existing.minutes + r.minutes,
        amount: existing.amount + r.amount,
      });
    });

    return {
      start,
      end,
      records: filtered,
      totalMinutes,
      totalAmount,
      daysCount: dayMap.size,
      dayBreakdown: Array.from(dayMap.entries()).map(([date, stats]) => ({
        date,
        ...stats,
      })),
    };
  }, [records, reportType, selectedDate, fromDate, toDate]);

  const handlePrint = () => {
    window.print();
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate);
    if (reportType === "daily") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (reportType === "weekly") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (reportType === "monthly") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setSelectedDate(newDate);
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
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">التقارير</h1>
        <Button size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          طباعة / PDF
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { key: "daily", label: "يومي" },
          { key: "weekly", label: "أسبوعي" },
          { key: "monthly", label: "شهري" },
          { key: "range", label: "فترة" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setReportType(t.key as ReportType)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              reportType === t.key
                ? "bg-[rgb(var(--primary))] text-white"
                : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {reportType !== "range" && (
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-[rgb(var(--card))] p-3">
          <button
            onClick={() => navigateDate("prev")}
            className="rounded-lg bg-[rgb(var(--muted))] p-2"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <span className="font-semibold">
            {reportType === "daily" && formatDisplayDate(selectedDate)}
            {reportType === "weekly" &&
              `${formatDisplayDate(reportData.start)} - ${formatDisplayDate(
                reportData.end
              )}`}
            {reportType === "monthly" &&
              selectedDate.toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
              })}
          </span>
          <button
            onClick={() => navigateDate("next")}
            className="rounded-lg bg-[rgb(var(--muted))] p-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {reportType === "range" && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-[rgb(var(--card))] p-3">
          <div>
            <label className="mb-1 block text-xs">من</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs">إلى</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-2"
            />
          </div>
        </div>
      )}

      <div
        ref={reportRef}
        className="rounded-3xl bg-[rgb(var(--card))] p-5 shadow-sm print:shadow-none"
      >
        <div className="mb-6 border-b border-[rgb(var(--border))] pb-4 text-center print:border-black">
          <h2 className="text-xl font-bold">تقرير العمل الإضافي</h2>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            {reportType === "daily" && formatDisplayDate(reportData.start)}
            {reportType === "weekly" &&
              `${formatDisplayDate(reportData.start)} - ${formatDisplayDate(
                reportData.end
              )}`}
            {reportType === "monthly" &&
              reportData.start.toLocaleDateString("ar-SA", {
                year: "numeric",
                month: "long",
              })}
            {reportType === "range" &&
              `${formatDisplayDate(reportData.start)} - ${formatDisplayDate(
                reportData.end
              )}`}
          </p>
          <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
            تاريخ إنشاء التقرير: {formatDisplayDate(new Date())}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[rgb(var(--muted))] p-4 text-center">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              إجمالي أيام الإضافي
            </p>
            <p className="text-2xl font-bold">{reportData.daysCount}</p>
          </div>
          <div className="rounded-2xl bg-[rgb(var(--muted))] p-4 text-center">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              إجمالي الساعات
            </p>
            <p className="text-xl font-bold">
              {formatHoursMinutes(reportData.totalMinutes)}
            </p>
          </div>
          <div className="rounded-2xl bg-[rgb(var(--muted))] p-4 text-center">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              سعر الساعة
            </p>
            <p className="text-lg font-bold">
              {formatCurrency(settings.hourlyRate)} {settings.currencyName}
            </p>
          </div>
          <div className="rounded-2xl bg-[rgb(var(--primary))]/10 p-4 text-center">
            <p className="text-xs text-[rgb(var(--primary))]">
              إجمالي المبلغ
            </p>
            <p className="text-xl font-bold text-[rgb(var(--primary))]">
              {formatCurrency(reportData.totalAmount)} {settings.currencyName}
            </p>
          </div>
        </div>

        <h3 className="mb-3 font-bold">التفاصيل</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))]">
                <th className="py-3 text-right">التاريخ</th>
                <th className="py-3 text-right">اليوم</th>
                <th className="py-3 text-right">البداية</th>
                <th className="py-3 text-right">النهاية</th>
                <th className="py-3 text-right">الساعات</th>
                <th className="py-3 text-right">القيمة</th>
              </tr>
            </thead>
            <tbody>
              {reportData.records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-[rgb(var(--border))] last:border-0"
                >
                  <td className="py-3">{record.recordDate}</td>
                  <td className="py-3">
                    {getWeekDayName(new Date(record.recordDate))}
                  </td>
                  <td className="py-3">{formatTime12Hour(record.startTime)}</td>
                  <td className="py-3">{formatTime12Hour(record.endTime)}</td>
                  <td className="py-3">
                    {formatHoursMinutes(record.minutes)}
                  </td>
                  <td className="py-3 font-medium text-[rgb(var(--primary))]">
                    {formatCurrency(record.amount)} {settings.currencyName}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[rgb(var(--border))] font-bold">
                <td colSpan={4} className="py-3">
                  الإجمالي
                </td>
                <td className="py-3">
                  {formatHoursMinutes(reportData.totalMinutes)}
                </td>
                <td className="py-3 text-[rgb(var(--primary))]">
                  {formatCurrency(reportData.totalAmount)} {settings.currencyName}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {reportData.dayBreakdown.length > 0 && reportType !== "daily" && (
          <div className="mt-6">
            <h3 className="mb-3 font-bold">الملخص اليومي</h3>
            <div className="space-y-2">
              {reportData.dayBreakdown.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between rounded-xl bg-[rgb(var(--muted))] p-3"
                >
                  <span>{formatDisplayDate(new Date(day.date))}</span>
                  <div className="text-left">
                    <span className="font-bold">
                      {formatHoursMinutes(day.minutes)}
                    </span>
                    <span className="mr-3 text-sm text-[rgb(var(--muted-foreground))]">
                      {formatCurrency(day.amount)} {settings.currencyName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          nav,
          header,
          .mb-4.flex,
          .mb-4.grid,
          button {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          main > div:last-child {
            box-shadow: none !important;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </main>
  );
}
