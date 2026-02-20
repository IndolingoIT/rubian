export type AppStep = 'upload' | 'auth' | 'login' | 'snapshot' | 'pay' | 'translate' | 'success' | 'how-it-works' | 'pricing' | 'account' | 'search' | 'help' | 'terms' | 'terms-publication';
export type UILanguage = 'en' | 'id';

export interface FileData {
  name: string;
  size: number;
  type: string;
  content: string;
  wordCount: number;
}

export interface TranslationResult {
  original: string;
  translated: string;
  sourceLanguage: string;
  targetLanguage: string;
  snapshot?: string;
  similarityScore?: number;
}

export interface Language {
  code: string;
  name: string;
}

export interface DownloadedJournal {
  id: string;
  title: string;
  uri: string;
  dateAdded: string;
  wordCount: number;
  snippet?: string;
}

export interface User {
  email: string;
  name: string;
  role: string;
  joinedDate: string;
  credits: number;
  downloadedJournals: DownloadedJournal[];
}

export interface ProofreadingAssets {
  cleanUrl?: string;
  uncleanUrl?: string;
  certificateUrl?: string;
  turnitinReportUrl?: string;
}

export interface TranslationHistory {
  id: string;
  fileName: string;
  date: string;
  words: number;
  status: 'completed' | 'processing';
  targetLang: string;
  hasProofreading: boolean;
  hasTurnitin: boolean;
  proofreadingStatus?: 'awaiting_upload' | 'ready';
  assets?: ProofreadingAssets;
}

export interface AcademicSearchResult {
  answer: string;
  sources: { title: string; uri: string; snippet?: string }[];
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Indonesian' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'zh', name: 'Chinese' },
];

export const RATE_PER_1000_WORDS = 10000; // IDR 10.000 per 1000 words
export const TURNITIN_FLAT_FEE = 50000; // IDR 50.000 flat fee