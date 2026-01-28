'use client';

import { useState, useMemo } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useTransactions } from '@/app/hooks/useTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '@/app/constants/household';
import {
  formatCurrency,
  formatDate,
  getMonthlyStats,
  getTotalBalance,
  getCategorySummary,
  getMonthsInRange,
} from '@/app/utils/household';
import type { TransactionType, CategoryType, CategorySummary } from '@/app/types/household';

export default function HouseholdPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formType, setFormType] = useState<TransactionType>('expense');
  const [formCategory, setFormCategory] = useState<CategoryType>('食費');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(now.toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');

  const totalBalance = useMemo(() => getTotalBalance(transactions), [transactions]);
  const monthlyStats = useMemo(
    () => getMonthlyStats(transactions, selectedYear, selectedMonth),
    [transactions, selectedYear, selectedMonth]
  );
  const availableMonths = useMemo(() => getMonthsInRange(transactions), [transactions]);

  const monthlyTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth - 1;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear, selectedMonth]);

  const expenseSummary = useMemo(
    () => getCategorySummary(transactions, 'expense', selectedYear, selectedMonth),
    [transactions, selectedYear, selectedMonth]
  );

  const incomeSummary = useMemo(
    () => getCategorySummary(transactions, 'income', selectedYear, selectedMonth),
    [transactions, selectedYear, selectedMonth]
  );

  const resetForm = () => {
    setFormType('expense');
    setFormCategory('食費');
    setFormAmount('');
    setFormDate(now.toISOString().split('T')[0]);
    setFormDescription('');
  };

  const handleAddTransaction = () => {
    if (!formAmount || parseFloat(formAmount) <= 0) return;

    addTransaction({
      type: formType,
      category: formCategory,
      amount: parseFloat(formAmount),
      date: formDate,
      description: formDescription,
    });

    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditTransaction = () => {
    if (!editingId || !formAmount || parseFloat(formAmount) <= 0) return;

    updateTransaction(editingId, {
      type: formType,
      category: formCategory,
      amount: parseFloat(formAmount),
      date: formDate,
      description: formDescription,
    });

    resetForm();
    setEditingId(null);
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    setEditingId(id);
    setFormType(transaction.type);
    setFormCategory(transaction.category);
    setFormAmount(transaction.amount.toString());
    setFormDate(transaction.date);
    setFormDescription(transaction.description);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('この取引を削除しますか？')) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          💰 家計簿アプリ
        </h1>

        <Tabs.Root defaultValue="overview" className="w-full">
          <Tabs.List className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-md">
            <Tabs.Trigger
              value="overview"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              概要
            </Tabs.Trigger>
            <Tabs.Trigger
              value="history"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              履歴
            </Tabs.Trigger>
            <Tabs.Trigger
              value="breakdown"
              className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-100"
            >
              内訳
            </Tabs.Trigger>
          </Tabs.List>

          {/* 概要タブ */}
          <Tabs.Content value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">💵</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">総資産</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-2">表示月</label>
                  <select
                    value={`${selectedYear}-${selectedMonth}`}
                    onChange={(e) => {
                      const [year, month] = e.target.value.split('-');
                      setSelectedYear(parseInt(year));
                      setSelectedMonth(parseInt(month));
                    }}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {availableMonths.map(({ year, month }) => (
                      <option key={`${year}-${month}`} value={`${year}-${month}`}>
                        {year}年 {month}月
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">📈</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">収入</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(monthlyStats.income)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">📉</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">支出</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(monthlyStats.expense)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">新しい取引を追加</h2>
              <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <Dialog.Trigger asChild>
                  <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                    + 取引を追加
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                    <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
                      取引を追加
                    </Dialog.Title>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setFormType('expense');
                              setFormCategory('食費');
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                              formType === 'expense'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            支出
                          </button>
                          <button
                            onClick={() => {
                              setFormType('income');
                              setFormCategory('給与');
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                              formType === 'income'
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            収入
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {(formType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                        <input
                          type="number"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          placeholder="1000"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                        <input
                          type="date"
                          value={formDate}
                          onChange={(e) => setFormDate(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                        <input
                          type="text"
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="説明（任意）"
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Dialog.Close asChild>
                        <button className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors font-medium">
                          キャンセル
                        </button>
                      </Dialog.Close>
                      <button
                        onClick={handleAddTransaction}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                      >
                        追加
                      </button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </Tabs.Content>

          {/* 履歴タブ */}
          <Tabs.Content value="history" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedYear}年 {selectedMonth}月の取引
                </h2>
                <select
                  value={`${selectedYear}-${selectedMonth}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setSelectedYear(parseInt(year));
                    setSelectedMonth(parseInt(month));
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {availableMonths.map(({ year, month }) => (
                    <option key={`${year}-${month}`} value={`${year}-${month}`}>
                      {year}年 {month}月
                    </option>
                  ))}
                </select>
              </div>

              {monthlyTransactions.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg">取引がありません</p>
                  <p className="text-sm">概要タブから取引を追加してください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {monthlyTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">{transaction.category}</span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.type === 'income' ? '収入' : '支出'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>{formatDate(transaction.date)}</span>
                          {transaction.description && <span>{transaction.description}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xl font-bold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => openEditDialog(transaction.id)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                  <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6">
                    取引を編集
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setFormType('expense');
                            setFormCategory('食費');
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            formType === 'expense'
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          支出
                        </button>
                        <button
                          onClick={() => {
                            setFormType('income');
                            setFormCategory('給与');
                          }}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                            formType === 'income'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          収入
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value as CategoryType)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        {(formType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">金額</label>
                      <input
                        type="number"
                        value={formAmount}
                        onChange={(e) => setFormAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">日付</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">メモ</label>
                      <input
                        type="text"
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Dialog.Close asChild>
                      <button className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors font-medium">
                        キャンセル
                      </button>
                    </Dialog.Close>
                    <button
                      onClick={handleEditTransaction}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      更新
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </Tabs.Content>

          {/* 内訳タブ */}
          <Tabs.Content value="breakdown" className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedYear}年 {selectedMonth}月の内訳
                </h2>
                <select
                  value={`${selectedYear}-${selectedMonth}`}
                  onChange={(e) => {
                    const [year, month] = e.target.value.split('-');
                    setSelectedYear(parseInt(year));
                    setSelectedMonth(parseInt(month));
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {availableMonths.map(({ year, month }) => (
                    <option key={`${year}-${month}`} value={`${year}-${month}`}>
                      {year}年 {month}月
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 支出の内訳 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">支出の内訳</h3>
                  {expenseSummary.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>支出データがありません</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-64 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={expenseSummary}
                              dataKey="amount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={(entry) => {
                                const data = entry as unknown as CategorySummary;
                                return `${data.category} ${data.percentage.toFixed(1)}%`;
                              }}
                            >
                              {expenseSummary.map((entry) => (
                                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => value !== undefined ? formatCurrency(value as number) : ''} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {expenseSummary.map((item) => (
                          <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                              />
                              <span className="font-medium text-gray-900">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                              <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* 収入の内訳 */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">収入の内訳</h3>
                  {incomeSummary.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>収入データがありません</p>
                    </div>
                  ) : (
                    <>
                      <div className="h-64 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incomeSummary}
                              dataKey="amount"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label={(entry) => {
                                const data = entry as unknown as CategorySummary;
                                return `${data.category} ${data.percentage.toFixed(1)}%`;
                              }}
                            >
                              {incomeSummary.map((entry) => (
                                <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => value !== undefined ? formatCurrency(value as number) : ''} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {incomeSummary.map((item) => (
                          <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: CATEGORY_COLORS[item.category] }}
                              />
                              <span className="font-medium text-gray-900">{item.category}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                              <p className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
