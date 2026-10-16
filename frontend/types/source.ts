export interface Source {
  id: number;
  title: string;
  author: string;
  year: number | null;
  type: string;
  reference: string;
  url: string | null;
  description: string;
  isMock: boolean;
  createdAt: string;
  updatedAt: string;
}
