export type TransactionType = 'income' | 'expense';

export type CategoryType =
  | '食費'
  | '交通費'
  | '住居費'
  | '光熱費'
  | '通信費'
  | '医療費'
  | '娯楽費'
  | '衣服費'
  | '教育費'
  | '給与'
  | 'ボーナス'
  | 'その他';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: CategoryType;
  amount: number;
  date: string; // YYYY-MM-DD format
  description: string;
}

export interface MonthlyStats {
  income: number;
  expense: number;
  balance: number;
}

export interface CategorySummary {
  category: CategoryType;
  amount: number;
  percentage: number;
  [key: string]: string | number;
}
