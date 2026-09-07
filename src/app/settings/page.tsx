"use client";

import { useEffect, useState, useRef } from "react";
import {
  Save,
  Moon,
  Sun,
  Monitor,
  Bell,
  Download,
  Upload,
  Trash2,
  Clock,
  Palette,
  Briefcase,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchSettings, saveSettings, exportBackup, importBackup } from "@/lib/client-api";
import { saveSettingsLocal, saveRecordsLocal, exportBackupLocal, importBackupLocal } from "@/lib/offline-store";
import { weekDays, primaryColors } from "@/lib/settings";
import { useTheme } from "@/components/theme-provider";
import type { AppSettings, BackupData } from "@/lib/types";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setTheme, setPrimaryColor, theme, primaryColor } = useTheme();

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchSettings();
        setSettings(data);
        saveSettingsLocal(data);
        setTheme(data.theme);
        setPrimaryColor(data.primaryColor);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("فشل تحميل الإعدادات");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setTheme, setPrimaryColor]);

  const updateSettings = async (newSettings: AppSettings) => {
    setSaving(true);
    try {
      await saveSettings(newSettings);
      setSettings(newSettings);
      saveSettingsLocal(newSettings);
      setTheme(newSettings.theme);
      setPrimaryColor(newSettings.primaryColor);
      toast.success("تم حفظ الإعدادات بنجاح");
    } catch (error) {
      toast.error("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleWorkScheduleChange = (
    day: keyof AppSettings["workSchedule"],
    field: keyof AppSettings["workSchedule"][typeof day],
    value: string | boolean
  ) => {
    if (!settings) return;
    const updated = {
      ...settings,
      workSchedule: {
        ...settings.workSchedule,
        [day]: {
          ...settings.workSchedule[day],
          [field]: value,
        },
      },
    };
    setSettings(updated);
  };

  const handleExport = async () => {
    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `overtime_backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير النسخة الاحتياطية");
    } catch (error) {
      toast.error("فشل تصدير النسخة الاحتياطية");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = JSON.parse(text) as BackupData;

      if (!backup.settings || !Array.isArray(backup.records)) {
        throw new Error("ملف غير صالح");
      }

      await importBackup(backup);
      setSettings(backup.settings);
      saveSettingsLocal(backup.settings);
      saveRecordsLocal(backup.records);
      setTheme(backup.settings.theme);
      setPrimaryColor(backup.settings.primaryColor);
      toast.success(`تم استيراد ${backup.records.length} سجل بنجاح`);
    } catch (error) {
      toast.error("ملف النسخة الاحتياطية غير صالح");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteAll = async () => {
    try {
      const empty = { ...settings!, notifications: { ...settings!.notifications } };
      await saveSettings(empty);
      await fetch("/api/backup/import", {
        method: "POST",
        body: JSON.stringify({
          version: 1,
          exportedAt: new Date().toISOString(),
          settings: empty,
          records: [],
        }),
      });
      saveSettingsLocal(empty);
      saveRecordsLocal([]);
      setShowDeleteConfirm(false);
      toast.success("تم حذف جميع البيانات");
    } catch (error) {
      toast.error("فشل حذف البيانات");
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
      <header className="mb-4">
        <h1 className="text-xl font-bold">الإعدادات</h1>
      </header>

      <div className="space-y-4">
        {/* Work Schedule */}
        <section className="rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <Briefcase className="h-5 w-5 text-[rgb(var(--primary))]" />
            إعدادات الدوام
          </div>
          <div className="space-y-3">
            {weekDays.map(({ key, label }) => (
              <div
                key={key}
                className="rounded-xl bg-[rgb(var(--muted))] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settings.workSchedule[key].isWorkDay}
                      onChange={(e) =>
                        handleWorkScheduleChange(key, "isWorkDay", e.target.checked)
                      }
                      className="h-4 w-4 accent-[rgb(var(--primary))]"
                    />
                    يوم عمل
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))]">
                      انتهاء الدوام
                    </label>
                    <input
                      type="time"
                      value={settings.workSchedule[key].officialEnd}
                      onChange={(e) =>
                        handleWorkScheduleChange(key, "officialEnd", e.target.value)
                      }
                      className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-2 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[rgb(var(--muted-foreground))]">
                      نهاية الإضافي
                    </label>
                    <input
                      type="time"
                      value={settings.workSchedule[key].overtimeEnd}
                      onChange={(e) =>
                        handleWorkScheduleChange(key, "overtimeEnd", e.target.value)
                      }
                      className="w-full rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-2 py-2 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wage */}
        <section className="rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <DollarSign className="h-5 w-5 text-[rgb(var(--primary))]" />
            إعدادات الأجر
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[rgb(var(--muted-foreground))]">
                سعر الساعة
              </label>
              <input
                type="number"
                value={settings.hourlyRate}
                onChange={(e) =>
                  setSettings({ ...settings, hourlyRate: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-3"
              />
            </div>
            <div>
              <label className="block text-xs text-[rgb(var(--muted-foreground))]">
                اسم العملة
              </label>
              <input
                type="text"
                value={settings.currencyName}
                onChange={(e) =>
                  setSettings({ ...settings, currencyName: e.target.value })
                }
                className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-3"
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <Palette className="h-5 w-5 text-[rgb(var(--primary))]" />
            إعدادات المظهر
          </div>
          <div className="mb-4">
            <label className="mb-2 block text-sm">الوضع</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: "light", label: "فاتح", icon: Sun },
                { key: "dark", label: "داكن", icon: Moon },
                { key: "system", label: "تلقائي", icon: Monitor },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() =>
                    setSettings({ ...settings, theme: t.key as typeof settings.theme })
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-colors ${
                    settings.theme === t.key
                      ? "bg-[rgb(var(--primary))] text-white"
                      : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm">اللون الرئيسي</label>
            <div className="flex flex-wrap gap-2">
              {primaryColors.map((color) => (
                <button
                  key={color.key}
                  onClick={() =>
                    setSettings({ ...settings, primaryColor: color.key })
                  }
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
                    settings.primaryColor === color.key
                      ? "ring-2 ring-[rgb(var(--primary))]"
                      : ""
                  }`}
                  style={{ backgroundColor: `${color.value}20`, color: color.value }}
                >
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <Bell className="h-5 w-5 text-[rgb(var(--primary))]" />
            الإشعارات
          </div>
          <div className="mb-3 flex items-center justify-between">
            <span>تفعيل التذكير اليومي</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    notifications: {
                      ...settings.notifications,
                      enabled: e.target.checked,
                    },
                  })
                }
                className="peer sr-only"
              />
              <div className="h-6 w-11 rounded-full bg-gray-300 peer-checked:bg-[rgb(var(--primary))]" />
              <div className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-all peer-checked:right-5.5" />
            </label>
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs text-[rgb(var(--muted-foreground))]">
              وقت التذكير
            </label>
            <input
              type="time"
              value={settings.notifications.time}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notifications: {
                    ...settings.notifications,
                    time: e.target.value,
                  },
                })
              }
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--background))] px-3 py-3"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-[rgb(var(--muted-foreground))]">
              أيام التذكير
            </label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map(({ key, label }) => (
                <label
                  key={key}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-xs ${
                    settings.notifications.days.includes(key)
                      ? "bg-[rgb(var(--primary))] text-white"
                      : "bg-[rgb(var(--muted))] text-[rgb(var(--muted-foreground))]"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={settings.notifications.days.includes(key)}
                    onChange={(e) => {
                      const days = e.target.checked
                        ? [...settings.notifications.days, key]
                        : settings.notifications.days.filter((d) => d !== key);
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, days },
                      });
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Backup */}
        <section className="rounded-3xl bg-[rgb(var(--card))] p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2 font-bold">
            <Download className="h-5 w-5 text-[rgb(var(--primary))]" />
            النسخ الاحتياطي
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4" />
              تصدير
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              استيراد
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </section>

        {/* Save */}
        <Button
          onClick={() => updateSettings(settings)}
          disabled={saving}
          size="lg"
          className="w-full"
        >
          <Save className="h-5 w-5" />
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>

        {/* Delete All */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-[rgb(var(--danger))] hover:bg-[rgb(var(--danger))]/10"
        >
          <Trash2 className="h-4 w-4" />
          حذف جميع البيانات
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-[rgb(var(--card))] p-5">
            <h3 className="text-lg font-bold text-[rgb(var(--danger))]">
              حذف جميع البيانات
            </h3>
            <p className="mt-2 text-[rgb(var(--muted-foreground))]">
              سيتم حذف جميع سجلات الإضافي والإعدادات. لا يمكن التراجع عن هذا
              الإجراء.
            </p>
            <div className="mt-4 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                إلغاء
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDeleteAll}
              >
                حذف الكل
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
