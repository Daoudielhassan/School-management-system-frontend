export interface Permission {
  id: number;
  role: string;
  resource: string;
  actions: string[];
}
