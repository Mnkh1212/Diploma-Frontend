// ============ Models ============

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: "bank" | "cash" | "credit_card" | "investment";
  balance: number;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
  account: Account;
  category: Category;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: number;
  spent: number;
  month: number;
  year: number;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface ScheduledPayment {
  id: number;
  user_id: number;
  category_id: number;
  account_id: number;
  amount: number;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  next_date: string;
  is_active: boolean;
  category: Category;
  created_at: string;
  updated_at: string;
}

export interface AIChat {
  id: number;
  user_id: number;
  title: string;
  messages: AIMessage[];
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: number;
  chat_id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// ============ API Request/Response ============

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardResponse {
  balance: number;
  total_income: number;
  total_expenses: number;
  savings_percent: number;
  savings_amount: number;
  accounts: Account[];
  recent_transactions: Transaction[];
}

export interface ExpensesSummary {
  total: number;
  categories: CategoryExpense[];
}

export interface CategoryExpense {
  category_id: number;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface StatisticsResponse {
  income: number;
  expenses: number;
  periods: PeriodStats[];
}

export interface PeriodStats {
  label: string;
  income: number;
  expenses: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface BudgetListResponse {
  budgets: Budget[];
  total_budget: number;
  total_spent: number;
  month: number;
  year: number;
}

export interface CreateTransactionRequest {
  account_id: number;
  category_id: number;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
}

export interface AIChatRequest {
  message: string;
  chat_id?: number;
}

export interface AIChatResponse {
  chat_id: number;
  message: AIMessage;
}

// ============ Navigation ============

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  Transactions: undefined;
  Expenses: undefined;
  Budget: undefined;
  AddTransaction: undefined;
  Profile: undefined;
  Privacy: undefined;
  Notifications: undefined;
  Accounts: undefined;
  ScheduledPayments: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  Analytics: undefined;
  Add: undefined;
  "AI Chat": undefined;
  Settings: undefined;
};
