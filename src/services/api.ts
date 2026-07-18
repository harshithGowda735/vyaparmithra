/**
 * VyaparMitra API Client
 * ========================
 * Centralized Axios-based API client for all backend endpoints.
 * Base URL: http://localhost:8000/api/v1
 */

import axios from 'axios';

// ─── Base Config ─────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Response Interceptor (error logging) ────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Error]', err?.response?.data || err.message);
    return Promise.reject(err);
  }
);


// ─────────────────────────────────────────────────────────────────────────────
// TYPE DEFINITIONS  (matching backend Pydantic schemas)
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardResponse {
  business_id: number;
  health_score: number;
  revenue: number;
  expenses: number;
  profit: number;
  cash_flow: number;
  growth_pct: number;
  inventory_risk: string;
  charts: Record<string, Array<Record<string, any>>>;
  recent_activity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    timestamp: string;
    status?: string;
  }>;
  recommendations: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    priority: string;
    action_link?: string;
  }>;
}

export interface RoadmapTask {
  day: number;
  task: string;
  priority: string;
  status: string;
  estimated_impact: string;
}

export interface RoadmapResponse {
  business_id: number;
  title: string;
  tasks: RoadmapTask[];
}

export interface SimulationRequest {
  business_id: number;
  scenario: 'hire_employees' | 'buy_machine' | 'increase_price' | 'open_branch' | 'amazon_selling' | 'ondc';
  current_monthly_revenue?: number;
  current_monthly_profit?: number;
  investment_amount?: number;
  recurring_monthly_cost?: number;
  expected_volume_increase_pct?: number;
  price_increase_pct?: number;
}

export interface SimulationResponse {
  scenario: string;
  estimated_revenue_increase: number;
  estimated_profit_increase: number;
  new_monthly_revenue: number;
  new_monthly_profit: number;
  risk: string;
  confidence: number;
  roi_pct: number;
  break_even_months: number;
  summary: string;
}

export interface DocumentGenerationRequest {
  business_id: number;
  tone?: string;
  extra_context?: string;
}

export interface DocumentGenerationResponse {
  business_id: number;
  document_type: string;
  content_markdown: string;
}

export interface VaultDocumentSummary {
  id: number;
  uuid: string;
  original_filename: string;
  display_name?: string;
  document_type: string;
  status: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  tags?: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AnalyticsDashboardResponse {
  business_id: number;
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin_pct: number;
  monthly_trend: Array<Record<string, any>>;
}

export interface InvestigationEvent {
  stage: string;
  message: string;
  progress: number;
  result?: Record<string, any>;
}

export interface BusinessProfile {
  id?: number;
  business_id?: number;
  owner_name?: string;
  business_name: string;
  industry: string;
  stage?: string;
  city?: string;
  state?: string;
  team_size?: number;
  monthly_revenue_band?: string;
  challenges?: string[];
  is_active?: boolean;
}

export interface StorageSummary {
  total_bytes: number;
  total_files: number;
  by_type: Record<string, { count: number; bytes: number }>;
}


// ─────────────────────────────────────────────────────────────────────────────
// API FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = async (businessId: number): Promise<DashboardResponse> => {
  const res = await apiClient.get<DashboardResponse>(`/dashboard/${businessId}`);
  return res.data;
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalyticsDashboard = async (businessId: number): Promise<AnalyticsDashboardResponse> => {
  const res = await apiClient.get<AnalyticsDashboardResponse>(`/analytics/dashboard`, {
    params: { business_id: businessId }
  });
  return res.data;
};

// ── Roadmap ───────────────────────────────────────────────────────────────────
export const getRoadmap = async (businessId: number): Promise<RoadmapResponse> => {
  const res = await apiClient.get<RoadmapResponse>(`/roadmap/${businessId}`);
  return res.data;
};

// ── Simulation ────────────────────────────────────────────────────────────────
export const runSimulation = async (payload: SimulationRequest): Promise<SimulationResponse> => {
  const res = await apiClient.post<SimulationResponse>(`/simulation/run`, payload);
  return res.data;
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const generateBusinessPlan = async (payload: DocumentGenerationRequest): Promise<DocumentGenerationResponse> => {
  const res = await apiClient.post<DocumentGenerationResponse>(`/documents/business-plan`, payload);
  return res.data;
};

export const generateLoanApplication = async (payload: DocumentGenerationRequest): Promise<DocumentGenerationResponse> => {
  const res = await apiClient.post<DocumentGenerationResponse>(`/documents/loan`, payload);
  return res.data;
};

export const generateVendorEmail = async (payload: DocumentGenerationRequest): Promise<DocumentGenerationResponse> => {
  const res = await apiClient.post<DocumentGenerationResponse>(`/documents/vendor-email`, payload);
  return res.data;
};

export const generatePitchDeck = async (payload: DocumentGenerationRequest): Promise<DocumentGenerationResponse> => {
  const res = await apiClient.post<DocumentGenerationResponse>(`/documents/pitch`, payload);
  return res.data;
};

export const generateDPR = async (payload: DocumentGenerationRequest): Promise<DocumentGenerationResponse> => {
  const res = await apiClient.post<DocumentGenerationResponse>(`/documents/dpr`, payload);
  return res.data;
};

// ── Vault ─────────────────────────────────────────────────────────────────────
export const listVaultDocuments = async (
  businessId?: number,
  documentType?: string,
  search?: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<VaultDocumentSummary>> => {
  const res = await apiClient.get<PaginatedResponse<VaultDocumentSummary>>(`/vault/documents`, {
    params: {
      business_id: businessId,
      document_type: documentType,
      search,
      page,
      page_size: pageSize,
    }
  });
  return res.data;
};

export const getVaultStorageSummary = async (businessId?: number): Promise<StorageSummary> => {
  const res = await apiClient.get<StorageSummary>(`/vault/storage`, {
    params: { business_id: businessId }
  });
  return res.data;
};

export const deleteVaultDocument = async (documentId: number): Promise<void> => {
  await apiClient.delete(`/vault/document/${documentId}`);
};

export const uploadVaultDocument = async (formData: FormData): Promise<VaultDocumentSummary> => {
  const res = await apiClient.post<VaultDocumentSummary>(`/vault/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

// ── Investigation (SSE Stream) ─────────────────────────────────────────────────
export const startInvestigationStream = (businessId: number): EventSource => {
  // We use fetch-based SSE for investigation (SSE doesn't support POST natively)
  return new EventSource(`${BASE_URL}/api/v1/investigation/start`);
};

export const runInvestigation = async (
  businessId: number,
  onEvent: (event: InvestigationEvent) => void,
  onComplete: () => void,
  onError: (err: Error) => void
): Promise<void> => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/investigation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
      body: JSON.stringify({ business_id: businessId }),
    });

    if (!response.ok) {
      throw new Error(`Investigation failed: HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            onEvent(data);
          } catch {
            // ignore parse errors
          }
        }
      }
    }
    onComplete();
  } catch (err: any) {
    onError(err);
  }
};

// ── Business Profile ──────────────────────────────────────────────────────────
export const getBusinessProfile = async (businessId: number): Promise<BusinessProfile | null> => {
  try {
    const res = await apiClient.get<BusinessProfile>(`/business/profile/by-business/${businessId}`);
    return res.data;
  } catch {
    return null;
  }
};

export const createBusinessProfile = async (payload: BusinessProfile): Promise<BusinessProfile> => {
  const res = await apiClient.post<BusinessProfile>(`/business/profile`, payload);
  return res.data;
};

// ── Health Check ──────────────────────────────────────────────────────────────
export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    return res.data?.status === 'ok' || res.data?.status === 'degraded' || res.status === 200;
  } catch {
    return false;
  }
};
