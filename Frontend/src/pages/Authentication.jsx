import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock, Mail, User, KeyRound, CheckCircle2, AlertCircle, Video } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [formState, setFormState] = React.useState(0);

  const navigate = useNavigate();
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  let handleAuth = async () => {
    if (loading) return;
    setLoading(true);
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        setError("");
        navigate({ to: "/" });
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setUsername("");
        setMessage(result || "Registration successful!");
        setError("");
        setFormState(0);
        setPassword("");
      }
    } catch (err) {
      let errMsg = err.response?.data?.message || err.message || "Something went wrong";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleAuth();
  };

  const isSignIn = formState === 0;

  return (
    <main className="night relative min-h-screen overflow-hidden">
      {/* Ambient gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-veil)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center gap-10 px-5 py-12 lg:flex-row lg:gap-16">
        {/* Brand panel */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md text-center lg:text-left"
        >
          <div className="flex items-center justify-center gap-3 lg:justify-start">
            <Logo className="h-9" />
            <ThemeToggle className="lg:ml-auto" />
          </div>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1.5 text-xs text-ink-soft">
            <Video className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Syncora secure meetings
          </div>
          <h1 className="mt-5 font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            Meet <span className="text-gradient">face to face</span>, anywhere.
          </h1>
          <p className="mt-4 text-base text-ink-muted">
            Peer-to-peer HD video with end-to-end simplicity. Sign in to keep your meeting history in sync.
          </p>
        </motion.section>

        {/* Auth card */}
        <motion.section
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="glass w-full max-w-md rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <div
              className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Lock className="h-5 w-5 text-on-brand" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">
                {isSignIn ? "Welcome back" : "Create your account"}
              </h2>
              <p className="truncate text-sm text-ink-muted">
                {isSignIn ? "Sign in to continue" : "It only takes a moment"}
              </p>
            </div>
          </div>

          {/* Segmented toggle */}
          <div
            role="tablist"
            aria-label="Authentication mode"
            className="relative mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-hairline p-1"
          >
            {["Sign In", "Sign Up"].map((label, i) => (
              <button
                key={label}
                type="button"
                role="tab"
                aria-selected={formState === i}
                onClick={() => {
                  setFormState(i);
                  setError("");
                  setMessage("");
                }}
                className="relative z-10 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft transition-colors aria-selected:text-ink"
              >
                {formState === i && (
                  <motion.span
                    layoutId="auth-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-xl"
                    style={{ background: "var(--gradient-brand)" }}
                    aria-hidden="true"
                  />
                )}
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <AnimatePresence initial={false} mode="popLayout">
              {!isSignIn && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Label htmlFor="fullname" className="text-ink-soft">
                    Full name
                  </Label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
                      aria-hidden="true"
                    />
                    <Input
                      id="fullname"
                      name="name"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ada Lovelace"
                      className="h-11 border-hairline bg-[var(--fill)] pl-9 text-ink placeholder:text-ink-muted"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-ink-soft">
                Username
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <Input
                  id="username"
                  name="username"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your-username"
                  className="h-11 border-hairline bg-[var(--fill)] pl-9 text-ink placeholder:text-ink-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-ink-soft">
                Password
              </Label>
              <div className="relative">
                <KeyRound
                  className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-muted"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete={isSignIn ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 border-hairline bg-[var(--fill)] pl-9 text-ink placeholder:text-ink-muted"
                />
              </div>
            </div>

            <div aria-live="polite" className="min-h-5">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.p
                    key={error}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {error}
                  </motion.p>
                )}
                {!error && message && (
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-sm text-aqua"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {message}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="h-11 w-full rounded-xl border-0 text-on-brand hover:opacity-90"
              style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-lift)" }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {loading ? "Please wait…" : isSignIn ? "Login" : "Register"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-ink-muted">
            By continuing you agree to Syncora&apos;s terms and privacy policy.
          </p>
        </motion.section>
      </div>
    </main>
  );
}
