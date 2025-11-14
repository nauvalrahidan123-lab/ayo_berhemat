import { UserTheme } from './types';

export const USERS = {
  nauval: {
    username: 'nauval',
    password: '061106',
    theme: 'nauval' as UserTheme,
  },
  mufel: {
    username: 'mufel',
    password: '060703',
    theme: 'mufel' as UserTheme,
  },
};

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