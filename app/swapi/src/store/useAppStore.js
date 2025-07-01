import { create } from 'zustand';

const useAppStore = create((set, get) => ({
  // API and Model state
  apiKey: '',
  models: [],
  selectedModel: '',
  
  // Query state
  query: '',
  response: null,
  loading: false,
  error: '',
  
  // System state
  status: null,
  
  // Progress tracking
  progressUpdates: [],
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  
  // Raw data for debugging
  lastRawRequest: null,
  lastRawResponse: null,
  
  // Embeddings state
  embeddings: null,
  embeddingsLoading: false,
  
  // Actions
  setApiKey: (apiKey) => set({ apiKey }),
  setModels: (models) => set({ models }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
  setQuery: (query) => set({ query }),
  setResponse: (response) => set({ response }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setStatus: (status) => set({ status }),
  setProgressUpdates: (progressUpdates) => set({ progressUpdates }),
  setLastRawRequest: (lastRawRequest) => set({ lastRawRequest }),
  setLastRawResponse: (lastRawResponse) => set({ lastRawResponse }),
  setEmbeddings: (embeddings) => set({ embeddings }),
  setEmbeddingsLoading: (embeddingsLoading) => set({ embeddingsLoading }),
  
  // Complex actions
  addProgressUpdate: (update) => set((state) => ({ 
    progressUpdates: [...state.progressUpdates, update] 
  })),
  
  clearProgress: () => set({ progressUpdates: [] }),
  
  clearResponse: () => set({ response: null }),
  
  resetState: () => set({ 
    response: null, 
    progressUpdates: [], 
    error: '', 
    loading: false 
  }),
}));

export default useAppStore;