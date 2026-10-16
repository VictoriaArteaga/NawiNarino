export interface Territory {
  id: number;
  name: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  region: string;
  languageId: number | null;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}
