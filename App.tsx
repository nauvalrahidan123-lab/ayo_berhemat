
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, AppView, Account, Transaction, Budget } from './types';
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
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
    collection, query, onSnapshot, doc, getDoc, addDoc, updateDoc, deleteDoc,
    serverTimestamp, writeBatch, Timestamp, orderBy, where, getDocs
} from 'firebase/firestore';


const App: React.FC = () => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
    
    // Seed initial data for new users
    const seedInitialData = async (uid: string, theme: 'nauval' | 'mufel') => {
        const isNauval = theme === 'nauval';
        const initialAccounts = [
            { name: 'BNI', balance: isNauval ? 3500000 : 2800000, type: 'Bank' },
            { name: 'GoPay', balance: isNauval ? 750000 : 1200000, type: 'E-Wallet' },
            { name: 'Tunai', balance: isNauval ? 250000 : 400000, type: 'Tunai' },
        ];
        const accountRefs = await Promise.all(
            initialAccounts.map(acc => addDoc(collection(db, `users/${uid}/accounts`), acc))
        );
        const accountIds = accountRefs.map(ref => ref.id);

        const today = new Date();
        const initialTransactions = [
            { type: 'Pemasukan', amount: isNauval ? 2000000 : 1500000, date: new Date(new Date().setDate(today.getDate() - 2)), category: 'Uang Saku', accountId: accountIds[0] },
            { type: 'Pengeluaran', amount: 50000, date: new Date(new Date().setDate(today.getDate() - 1)), category: 'Makanan', accountId: accountIds[1] },
        ];

        await Promise.all(
            initialTransactions.map(t => addDoc(collection(db, `users/${uid}/transactions`), { ...t, createdAt: serverTimestamp() }))
        );

        const initialBudgets = [
            { category: 'Makanan', amount: 800000 },
            { category: 'Transportasi', amount: 400000 },
        ];
        await Promise.all(
            initialBudgets.map(b => addDoc(collection(db, `users/${uid}/budgets`), b))
        );
    };


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setFirebaseUser(user);
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    const profileData = userDocSnap.data() as UserProfile;
                    setUserProfile(profileData);
                    
                    // Check if user has accounts, if not, it's a new user, so seed data
                    const accountsQuery = query(collection(db, `users/${user.uid}/accounts`));
                    const accountsSnapshot = await getDocs(accountsQuery);
                    if (accountsSnapshot.empty) {
                        await seedInitialData(user.uid, profileData.theme);
                    }
                }
            } else {
                setFirebaseUser(null);
                setUserProfile(null);
                setAccounts([]);
                setTransactions([]);
                setBudgets([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (userProfile) {
            const theme = THEMES[userProfile.theme];
            const root = document.documentElement;
            Object.entries(theme).forEach(([key, value]) => {
                root.style.setProperty(key, value);
            });
        }
    }, [userProfile]);

     useEffect(() => {
        if (!firebaseUser) return;
        const uid = firebaseUser.uid;
        
        const qTransactions = query(collection(db, `users/${uid}/transactions`), orderBy('date', 'desc'));
        const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
            const fetchedTransactions = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: (data.date as Timestamp).toDate().toISOString(),
                } as Transaction
            });
            setTransactions(fetchedTransactions);
        });

        const qAccounts = query(collection(db, `users/${uid}/accounts`));
        const unsubAccounts = onSnapshot(qAccounts, (snapshot) => {
            const fetchedAccounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Account));
            setAccounts(fetchedAccounts);
        });
        
        const qBudgets = query(collection(db, `users/${uid}/budgets`));
        const unsubBudgets = onSnapshot(qBudgets, (snapshot) => {
            const fetchedBudgets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
            setBudgets(fetchedBudgets);
        });

        return () => {
            unsubTransactions();
            unsubAccounts();
            unsubBudgets();
        };
    }, [firebaseUser]);

    // Recalculate budget spent whenever transactions change
    useEffect(() => {
        if (budgets.length > 0) {
           budgets.forEach(budget => {
                const spent = transactions
                    .filter(t => t.type === 'Pengeluaran' && t.category === budget.category)
                    .reduce((sum, t) => sum + t.amount, 0);
                
                if (budget.spent !== spent && firebaseUser) {
                    const budgetRef = doc(db, 'users', firebaseUser.uid, 'budgets', budget.id);
                    updateDoc(budgetRef, { spent });
                }
           });
        }
    }, [transactions, budgets, firebaseUser]);


    const handleViewChange = (view: AppView) => {
        setActiveView(view);
        setViewKey(prev => prev + 1);
    };
    
    const handleOpenAccountForm = (account: Account | null) => {
        setAccountToEdit(account);
        setIsAccountFormOpen(true);
    };
    
    const handleSaveAccount = useCallback(async (accountData: Omit<Account, 'id'> | Account) => {
        if (!firebaseUser) return;
        const uid = firebaseUser.uid;
        if ('id' in accountData) { // Editing
            const accountRef = doc(db, 'users', uid, 'accounts', accountData.id);
            await updateDoc(accountRef, { name: accountData.name, type: accountData.type });
        } else { // Adding
            await addDoc(collection(db, 'users', uid, 'accounts'), accountData);
        }
    }, [firebaseUser]);

    const handleDeleteAccount = useCallback(async (accountId: string) => {
        if (!firebaseUser) return;
        if (transactions.some(t => t.accountId === accountId)) {
            alert('Gagal Hapus: Akun ini memiliki transaksi terkait.');
            return;
        }
        await deleteDoc(doc(db, 'users', firebaseUser.uid, 'accounts', accountId));
        setIsAccountFormOpen(false);
    }, [firebaseUser, transactions]);

    const handleSaveTransaction = useCallback(async (newTransactionData: Omit<Transaction, 'id'>) => {
        if (!firebaseUser) return;
        const batch = writeBatch(db);
        const uid = firebaseUser.uid;

        const transactionWithTimestamp = {
            ...newTransactionData,
            date: Timestamp.fromDate(new Date(newTransactionData.date)),
            createdAt: serverTimestamp()
        };
        const transactionCollectionRef = collection(db, 'users', uid, 'transactions');
        batch.set(doc(transactionCollectionRef), transactionWithTimestamp);
        
        const accountRef = doc(db, 'users', uid, 'accounts', newTransactionData.accountId);
        const account = accounts.find(a => a.id === newTransactionData.accountId);
        if(account) {
            const newBalance = newTransactionData.type === 'Pemasukan'
                ? account.balance + newTransactionData.amount
                : account.balance - newTransactionData.amount;
            batch.update(accountRef, { balance: newBalance });
        }
        await batch.commit();

    }, [firebaseUser, accounts]);
    
    const handleOpenBudgetForm = (budget: Budget | null) => {
        setBudgetToEdit(budget);
        setIsBudgetFormOpen(true);
    };
    
    const handleSaveBudget = useCallback(async (budgetData: Omit<Budget, 'id' | 'spent'> | Budget) => {
        if (!firebaseUser) return;
        const uid = firebaseUser.uid;
        const spent = transactions
            .filter(t => t.type === 'Pengeluaran' && t.category === budgetData.category)
            .reduce((sum, t) => sum + t.amount, 0);

        if ('id' in budgetData) { // Editing
            const budgetRef = doc(db, 'users', uid, 'budgets', budgetData.id);
            await updateDoc(budgetRef, { category: budgetData.category, amount: budgetData.amount, spent });
        } else { // Adding
            const newBudget = { ...budgetData, spent };
            await addDoc(collection(db, 'users', uid, 'budgets'), newBudget);
        }
    }, [firebaseUser, transactions]);

    const handleDeleteBudget = useCallback(async (budgetId: string) => {
        if (!firebaseUser) return;
        await deleteDoc(doc(db, 'users', firebaseUser.uid, 'budgets', budgetId));
        setIsBudgetFormOpen(false);
    }, [firebaseUser]);

    const handleTransfer = useCallback(async (fromAccountId: string, toAccountId: string, amount: number, date: string) => {
        if (!firebaseUser) return;
        const uid = firebaseUser.uid;
        const batch = writeBatch(db);

        const fromAccount = accounts.find(a => a.id === fromAccountId);
        const toAccount = accounts.find(a => a.id === toAccountId);
        if(!fromAccount || !toAccount) return;

        // 1. Create transfer out transaction
        const transferOut = { type: 'Pengeluaran', amount, date: Timestamp.fromDate(new Date(date)), category: 'Transfer Keluar', accountId: fromAccountId, createdAt: serverTimestamp() };
        batch.set(doc(collection(db, `users/${uid}/transactions`)), transferOut);
        
        // 2. Create transfer in transaction
        const transferIn = { type: 'Pemasukan', amount, date: Timestamp.fromDate(new Date(date)), category: 'Transfer Masuk', accountId: toAccountId, createdAt: serverTimestamp() };
        batch.set(doc(collection(db, `users/${uid}/transactions`)), transferIn);

        // 3. Update fromAccount balance
        const fromAccRef = doc(db, `users/${uid}/accounts`, fromAccountId);
        batch.update(fromAccRef, { balance: fromAccount.balance - amount });

        // 4. Update toAccount balance
        const toAccRef = doc(db, `users/${uid}/accounts`, toAccountId);
        batch.update(toAccRef, { balance: toAccount.balance + amount });
        
        await batch.commit();

    }, [firebaseUser, accounts]);

    const renderView = () => {
        if (!userProfile) return null;
        switch (activeView) {
            case 'dashboard':
                return <Dashboard user={userProfile} accounts={accounts} transactions={transactions} budgets={budgets} />;
            case 'transactions':
                return <TransactionsList transactions={transactions} accounts={accounts} />;
            case 'budgets':
                return <Budgets budgets={budgets} onAddBudget={() => handleOpenBudgetForm(null)} onSelectBudget={handleOpenBudgetForm}/>;
            case 'accounts':
                return <Accounts accounts={accounts} onSelectAccount={handleOpenAccountForm} onAddAccount={() => handleOpenAccountForm(null)} onTransfer={() => setIsTransferFormOpen(true)} />;
            case 'reports':
                 return <Reports transactions={transactions} />;
            default:
                return <Dashboard user={userProfile} accounts={accounts} transactions={transactions} budgets={budgets} />;
        }
    };
    
    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Loading...</div>;
    }

    if (!firebaseUser) {
        return <Login />;
    }
    
    if (!userProfile) {
         return <div className="min-h-screen bg-gray-100 flex justify-center items-center">Loading Profile...</div>;
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
