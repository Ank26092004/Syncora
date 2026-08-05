import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Cast,
  Lock,
  MessageSquare,
  Mic,
  Sparkles,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroP2P from "@/assets/hero-p2p.jpg";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Syncora" },
      {
        name: "description",
        content: "Syncora is a premium video meeting platform. Start an HD call in one click, share your screen, chat live, and join as a guest with a single meeting code."
      },
      { property: "og:title", content: "Syncora \u2014 Instant HD video meetings" },
      {
        property: "og:description",
        content: "Start an HD video call in one click. Screen share, live chat, and guest access with a single meeting code."
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" }
    ]
  }),
  component: Landing
});
const ease = [0.22, 1, 0.36, 1];
function Landing() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [token, setToken] = useState(null);
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);
  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      navigate({ to: "/$url", params: { url: meetingCode.trim() } });
    }
  };
  const handleJoinAsGuest = () => {
    const randomCode = Math.random().toString(36).substring(2, 8);
    navigate({ to: "/$url", params: { url: randomCode } });
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  return <div className="night relative min-h-screen overflow-hidden font-sans">
      <div
    aria-hidden
    className="pointer-events-none absolute inset-x-0 top-0 h-[900px]"
    style={{ background: "var(--gradient-veil)" }}
  />

      <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-8 sm:h-9" />
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Button
    variant="ghost"
    onClick={handleJoinAsGuest}
    className="rounded-full text-ink-soft hover:bg-[var(--fill)] hover:text-ink"
  >
            Join as Guest
          </Button>

          {!token ? <>
              <Button
    variant="ghost"
    onClick={() => navigate({ to: "/auth" })}
    className="hidden rounded-full text-ink-soft hover:bg-[var(--fill)] hover:text-ink sm:inline-flex"
  >
                Register
              </Button>
              <Button
    onClick={() => navigate({ to: "/auth" })}
    className="rounded-full border border-hairline bg-[var(--fill-2)] px-5 text-ink hover:bg-[var(--fill-3)]"
  >
                Login
              </Button>
            </> : <Button
    onClick={handleLogout}
    className="rounded-full border border-hairline bg-[var(--fill-2)] px-5 text-ink hover:bg-[var(--fill-3)]"
  >
              Logout
            </Button>}
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6">
        <section className="pt-16 pb-10 text-center sm:pt-24">
          <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease }}
    className="mx-auto flex w-fit items-center gap-2 rounded-full border border-hairline bg-[var(--fill)] px-3.5 py-1.5 text-xs tracking-wide text-ink-soft"
  >
            <Sparkles className="h-3.5 w-3.5 text-aqua" />
            Real-time meetings, engineered for calm
          </motion.div>

          <motion.h1
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.06, ease }}
    className="mx-auto mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-7xl"
  >
            Distance, <span className="text-gradient">dissolved</span>.
          </motion.h1>

          <motion.p
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.12, ease }}
    className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg"
  >
            One code is all it takes. Crystal-clear video, screen sharing and live
            chat — open in the browser, no download, no friction.
          </motion.p>

          <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.18, ease }}
    className="mx-auto mt-9 flex w-full max-w-md flex-col items-center gap-3"
  >
            <div className="glass flex w-full items-center gap-2 rounded-full p-1.5">
              <Input
    value={meetingCode}
    onChange={(e) => setMeetingCode(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && handleJoinMeeting()}
    placeholder="Enter meeting code"
    aria-label="Meeting code"
    className="h-11 flex-1 border-0 bg-transparent px-4 font-mono text-sm text-ink shadow-none placeholder:text-ink-muted focus-visible:ring-0"
  />
              <Button
    onClick={handleJoinMeeting}
    className="h-11 shrink-0 rounded-full px-6 font-medium text-on-brand hover:opacity-90"
    style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-lift)" }}
  >
                Join
              </Button>
            </div>
            <Link
    to="/auth"
    className="group inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
  >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </section>

        <motion.section
    initial={{ opacity: 0, y: 40, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.9, delay: 0.24, ease }}
    className="relative mt-6"
  >
          <div className="glass overflow-hidden rounded-[28px] p-2">
            <img
    src={heroP2P}
    alt="Syncora one-to-one video call with two participants and a glass control bar"
    width={1408}
    height={912}
    className="w-full rounded-[20px]"
  />
          </div>
        </motion.section>

        <section className="grid gap-4 py-24 sm:grid-cols-2 lg:grid-cols-4">
          {[
    {
      icon: Video,
      title: "HD by default",
      body: "Adaptive video that stays sharp on any connection."
    },
    {
      icon: Cast,
      title: "Screen sharing",
      body: "Present a tab, a window or your whole desktop instantly."
    },
    {
      icon: MessageSquare,
      title: "Live chat",
      body: "Messages travel alongside the call, in real time."
    },
    {
      icon: Lock,
      title: "Private rooms",
      body: "Every meeting code opens its own isolated room."
    }
  ].map((f, i) => <motion.div
    key={f.title}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.5, delay: i * 0.06, ease }}
    className="glass rounded-2xl p-6"
  >
              <f.icon className="h-5 w-5 text-aqua" strokeWidth={1.8} />
              <h3 className="mt-4 text-base font-medium tracking-tight text-ink">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{f.body}</p>
            </motion.div>)}
        </section>

        <motion.section
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.6, ease }}
    className="glass relative overflow-hidden rounded-[28px] px-8 py-16 text-center"
  >
          <div
    aria-hidden
    className="pointer-events-none absolute inset-0 opacity-60"
    style={{ background: "var(--gradient-veil)" }}
  />
          <div className="relative">
            <Mic className="mx-auto h-5 w-5 text-brand-soft" strokeWidth={1.8} />
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-ink sm:text-4xl">
              Your next meeting starts now
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted sm:text-base">
              Spin up a room in a second — no account required to try it.
            </p>
            <Button
    onClick={handleJoinAsGuest}
    className="mt-8 h-12 rounded-full px-8 text-base font-medium text-on-brand hover:opacity-90"
    style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-lift)" }}
  >
              Start a meeting
            </Button>
          </div>
        </motion.section>

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-hairline py-8 text-sm text-ink-muted sm:flex-row">
          <span>© {(/* @__PURE__ */ new Date()).getFullYear()} Syncora</span>
          <button
    onClick={handleJoinAsGuest}
    className="transition-colors hover:text-ink"
  >
            Join as Guest
          </button>
        </footer>
      </main>
    </div>;
}
export {
  Route
};
