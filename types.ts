
export type UserTheme = 'nauval' | 'mufel';

export interface User {
  uid: string;
  username: string;
  theme: UserTheme;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  type: 'Tunai' | 'Bank' | 'E-Wallet';
}

export interface Transaction {
  id: string;
  type: 'Pemasukan' | 'Pengeluaran';
  amount: number;
  date: string; // ISO string format
  category: string;
  accountId: string;
  notes?: string;
}

export interface Budget {
  id:string;
  category: string;
  amount: number;
  spent: number;
}

export type AppView = 'dashboard' | 'transactions' | 'budgets' | 'accounts' | 'reports';