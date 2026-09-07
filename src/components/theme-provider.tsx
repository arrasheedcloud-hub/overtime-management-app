"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPrimaryColorValue } from "@/lib/settings";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [primaryColor, setPrimaryColorState] = useState<string>("blue");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedColor = localStorage.getItem("primaryColor") || "blue";
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    setPrimaryColorState(savedColor);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      let resolved: "light" | "dark" = "light";
      if (theme === "dark") resolved = "dark";
      else if (theme === "light") resolved = "light";
      else resolved = media.matches ? "dark" : "light";

      setResolvedTheme(resolved);
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const root = window.document.documentElement;
    root.classList.remove(
      "theme-green",
      "theme-purple",
      "theme-orange",
      "theme-red",
      "theme-teal"
    );
    if (primaryColor !== "blue") {
      root.classList.add(`theme-${primaryColor}`);
    }
    localStorage.setItem("primaryColor", primaryColor);
  }, [primaryColor, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        primaryColor,
        setPrimaryColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
