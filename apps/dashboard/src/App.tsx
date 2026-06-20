import { RefreshCw, ShieldCheck, TriangleAlert } from "lucide-react";
import React, { type ReactElement } from "react";
import { useCallback, useEffect, useState } from "react";
import type { KrnDashboardData } from "@krn/contracts";
import { fetchDashboardData } from "./dashboard-data.js";
import { PendingReviewDashboard } from "./PendingReviewDashboard.js";
import { PromotionReviewDashboard } from "./PromotionReviewDashboard.js";

type DashboardState =
  | { state: "loading" }
  | { state: "ready"; dashboardData: KrnDashboardData }
  | { state: "error"; message: string };

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown dashboard data error";
}

export function App(): ReactElement {
  const [dashboardState, setDashboardState] = useState<DashboardState>({ state: "loading" });

  const load = useCallback(async () => {
    setDashboardState({ state: "loading" });
    try {
      setDashboardState({ state: "ready", dashboardData: await fetchDashboardData() });
    } catch (error: unknown) {
      setDashboardState({ state: "error", message: errorMessage(error) });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <ShieldCheck size={20} strokeWidth={2} />
        </div>
        <div className="topbar-title">
          <p>KRN</p>
          <h1>Control Plane</h1>
        </div>
        <button className="icon-button" type="button" onClick={() => void load()} aria-label="Reload dashboard data">
          <RefreshCw size={18} strokeWidth={2} />
        </button>
      </header>

      {dashboardState.state === "loading" ? (
        <main className="dashboard-status" aria-live="polite">
          <div className="status-pulse" aria-hidden="true" />
          <p>Loading control-plane data</p>
        </main>
      ) : null}

      {dashboardState.state === "error" ? (
        <main className="dashboard-status dashboard-status--error" role="alert">
          <TriangleAlert size={20} strokeWidth={2} />
          <p>{dashboardState.message}</p>
        </main>
      ) : null}

      {dashboardState.state === "ready" ? (
        <>
          <PendingReviewDashboard viewModel={dashboardState.dashboardData.pending_review} />
          <PromotionReviewDashboard viewModel={dashboardState.dashboardData.promotion_review} />
        </>
      ) : null}
    </div>
  );
}
