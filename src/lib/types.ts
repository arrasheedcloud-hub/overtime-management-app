export type WeekDay =
  | "saturday"
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday";

export interface DaySchedule {
  isWorkDay: boolean;
  officialEnd: string; // HH:mm
  overtimeEnd: string; // HH:mm
}

export interface WorkSchedule {
  saturday: DaySchedule;
  sunday: DaySchedule;
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:mm
  days: WeekDay[];
}

export interface AppSettings {
  hourlyRate: number;
  currency: string;
  currencyName: string;
  workSchedule: WorkSchedule;
  theme: "light" | "dark" | "system";
  primaryColor: string;
  notifications: NotificationSettings;
}

export interface OvertimeRecord {
  id: number;
  recordDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  minutes: number;
  hourlyRate: number;
  amount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  settings: AppSettings;
  records: OvertimeRecord[];
}
