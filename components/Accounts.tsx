import React from 'react';
import { Account } from '../types';
import Card from './common/Card';
import { WalletIcon, PencilIcon, PlusCircleIcon, ArrowPathIcon } from './icons';

interface AccountsProps {
  accounts: Account[];
  onSelectAccount: (account: Account) => void;
  onAddAccount: () => void;
  onTransfer: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const Accounts: React.FC<AccountsProps> = ({ accounts, onSelectAccount, onAddAccount, onTransfer }) => {
  return (
    <div className="p-4 space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Akun Saya</h1>
        <button onClick={onAddAccount} className="flex items-center space-x-2 text-[var(--accent)] font-semibold">
            <PlusCircleIcon className="w-6 h-6"/>
            <span>Baru</span>
        </button>
      </div>
      <Card className="p-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <ul className="divide-y divide-[var(--border)]">
          {accounts.map(account => (
            <li key={account.id}>
              <button onClick={() => onSelectAccount(account)} className="w-full py-4 px-4 flex items-center justify-between text-left hover:bg-[var(--bg-primary)] transition-colors duration-200 group">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-[var(--bg-primary)] rounded-full group-hover:bg-white transition-colors">
                    <WalletIcon className="w-6 h-6 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{account.name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{account.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                    <p className="font-bold text-lg text-[var(--text-primary)]">{formatCurrency(account.balance)}</p>
                    <PencilIcon className="w-5 h-5 text-[var(--text-secondary)] opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Card>
       <Card className="mt-6 text-center shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
          <button onClick={onTransfer} className="w-full bg-[var(--accent)] text-white font-bold py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-2">
            <ArrowPathIcon className="w-5 h-5" />
            <span>Transfer antar Akun</span>
          </button>
        </Card>
    </div>
  );
};

export default Accounts;