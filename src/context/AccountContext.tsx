import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { getAccounts } from "../services/api";
import { Account } from "../types";

interface AccountContextType {
  accounts: Account[];
  selectedAccountId: number | null;
  selectedAccount: Account | null;
  setSelectedAccountId: (id: number | null) => void;
  refreshAccounts: () => Promise<void>;
  loading: boolean;
}

const AccountContext = createContext<AccountContextType>({} as AccountContextType);

const STORAGE_KEY = "fintrack:selected_account_id";

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAccounts = useCallback(async () => {
    try {
      const { data } = await getAccounts();
      const list = Array.isArray(data) ? data : [];
      setAccounts(list);

      const savedRaw = await AsyncStorage.getItem(STORAGE_KEY);
      const saved = savedRaw ? Number(savedRaw) : null;
      const stillExists = saved && list.some((a) => a.id === saved);

      if (stillExists) {
        setSelectedAccountIdState(saved);
      } else if (list.length > 0) {
        setSelectedAccountIdState(list[0].id);
        await AsyncStorage.setItem(STORAGE_KEY, String(list[0].id));
      } else {
        setSelectedAccountIdState(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore — keep stale state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      refreshAccounts();
    } else {
      setAccounts([]);
      setSelectedAccountIdState(null);
      setLoading(false);
    }
  }, [user, refreshAccounts]);

  const setSelectedAccountId = (id: number | null) => {
    setSelectedAccountIdState(id);
    if (id) {
      AsyncStorage.setItem(STORAGE_KEY, String(id)).catch(() => {});
    } else {
      AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    }
  };

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) || null;

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        setSelectedAccountId,
        refreshAccounts,
        loading,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => useContext(AccountContext);
export default AccountContext;
