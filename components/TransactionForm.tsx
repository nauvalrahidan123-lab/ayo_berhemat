
import React, { useState } from 'react';
import { Transaction, Account } from '../types';
import { CATEGORIES } from '../constants';
import { CloseIcon } from './icons';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  accounts: Account[];
  transactionToEdit?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onSave, accounts }) => {
  const [type, setType] = useState<'Pengeluaran' | 'Pemasukan'>('Pengeluaran');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [accountId, setAccountId] = useState(accounts.length > 0 ? accounts[0].id : '');
  const [notes, setNotes] = useState('');

  const handleTypeChange = (newType: 'Pengeluaran' | 'Pemasukan') => {
    setType(newType);
    setCategory(newType === 'Pengeluaran' ? CATEGORIES.expense[0] : CATEGORIES.income[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !category) return;
    onSave({
      type,
      amount: parseFloat(amount),
      date,
      category,
      accountId,
      notes,
    });
    // Reset form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end">
      <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-t-3xl p-6 transform transition-transform duration-300 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Transaksi Baru</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex border border-[var(--border)] rounded-full p-1">
              <button type="button" onClick={() => handleTypeChange('Pengeluaran')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${type === 'Pengeluaran' ? 'bg-[var(--expense)] text-white' : 'text-[var(--text-secondary)]'}`}>
                Pengeluaran
              </button>
              <button type="button" onClick={() => handleTypeChange('Pemasukan')} className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${type === 'Pemasukan' ? 'bg-[var(--income)] text-white' : 'text-[var(--text-secondary)]'}`}>
                Pemasukan
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-[var(--text-secondary)]">Jumlah</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full text-3xl font-bold bg-transparent border-b-2 border-[var(--border)] focus:border-[var(--accent)] focus:outline-none text-[var(--text-primary)]"
              placeholder="0"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[var(--text-secondary)]">Tanggal</label>
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-2 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
            </div>
             <div>
              <label htmlFor="category" className="block text-sm font-medium text-[var(--text-secondary)]">Kategori</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-2 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
                {(type === 'Pengeluaran' ? CATEGORIES.expense : CATEGORIES.income).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="account" className="block text-sm font-medium text-[var(--text-secondary)]">Akun</label>
            <select id="account" value={accountId} onChange={(e) => setAccountId(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-2 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-[var(--text-secondary)]">Catatan (Opsional)</label>
            <input type="text" id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-2 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
          </div>

          <button type="submit" className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors text-lg">
            Simpan Transaksi
          </button>
        </form>
      </div>
       <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default TransactionForm;
