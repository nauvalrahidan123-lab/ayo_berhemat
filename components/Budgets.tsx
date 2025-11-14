import React from 'react';
import { Budget } from '../types';
import Card from './common/Card';
import ProgressBar from './common/ProgressBar';
import { PlusCircleIcon, PencilIcon } from './icons';

interface BudgetsProps {
  budgets: Budget[];
  onAddBudget: () => void;
  onSelectBudget: (budget: Budget) => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const Budgets: React.FC<BudgetsProps> = ({ budgets, onAddBudget, onSelectBudget }) => {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Anggaran Bulanan</h1>
        <button onClick={onAddBudget} className="flex items-center space-x-2 text-[var(--accent)] font-semibold">
          <PlusCircleIcon className="w-6 h-6"/>
          <span>Baru</span>
        </button>
      </div>
      {budgets.length === 0 ? (
        <Card className="text-center py-10 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
          <svg className="w-24 h-24 text-[var(--border)] mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c-4 0-7 3-7 7v10h14V9c0-4-3-7-7-7z"></path><path d="M12 12a3 3 0 100-6 3 3 0 000 6z"></path><path d="M15 22H9"></path></svg>
          <p className="text-lg font-semibold text-[var(--text-primary)]">Belum Ada Anggaran</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Buat anggaran untuk melacak pengeluaranmu.</p>
        </Card>
      ) : (
        <Card className="p-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
          <ul className="divide-y divide-[var(--border)]">
            {budgets.map(budget => {
              const percentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
              const remaining = budget.amount - budget.spent;
              return (
                <li key={budget.id}>
                  <button onClick={() => onSelectBudget(budget)} className="w-full text-left p-4 hover:bg-[var(--bg-primary)] transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-[var(--text-primary)]">{budget.category}</span>
                      <div className="flex items-center space-x-2">
                         <span className={`font-semibold ${percentage > 90 ? 'text-[var(--expense)]' : 'text-[var(--text-primary)]'}`}>
                            {Math.round(percentage)}%
                         </span>
                         <PencilIcon className="w-4 h-4 text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity"/>
                      </div>
                    </div>
                    <ProgressBar value={percentage} colorClass="bg-[var(--accent)]" />
                    <div className="flex justify-between items-center mt-2 text-xs text-[var(--text-secondary)]">
                      <span>Terpakai: {formatCurrency(budget.spent)}</span>
                      <span>Sisa: {formatCurrency(remaining)}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default Budgets;