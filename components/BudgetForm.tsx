import React, { useState, useEffect } from 'react';
import { Budget } from '../types';
import { CloseIcon, TrashIcon } from './icons';

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id' | 'spent'> | Budget) => void;
  onDelete: (budgetId: string) => void;
  budgetToEdit: Budget | null;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ isOpen, onClose, onSave, onDelete, budgetToEdit }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const isEditMode = !!budgetToEdit;

  useEffect(() => {
    if (budgetToEdit) {
      setCategory(budgetToEdit.category);
      setAmount(String(budgetToEdit.amount));
    } else {
      setCategory('');
      setAmount('');
    }
  }, [budgetToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !amount) return;

    const budgetData = {
      category,
      amount: parseFloat(amount),
    };

    if (isEditMode) {
      onSave({
        ...budgetToEdit,
        ...budgetData,
      });
    } else {
      onSave(budgetData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus anggaran ini?') && budgetToEdit) {
      onDelete(budgetToEdit.id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-end">
      <div className="bg-[var(--bg-secondary)] w-full max-w-md rounded-t-3xl p-6 transform transition-transform duration-300 animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{isEditMode ? 'Edit Anggaran' : 'Anggaran Baru'}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="budgetName" className="block text-sm font-medium text-[var(--text-secondary)]">Nama Anggaran</label>
            <input
              type="text"
              id="budgetName"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              placeholder="cth: Jajan Kopi, Tabungan, dll."
              required
            />
          </div>
          <div>
            <label htmlFor="budgetAmount" className="block text-sm font-medium text-[var(--text-secondary)]">Jumlah Anggaran</label>
            <input
              type="number"
              id="budgetAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 block w-full border border-[var(--border)] rounded-lg p-3 bg-[var(--bg-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] text-[var(--text-primary)]"
              placeholder="0"
              required
            />
          </div>
          <div className="pt-4 space-y-3">
             <button type="submit" className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors text-lg">
                {isEditMode ? 'Simpan Perubahan' : 'Buat Anggaran'}
             </button>
             {isEditMode && (
                <button type="button" onClick={handleDelete} className="w-full flex items-center justify-center space-x-2 text-red-500 font-bold py-3 rounded-full hover:bg-red-50 transition-colors">
                    <TrashIcon className="w-5 h-5" />
                    <span>Hapus Anggaran</span>
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

export default BudgetForm;