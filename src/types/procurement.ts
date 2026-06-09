export interface VendorData {
  id: string;
  name: string;
  price: number;
  warranty: string;
  rating: number;
  scores: {
    price: number;
    quality: number;
    reliability: number;
    overall: number;
  };
  reasoning: string;
}

export interface AgentState {
  id: string;
  name: string;
  type: 'parser' | 'api' | 'llm' | 'blockchain';
  status: 'idle' | 'running' | 'completed' | 'failed';
  output: string;
  extractedData?: {
    [key: string]: any;
  };
}

export interface ProcurementRequest {
  id: string;
  productName: string;
  budget: number;
  vendorUrls: string[];
  status: 'pending' | 'processing' | 'completed';
  createdAt: number;
  vendors?: VendorData[];
  agents?: AgentState[];
  winnerId?: string;
  txHash?: string;
  timestamp?: number;
}

export interface DashboardStats {
  totalRequests: number;
  pendingReviews: number;
  completedReviews: number;
  averageSavings: number;
}
