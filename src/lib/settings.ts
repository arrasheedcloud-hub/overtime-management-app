import type { AppSettings, WorkSchedule, WeekDay } from "./types";

export const defaultWorkSchedule: WorkSchedule = {
  saturday: { isWorkDay: true, officialEnd: "14:00", overtimeEnd: "17:00" },
  sunday: { isWorkDay: true, officialEnd: "14:00", overtimeEnd: "17:00" },
  monday: { isWorkDay: true, officialEnd: "14:00", overtimeEnd: "17:00" },
  tuesday: { isWorkDay: true, officialEnd: "14:00", overtimeEnd: "17:00" },
  wednesday: { isWorkDay: true, officialEnd: "14:00", overtimeEnd: "17:00" },
  thursday: { isWorkDay: true, officialEnd: "13:00", overtimeEnd: "16:00" },
  friday: { isWorkDay: false, officialEnd: "14:00", overtimeEnd: "17:00" },
};

export const defaultSettings: AppSettings = {
  hourlyRate: 1500,
  currency: "YER",
  currencyName: "ريال يمني",
  workSchedule: defaultWorkSchedule,
  theme: "system",
  primaryColor: "blue",
  notifications: {
    enabled: false,
    time: "17:30",
    days: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
    ],
  },
};

export const weekDays: { key: WeekDay; label: string }[] = [
  { key: "saturday", label: "السبت" },
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الاثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
];

export const primaryColors: { key: string; label: string; value: string }[] = [
  { key: "blue", label: "أزرق", value: "#2563eb" },
  { key: "green", label: "أخضر", value: "#16a34a" },
  { key: "purple", label: "بنفسجي", value: "#9333ea" },
  { key: "orange", label: "برتقالي", value: "#ea580c" },
  { key: "red", label: "أحمر", value: "#dc2626" },
  { key: "teal", label: "تركوازي", value: "#0d9488" },
];

export function getSettingsWithDefaults(data: Partial<AppSettings>): AppSettings {
  return {
    ...defaultSettings,
    ...data,
    workSchedule: {
      ...defaultWorkSchedule,
      ...(data.workSchedule || {}),
    },
    notifications: {
      ...defaultSettings.notifications,
      ...(data.notifications || {}),
    },
  };
}

export function getPrimaryColorValue(key: string): string {
  return primaryColors.find((c) => c.key === key)?.value || primaryColors[0].value;
}
