import { parseKrnPendingReviewViewModel, type KrnPendingReviewViewModel } from "@krn/contracts";

export function parseDashboardData(input: unknown): KrnPendingReviewViewModel {
  return parseKrnPendingReviewViewModel(input);
}

export async function fetchDashboardData(fetcher: typeof fetch = globalThis.fetch): Promise<KrnPendingReviewViewModel> {
  const response = await fetcher("/krn-dashboard-data.json", {
    headers: {
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Dashboard data request failed with ${response.status}`);
  }

  const payload: unknown = await response.json();
  return parseDashboardData(payload);
}
