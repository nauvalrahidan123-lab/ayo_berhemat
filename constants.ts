import { UserTheme, User, Account, Transaction, Budget } from './types';

export const THEMES: Record<UserTheme, Record<string, string>> = {
  nauval: {
    '--bg-primary': '#F0F4F8', // cool gray
    '--bg-secondary': '#FFFFFF',
    '--text-primary': '#1F2937', // dark gray
    '--text-secondary': '#6B7280',
    '--accent': '#3B82F6', // light blue
    '--accent-hover': '#2563EB',
    '--border': '#E5E7EB',
    '--income': '#10B981', // green
    '--expense': '#EF4444', // red
  },
  mufel: {
    '--bg-primary': '#FFF7F5', // warm beige
    '--bg-secondary': '#FFFFFF',
    '--text-primary': '#4B423F',
    '--text-secondary': '#9B8B86',
    '--accent': '#F472B6', // soft pink
    '--accent-hover': '#EC4899',
    '--border': '#F3EAE7',
    '--income': '#10B981',
    '--expense': '#EF4444',
  },
};

export const CATEGORIES = {
  expense: ['Makanan', 'Transportasi', 'Biaya Kuliah', 'Hiburan', 'Belanja', 'Transfer Keluar', 'Lainnya'],
  income: ['Uang Saku', 'Gaji', 'Hadiah', 'Transfer Masuk', 'Lainnya'],
};

export const USERS: Record<string, User & { password_HACK: string }> = {
  nauval: {
    id: 'user-1',
    username: 'nauval',
    password_HACK: '061106',
    theme: 'nauval',
  },
  mufel: {
    id: 'user-2',
    username: 'mufel',
    password_HACK: '060703',
    theme: 'mufel',
  },
};

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(today.getDate() - 2);

export const MOCK_DATA: Record<UserTheme, { accounts: Account[], transactions: Transaction[], budgets: Budget[] }> = {
  nauval: {
    accounts: [
      { id: 'acc1-n', name: 'BCA', balance: 1250000, type: 'Bank' },
      { id: 'acc2-n', name: 'Gopay', balance: 325000, type: 'E-Wallet' },
      { id: 'acc3-n', name: 'Dompet', balance: 150000, type: 'Tunai' },
    ],
    transactions: [
      { id: 't1-n', type: 'Pemasukan', amount: 1500000, date: twoDaysAgo.toISOString(), category: 'Uang Saku', accountId: 'acc1-n' },
      { id: 't2-n', type: 'Pengeluaran', amount: 50000, date: twoDaysAgo.toISOString(), category: 'Makanan', accountId: 'acc2-n' },
      { id: 't3-n', type: 'Pengeluaran', amount: 25000, date: yesterday.toISOString(), category: 'Transportasi', accountId: 'acc3-n' },
      { id: 't4-n', type: 'Pengeluaran', amount: 200000, date: today.toISOString(), category: 'Biaya Kuliah', accountId: 'acc1-n' },
    ],
    budgets: [
      { id: 'b1-n', category: 'Makanan', amount: 750000, spent: 50000 },
      { id: 'b2-n', category: 'Hiburan', amount: 300000, spent: 0 },
    ],
  },
  mufel: {
    accounts: [
      { id: 'acc1-m', name: 'Mandiri', balance: 2100000, type: 'Bank' },
      { id: 'acc2-m', name: 'ShopeePay', balance: 550000, type: 'E-Wallet' },
    ],
    transactions: [
      { id: 't1-m', type: 'Pemasukan', amount: 2000000, date: twoDaysAgo.toISOString(), category: 'Gaji', accountId: 'acc1-m' },
      { id: 't2-m', type: 'Pengeluaran', amount: 150000, date: yesterday.toISOString(), category: 'Belanja', accountId: 'acc2-m' },
      { id: 't3-m', type: 'Pengeluaran', amount: 75000, date: today.toISOString(), category: 'Makanan', accountId: 'acc1-m' },
    ],
    budgets: [
      { id: 'b1-m', category: 'Belanja', amount: 500000, spent: 150000 },
      { id: 'b2-m', category: 'Transportasi', amount: 250000, spent: 0 },
    ],
  }
};