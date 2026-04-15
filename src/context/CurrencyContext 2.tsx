import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";

interface CurrencyContextType {
  currency: string;
  rates: Record<string, number>;
  formatAmount: (amountInMNT: number | undefined) => string;
  symbol: string;
  loading: boolean;
}

const symbols: Record<string, string> = {
  MNT: "₮",
  USD: "$",
  EUR: "€",
  KRW: "₩",
  CNY: "¥",
};

// 1 MNT = ? target currency (fallback rates)
const fallbackRates: Record<string, number> = {
  MNT: 1,
  USD: 1 / 3450,
  EUR: 1 / 3750,
  KRW: 1 / 2.5,
  CNY: 1 / 480,
};

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [rates, setRates] = useState<Record<string, number>>(fallbackRates);
  const [loading, setLoading] = useState(true);

  const currency = user?.currency || "MNT";

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const res = await fetch("https://open.er-api.com/v6/latest/MNT");
      const data = await res.json();
      if (data.result === "success" && data.rates) {
        setRates({
          MNT: 1,
          USD: data.rates.USD,
          EUR: data.rates.EUR,
          KRW: data.rates.KRW,
          CNY: data.rates.CNY,
        });
      }
    } catch {
      // fallback rates used
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amountInMNT: number | undefined): string => {
    const mnt = amountInMNT || 0;
    const rate = rates[currency] || 1;
    const converted = mnt * rate;

    const sym = symbols[currency] || "₮";

    if (currency === "MNT" || currency === "KRW") {
      return `${converted.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${sym}`;
    }
    return `${converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${sym}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      rates,
      formatAmount,
      symbol: symbols[currency] || "₮",
      loading,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
export default CurrencyContext;
