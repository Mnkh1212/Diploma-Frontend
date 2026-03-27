import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:8080/api/v1";

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
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.put("/profile", data);

// Dashboard
export const getDashboard = () => api.get("/dashboard");
export const getExpensesSummary = (period) =>
  api.get(`/expenses/summary?period=${period}`);
export const getStatistics = (period) =>
  api.get(`/statistics?period=${period}`);

// Transactions
export const getTransactions = (params) =>
  api.get("/transactions", { params });
export const createTransaction = (data) => api.post("/transactions", data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);

// Budgets
export const getBudgets = (params) => api.get("/budgets", { params });
export const createBudget = (data) => api.post("/budgets", data);
export const updateBudget = (id, data) => api.put(`/budgets/${id}`, data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);

// Accounts
export const getAccounts = () => api.get("/accounts");
export const createAccount = (data) => api.post("/accounts", data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

// Categories
export const getCategories = (type) =>
  api.get(`/categories${type ? `?type=${type}` : ""}`);

// Scheduled Payments
export const getScheduledPayments = () => api.get("/scheduled-payments");
export const createScheduledPayment = (data) =>
  api.post("/scheduled-payments", data);
export const deleteScheduledPayment = (id) =>
  api.delete(`/scheduled-payments/${id}`);

// AI Chat
export const createAIChat = () => api.post("/ai/chats");
export const getAIChats = () => api.get("/ai/chats");
export const getAIChat = (id) => api.get(`/ai/chats/${id}`);
export const sendAIMessage = (data) => api.post("/ai/chat", data);
export const deleteAIChat = (id) => api.delete(`/ai/chats/${id}`);

export default api;
