import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  type: 'debit' | 'credit';
  category: 'food' | 'shopping' | 'bills' | 'transport' | 'salary' | 'entertainment';
  date: string;
  icon: string;
}

export interface AIInsight {
  id: string;
  type: 'saving' | 'prediction' | 'subscription' | 'fraud';
  title: string;
  message: string;
  actionLabel?: string;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
  icon: string;
}

export interface Challenge {
  id: string;
  title: string;
  target: number;
  current: number;
  reward: string;
  daysLeft: number;
}

interface BankContextType {
  balance: number;
  cardNumber: string;
  savingsGoalPercent: number;
  healthScore: number;
  daysToSalary: number;
  transactions: Transaction[];
  insights: AIInsight[];
  spendingCategories: SpendingCategory[];
  challenges: Challenge[];
  isCardFrozen: boolean;
  freezeCard: () => void;
  unfreezeCard: () => void;
}

const BankContext = createContext<BankContextType | undefined>(undefined);

const TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Salary Deposit', subtitle: 'Company Transfer', amount: 12000, type: 'credit', category: 'salary', date: 'Jul 1', icon: 'briefcase' },
  { id: '2', title: 'Noon Shopping', subtitle: 'Online Purchase', amount: 430, type: 'debit', category: 'shopping', date: 'Jul 3', icon: 'shopping-bag' },
  { id: '3', title: 'STC Bill', subtitle: 'Internet & Mobile', amount: 180, type: 'debit', category: 'bills', date: 'Jul 4', icon: 'wifi' },
  { id: '4', title: 'Starbucks', subtitle: 'Riyadh Park Mall', amount: 45, type: 'debit', category: 'food', date: 'Jul 5', icon: 'coffee' },
  { id: '5', title: 'Careem', subtitle: 'Ride Service', amount: 28, type: 'debit', category: 'transport', date: 'Jul 6', icon: 'navigation' },
  { id: '6', title: 'SACO', subtitle: 'Home & Garden', amount: 860, type: 'debit', category: 'shopping', date: 'Jul 7', icon: 'shopping-cart' },
  { id: '7', title: 'Carrefour', subtitle: 'Grocery Shopping', amount: 235, type: 'debit', category: 'food', date: 'Jul 8', icon: 'shopping-bag' },
  { id: '8', title: 'Freelance Income', subtitle: 'Design Project', amount: 3200, type: 'credit', category: 'salary', date: 'Jul 9', icon: 'dollar-sign' },
  { id: '9', title: 'Netflix', subtitle: 'Monthly Subscription', amount: 45, type: 'debit', category: 'entertainment', date: 'Jul 10', icon: 'play' },
  { id: '10', title: 'Al Baik', subtitle: 'Fast Food', amount: 68, type: 'debit', category: 'food', date: 'Jul 11', icon: 'coffee' },
  { id: '11', title: 'DEWA Bill', subtitle: 'Electricity', amount: 320, type: 'debit', category: 'bills', date: 'Jul 12', icon: 'zap' },
  { id: '12', title: 'Amazon', subtitle: 'Online Shopping', amount: 512, type: 'debit', category: 'shopping', date: 'Jul 13', icon: 'shopping-bag' },
];

const INSIGHTS: AIInsight[] = [
  {
    id: '1',
    type: 'saving',
    title: 'Saving Opportunity',
    message: 'You have 500 SAR idle for 6 months. Move to savings for 3.2% annual return.',
    actionLabel: 'Move to Savings',
  },
  {
    id: '2',
    type: 'prediction',
    title: 'Month-End Forecast',
    message: 'Based on your spending pattern, you will have ~3,200 SAR at month end.',
    actionLabel: 'See Details',
  },
  {
    id: '3',
    type: 'subscription',
    title: 'Unused Subscription',
    message: 'Shahid subscription (45 SAR/mo) unused for 3 months.',
    actionLabel: 'Cancel',
  },
  {
    id: '4',
    type: 'fraud',
    title: 'Fraud Alert',
    message: 'Suspicious withdrawal of 50,000 SAR from an unknown device detected.',
    actionLabel: 'Review Now',
  },
];

const SPENDING: SpendingCategory[] = [
  { name: 'Food & Dining', amount: 1200, color: '#f59e0b', icon: 'coffee' },
  { name: 'Shopping', amount: 800, color: '#8b5cf6', icon: 'shopping-bag' },
  { name: 'Bills', amount: 500, color: '#3b82f6', icon: 'zap' },
  { name: 'Transport', amount: 350, color: '#10b981', icon: 'navigation' },
  { name: 'Entertainment', amount: 250, color: '#ec4899', icon: 'play' },
];

const CHALLENGES: Challenge[] = [
  { id: '1', title: 'Save 100 SAR This Week', target: 100, current: 65, reward: 'Financial Saver Badge', daysLeft: 3 },
  { id: '2', title: 'No Restaurant Spending', target: 7, current: 4, reward: 'Discipline Badge', daysLeft: 3 },
  { id: '3', title: 'Pay 3 Bills Early', target: 3, current: 2, reward: 'Responsible Badge', daysLeft: 10 },
];

export function BankProvider({ children }: { children: ReactNode }) {
  const [isCardFrozen, setIsCardFrozen] = useState(false);

  return (
    <BankContext.Provider value={{
      balance: 25450,
      cardNumber: '4532 **** **** 8821',
      savingsGoalPercent: 68,
      healthScore: 91,
      daysToSalary: 9,
      transactions: TRANSACTIONS,
      insights: INSIGHTS,
      spendingCategories: SPENDING,
      challenges: CHALLENGES,
      isCardFrozen,
      freezeCard: () => setIsCardFrozen(true),
      unfreezeCard: () => setIsCardFrozen(false),
    }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used within BankProvider');
  return ctx;
}
