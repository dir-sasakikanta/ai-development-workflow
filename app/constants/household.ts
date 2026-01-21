import type { CategoryType } from '@/app/types/household';

export const EXPENSE_CATEGORIES: CategoryType[] = [
  '食費',
  '交通費',
  '住居費',
  '光熱費',
  '通信費',
  '医療費',
  '娯楽費',
  '衣服費',
  '教育費',
  'その他',
];

export const INCOME_CATEGORIES: CategoryType[] = [
  '給与',
  'ボーナス',
  'その他',
];

export const CATEGORY_COLORS: Record<CategoryType, string> = {
  '食費': '#3b82f6',
  '交通費': '#10b981',
  '住居費': '#f59e0b',
  '光熱費': '#ef4444',
  '通信費': '#8b5cf6',
  '医療費': '#ec4899',
  '娯楽費': '#06b6d4',
  '衣服費': '#84cc16',
  '教育費': '#f97316',
  '給与': '#22c55e',
  'ボーナス': '#14b8a6',
  'その他': '#6b7280',
};
