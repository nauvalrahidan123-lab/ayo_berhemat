import React, { useState, useMemo } from 'react';
import { Account, Transaction, Budget, User } from '../types';
import Card from './common/Card';
import ProgressBar from './common/ProgressBar';
import { EyeIcon, EyeOffIcon, ArrowUpIcon, ArrowDownIcon } from './icons';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const Dashboard: React.FC<DashboardProps> = ({ user, accounts, transactions, budgets }) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => sum + acc.balance, 0), [accounts]);

  const cashFlowData = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const recentTransactions = transactions.filter(t => new Date(t.date) >= last30Days);
    
    const income = recentTransactions.filter(t => t.type === 'Pemasukan').reduce((sum, t) => sum + t.amount, 0);
    const expense = recentTransactions.filter(t => t.type === 'Pengeluaran').reduce((sum, t) => sum + t.amount, 0);

    return [
      { name: 'Pemasukan', value: income, color: 'var(--income)' },
      { name: 'Pengeluaran', value: expense, color: 'var(--expense)' }
    ];
  }, [transactions]);

  const topBudgets = useMemo(() => {
    return budgets
      .sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount))
      .slice(0, 3);
  }, [budgets]);
  
  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <header>
        <p className="text-md text-[var(--text-secondary)]">Selamat datang,</p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] capitalize">{user.username}!</h1>
      </header>

      <Card className="flex flex-col items-center justify-center text-center p-6 shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex items-center space-x-2">
          <p className="text-sm text-[var(--text-secondary)]">Total Saldo</p>
          <button onClick={() => setIsBalanceVisible(!isBalanceVisible)} className="text-[var(--text-secondary)]">
            {isBalanceVisible ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
        <h2 className="text-4xl font-extrabold text-[var(--text-primary)] mt-2">
          {isBalanceVisible ? formatCurrency(totalBalance) : '••••••••'}
        </h2>
      </Card>
      
      <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Arus Kas (30 Hari Terakhir)</h3>
        <div className="h-40">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cashFlowData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
               <defs>
                <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--income)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--income)" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--expense)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="var(--expense)" stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value) => `${Number(value)/1000}k`} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false}/>
              <Tooltip
                cursor={{ fill: 'rgba(128, 128, 128, 0.1)', radius: 8 }}
                contentStyle={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number, name, props) => [`${formatCurrency(value)}`, name]}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={800}>
                {cashFlowData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === 'Pemasukan' ? 'url(#gradientIncome)' : 'url(#gradientExpense)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-around mt-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-green-100">
                <ArrowDownIcon className="w-4 h-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Pemasukan</p>
                <p className="font-bold text-[var(--income)]">{formatCurrency(cashFlowData[0].value)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-red-100">
                <ArrowUpIcon className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-[var(--text-secondary)]">Pengeluaran</p>
                <p className="font-bold text-[var(--expense)]">{formatCurrency(cashFlowData[1].value)}</p>
              </div>
            </div>
          </div>
      </Card>

      <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Status Anggaran Cepat</h3>
        <div className="space-y-4">
          {topBudgets.length > 0 ? topBudgets.map(budget => (
            <div key={budget.id}>
              <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-[var(--text-primary)]">{budget.category}</span>
                <span className="text-[var(--text-secondary)]">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</span>
              </div>
              <ProgressBar value={(budget.spent / budget.amount) * 100} colorClass="bg-[var(--accent)]" />
            </div>
          )) : <p className="text-sm text-center text-[var(--text-secondary)] py-4">Belum ada anggaran yang dibuat.</p>}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;