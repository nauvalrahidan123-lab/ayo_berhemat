import React, { useMemo } from 'react';
import { Transaction } from '../types';
import Card from './common/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ReportsProps {
  transactions: Transaction[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];
const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);


const Reports: React.FC<ReportsProps> = ({ transactions }) => {
  
  const monthlyReportData = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const expenses = transactions.filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'Pengeluaran' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

    const expenseByCategory = expenses.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
        chartData: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })),
        total: totalExpense
    };
  }, [transactions]);

  return (
    <div className="p-4 space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Laporan Bulan Ini</h1>
      <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Pengeluaran per Kategori</h2>
        {monthlyReportData.chartData.length > 0 ? (
          <div className="h-72 w-full relative">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={monthlyReportData.chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={65}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  isAnimationActive={true}
                  animationDuration={800}
                  paddingAngle={2}
                >
                  {monthlyReportData.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{right: -10}}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm text-[var(--text-secondary)]">Total</span>
                <span className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(monthlyReportData.total)}</span>
            </div>
          </div>
        ) : (
          <p className="text-center text-[var(--text-secondary)] py-10">Tidak ada data pengeluaran bulan ini.</p>
        )}
      </Card>
       <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Filter Laporan</h2>
        <div className="flex space-x-2">
            <button className="flex-1 bg-[var(--accent)] text-white font-semibold py-2 rounded-full">Bulanan</button>
            <button className="flex-1 bg-[var(--bg-primary)] text-[var(--text-secondary)] font-semibold py-2 rounded-full">Tahunan</button>
        </div>
      </Card>
    </div>
  );
};

export default Reports;