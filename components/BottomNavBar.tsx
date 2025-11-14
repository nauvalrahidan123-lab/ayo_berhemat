import React from 'react';
import { AppView } from '../types';
import { HomeIcon, ListIcon, WalletIcon, ChartPieIcon, PlusIcon } from './icons';

interface BottomNavBarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onAddTransaction: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView, onAddTransaction }) => {
  const navItems = [
    { view: 'dashboard' as AppView, label: 'Home', icon: <HomeIcon className="w-6 h-6" /> },
    { view: 'transactions' as AppView, label: 'Transaksi', icon: <ListIcon className="w-6 h-6" /> },
    { view: 'budgets' as AppView, label: 'Anggaran', icon: <ChartPieIcon className="w-6 h-6" /> },
    { view: 'accounts' as AppView, label: 'Akun', icon: <WalletIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[var(--bg-secondary)] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center justify-around max-w-md mx-auto">
      {navItems.slice(0, 2).map(item => (
        <NavItem
          key={item.view}
          {...item}
          isActive={activeView === item.view}
          onClick={() => setActiveView(item.view)}
        />
      ))}
      <div className="w-16 h-16 -mt-12">
        <button
          onClick={onAddTransaction}
          className="w-full h-full bg-[var(--accent)] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[var(--accent-hover)] transition-transform duration-200 transform hover:scale-105"
          aria-label="Tambah Transaksi"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>
      {navItems.slice(2, 4).map(item => (
        <NavItem
          key={item.view}
          {...item}
          isActive={activeView === item.view}
          onClick={() => setActiveView(item.view)}
        />
      ))}
    </div>
  );
};

export default BottomNavBar;