import React, { useState, useEffect } from 'react';
import { Account } from '../types';
import { CloseIcon } from './icons';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number, date: string) => void;
  accounts: Account[];
}

const TransferForm: React.FC<TransferFormProps> = ({ isOpen, onClose, onTransfer, accounts }) => {
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && accounts.length > 0) {
      setFromAccountId(accounts[0].id);
      if (accounts.length > 1) {
          setToAccountId(accounts[1].id);
      }
    } else {
        // Reset form
        setFromAccountId('');
        setToAccountId('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setError('');
    }
  }, [isOpen, accounts]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const transferAmount = parseFloat(amount);
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);

    if (!fromAccountId || !toAccountId || !transferAmount || transferAmount <= 0) {
        setError('Harap isi semua kolom dengan benar.');
        return;
    }
    if (fromAccountId === toAccountId) {
        setError('Akun sumber dan tujuan tidak boleh sama.');
        return;
    }
    if (fromAccount && fromAccount.balance < transferAmount) {
        setError('Saldo akun sumber tidak mencukupi.');
        return;
    }

    onTransfer(fromAccountId, toAccountId, transferAmount, date);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end">
      <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-t-3xl p-6 transform transition-transform duration-300 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Transfer Dana</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fromAccount" className="block text-sm font-medium text-[var(--text-secondary)]">Dari Akun</label>
            <select id="fromAccount" value={fromAccountId} onChange={(e) => setFromAccountId(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(acc.balance)})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="toAccount" className="block text-sm font-medium text-[var(--text-secondary)]">Ke Akun</label>
            <select id="toAccount" value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
               {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="transferAmount" className="block text-sm font-medium text-[var(--text-secondary)]">Jumlah</label>
            <input
              type="number"
              id="transferAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]"
              placeholder="0"
              required
            />
          </div>
           <div>
              <label htmlFor="transferDate" className="block text-sm font-medium text-[var(--text-secondary)]">Tanggal</label>
              <input type="date" id="transferDate" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]" />
            </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <div className="pt-4">
             <button type="submit" className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors text-lg" disabled={accounts.length < 2}>
                Transfer Sekarang
             </button>
             {accounts.length < 2 && <p className="text-xs text-center text-red-500 mt-2">Anda butuh minimal 2 akun untuk melakukan transfer.</p>}
          </div>
        </form>
         <style>{`
            @keyframes slide-up {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
            .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
        `}</style>
      </div>
    </div>
  );
};

export default TransferForm;