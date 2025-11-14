import React, { useState, useEffect, useCallback } from 'react';
import { User, AppView, Account, Transaction, Budget } from './types';
import { THEMES, MOCK_DATA } from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TransactionsList from './components/TransactionsList';
import Budgets from './components/Budgets';
import Accounts from './components/Accounts';
import Reports from './components/Reports';
import BottomNavBar from './components/BottomNavBar';
import TransactionForm from './components/TransactionForm';
import AccountForm from './components/AccountForm';
import BudgetForm from './components/BudgetForm';
import TransferForm from './components/TransferForm';

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [activeView, setActiveView] = useState<AppView>('dashboard');
    const [viewKey, setViewKey] = useState(0);

    // Data state
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    
    // Form States
    const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);
    const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);

    useEffect(() => {
        // Simulate initial loading
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    const handleLoginSuccess = useCallback((loggedInUser: User) => {
        setUser(loggedInUser);
        const theme = THEMES[loggedInUser.theme];
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        
        // Load mock data for the logged-in user
        const userData = MOCK_DATA[loggedInUser.theme];
        setAccounts(userData.accounts);
        setTransactions(userData.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setBudgets(userData.budgets);
    }, []);
    
    const handleLogout = () => {
        setUser(null);
        // Clear data
        setAccounts([]);
        setTransactions([]);
        setBudgets([]);
    };
    
    const handleViewChange = (view: AppView) => {
        setActiveView(view);
        setViewKey(prev => prev + 1);
    };

    // --- Account Logic ---
    const handleOpenAccountForm = (account: Account | null) => {
        setAccountToEdit(account);
        setIsAccountFormOpen(true);
    };
    
    const handleSaveAccount = useCallback((accountData: Omit<Account, 'id'> | Account) => {
        if ('id' in accountData) { // Editing
             setAccounts(prev => prev.map(acc => acc.id === accountData.id ? { ...acc, name: accountData.name, type: accountData.type } : acc));
        } else { // Adding
            const newAccount = { ...accountData, id: `acc-${Date.now()}` };
            setAccounts(prev => [...prev, newAccount]);
        }
    }, []);

    const handleDeleteAccount = useCallback((accountId: string) => {
        if (transactions.some(t => t.accountId === accountId)) {
            alert('Gagal Hapus: Akun ini memiliki transaksi terkait.');
            return;
        }
        setAccounts(prev => prev.filter(acc => acc.id !== accountId));
        setIsAccountFormOpen(false);
    }, [transactions]);

    // --- Transaction Logic ---
    const handleSaveTransaction = useCallback((newTransactionData: Omit<Transaction, 'id'>) => {
        const newTransaction = { ...newTransactionData, id: `trans-${Date.now()}` };
        
        // Update transactions list
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        
        // Update account balance
        const amountChange = newTransaction.type === 'Pemasukan' ? newTransaction.amount : -newTransaction.amount;
        setAccounts(prev => prev.map(acc => acc.id === newTransaction.accountId ? { ...acc, balance: acc.balance + amountChange } : acc));
        
        // Update budget spent amount
        if (newTransaction.type === 'Pengeluaran') {
             setBudgets(prev => prev.map(b => b.category === newTransaction.category ? { ...b, spent: b.spent + newTransaction.amount } : b));
        }
    }, []);
    
    // --- Budget Logic ---
    const handleOpenBudgetForm = (budget: Budget | null) => {
        setBudgetToEdit(budget);
        setIsBudgetFormOpen(true);
    };
    
    const handleSaveBudget = useCallback((budgetData: Omit<Budget, 'id' | 'spent'> | Budget) => {
        const recalculateSpent = (category: string) => transactions
            .filter(t => t.type === 'Pengeluaran' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);

        if ('id' in budgetData) { // Editing
            setBudgets(prev => prev.map(b => b.id === budgetData.id ? { ...b, category: budgetData.category, amount: budgetData.amount, spent: recalculateSpent(budgetData.category) } : b));
        } else { // Adding
            const newBudget = { 
                ...budgetData, 
                id: `budget-${Date.now()}`, 
                spent: recalculateSpent(budgetData.category) 
            };
            setBudgets(prev => [...prev, newBudget]);
        }
    }, [transactions]);


    const handleDeleteBudget = useCallback((budgetId: string) => {
        setBudgets(prev => prev.filter(b => b.id !== budgetId));
        setIsBudgetFormOpen(false);
    }, []);

    // --- Transfer Logic ---
    const handleTransfer = useCallback((fromAccountId: string, toAccountId: string, amount: number, date: string) => {
        const transferOut: Transaction = { id: `t-out-${Date.now()}`, type: 'Pengeluaran', amount, date, category: 'Transfer Keluar', accountId: fromAccountId };
        const transferIn: Transaction = { id: `t-in-${Date.now()}`, type: 'Pemasukan', amount, date, category: 'Transfer Masuk', accountId: toAccountId };

        setTransactions(prev => [transferOut, transferIn, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        setAccounts(prev => prev.map(acc => {
            if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
            return acc;
        }));
        
        setBudgets(prev => prev.map(b => b.category === 'Transfer Keluar' ? { ...b, spent: b.spent + amount } : b));
    }, []);

    const renderView = () => {
        if (!user) return null;
        switch (activeView) {
            case 'dashboard':
                return <Dashboard user={user} accounts={accounts} transactions={transactions} budgets={budgets} onLogout={handleLogout} />;
            case 'transactions':
                return <TransactionsList transactions={transactions} accounts={accounts} />;
            case 'budgets':
                return <Budgets budgets={budgets} onAddBudget={() => handleOpenBudgetForm(null)} onSelectBudget={handleOpenBudgetForm}/>;
            case 'accounts':
                return <Accounts accounts={accounts} onSelectAccount={handleOpenAccountForm} onAddAccount={() => handleOpenAccountForm(null)} onTransfer={() => setIsTransferFormOpen(true)} />;
            case 'reports':
                 return <Reports transactions={transactions} />;
            default:
                return <Dashboard user={user} accounts={accounts} transactions={transactions} budgets={budgets} onLogout={handleLogout} />;
        }
    };
    
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <p className="text-lg font-semibold">Memuat Aplikasi...</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="bg-[var(--bg-primary)] text-[var(--text-primary)] min-h-screen">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
            `}</style>
            <main key={viewKey} className="max-w-md mx-auto bg-[var(--bg-primary)] pb-24">
                {renderView()}
            </main>
            <BottomNavBar 
                activeView={activeView} 
                setActiveView={handleViewChange} 
                onAddTransaction={() => setIsTransactionFormOpen(true)}
            />
            <TransactionForm
                isOpen={isTransactionFormOpen}
                onClose={() => setIsTransactionFormOpen(false)}
                onSave={handleSaveTransaction}
                accounts={accounts}
            />
            <AccountForm
                isOpen={isAccountFormOpen}
                onClose={() => setIsAccountFormOpen(false)}
                onSave={handleSaveAccount}
                onDelete={handleDeleteAccount}
                accountToEdit={accountToEdit}
            />
            <BudgetForm
                isOpen={isBudgetFormOpen}
                onClose={() => setIsBudgetFormOpen(false)}
                onSave={handleSaveBudget}
                onDelete={handleDeleteBudget}
                budgetToEdit={budgetToEdit}
            />
            <TransferForm
                isOpen={isTransferFormOpen}
                onClose={() => setIsTransferFormOpen(false)}
                onTransfer={handleTransfer}
                accounts={accounts}
            />
        </div>
    );
};

export default App;