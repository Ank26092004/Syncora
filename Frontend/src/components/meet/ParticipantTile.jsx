import { motion } from "framer-motion";
import { MicOff, Pin, Signal, Loader2 } from "lucide-react";
import { useSpeaking } from "./useSpeaking";

function Initials({ label }) {
  const initials = (label || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="grid h-16 w-16 place-items-center rounded-full text-lg font-semibold text-on-brand"
      style={{ background: "var(--gradient-brand)" }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

/** Animated audio-level ring shown while a participant is speaking. */
function SpeakingRing({ speaking, level }) {
  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-3xl ring-2 ring-inset"
      animate={{
        opacity: speaking ? 1 : 0,
        boxShadow: speaking
          ? `0 0 ${18 + level * 60}px color-mix(in oklab, var(--aqua) 60%, transparent)`
          : "0 0 0px transparent",
      }}
      transition={{ duration: 0.18 }}
      style={{ "--tw-ring-color": "var(--aqua)" }}
    />
  );
}

function Bars({ level, active }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-0.5 rounded-full bg-aqua"
          animate={{ height: active ? 4 + level * 22 * (i === 1 ? 1.4 : 1) : 3 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
        />
      ))}
    </span>
  );
}

export function ParticipantTile({
  label,
  stream,
  videoRefCallback,
  muted = false,
  mirrored = false,
  cameraOff = false,
  micOff = false,
  isLocal = false,
  isScreen = false,
  connecting = false,
  className = "",
}) {
  const { speaking, level } = useSpeaking(stream, !micOff);

  return (
    <motion.figure
      layout
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 12 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={`glass group relative aspect-video overflow-hidden rounded-3xl ${className}`}
    >
      <video
        ref={videoRefCallback}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          cameraOff ? "opacity-0" : "opacity-100"
        } ${mirrored ? "-scale-x-100" : ""}`}
      />

      {(cameraOff || connecting) && (
        <div className="absolute inset-0 grid place-items-center gap-3">
          <div className="flex flex-col items-center gap-3">
            {connecting ? (
              <Loader2 className="h-7 w-7 animate-spin text-ink-soft" aria-hidden="true" />
            ) : (
              <Initials label={label} />
            )}
            <span className="text-xs text-ink-muted">
              {connecting ? "Connecting…" : "Camera off"}
            </span>
          </div>
        </div>
      )}

      <SpeakingRing speaking={speaking} level={level} />

      <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-[var(--scrim)] to-transparent px-3 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium text-ink">
            {label}
            {isLocal ? " (you)" : ""}
          </span>
          {isScreen && (
            <span className="shrink-0 rounded-full border border-hairline px-2 py-0.5 text-[10px] tracking-wide text-ink-soft uppercase">
              Sharing
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {micOff ? (
            <MicOff className="h-4 w-4 text-destructive" aria-label="Microphone off" />
          ) : (
            <Bars level={level} active={speaking} />
          )}
          <Signal className="h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        </span>
      </figcaption>

      <span className="pointer-events-none absolute top-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Pin className="h-4 w-4 text-ink-soft" aria-hidden="true" />
      </span>
    </motion.figure>
  );
}
