import type { Transaction, MonthlyStats, CategorySummary, TransactionType, CategoryType } from '@/app/types/household';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function getMonthlyStats(transactions: Transaction[], year: number, month: number): MonthlyStats {
  const filtered = transactions.filter((t) => {
    const date = new Date(t.date);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  });

  const income = filtered
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export function getTotalBalance(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => {
    return t.type === 'income' ? sum + t.amount : sum - t.amount;
  }, 0);
}

export function getCategorySummary(
  transactions: Transaction[],
  type: TransactionType,
  year: number,
  month: number
): CategorySummary[] {
  const filtered = transactions.filter((t) => {
    const date = new Date(t.date);
    return (
      t.type === type &&
      date.getFullYear() === year &&
      date.getMonth() === month - 1
    );
  });

  const categoryMap = new Map<CategoryType, number>();

  filtered.forEach((t) => {
    const current = categoryMap.get(t.category) || 0;
    categoryMap.set(t.category, current + t.amount);
  });

  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  return Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  }));
}

export function getMonthsInRange(transactions: Transaction[]): Array<{ year: number; month: number }> {
  if (transactions.length === 0) {
    const now = new Date();
    return [{ year: now.getFullYear(), month: now.getMonth() + 1 }];
  }

  const dates = transactions.map((t) => new Date(t.date));
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const months: Array<{ year: number; month: number }> = [];
  let current = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
    });
    current.setMonth(current.getMonth() + 1);
  }

  return months.reverse();
}
