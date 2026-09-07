"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, Edit2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickAddModal } from "@/components/quick-add-modal";
import {
  formatDisplayDate,
  formatTime12Hour,
  formatHoursMinutes,
  formatCurrency,
  formatDate,
  getStartOfWeek,
  getStartOfMonth,
  getEndOfMonth,
} from "@/lib/utils";
import {
  fetchRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  fetchSettings,
} from "@/lib/client-api";
import { saveRecordsLocal, loadRecordsLocal, saveSettingsLocal } from "@/lib/offline-store";
import type { AppSettings, OvertimeRecord } from "@/lib/types";
import { toast } from "sonner";

export default function RecordsPage() {
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sort, setSort] = useState<"desc" | "asc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [settingsData, recordsData] = await Promise.all([
          fetchSettings(),
          fetchRecords({ order: sort }),
        ]);
        setSettings(settingsData);
        setRecords(recordsData);
        saveSettingsLocal(settingsData);
        saveRecordsLocal(recordsData);
      } catch (error) {
        console.error("Failed to load data:", error);
        setRecords(loadRecordsLocal());
        toast.error("فشل تحميل البيانات من الخادم");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sort]);

  const filteredRecords = useMemo(() => {
    let result = [...records];

    if (filter === "today") {
      const today = formatDate(new Date());
      result = result.filter((r) => r.recordDate === today);
    } else if (filter === "week") {
      const start = getStartOfWeek(new Date());
      result = result.filter((r) => new Date(r.recordDate) >= start);
    } else if (filter === "month") {
      const start = getStartOfMonth(new Date());
      const end = getEndOfMonth(new Date());
      result = result.filter((r) => {
        const d = new Date(r.recordDate);
        return d >= start && d <= end;
      });
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (r) =>
          r.recordDate.includes(term) ||
          (r.notes && r.notes.toLowerCase().includes(term))
      );
    }

    return result;
  }, [records, filter, search]);

  const handleSave = async (record: {
    recordDate: string;
    startTime: string;
    endTime: string;
    hourlyRate: number;
    notes?: string;
  }) => {
    try {
      if (editingRecord) {
        const updated = await updateRecord(editingRecord.id, record);
        const newRecords = records.map((r) =>
          r.id === editingRecord.id ? updated : r
        );
        setRecords(newRecords);
        saveRecordsLocal(newRecords);
        toast.success("تم تعديل السجل بنجاح");
      } else {
        const created = await createRecord(record);
        const newRecords = [created, ...records];
        setRecords(newRecords);
        saveRecordsLocal(newRecords);
        toast.success("تم حفظ ساعات الإضافي بنجاح");
      }
      setModalOpen(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل حفظ السجل");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRecord(deleteId);
      const newRecords = records.filter((r) => r.id !== deleteId);
      setRecords(newRecords);
      saveRecordsLocal(newRecords);
      toast.success("تم حذف السجل");
    } catch (error) {
      toast.error("فشل حذف السجل");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (record: OvertimeRecord) => {
    setEditingRecord(record);
    setModalOpen(true);
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
        <h1 className="text-xl font-bold">سجل الإضافي</h1>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          إضافة
        </Button>
      </header>

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            placeholder="البحث بالتاريخ أو الملاحظة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--card))] py-3 pr-10 pl-4"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "all", label: "الكل" },
            { key: "today", label: "اليوم" },
            { key: "week", label: "الأسبوع" },
            { key: "month", label: "الشهر" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key
                  ? "bg-[rgb(var(--primary))] text-white"
                  : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]"
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setSort(sort === "desc" ? "asc" : "desc")}
            className="mr-auto flex items-center gap-1 rounded-lg bg-[rgb(var(--muted))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))]"
          >
            <Filter className="h-3 w-3" />
            {sort === "desc" ? "الأحدث" : "الأقدم"}
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-[rgb(var(--card))] p-10 text-center">
          <div className="mb-3 rounded-full bg-[rgb(var(--muted))] p-4">
            <Search className="h-6 w-6 text-[rgb(var(--muted-foreground))]" />
          </div>
          <p className="text-[rgb(var(--muted-foreground))]">
            لا توجد سجلات مطابقة
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="rounded-2xl bg-[rgb(var(--card))] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">
                    {formatDisplayDate(new Date(record.recordDate))}
                  </p>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {formatTime12Hour(record.startTime)} →{" "}
                    {formatTime12Hour(record.endTime)}
                  </p>
                  {record.notes && (
                    <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
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
              <div className="mt-3 flex gap-2 border-t border-[rgb(var(--border))] pt-3">
                <button
                  onClick={() => openEdit(record)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[rgb(var(--muted))] py-2 text-sm font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  تعديل
                </button>
                <button
                  onClick={() => setDeleteId(record.id)}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[rgb(var(--danger))]/10 py-2 text-sm font-medium text-[rgb(var(--danger))]"
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <QuickAddModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        settings={settings}
        selectedDate={
          editingRecord ? new Date(editingRecord.recordDate) : undefined
        }
        existingRecord={editingRecord}
        initialStartTime={editingRecord?.startTime}
        initialEndTime={editingRecord?.endTime}
        initialNotes={editingRecord?.notes || undefined}
        onSave={handleSave}
      />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[rgb(var(--card))] p-5">
            <h3 className="text-lg font-bold">تأكيد الحذف</h3>
            <p className="mt-2 text-[rgb(var(--muted-foreground))]">
              هل أنت متأكد من حذف هذا السجل؟
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeleteId(null)}
              >
                إلغاء
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
