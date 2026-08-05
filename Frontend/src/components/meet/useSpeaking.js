import { useEffect, useState } from "react";

/**
 * UI-only helper: analyses an existing MediaStream's audio to drive the
 * animated "speaking" indicator. It never mutates or re-negotiates the stream.
 */
export function useSpeaking(stream, enabled = true) {
  const [speaking, setSpeaking] = useState(false);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!enabled || !stream || typeof window === "undefined") {
      setSpeaking(false);
      setLevel(0);
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!stream.getAudioTracks || stream.getAudioTracks().length === 0) return;

    let raf;
    let ctx;
    let source;
    let cancelled = false;

    try {
      ctx = new AudioCtx();
      source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (cancelled) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
        const rms = Math.sqrt(sum / data.length) / 255;
        setLevel(rms);
        setSpeaking(rms > 0.06);
        raf = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      return;
    }

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      try {
        source?.disconnect();
        ctx?.close();
      } catch {
        /* noop */
      }
    };
  }, [stream, enabled]);

  return { speaking, level };
}
