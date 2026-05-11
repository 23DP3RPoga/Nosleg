import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-border bg-surface-elevated/60 transition-colors hover:bg-muted ${className}`}
    >
      <span
        className={`inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-foreground text-background shadow-soft transition-transform ${
          isDark ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {isDark ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
}
