import * as React from "react";
const ThemeContext = React.createContext({
  theme: "dark",
  toggleTheme: () => {
  }
});
const THEME_STORAGE_KEY = "syncora-theme";
const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.classList.toggle('dark',t!=='light');document.documentElement.dataset.theme=t;}catch(e){document.documentElement.classList.add('dark');}})();`;
const TRANSITION_MS = 1400;
function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset["theme"] = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
  }
}
function ThemeProvider({ children }) {
  const [theme, setTheme] = React.useState("dark");
  React.useEffect(() => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(current);
  }, []);
  const toggleTheme = React.useCallback(
    (origin) => {
      const next = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;
      const x = origin?.x ?? window.innerWidth - 48;
      const y = origin?.y ?? 48;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      const startViewTransition = document.startViewTransition?.bind(document);
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!startViewTransition || prefersReduced) {
        applyTheme(next);
        setTheme(next);
        return;
      }
      const reversing = next === "light";
      root.classList.toggle("theme-reversing", reversing);
      const transition = startViewTransition(() => {
        applyTheme(next);
        setTheme(next);
      });
      transition.ready.then(() => {
        const from = `circle(0px at ${x}px ${y}px)`;
        const to = `circle(${radius}px at ${x}px ${y}px)`;
        root.animate(
          { clipPath: reversing ? [to, from] : [from, to] },
          {
            duration: TRANSITION_MS,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            pseudoElement: reversing ? "::view-transition-old(root)" : "::view-transition-new(root)"
          }
        );
      });
      transition.finished.finally(() => {
        root.classList.remove("theme-reversing");
      });
    },
    [theme]
  );
  const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
function useTheme() {
  return React.useContext(ThemeContext);
}
export {
  THEME_STORAGE_KEY,
  ThemeProvider,
  themeInitScript,
  useTheme
};
