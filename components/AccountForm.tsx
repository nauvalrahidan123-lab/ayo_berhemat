import React, { useState, useEffect } from 'react';
import { Account } from '../types';
import { CloseIcon, TrashIcon } from './icons';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Omit<Account, 'id'> | Account) => void;
  onDelete: (accountId: string) => void;
  accountToEdit: Account | null;
}

const AccountForm: React.FC<AccountFormProps> = ({ isOpen, onClose, onSave, onDelete, accountToEdit }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Tunai' | 'Bank' | 'E-Wallet'>('Bank');
  const [balance, setBalance] = useState('');

  const isEditMode = !!accountToEdit;
  
  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setType(accountToEdit.type);
      setBalance(String(accountToEdit.balance));
    } else {
      // Reset for new account
      setName('');
      setType('Bank');
      setBalance('');
    }
  }, [accountToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    const balanceValue = parseFloat(balance) || 0;

    if (isEditMode) {
        onSave({
            ...accountToEdit,
            name,
            type,
        });
    } else {
        onSave({
            name,
            type,
            balance: balanceValue
        });
    }
    onClose();
  };
  
  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus akun ini? Aksi ini tidak dapat dibatalkan.') && accountToEdit) {
        onDelete(accountToEdit.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end">
      <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-t-3xl p-6 transform transition-transform duration-300 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{isEditMode ? 'Edit Akun' : 'Tambah Akun Baru'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-[var(--text-secondary)]">Nama Akun</label>
            <input
              type="text"
              id="accountName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]"
              required
            />
          </div>
          
           {!isEditMode && (
            <div>
              <label htmlFor="initialBalance" className="block text-sm font-medium text-[var(--text-secondary)]">Saldo Awal</label>
              <input
                type="number"
                id="initialBalance"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]"
                placeholder="0"
                required
              />
            </div>
          )}

          <div>
              <label htmlFor="accountType" className="block text-sm font-medium text-[var(--text-secondary)]">Tipe Akun</label>
              <select id="accountType" value={type} onChange={(e) => setType(e.target.value as any)} className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]">
                <option value="Bank">Bank</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Tunai">Tunai</option>
              </select>
          </div>
          
          <div className="pt-4 space-y-3">
             <button type="submit" className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors text-lg">
                {isEditMode ? 'Simpan Perubahan' : 'Tambah Akun'}
             </button>
             {isEditMode && (
                <button type="button" onClick={handleDelete} className="w-full flex items-center justify-center space-x-2 text-red-500 font-bold py-3 rounded-full hover:bg-red-50 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                    <span>Hapus Akun</span>
                </button>
             )}
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

export default AccountForm;