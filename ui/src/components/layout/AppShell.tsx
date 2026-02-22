import type { ReactNode } from "react";
import { useEffect } from "react";
import Header from "./Header";
import SubNav from "./SubNav";
import TerminusBar from "./TerminusBar";
import { GodSidebar } from "../shared/GodSidebar";
import { useHealthCheck } from "../../hooks/useHealthCheck";
import { useStatus } from "../../hooks/useStatus";

interface AppShellProps { children: ReactNode; }

export default function AppShell({ children }: AppShellProps) {
  const { healthy, loading: healthLoading, error: healthError, lastChecked, check } = useHealthCheck();
  const { status, loading: statusLoading, error: statusError, refresh: refreshStatus } = useStatus();

  useEffect(() => {
    check(); refreshStatus();
    const interval = setInterval(() => { check(); refreshStatus(); }, 10000);
    return () => clearInterval(interval);
  }, [check, refreshStatus]);

  const statusProps = { healthy, healthLoading, healthError, lastChecked, status, statusLoading, statusError, onRefreshHealth: check, onRefreshStatus: refreshStatus };

  return (
    <>
      <GodSidebar activeGod="omega" />
      <div className="god-sidebar-content flex flex-col">
        <div className="gold-thread" />
        <Header />
        <SubNav />
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto">{children}</main>
        <TerminusBar {...statusProps} />
      </div>
    </>
  );
}
