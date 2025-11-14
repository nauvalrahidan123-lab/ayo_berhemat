import React, { useState, useEffect, useCallback } from 'react';
import { User, AppView, Account, Transaction, Budget } from './types';
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

// --- Firebase Imports ---
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import {
    collection,
    doc,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    query,
    orderBy,
    writeBatch,
    increment,
    Timestamp,
} from 'firebase/firestore';


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            if (fbUser) {
                setFirebaseUser(fbUser);
                const userDocRef = doc(db, 'users', fbUser.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    const appUser: User = {
                        uid: fbUser.uid,
                        username: userData.username,
                        theme: userData.theme,
                    };
                    setUser(appUser);

                    const theme = THEMES[appUser.theme];
                    const root = document.documentElement;
                    Object.entries(theme).forEach(([key, value]) => {
                        root.style.setProperty(key, value);
                    });
                } else {
                    // Handle case where user exists in Auth but not Firestore, maybe sign them out
                    console.error("User document not found in Firestore.");
                    await signOut(auth);
                }
            } else {
                setUser(null);
                setFirebaseUser(null);
                setAccounts([]);
                setTransactions([]);
                setBudgets([]);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Data fetching effects
    useEffect(() => {
        if (!firebaseUser) return;
        
        const userDocPath = `users/${firebaseUser.uid}`;

        const unsubAccounts = onSnapshot(collection(db, userDocPath, 'accounts'), (snapshot) => {
            const fetchedAccounts: Account[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
            setAccounts(fetchedAccounts);
        });

        const q = query(collection(db, userDocPath, 'transactions'), orderBy('date', 'desc'));
        const unsubTransactions = onSnapshot(q, (snapshot) => {
            const fetchedTransactions: Transaction[] = snapshot.docs.map(doc => {
                 const data = doc.data();
                 return {
                    id: doc.id,
                    ...data,
                    date: (data.date as Timestamp).toDate().toISOString(),
                 } as Transaction
            });
            setTransactions(fetchedTransactions);
        });
        
        const unsubBudgets = onSnapshot(collection(db, userDocPath, 'budgets'), (snapshot) => {
            const fetchedBudgets: Budget[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
            setBudgets(fetchedBudgets);
        });

        return () => {
            unsubAccounts();
            unsubTransactions();
            unsubBudgets();
        };

    }, [firebaseUser]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };
    
    const handleViewChange = (view: AppView) => {
        setActiveView(view);
        setViewKey(prev => prev + 1);
    };

    const userPath = `users/${firebaseUser?.uid}`;
    
    // --- Account Logic ---
    const handleOpenAccountForm = (account: Account | null) => {
        setAccountToEdit(account);
        setIsAccountFormOpen(true);
    };
    
    const handleSaveAccount = useCallback(async (accountData: Omit<Account, 'id'> | Account) => {
        if (!firebaseUser) return;
        if ('id' in accountData) { // Editing
            const { id, ...dataToUpdate } = accountData;
            await updateDoc(doc(db, userPath, 'accounts', id), dataToUpdate);
        } else { // Adding
            await addDoc(collection(db, userPath, 'accounts'), accountData);
        }
    }, [firebaseUser, userPath]);

    const handleDeleteAccount = useCallback(async (accountId: string) => {
        if (!firebaseUser) return;
        if (transactions.some(t => t.accountId === accountId)) {
            alert('Gagal Hapus: Akun ini memiliki transaksi terkait.');
            return;
        }
        await deleteDoc(doc(db, userPath, 'accounts', accountId));
        setIsAccountFormOpen(false);
    }, [firebaseUser, userPath, transactions]);

    // --- Transaction Logic ---
    const handleSaveTransaction = useCallback(async (newTransactionData: Omit<Transaction, 'id'>) => {
        if (!firebaseUser) return;
        
        const batch = writeBatch(db);
        
        // 1. Add new transaction
        const transactionWithTimestamp = {
            ...newTransactionData,
            date: Timestamp.fromDate(new Date(newTransactionData.date))
        };
        const newTransactionRef = doc(collection(db, userPath, 'transactions'));
        batch.set(newTransactionRef, transactionWithTimestamp);

        // 2. Update account balance
        const accountRef = doc(db, userPath, 'accounts', newTransactionData.accountId);
        const amountChange = newTransactionData.type === 'Pemasukan' ? newTransactionData.amount : -newTransactionData.amount;
        batch.update(accountRef, { balance: increment(amountChange) });
        
        // 3. Update budget spent amount
        if (newTransactionData.type === 'Pengeluaran') {
             const budgetToUpdate = budgets.find(b => b.category === newTransactionData.category);
             if (budgetToUpdate) {
                 const budgetRef = doc(db, userPath, 'budgets', budgetToUpdate.id);
                 batch.update(budgetRef, { spent: increment(newTransactionData.amount) });
             }
        }
        
        await batch.commit();
    }, [firebaseUser, userPath, budgets]);
    
    // --- Budget Logic ---
    const handleOpenBudgetForm = (budget: Budget | null) => {
        setBudgetToEdit(budget);
        setIsBudgetFormOpen(true);
    };
    
    const handleSaveBudget = useCallback(async (budgetData: Omit<Budget, 'id' | 'spent'> | Budget) => {
        if (!firebaseUser) return;
        if ('id' in budgetData) { // Editing
            const { id, category, amount } = budgetData;
            // Recalculate spent if category name changes (though this form doesn't encourage it)
            const newSpent = transactions
                .filter(t => t.type === 'Pengeluaran' && t.category === category)
                .reduce((s, t) => s + t.amount, 0);
            await updateDoc(doc(db, userPath, 'budgets', id), { category, amount, spent: newSpent });

        } else { // Adding
            const spent = transactions
                .filter(t => t.type === 'Pengeluaran' && t.category === budgetData.category)
                .reduce((sum, t) => sum + t.amount, 0);

            const newBudget = { ...budgetData, spent };
            await addDoc(collection(db, userPath, 'budgets'), newBudget);
        }
    }, [firebaseUser, userPath, transactions]);


    const handleDeleteBudget = useCallback(async (budgetId: string) => {
        if (!firebaseUser) return;
        await deleteDoc(doc(db, userPath, 'budgets', budgetId));
        setIsBudgetFormOpen(false);
    }, [firebaseUser, userPath]);

    // --- Transfer Logic ---
    const handleTransfer = useCallback(async (fromAccountId: string, toAccountId: string, amount: number, date: string) => {
        if (!firebaseUser) return;
        
        const batch = writeBatch(db);
        const transactionDate = Timestamp.fromDate(new Date(date));

        // 1. Create transfer out transaction
        const transferOut: Omit<Transaction, 'id'> = { type: 'Pengeluaran', amount, date, category: 'Transfer Keluar', accountId: fromAccountId };
        batch.set(doc(collection(db, userPath, 'transactions')), { ...transferOut, date: transactionDate });

        // 2. Create transfer in transaction
        const transferIn: Omit<Transaction, 'id'> = { type: 'Pemasukan', amount, date, category: 'Transfer Masuk', accountId: toAccountId };
        batch.set(doc(collection(db, userPath, 'transactions')), { ...transferIn, date: transactionDate });
        
        // 3. Update account balances
        batch.update(doc(db, userPath, 'accounts', fromAccountId), { balance: increment(-amount) });
        batch.update(doc(db, userPath, 'accounts', toAccountId), { balance: increment(amount) });
        
        // 4. Update budget for "Transfer Keluar" if it exists
        const transferBudget = budgets.find(b => b.category === 'Transfer Keluar');
        if (transferBudget) {
            batch.update(doc(db, userPath, 'budgets', transferBudget.id), { spent: increment(amount) });
        }
        
        await batch.commit();
    }, [firebaseUser, userPath, budgets]);

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
                    <p className="text-lg font-semibold">Memuat Data...</p>
                    <p className="text-gray-500">Silakan tunggu sebentar.</p>
                </div>
            </div>
        );
    }
    
    if (!user) {
        return <Login />;
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
