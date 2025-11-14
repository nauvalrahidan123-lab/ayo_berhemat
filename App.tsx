import React, { useState, useEffect, useCallback } from 'react';
import { User, AppView, Account, Transaction, Budget, UserTheme } from './types';
import { THEMES } from './constants';
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

// --- MOCK DATA ---
const getMockData = (userTheme: UserTheme) => {
    const isNauval = userTheme === 'nauval';
    const accounts: Account[] = [
        { id: 'acc1', name: 'BNI', balance: isNauval ? 3500000 : 2800000, type: 'Bank' },
        { id: 'acc2', name: 'GoPay', balance: isNauval ? 750000 : 1200000, type: 'E-Wallet' },
        { id: 'acc3', name: 'Tunai', balance: isNauval ? 250000 : 400000, type: 'Tunai' },
    ];

    const today = new Date();
    const transactions: Transaction[] = [
        { id: 't1', type: 'Pemasukan', amount: isNauval ? 2000000 : 1500000, date: new Date(new Date().setDate(today.getDate() - 2)).toISOString(), category: 'Uang Saku', accountId: 'acc1' },
        { id: 't2', type: 'Pengeluaran', amount: 50000, date: new Date(new Date().setDate(today.getDate() - 1)).toISOString(), category: 'Makanan', accountId: 'acc2' },
        { id: 't3', type: 'Pengeluaran', amount: 25000, date: new Date().toISOString(), category: 'Transportasi', accountId: 'acc3' },
         { id: 't4', type: 'Pengeluaran', amount: 125000, date: new Date(new Date().setDate(today.getDate() - 5)).toISOString(), category: 'Belanja', accountId: 'acc2' },
        { id: 't5', type: 'Pengeluaran', amount: 1500000, date: new Date(new Date().setDate(today.getDate() - 15)).toISOString(), category: 'Biaya Kuliah', accountId: 'acc1' },
    ];

    const budgets: Budget[] = [
        { id: 'b1', category: 'Makanan', amount: 800000, spent: transactions.filter(t => t.category === 'Makanan').reduce((s, t) => s + t.amount, 0) },
        { id: 'b2', category: 'Transportasi', amount: 400000, spent: transactions.filter(t => t.category === 'Transportasi').reduce((s, t) => s + t.amount, 0) },
        { id: 'b3', category: 'Hiburan', amount: 300000, spent: 150000 },
    ];
    
    return { accounts, transactions, budgets };
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<AppView>('dashboard');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [viewKey, setViewKey] = useState(0);

    // Data state
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    
    // Form States
    const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
    const [accountToEdit, setAccountToEdit] = useState<Account | null>(null);
    const [isBudgetFormOpen, setIsBudgetFormOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [isTransferFormOpen, setIsTransferFormOpen] = useState(false);

    useEffect(() => {
        if (user) {
            const { accounts, transactions, budgets } = getMockData(user.theme);
            setAccounts(accounts);
            setTransactions(transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setBudgets(budgets);

            const theme = THEMES[user.theme];
            const root = document.documentElement;
            Object.entries(theme).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }
    }, [user]);
    
    const handleLogin = (loggedInUser: User) => {
        setUser(loggedInUser);
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
            setAccounts(prev => prev.map(acc => acc.id === accountData.id ? accountData : acc));
        } else { // Adding
            const newAccount: Account = {
                ...accountData,
                id: `acc${Date.now()}`,
            };
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
        const newTransaction: Transaction = { ...newTransactionData, id: `t${Date.now()}` };
        setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setAccounts(prev => prev.map(acc => {
            if (acc.id === newTransaction.accountId) {
                const newBalance = newTransaction.type === 'Pemasukan' ? acc.balance + newTransaction.amount : acc.balance - newTransaction.amount;
                return { ...acc, balance: newBalance };
            }
            return acc;
        }));
        setBudgets(prev => prev.map(b => {
             if (b.category === newTransaction.category && newTransaction.type === 'Pengeluaran') {
                 return { ...b, spent: b.spent + newTransaction.amount };
             }
             return b;
        }));
    }, []);
    
    // --- Budget Logic ---
    const handleOpenBudgetForm = (budget: Budget | null) => {
        setBudgetToEdit(budget);
        setIsBudgetFormOpen(true);
    };
    
    const handleSaveBudget = useCallback((budgetData: Omit<Budget, 'id' | 'spent'> | Budget) => {
        if ('id' in budgetData) { // Editing
            setBudgets(prevBudgets => {
                const updatedBudgets = prevBudgets.map(b =>
                    b.id === budgetData.id ? { ...b, category: budgetData.category, amount: budgetData.amount } : b
                );
                // Recalculate spent for the edited budget based on its new name
                return updatedBudgets.map(b => {
                    if(b.id === budgetData.id) {
                        const newSpent = transactions
                            .filter(t => t.type === 'Pengeluaran' && t.category === b.category)
                            .reduce((s, t) => s + t.amount, 0);
                        return { ...b, spent: newSpent };
                    }
                    return b;
                });
            });
        } else { // Adding
            const spent = transactions
                .filter(t => t.type === 'Pengeluaran' && t.category === budgetData.category)
                .reduce((sum, t) => sum + t.amount, 0);

            const newBudget: Budget = {
                ...budgetData,
                id: `b${Date.now()}`,
                spent: spent,
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
        const transferOut: Transaction = {
            id: `t${Date.now()}`,
            type: 'Pengeluaran',
            amount,
            date,
            category: 'Transfer Keluar',
            accountId: fromAccountId
        };
        const transferIn: Transaction = {
            id: `t${Date.now()+1}`,
            type: 'Pemasukan',
            amount,
            date,
            category: 'Transfer Masuk',
            accountId: toAccountId
        };
        
        setAccounts(prev => prev.map(acc => {
            if (acc.id === fromAccountId) return { ...acc, balance: acc.balance - amount };
            if (acc.id === toAccountId) return { ...acc, balance: acc.balance + amount };
            return acc;
        }));
        setTransactions(prev => [transferOut, transferIn, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setBudgets(prev => prev.map(b => {
            if (b.category === transferOut.category) {
                return { ...b, spent: b.spent + transferOut.amount };
            }
            return b;
        }));
    }, []);

    const renderView = () => {
        if (!user) return null;
        switch (activeView) {
            case 'dashboard':
                return <Dashboard user={user} accounts={accounts} transactions={transactions} budgets={budgets} />;
            case 'transactions':
                return <TransactionsList transactions={transactions} accounts={accounts} />;
            case 'budgets':
                return <Budgets budgets={budgets} onAddBudget={() => handleOpenBudgetForm(null)} onSelectBudget={handleOpenBudgetForm}/>;
            case 'accounts':
                return <Accounts accounts={accounts} onSelectAccount={handleOpenAccountForm} onAddAccount={() => handleOpenAccountForm(null)} onTransfer={() => setIsTransferFormOpen(true)} />;
            case 'reports':
                 return <Reports transactions={transactions} />;
            default:
                return <Dashboard user={user} accounts={accounts} transactions={transactions} budgets={budgets} />;
        }
    };
    
    if (!user) {
        return <Login onLogin={handleLogin} />;
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
                onAddTransaction={() => setIsFormOpen(true)}
            />
            <TransactionForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
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