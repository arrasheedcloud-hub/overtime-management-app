"use client";

import { useEffect } from "react";
import { fetchSettings } from "@/lib/client-api";
import { saveSettingsLocal } from "@/lib/offline-store";
import { getWeekDayKey } from "@/lib/utils";
import type { AppSettings } from "@/lib/types";

export function NotificationManager() {
  useEffect(() => {
    async function requestPermission() {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    }
    requestPermission();

    const interval = setInterval(async () => {
      try {
        const settings = await fetchSettings();
        saveSettingsLocal(settings);
        checkAndNotify(settings);
      } catch {
        // offline
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
}

function checkAndNotify(settings: AppSettings) {
  if (!settings.notifications.enabled) return;
  if ("Notification" in window && Notification.permission !== "granted") return;

  const now = new Date();
  const dayKey = getWeekDayKey(now) as keyof AppSettings["workSchedule"];
  if (!settings.notifications.days.includes(dayKey)) return;

  const [notifyH, notifyM] = settings.notifications.time.split(":").map(Number);
  const currentH = now.getHours();
  const currentM = now.getMinutes();

  if (currentH === notifyH && currentM === notifyM) {
    const lastNotified = localStorage.getItem("last_notification_time");
    const currentTimeKey = `${now.toDateString()}_${notifyH}_${notifyM}`;
    if (lastNotified === currentTimeKey) return;

    localStorage.setItem("last_notification_time", currentTimeKey);
    new Notification("تذكير بالإضافي", {
      body: "لا تنسَ تسجيل ساعات العمل الإضافي لليوم.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
    });
  }
}
