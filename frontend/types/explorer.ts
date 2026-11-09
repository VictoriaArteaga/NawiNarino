/** Contrato de `POST /explorer/ask` (camelCase). */
export interface ExplorerCitation {
  ref: number;
  chunkId: string;
  documentId: string;
  title: string;
  author: string | null;
  year: number | null;
  page: number;
  language: string;
  source: string;
  license: string;
  validationStatus: string;
  isSynthetic: boolean;
  excerpt: string;
  score: number;
}

export interface ExplorerAnswer {
  question: string;
  answer: string;
  abstained: boolean;
  citations: ExplorerCitation[];
  notices: string[];
  /** direct: la evidencia contiene lo preguntado; related: solo es del mismo tema; none: abstención. */
  evidence: "direct" | "related" | "none";
  unmatchedTerms: string[];
  /** Explicación generada por un modelo local y validada en el backend (puede ser null). */
  explanation: string | null;
  /** generated: explicación válida · extractive: generación desactivada · extractive_fallback: falló · none: abstención. */
  generationMode: "generated" | "extractive" | "extractive_fallback" | "none";
  generationModel: string | null;
  generationMs: number | null;
  generationNote: string | null;
}

export interface AskRequest {
  question: string;
  language?: string;
}
