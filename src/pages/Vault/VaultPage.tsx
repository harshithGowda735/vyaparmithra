import React, { useCallback, useState } from 'react';
import { useBusinessStore } from '../../store/useBusinessStore';
import { useDropzone } from 'react-dropzone';
import BusinessCore3D from '../../components/BusinessCore3D';
import { 
  FolderLock, 
  Lock, 
  UploadCloud, 
  Plus, 
  Cpu, 
  FolderCheck,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  Trash2,
  FolderOpen,
  Database,
  Search,
  Sparkles,
  RefreshCw,
  FileText,
  X,
  CheckCircle2,
  Link,
  Terminal,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function VaultPage() {
  const { 
    vaultFolders, 
    activityLogs, 
    uploadFileToVault,
    profile,
    updateProfile
  } = useBusinessStore();

  const [activeFolderId, setActiveFolderId] = useState<string>('f-gst');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Live FastAPI Upload State ---
  const [uploadMode, setUploadMode] = useState<'simulated' | 'live'>('simulated');
  const [backendUrl, setBackendUrl] = useState<string>('http://localhost:8000');
  const [businessId, setBusinessId] = useState<number>(1);
  const [documentType, setDocumentType] = useState<string>('gst_certificate');
  const [displayName, setDisplayName] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadResponse, setUploadResponse] = useState<any | null>(null);

  const DOCUMENT_TYPES = [
    { value: 'gst_certificate', label: 'GST Certificate' },
    { value: 'pan_card', label: 'PAN Card' },
    { value: 'udyam_certificate', label: 'MSME Udyam Certificate' },
    { value: 'msme_certificate', label: 'MSME Certificate' },
    { value: 'shop_license', label: 'Shop License' },
    { value: 'fssai_license', label: 'FSSAI License' },
    { value: 'trade_license', label: 'Trade License' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'cancelled_cheque', label: 'Cancelled Cheque' },
    { value: 'incorporation_cert', label: 'Certificate of Incorporation' },
    { value: 'moa_aoa', label: 'MOA / AOA' },
    { value: 'sales_csv', label: 'Sales Data (CSV)' },
    { value: 'expense_csv', label: 'Expense Data (CSV)' },
    { value: 'inventory_csv', label: 'Inventory Data (CSV)' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'profit_loss', label: 'Profit & Loss Statement' },
    { value: 'itr_document', label: 'Income Tax Return (ITR)' },
    { value: 'aadhar_card', label: 'Aadhar Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'voter_id', label: 'Voter ID' },
    { value: 'other', label: 'Other Document' }
  ];

  const mapDocTypeToFolderId = (docType: string): string => {
    if (docType === 'gst_certificate') return 'f-gst';
    if (docType === 'pan_card') return 'f-pan';
    if (docType === 'udyam_certificate' || docType === 'msme_certificate') return 'f-udyam';
    if (docType === 'sales_csv') return 'f-sales';
    if (docType === 'expense_csv' || docType === 'inventory_csv' || docType === 'balance_sheet' || docType === 'profit_loss') return 'f-invoices';
    return 'f-loans';
  };

  const handleLiveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select or drop a file first.');
      return;
    }

    setIsUploading(true);
    setUploadResponse(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('document_type', documentType);
    formData.append('business_id', String(businessId));
    formData.append('display_name', displayName || selectedFile.name);
    
    if (description) {
      formData.append('description', description);
    }
    if (tags) {
      formData.append('tags', tags);
    }
    if (expiryDate) {
      formData.append('expiry_date', expiryDate);
    }

    const cleanBaseUrl = backendUrl.trim().replace(/\/+$/, '');
    const uploadUrl = `${cleanBaseUrl}/api/v1/vault/upload`;

    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || errData?.detail || `HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setUploadResponse({ success: true, data });
      toast.success(`Success! Document securely uploaded to FastAPI. File ID: ${data.id || 'N/A'}`);

      // Add to local Zustand store recent list for live UI reactivity
      const folderId = mapDocTypeToFolderId(documentType);
      uploadFileToVault(folderId, displayName || selectedFile.name, Math.round(selectedFile.size / 1024) || 24);

      // Reset file parameters but keep URL
      setSelectedFile(null);
      setDisplayName('');
      setTags('');
      setDescription('');
      setExpiryDate('');
    } catch (error: any) {
      console.error('Error uploading to FastAPI:', error);
      setUploadResponse({ success: false, error: error.message });
      toast.error(`FastAPI Connection Failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // RAG Simulated Analysis States
  const [showRAGModal, setShowRAGModal] = useState(false);
  const [ragFile, setRagFile] = useState<File | null>(null);
  const [ragStep, setRagStep] = useState(0);
  const [ragProgress, setRagProgress] = useState(0);
  const [ragLogs, setRagLogs] = useState<string[]>([]);
  const [ragInsights, setRagInsights] = useState<{
    docType: string;
    verifiedRevenue: string;
    extractedGSTIN?: string;
    calculatedHealthScore: number;
    gemmaQuote: string;
  } | null>(null);

  const startRAGAnalysis = (file: File) => {
    setRagFile(file);
    setShowRAGModal(true);
    setRagStep(0);
    setRagProgress(0);
    setRagLogs([`[SYSTEM] Initializing retrieval-augmented generation pipeline...`]);
    setRagInsights(null);

    const name = file.name.toLowerCase();
    let docType = 'General Operational Record';
    let verifiedRevenue = '₹2.45L / month';
    let extractedGSTIN = '29AAAAA1111A1Z0';
    let calculatedHealthScore = 89;
    let gemmaQuote = 'Document successfully ingested. Text similarity checks confirm robust transaction volumes. Calculated a 7% boost in regional debt index eligibility.';

    if (name.includes('gst') || name.includes('tax') || name.includes('gstr')) {
      docType = 'GST Filing (GSTR-3B)';
      verifiedRevenue = '₹2.4L / month';
      extractedGSTIN = '29AAGCV7142H1ZX';
      calculatedHealthScore = 94;
      gemmaQuote = 'GSTIN verified active. Tax compliance record matches 100% of regional filings. Stable, audited invoice volume triggers a credit eligibility upgrades, booster score active.';
    } else if (name.includes('sales') || name.includes('revenue') || name.includes('profit') || name.includes('p&l') || name.includes('statement')) {
      docType = 'Profit & Loss (P&L) Audit';
      verifiedRevenue = '₹2.8L / month';
      extractedGSTIN = 'Not applicable';
      calculatedHealthScore = 96;
      gemmaQuote = 'Gross margin confirmed at 27.6% (above sector average). Operational buffer verified. High liquidity ratio observed. Core health index recalculated to top tier.';
    } else if (name.includes('msme') || name.includes('udyam') || name.includes('cert')) {
      docType = 'MSME Udyam Registration';
      verifiedRevenue = '₹1.8L / month';
      extractedGSTIN = 'UDYAM-KA-12-009817';
      calculatedHealthScore = 92;
      gemmaQuote = 'MSME status: Validated. Registered category: Micro Enterprise (Service). Unlocks collateral-free CGTMSE bank credit lines with a subsidized interest waiver.';
    }

    setRagInsights({
      docType,
      verifiedRevenue,
      extractedGSTIN,
      calculatedHealthScore,
      gemmaQuote
    });

    const logs = [
      `[SYSTEM] Initializing retrieval-augmented generation pipeline...`,
      `[INGEST] Ingesting binary document stream of ${file.name} (${Math.round(file.size / 1024) || 24} KB)...`,
      `[INGEST] Successfully loaded OCR stream. Identified 12 key financial segments.`,
      `[CHUNKER] Chunking content blocks into 512-character token matrices...`,
      `[CHUNKER] Generated 4 overlapping semantic context nodes with high metadata weights.`,
      `[VECTOR] Invoking Gemma-Embeddings model API...`,
      `[VECTOR] Mapped density vector coordinates to 768-dimensional space. Stored in HNSW index.`,
      `[RETRIEVAL] Matching context queries on Vyapar-Knowledgebase-V2...`,
      `[RETRIEVAL] Found 3 matching central policies & SIDBI interest tables (Cosine similarity: 0.94).`,
      `[SYNTHESIS] Fusing retrieved vectors into Gemma generation prompt...`,
      `[SYNTHESIS] Synthesizing score weights and calculating verified growth index...`,
      `[SYSTEM] RAG processing completed successfully!`
    ];

    let currentStep = 0;
    const runSteps = () => {
      if (currentStep < 5) {
        setRagStep(currentStep);
        setRagProgress(0);
        
        // Append logs
        if (currentStep === 0) {
          setRagLogs(prev => [...prev, logs[1], logs[2]]);
        } else if (currentStep === 1) {
          setRagLogs(prev => [...prev, logs[3], logs[4]]);
        } else if (currentStep === 2) {
          setRagLogs(prev => [...prev, logs[5], logs[6]]);
        } else if (currentStep === 3) {
          setRagLogs(prev => [...prev, logs[7], logs[8]]);
        } else if (currentStep === 4) {
          setRagLogs(prev => [...prev, logs[9], logs[10], logs[11]]);
        }

        let prog = 0;
        const interval = setInterval(() => {
          prog += 10;
          setRagProgress(prog);
          if (prog >= 100) {
            clearInterval(interval);
            currentStep += 1;
            setTimeout(runSteps, 350);
          }
        }, 60);
      } else {
        setRagStep(5);
        setRagProgress(100);
      }
    };

    runSteps();
  };

  const applyRAGResults = () => {
    if (!ragFile || !ragInsights) return;
    
    // 1. Upload to vault
    uploadFileToVault(activeFolderId, ragFile.name, Math.round(ragFile.size / 1024) || 24);
    
    // 2. Update profile health score and verified revenue
    updateProfile({
      healthScore: ragInsights.calculatedHealthScore,
      revenue: ragInsights.verifiedRevenue
    });

    setShowRAGModal(false);
    toast.success(`Success! Recalculated Health Score is now ${ragInsights.calculatedHealthScore}/100 and live on your Dashboard.`);
  };

  // File Upload handler via React Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (uploadMode === 'simulated') {
      startRAGAnalysis(file);
    } else {
      setSelectedFile(file);
      setDisplayName(file.name.replace(/\.[^/.]+$/, "")); // remove extension for visual cleanliness
      
      // Auto-detect document type from filename keywords
      const nameLower = file.name.toLowerCase();
      if (nameLower.includes('gst') || nameLower.includes('tax')) {
        setDocumentType('gst_certificate');
      } else if (nameLower.includes('pan')) {
        setDocumentType('pan_card');
      } else if (nameLower.includes('udyam') || nameLower.includes('msme')) {
        setDocumentType('udyam_certificate');
      } else if (nameLower.includes('sales') || nameLower.includes('revenue')) {
        setDocumentType('sales_csv');
      } else if (nameLower.includes('expense')) {
        setDocumentType('expense_csv');
      } else if (nameLower.includes('inventory')) {
        setDocumentType('inventory_csv');
      } else if (nameLower.includes('pnl') || nameLower.includes('profit') || nameLower.includes('loss')) {
        setDocumentType('profit_loss');
      }
    }
  }, [uploadMode]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1
  } as any);

  const getFolderIcon = (iconName: string) => {
    switch (iconName) {
      case 'FolderOpen': return FolderOpen;
      case 'Badge': return ShieldCheck;
      case 'Wallet': return FolderCheck;
      case 'Receipt': return FileCheck;
      default: return FolderOpen;
    }
  };

  const handleSmartCleanup = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Merging 14 duplicate invoices...',
        success: '14 duplicate invoices merged! Storage footprint reduced by 142MB.',
        error: 'Failed to merge duplicates.',
      }
    );
  };

  return (
    <div className="pt-24 px-6 md:px-10 max-w-7xl mx-auto space-y-10 pb-20">
      
      {/* Title block */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Business Vault</h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Your secure, AI-powered document repository. Documents are automatically encrypted and categorized for compliance and lending readiness.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Mode Switcher */}
          <div className="bg-slate-900 border border-white/10 rounded-xl p-1 flex gap-1 text-xs font-bold">
            <button
              onClick={() => {
                setUploadMode('simulated');
                toast.info('Switched to Gemma Offline Simulation Mode');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                uploadMode === 'simulated'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Simulated Ingest
            </button>
            <button
              onClick={() => {
                setUploadMode('live');
                toast.info('Switched to Live FastAPI Sync Mode');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                uploadMode === 'live'
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Link className="w-3.5 h-3.5" /> Live FastAPI Sync
            </button>
          </div>

          <div className="inline-flex items-center gap-2 bg-[#0d1226] border border-white/10 px-4 py-2 rounded-xl text-xs font-bold text-gray-400">
            <Lock className="w-3.5 h-3.5 text-[#adc6ff]" />
            <span className="uppercase tracking-wider">256-Bit Encrypted</span>
          </div>
        </div>
      </section>

      {/* Backend API Configuration Section (Visible in Live mode) */}
      {uploadMode === 'live' && (
        <section className="bg-slate-900/60 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 animate-pulse" /> FastAPI Integration Server Panel
              </span>
              <h3 className="text-lg font-bold text-white">Live Vault Connection</h3>
              <p className="text-xs text-slate-400">
                Configure your FastAPI backend parameters. Uploads use standard <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded font-mono">multipart/form-data</code> POST requests.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase font-bold text-slate-400">API Base URL</label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  placeholder="E.g., http://localhost:8000"
                />
              </div>
              <div className="space-y-1.5 w-28">
                <label className="text-[10px] uppercase font-bold text-slate-400">Business ID</label>
                <input
                  type="number"
                  value={businessId}
                  onChange={(e) => setBusinessId(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vault Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload Hub + Folders */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Dropzone area */}
          <div 
            {...getRootProps()} 
            className={`relative group bg-[#0d1226]/55 rounded-3xl border-2 border-dashed p-10 flex flex-col items-center justify-center min-h-[250px] transition-all cursor-pointer overflow-hidden ${
              isDragActive ? 'border-blue-500 bg-blue-500/5' : 'border-white/10 hover:border-[#adc6ff]'
            }`}
          >
            <input {...getInputProps()} />
            
            {/* Ambient pulse effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none pulse-upload">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 ${
                uploadMode === 'live' ? 'bg-emerald-500/10' : 'bg-blue-600/10'
              }`}>
                <UploadCloud className={`w-8 h-8 ${uploadMode === 'live' ? 'text-emerald-400' : 'text-blue-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {uploadMode === 'live' ? 'Select FastAPI Document' : 'Upload Documents'}
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed mt-1">
                  {uploadMode === 'live' 
                    ? 'Drag & drop or browse a document to configure live multipart form parameters.'
                    : 'Drag and drop GST filings, PAN cards, or invoices here. AI will auto-extract.'}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <button className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-lg active:scale-95 transition-all ${
                  uploadMode === 'live' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#4285F4] hover:bg-[#4285F4]/90 text-white'
                }`}>
                  <Plus className="w-4 h-4" /> Browse Files
                </button>
                
                {uploadMode === 'simulated' && (
                  /* Folder target selection */
                  <select 
                    className="bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none cursor-pointer"
                    value={activeFolderId}
                    onChange={(e) => {
                      e.stopPropagation();
                      setActiveFolderId(e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {vaultFolders.map(folder => (
                      <option key={folder.id} value={folder.id} className="bg-[#111827]">{folder.name} folder</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Selected File Details & Live FastAPI Metadata Form (Only when file is selected and uploadMode is 'live') */}
          {uploadMode === 'live' && selectedFile && (
            <motion.form 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleLiveUpload}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{selectedFile.name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">Size: {(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-white p-1 hover:bg-white/5 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form fields layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400">Document Type (document_type)</label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value} className="bg-[#111827]">
                        {type.label} ({type.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400">Display Name (display_name)</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Enter visual document name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="E.g., fy2024, gst, billing"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400">Expiry Date (optional)</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] uppercase font-black text-slate-400">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    placeholder="Describe this document's contents..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Uploading to FastAPI...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" /> Securely Stream to FastAPI Vault
                    </>
                  )}
                </button>
              </div>

              {/* Endpoint signature visual guide */}
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 font-mono text-[9px] text-slate-400 space-y-1.5">
                <div className="flex justify-between text-emerald-400 font-bold border-b border-white/5 pb-1">
                  <span>POST {backendUrl}/api/v1/vault/upload</span>
                  <span>MULTIPART_FORM</span>
                </div>
                <div>Payload fields mapped directly to FastAPI sqlalchemy model schema.</div>
              </div>
            </motion.form>
          )}

          {/* Upload Server Response Details Terminal (only when response exists and we are in live mode) */}
          {uploadMode === 'live' && uploadResponse && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/90 border border-white/10 rounded-2xl p-5 font-mono text-xs text-slate-300 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  <Terminal className="w-4 h-4" /> FastAPI Connection Status Reel
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded font-black ${
                  uploadResponse.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {uploadResponse.success ? 'SUCCESS_201' : 'CONN_ERROR'}
                </span>
              </div>

              {uploadResponse.success ? (
                <div className="space-y-2">
                  <p className="text-slate-400">The FastAPI backend processed your file and saved it to the storage pipeline:</p>
                  <pre className="bg-slate-950/80 p-3 rounded-lg border border-white/5 overflow-x-auto text-[10px] text-emerald-300">
                    {JSON.stringify(uploadResponse.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-400 font-bold">FastAPI Server was not reachable:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Make sure your FastAPI server is booted, bound to port 8000, and has CORS configured to accept incoming request payloads from this front-end domain!
                  </p>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5 text-[10px] text-red-300 font-bold">
                    Error Message: {uploadResponse.error}
                  </div>
                  <div className="pt-1.5 text-[10px] text-slate-500">
                    Troubleshooting command: <code className="text-slate-300">uvicorn app.main:app --reload --host 127.0.0.1 --port 8000</code>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Active Gemma Extract message */}
          {uploadMode === 'simulated' && (
            <div className="flex items-center gap-3 p-4 bg-[#111827]/50 rounded-2xl border border-white/5 shadow-sm">
              <Cpu className={`w-5 h-5 text-[#ffb780] ${isProcessing ? 'animate-spin' : 'animate-pulse'}`} />
              <p className="text-xs font-semibold text-gray-200">
                {isProcessing ? 'Gemma is extracting data from recent uploads...' : 'Gemma AI auto-extraction is active & standby'}
              </p>
              <span className="ml-auto text-[9px] font-black text-[#ffb780] uppercase tracking-widest bg-[#ffb780]/10 px-2 py-0.5 rounded border border-[#ffb780]/20">
                Active
              </span>
            </div>
          )}

          {/* Folders grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {vaultFolders.map((folder) => {
              const Icon = getFolderIcon(folder.iconName);
              const isTarget = folder.id === activeFolderId;
              return (
                <div 
                  key={folder.id}
                  onClick={() => {
                    setActiveFolderId(folder.id);
                    toast.info(`Viewing folder "${folder.name}"`);
                  }}
                  className={`glass-card p-5 rounded-2xl flex flex-col justify-between min-h-[140px] hover:scale-[1.03] transition-transform cursor-pointer border ${
                    isTarget ? 'border-[#7C4DFF]/50 bg-[#7C4DFF]/5' : 'border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <Icon className="w-8 h-8 text-[#adc6ff]" />
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                      folder.status === 'verified' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'
                    }`}>
                      {folder.status}
                    </span>
                  </div>
                  <div className="pt-4">
                    <h4 className="font-extrabold text-white text-base">{folder.name}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 font-semibold">
                      {folder.fileCount} Files &bull; {folder.info}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar storage & Activity tracker */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Storage Meter */}
          <div className="bg-slate-900/50 rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-base">Vault Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Storage Used</span>
                <span className="text-white">1.2 GB / 10 GB</span>
              </div>
              <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-[12%]" />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-green-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Compliance Score: 98%</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>2 Invoices lack GSTIN</span>
              </div>
            </div>
          </div>

          {/* Recent activities */}
          <div className="bg-slate-900/40 rounded-2xl p-6 border border-white/5 space-y-4">
            <h4 className="font-bold text-base">Recent Activity</h4>
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-blue-400 shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">{log.filename}</p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{log.actionText} &bull; {log.timeAgo}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => toast.info('Loading complete historic logs audit trail...')}
              className="w-full text-center text-xs text-blue-400 font-bold hover:underline pt-2 block"
            >
              View All Records
            </button>
          </div>

          {/* Quick Action Smart Cleanup */}
          <div className="bg-gradient-to-br from-blue-900/10 to-[#111827]/35 rounded-2xl p-6 border border-white/[0.06] relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <span className="p-2.5 bg-white/5 rounded-xl inline-block text-white">
                <Trash2 className="w-5 h-5" />
              </span>
              <h5 className="font-extrabold text-base text-white">Smart Cleanup</h5>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
                Gemma found 14 duplicate invoices. Ready to merge?
              </p>
              <button 
                onClick={handleSmartCleanup}
                className="px-5 py-2.5 bg-white hover:bg-white/95 text-slate-950 rounded-full text-xs font-black transition-transform active:scale-95"
              >
                Review Now
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Trash2 className="w-28 h-28 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Real-Time RAG Analysis Pipeline Modal */}
      <AnimatePresence>
        {showRAGModal && ragFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card max-w-4xl w-full rounded-3xl border border-blue-500/30 overflow-hidden shadow-2xl flex flex-col md:flex-row h-[550px]"
            >
              
              {/* Left Column: Holographic Scanner & Terminal logs */}
              <div className="w-full md:w-1/2 bg-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5 relative h-1/2 md:h-full">
                
                {/* 3D Core scanner visualization */}
                <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
                  <BusinessCore3D />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-400 animate-pulse" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Gemma RAG Agent</h3>
                      <p className="text-[10px] text-slate-400">Retrieval-Augmented Ingestion Pipeline</p>
                    </div>
                  </div>

                  {/* Horizontal progress steps visualizer */}
                  <div className="grid grid-cols-5 gap-1.5 pt-2">
                    {[0, 1, 2, 3, 4].map((step) => {
                      const isActive = ragStep === step;
                      const isDone = ragStep > step;
                      return (
                        <div key={step} className="space-y-1">
                          <div className={`h-1 rounded-full transition-all duration-300 ${
                            isDone ? 'bg-blue-600' :
                            isActive ? 'bg-indigo-600 animate-pulse' : 'bg-white/5'
                          }`} />
                          <span className={`text-[8px] font-mono block text-center truncate ${
                            isActive ? 'text-white font-black' : 'text-slate-500'
                          }`}>
                            {step === 0 ? 'INGEST' :
                             step === 1 ? 'CHUNK' :
                             step === 2 ? 'VECTOR' :
                             step === 3 ? 'RETR' : 'SYNTH'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cyberpunk terminal log printout */}
                <div className="relative z-10 mt-4 flex-1 bg-black/60 rounded-xl p-4 border border-white/5 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-2 h-[200px] select-text">
                  <div className="text-blue-400 border-b border-white/5 pb-1 mb-2 font-bold flex justify-between items-center">
                    <span>TERMINAL AUDIT REEL</span>
                    <span className="text-[8px] text-[#22c55e]">LOGGING_LIVE</span>
                  </div>
                  {ragLogs.map((log, index) => {
                    const isSystem = log.startsWith('[SYSTEM]');
                    const isError = log.includes('ERR');
                    return (
                      <div key={index} className={`leading-relaxed ${
                        isSystem ? 'text-blue-400 font-bold' :
                        isError ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {log}
                      </div>
                    );
                  })}
                  <div className="h-1" />
                </div>

                {/* Lower progress statistics */}
                <div className="relative z-10 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Task: {ragStep === 5 ? 'Finished' : `Executing Step ${ragStep + 1}/5`}</span>
                  <span>{ragProgress}%</span>
                </div>
              </div>

              {/* Right Column: Calculated Intelligence & Score updates */}
              <div className="w-full md:w-1/2 p-6 flex flex-col justify-between h-1/2 md:h-full bg-[#111827]/30">
                
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Verifying Document</span>
                    <h4 className="text-base font-black text-white truncate max-w-[280px]">{ragFile.name}</h4>
                  </div>
                  <button 
                    onClick={() => setShowRAGModal(false)}
                    className="text-slate-500 hover:text-white p-1 hover:bg-white/5 rounded-full transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Animated transition panel for findings */}
                <div className="my-6 flex-1 flex flex-col justify-center space-y-6">
                  {ragStep < 5 ? (
                    <div className="text-center space-y-4 py-8">
                      <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Synthesizing Core Metrics...</p>
                        <p className="text-xs text-slate-400 max-w-xs mx-auto">
                          Gemma is vector-matching your uploaded document content with compliance standards.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-5"
                    >
                      {/* Document Type badge */}
                      <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[9px] text-slate-500 font-black uppercase">Extracted Category</p>
                          <p className="text-sm font-bold text-blue-400">{ragInsights?.docType}</p>
                        </div>
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>

                      {/* Verified metrics comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                          <p className="text-[9px] text-slate-500 font-black uppercase">Extracted Rev</p>
                          <p className="text-base font-black text-blue-400">{ragInsights?.verifiedRevenue}</p>
                          <span className="text-[8px] text-green-400 font-bold block mt-0.5">✓ Verified Core</span>
                        </div>
                        <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                          <p className="text-[9px] text-slate-500 font-black uppercase">Extracted GSTIN</p>
                          <p className="text-xs font-mono font-bold text-white truncate">{ragInsights?.extractedGSTIN}</p>
                          <span className="text-[8px] text-amber-400 font-bold block mt-0.5">✓ Format Correct</span>
                        </div>
                      </div>

                      {/* Health Score recalculation indicator */}
                      <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-black uppercase">Recalculated Health Score</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-white">{ragInsights?.calculatedHealthScore}</span>
                            <span className="text-[10px] text-slate-400">/ 100</span>
                          </div>
                        </div>

                        {/* Visual boost change arrow indicator */}
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs font-black px-3 py-1.5 rounded-xl border border-green-500/20 shadow-sm animate-bounce">
                            +{ragInsights ? (ragInsights.calculatedHealthScore - profile.healthScore) : 0} Points Boost!
                          </span>
                        </div>
                      </div>

                      {/* Gemma personalized advice box */}
                      <div className="p-3.5 bg-black/40 rounded-xl border border-white/5">
                        <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Gemma AI Synthesis</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          &ldquo;{ragInsights?.gemmaQuote}&rdquo;
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Apply insights action button */}
                <button
                  disabled={ragStep < 5}
                  onClick={applyRAGResults}
                  className={`w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 border ${
                    ragStep < 5 
                      ? 'bg-white/5 border-white/5 text-slate-500 cursor-not-allowed' 
                      : 'bg-blue-600 text-white border-blue-500/40 hover:bg-blue-700 shadow-lg shadow-blue-500/10'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> 
                  {ragStep < 5 ? 'Awaiting Pipeline Analysis...' : 'Apply Verified Score & Save to Vault'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
