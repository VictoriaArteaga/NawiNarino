export interface Vocabulary {
  id: number;
  languageId: number;
  word: string;
  translation: string;
  category: string;
  description: string;
  audioUrl: string | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}

