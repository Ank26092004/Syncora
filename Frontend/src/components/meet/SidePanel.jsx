import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/** Sliding glass drawer used for chat, participants and captions. */
export function SidePanel({ open, onClose, title, icon: Icon, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key={title}
          initial={{ x: "100%", opacity: 0.4 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.4 }}
          transition={{ type: "spring", stiffness: 320, damping: 34 }}
          className="glass fixed inset-y-0 right-0 z-40 flex w-full max-w-sm flex-col rounded-none sm:inset-y-3 sm:right-3 sm:rounded-3xl"
          role="dialog"
          aria-label={title}
        >
          <header className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3">
            <h2 className="flex min-w-0 items-center gap-2 text-sm font-semibold text-ink">
              {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />}
              <span className="truncate">{title}</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors hover:bg-[var(--fill-2)] hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>

          {footer && <div className="border-t border-hairline p-3">{footer}</div>}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
