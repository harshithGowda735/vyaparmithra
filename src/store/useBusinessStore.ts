import { create } from 'zustand';
import { 
  BusinessProfile, 
  KPICard, 
  Scheme, 
  VaultFolder, 
  ActivityLog, 
  SimulationScenario, 
  GrowthDataPoint, 
  RoadmapStep,
  DocumentDraft 
} from '../types';
import { 
  getDashboard, 
  getRoadmap, 
  runSimulation, 
  runInvestigation,
  DashboardResponse,
  RoadmapResponse,
  SimulationResponse,
  SimulationRequest,
  checkHealth
} from '../services/api';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  time: string;
}

interface BackendStatus {
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: string | null;
}

interface BusinessStore {
  activeTab: 'landing' | 'dashboard' | 'interview' | 'investigation' | 'schemes' | 'roadmap' | 'vault' | 'simulator' | 'settings';
  profile: BusinessProfile;
  isRecording: boolean;
  recordingText: string;
  isThinking: boolean;
  thinkingProgress: number;
  selectedScenarioId: string;
  vaultFolders: VaultFolder[];
  activityLogs: ActivityLog[];
  roadmapSteps: RoadmapStep[];
  
  // Theme & Notifications
  theme: 'dark' | 'light';
  notifications: AppNotification[];
  
  // Backend data
  businessId: number;
  backendStatus: BackendStatus;
  dashboardData: DashboardResponse | null;
  roadmapData: RoadmapResponse | null;
  simulationResult: SimulationResponse | null;
  isLoadingDashboard: boolean;
  isLoadingRoadmap: boolean;
  isSimulating: boolean;
  investigationLogs: string[];

  // Actions
  setActiveTab: (tab: 'landing' | 'dashboard' | 'interview' | 'investigation' | 'schemes' | 'roadmap' | 'vault' | 'simulator' | 'settings') => void;
  updateProfile: (updates: Partial<BusinessProfile>) => void;
  setRecording: (recording: boolean) => void;
  setRecordingText: (text: string) => void;
  triggerDeepInvestigation: (inputText: string, callback?: () => void) => void;
  selectScenario: (id: string) => void;
  uploadFileToVault: (folderId: string, filename: string, sizeKb: number) => void;
  toggleRoadmapStep: (stepId: string) => void;
  resetAll: () => void;
  
  // UI Actions
  toggleTheme: () => void;
  addNotification: (title: string, message: string) => void;
  markNotificationsRead: () => void;
  
  // Backend Actions
  setBusinessId: (id: number) => void;
  checkBackendHealth: () => Promise<boolean>;
  fetchDashboard: () => Promise<void>;
  fetchRoadmap: () => Promise<void>;
  runScenarioSimulation: (payload: SimulationRequest) => Promise<SimulationResponse | null>;
  addInvestigationLog: (log: string) => void;
}

const defaultProfile: BusinessProfile = {
  name: "Ramesh Kumar",
  industry: "Food",
  revenue: "₹1.8L",
  employees: 12,
  location: "Mysore",
  healthScore: 82
};

const initialFolders: VaultFolder[] = [
  { id: 'f-gst', name: 'GST', fileCount: 12, status: 'verified', info: 'Updated 2d ago', iconName: 'FolderOpen' },
  { id: 'f-pan', name: 'PAN', fileCount: 2, status: 'verified', info: 'Verified', iconName: 'Badge' },
  { id: 'f-udyam', name: 'Udyam', fileCount: 1, status: 'verified', info: 'Active Status', iconName: 'Wallet' },
  { id: 'f-sales', name: 'Sales', fileCount: 48, status: 'verified', info: 'Q3 Ready', iconName: 'TrendingUp' },
  { id: 'f-invoices', name: 'Invoices', fileCount: 156, status: 'pending', info: 'Processing', iconName: 'Receipt' },
  { id: 'f-loans', name: 'Loans', fileCount: 4, status: 'verified', info: '4 Docs • 1 Active', iconName: 'Landmark' },
];

const initialLogs: ActivityLog[] = [
  { id: 'log-1', filename: 'GSTR-3B_May.pdf', type: 'upload', actionText: 'Uploaded by AI Coach', timeAgo: '1h ago' },
  { id: 'log-2', filename: 'Udyam Verification', type: 'api', actionText: 'Auto-verified via MSME API', timeAgo: '4h ago' },
  { id: 'log-3', filename: 'Loan_Dossier.zip', type: 'export', actionText: 'Exported for SBI Loan App', timeAgo: '1d ago' },
];

const initialRoadmap: RoadmapStep[] = [
  { id: 'step-1', dayNumber: 1, title: 'Setup', description: 'Register GST and complete MSME Udyam registration for legal compliance.', status: 'COMPLETED', iconName: 'AppRegistration' },
  { id: 'step-2', dayNumber: 5, title: 'Digital Launch', description: 'Launch WhatsApp Business API and integrate automated catalog responses.', status: 'IN_PROGRESS', iconName: 'MessageSquare' },
  { id: 'step-3', dayNumber: 30, title: 'Scale', description: 'Achieve target efficiency with a projected +16% revenue growth.', status: 'UPCOMING', iconName: 'TrendingUp' },
];

export const useBusinessStore = create<BusinessStore>((set, get) => ({
  activeTab: 'landing',
  profile: defaultProfile,
  isRecording: false,
  recordingText: '"I run a restaurant in Mysore with about a dozen staff members, doing around 1.8 Lakh in monthly sales..."',
  isThinking: false,
  thinkingProgress: 0,
  selectedScenarioId: 'scenario-machine',
  vaultFolders: initialFolders,
  activityLogs: initialLogs,
  roadmapSteps: initialRoadmap,
  
  // Theme & Notifications default
  theme: 'dark',
  notifications: [
    { id: 'notif-1', title: 'Welcome to VyaparMitra', message: 'Your business profile is ready.', isRead: false, time: 'Just now' }
  ],
  
  // Backend state
  businessId: 1,
  backendStatus: { isConnected: false, isChecking: false, lastChecked: null },
  dashboardData: null,
  roadmapData: null,
  simulationResult: null,
  isLoadingDashboard: false,
  isLoadingRoadmap: false,
  isSimulating: false,
  investigationLogs: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  updateProfile: (updates) => set((state) => ({ profile: { ...state.profile, ...updates } })),
  setRecording: (recording) => set({ isRecording: recording }),
  setRecordingText: (text) => set({ recordingText: text }),
  
  // UI Actions implementations
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  addNotification: (title, message) => set((state) => ({
    notifications: [{
      id: `notif-${Date.now()}`,
      title,
      message,
      isRead: false,
      time: 'Just now'
    }, ...state.notifications]
  })),
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, isRead: true }))
  })),
  
  triggerDeepInvestigation: (inputText, callback) => {
    set({ isThinking: true, activeTab: 'investigation', thinkingProgress: 0, investigationLogs: [] });
    
    const { businessId } = get();
    
    // Try real backend investigation first
    runInvestigation(
      businessId,
      (event) => {
        const progress = Math.min(Math.round(event.progress * 100), 99);
        set((state) => ({
          thinkingProgress: progress,
          investigationLogs: [...state.investigationLogs, `[${event.stage.toUpperCase()}] ${event.message}`]
        }));
      },
      () => {
        // Completed
        const text = inputText.toLowerCase();
        const parsedUpdates: Partial<BusinessProfile> = {};
        
        if (text.includes('restaurant') || text.includes('cafe') || text.includes('coffee') || text.includes('food')) {
          parsedUpdates.industry = "Food";
        } else if (text.includes('retail') || text.includes('shop') || text.includes('store')) {
          parsedUpdates.industry = "Retail";
        } else if (text.includes('manufacturing') || text.includes('factory') || text.includes('workshop')) {
          parsedUpdates.industry = "Manufacturing";
        }
        
        const empMatch = text.match(/(\d+)\s*(staff|employ|people|worker)/);
        if (empMatch) parsedUpdates.employees = parseInt(empMatch[1], 10);
        
        const revMatch = text.match(/([\d\.]+)\s*(lakh|l|k|thousand)/);
        if (revMatch) {
          const num = parseFloat(revMatch[1]);
          parsedUpdates.revenue = text.includes('lakh') || text.includes(' l') ? `₹${num}L` : `₹${num}K`;
        }
        
        if (text.includes('mysore') || text.includes('mysuru')) parsedUpdates.location = "Mysore";
        else if (text.includes('bangalore') || text.includes('bengaluru')) parsedUpdates.location = "Bangalore";
        else if (text.includes('delhi')) parsedUpdates.location = "Delhi";
        else if (text.includes('mumbai')) parsedUpdates.location = "Mumbai";

        parsedUpdates.healthScore = Math.min(98, get().profile.healthScore + 2);
        
        set((state) => ({ 
          isThinking: false, 
          activeTab: 'dashboard', 
          thinkingProgress: 100,
          profile: { ...state.profile, ...parsedUpdates } 
        }));
        
        if (callback) callback();
      },
      (_err) => {
        // Fallback to simulated if backend unavailable
        const interval = setInterval(() => {
          const currentProgress = get().thinkingProgress;
          if (currentProgress < 95) {
            set((state) => ({ 
              thinkingProgress: currentProgress + Math.floor(Math.random() * 8) + 4,
              investigationLogs: [
                ...state.investigationLogs,
                `[SYSTEM] Analyzing business data... ${currentProgress}%`
              ]
            }));
          } else {
            clearInterval(interval);
            set({ thinkingProgress: 100 });
            
            setTimeout(() => {
              const text = inputText.toLowerCase();
              const parsedUpdates: Partial<BusinessProfile> = {};
              
              if (text.includes('restaurant') || text.includes('cafe') || text.includes('food')) parsedUpdates.industry = "Food";
              else if (text.includes('retail') || text.includes('shop')) parsedUpdates.industry = "Retail";
              else if (text.includes('manufacturing') || text.includes('factory')) parsedUpdates.industry = "Manufacturing";
              
              const empMatch = text.match(/(\d+)\s*(staff|employ|people|worker)/);
              if (empMatch) parsedUpdates.employees = parseInt(empMatch[1], 10);
              
              const revMatch = text.match(/([\d\.]+)\s*(lakh|l|k|thousand)/);
              if (revMatch) {
                const num = parseFloat(revMatch[1]);
                parsedUpdates.revenue = text.includes('lakh') || text.includes(' l') ? `₹${num}L` : `₹${num}K`;
              }
              
              if (text.includes('mysore')) parsedUpdates.location = "Mysore";
              else if (text.includes('bangalore')) parsedUpdates.location = "Bangalore";
              
              parsedUpdates.healthScore = Math.min(98, get().profile.healthScore + 2);
              
              set((state) => ({ 
                isThinking: false, 
                activeTab: 'dashboard', 
                profile: { ...state.profile, ...parsedUpdates } 
              }));
              
              if (callback) callback();
            }, 1000);
          }
        }, 250);
      }
    );
  },

  selectScenario: (id) => set({ selectedScenarioId: id }),
  
  uploadFileToVault: (folderId, filename, sizeKb) => {
    set((state) => {
      const updatedFolders = state.vaultFolders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, fileCount: folder.fileCount + 1, info: 'Updated just now' };
        }
        return folder;
      });

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        filename,
        type: 'upload',
        actionText: 'Uploaded securely',
        timeAgo: 'Just now'
      };

      return { vaultFolders: updatedFolders, activityLogs: [newLog, ...state.activityLogs] };
    });
  },

  toggleRoadmapStep: (stepId) => {
    set((state) => ({
      roadmapSteps: state.roadmapSteps.map(step => {
        if (step.id === stepId) {
          const nextStatusMap: Record<RoadmapStep['status'], RoadmapStep['status']> = {
            'COMPLETED': 'UPCOMING',
            'IN_PROGRESS': 'COMPLETED',
            'UPCOMING': 'IN_PROGRESS'
          };
          return { ...step, status: nextStatusMap[step.status] };
        }
        return step;
      })
    }));
  },

  resetAll: () => set({
    activeTab: 'landing',
    profile: defaultProfile,
    isRecording: false,
    recordingText: '"I run a restaurant in Mysore with about a dozen staff members, doing around 1.8 Lakh in monthly sales..."',
    isThinking: false,
    thinkingProgress: 0,
    selectedScenarioId: 'scenario-machine',
    vaultFolders: initialFolders,
    activityLogs: initialLogs,
    roadmapSteps: initialRoadmap,
    dashboardData: null,
    roadmapData: null,
    simulationResult: null,
    investigationLogs: [],
  }),

  // ── Backend Actions ──────────────────────────────────────────────────────────
  setBusinessId: (id) => set({ businessId: id }),

  checkBackendHealth: async () => {
    set((state) => ({ backendStatus: { ...state.backendStatus, isChecking: true } }));
    const isConnected = await checkHealth();
    set({ backendStatus: { isConnected, isChecking: false, lastChecked: new Date().toISOString() } });
    return isConnected;
  },

  fetchDashboard: async () => {
    const { businessId } = get();
    set({ isLoadingDashboard: true });
    try {
      const data = await getDashboard(businessId);
      set({ dashboardData: data });
      // Sync health score from backend
      if (data.health_score) {
        set((state) => ({ profile: { ...state.profile, healthScore: data.health_score } }));
      }
    } catch (err) {
      console.warn('[Store] fetchDashboard failed, using local data:', err);
    } finally {
      set({ isLoadingDashboard: false });
    }
  },

  fetchRoadmap: async () => {
    const { businessId } = get();
    set({ isLoadingRoadmap: true });
    try {
      const data = await getRoadmap(businessId);
      set({ roadmapData: data });
      // Map backend roadmap tasks to frontend roadmap steps
      const steps: RoadmapStep[] = data.tasks.slice(0, 8).map((task, idx) => ({
        id: `step-${idx + 1}`,
        dayNumber: task.day,
        title: task.task.split(' ').slice(0, 3).join(' '),
        description: task.task,
        status: task.status === 'done' ? 'COMPLETED' : task.status === 'in_progress' ? 'IN_PROGRESS' : 'UPCOMING',
        iconName: 'Sparkles'
      }));
      if (steps.length > 0) {
        set({ roadmapSteps: steps });
      }
    } catch (err) {
      console.warn('[Store] fetchRoadmap failed, using local data:', err);
    } finally {
      set({ isLoadingRoadmap: false });
    }
  },

  runScenarioSimulation: async (payload) => {
    set({ isSimulating: true, simulationResult: null });
    try {
      const result = await runSimulation(payload);
      set({ simulationResult: result });
      return result;
    } catch (err) {
      console.warn('[Store] runSimulation failed:', err);
      return null;
    } finally {
      set({ isSimulating: false });
    }
  },

  addInvestigationLog: (log) => {
    set((state) => ({ investigationLogs: [...state.investigationLogs, log] }));
  },
}));
