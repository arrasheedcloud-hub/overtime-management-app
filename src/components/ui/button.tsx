"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--ring))] disabled:pointer-events-none disabled:opacity-50",
          variant === "primary" &&
            "bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:opacity-90 active:scale-[0.98]",
          variant === "secondary" &&
            "bg-[rgb(var(--muted))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--border))] active:scale-[0.98]",
          variant === "outline" &&
            "border border-[rgb(var(--border))] bg-transparent hover:bg-[rgb(var(--muted))] active:scale-[0.98]",
          variant === "ghost" &&
            "bg-transparent hover:bg-[rgb(var(--muted))] active:scale-[0.98]",
          variant === "danger" &&
            "bg-[rgb(var(--danger))] text-white hover:opacity-90 active:scale-[0.98]",
          size === "sm" && "h-9 px-3 text-sm",
          size === "md" && "h-11 px-4",
          size === "lg" && "h-14 px-6 text-lg",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
