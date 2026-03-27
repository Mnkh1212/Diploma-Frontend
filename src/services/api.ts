import axios, { AxiosResponse } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthResponse,
  User,
  DashboardResponse,
  ExpensesSummary,
  StatisticsResponse,
  Transaction,
  PaginatedResponse,
  CreateTransactionRequest,
  BudgetListResponse,
  Budget,
  Account,
  Category,
  ScheduledPayment,
  AIChat,
  AIChatRequest,
  AIChatResponse,
} from "../types";

const API_URL = "http://192.168.1.130:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data: { email: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
  api.post("/auth/login", data);
export const register = (data: { name: string; email: string; password: string }): Promise<AxiosResponse<AuthResponse>> =>
  api.post("/auth/register", data);
export const getProfile = (): Promise<AxiosResponse<User>> => api.get("/profile");
export const updateProfile = (data: Partial<User>): Promise<AxiosResponse<User>> =>
  api.put("/profile", data);

// Dashboard
export const getDashboard = (): Promise<AxiosResponse<DashboardResponse>> =>
  api.get("/dashboard");
export const getExpensesSummary = (period: string): Promise<AxiosResponse<ExpensesSummary>> =>
  api.get(`/expenses/summary?period=${period}`);
export const getStatistics = (period: string): Promise<AxiosResponse<StatisticsResponse>> =>
  api.get(`/statistics?period=${period}`);

// Transactions
export const getTransactions = (params: Record<string, string | number>): Promise<AxiosResponse<PaginatedResponse<Transaction>>> =>
  api.get("/transactions", { params });
export const createTransaction = (data: CreateTransactionRequest): Promise<AxiosResponse<Transaction>> =>
  api.post("/transactions", data);
export const deleteTransaction = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/transactions/${id}`);

// Budgets
export const getBudgets = (params?: Record<string, string | number>): Promise<AxiosResponse<BudgetListResponse>> =>
  api.get("/budgets", { params });
export const createBudget = (data: { category_id?: number; amount: number; month: number; year: number }): Promise<AxiosResponse<Budget>> =>
  api.post("/budgets", data);
export const updateBudget = (id: number, data: { amount: number }): Promise<AxiosResponse<Budget>> =>
  api.put(`/budgets/${id}`, data);
export const deleteBudget = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/budgets/${id}`);

// Accounts
export const getAccounts = (): Promise<AxiosResponse<Account[]>> => api.get("/accounts");
export const createAccount = (data: Partial<Account>): Promise<AxiosResponse<Account>> =>
  api.post("/accounts", data);
export const deleteAccount = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/accounts/${id}`);

// Categories
export const getCategories = (type?: string): Promise<AxiosResponse<Category[]>> =>
  api.get(`/categories${type ? `?type=${type}` : ""}`);

// Scheduled Payments
export const getScheduledPayments = (): Promise<AxiosResponse<ScheduledPayment[]>> =>
  api.get("/scheduled-payments");
export const createScheduledPayment = (data: Partial<ScheduledPayment>): Promise<AxiosResponse<ScheduledPayment>> =>
  api.post("/scheduled-payments", data);
export const deleteScheduledPayment = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/scheduled-payments/${id}`);

// AI Chat
export const createAIChat = (): Promise<AxiosResponse<AIChat>> => api.post("/ai/chats");
export const getAIChats = (): Promise<AxiosResponse<AIChat[]>> => api.get("/ai/chats");
export const getAIChat = (id: number): Promise<AxiosResponse<AIChat>> => api.get(`/ai/chats/${id}`);
export const sendAIMessage = (data: AIChatRequest): Promise<AxiosResponse<AIChatResponse>> =>
  api.post("/ai/chat", data);
export const deleteAIChat = (id: number): Promise<AxiosResponse<{ message: string }>> =>
  api.delete(`/ai/chats/${id}`);

export default api;
