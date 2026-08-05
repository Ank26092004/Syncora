import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  return <button
    type="button"
    onClick={(e) => {
      const r = e.currentTarget.getBoundingClientRect();
      toggleTheme({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }}
    aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    className={cn(
      "relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-hairline bg-[var(--fill)] text-ink-soft transition-colors hover:bg-[var(--fill-2)] hover:text-ink",
      className
    )}
  >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
    key={isDark ? "moon" : "sun"}
    initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
    animate={{ opacity: 1, rotate: 0, scale: 1 }}
    exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="grid place-items-center"
  >
          {isDark ? <Moon className="h-4 w-4" aria-hidden="true" /> : <Sun className="h-4 w-4" aria-hidden="true" />}
        </motion.span>
      </AnimatePresence>
    </button>;
}
var stdin_default = ThemeToggle;
export {
  ThemeToggle,
  stdin_default as default
};
