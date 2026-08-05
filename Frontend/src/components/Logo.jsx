import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
function Logo({ className }) {
  const { theme } = useTheme();
  return <img
    src={theme === "dark" ? logoDark : logoLight}
    alt="Syncora"
    width={1160}
    height={400}
    className={cn("h-9 w-auto select-none", className)}
    draggable={false}
  />;
}
var stdin_default = Logo;
export {
  Logo,
  stdin_default as default
};
