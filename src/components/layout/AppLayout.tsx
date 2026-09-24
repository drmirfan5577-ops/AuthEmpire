import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import BottomNav from "./BottomNav";
import SirenAlert from "@/components/features/AlertSiren";
import { useSecurityScanner } from "@/hooks/useSecurityScanner";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { activeSiren, dismissSiren } = useSecurityScanner();
  const hiddenNavRoutes = ["/", "/onboarding", "/lock"];
  const showNav = !hiddenNavRoutes.includes(location.pathname);

  return (
    <div className="app-bg min-h-screen min-h-dvh flex flex-col relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-empire-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-50/40 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-50/20 blur-3xl" />
      </div>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 relative z-10 w-full max-w-2xl mx-auto",
          "lg:max-w-6xl",
          showNav && "pb-24 sm:pb-20"
        )}
      >
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && <BottomNav />}

      {/* Siren Alert Overlay */}
      {activeSiren && (
        <SirenAlert alert={activeSiren} onDismiss={dismissSiren} />
      )}
    </div>
  );
}
