import React from 'react';
import { Transaction, Account } from '../types';
import { ArrowDownIcon, ArrowUpIcon } from './icons';
import Card from './common/Card';

interface TransactionsListProps {
  transactions: Transaction[];
  accounts: Account[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, accounts }) => {
  const getAccountName = (accountId: string) => {
    return accounts.find(acc => acc.id === accountId)?.name || 'N/A';
  };
  
  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = formatDate(transaction.date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => {
      // Custom sort to handle date strings from formatDate
      const dateA = new Date(transactions.find(t => formatDate(t.date) === a)!.date);
      const dateB = new Date(transactions.find(t => formatDate(t.date) === b)!.date);
      return dateB.getTime() - dateA.getTime();
  });
  
  return (
    <div className="p-4 space-y-4 animate-fade-in">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Riwayat Transaksi</h1>
        {transactions.length === 0 ? (
             <Card className="text-center py-10 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                <svg className="w-24 h-24 text-[var(--border)] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                <p className="text-lg font-semibold text-[var(--text-primary)]">Tidak Ada Transaksi</p>
                <p className="text-[var(--text-secondary)] mt-1 text-sm">Tekan tombol '+' untuk memulai.</p>
            </Card>
        ) : (
            sortedDates.map(date => (
                <div key={date}>
                    <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-2 px-2">{date}</h2>
                    <Card className="p-0 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
                        <ul className="divide-y divide-[var(--border)]">
                        {groupedTransactions[date].map(t => (
                            <li key={t.id} className="p-4 flex items-center space-x-4">
                            <div className={`p-2 rounded-full ${t.type === 'Pemasukan' ? 'bg-green-100' : 'bg-red-100'}`}>
                                {t.type === 'Pemasukan' ? (
                                <ArrowDownIcon className="w-5 h-5 text-green-600" />
                                ) : (
                                <ArrowUpIcon className="w-5 h-5 text-red-600" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-[var(--text-primary)]">{t.category}</p>
                                <p className="text-xs text-[var(--text-secondary)]">{getAccountName(t.accountId)}</p>
                            </div>
                            <p className={`font-bold ${t.type === 'Pemasukan' ? 'text-[var(--income)]' : 'text-[var(--expense)]'}`}>
                                {formatCurrency(t.amount)}
                            </p>
                            </li>
                        ))}
                        </ul>
                    </Card>
                </div>
            ))
        )}
    </div>
  );
};

export default TransactionsList;