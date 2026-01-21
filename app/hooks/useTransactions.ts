import { useLocalStorage } from './useLocalStorage';
import type { Transaction } from '@/app/types/household';

export function useTransactions() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('household-transactions', []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}
