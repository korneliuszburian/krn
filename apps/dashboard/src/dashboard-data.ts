import { parseKrnDashboardData, type KrnDashboardData } from "@krn/contracts";

export function parseDashboardData(input: unknown): KrnDashboardData {
  return parseKrnDashboardData(input);
}

export async function fetchDashboardData(fetcher: typeof fetch = globalThis.fetch): Promise<KrnDashboardData> {
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
