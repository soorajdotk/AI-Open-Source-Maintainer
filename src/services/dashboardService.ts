import type { ProcurementRequest } from "../types/procurement";

export interface DashboardMetrics {
  totalRequests: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  successfulRecommendations: number;
}

export function calculateDashboardMetrics(requests: ProcurementRequest[]): DashboardMetrics {
  const totalRequests = requests.length;
  
  const completedAnalyses = requests.filter(r => r.status === 'completed').length;
  
  const pendingAnalyses = requests.filter(r => r.status === 'pending' || r.status === 'processing').length;
  
  // Recommendations are successful if overall evaluation is generated
  const successfulRecommendations = requests.filter(
    r => r.status === 'completed' && r.winnerId !== undefined
  ).length;

  return {
    totalRequests,
    completedAnalyses,
    pendingAnalyses,
    successfulRecommendations
  };
}
