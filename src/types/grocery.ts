export interface GroceryItem {
  id: string;
  name: string;
  note?: string;
  purchased: boolean;
  createdAt: number;
  purchasedAt?: number;
}

export type AppView = 'list' | 'shopping';

export type ThemeMode = 'light' | 'dark';
